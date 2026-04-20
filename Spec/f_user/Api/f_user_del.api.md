# f_user_del — 刪除帳號

## 說明

| 項目 | 內容 |
|---|---|
| Method | DELETE |
| Endpoint | /api/users/{id} |
| 前置條件 | 已登入（JWT 有效），具 `can_manage_accounts` 權限 |

## 傳入參數

**Path Parameter**

| 參數 | 型別 | 說明 |
|---|---|---|
| id | integer | 目標使用者 ID |

## 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 確認 `id` 對應的使用者存在
3. 確認操作者不是刪除自己（避免無管理員可登入）
4. 刪除 `user_roles` 中該 user 的所有角色關聯
5. 刪除 `users` 中該筆紀錄

**涉及資料表：**
- `user_roles`：刪除 user_id = id 的所有紀錄
- `users`：刪除 id 對應紀錄

## 傳回結果

**Response 204**：刪除成功，無回傳內容

**Response 400**：嘗試刪除自己的帳號
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
**Response 404**：使用者不存在
