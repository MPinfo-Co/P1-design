# MP-Box Schema

> 版本：v2 | 日期：2026-03-31
> 對應 Epic：[PM] 安全事件清單 — SSB 串接完整實作（MPinfo-Co/P1-project#50）

---

## 1. 使用者 / 角色

### tb_users

- **用途**：系統使用者帳號，所有人工操作的身份來源。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | 主鍵 |
| name | VARCHAR(100), NOT NULL | 使用者顯示名稱 |
| email | VARCHAR(255), NOT NULL, UK | 登入信箱，不可重複 |
| password_hash | VARCHAR(255), NOT NULL | bcrypt 雜湊密碼 |
| is_active | BOOLEAN, NOT NULL, DEFAULT TRUE | 帳號啟用狀態 |
| updated_by | INTEGER, NULLABLE, FK → tb_users | 最後更新者 |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | 最後更新時間 |

### tb_roles

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| name | VARCHAR(100), NOT NULL, UK | 角色名稱 |
| can_access_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 可使用 AI 夥伴功能 |
| can_use_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | 可查閱知識庫 |
| can_manage_accounts | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理使用者帳號 |
| can_manage_roles | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理角色與權限 |
| can_edit_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 可編輯 AI 夥伴設定 |
| can_manage_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理知識庫 |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_user_roles（多對多）

| 欄位 | 型別 | 說明 |
|------|------|------|
| user_id | INTEGER, PK, FK → tb_users | |
| role_id | INTEGER, PK, FK → tb_roles | |

### tb_token_blacklist

- **用途**：記錄已登出的 JWT，防止 token 在過期前被重複使用。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | 主鍵 |
| token_jti | VARCHAR(255), NOT NULL, UK | JWT 的 jti（唯一識別碼） |
| expired_at | TIMESTAMP, NOT NULL | token 原本的過期時間（用於定期清理） |
| updated_by | INTEGER, NULLABLE, FK → tb_users | 最後更新者 |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | 最後更新時間 |

---

## 2. AI 夥伴

### tb_ai_partners

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| name | VARCHAR(100), NOT NULL, UK | AI 夥伴名稱 |
| description | TEXT, NULLABLE | 功能描述 |
| is_builtin | BOOLEAN, NOT NULL, DEFAULT FALSE | 內建夥伴不可刪除 |
| is_enabled | BOOLEAN, NOT NULL, DEFAULT TRUE | 停用後不出現在可選清單 |
| model_name | VARCHAR(100), NULLABLE | 使用的 LLM 模型（如 gemini-2.5-flash）|
| system_prompt | TEXT, NULLABLE | 自訂系統提示詞 |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_role_ai_partners（多對多）

| 欄位 | 型別 | 說明 |
|------|------|------|
| role_id | INTEGER, PK, FK → tb_roles | |
| partner_id | INTEGER, PK, FK → tb_ai_partners | |

---

## 3. 知識庫

### tb_knowledge_bases

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| name | VARCHAR(200), NOT NULL | 知識庫名稱 |
| description | TEXT, NULLABLE | |
| created_by | INTEGER, NULLABLE, FK → tb_users | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_kb_documents

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| kb_id | INTEGER, NOT NULL, FK → tb_knowledge_bases | |
| file_name | VARCHAR(500), NOT NULL | |
| file_size | BIGINT, NOT NULL, DEFAULT 0 | bytes |
| file_type | VARCHAR(50), NULLABLE | pdf / docx / txt 等 |
| storage_path | VARCHAR(1000), NULLABLE | |
| processing_status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | pending / processing / completed / failed |
| chunk_count | INTEGER, NOT NULL, DEFAULT 0 | |
| uploaded_by | INTEGER, NULLABLE, FK → tb_users | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_kb_doc_chunks

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| document_id | INTEGER, NOT NULL, FK → tb_kb_documents | |
| chunk_index | INTEGER, NOT NULL, DEFAULT 0 | |
| content | TEXT, NOT NULL | |
| embedding | TEXT, NULLABLE | 實際部署時型別為 vector |
| token_count | INTEGER, NULLABLE | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_kb_tables

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| kb_id | INTEGER, NOT NULL, FK → tb_knowledge_bases | |
| table_name | VARCHAR(200), NOT NULL | |
| source | VARCHAR(50), NOT NULL, DEFAULT 'custom' | |
| created_by | INTEGER, NULLABLE, FK → tb_users | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_kb_table_columns

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| table_id | INTEGER, NOT NULL, FK → tb_kb_tables | |
| column_name | VARCHAR(200), NOT NULL | |
| column_type | VARCHAR(50), NOT NULL, DEFAULT 'text' | text / number / date 等 |
| column_order | INTEGER, NOT NULL, DEFAULT 0 | |

