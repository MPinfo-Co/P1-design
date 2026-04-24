# SpecDiff：Issue #59 登入功能

## 修改項目及內容
- **Spec/auth/auth_01_login.md**（removed，+0 -8）
```diff
@@ -1,8 +0,0 @@
-# f-auth-01 登入 / 登出
-
-## 對應程式碼
-
-| 層 | 檔案 |
-|----|------|
-| 後端 | `api/auth.py`、`core/security.py`、`core/deps.py`、`models/token_blacklist.py`、`schemas/auth.py` |
-| 前端 | `pages/Login/Login.jsx`、`stores/authStore.js` |
```

- **Spec/fn_auth/Api/fn_auth_01_login_api.md**（added，+38 -0）
```diff
@@ -0,0 +1,38 @@
+## 說明
+
+| 項目       | 內容          |
+| -------- | ----------- |
+| Method   | POST        |
+| Endpoint | /auth/login |
+
+## 傳入參數
+
+| 參數     | 型別     | 必填  | 說明          |
+| ------ | ------ | --- | ----------- |
+| **帳號** | string | 是   | 登入信箱        |
+| **密碼** | string | 是   | 明文密碼（傳輸層加密） |
+
+## 處理邏輯
+
+1. 以 **帳號** 查詢 **`users`** 表
+2. 若帳號不存在、密碼不符、或 `is_active = false`，統一回傳 401（不洩漏帳號是否存在）
+3. 驗證通過，Token設定8小時後過期
+4. 回傳憑證
+
+
+## 傳回結果
+
+**Response 200**
+```json
+{
+  "access_token": "<JWT>",
+  "token_type": "bearer"
+}
+```
+
+**Response 401**：帳號不存在 / 密碼錯誤 / 帳號停用
+```json
+{
+  "detail": "帳號或密碼錯誤"
+}
+```
```

- **Spec/fn_auth/Api/fn_auth_02_logout_api.md**（added，+37 -0）
```diff
@@ -0,0 +1,37 @@
+## 說明
+
+| 項目       | 內容           |
+| -------- | ------------ |
+| Method   | POST         |
+| Endpoint | /auth/logout |
+| 前置條件     | 已登入          |
+
+## 處理邏輯
+
+1. 驗證 JWT 有效性
+2. 取出 `jti`，寫入 **`tb_token_blacklist`** 表，需可定期清理
+3. 回傳成功
+
+## 傳回結果
+
+**Response 200**
+```json
+{
+  "detail": "已登出"
+}
+```
+
+**Response 401**：未帶 token 或 token 已失效
+```json
+{
+  "detail": "請重新登入"
+}
+```
+
+## 備註
+
+### Token 傳遞方式
+需登入的 API 一律從 HTTP Authorization header 帶 JWT，格式為 `Bearer <token>`。
+
+### 黑名單機制
+登出時會將 token 的 `jti` 寫入 `tb_token_blacklist`，每次身分驗證會查詢 `token_jti` 確認 token 未被作廢；過期資料由定期清理 job 依 `expired_at` 移除。
```

- **Spec/fn_auth/Screen/fn_auth_01_login.png**（added，+0 -0）

- **Spec/fn_auth/Screen/fn_auth_02_logout.png**（added，+0 -0）

- **Spec/fn_auth/fn_auth_00_overview.md**（added，+14 -0）
```diff
@@ -0,0 +1,14 @@
+## 功能說明
+
+使用者以帳號密碼登入系統，取得身分憑證後可存取需驗證的功能；可隨時登出並立即清除登入狀態。
+
+## 主要使用角色
+
+所有使用者（無需特定權限）
+
+## 畫面清單
+
+| 畫面名稱   | 規格檔                                          | 畫面關聯       |
+| ------ | -------------------------------------------- | ---------- |
+| 登入頁    | [fn_auth_01_login.md](fn_auth_01_login.md)   | 登入成功 → 首頁  |
+| 頂部登出按鈕 | [fn_auth_02_logout.md](fn_auth_02_logout.md) | 登出成功 → 登入頁 |
```

- **Spec/fn_auth/fn_auth_01_login.md**（added，+16 -0）
```diff
@@ -0,0 +1,16 @@
+## 登入畫面
+<img src="Screen/fn_auth_01_login.png"  width="603">
+## 欄位說明
+
+| 欄位     | 元件             | 必填  | 說明       |
+| ------ | -------------- | --- | -------- |
+| **帳號** | text input     | 是   | email 格式 |
+| **密碼** | password input | 是   | 輸入時遮蔽    |
+
+## 操作說明
+
+**[登入]**
+- → `Api/fn_auth_01_login_api.md`
+  - 傳入：**帳號**、**密碼**
+  - 成功：儲存身分憑證，跳轉首頁
+  - 失敗：顯示錯誤訊息「帳號或密碼錯誤」
```

