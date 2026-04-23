# fn_user API 測試規格

> 活文件：每次 SD 新增或修改 API 時同步更新，ID 累積不重置。

| ID | 說明 | 前置條件 | 操作 | 預期結果 |
|----|------|----------|------|----------|
| T1 | 查詢成功 | 已登入且具 `can_manage_accounts` 權限 | GET /api/users | 200，data 包含每位使用者的姓名、Email、is_active、角色陣列 |
| T2 | 查詢無權限 | 已登入但無 `can_manage_accounts` 權限 | GET /api/users | 403 您沒有執行此操作的權限 |
| T3 | 新增成功 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，傳入有效姓名、Email、密碼（≥ 8 字元）、至少一個角色 | 201 新增成功 |
| T4 | 新增 Email 重複 | 已登入且具 `can_manage_accounts` 權限，系統中 Email 已存在 | POST /api/users，傳入相同 Email | 400 此 Email 已被使用 |
| T5 | 新增密碼不足 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
| T6 | 新增角色為空 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，角色陣列為空 | 400 角色未設定 |
| T7 | 修改成功 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，傳入有效新姓名 | 200 更新成功 |
| T8 | 修改使用者不存在 | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com，傳入任意姓名 | 404 使用者不存在 |
| T9 | 刪除成功 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在且非操作者本身 | DELETE /api/users/{email} | 200 刪除成功，tb_users 及 tb_user_roles 對應紀錄移除 |
| T10 | 刪除自己 | 已登入且具 `can_manage_accounts` 權限 | DELETE /api/users/{操作者自己的 email} | 400 無法刪除自己的帳號 |
