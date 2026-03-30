# TDD：安全事件清單 — SSB 串接完整實作

> **版本**：1.0
> **日期**：2026-03-30
> **Epic**：MPinfo-Co/P1-project#50
> **SA 文件**：MPinfo-Co/P1-analysis issue-26（business-logic.md / SD-WBS.md）
> **UI 設計基準**：P1-design/Prototype/MP-Box_資安專家_v73_claude.html

---

## Architecture Overview

```
SSB（syslog-ng Store Box）
  │
  │  GET /api/5/search/logspace/filter/<logspace>
  │  每 10 分鐘，from / to 時間窗口，search_expression=""（全量）
  ▼
Celery Flash Task（Beat 排程，每 10 分鐘）
  │
  ├─ 1. 檢查前一個 log_batch 是否 failed → 若是，先補跑
  ├─ 2. 建立新 log_batch（status: pending）
  ├─ 3. 呼叫 SSB Client 分頁拉取全量 log
  ├─ 4. 切成 chunk（每 FLASH_CHUNK_SIZE 筆，預設 500）
  │
  ├─→ Gemini Flash（chunk 1）─→ flash_results
  ├─→ Gemini Flash（chunk 2）─→ flash_results
  └─→ Gemini Flash（chunk N）─→ flash_results
          │
          ├─ 全部完成 → log_batch.status = success
          └─ 任一失敗 → 重試最多 FLASH_MAX_RETRY 次
                      → 仍失敗 → log_batch.status = failed（下次補跑）
                      ↓
Celery Pro Task（Beat 排程，每日 02:00）
  │
  ├─ 1. 建立 daily_analysis（status: running）
  ├─ 2. 讀取當日所有 status=success 的 flash_results
  ├─ 3. 展開 events JSONB，依 match_key 初步分群
  ├─ 4. 送 Gemini Pro：跨群去重、修正 star_rank、補充 description
  ├─ 5. 寫入 security_events（新建或更新）
  └─ 6. 更新 daily_analysis（status: success）
                      ↓
          security_events（使用者在 MP-BOX 清單頁看到）
```

---

## Tech Stack（本 Epic 相關）

| Layer | Technology |
|---|---|
| 後端排程 | Celery + Celery Beat |
| SSB 串接 | Python httpx（SSB REST API /api/5/）|
| AI 分析 | Gemini 2.5 Flash（per-chunk）/ Gemini 2.5 Pro（daily）|
| DB | PostgreSQL + SQLAlchemy + Alembic |
| 前端清單頁 | React 18 + Tailwind CSS v3 + shadcn/ui |

---

## Database Schema

### Table: `log_batches`
每次 Flash Task 拉取的批次紀錄，用於補跑追蹤。

```sql
CREATE TABLE log_batches (
    id            BIGSERIAL PRIMARY KEY,
    time_from     TIMESTAMP NOT NULL,
    time_to       TIMESTAMP NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
                  -- pending | running | success | failed
    records_fetched INT NOT NULL DEFAULT 0,
    chunks_total  INT NOT NULL DEFAULT 0,
    chunks_done   INT NOT NULL DEFAULT 0,
    retry_count   INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_log_batches_status ON log_batches(status);
CREATE INDEX idx_log_batches_time_from ON log_batches(time_from);
```

### Table: `flash_results`
每個 chunk 的 Gemini Flash 輸出，Pro Task 的原料。

```sql
CREATE TABLE flash_results (
    id            BIGSERIAL PRIMARY KEY,
    batch_id      BIGINT NOT NULL REFERENCES log_batches(id) ON DELETE CASCADE,
    chunk_index   INT NOT NULL,
    chunk_size    INT NOT NULL,
    events        JSONB NOT NULL DEFAULT '[]',
                  -- 陣列，每筆含 star_rank / title / affected_summary /
                  --   affected_detail / match_key / log_ids / ioc_list / mitre_tags
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
                  -- pending | success | failed
    error_message TEXT,
    processed_at  TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flash_results_batch_id ON flash_results(batch_id);
CREATE INDEX idx_flash_results_status ON flash_results(status);
```

**events JSONB 單筆結構：**
```json
{
  "star_rank": 4,
  "title": "帳號 MP0263 異常登入嘗試",
  "affected_summary": "MP0263（異常登入）",
  "affected_detail": "【受影響對象】MP0263【攻擊來源】172.18.1.84【攻擊行為】短時間內多次登入失敗【時間範圍】09:00–09:10",
  "match_key": "MP0263_login_failure_172.18.1.84",
  "log_ids": ["813298855461315879"],
  "ioc_list": ["172.18.1.84"],
  "mitre_tags": ["T1110"]
}
```

### Table: `security_events`
Pro Task 彙整後的最終事件，為使用者清單頁的資料來源。

