# TDD Diff：Issue #21 安全事件清單 — SSB 串接完整實作

## 修改項目及內容
- **Spec/SecurityEventsAPI.md**（added，+155 -0）
```diff
@@ -0,0 +1,155 @@
+# API Spec：安全事件清單
+
+> 對應 Epic：MPinfo-Co/P1-project#50
+> 前置條件：已登入（JWT token 有效）、具資安專家角色
+
+---
+
+## GET /api/events
+
+取得安全事件清單，依嚴重度降冪排序。
+
+**Query Parameters**
+
+| 參數 | 型別 | 必填 | 說明 |
+|---|---|---|---|
+| status | string | 否 | 篩選狀態，多選用逗號分隔（pending,investigating,resolved,dismissed）|
+| keyword | string | 否 | 搜尋 title / affected_summary（ILIKE）|
+| date_from | string | 否 | 日期起（ISO8601，event_date >=）|
+| date_to | string | 否 | 日期迄（ISO8601，event_date <=）|
+| page | int | 否 | 頁碼，預設 1 |
+| page_size | int | 否 | 每頁筆數，預設 20，最大 100 |
+
+**排序**：`star_rank DESC`（固定）
+
+**Response 200**
+```json
+{
+  "total": 100,
+  "page": 1,
+  "page_size": 20,
+  "items": [
+    {
+      "id": 1,
+      "event_date": "2026-03-16",
+      "date_end": null,
+      "star_rank": 5,
+      "title": "稽核政策遭大規模竄改",
+      "affected_summary": "全域 AD 稽核政策（30,972筆）",
+      "detection_count": 30972,
+      "current_status": "pending",
+      "assignee_user_id": null,
+      "created_at": "2026-03-16T02:05:00"
+    }
+  ]
+}
+```
+
+**Response 401**：Token 過期或未登入
+**Response 403**：無資安專家權限
+
+---
+
+## GET /api/events/{id}
+
+取得單一安全事件完整資料（含處理日誌）。
+
+**Path Parameters**
+
+| 參數 | 型別 | 說明 |
+|---|---|---|
+| id | int | 事件 ID |
+
+**Response 200**
+```json
+{
+  "id": 1,
+  "event_date": "2026-03-16",
+  "date_end": null,
+  "star_rank": 5,
+  "title": "稽核政策遭大規模竄改",
+  "description": "【異常發現】...\n【風險分析】...",
+  "affected_summary": "全域 AD 稽核政策（30,972筆）",
+  "affected_detail": "【受影響對象】...【攻擊來源】...【攻擊行為】...【時間範圍】...",
+  "detection_count": 30972,
+  "current_status": "pending",
+  "match_key": "ad_audit_policy_mpdc19",
+  "assignee_user_id": null,
+  "suggests": ["立即鎖定帳號", "封鎖來源 IP"],
+  "logs": [
+    {"id": "813298855461315879", "timestamp": "2026-03-16T13:32:01", "message": "稽核原則變更...", "program": "Microsoft_Windows_security_auditing."}
+  ],
+  "ioc_list": [],
+  "mitre_tags": ["T1562.002"],
+  "history": [
+    {
+      "id": 1,
+      "user_id": 1,
+      "action": "status_change",
+      "old_status": "pending",
+      "new_status": "investigating",
+      "note": "開始調查",
+      "resolved_at": null,
+      "created_at": "2026-03-16T09:00:00"
+    }
+  ],
+  "created_at": "2026-03-16T02:05:00",
+  "updated_at": "2026-03-16T09:00:00"
+}
+```
+
+**Response 404**：事件不存在
+
+---
+
+## PATCH /api/events/{id}
+
+更新事件狀態或指派人，自動寫入 event_history。
+
+**Path Parameters**
+
+| 參數 | 型別 | 說明 |
+|---|---|---|
+| id | int | 事件 ID |
+
+**Request Body**（擇一或多個）
+```json
+{
+  "current_status": "investigating",
+  "assignee_user_id": 2
+}
+```
+
+**副作用**：自動寫入 event_history（action: status_change 或 assign）
+
+**Response 200**：更新後的完整事件資料
+**Response 400**：欄位值不合法
+**Response 404**：事件不存在
+
+---
+
+## POST /api/events/{id}/history
+
+新增處理日誌（留言或結案）。
+
+**Path Parameters**
+
+| 參數 | 型別 | 說明 |
+|---|---|---|
+| id | int | 事件 ID |
+
+**Request Body**
+```json
+{
+  "note": "已通知相關人員",
+  "resolved_at": "2026-03-16T18:00:00"
+}
+```
+
+| 欄位 | 必填 | 說明 |
+|---|---|---|
+| note | 是 | 留言內容 |
+| resolved_at | 否 | 解決時間，有填則 action=resolve，否則 action=comment |
+
+**Response 201**：新建的 event_history 資料
+**Response 404**：事件不存在
\ No newline at end of file
```

