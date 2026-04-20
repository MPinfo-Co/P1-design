# f_user_update — 修改帳號

## 說明

| 項目 | 內容 |
|---|---|
| Method | PATCH |
| Endpoint | /api/users/{id} |
| 前置條件 | 已登入（JWT 有效），具 `can_manage_accounts` 權限 |

## 傳入參數

**Path Parameter**

| 參數 | 型別 | 說明 |
|---|---|---|
| id | integer | 目標使用者 ID |

**Request Body（JSON）**

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| name | string | 否 | 使用者顯示名稱，最長 100 字 |
| email | string | 否 | 登入信箱，需符合 email 格式 |
| role_ids | integer[] | 否 | 傳入則整組取代現有角色指派；至少一個角色 ID |

> 僅傳入需修改的欄位，未傳入欄位保持不變。

## 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 確認 `id` 對應的使用者存在
3. 若傳入 `email`，確認不與其他使用者重複
4. 更新 `users` 表中對應欄位，更新 `updated_at`
5. 若傳入 `role_ids`，先刪除 `user_roles` 中該 user 的所有紀錄，再重新寫入

**涉及資料表：**
- `users`：更新 name、email、updated_at
- `user_roles`：刪除舊有角色關聯，寫入新角色關聯

## 傳回結果

**Response 200**
```json
{
  "id": 1,
  "name": "Rex Shen",
  "email": "rexshen@mpinfo.com.tw",
  "is_active": true,
  "roles": [
    { "id": 1, "name": "管理員" }
  ]
}
```

**Response 400**：欄位驗證失敗（含 role_ids 為空陣列）
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
**Response 404**：使用者不存在
**Response 409**：email 已被其他帳號使用
