# 介面說明

| 項目       | 內容                                     |
| -------- | ---------------------------------------- |
| Method   | GET                                      |
| Endpoint | /api/roles                               |

# 傳入參數

## 參數類型：Query Parameter

| 參數        | 型別     | 必填  | 說明                  |
| --------- | ------ | --- | ------------------- |
| **關鍵字**   | string | 否   | 搜尋 **角色名稱**（ILIKE）   |

# 處理邏輯

1. 驗證 JWT，確認使用者具 `can_manage_roles = true`
2. 查詢 tb_roles，LEFT JOIN tb_role_ai_partners + tb_ai_partners
3. 若傳入 **關鍵字**，過濾 **角色名稱** ILIKE
4. 依 tb_roles 建立時間升冪排序

# 傳回結果

**Response 200**：查詢成功，`data` 為陣列，每筆結構如下

| 欄位              | 型別       | 說明                       |
| --------------- | -------- | ------------------------ |
| **角色名稱**        | string   | 角色顯示名稱                   |
| AI 夥伴使用權        | boolean  | 可使用 AI 夥伴進行分析            |
| 帳號管理權           | boolean  | 可新增、修改、刪除使用者帳號           |
| 角色管理權           | boolean  | 可新增、修改、刪除角色與權限           |
| AI 夥伴管理權        | boolean  | 可調整 AI 夥伴設定與綁定知識庫        |
| **可用 AI 夥伴**    | string[] | 夥伴名稱清單                   |

**Response 401**：未登入或 Token 過期
**Response 403**：您沒有執行此操作的權限