```sql
CREATE TABLE security_events (
    id                BIGSERIAL PRIMARY KEY,
    event_date        DATE NOT NULL,
    date_end          DATE,                    -- 跨日事件的結束日期
    star_rank         SMALLINT NOT NULL CHECK (star_rank BETWEEN 1 AND 5),
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    affected_summary  VARCHAR(20) NOT NULL,    -- 列表摘要，格式：{主要對象}（{補充}）
    affected_detail   TEXT,                    -- Popover 完整說明，【】標籤格式
    current_status    VARCHAR(20) NOT NULL DEFAULT 'pending',
                      -- pending | investigating | resolved | dismissed
    match_key         VARCHAR(200) NOT NULL,   -- 去重 key：{帳號}_{攻擊類型}_{來源IP}
    detection_count   INT NOT NULL DEFAULT 0,  -- 觸發此事件的 log 筆數
    continued_from    BIGINT REFERENCES security_events(id),
    assignee_user_id  INT REFERENCES users(id),
    suggests          JSONB,                   -- AI 建議處置步驟（字串陣列）
    logs              JSONB,                   -- 相關 log 摘要（字串陣列）
    ioc_list          JSONB,                   -- IoC 指標（字串陣列）
    mitre_tags        JSONB,                   -- MITRE ATT&CK 標籤（字串陣列）
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_events_event_date ON security_events(event_date);
CREATE INDEX idx_security_events_star_rank ON security_events(star_rank DESC);
CREATE INDEX idx_security_events_current_status ON security_events(current_status);
CREATE INDEX idx_security_events_match_key ON security_events(match_key);
```

**current_status UI 對應：**

| DB 值 | UI 顯示 |
|---|---|
| pending | 未處理 |
| investigating | 調查中 |
| resolved | 已解決 |
| dismissed | 已忽略 |

### Table: `daily_analysis`
Pro Task 每日執行紀錄，用於監控與除錯。

```sql
CREATE TABLE daily_analysis (
    id                  BIGSERIAL PRIMARY KEY,
    analysis_date       DATE NOT NULL UNIQUE,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
                        -- pending | running | success | failed
    flash_results_count INT NOT NULL DEFAULT 0,
    events_created      INT NOT NULL DEFAULT 0,
    events_updated      INT NOT NULL DEFAULT 0,
    error_message       TEXT,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Table: `event_history`
安全事件的處理日誌，對應詳情頁「處理日誌」tab。

```sql
CREATE TABLE event_history (
    id            BIGSERIAL PRIMARY KEY,
    event_id      BIGINT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(id),
    action        VARCHAR(20) NOT NULL,
                  -- status_change | assign | comment | resolve
    old_status    VARCHAR(20),
    new_status    VARCHAR(20),
    note          TEXT,
    resolved_at   TIMESTAMP,               -- action=resolve 時填入
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_history_event_id ON event_history(event_id);
```

---

## Core Technical Patterns

### SSB Client — 認證與分頁

```python
# 認證
POST /api/5/login
Body: username=<SSB_USERNAME>&password=<SSB_PASSWORD>
Response: {"result": "<token>", "error": {...}, "warnings": [...]}
→ 後續請求帶入 Cookie: AUTHENTICATION_TOKEN=<token>

# 分頁拉取（offset 累加直到 result 筆數 < limit）
GET /api/5/search/logspace/filter/<SSB_LOGSPACE>
  ?from=<ISO8601>&to=<ISO8601>&search_expression=&offset=0&limit=1000

# 暴力保護：10 次失敗/60 秒 → 封鎖 5 分鐘
# → 登入失敗計數，達閾值前停止重試，等待 5 分鐘後再試
```

### Flash Task — 補跑邏輯

```
觸發時：
  1. 查詢最新一筆 log_batch WHERE status = 'failed'
  2. 若存在 → 以該批次的 time_from / time_to 重新執行
  3. 執行完成（success 或達重試上限 failed）→ 繼續執行當前時間窗口
```

### Pro Task — 去重與彙整

```
1. match_key 分群：相同 match_key 的 flash events → 同一事件候選群組
2. 送 Gemini Pro：
   輸入：各群組的事件清單 + 描述
   要求：
     - 跨群合併判斷（不同 match_key 但實為同一攻擊）
     - 修正 star_rank（全日脈絡下的嚴重度）
     - 彙整 detection_count（累加各 chunk 的 log_ids 數量）
     - 產出最終 description / suggests
3. 寫入 security_events：
   - 相同 match_key 且 event_date 相同 → UPDATE
   - 否則 → INSERT
```

### Gemini Flash Prompt 重點規範

```
輸出格式規範（強制）：
- affected_summary：20 字以內，格式「{主要對象}（{最關鍵補充}）」
- affected_detail：必須包含【受影響對象】【攻擊來源】【攻擊行為】【時間範圍】四個標籤
- match_key：格式「{識別對象}_{攻擊類型}_{來源識別}」，全英文或數字，底線分隔
- star_rank：1（正常資訊）/ 2（低風險）/ 3（中風險）/ 4（高風險）/ 5（緊急）
```

---

## API Spec

### GET /api/events

```
GET /api/events

Query Parameters：
  status      string   pending | investigating | resolved | dismissed（可多選，逗號分隔）
  keyword     string   搜尋 title / description（ILIKE）
  date_from   string   ISO8601 date（event_date >=）
  date_to     string   ISO8601 date（event_date <=）
  page        int      預設 1
  page_size   int      預設 20，最大 100

排序：star_rank DESC（固定，不開放自訂）

Response 200：
{
  "total": 100,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "event_date": "2026-03-16",
      "date_end": null,
      "star_rank": 5,
      "title": "稽核政策遭大規模竄改",
      "affected_summary": "全域 AD 稽核政策（30,972筆）",
      "detection_count": 30972,
      "current_status": "pending",
      "assignee_user_id": null,
      "created_at": "2026-03-16T02:05:00"
    }
  ]
}

