# TDD：[SD] 實作[使用者]維護功能

## 工作項目

| # | 類型 | 名稱 | 說明 |
|---|------|------|------|
| 1 | Schema | 建立 tb_users、tb_user_roles | 含 is_active（BOOLEAN, NOT NULL, DEFAULT TRUE）欄位，建立 migration |
| 2 | API | 實作 fn_user_query_api | GET /api/users，支援角色職位篩選與關鍵字（姓名/Email）搜尋，回傳 is_active 狀態 |
| 3 | API | 實作 fn_user_add_api | POST /api/users，密碼 bcrypt hash，寫入 tb_users（is_active=true）及 tb_user_roles |
| 4 | API | 實作 fn_user_update_api | PATCH /api/users/{email}，僅更新傳入欄位，角色採先刪後寫 |
| 5 | API | 實作 fn_user_del_api | DELETE /api/users/{email}，含自我刪除防護，同步刪除 tb_user_roles |
| 6 | API | 實作 fn_user_toggle_api | PATCH /api/users/{email}/status，停用/啟用帳號，更新 tb_users.is_active |
| 7 | 畫面 | 實作 fn_user_01_list | 使用者清單，含姓名、Email、角色、狀態四欄；停用列淡色樣式；操作欄含修改、停用/啟用、刪除按鈕 |
| 8 | 畫面 | 實作 fn_user_02_form | 新增/修改帳號表單；修改模式下 Email 欄位唯讀、密碼欄位隱藏 |

## 測試案例

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|----------|------|----------|
| T1 | API | 已登入且具 `can_manage_accounts` 權限 | GET /api/users | 200，data 包含每位使用者的姓名、Email、is_active、角色陣列 |
| T2 | API | 已登入但無 `can_manage_accounts` 權限 | GET /api/users | 403 您沒有執行此操作的權限 |
| T3 | API | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，傳入有效姓名、Email、密碼（≥ 8 字元）、至少一個角色 | 201 新增成功 |
| T4 | API | 已登入且具 `can_manage_accounts` 權限，系統中 Email 已存在 | POST /api/users，傳入相同 Email | 400 此 Email 已被使用 |
| T5 | API | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
| T6 | API | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，角色陣列為空 | 400 角色未設定 |
| T7 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，傳入有效新姓名 | 200 更新成功，tb_users 對應紀錄姓名更新 |
| T8 | API | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com，傳入任意姓名 | 404 使用者不存在 |
| T9 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者存在且非操作者本身 | DELETE /api/users/{email} | 200 刪除成功，tb_users 及 tb_user_roles 對應紀錄移除 |
| T10 | API | 已登入且具 `can_manage_accounts` 權限 | DELETE /api/users/{操作者自己的 email} | 400 無法刪除自己的帳號 |
| T11 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者目前為啟用（is_active: true） | PATCH /api/users/{email}/status，body: `{ "is_active": false }` | 200 停用成功，tb_users.is_active 更新為 false |
| T12 | API | 已登入且具 `can_manage_accounts` 權限，目標使用者目前為停用（is_active: false） | PATCH /api/users/{email}/status，body: `{ "is_active": true }` | 200 啟用成功，tb_users.is_active 更新為 true |
| T13 | API | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com/status | 404 使用者不存在 |
| T14 | 畫面 | 已登入，使用者清單含啟用帳號與停用帳號各一筆 | 開啟使用者管理畫面 | 清單含姓名、電子信箱、角色、狀態四欄；停用帳號整列以淡色樣式呈現；操作欄顯示修改、停用（或啟用）、刪除三個按鈕 |
| T15 | 畫面 | 已登入，點擊「新增帳號」 | 填寫有效姓名、Email、密碼、至少勾選一個角色，點擊「儲存」 | 呼叫 fn_user_add_api → 成功後關閉表單，清單重新整理，新帳號出現於清單 |
| T16 | 畫面 | 已登入，清單中有使用者資料 | 點擊某使用者的「修改」按鈕，開啟修改表單 | Email 欄位為唯讀，密碼欄位不顯示；可修改姓名及角色；點擊「儲存」呼叫 fn_user_update_api → 成功後關閉表單，清單重新整理 |
| T17 | 畫面 | 已登入，清單中有啟用中使用者（姓名「王小明」） | 點擊該使用者操作欄的「停用」按鈕 | 顯示確認提示「確定要停用 王小明？停用後該帳號將無法登入」；確認後呼叫 fn_user_toggle_api，清單即時更新狀態為停用並套用淡色樣式；取消則不執行 |
| T18 | 畫面 | 已登入，清單中有使用者（姓名「王小明」） | 點擊該使用者操作欄的「刪除」按鈕 | 顯示確認提示「確定要刪除 王小明？此操作無法還原」；確認後呼叫 fn_user_del_api，清單移除該筆資料；取消則不執行 |

> 最低要求：每個 API 至少一個成功案例（2xx）+ 一個失敗案例（4xx/5xx）；每個畫面至少一個主流程案例
