# Issue-21：安全事件清單 — SSB 串接完整實作

> Epic：MPinfo-Co/P1-project#50
> 參考：schema/schema.md | Spec/SecurityEventsAPI.md | Prototype/MP-Box_資安專家_v73_claude.html

---

## 架構概覽

```
SSB（syslog-ng Store Box，logspace: ALL）
  │  GET /api/5/search/logspace/filter/ALL
  │  每 10 分鐘，from / to 時間窗口，search_expression 過濾資安相關 log
  ▼
Celery Flash Task（Beat 排程，每 10 分鐘）
  ├─ 檢查前一個 log_batch 是否 failed → 若是，先補跑
  ├─ 建立新 log_batch（status: pending）
  ├─ 呼叫 SSB Client 分頁拉取 log（過濾後約 1,500 筆）
  ├─ 切成 chunk（每 FLASH_CHUNK_SIZE 筆，預設 100）
  ├─→ Claude Haiku（chunk 1）→ chunk_results（chunk_index=0）
  ├─→ Claude Haiku（chunk 2）→ chunk_results（chunk_index=1）
  └─→ Claude Haiku（chunk N）→ chunk_results（chunk_index=N-1）
        ├─ 程式層合併：依 match_key 去重（star_rank 取最高、log_ids 聯集）
        │   → chunk_results（chunk_index=999，本批次合併結果）
        │   → 同時 merge 進當天累計（chunk_index=-1）
        ├─ 全部完成 → log_batch.status = success
        └─ 失敗 → 重試最多 FLASH_MAX_RETRY 次 → status = failed（下次補跑）
  ▼
Celery Pro Task（Beat 排程，每日 02:00）
  ├─ 讀取當日 chunk_index=-1 的 1 筆累計 JSON（已由程式層去重）
  ├─ Claude Sonnet：最終彙整、修正 star_rank、補充 description / suggests、判斷跨日延續
  └─ 寫入 security_events（新建或更新）
  ▼
security_events（使用者在 MP-BOX 清單頁看到）
```

---

## 技術模式

### SSB Client — 認證與分頁

```
認證：POST /api/5/login（username / password）
     → 取得 AUTHENTICATION_TOKEN cookie
     → 後續請求帶入 Cookie header

自動重登：response 401 → 重新 login → 重試原請求

分頁：GET /api/5/search/logspace/filter/<logspace>
      ?from=<ISO8601>&to=<ISO8601>&search_expression=&offset=0&limit=1000
      → 每次 1000 筆，offset 累加，直到 result 筆數 < limit

暴力保護：10 次失敗/60 秒 → 封鎖 5 分鐘
         → 登入失敗計數達閾值前停止重試
```

### Flash Task — 補跑邏輯

```
觸發時：
  1. 查詢最新一筆 log_batch WHERE status = 'failed'
  2. 若存在 → 以該批次的 time_from / time_to 重新執行
  3. 成功或達重試上限後 → 繼續執行當前時間窗口
```

### Flash Task — 程式層合併

```
每個 Flash Task 完成所有 chunk 後，程式執行合併（不花 AI token）：

依 match_key 分群，同群事件合併規則：
  - star_rank     → 取最高
  - log_ids       → 聯集
  - detection_count → log_ids 總數
  - ioc_list / mitre_tags → 聯集
  - 其他欄位（title、affected_summary 等）→ 取第一筆

chunk_index 慣例：
  0, 1, 2...  → 個別 chunk 的 Haiku 原始結果
  999         → 該 batch 所有 chunk 合併後的結果
  -1          → 當天累計（整天所有 batch merge 的結果，Pro Task 只讀此筆）
```

### Pro Task — 彙整流程

```
1. INSERT daily_analysis（status=pending, started_at=now）
2. 讀取當日 chunk_index=-1 的 1 筆累計 JSON（已由程式層去重）
3. 讀取前一日 security_events（用於判斷跨日延續）
4. Claude Sonnet 輸入累計事件 + 前日事件，要求：
   - 跨事件合併判斷（match_key 相似但不同者）
   - 修正 star_rank（全日脈絡）
   - 彙整 detection_count
   - 判斷跨日延續事件（continued_from 填入前日事件 ID）
   - 產出最終 description / suggests
5. 寫入 security_events：相同 match_key + event_date → UPDATE，否則 INSERT
6. UPDATE daily_analysis（status=success/failed, completed_at=now, events_created, events_updated）
```

### search_expression 規則（實測有效）