### tb_kb_table_rows

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER, PK | |
| table_id | INTEGER, NOT NULL, FK → tb_kb_tables | |
| row_data | JSON, NOT NULL, DEFAULT '{}' | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

### tb_role_kb_map（多對多）

| 欄位 | 型別 | 說明 |
|------|------|------|
| role_id | INTEGER, PK, FK → tb_roles | |
| kb_id | INTEGER, PK, FK → tb_knowledge_bases | |

### tb_partner_kb_map（多對多）

| 欄位 | 型別 | 說明 |
|------|------|------|
| partner_id | INTEGER, PK, FK → tb_ai_partners | |
| kb_id | INTEGER, PK, FK → tb_knowledge_bases | |

---

## 4. SSB 分析 Pipeline

> 對應 Epic：安全事件清單 — SSB 串接完整實作

### tb_log_batches

每次 Flash Task 從 SSB REST API 拉取的批次紀錄，用於狀態追蹤與補跑機制。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL, PK | |
| time_from | TIMESTAMP, NOT NULL | 查詢窗口開始時間 |
| time_to | TIMESTAMP, NOT NULL | 查詢窗口結束時間 |
| status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / running / success / failed |
| records_fetched | INT, NOT NULL, DEFAULT 0 | 實際從 SSB 拉取的 log 筆數 |
| chunks_total | INT, NOT NULL, DEFAULT 0 | 切成幾個 chunk |
| chunks_done | INT, NOT NULL, DEFAULT 0 | 已完成幾個 chunk |
| retry_count | INT, NOT NULL, DEFAULT 0 | 已重試次數（上限由 FLASH_MAX_RETRY 設定）|
| error_message | TEXT, NULLABLE | 失敗原因 |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

```sql
CREATE INDEX idx_tb_log_batches_status ON tb_log_batches(status);
CREATE INDEX idx_tb_log_batches_time_from ON tb_log_batches(time_from);
```

### tb_chunk_results

每個 chunk 的 Claude Haiku 輸出，Pro Task 的原料。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL, PK | |
| batch_id | BIGINT, NOT NULL, FK → tb_log_batches | |
| chunk_index | INT, NOT NULL | chunk 序號（慣例：0,1,2...=個別 chunk；999=本批次合併；-1=當天累計）|
| chunk_size | INT, NOT NULL | 這個 chunk 幾筆 log |
| events | JSONB, NOT NULL, DEFAULT '[]' | Claude Haiku 判斷出的事件陣列（見下方結構）|
| status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / success / failed |
| error_message | TEXT, NULLABLE | |
| processed_at | TIMESTAMP, NULLABLE | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

**events JSONB 單筆結構：**
```json
{
  "star_rank": 4,
  "title": "帳號 MP0263 異常登入嘗試",
  "affected_summary": "MP0263（異常登入）",
  "affected_detail": "【受影響對象】MP0263【攻擊來源】172.18.1.84【攻擊行為】短時間內多次登入失敗【時間範圍】09:00–09:10",
  "match_key": "MP0263_login_failure_172.18.1.84",
  "log_ids": ["813298855461315879"],
  "logs": [
    {"id": "813298855461315879", "timestamp": "2026-03-16T09:03:21", "message": "稽核失敗...（原始 Windows 事件訊息）", "program": "Microsoft_Windows_security_auditing."}
  ],
  "ioc_list": ["172.18.1.84"],
  "mitre_tags": ["T1110"]
}
```

