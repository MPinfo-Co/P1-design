## 說明

| 項目       | 內容          |
| -------- | ----------- |
| Method   | POST        |
| Endpoint | /auth/login |

## 傳入參數

| 參數           | 型別     | 必填  | 說明          |
| ------------ | ------ | --- | ----------- |
| **Email**    | string | 是   | 登入信箱        |
| **Password** | string | 是   | 明文密碼（傳輸層加密） |

## 處理邏輯

1. 以 **Email** 查詢 **`users`** 表
2. 若帳號不存在、密碼不符、或 `is_active = false`，統一回傳 401（不洩漏帳號是否存在）
3. 驗證通過，Token設定8小時後過期
4. 回傳憑證


## 傳回結果

**Response 200**
```json
{
  "access_token": "<JWT>",
  "token_type": "bearer"
}
```

**Response 401**：帳號不存在 / 密碼錯誤 / 帳號停用
```json
{
  "detail": "帳號或密碼錯誤"
}
```
