# 介面說明

| 項目     | 內容                                       |
| ------ | ---------------------------------------- |
| Method | DELETE                                   |
| Endpoint | /api/users/{email}                     |

# 傳入參數

## 參數類型：Path Parameter

| 參數           | 型別     | 說明      |
| ------------ | ------ | ------- |
| **電子信箱**     | string | 目標使用者識別 |

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 確認 **電子信箱** 對應的使用者存在
3. 確認操作者不是刪除自己（避免無管理員可登入）
4. 刪除 tb_user_roles 中該使用者的所有角色關聯
5. 刪除 tb_users 中該筆紀錄

# 傳回結果

**Response 204**：刪除成功，無回傳內容

**Response 400**：嘗試刪除自己的帳號
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
**Response 404**：使用者不存在
