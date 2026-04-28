# TDD：[SD] 實作[使用者]維護功能

## 工作項目

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| # | 類型 | 名稱 | 說明 |
|---|------|------|------|
| 1 | API | fn_user_query_api | 實作查詢使用者清單 API（GET /api/users）；依角色、關鍵字篩選，LEFT JOIN tb_user_roles |
| 2 | API | fn_user_add_api | 實作新增使用者 API（POST /api/users）；bcrypt 雜湊密碼，寫入 tb_users + tb_user_roles |
| 3 | API | fn_user_update_api | 實作修改使用者 API（PATCH /api/users/{email}）；更新 tb_users，重設 tb_user_roles |
| 4 | API | fn_user_del_api | 實作刪除使用者 API（DELETE /api/users/{email}）；刪除 tb_user_roles 再刪 tb_users |
| 5 | 畫面 | fn_user_01_list | 實作使用者查詢畫面；含角色篩選列、關鍵字搜尋、清單、修改／刪除操作 |
| 6 | 畫面 | fn_user_02_form | 實作使用者新增／修改畫面；新增顯示密碼欄位，修改時不顯示密碼欄位 |

> Schema 無需異動：tb_users、tb_roles、tb_user_roles 已於 schema.md v2 定義完整。

**── AI 填寫結束 ──**

## 測試案例

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|---------|------|---------|
| T1 | API | 已登入、具 `can_manage_accounts` 權限、DB 存在 2 筆使用者 | GET /api/users（不帶篩選） | 200，data 回傳 2 筆，每筆含名稱、Email、角色陣列 |
| T2 | API | 已登入、具 `can_manage_accounts` 權限、DB 存在角色「管理員」及對應使用者 | GET /api/users?角色職位={管理員 role_id} | 200，data 僅回傳該角色的使用者 |
| T3 | API | 未帶 JWT Token | GET /api/users | 401，message「未登入或 Token 過期」 |
| T4 | API | 已登入、權限角色無 `can_manage_accounts` | GET /api/users | 403，message「您沒有執行此操作的權限」 |
| T5 | API | 已登入、具 `can_manage_accounts` 權限、DB 不存在 `new@test.com` | POST /api/users，body：名稱「Alice」、Email `new@test.com`、密碼 `Pass1234`、角色 `[1]` | 201，message「新增成功」；tb_users 新增一筆，tb_user_roles 新增對應紀錄 |
| T6 | API | 已登入、具 `can_manage_accounts` 權限 | POST /api/users，body：Email `bad-email`（格式錯誤） | 400，message「登入信箱格式不正確」 |
| T7 | API | 已登入、具 `can_manage_accounts` 權限、`dup@test.com` 已存在 | POST /api/users，body：Email `dup@test.com` | 400，message「此 Email 已被使用」 |
| T8 | API | 已登入、具 `can_manage_accounts` 權限 | POST /api/users，body：密碼 `short`（少於 8 字元） | 400，message「密碼最少 8 字元」 |
| T9 | API | 已登入、具 `can_manage_accounts` 權限 | POST /api/users，body：角色 `[]`（空陣列） | 400，message「角色未設定」 |
| T10 | API | 已登入、具 `can_manage_accounts` 權限、`alice@test.com` 存在 | PATCH /api/users/alice@test.com，body：名稱「Alice Updated」、角色 `[1,2]` | 200，message「更新成功」；tb_users 更新名稱，tb_user_roles 重設為 [1,2] |
| T11 | API | 已登入、具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@test.com，body：名稱「X」 | 404，message「使用者不存在」 |
| T12 | API | 已登入、具 `can_manage_accounts` 權限、`bob@test.com` 已存在 | PATCH /api/users/alice@test.com，body：Email `bob@test.com` | 400，message「此 Email 已被其他帳號使用」 |
| T13 | API | 已登入、具 `can_manage_accounts` 權限、`target@test.com` 存在 | DELETE /api/users/target@test.com | 200，message「刪除成功」；tb_user_roles 對應紀錄刪除，tb_users 紀錄刪除 |
| T14 | API | 已登入、具 `can_manage_accounts` 權限 | DELETE /api/users/notexist@test.com | 404，message「使用者不存在」 |
| T15 | API | 已登入（以 `self@test.com` 登入）、具 `can_manage_accounts` 權限 | DELETE /api/users/self@test.com | 400，message「無法刪除自己的帳號」 |
| T16 | 畫面 | 已登入、具 `can_manage_accounts` 權限、DB 存在多筆使用者與角色 | 進入查詢畫面 → 角色篩選選「管理員」→ 點擊 [套用] | 清單僅顯示「管理員」角色使用者；各列顯示姓名、電子信箱、角色 badge |
| T17 | 畫面 | 已登入、具 `can_manage_accounts` 權限 | 進入查詢畫面 → 點擊某列 [刪除] → 確認提示顯示 → 點擊確認 | 該筆使用者從清單消失，清單自動重新整理 |
| T18 | 畫面 | 已登入、具 `can_manage_accounts` 權限、DB 存在至少一個角色 | 點擊 [新增帳號] → 填寫名稱、Email、密碼（≥8字元）、勾選至少一個角色 → 點擊 [儲存] | 新增成功，自動跳回查詢畫面，清單出現新增帳號 |
| T19 | 畫面 | 已登入、具 `can_manage_accounts` 權限、`alice@test.com` 存在 | 點擊 `alice@test.com` 列的 [修改] → 修改畫面開啟 | 修改畫面標題為「修改帳號」，名稱、Email、角色帶入現有資料，**密碼**欄位不顯示 |
| T20 | 畫面 | 已登入、具 `can_manage_accounts` 權限、修改畫面已開啟 | 修改名稱後點擊 [儲存] | 更新成功，跳回查詢畫面，清單顯示更新後名稱 |

**── AI 填寫結束 ──**

> 最低要求：每個 API 至少一個成功案例（2xx）+ 一個失敗案例（4xx/5xx）；每個畫面至少一個主流程案例
