# 帳號管理：查詢帳號清單 API(fn_user_query)

## 說明

| 項目       | 內容                                       |
| -------- | ---------------------------------------- |
| Method   | GET                                      |
| Endpoint | /api/users                               |
| 前置條件     | 已登入（JWT 有效），具 `can_manage_accounts` 權限   |

## 傳入參數

| 參數           | 型別      | 必填  | 說明                           |
| ------------ | ------- | --- | ---------------------------- |
| **角色職位**     | integer | 否   | 依角色篩選，未傳則回傳全部                |
| **關鍵字**    | string  | 否   | 搜尋 **姓名** / **電子信箱**（ILIKE）  |

## 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_accounts = true`
2. 查詢 tb_users，LEFT JOIN tb_user_roles + tb_roles
3. 若傳入 **角色職位**，過濾對應角色
4. 若傳入 **關鍵字**，過濾 **姓名** ILIKE 或 **電子信箱** ILIKE
5. 依 tb_users 建立時間升冪排序

## 傳回結果

**Response 200**
```json
[
  {
    "name": "Rex Shen",
    "email": "rexshen@mpinfo.com.tw",
    "is_active": true,
    "roles": [
      { "name": "管理員" }
    ]
  }
]
```

**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_accounts` 權限