Response 401：Token 過期或未登入
Response 403：無權限（非資安專家角色）
```

### GET /api/events/{id}

```
GET /api/events/{id}

Response 200：完整事件資料，含：
  id, event_date, date_end, star_rank, title, description,
  affected_summary, affected_detail, detection_count,
  current_status, match_key, assignee_user_id,
  suggests, logs, ioc_list, mitre_tags,
  history（event_history 陣列）,
  created_at, updated_at

Response 404：事件不存在
```

### PATCH /api/events/{id}

```
PATCH /api/events/{id}

Body（擇一或多個）：
  current_status  string   pending | investigating | resolved | dismissed
  assignee_user_id int | null

副作用：自動寫入 event_history 一筆（action: status_change 或 assign）

Response 200：更新後的完整事件資料
```

### POST /api/events/{id}/history

```
POST /api/events/{id}/history

Body：
  note        string   必填，留言內容
  resolved_at string   選填，ISO8601 datetime（action=resolve 時）

副作用：寫入 event_history（action: comment 或 resolve）

Response 201：新建的 event_history 資料
```

---

## UI Spec（引用雛形）

UI 設計以 `P1-design/Prototype/MP-Box_資安專家_v73_claude.html` 為基準。

**清單頁欄位對應：**

| 畫面欄位 | 資料來源 |
|---|---|
| 嚴重度星等 | `star_rank` |
| 事件說明 | `title` |
| 發生期間 | `event_date` ~ `date_end`（同日則只顯示一個）|
| 影響範圍 | `affected_summary`（badge）+ `affected_detail`（popover）|
| 偵測筆數 | `detection_count` |
| 處理狀態 | `current_status`（DB 英文 → UI 中文對應）|
| 負責人員 | `assignee_user_id` → 查 users 顯示名稱 |

**篩選列：** 狀態 / 日期區間 / 關鍵字（無星等篩選）

**詳情頁 Tab 結構：**

| Tab | 內容 | 資料來源 |
|---|---|---|
| 詳情 | description / suggests / logs | security_events |
| 處理日誌 | 狀態變更、指派、留言記錄 | event_history |
| 相似案例 | （Epic 2 範圍，本 Epic 不實作）| — |

---

## Environment Variables

```bash
# SSB
SSB_HOST=https://<ssb-hostname>
SSB_USERNAME=
SSB_PASSWORD=
SSB_LOGSPACE=<logspace-name>        # 部署後執行 list_logspaces 確認

# Celery Flash Task
FLASH_CHUNK_SIZE=500                # 每個 chunk 幾筆 log（預設 500）
FLASH_MAX_RETRY=3                   # 單批次最多重試次數
FLASH_INTERVAL_MINUTES=10           # 觸發間隔（分鐘）

# Gemini
GEMINI_API_KEY=
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro
GEMINI_PRO_CRON=0 2 * * *           # Pro Task 執行時間（cron 格式）
```

---

## 已知限制 / 待確認

| 項目 | 說明 |
|---|---|
| SSB API 版本 | 文件顯示 `/api/5/`，實際部署後確認 |
| Logspace 名稱 | 部署後執行 `list_logspaces` 確認 `SSB_LOGSPACE` 值 |
| search_expression | MVP 為空（全量），post-MVP 可依已知雜訊 EventID 加入排除條件 |
| Flash 輸出格式 | PG 階段建議測試 Option A（僅摘要）vs Option B（結構化初稿）分析品質差異 |
| 相似案例 tab | Epic 2 範圍，本 Epic 不實作 |
| SSB 帳號密碼 | 僅寫入 `.env`，不進程式碼 |

---

## 關聯項目

- Epic：MPinfo-Co/P1-project#50
- SA Issue：MPinfo-Co/P1-analysis#26
- SD Issue：P1-design #21
- 階段：SD
- 分支：`issue-21-ssb`