```
SSB 查詢語法（非 syslog-ng filter 語法）：
  欄位搜尋：program:<value>
  Dynamic column：nvpair:<column_name>=<value>
  組合：用 OR 串接（大寫）
  語法驗證：GET /api/5/search/logspace/validate?search_expression=...

目前過濾規則：
  # Windows AD 資安事件
  nvpair:.sdata.win@18372.4.event_id=4625 OR   # 登入失敗（暴力破解）
  nvpair:.sdata.win@18372.4.event_id=4648 OR   # 明確憑證登入/RunAs（提權）
  nvpair:.sdata.win@18372.4.event_id=4720 OR   # 新建帳號（後門帳號）
  nvpair:.sdata.win@18372.4.event_id=4722 OR   # 啟用帳號
  nvpair:.sdata.win@18372.4.event_id=4725 OR   # 停用帳號
  nvpair:.sdata.win@18372.4.event_id=4740 OR   # 帳號鎖定
  # FortiGate 防火牆
  nvpair:.sdata.forti.action=deny OR           # 被拒絕的連線
  nvpair:.sdata.forti.level=warning            # 警告等級 log

實測數據（2026-03-31）：
  過濾後每 10 分鐘約 1,500 筆
  FortiGate warning ~49%、FortiGate deny ~47%、Windows ~4%

未納入（暫不過濾）：
  EventID 4624 — 登入成功（量太大，6hr 約 6 萬筆）
  EventID 4719 — 稽核政策變更（量少但重要，post-MVP 考慮加入）
```

### Claude 輸出格式規範

```
Chunk 分析輸出（每 chunk，Claude Haiku）：
  events 陣列，每筆含：
  - star_rank（1–5）
  - title
  - affected_summary（≤ 20 字，格式：{主要對象}（{補充}））
  - affected_detail（【受影響對象】【攻擊來源】【攻擊行為】【時間範圍】）
  - match_key（{識別對象}_{攻擊類型}_{來源識別}）
  - log_ids（觸發事件的 log ID 清單）
  - logs（關鍵原始 log 物件，5–20 筆，含 id / timestamp / message / program）
  - ioc_list、mitre_tags

每日彙整輸出（每日，Claude Sonnet）：
  events 陣列，每筆含上述欄位 + description + suggests + detection_count + continued_from
```

### Chunk 分析 Prompt 草稿（Claude Haiku）

```
你是資安事件分析助理。以下是一批 syslog，來源包含 Windows AD、FortiGate 等網路設備，訊息為繁體中文。

請找出具有資安意義的事件，以 JSON 陣列回傳。若無資安事件，回傳 []。
只回傳 JSON，不要其他說明文字。

每筆事件格式：
{
  "star_rank": 1–5（5最嚴重）,
  "title": "事件標題（簡潔描述異常行為）",
  "affected_summary": "簡短摘要（格式：{主要對象}（{補充}），建議 30 字以內）",
  "affected_detail": "【受影響對象】...\n【攻擊來源】...（有則填）\n【攻擊行為】...\n【時間範圍】...（有則填）",
  "match_key": "{識別對象}_{攻擊類型}_{來源識別}",
  "log_ids": ["觸發此事件的 log ID"],
  "logs": [最具代表性的 5–20 筆，每筆 {"id","timestamp","message","program"}],
  "ioc_list": ["IP、帳號等指標"],
  "mitre_tags": ["MITRE ATT&CK 編號，如 T1110"]
}

嚴重度參考：
5 = 帳號入侵 / 資料外洩 / 關鍵系統失陷
4 = 暴力破解 / 大量掃描 / 異常提權
3 = 多次登入失敗 / 異常存取 / 可疑行為
2 = 單次異常 / 低風險設定變更
1 = 需留意但機率低的異常

以下為 log 資料：
{logs_json}
```

### 每日彙整 Prompt 草稿（Claude Sonnet）

```
你是資安事件彙整助理。以下是今日累計的安全事件（已由程式去重合併）與前一日已知事件（prev_events）。

請執行以下任務，輸出最終安全事件清單（JSON 陣列）。只回傳 JSON，不要其他說明文字。

任務：
1. 跨事件合併判斷：match_key 不同但描述同一攻擊行為者，合併為一筆
2. 對照 prev_events：若事件與前日事件屬同一持續攻擊，標記 continued_from（填入前日事件 ID）
3. 修正 star_rank（以全日脈絡重新評估）
4. 彙整 detection_count（合併後的觸發 log 總筆數）
5. 撰寫 description（完整事件說明）
6. 產出 suggests（建議處置步驟，3–5 條）

每筆輸出格式：
{
  "star_rank": 1–5,
  "title": "事件標題",
  "affected_summary": "≤20字",
  "affected_detail": "【受影響對象】...",
  "match_key": "最終去重後的 match_key",
  "detection_count": 合併後觸發筆數,
  "continued_from": 前日事件 ID 或 null,
  "description": "【異常發現】...\n【風險分析】...",
  "suggests": ["建議步驟1", "建議步驟2"],
  "log_ids": ["代表性 log ID"],
  "logs": [5–20 筆關鍵原始 log 物件],
  "ioc_list": ["指標"],
  "mitre_tags": ["MITRE 編號"]
}

今日累計事件（chunk_index=-1 的合併結果）：
{accumulated_events_json}

前日已知事件：
{prev_events_json}
```

