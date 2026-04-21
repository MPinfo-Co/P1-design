# 介面說明

| 項目       | 內容                                       |
| -------- | ---------------------------------------- |
| Method   | PATCH                                    |
| Endpoint | /api/users/{email}                       |

# 傳入參數

## 參數類型：Path Parameter

| 參數           | 型別     | 說明      |
| ------------ | ------ | ------- |
| **電子信箱**     | string | 目標使用者識別 |

## 參數類型：Request Body

| 欄位        | 型別        | 必填  | 說明                           |
| --------- | --------- | --- | ---------------------------- |
| **名稱**    | string    | 否   | 使用者顯示名稱，最長 100 字             |
| **Email** | string    | 否   | 登入信箱，需符合 email 格式            |
| **角色**    | integer[] | 否   | 傳入則整組取代現有角色指派；至少一個角色         |

> 僅傳入需修改的欄位，未傳入欄位保持不變。

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 確認 **電子信箱** 對應的使用者存在
3. 若傳入 **Email**，確認不與其他使用者重複
4. 更新 tb_users 中對應欄位
5. 若傳入 **角色**，先刪除 tb_user_roles 中該使用者的所有紀錄，再重新寫入

# 傳回結果

**Response 200**
```json
{
  "name": "Rex Shen",
  "email": "rexshen@mpinfo.com.tw",
  "is_active": true,
  "roles": [
    { "name": "管理員" }
  ]
}
```

**Response 400**：欄位驗證失敗（含**角色**為空陣列）
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
**Response 404**：使用者不存在
**Response 409**：**Email** 已被其他帳號使用
