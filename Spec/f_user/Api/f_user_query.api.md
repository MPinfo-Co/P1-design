# f_user_query — 查詢帳號清單

## 說明

| 項目 | 內容 |
|---|---|
| Method | GET |
| Endpoint | /api/users |
| 前置條件 | 已登入（JWT 有效），具 `can_manage_accounts` 權限 |

## 傳入參數

| 參數 | 型別 | 必填 | 說明 |
|---|---|---|---|
| role_id | integer | 否 | 依角色 ID 篩選，未傳則回傳全部 |
| keyword | string | 否 | 搜尋 name / email（ILIKE） |

## 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 查詢 `users` 表，LEFT JOIN `user_roles` + `roles`
3. 若傳入 `role_id`，過濾 `user_roles.role_id = role_id`
4. 若傳入 `keyword`，過濾 `name ILIKE %keyword%` OR `email ILIKE %keyword%`
5. 依 `users.id` 升冪排序

**涉及資料表：**
- `users`：id、name、email、is_active
- `user_roles`：user_id、role_id
- `roles`：id、name

## 傳回結果

**Response 200**
```json
[
  {
    "id": 1,
    "name": "Rex Shen",
    "email": "rexshen@mpinfo.com.tw",
    "is_active": true,
    "roles": [
      { "id": 1, "name": "管理員" }
    ]
  }
]
```

**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
