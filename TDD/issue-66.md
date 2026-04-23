# TDD：[SD] 實作[使用者]維護功能

## 工作項目

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| # | 類型 | 名稱 | 說明 |
|---|------|------|------|
| 1 | API | 新增 fn_user_toggle_api | 停用／啟用為獨立語義操作，現有 fn_user_update_api 的 Request Body 不含 `is_active`，需新增 PATCH /api/users/{email}/status |
| 2 | 畫面 | 修改 fn_user_01_list（查詢畫面）| 現有規格缺少：清單**狀態**欄、操作欄的**停用**/**啟用**按鈕、停用列淡色樣式，需補充 |
| 3 | 畫面 | 修改 fn_user_02_form（新增/修改畫面）| 畫面差異表格未明確標示修改模式下 **Email** 欄位唯讀，需補充說明 |

**── AI 填寫結束 ──**

## 測試案例

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|----------|------|----------|
| T1 | API | 已登入且具 `can_manage_accounts` 權限 | GET /api/users | 200，data 包含每位使用者的姓名、Email、啟用狀態、角色陣列 |
| T2 | API | 已登入但無 `can_manage_accounts` 權限 | GET /api/users | 403 您沒有執行此操作的權限 |
| T3 | API | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，傳入有效姓名、Email、密碼（≥ 8 字元）、至少一個角色 | 201 新增成功 |
| T4 | API | 已登入且具 `can_manage_accounts` 權限，系統中 Email 已存在 | POST /api/users，傳入相同 Email | 400 此 Email 已被使用 |
| T5 | API | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
| T6 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，傳入有效新姓名 | 200 更新成功，tb_users 對應紀錄姓名更新 |
| T7 | API | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com，傳入任意姓名 | 404 使用者不存在 |
| T8 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者存在且非操作者本身 | DELETE /api/users/{email} | 200 刪除成功，tb_users 及 tb_user_roles 對應紀錄移除 |
| T9 | API | 已登入且具 `can_manage_accounts` 權限 | DELETE /api/users/{操作者自己的 email} | 400 無法刪除自己的帳號 |
| T10 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者目前為啟用（is_active: true） | PATCH /api/users/{email}/status，body: `{ "is_active": false }` | 200 停用成功，tb_users.is_active 更新為 false |
| T11 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者目前為停用（is_active: false） | PATCH /api/users/{email}/status，body: `{ "is_active": true }` | 200 啟用成功，tb_users.is_active 更新為 true |
| T12 | API | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com/status | 404 使用者不存在 |
| T13 | 畫面 | 已登入，使用者清單含啟用帳號與停用帳號各一筆 | 開啟使用者管理畫面 | 清單含**姓名**、**電子信箱**、**角色**、**狀態**四欄；停用帳號整列以淡色樣式呈現，狀態欄標示「停用」；操作欄顯示修改、停用（或啟用）、刪除三個按鈕 |
| T14 | 畫面 | 已登入，點擊「新增帳號」 | 填寫有效姓名、Email、密碼、至少勾選一個角色，點擊「儲存」 | 呼叫 fn_user_add_api → 成功後關閉表單，清單重新整理，新帳號出現於清單 |
| T15 | 畫面 | 已登入，清單中有使用者資料 | 點擊某使用者的「修改」按鈕，開啟修改表單 | Email 欄位為唯讀，不可輸入；可修改姓名及角色；點擊「儲存」呼叫 fn_user_update_api → 成功後關閉表單，清單重新整理 |
| T16 | 畫面 | 已登入，清單中有啟用中使用者（姓名「王小明」） | 點擊該使用者操作欄的「停用」按鈕 | 顯示確認提示「確定要停用 王小明？停用後該帳號將無法登入」；點擊確認後呼叫 fn_user_toggle_api，清單即時更新該列狀態為停用並套用淡色樣式；點擊取消則不執行任何動作 |
| T17 | 畫面 | 已登入，清單中有使用者（姓名「王小明」） | 點擊該使用者操作欄的「刪除」按鈕 | 顯示確認提示「確定要刪除 王小明？此操作無法還原」；點擊確認後呼叫 fn_user_del_api，清單移除該筆資料；點擊取消則不執行任何動作 |

**── AI 填寫結束 ──**

> 最低要求：每個 API 至少一個成功案例（2xx）+ 一個失敗案例（4xx/5xx）；每個畫面至少一個主流程案例
