# auth_logout — 登出

## 說明

| 項目 | 內容 |
|---|---|
| Method | POST |
| Endpoint | /auth/logout |
| 前置條件 | 已登入（Authorization: Bearer \<token\>） |

## 傳入參數

無（token 由 Authorization header 帶入）

## 處理邏輯

1. 驗證 JWT 有效性
2. 取出 `jti`，寫入 **`token_blacklist`**，需可定期清理
3. 回傳成功

## 傳回結果

**Response 200**
```json
{
  "detail": "已登出"
}
```

**Response 401**：未帶 token 或 token 已失效
```json
{
  "detail": "請重新登入"
}
```
