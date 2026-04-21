# f-auth-01 登入 / 登出

## 對應程式碼

| 層 | 檔案 |
|----|------|
| 後端 | `api/auth.py`、`core/security.py`、`core/deps.py`、`models/token_blacklist.py`、`schemas/auth.py` |
| 前端 | `pages/Login/Login.tsx`、`stores/authStore.ts` |

---

## POST /auth/login

### Request

```json
{
  "email": "user@example.com",
  "password": "plaintext_password"
}
```

### Response

**200 OK**
```json
{
  "access_token": "<JWT>",
  "token_type": "bearer"
}
```

**401 Unauthorized**
```json
{
  "detail": "帳號或密碼錯誤"
}
```

> 帳號不存在、密碼錯誤、帳號停用（is_active=false）統一回傳相同訊息，避免洩漏帳號是否存在。

---

## POST /auth/logout

> 需攜帶 Authorization: Bearer \<token\>

### Response

**200 OK**
```json
{
  "detail": "已登出"
}
```

**401 Unauthorized**
```json
{
  "detail": "請重新登入"
}
```

---

## JWT 規格

| 項目 | 說明 |
|------|------|
| 演算法 | HS256 |
| 時效 | 8 小時 |
| Payload | `sub`（user_id）、`jti`（唯一識別碼）、`exp` |
| 黑名單 | 登出時將 `jti` 寫入 `token_blacklist`；驗證時需檢查黑名單 |
