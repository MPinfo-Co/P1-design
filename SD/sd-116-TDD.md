# TDD：[SD] 實作「角色」功能

## 工作項目

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | API | 確認 fn_role_query_api：GET /api/roles 查詢角色清單（含角色名稱、使用者名稱） | Spec/fn_role/Api/fn_role_query_api.md |
| 2 | API | 確認 fn_role_add_api：POST /api/roles 新增角色（含角色名稱、成員） | Spec/fn_role/Api/fn_role_add_api.md |
| 3 | API | 確認 fn_role_update_api：PATCH /api/roles/{name} 修改角色（含角色名稱、成員） | Spec/fn_role/Api/fn_role_update_api.md |
| 4 | API | 確認 fn_role_del_api：DELETE /api/roles/{name} 刪除角色並清除關聯資料 | Spec/fn_role/Api/fn_role_del_api.md |
| 5 | API | 確認 fn_role_options_api：GET /api/roles/options 輕量選項清單（供其他功能使用） | Spec/fn_role/Api/fn_role_options_api.md |
| 6 | 畫面 | 確認 fn_role_01_list：角色清單畫面（關鍵字篩選、角色名稱、使用者欄位、修改／刪除按鈕） | Spec/fn_role/fn_role_01_list.md |
| 7 | 畫面 | 確認 fn_role_02_form：角色表單畫面（角色名稱、成員） | Spec/fn_role/fn_role_02_form.md |
| 8 | Test | 確認 fn_role API 測試規格檔案完整 | Spec/fn_role/Api/_fn_role_test_api.md |

**── AI 填寫結束 ──**

## 測試案例

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | API | 已登入且具 `can_manage_roles` 權限，DB 有多筆角色 | GET /api/roles | 200，data 包含每筆角色名稱及使用者陣列 |
| T2 | API | 已登入但無 `can_manage_roles` 權限 | GET /api/roles | 403 您沒有執行此操作的權限 |
| T3 | API | 已登入且具 `can_manage_roles` 權限，DB 有名稱含「管理員」的角色 | GET /api/roles?keyword=管理員 | 200，data 只包含名稱含「管理員」的角色 |
| T4 | API | 已登入且具 `can_manage_roles` 權限，角色名稱「測試角色」不存在 | POST /api/roles，傳入有效角色名稱「測試角色」 | 201 新增成功 |
| T5 | API | 已登入且具 `can_manage_roles` 權限，角色名稱「測試角色」已存在 | POST /api/roles，傳入角色名稱「測試角色」 | 400 此角色名稱已存在 |
| T6 | API | 已登入且具 `can_manage_roles` 權限 | POST /api/roles，角色名稱傳入空字串 | 400 角色名稱未填寫 |
| T7 | API | 已登入且具 `can_manage_roles` 權限，角色「測試角色」存在 | PATCH /api/roles/測試角色，傳入新角色名稱「修改後角色」 | 200 更新成功 |
| T8 | API | 已登入且具 `can_manage_roles` 權限 | PATCH /api/roles/不存在的角色，傳入任意名稱 | 404 角色不存在 |
| T9 | API | 已登入且具 `can_manage_roles` 權限，「角色A」「角色B」均存在 | PATCH /api/roles/角色A，角色名稱傳入「角色B」 | 400 此角色名稱已被其他角色使用 |
| T10 | API | 已登入且具 `can_manage_roles` 權限，角色「待刪角色」存在 | DELETE /api/roles/待刪角色 | 200 刪除成功，tb_roles 及關聯資料表（tb_user_roles）對應紀錄移除 |
| T11 | API | 已登入且具 `can_manage_roles` 權限 | DELETE /api/roles/不存在的角色 | 404 角色不存在 |
| T12 | API | 已登入（任意權限） | GET /api/roles/options | 200，data 為 `[{ id, name }]` 陣列，依名稱升冪排序 |
| T13 | API | 未登入 | GET /api/roles/options | 401 未登入或 Token 過期 |
| T14 | 畫面 | 已登入且具 `can_manage_roles` 權限，清單有多筆角色 | 開啟角色清單畫面 → 輸入關鍵字 → 點擊 [套用] | 清單僅顯示角色名稱含關鍵字的筆數，無法匹配時顯示空清單 |
| T15 | 畫面 | 已登入且具 `can_manage_roles` 權限 | 點擊 [新增角色] → 填入角色名稱 → 勾選成員 → 點擊 [儲存] | 表單關閉，清單刷新，新角色出現於清單末尾 |
| T16 | 畫面 | 已登入且具 `can_manage_roles` 權限，清單有角色資料 | 點擊某角色的 [修改] → 修改角色名稱 → 點擊 [儲存] | 表單帶入原有資料（含成員勾選狀態）；儲存後表單關閉，清單刷新，角色名稱已更新 |
| T17 | 畫面 | 已登入且具 `can_manage_roles` 權限，清單有角色資料 | 點擊某角色的 [刪除] → 確認提示彈出 → 點擊 [確認刪除] | 清單中該角色移除；點擊 [取消] 則關閉提示，清單不變 |

**── AI 填寫結束 ──**
