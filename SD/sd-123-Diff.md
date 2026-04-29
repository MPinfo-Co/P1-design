# SpecDiff：Issue #123 系統公告顯示功能

## 修改項目及內容
- **Spec/fn_notice/Api/_fn_notice_test_api.md**（added，+15 -0）
```diff
@@ -0,0 +1,15 @@
+# 系統公告 API 測試規格
+
+> 活文件：每次 SD 有 API 異動時同步更新，ID 累積不重置。
+
+| ID  | 說明              | 前置條件                                    | 操作                                          | 預期結果                          |
+| --- | --------------- | --------------------------------------- | --------------------------------------------- | ----------------------------- |
+| T1  | 查詢成功（有有效公告）     | 已登入，DB 有 2 筆有效公告（expires_at ≥ 今日）、1 筆已逾期 | GET /api/notices                              | 200，data 回傳 2 筆，依 expires_at 升冪排序，不含逾期公告 |
+| T2  | 查詢成功（無有效公告）     | 已登入，DB 無任何有效公告                          | GET /api/notices                              | 200，data 回傳空陣列               |
+| T3  | 未登入拒絕存取         | 未登入（無 Token）                            | GET /api/notices                              | 401                           |
+| T4  | 新增成功            | 已登入且使用者角色具備 fn_notice 功能權限              | POST /api/notices，標題「測試公告」、內容「內容文字」、有效期限為明日 | 201 新增成功                      |
+| T5  | 新增失敗（標題空白）      | 已登入且具備 fn_notice 權限                     | POST /api/notices，標題傳入空字串                    | 400 標題未填寫                     |
+| T6  | 新增失敗（內容空白）      | 已登入且具備 fn_notice 權限                     | POST /api/notices，內容傳入空字串                    | 400 內容未填寫                     |
+| T7  | 新增失敗（有效期限空值）    | 已登入且具備 fn_notice 權限                     | POST /api/notices，有效期限傳入空值                   | 400 有效期限未填寫                   |
+| T8  | 新增失敗（有效期限為過去日期） | 已登入且具備 fn_notice 權限                     | POST /api/notices，有效期限傳入昨日日期                 | 400 有效期限須為今日或未來日期             |
+| T9  | 新增失敗（無權限）       | 已登入但使用者角色不具備 fn_notice 功能權限             | POST /api/notices，傳入完整合法資料                   | 403 您沒有執行此操作的權限               |
```

- **Spec/fn_notice/Api/fn_notice_add_api.md**（added，+44 -0）
```diff
@@ -0,0 +1,44 @@
+# fn_notice_add_api規格
+
+## 介面說明
+
+| 項目       | 內容           |
+| -------- | ------------ |
+| Method   | POST         |
+| Endpoint | /api/notices |
+
+## 傳入參數
+
+### 參數類型：Request Body
+
+| 欄位       | 型別     | 必填 |
+| -------- | ------ | -- |
+| **標題**   | string | 是  |
+| **內容**   | string | 是  |
+| **有效期限** | string | 是  |
+
+> **有效期限** 格式：YYYY-MM-DD
+
+## 處理邏輯
+
+### 檢核
+
+| 檢核項目     | 失敗條件                   | 回應訊息                  |
+| -------- | ---------------------- | --------------------- |
+| JWT 驗證   | 未登入或 Token 過期          | 401 未登入或 Token 過期     |
+| 權限       | 使用者角色不具備 fn_notice 功能權限 | 403 您沒有執行此操作的權限       |
+| **標題**   | 未填寫或空字串                | 400 標題未填寫             |
+| **內容**   | 未填寫或空字串                | 400 內容未填寫             |
+| **有效期限** | 未填寫或空值                 | 400 有效期限未填寫           |
+| **有效期限** | 早於今日                   | 400 有效期限須為今日或未來日期     |
+
+### 執行
+
+- 寫入 tb_notices（**標題**、**內容**、**有效期限**、created_by = 登入使用者 id）
+
+## 傳回結果
+
+| Response | Message | data |
+| -------- | ------- | ---- |
+| 201      | 新增成功    | 無    |
+| 4xx      | 依據檢核邏輯  | 無    |
```

- **Spec/fn_notice/Api/fn_notice_list_api.md**（added，+40 -0）
```diff
@@ -0,0 +1,40 @@
+# fn_notice_list_api規格
+
+## 介面說明
+
+| 項目       | 內容           |
+| -------- | ------------ |
+| Method   | GET          |
+| Endpoint | /api/notices |
+
+## 傳入參數
+
+無
+
+## 處理邏輯
+
+### 檢核
+
+| 檢核項目 | 失敗條件          | 回應訊息              |
+| ---- | ------------- | ----------------- |
+| JWT 驗證 | 未登入或 Token 過期 | 401 未登入或 Token 過期 |
+
+### 執行
+
+- 查詢 tb_notices，條件：`expires_at >= CURRENT_DATE`
+- 依 `expires_at` 升冪排序後回傳
+
+## 傳回結果
+
+| Response | Message | data                       |
+| -------- | ------- | -------------------------- |
+| 200      | 查詢成功    | object[]（公告清單，見下方結構） |
+| 4xx      | 依據檢核邏輯  | 無                          |
+
+**data 單筆結構：**
+
+| 欄位           | 型別     | 說明            |
+| ------------ | ------ | ------------- |
+| **id**       | integer | 公告 id        |
+| **標題**       | string  | 公告標題          |
+| **有效期限**     | string  | 格式：YYYY-MM-DD |
```