```sql
CREATE INDEX idx_tb_chunk_results_batch_id ON tb_chunk_results(batch_id);
CREATE INDEX idx_tb_chunk_results_status ON tb_chunk_results(status);
```

### tb_daily_analysis

Pro Task 每日執行紀錄，用於監控與除錯。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL, PK | |
| analysis_date | DATE, NOT NULL, UNIQUE | 分析日期 |
| status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / running / success / failed |
| chunk_results_count | INT, NOT NULL, DEFAULT 0 | 處理了幾筆 tb_chunk_results |
| events_created | INT, NOT NULL, DEFAULT 0 | 新建幾筆 tb_security_events |
| events_updated | INT, NOT NULL, DEFAULT 0 | 更新幾筆（去重合併）|
| error_message | TEXT, NULLABLE | |
| started_at | TIMESTAMP, NULLABLE | |
| completed_at | TIMESTAMP, NULLABLE | |
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

---

## 5. 安全事件

### tb_security_events

Pro Task 彙整後的最終事件，為使用者清單頁的資料來源。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL, PK | |
| event_date | DATE, NOT NULL | 事件所屬日期 |
| date_end | DATE, NULLABLE | 跨日事件的結束日期 |
| star_rank | SMALLINT, NOT NULL, CHECK (1–5) | 嚴重度，5 最高 |
| title | VARCHAR(200), NOT NULL | 事件標題 |
| description | TEXT, NULLABLE | 詳細說明（含【異常發現】【風險分析】段落）|
| affected_summary | VARCHAR(100), NOT NULL | 列表 badge 摘要，格式：`{主要對象}（{補充}）`，建議 30 字以內 |
| affected_detail | TEXT, NULLABLE | Popover 完整說明，【受影響對象】【攻擊來源】【攻擊行為】【時間範圍】標籤格式 |
| current_status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / investigating / resolved / dismissed |
| match_key | VARCHAR(200), NOT NULL | 去重 key，格式：`{識別對象}_{攻擊類型}_{來源識別}` |
| detection_count | INT, NOT NULL, DEFAULT 0 | 觸發此事件的 log 筆數 |
| continued_from | BIGINT, NULLABLE, FK → tb_security_events | 跨日延續事件 |
| assignee_user_id | INT, NULLABLE, FK → tb_users | 指派處理人 |
| suggests | JSONB, NULLABLE | AI 建議處置步驟（字串陣列）|
| logs | JSONB, NULLABLE | 觸發事件的關鍵原始 log 物件（5-20 筆，含 id/timestamp/message/program）|
| ioc_list | JSONB, NULLABLE | IoC 指標（字串陣列）|
| mitre_tags | JSONB, NULLABLE | MITRE ATT&CK 標籤（字串陣列）|
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

**current_status UI 對應：**

| DB 值 | UI 顯示 |
|---|---|
| pending | 未處理 |
| investigating | 處理中 |
| resolved | 已完成 |
| dismissed | 擱置 |

```sql
CREATE INDEX idx_tb_security_events_event_date ON tb_security_events(event_date);
CREATE INDEX idx_tb_security_events_star_rank ON tb_security_events(star_rank DESC);
CREATE INDEX idx_tb_security_events_current_status ON tb_security_events(current_status);
CREATE INDEX idx_tb_security_events_match_key ON tb_security_events(match_key);
```

### tb_event_history

安全事件的處理日誌，對應詳情頁「處理日誌」tab。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL, PK | |
| event_id | BIGINT, NOT NULL, FK → tb_security_events | |
| user_id | INT, NOT NULL, FK → tb_users | 操作人員 |
| action | VARCHAR(20), NOT NULL | status_change / assign / comment / resolve |
| old_status | VARCHAR(20), NULLABLE | 狀態變更前（action=status_change 時）|
| new_status | VARCHAR(20), NULLABLE | 狀態變更後（action=status_change 時）|
| note | TEXT, NULLABLE | 備註或留言 |
| resolved_at | TIMESTAMP, NULLABLE | 解決時間（action=resolve 時填入）|
| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |

```sql
CREATE INDEX idx_tb_event_history_event_id ON tb_event_history(event_id);
```
