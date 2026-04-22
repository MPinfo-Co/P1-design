# 介面說明

| 項目       | 內容                                     |
| -------- | ---------------------------------------- |
| Method   | DELETE                                   |
| Endpoint | /api/roles/{name}                        |

# 傳入參數

## 參數類型：Path Parameter

| 參數        | 型別     | 說明      |
| --------- | ------ | ------- |
| **角色名稱**  | string | 目標角色識別  |

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_roles = true`
2. 確認 **角色名稱** 對應的角色存在
3. 刪除 tb_user_roles 中該角色的所有成員關聯
4. 刪除 tb_role_ai_partners 中該角色的所有設定
5. 刪除 tb_role_kb_map 中該角色的所有設定
6. 刪除 tb_roles 中該筆紀錄

# 傳回結果

**Response 200**：刪除成功
**Response 401**：未登入或 Token 過期
**Response 403**：您沒有執行此操作的權限
**Response 404**：角色不存在
