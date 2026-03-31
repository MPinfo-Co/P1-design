# Issue-21：安全事件清單 — SSB 串接完整實作

> Epic：MPinfo-Co/P1-project#50
> 參考：schema/schema.md | Spec/SecurityEventsAPI.md | Prototype/MP-Box_資安專家_v73_claude.html

---

## 架構概覽

```
SSB（syslog-ng Store Box）
  │  GET /api/5/search/logspace/filter/<logspace>
  │  每 10 分鐘，from / to 時間窗口，search_expression=""（全量）
  ▼
Celery Flash Task（Beat 排程，每 10 分鐘）
  ├─ 檢查前一個 log_batch 是否 failed → 若是，先補跑
  ├─ 建立新 log_batch（status: pending）
  ├─ 呼叫 SSB Client 分頁拉取全量 log
  ├─ 切成 chunk（每 FLASH_CHUNK_SIZE 筆，預設 500）
  ├─→ Claude Haiku（chunk 1）→ flash_results
  ├─→ Claude Haiku（chunk 2）→ flash_results
  └─→ Claude Haiku（chunk N）→ flash_results
        ├─ 全部完成 → log_batch.status = success
        └─ 失敗 → 重試最多 FLASH_MAX_RETRY 次 → status = failed（下次補跑）
  ▼
Celery Pro Task（Beat 排程，每日 02:00）
  ├─ 讀取當日所有 status=success 的 flash_results
  ├─ 依 match_key 初步分群
  ├─ Claude Sonnet：跨群去重、修正 star_rank、補充 description
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

### Pro Task — 去重彙整

```
1. match_key 分群：相同 key → 同一事件候選
2. Claude Sonnet 輸入各群組事件清單，要求：
   - 跨群合併判斷
   - 修正 star_rank（全日脈絡）
   - 彙整 detection_count
   - 產出最終 description / suggests
3. 寫入：相同 match_key + event_date → UPDATE，否則 INSERT
```

### Claude 輸出格式規範

```
Flash 輸出（每 chunk，Claude Haiku）：
  events 陣列，每筆含：
  - star_rank（1–5）
  - title
  - affected_summary（≤ 20 字，格式：{主要對象}（{補充}））
  - affected_detail（【受影響對象】【攻擊來源】【攻擊行為】【時間範圍】）
  - match_key（{識別對象}_{攻擊類型}_{來源識別}）
  - log_ids（觸發事件的 log ID 清單）
  - logs（關鍵原始 log 物件，5–20 筆，含 id / timestamp / message / program）
  - ioc_list、mitre_tags

Pro 輸出（每日，Claude Sonnet）：
  events 陣列，每筆含上述欄位 + description + suggests
```

---

## 環境變數

```bash
# SSB
SSB_HOST=https://<ssb-hostname>
SSB_USERNAME=
SSB_PASSWORD=
SSB_LOGSPACE=<logspace-name>      # 部署後執行 list_logspaces 確認

# Celery Flash Task
FLASH_CHUNK_SIZE=500              # 每個 chunk 幾筆 log
FLASH_MAX_RETRY=3                 # 單批次最多重試次數
FLASH_INTERVAL_MINUTES=10        # 觸發間隔（分鐘）

# Claude AI
ANTHROPIC_API_KEY=
CLAUDE_FLASH_MODEL=claude-haiku-4-5-20251001   # Flash Task 用（快速低成本）
CLAUDE_PRO_MODEL=claude-sonnet-4-6             # Pro Task 用（較強推理）
PRO_CRON=0 2 * * *                             # Pro Task 執行時間（cron 格式）
```

---

## 已知限制 / 待確認

| 項目 | 說明 |
|---|---|
| SSB API 版本 | 文件顯示 `/api/5/`，實際部署後確認 |
| Logspace 名稱 | 部署後執行 `list_logspaces` 確認 `SSB_LOGSPACE` 值 |
| search_expression | MVP 為空（全量）；post-MVP 可依已知雜訊 EventID 加排除條件 |
| Flash 輸出格式 | 採 Option B（結構化初稿）；PG 階段建議測試 A vs B 分析品質差異 |
| 相似案例 tab | Epic 2 範圍，本 Epic 不實作 |

---

## 測試案例

> 最低要求：每個 API 至少一個成功案例（2xx）+ 一個失敗案例（4xx/5xx）；每個畫面至少一個主流程案例

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|---------|------|---------|
| T01 | API | 已登入、有資安專家角色 | GET /api/events | 200，回傳事件清單，依 star_rank DESC 排序 |
| T02 | API | 已登入 | GET /api/events?status=pending,investigating | 200，只回傳符合狀態的事件 |
| T03 | API | 已登入 | GET /api/events?keyword=暴力破解 | 200，回傳 title/description 含關鍵字的事件 |
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
| T15 | Pipeline | SSB 可連線 | Flash Task 觸發 | log_batch 建立，flash_results 寫入，status = success |
| T16 | Pipeline | 前一個 log_batch status = failed | Flash Task 觸發 | 先補跑失敗批次，再跑當前窗口 |
| T17 | Pipeline | flash_results 有當日資料 | Pro Task 觸發（02:00）| security_events 寫入，daily_analysis status = success |