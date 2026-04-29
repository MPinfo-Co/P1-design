# fn_role_query_api規格

## 介面說明

| 項目       | 內容         |
| -------- | ---------- |
| Method   | GET        |
| Endpoint | /api/roles |

## 傳入參數

### 參數類型：Query Parameter

| 參數        | 型別     | 必填  |
| --------- | ------ | --- |
| **關鍵字**   | string | 否   |

## 處理邏輯

### 檢核

| 檢核項目  | 失敗條件                | 回應訊息                  |
| ----- | ------------------- | --------------------- |
| JWT 驗證 | 未登入或 Token 過期       | 401 未登入或 Token 過期     |
| 權限    | 使用者角色不具備 fn_role 功能權限 | 403 您沒有執行此操作的權限       |

### 執行

- 查詢 tb_roles，LEFT JOIN tb_user_roles + tb_users
- LEFT JOIN tb_role_function + tb_functions 取得 functions[]
- 若傳入 **關鍵字**，過濾 **角色名稱** ILIKE
- 依 tb_roles 建立時間升冪排序

## 傳回結果

| Response | Message | data                        |
| -------- | ------- | --------------------------- |
| 200      | 查詢成功    | 角色名稱, 使用者[], functions[]     |
| 4xx      | 依據檢核邏輯  | 無                           |