- **Spec/fn_auth/fn_auth_02_logout.md**（added，+16 -0）
```diff
@@ -0,0 +1,16 @@
+## 登出畫面
+<img src="Screen/fn_auth_02_logout.png" width="1060">
+
+## 欄位說明
+
+| 元件   | 位置   | 說明      |
+| ---- | ---- | ------- |
+| 登出按鈕 | 頂部右側 | 所有頁面均顯示 |
+
+## 操作說明
+
+**[登出]**（頂部右側按鈕）
+- → `Api/fn_auth_02_logout_api.md`
+  - 傳入：（無，憑證由 HTTP header 帶入）
+  - 成功：清除本地憑證，跳轉登入頁
+  - 失敗：顯示錯誤訊息，不強制登出
```

- **schema/schema.md**（modified，+25 -24）
```diff
@@ -1,25 +1,18 @@
-# MP-Box Schema
-
-> 版本：v2 | 日期：2026-03-31
-> 對應 Epic：[PM] 安全事件清單 — SSB 串接完整實作（MPinfo-Co/P1-project#50）
 
 ---
-
-## 1. 使用者 / 角色
+## fn_user / role
 
 ### tb_users
 
-- **用途**：系統使用者帳號，所有人工操作的身份來源。
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | 主鍵 |
-| name | VARCHAR(100), NOT NULL | 使用者顯示名稱 |
-| email | VARCHAR(255), NOT NULL, UK | 登入信箱，不可重複 |
-| password_hash | VARCHAR(255), NOT NULL | bcrypt 雜湊密碼 |
-| is_active | BOOLEAN, NOT NULL, DEFAULT TRUE | 帳號啟用狀態 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| 欄位            | 型別                                 | 說明          |
+| ------------- | ---------------------------------- | ----------- |
+| id            | INTEGER, PK                        | 主鍵          |
+| name          | VARCHAR(100), NOT NULL             | 使用者顯示名稱     |
+| email         | VARCHAR(255), NOT NULL, UK         | 登入信箱，不可重複   |
+| password_hash | VARCHAR(255), NOT NULL             | bcrypt 雜湊密碼 |
+| is_active     | BOOLEAN, NOT NULL, DEFAULT TRUE    | 帳號啟用狀態      |
+| updated_by    | INTEGER, NULLABLE, FK → tb_users   | 最後更新者       |
+| updated_at    | TIMESTAMP, NOT NULL, DEFAULT NOW() | 最後更新時間      |
 
 ### tb_roles
 
@@ -43,9 +36,18 @@
 | user_id | INTEGER, PK, FK → tb_users | |
 | role_id | INTEGER, PK, FK → tb_roles | |
 
----
+### tb_token_blacklist
+
+| 欄位          | 型別                                 | 說明                    |
+| ----------- | ---------------------------------- | --------------------- |
+| id          | INTEGER, PK                        | 主鍵                    |
+| token_jti   | VARCHAR(255), NOT NULL, UK         | JWT 的 jti（唯一識別碼）      |
+| expired_at  | TIMESTAMP, NOT NULL                | token 原本的過期時間（用於定期清理） |
+| token_owner | INTEGER, NULLABLE, FK → tb_users   | Token擁有者              |
+| updated_at  | TIMESTAMP, NOT NULL, DEFAULT NOW() | 最後更新時間                |
 
-## 2. AI 夥伴
+---
+## fn_partner
 
 ### tb_ai_partners
 
@@ -69,8 +71,7 @@
 | partner_id | INTEGER, PK, FK → tb_ai_partners | |
 
 ---
-
-## 3. 知識庫
+## fn_km
 
 ### tb_knowledge_bases
 
@@ -159,7 +160,7 @@
 
 ---
 
-## 4. SSB 分析 Pipeline
+## fn_expert - SSB Pipeline
 
 > 對應 Epic：安全事件清單 — SSB 串接完整實作
 
@@ -243,7 +244,7 @@ Pro Task 每日執行紀錄，用於監控與除錯。
 
 ---
 
-## 5. 安全事件
+## fn_expert - Security Event
 
 ### tb_security_events
 
@@ -305,4 +306,4 @@ CREATE INDEX idx_tb_security_events_match_key ON tb_security_events(match_key);
 
 ```sql
 CREATE INDEX idx_tb_event_history_event_id ON tb_event_history(event_id);
- ```
\ No newline at end of file
+```
```

## 關聯項目
- Epic：MPinfo-Co/P1-project#96
- SA Issue：MPinfo-Co/P1-analysis#87
- SD Issue：P1-design #59
- 上一個 commit：a8d2d8f
- 本次 commit：34125d6