- **schema/entity-analysis.md**（removed，+0 -479）
```diff
@@ -1,479 +0,0 @@
-# MP-Box 實體分析
-
-> 版本：v1 | 日期：2026-03-20
-> 對應 issue：[P3-1]
-
----
-
-## 各領域實體
-
-### 1. 使用者 / 角色
-
-#### users
-
-- **用途**：系統使用者帳號，所有人工操作的身份來源。
-- **關鍵欄位**：`id`, `name`, `email`(UK), `password_hash`, `is_active`
-- **主要關係**：透過 `user_roles` 關聯角色；作為 `knowledge_bases.created_by`、`kb_documents.uploaded_by`、`kb_tables.created_by`、`event_history.user_id`、`security_events.assignee_user_id`（新增）的 FK 來源。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，使用者唯一識別碼 |
-| name | VARCHAR(100), NOT NULL | 使用者顯示名稱 |
-| email | VARCHAR(255), NOT NULL, UK | 使用者電子信箱，用於登入與通知，不可重複 |
-| password_hash | VARCHAR(255), NOT NULL | 密碼雜湊值，儲存加密後的登入密碼 |
-| is_active | BOOLEAN, NOT NULL, DEFAULT TRUE | 帳號啟用狀態，停用後無法登入系統 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 帳號建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 帳號最後更新時間 |
-
-#### roles
-
-- **用途**：功能權限群組，控制使用者可使用的系統功能。
-- **關鍵欄位**：`id`, `name`(UK), `can_access_ai`, `can_use_kb`（**新增**）, `can_manage_accounts`, `can_manage_roles`, `can_edit_ai`, `can_manage_kb`（**新增**）
-- **主要關係**：透過 `user_roles` 關聯使用者；透過 `role_ai_partners` 控制可使用的 AI 夥伴（資安專家等）；透過 `role_kb_map` 控制可存取的知識庫。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，角色唯一識別碼 |
-| name | VARCHAR(100), NOT NULL, UK | 角色名稱，不可重複 |
-| can_access_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 是否允許使用 AI 夥伴功能的總開關；具體可用哪些夥伴由 `role_ai_partners` 控制 |
-| can_use_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | **新增**，是否允許查閱知識庫內容；具體可存取哪些知識庫由 `role_kb_map` 控制 |
-| can_manage_accounts | BOOLEAN, NOT NULL, DEFAULT FALSE | 是否允許管理使用者帳號 |
-| can_manage_roles | BOOLEAN, NOT NULL, DEFAULT FALSE | 是否允許管理角色與權限設定 |
-| can_edit_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 是否允許編輯 AI 夥伴設定 |
-| can_manage_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | **新增**，是否允許管理知識庫（新增/編輯/刪除） |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 角色建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 角色最後更新時間 |
-
-#### user_roles
-
-- **用途**：使用者與角色的多對多關聯表。
-- **關鍵欄位**：`user_id`(PK,FK), `role_id`(PK,FK)
-- **主要關係**：FK 分別指向 `users` 與 `roles`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| user_id | INTEGER, PK, FK → users | 關聯的使用者 ID |
-| role_id | INTEGER, PK, FK → roles | 關聯的角色 ID |
-
----
-
-### 2. AI 夥伴
-
-#### ai_partners
-
-- **用途**：可自訂 system prompt 的 AI 角色，每個夥伴對應一種分析情境（如資安專家、合規顧問）。
-- **關鍵欄位**：`id`, `name`(UK), `is_builtin`, `is_enabled`, `model_name`, `system_prompt`
-- **主要關係**：透過 `role_ai_partners` 決定哪些角色可使用；透過 `partner_kb_map` 綁定知識庫；為 `daily_analysis.partner_id` 的 FK 來源。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，AI 夥伴唯一識別碼 |
-| name | VARCHAR(100), NOT NULL, UK | AI 夥伴名稱，不可重複 |
-| description | TEXT, NULLABLE | AI 夥伴的功能描述 |
-| is_builtin | BOOLEAN, NOT NULL, DEFAULT FALSE | 是否為系統內建夥伴，內建夥伴不可刪除 |
-| is_enabled | BOOLEAN, NOT NULL, DEFAULT TRUE | 是否啟用，停用後不會出現在可選清單中 |
-| model_name | VARCHAR(100), NULLABLE | 使用的 LLM 模型名稱（如 gemini-2.5-flash） |
-| system_prompt | TEXT, NULLABLE | 自訂的系統提示詞，定義 AI 夥伴的角色與行為 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最後更新時間 |
-
-#### role_ai_partners
-
-- **用途**：角色與 AI 夥伴的多對多關聯表，決定某角色可使用哪些 AI 夥伴。
-- **關鍵欄位**：`role_id`(PK,FK), `partner_id`(PK,FK)
-- **主要關係**：FK 分別指向 `roles` 與 `ai_partners`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| role_id | INTEGER, PK, FK → roles | 關聯的角色 ID |
-| partner_id | INTEGER, PK, FK → ai_partners | 關聯的 AI 夥伴 ID |
-
----
-
-### 3. 知識庫
-
-#### knowledge_bases
-
-- **用途**：知識庫容器，區分不同主題或來源的知識集合。
-- **關鍵欄位**：`id`, `name`, `description`, `created_by`(FK)
-- **主要關係**：擁有多個 `kb_documents` 與 `kb_tables`；透過 `role_kb_map` 控制角色存取；透過 `partner_kb_map` 綁定 AI 夥伴。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，知識庫唯一識別碼 |
-| name | VARCHAR(200), NOT NULL | 知識庫名稱 |
-| description | TEXT, NULLABLE | 知識庫描述，說明此知識庫的主題或用途 |
-| created_by | INTEGER, NULLABLE, FK → users | 建立此知識庫的使用者 ID |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最後更新時間 |
-
-#### kb_documents
-
-- **用途**：上傳至知識庫的非結構化文件（PDF / Word / TXT），供 RAG 查詢使用。
-- **關鍵欄位**：`id`, `kb_id`(FK), `file_name`, `file_type`, `processing_status`, `chunk_count`, `uploaded_by`(FK)
-- **主要關係**：屬於某個 `knowledge_bases`；擁有多個 `kb_doc_chunks`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，文件唯一識別碼 |
-| kb_id | INTEGER, NOT NULL, FK → knowledge_bases | 所屬知識庫 ID |
-| file_name | VARCHAR(500), NOT NULL | 上傳的原始檔案名稱 |
-| file_size | BIGINT, NOT NULL, DEFAULT 0 | 檔案大小（bytes） |
-| file_type | VARCHAR(50), NULLABLE | 檔案類型（pdf / docx / txt 等） |
-| storage_path | VARCHAR(1000), NULLABLE | 檔案在伺服器上的儲存路徑 |
-| processing_status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | 文件處理狀態（pending / processing / completed / failed） |
-| chunk_count | INTEGER, NOT NULL, DEFAULT 0 | 文件被切分的段落數量 |
-| uploaded_by | INTEGER, NULLABLE, FK → users | 上傳此文件的使用者 ID |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 上傳時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最後更新時間 |
-
-#### kb_doc_chunks
-
-- **用途**：文件分塊後的內容與 embedding 向量，供 pgvector 語意搜尋。
-- **關鍵欄位**：`id`, `document_id`(FK), `chunk_index`, `content`, `embedding`(vector), `token_count`
-- **主要關係**：屬於某個 `kb_documents`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，分塊唯一識別碼 |
-| document_id | INTEGER, NOT NULL, FK → kb_documents | 所屬文件 ID |
-| chunk_index | INTEGER, NOT NULL, DEFAULT 0 | 分塊在文件中的排序索引 |
-| content | TEXT, NOT NULL | 分塊的文字內容 |
-| embedding | TEXT, NULLABLE | embedding 向量，供語意搜尋使用（實際部署時型別為 vector） |
-| token_count | INTEGER, NULLABLE | 此分塊的 token 數量，用於控制 LLM 上下文長度 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 分塊建立時間 |
-
-#### kb_tables
-
-- **用途**：人工維護的結構化知識表（設備清單、IP 白名單等），供 AI 生成 SQL 查詢。
-- **關鍵欄位**：`id`, `kb_id`(FK), `table_name`, `source`, `created_by`(FK)
-- **主要關係**：屬於某個 `knowledge_bases`；擁有多個 `kb_table_columns` 與 `kb_table_rows`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，結構化知識表唯一識別碼 |
-| kb_id | INTEGER, NOT NULL, FK → knowledge_bases | 所屬知識庫 ID |
-| table_name | VARCHAR(200), NOT NULL | 知識表名稱（如「設備清單」、「IP 白名單」） |
-| source | VARCHAR(50), NOT NULL, DEFAULT 'custom' | 資料來源（custom 為手動建立） |
-| created_by | INTEGER, NULLABLE, FK → users | 建立此知識表的使用者 ID |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最後更新時間 |
-
-#### kb_table_columns
-
-- **用途**：結構化知識表的欄位定義（名稱、型別、排序）。
-- **關鍵欄位**：`id`, `table_id`(FK), `column_name`, `column_type`, `column_order`
-- **主要關係**：屬於某個 `kb_tables`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，欄位定義唯一識別碼 |
-| table_id | INTEGER, NOT NULL, FK → kb_tables | 所屬知識表 ID |
-| column_name | VARCHAR(200), NOT NULL | 欄位名稱 |
-| column_type | VARCHAR(50), NOT NULL, DEFAULT 'text' | 欄位資料型別（text / number / date 等） |
-| column_order | INTEGER, NOT NULL, DEFAULT 0 | 欄位顯示排序 |
-
-#### kb_table_rows
-
-- **用途**：結構化知識表的資料列，以 JSON 儲存每列內容。
-- **關鍵欄位**：`id`, `table_id`(FK), `row_data`(JSON)
-- **主要關係**：屬於某個 `kb_tables`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，資料列唯一識別碼 |
-| table_id | INTEGER, NOT NULL, FK → kb_tables | 所屬知識表 ID |
-| row_data | JSON, NOT NULL, DEFAULT '{}' | 以 JSON 格式儲存的該列所有欄位資料 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 資料列建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 資料列最後更新時間 |
-
-#### role_kb_map
-
-- **用途**：角色與知識庫的多對多關聯表，控制哪些角色可存取哪個知識庫。
-- **關鍵欄位**：`role_id`(PK,FK), `kb_id`(PK,FK)
-- **主要關係**：FK 分別指向 `roles` 與 `knowledge_bases`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| role_id | INTEGER, PK, FK → roles | 關聯的角色 ID |
-| kb_id | INTEGER, PK, FK → knowledge_bases | 關聯的知識庫 ID |
-
-#### partner_kb_map
-
-- **用途**：AI 夥伴與知識庫的多對多關聯表，決定 AI 夥伴可引用哪些知識庫做 RAG。
-- **關鍵欄位**：`partner_id`(PK,FK), `kb_id`(PK,FK)
-- **主要關係**：FK 分別指向 `ai_partners` 與 `knowledge_bases`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| partner_id | INTEGER, PK, FK → ai_partners | 關聯的 AI 夥伴 ID |
-| kb_id | INTEGER, PK, FK → knowledge_bases | 關聯的知識庫 ID |
-
----
-
-### 4. 分析 Pipeline
-
-#### log_batches
-
-- **用途**：原始日誌匯入批次，記錄來源檔案與日誌數量統計。Flash 每 5~10 分鐘觸發一次，每批進來的原始 log 量可達 3~5 萬筆（未經 syslog-ng 前置過濾時）。`filtered_count` 記錄實際送入分析的筆數，待 syslog-ng 過濾上線後兩者將有明顯差距。
-- **關鍵欄位**：`id`, `source_file`, `hosts`, `batch_date`, `raw_log_count`, `filtered_count`, `expires_at`
-- **主要關係**：透過 `daily_analysis_batch_map` 關聯每日分析週期；被 `flash_results` 引用。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，日誌批次唯一識別碼 |
-| source_file | VARCHAR(1000), NOT NULL | 匯入的來源檔案路徑或名稱 |
-| hosts | JSON, NOT NULL, DEFAULT '[]' | 此批次涵蓋的機器清單，從每筆 log 的 Host 欄位提取 unique 值自動寫入（如 `["mpdc19-01", "mpdc19-02", "MPCFW"]`） |
-| batch_date | DATE, NOT NULL | 日誌批次對應的日期 |
-| raw_log_count | INTEGER, NOT NULL, DEFAULT 0 | 原始日誌筆數（匯入前） |
-| filtered_count | INTEGER, NOT NULL, DEFAULT 0 | 過濾後的日誌筆數（實際送入 Flash 分析）；syslog-ng 前置過濾上線前與 raw_log_count 相同 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 批次建立時間 |
-| expires_at | TIMESTAMP, NULLABLE | 資料過期時間，過期後可自動清除 |
-
-#### daily_analysis
-
-- **用途**：一天一筆的分析週期記錄，專注追蹤 PRO / Merge 階段狀態與 token 消耗。Flash 每 5~10 分鐘觸發一次（或依累積筆數觸發），每次結果存入 `flash_results`；PRO 每天執行一次，讀取當天所有 `flash_results` 加上前一天的事件清單，判斷新事件與延續事件後產出當天版本的完整事件清單。Flash 的執行次數與狀態直接從 `flash_results` 查詢，不在此表重複記錄。
-- **關鍵欄位**：`id`, `partner_id`(FK), `analysis_date`, `triggered_by`, `status`, `pro_status`, `merge_status`, `event_count`, `pro_token`
-- **主要關係**：屬於某個 `ai_partners`；透過 `daily_analysis_batch_map` 關聯日誌批次；產出多筆 `flash_results` 與 `security_events`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，分析工作階段唯一識別碼 |
-| partner_id | INTEGER, NOT NULL, FK → ai_partners | 執行分析的 AI 夥伴 ID |
-| analysis_date | DATE, NOT NULL | 分析對應的日期 |
-| triggered_by | VARCHAR(50), NOT NULL, DEFAULT 'schedule' | 觸發方式（schedule 排程 / manual 手動） |
-| status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | 整體分析狀態（pending / running / completed / failed） |
-| pro_status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | PRO 模型分析階段狀態 |
-| merge_status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | 合併階段狀態 |
-| total_log_count | INTEGER, NOT NULL, DEFAULT 0 | 此次分析涵蓋的總日誌筆數 |
-| event_count | INTEGER, NOT NULL, DEFAULT 0 | 此次分析產出的安全事件數量 |
-| pro_token | INTEGER, NULLABLE | PRO 模型消耗的 token 數量 |
-| error_message | TEXT, NULLABLE | 分析失敗時的錯誤訊息 |
-| started_at | TIMESTAMP, NULLABLE | 分析開始時間 |
-| completed_at | TIMESTAMP, NULLABLE | 分析完成時間 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 記錄建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 記錄最後更新時間 |
-
-#### daily_analysis_batch_map
-
-- **用途**：每日分析週期與日誌批次的多對多關聯表，記錄某天的分析週期涵蓋了哪幾批 log。Flash 每 5~10 分鐘觸發一次，一天會產生多個 log_batches，全部掛在同一個 daily_analysis 下。
-- **關鍵欄位**：`daily_analysis_id`(PK,FK), `batch_id`(PK,FK)
-- **主要關係**：FK 分別指向 `daily_analysis` 與 `log_batches`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| daily_analysis_id | INTEGER, PK, FK → daily_analysis | 關聯的每日分析週期 ID |
-| batch_id | INTEGER, PK, FK → log_batches | 關聯的日誌批次 ID |
-
-#### flash_results
-
-- **用途**：Flash 模型每次執行的分析中間結果，後續由 PRO 模型彙整產出最終事件清單。每批 log 原始量可達 3~5 萬筆，以每筆平均 250 token 估算可達 750 萬~1,250 萬 token，遠超 Flash 模型 context 上限（如 Gemini 2.5 Flash 為 1M token），因此每批 log 需切分為多個 chunk（建議每 chunk 約 1,000 筆）分次送入 Flash，每次產出一筆 flash_results 記錄。PRO 執行時讀取當天所有 flash_results 彙整分析。
-- **關鍵欄位**：`id`, `session_id`(FK), `batch_id`(FK), `chunk_index`, `chunk_total`, `result_json`(JSON), `token_used`
-- **主要關係**：屬於某個 `daily_analysis`；關聯某個 `log_batches`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，Flash 結果唯一識別碼 |
-| session_id | INTEGER, NOT NULL, FK → daily_analysis | 所屬每日分析週期 ID |
-| batch_id | INTEGER, NULLABLE, FK → log_batches | 對應的日誌批次 ID |
-| chunk_index | INTEGER, NOT NULL, DEFAULT 0 | 此筆結果對應該批 log 的第幾個 chunk（從 0 開始） |
-| chunk_total | INTEGER, NOT NULL, DEFAULT 1 | 該批 log 被切分的 chunk 總數；PRO 可用此欄確認該批所有 chunk 是否都已完成 |
-| result_json | JSON, NOT NULL | Flash 模型回傳的 JSON 分析結果 |
-| token_used | INTEGER, NULLABLE | 此次 chunk 分析消耗的 token 數量；當天所有 flash_results 的 token_used 加總即為當日 Flash 總消耗 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 結果建立時間 |
-| expires_at | TIMESTAMP, NULLABLE | 中間結果過期時間，PRO 彙整完成後可自動清除 |
-
-#### similar_events（新增）
-
-- **用途**：相似歷史案例記錄，由 PRO 模型於每日分析時依語意相似度、MITRE 技術重疊度自動寫入，供使用者參考過往處置經驗。
-- **關鍵欄位**：
-  - `id` - PK
-  - `event_id`(FK → security_events) - 此相似案例所屬的目標事件
-  - `similar_event_id`(FK → security_events, NULLABLE) - 若相似案例也存在於系統內，指向該事件；若為外部/歷史資料則為 NULL
-  - `title`(VARCHAR) - 相似案例標題
-  - `date`(DATE) - 相似案例發生日期
-  - `similarity_pct`(INT) - 相似度百分比（0-100）
-  - `summary`(TEXT) - 案例摘要
-  - `outcome`(VARCHAR) - 處置結果狀態（已完成 / 擱置 等）
-  - `resolved_at`(TIMESTAMP) - 結案時間
-  - `resolved_by`(VARCHAR) - 處置人員
-  - `resolution`(TEXT) - 處置方式描述
-  - `created_at`(TIMESTAMP) - 寫入時間
-- **主要關係**：`event_id` FK 指向 `security_events`（必填，一個事件可有多筆相似案例）；`similar_event_id` FK 指向 `security_events`（可為 NULL，當相似案例為系統內既有事件時填入）。
-
-**欄位說明（新增實體）**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | **新增**，主鍵，相似案例唯一識別碼 |
-| event_id | INTEGER, NOT NULL, FK → security_events | **新增**，此相似案例所屬的目標安全事件 ID |
-| similar_event_id | INTEGER, NULLABLE, FK → security_events | **新增**，若相似案例存在於系統內，指向該事件；外部資料則為 NULL |
-| title | VARCHAR(500), NOT NULL | **新增**，相似案例標題 |
-| date | DATE, NOT NULL | **新增**，相似案例發生日期 |
-| similarity_pct | INTEGER, NOT NULL | **新增**，與目標事件的相似度百分比（0-100） |
-| summary | TEXT, NULLABLE | **新增**，相似案例摘要說明 |
-| outcome | VARCHAR(100), NULLABLE | **新增**，處置結果狀態（如「已完成」、「擱置」） |
-| resolved_at | TIMESTAMP, NULLABLE | **新增**，案例結案時間 |
-| resolved_by | VARCHAR(100), NULLABLE | **新增**，負責處置的人員名稱 |
-| resolution | TEXT, NULLABLE | **新增**，處置方式的詳細描述 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | **新增**，記錄寫入時間 |
-
----
-
-### 5. 安全事件
-
-#### security_events
-
-- **用途**：AI 分析產出的安全事件快照，每天一份完整清單。PRO 模型每天執行時輸入當天 flash_results 與前一天的事件清單，判斷哪些是新事件、哪些是前一天事件的延續，並輸出當天版本的完整事件清單，每天的快照獨立保存以便溯源。同一事件若跨日延續，透過 `continued_from` 串接前一天的記錄；查詢某日的完整清單只需篩選 `session_id`。
-- **關鍵欄位**：`id`, `session_id`(FK), `continued_from`(FK, **新增**), `title`, `event_type`, `star_rank`, `date_start`, `date_end`, `detection_count`, `affected_summary`, `current_status`, `suggests`(JSON), `mitre_tags`(JSON), `match_key`, `assignee_user_id`（**新增**，FK → users，事件負責人）
-- **suggests JSON 結構**（擴充）：由原本的字串陣列 `["建議1", "建議2"]` 改為物件陣列，每項包含：
-  ```json
-  [
-    {
-      "text": "建議措施的完整描述文字",
-      "urgency": "最推薦",
-      "refs": ["T1562.002", "T1078"]
-    },
-    {
-      "text": "第二項建議措施",
-      "urgency": "次推薦",
-      "refs": ["T1021"]
-    },
-    {
-      "text": "第三項建議措施",
-      "urgency": "可選",
-      "refs": []
-    }
-  ]
-  ```
-  - `text`：建議措施文字（含操作步驟、溯源說明）
-  - `urgency`：優先級，值為 `最推薦` / `次推薦` / `可選`
-  - `refs`：相關參考（MITRE ATT&CK 技術編號等）
-- **主要關係**：屬於某個 `daily_analysis`；擁有多筆 `event_history`（人工處置紀錄）；擁有多筆 `similar_events`（相似案例）；`assignee_user_id` FK 指向 `users`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，安全事件唯一識別碼 |
-| session_id | INTEGER, NULLABLE, FK → daily_analysis | 產出此事件的每日分析 ID，同一 session_id 的所有記錄構成當天的完整事件清單 |
-| continued_from | INTEGER, NULLABLE, FK → security_events | **新增**，若此事件為前一天某事件的延續，指向前一天的事件 ID（`match_key` 相同）；全新事件則為 NULL |
-| title | VARCHAR(500), NOT NULL | 事件標題，簡述安全威脅內容 |
-| event_type | VARCHAR(100), NOT NULL | 事件分類（如入侵偵測、異常登入、惡意程式等） |
-| star_rank | SMALLINT, NOT NULL, DEFAULT 1 | 嚴重等級（1-5 星），數字越大越嚴重 |
-| date_start | DATE, NOT NULL | 事件偵測起始日期 |
-| date_end | DATE, NULLABLE | 事件偵測結束日期 |
-| detection_count | INTEGER, NOT NULL, DEFAULT 1 | 相關日誌偵測次數 |
-| affected_summary | VARCHAR(255), NULLABLE | 受影響範圍摘要，顯示於事件清單的 badge。限 20 字以內（單行）。格式：`{主要對象}（{最關鍵補充}）`。範例：`172.16.1.112 → Domain Controllers`、`防火牆邊界（13:30~16:30）` |
-| affected_detail | TEXT, NULLABLE | 受影響範圍詳細說明，顯示於點擊 badge 後的 popover。採半結構化格式，使用【】標籤分段。【受影響對象】與【攻擊行為】為必填；【攻擊來源】（有明確來源才填）與【時間範圍】（有特定時間窗才填）為選填。範例：`【受影響對象】mpdc19-01、mpdc19-02（Domain Controllers）\n【攻擊來源】172.16.1.112（內部主機）\n【攻擊行為】421 次登入失敗（EventID 4625）\n【時間範圍】全日` |
-| current_status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | 事件處理狀態（pending / investigating / resolved / dismissed） |
-| description | TEXT, NULLABLE | 事件摘要，由 PRO 模型產生，對應 UI 的「事件摘要」區塊。必須包含以下兩個段落：`【異常發現】`（具體偵測到的異常行為、數據、受影響對象）與`【風險分析】`（攻擊手法研判、背景脈絡、潛在威脅程度）。PRO 的 system prompt 應強制要求此格式輸出。 |
-| suggests | JSON, NOT NULL, DEFAULT '[]' | 建議措施清單，物件陣列格式（含 text / urgency / refs） |
-| logs | JSON, NOT NULL, DEFAULT '[]' | 相關原始日誌摘錄 |
-| ioc_list | JSON, NOT NULL, DEFAULT '[]' | 入侵指標（IoC）清單，如可疑 IP、檔案雜湊等 |
-| mitre_tags | JSON, NOT NULL, DEFAULT '[]' | MITRE ATT&CK 技術標籤（如 T1078、T1562） |
-| match_key | VARCHAR(500), NULLABLE | 事件合併比對鍵，用於跨日分析時判斷是否為同一事件 |
-| assignee_user_id | INTEGER, NULLABLE, FK → users | **新增**，事件指派負責人的使用者 ID |
-| resolution | TEXT, NULLABLE | 事件的最終處置說明 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 事件建立時間 |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 事件最後更新時間 |
-
-#### event_history
-
-- **用途**：安全事件的人工處置紀錄（備註、狀態變更），支援軟刪除。
-- **關鍵欄位**：`id`, `event_id`(FK), `user_id`(FK), `note`, `status_change`, `deleted_at`
-- **主要關係**：屬於某個 `security_events`；`user_id` FK 指向操作的 `users`。
-
-**欄位說明**
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵，處置紀錄唯一識別碼 |
-| event_id | INTEGER, NOT NULL, FK → security_events | 所屬安全事件 ID |
-| user_id | INTEGER, NULLABLE, FK → users | 執行此操作的使用者 ID |
-| note | TEXT, NOT NULL | 處置備註內容 |
-| status_change | VARCHAR(50), NULLABLE | 狀態變更（如 pending → investigating），未變更時為 NULL |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP | 紀錄建立時間 |
-| deleted_at | TIMESTAMP, NULLABLE | 軟刪除時間，非 NULL 表示已刪除 |
-
----
-
-## 範圍外（刻意排除）
-
-| 實體 | 排除原因 |
-|------|---------|
-| `notification_settings` | 通知偏好設定屬於 AI 主動通知功能，規劃於 AI phase 再實作。 |
-| `chat_sessions` / `chat_messages` | AI 對話紀錄屬於互動式分析功能，規劃於 Phase 5 實作。 |
-
----
-
-## 變更摘要（相對於現有 schema v3）
-
-### 新增欄位
-
-| 資料表 | 欄位 | 型別 | 說明 |
-|--------|------|------|------|
-| `roles` | `can_use_kb` | BOOLEAN, DEFAULT FALSE | 控制角色是否可查閱知識庫內容（總開關） |
-| `roles` | `can_manage_kb` | BOOLEAN, DEFAULT FALSE | 控制角色是否可管理知識庫（新增/編輯/刪除） |
-| `security_events` | `assignee_user_id` | INT, FK → users, NULLABLE | 事件指派負責人 |
-| `security_events` | `continued_from` | INT, FK → security_events, NULLABLE | 跨日延續事件的串接鍵；security_events 採每日快照設計，同一事件每天建新記錄，延續時指向前一天的記錄 ID，全新事件為 NULL |
-
-### 修改欄位
-
-| 資料表 | 原欄位 | 新欄位 | 型別 | 說明 |
-|--------|--------|--------|------|------|
-| `log_batches` | `device_name` VARCHAR(255) | `hosts` | JSON, DEFAULT '[]' | 由單一設備名稱改為機器清單 JSON 陣列，因一個 batch 可包含多台機器的 log；匯入時自動從 log 的 Host 欄位提取 unique 值寫入 |
-
-### 移除欄位
-
-| 資料表 | 欄位 | 移除原因 |
-|--------|------|---------|
-| `daily_analysis` | `flash_status` | Flash 每天執行多次（依時間間隔或累積筆數觸發），單一狀態欄位無法表達多次執行狀態；Flash 執行狀態直接從 `flash_results` 筆數與內容查詢 |
-| `daily_analysis` | `flash_token` | Flash 多次執行的 token 消耗從 `flash_results.token_used` 加總取得，不重複儲存 |
-| `daily_analysis` | `source_file` | 來源檔案資訊已記錄於 `log_batches.source_file`，透過 `daily_analysis_batch_map` 可查詢 |
-
-### 新增實體
-
-| 資料表 | 說明 |
-|--------|------|
-| `similar_events` | 相似歷史案例，由分析 pipeline 自動寫入。欄位：`id`, `event_id`(FK), `similar_event_id`(FK, nullable), `title`, `date`, `similarity_pct`, `summary`, `outcome`, `resolved_at`, `resolved_by`, `resolution`, `created_at` |
-
-### JSON 結構擴充
-
-| 資料表 | 欄位 | 變更內容 |
-|--------|------|---------|
-| `security_events` | `suggests` | 由字串陣列改為物件陣列，每項結構為 `{ text, urgency, refs }`，其中 `urgency` 值為「最推薦 / 次推薦 / 可選」 |
```

