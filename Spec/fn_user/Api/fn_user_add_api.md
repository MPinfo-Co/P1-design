# 帳號管理：新增帳號 API(fn_user_add)

## 說明

| 項目       | 內容                                       |
| -------- | ---------------------------------------- |
| Method   | POST                                     |
| Endpoint | /api/users                               |
| 前置條件     | 已登入（JWT 有效），具 `can_manage_accounts` 權限   |

## 傳入參數

**Request Body（JSON）**

| 欄位        | 型別        | 必填  | 說明                                |
| --------- | --------- | --- | --------------------------------- |
| **名稱**    | string    | 是   | 使用者顯示名稱，最長 100 字                  |
| **Email** | string    | 是   | 登入信箱，需符合 email 格式                 |
| **密碼**    | string    | 是   | 明文密碼，後端 bcrypt hash 後儲存，最少 8 字元   |
| **角色**    | integer[] | 是   | 至少一個角色                            |

## 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 確認 **Email** 在 tb_users 中不重複
3. 以 bcrypt hash **密碼**，寫入 tb_users（`is_active = true`）
4. 逐筆寫入 tb_user_roles

## 傳回結果

**Response 201**
```json
{
  "name": "新帳號",
  "email": "new@mpinfo.com.tw",
  "is_active": true,
  "roles": [
    { "name": "管理員" }
  ]
}
```

**Response 400**：欄位驗證失敗（含**角色**為空）
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
**Response 409**：**Email** 已存在