- **Spec/fn_notice/fn_notice_00_overview.md**（added，+19 -0）
```diff
@@ -0,0 +1,19 @@
+# 系統公告功能規格（fn_notice）
+
+## 功能說明
+
+在首頁顯示系統公告區塊，讓管理員可以新增公告，所有登入使用者皆可查看有效公告清單。
+
+雛形畫面：（本次無獨立雛形頁面，公告區塊整合於首頁）
+
+## 主要使用角色
+
+- **查看公告**：所有登入使用者
+- **新增公告**：具備 fn_notice 功能權限的使用者（管理員）
+
+## 畫面清單
+
+| 畫面名稱        | 路由路徑 | 畫面規格                                        | 畫面關聯 |
+| ----------- | ---- | ------------------------------------------- | ---- |
+| 首頁公告區塊      | —    | [fn_notice_01_home_block.md](fn_notice_01_home_block.md) | 整合於首頁 |
+| 新增公告 Dialog | —    | [fn_notice_01_home_block.md](fn_notice_01_home_block.md) | Dialog，由首頁公告區塊觸發 |
```

- **Spec/fn_notice/fn_notice_01_home_block.md**（added，+48 -0）
```diff
@@ -0,0 +1,48 @@
+# 首頁公告區塊 / 新增公告 Dialog
+
+整合於首頁，無獨立路由。
+
+---
+
+## 公告區塊（所有登入使用者）
+
+### 欄位說明
+
+| 欄位     | 顯示元件 |
+| ------ | ---- |
+| **標題** | 文字   |
+| **有效期限** | 文字（YYYY-MM-DD）|
+
+### 操作說明
+
+**頁面載入**
+- → `Api/fn_notice_list_api.md`
+  - 成功：依回傳資料渲染公告清單，依 **有效期限** 升冪排序
+  - 清單為空：顯示「目前無公告」提示文字
+
+**[新增公告]（管理員限定）**
+- 僅當登入使用者角色具備 fn_notice 功能權限時顯示
+- 點擊後展開新增公告 Dialog
+
+---
+
+## 新增公告 Dialog
+
+### 表單欄位
+
+| 欄位     | 輸入元件      | 必填 | 驗證規則              | 預設值 |
+| ------ | --------- | -- | ----------------- | --- |
+| **標題** | text input | 是  | 不可為空              | 空   |
+| **內容** | textarea  | 是  | 不可為空              | 空   |
+| **有效期限** | date picker | 是 | 須為今日或未來日期 | 空  |
+
+### 操作說明
+
+**[儲存]**
+- → `Api/fn_notice_add_api.md`
+  - 傳入：**標題**、**內容**、**有效期限**
+  - 成功：關閉 Dialog，重新整理公告清單
+  - 失敗：顯示 API 回傳的錯誤訊息
+
+**[取消]**
+- 關閉 Dialog，不送出資料
```

- **Spec/home/home_01.md**（modified，+4 -0）
```diff
@@ -6,3 +6,7 @@
 |----|------|
 | 後端 | — |
 | 前端 | `pages/Home/Home.jsx` |
+
+## 系統公告區塊
+
+首頁包含系統公告區塊，規格詳見 [Spec/fn_notice/fn_notice_01_home_block.md](../fn_notice/fn_notice_01_home_block.md)。
```

- **schema/schema.md**（modified，+15 -1）
```diff
@@ -1,4 +1,18 @@
 
+---
+## fn_notice
+
+### tb_notices
+
+| 欄位         | 型別                                 | 說明          |
+| ---------- | ---------------------------------- | ----------- |
+| id         | INTEGER, PK                        | 主鍵          |
+| title      | VARCHAR(200), NOT NULL             | 公告標題        |
+| content    | TEXT, NOT NULL                     | 公告內容        |
+| expires_at | DATE, NOT NULL                     | 有效期限（含當日）   |
+| created_by | INTEGER, NULLABLE, FK → tb_users   | 建立者         |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | 建立時間        |
+
 ---
 ## fn_user / role
 
@@ -30,7 +44,7 @@
 | function_id     | INTEGER, PK                |      |
 | function_name   | VARCHAR(100), NOT NULL, UK | 功能代碼 |
 
-> 初始資料：`(1, fn_user)`、`(2, fn_role)`
+> 初始資料：`(1, fn_user)`、`(2, fn_role)`、`(3, fn_notice)`
 
 ### tb_role_function（多對多）
 
```

## 關聯項目
- Epic：MPinfo-Co/P1-project#137
- SA Issue：MPinfo-Co/P1-design#121
- SD Issue：P1-design #123
- 上一個 commit：9998b8e
- 本次 commit：5792381