---

## 環境變數

```bash
# 資料庫
DATABASE_URL=postgresql://user:password@localhost:5432/mpbox

# 認證
JWT_SECRET_KEY=

# SSB
SSB_HOST=https://192.168.10.48
SSB_USERNAME=
SSB_PASSWORD=
SSB_LOGSPACE=ALL

# Celery Flash Task
FLASH_CHUNK_SIZE=100              # 每個 chunk 幾筆 log（受 Haiku rate limit 限制）
FLASH_MAX_RETRY=3                 # 單批次最多重試次數
FLASH_INTERVAL_MINUTES=10        # 觸發間隔（分鐘）

# Celery Pro Task
PRO_TASK_HOUR=2                   # 執行時（24hr 制）
PRO_TASK_MINUTE=0                 # 執行分

# Claude AI
ANTHROPIC_API_KEY=
CLAUDE_FLASH_MODEL=claude-haiku-4-5-20251001   # Flash Task 用（快速低成本）
CLAUDE_PRO_MODEL=claude-sonnet-4-6             # Pro Task 用（較強推理）

# Redis（Celery Broker）
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

---

## 已知限制 / 待確認

| 項目 | 說明 |
|---|---|
| SSB API 版本 | 確認為 `/api/5/` |
| Logspace 名稱 | 確認為 `ALL` |
| search_expression | 已有實測規則（見上方技術模式）；EventID 4719 稽核政策變更 post-MVP 考慮加入 |
| Chunk 分析輸出格式 | 採 Option B（結構化初稿）；PG 階段建議測試 A vs B 分析品質差異 |
| Haiku rate limit | 50K input tokens/分鐘，chunk size=100 約 15 chunks 需 ~15 分鐘，略超 10 分鐘間隔，正式運行後視情況調整 |
| 相似案例 tab | Epic 2 範圍，本 Epic 不實作 |
| event_history table | schema.md 已定義，WBS 未列出，但 PATCH /api/events/{id} 與 POST /api/events/{id}/history 皆需此 table，PG 需一併建立 |

---

## 測試案例

> 最低要求：每個 API 至少一個成功案例（2xx）+ 一個失敗案例（4xx/5xx）；每個畫面至少一個主流程案例

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|---------|------|---------|
| T01 | API | 已登入、有資安專家角色 | GET /api/events | 200，回傳事件清單，依 star_rank DESC 排序 |
| T02 | API | 已登入 | GET /api/events?status=pending,investigating | 200，只回傳符合狀態的事件 |
| T03 | API | 已登入 | GET /api/events?keyword=暴力破解 | 200，回傳 title/affected_summary 含關鍵字的事件 |
| T04 | API | 未登入 | GET /api/events | 401 |
| T05 | API | 已登入、無資安專家角色 | GET /api/events | 403 |
| T06 | API | 已登入 | GET /api/events/1 | 200，回傳完整事件資料含 history |
| T07 | API | 已登入 | GET /api/events/9999 | 404 |
| T08 | API | 已登入 | PATCH /api/events/1 { current_status: "investigating" } | 200，狀態更新，自動寫入 event_history |
| T09 | API | 已登入 | PATCH /api/events/1 { current_status: "invalid" } | 400 |
| T10 | API | 已登入 | POST /api/events/1/history { note: "已通知" } | 201，新增 comment 記錄 |
| T11 | API | 已登入 | POST /api/events/1/history { note: "結案", resolved_at: "..." } | 201，action=resolve |
| T12 | 畫面 | Pro Task 已執行，有事件資料 | 進入安全事件清單頁 | 顯示事件列表，依嚴重度排序，filter bar 可見 |
| T13 | 畫面 | 清單頁已載入 | 點擊 affected_summary badge | Popover 展開顯示 affected_detail |
| T14 | 畫面 | 清單頁已載入 | 篩選狀態 = 未處理，點套用 | 只顯示 pending 事件 |
| T15 | Pipeline | SSB 可連線 | Flash Task 觸發 | log_batch 建立，chunk_results 寫入，status = success |
| T16 | Pipeline | 前一個 log_batch status = failed | Flash Task 觸發 | 先補跑失敗批次，再跑當前窗口 |
| T17 | Pipeline | chunk_results 有當日資料 | Pro Task 觸發（02:00）| security_events 寫入，daily_analysis status = success |