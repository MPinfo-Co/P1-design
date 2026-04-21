## 說明

| 項目 | 內容 |
|---|---|
| Method | POST |
| Endpoint | /auth/login |
| 前置條件 | 無（公開端點） |

## 傳入參數

| 參數 | 型別 | 必填 | 說明 |
|---|---|---|---|
| email | string | 是 | 登入信箱 |
| password | string | 是 | 明文密碼（傳輸層加密） |

## 處理邏輯

1. 以 email 查詢 `users` 表
2. 若帳號不存在、密碼不符（bcrypt 比對）、或 `is_active = false`，統一回傳 401（不洩漏帳號是否存在）
3. 驗證通過，簽發 JWT（含 `sub`=user_id、`jti`、`exp`=8小時後）
4. 回傳 access_token


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
