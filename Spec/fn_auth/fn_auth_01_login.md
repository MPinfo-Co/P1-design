# fn_auth_01 — 登入頁

## 畫面名稱：登入頁

## 畫面

![fn_auth_01 登入頁](Screen/fn_auth_01_login.png)

## 欄位說明

| 欄位 | 元件 | 必填 | 說明 |
|---|---|---|---|
| 電子信箱 | text input | 是 | email 格式 |
| 密碼 | password input | 是 | 輸入時遮蔽 |

## 操作說明

**[登入]**（按鈕）
- → `Api/auth_login.api.md`
  - 傳入：email、password
  - 成功：儲存身分憑證，跳轉首頁
  - 失敗：顯示錯誤訊息「帳號或密碼錯誤」
