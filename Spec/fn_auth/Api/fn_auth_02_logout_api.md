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

### Token 傳遞方式
需登入的 API 一律從 HTTP Authorization header 帶 JWT，格式為 `Bearer <token>`。

### 黑名單機制
登出時會將 token 的 `jti` 寫入 `tb_token_blacklist`，每次身分驗證會查詢 `token_jti` 確認 token 未被作廢；過期資料由定期清理 job 依 `expired_at` 移除。
