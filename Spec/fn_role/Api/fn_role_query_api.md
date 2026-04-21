# 介面說明

| 項目       | 內容                                     |
| -------- | ---------------------------------------- |
| Method   | GET                                      |
| Endpoint | /api/roles                               |

# 傳入參數

| 參數        | 型別     | 必填  | 說明                  |
| --------- | ------ | --- | ------------------- |
| **關鍵字**   | string | 否   | 搜尋 **角色名稱**（ILIKE）   |

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_roles = true`
2. 查詢 tb_roles，LEFT JOIN tb_role_ai_partners + tb_ai_partners
3. 若傳入 **關鍵字**，過濾 **角色名稱** ILIKE
4. 依 tb_roles 建立時間升冪排序

# 傳回結果

**Response 200**
```json
[
  {
    "name": "管理員",
    "can_access_ai": true,
    "can_manage_accounts": true,
    "can_manage_roles": true,
    "can_edit_ai": true,
    "ai_partners": ["資安專家"]
  }
]
```

**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_roles` 權限
