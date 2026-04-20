# f_user_add — 新增帳號

## 說明

| 項目 | 內容 |
|---|---|
| Method | POST |
| Endpoint | /api/users |
| 前置條件 | 已登入（JWT 有效），具 `can_manage_accounts` 權限 |

## 傳入參數

**Request Body（JSON）**

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| name | string | 是 | 使用者顯示名稱，最長 100 字 |
| email | string | 是 | 登入信箱，需符合 email 格式 |
| password | string | 是 | 明文密碼，後端 bcrypt hash 後儲存，最少 8 字元 |
| role_ids | integer[] | 是 | 至少一個角色 ID |

## 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 確認 `email` 在 `users` 表中不重複
3. 以 bcrypt hash `password`，寫入 `users` 表（`is_active = true`）
4. 逐筆寫入 `user_roles` 表（user_id + role_id）

**涉及資料表：**
- `users`：寫入 name、email、password_hash、is_active
- `user_roles`：寫入 user_id、role_id（每個角色一筆）

## 傳回結果

**Response 201**
```json
{
  "id": 6,
  "name": "新帳號",
  "email": "new@mpinfo.com.tw",
  "is_active": true,
  "roles": [
    { "id": 1, "name": "管理員" }
  ]
}
```

**Response 400**：欄位驗證失敗（含 role_ids 為空）
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
**Response 409**：email 已存在