- **schema/schema.md**（added，+308 -0）
```diff
@@ -0,0 +1,308 @@
+# MP-Box Schema
+
+> 版本：v2 | 日期：2026-03-31
+> 對應 Epic：[PM] 安全事件清單 — SSB 串接完整實作（MPinfo-Co/P1-project#50）
+
+---
+
+## 1. 使用者 / 角色
+
+### users
+
+- **用途**：系統使用者帳號，所有人工操作的身份來源。
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | 主鍵 |
+| name | VARCHAR(100), NOT NULL | 使用者顯示名稱 |
+| email | VARCHAR(255), NOT NULL, UK | 登入信箱，不可重複 |
+| password_hash | VARCHAR(255), NOT NULL | bcrypt 雜湊密碼 |
+| is_active | BOOLEAN, NOT NULL, DEFAULT TRUE | 帳號啟用狀態 |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### roles
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| name | VARCHAR(100), NOT NULL, UK | 角色名稱 |
+| can_access_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 可使用 AI 夥伴功能 |
+| can_use_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | 可查閱知識庫 |
+| can_manage_accounts | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理使用者帳號 |
+| can_manage_roles | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理角色與權限 |
+| can_edit_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 可編輯 AI 夥伴設定 |
+| can_manage_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理知識庫 |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### user_roles（多對多）
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| user_id | INTEGER, PK, FK → users | |
+| role_id | INTEGER, PK, FK → roles | |
+
+---
+
+## 2. AI 夥伴
+
+### ai_partners
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| name | VARCHAR(100), NOT NULL, UK | AI 夥伴名稱 |
+| description | TEXT, NULLABLE | 功能描述 |
+| is_builtin | BOOLEAN, NOT NULL, DEFAULT FALSE | 內建夥伴不可刪除 |
+| is_enabled | BOOLEAN, NOT NULL, DEFAULT TRUE | 停用後不出現在可選清單 |
+| model_name | VARCHAR(100), NULLABLE | 使用的 LLM 模型（如 gemini-2.5-flash）|
+| system_prompt | TEXT, NULLABLE | 自訂系統提示詞 |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### role_ai_partners（多對多）
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| role_id | INTEGER, PK, FK → roles | |
+| partner_id | INTEGER, PK, FK → ai_partners | |
+
+---
+
+## 3. 知識庫
+
+### knowledge_bases
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| name | VARCHAR(200), NOT NULL | 知識庫名稱 |
+| description | TEXT, NULLABLE | |
+| created_by | INTEGER, NULLABLE, FK → users | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### kb_documents
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| kb_id | INTEGER, NOT NULL, FK → knowledge_bases | |
+| file_name | VARCHAR(500), NOT NULL | |
+| file_size | BIGINT, NOT NULL, DEFAULT 0 | bytes |
+| file_type | VARCHAR(50), NULLABLE | pdf / docx / txt 等 |
+| storage_path | VARCHAR(1000), NULLABLE | |
+| processing_status | VARCHAR(50), NOT NULL, DEFAULT 'pending' | pending / processing / completed / failed |
+| chunk_count | INTEGER, NOT NULL, DEFAULT 0 | |
+| uploaded_by | INTEGER, NULLABLE, FK → users | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### kb_doc_chunks
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| document_id | INTEGER, NOT NULL, FK → kb_documents | |
+| chunk_index | INTEGER, NOT NULL, DEFAULT 0 | |
+| content | TEXT, NOT NULL | |
+| embedding | TEXT, NULLABLE | 實際部署時型別為 vector |
+| token_count | INTEGER, NULLABLE | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### kb_tables
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| kb_id | INTEGER, NOT NULL, FK → knowledge_bases | |
+| table_name | VARCHAR(200), NOT NULL | |
+| source | VARCHAR(50), NOT NULL, DEFAULT 'custom' | |
+| created_by | INTEGER, NULLABLE, FK → users | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### kb_table_columns
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| table_id | INTEGER, NOT NULL, FK → kb_tables | |
+| column_name | VARCHAR(200), NOT NULL | |
+| column_type | VARCHAR(50), NOT NULL, DEFAULT 'text' | text / number / date 等 |
+| column_order | INTEGER, NOT NULL, DEFAULT 0 | |
+
+### kb_table_rows
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | INTEGER, PK | |
+| table_id | INTEGER, NOT NULL, FK → kb_tables | |
+| row_data | JSON, NOT NULL, DEFAULT '{}' | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+### role_kb_map（多對多）
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| role_id | INTEGER, PK, FK → roles | |
+| kb_id | INTEGER, PK, FK → knowledge_bases | |
+
+### partner_kb_map（多對多）
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| partner_id | INTEGER, PK, FK → ai_partners | |
+| kb_id | INTEGER, PK, FK → knowledge_bases | |
+
+---
+
+## 4. SSB 分析 Pipeline
+
+> 對應 Epic：安全事件清單 — SSB 串接完整實作
+
+### log_batches
+
+每次 Flash Task 從 SSB REST API 拉取的批次紀錄，用於狀態追蹤與補跑機制。
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | BIGSERIAL, PK | |
+| time_from | TIMESTAMP, NOT NULL | 查詢窗口開始時間 |
+| time_to | TIMESTAMP, NOT NULL | 查詢窗口結束時間 |
+| status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / running / success / failed |
+| records_fetched | INT, NOT NULL, DEFAULT 0 | 實際從 SSB 拉取的 log 筆數 |
+| chunks_total | INT, NOT NULL, DEFAULT 0 | 切成幾個 chunk |
+| chunks_done | INT, NOT NULL, DEFAULT 0 | 已完成幾個 chunk |
+| retry_count | INT, NOT NULL, DEFAULT 0 | 已重試次數（上限由 FLASH_MAX_RETRY 設定）|
+| error_message | TEXT, NULLABLE | 失敗原因 |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+```sql
+CREATE INDEX idx_log_batches_status ON log_batches(status);
+CREATE INDEX idx_log_batches_time_from ON log_batches(time_from);
+```
+
+### chunk_results
+
+每個 chunk 的 Claude Haiku 輸出，Pro Task 的原料。
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | BIGSERIAL, PK | |
+| batch_id | BIGINT, NOT NULL, FK → log_batches | |
+| chunk_index | INT, NOT NULL | chunk 序號（慣例：0,1,2...=個別 chunk；999=本批次合併；-1=當天累計）|
+| chunk_size | INT, NOT NULL | 這個 chunk 幾筆 log |
+| events | JSONB, NOT NULL, DEFAULT '[]' | Claude Haiku 判斷出的事件陣列（見下方結構）|
+| status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / success / failed |
+| error_message | TEXT, NULLABLE | |
+| processed_at | TIMESTAMP, NULLABLE | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+**events JSONB 單筆結構：**
+```json
+{
+  "star_rank": 4,
+  "title": "帳號 MP0263 異常登入嘗試",
+  "affected_summary": "MP0263（異常登入）",
+  "affected_detail": "【受影響對象】MP0263【攻擊來源】172.18.1.84【攻擊行為】短時間內多次登入失敗【時間範圍】09:00–09:10",
+  "match_key": "MP0263_login_failure_172.18.1.84",
+  "log_ids": ["813298855461315879"],
+  "logs": [
+    {"id": "813298855461315879", "timestamp": "2026-03-16T09:03:21", "message": "稽核失敗...（原始 Windows 事件訊息）", "program": "Microsoft_Windows_security_auditing."}
+  ],
+  "ioc_list": ["172.18.1.84"],
+  "mitre_tags": ["T1110"]
+}
+```
+
+```sql
+CREATE INDEX idx_chunk_results_batch_id ON chunk_results(batch_id);
+CREATE INDEX idx_chunk_results_status ON chunk_results(status);
+```
+
+### daily_analysis
+
+Pro Task 每日執行紀錄，用於監控與除錯。
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | BIGSERIAL, PK | |
+| analysis_date | DATE, NOT NULL, UNIQUE | 分析日期 |
+| status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / running / success / failed |
+| chunk_results_count | INT, NOT NULL, DEFAULT 0 | 處理了幾筆 chunk_results |
+| events_created | INT, NOT NULL, DEFAULT 0 | 新建幾筆 security_events |
+| events_updated | INT, NOT NULL, DEFAULT 0 | 更新幾筆（去重合併）|
+| error_message | TEXT, NULLABLE | |
+| started_at | TIMESTAMP, NULLABLE | |
+| completed_at | TIMESTAMP, NULLABLE | |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+---
+
+## 5. 安全事件
+
+### security_events
+
+Pro Task 彙整後的最終事件，為使用者清單頁的資料來源。
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | BIGSERIAL, PK | |
+| event_date | DATE, NOT NULL | 事件所屬日期 |
+| date_end | DATE, NULLABLE | 跨日事件的結束日期 |
+| star_rank | SMALLINT, NOT NULL, CHECK (1–5) | 嚴重度，5 最高 |
+| title | VARCHAR(200), NOT NULL | 事件標題 |
+| description | TEXT, NULLABLE | 詳細說明（含【異常發現】【風險分析】段落）|
+| affected_summary | VARCHAR(100), NOT NULL | 列表 badge 摘要，格式：`{主要對象}（{補充}）`，建議 30 字以內 |
+| affected_detail | TEXT, NULLABLE | Popover 完整說明，【受影響對象】【攻擊來源】【攻擊行為】【時間範圍】標籤格式 |
+| current_status | VARCHAR(20), NOT NULL, DEFAULT 'pending' | pending / investigating / resolved / dismissed |
+| match_key | VARCHAR(200), NOT NULL | 去重 key，格式：`{識別對象}_{攻擊類型}_{來源識別}` |
+| detection_count | INT, NOT NULL, DEFAULT 0 | 觸發此事件的 log 筆數 |
+| continued_from | BIGINT, NULLABLE, FK → security_events | 跨日延續事件 |
+| assignee_user_id | INT, NULLABLE, FK → users | 指派處理人 |
+| suggests | JSONB, NULLABLE | AI 建議處置步驟（字串陣列）|
+| logs | JSONB, NULLABLE | 觸發事件的關鍵原始 log 物件（5-20 筆，含 id/timestamp/message/program）|
+| ioc_list | JSONB, NULLABLE | IoC 指標（字串陣列）|
+| mitre_tags | JSONB, NULLABLE | MITRE ATT&CK 標籤（字串陣列）|
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+**current_status UI 對應：**
+
+| DB 值 | UI 顯示 |
+|---|---|
+| pending | 未處理 |
+| investigating | 處理中 |
+| resolved | 已完成 |
+| dismissed | 擱置 |
+
+```sql
+CREATE INDEX idx_security_events_event_date ON security_events(event_date);
+CREATE INDEX idx_security_events_star_rank ON security_events(star_rank DESC);
+CREATE INDEX idx_security_events_current_status ON security_events(current_status);
+CREATE INDEX idx_security_events_match_key ON security_events(match_key);
+```
+
+### event_history
+
+安全事件的處理日誌，對應詳情頁「處理日誌」tab。
+
+| 欄位 | 型別 | 說明 |
+|------|------|------|
+| id | BIGSERIAL, PK | |
+| event_id | BIGINT, NOT NULL, FK → security_events | |
+| user_id | INT, NOT NULL, FK → users | 操作人員 |
+| action | VARCHAR(20), NOT NULL | status_change / assign / comment / resolve |
+| old_status | VARCHAR(20), NULLABLE | 狀態變更前（action=status_change 時）|
+| new_status | VARCHAR(20), NULLABLE | 狀態變更後（action=status_change 時）|
+| note | TEXT, NULLABLE | 備註或留言 |
+| resolved_at | TIMESTAMP, NULLABLE | 解決時間（action=resolve 時填入）|
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+
+```sql
+CREATE INDEX idx_event_history_event_id ON event_history(event_id);
+```
\ No newline at end of file
```

## 關聯項目
- Epic：MPinfo-Co/P1-project#50
- SA Issue：MPinfo-Co/P1-analysis#26
- SD Issue：P1-design #21
- 上一個 commit：d4885e5
- 本次 commit：5badd18