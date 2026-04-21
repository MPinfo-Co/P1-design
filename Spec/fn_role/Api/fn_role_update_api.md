# 介面說明

| 項目       | 內容                                     |
| -------- | ---------------------------------------- |
| Method   | PATCH                                    |
| Endpoint | /api/roles/{name}                        |

# 傳入參數

參數類型：Path Parameter

| 參數        | 型別     | 說明      |
| --------- | ------ | ------- |
| **角色名稱**  | string | 目標角色識別  |

參數類型：Request Body

| 欄位             | 型別        | 必填  | 說明                            |
| -------------- | --------- | --- | ----------------------------- |
| **角色名稱**       | string    | 否   | 新名稱，需不與其他角色重複                 |
| **成員帳號**       | integer[] | 否   | 傳入則整組取代現有成員                   |
| **可用 AI 夥伴**   | integer[] | 否   | 傳入則整組取代現有設定                   |
| **可存取知識庫**     | integer[] | 否   | 傳入則整組取代現有設定                   |
| **功能權限**       | object    | 否   | 傳入則整組取代現有設定（結構同新增）            |

> 僅傳入需修改的欄位，未傳入欄位保持不變。

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_roles = true`
2. 確認 **角色名稱**（path）對應的角色存在
3. 若傳入新 **角色名稱**，確認不與其他角色重複
4. 更新 tb_roles 對應欄位
5. 若傳入 **成員帳號**，重新寫入 tb_user_roles
6. 若傳入 **可用 AI 夥伴**，重新寫入 tb_role_ai_partners
7. 若傳入 **可存取知識庫**，重新寫入 tb_role_kb_map

# 傳回結果

**Response 200**
```json
{
  "name": "資安分析師",
  "can_access_ai": true,
  "can_manage_accounts": false,
  "can_manage_roles": false,
  "can_edit_ai": false,
  "ai_partners": ["資安專家"]
}
```

**Response 400**：欄位驗證失敗
**Response 401**：未登入或 Token 過期
**Response 403**：無 `can_manage_roles` 權限
**Response 404**：角色不存在
**Response 409**：**角色名稱**已被其他角色使用
