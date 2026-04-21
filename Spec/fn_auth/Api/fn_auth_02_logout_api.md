## 說明

| 項目       | 內容           |
| -------- | ------------ |
| Method   | POST         |
| Endpoint | /auth/logout |
| 前置條件     | 已登入          |

## 處理邏輯

1. 驗證 JWT 有效性
2. 取出 `jti`，寫入 **`tb_token_blacklist`** 表，需可定期清理
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

## 備註

需登入的 API 一律從 Authorization header 帶 token，`token_jti` 每次驗證身分都會查詢，`expired_at` 定期清理時會篩選，建議兩個欄位都加 index。
