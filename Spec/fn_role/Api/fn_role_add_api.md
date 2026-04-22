# 介面說明

| 項目       | 內容                                     |
| -------- | ---------------------------------------- |
| Method   | POST                                     |
| Endpoint | /api/roles                               |

# 傳入參數

## 參數類型：Request Body

| 欄位             | 型別        | 必填  | 說明                    |
| -------------- | --------- | --- | --------------------- |
| **角色名稱**       | string    | 是   | 系統內不可重複               |
| **成員帳號**       | integer[] | 否   | 指派至此角色的使用者            |
| **可用 AI 夥伴**   | integer[] | 否   | 此角色可使用的 AI 夥伴         |
| **可存取知識庫**     | integer[] | 否   | 此角色可存取的知識庫            |
| **功能權限**       | object    | 否   | 見下方結構                 |

**功能權限結構**

| 欄位               | 型別      | 說明              |
| ---------------- | ------- | --------------- |
| ai_partner       | boolean | AI 夥伴使用權        |
| manage_accounts  | boolean | 帳號管理權           |
| manage_roles     | boolean | 角色管理權           |
| edit_ai          | boolean | AI 夥伴管理權        |

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_roles = true`
2. 確認 **角色名稱** 在 tb_roles 中不重複
3. 寫入 tb_roles
4. 逐筆寫入 tb_user_roles（成員帳號）
5. 逐筆寫入 tb_role_ai_partners（可用 AI 夥伴）
6. 逐筆寫入 tb_role_kb_map（可存取知識庫）

# 傳回結果

| Response | Message        | Result Field |
| -------- | -------------- | ------------ |
| 201      | 新增成功           | 無            |
| 400      | 欄位驗證失敗         | 無            |
| 400      | 此角色名稱已存在       | 無            |
| 401      | 未登入或 Token 過期 | 無            |
| 403      | 您沒有執行此操作的權限    | 無            |
