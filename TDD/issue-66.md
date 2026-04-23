# TDD：[SD] 實作[使用者]維護功能

## 工作項目

| # | 類型 | 名稱 | 說明 |
|---|------|------|------|
| 1 | Schema | 建立 tb_users、tb_user_roles | 含 is_active（BOOLEAN, NOT NULL, DEFAULT TRUE）欄位，建立 migration |
| 2 | API | 實作 fn_user_query_api | GET /api/users，支援角色職位篩選與關鍵字（姓名/Email）搜尋 |
| 3 | API | 實作 fn_user_add_api | POST /api/users，密碼 bcrypt hash，寫入 tb_users（is_active=true）及 tb_user_roles |
| 4 | API | 實作 fn_user_update_api | PATCH /api/users/{email}，僅更新傳入欄位，角色採先刪後寫 |
| 5 | API | 實作 fn_user_del_api | DELETE /api/users/{email}，含自我刪除防護，同步刪除 tb_user_roles |
| 6 | 畫面 | 實作 fn_user_01_list | 使用者清單，含姓名、Email、角色欄；操作欄含修改、刪除按鈕 |
| 7 | 畫面 | 實作 fn_user_02_form | 新增/修改帳號表單；修改模式下密碼欄位隱藏 |
| 8 | Test | 新增 _fn_user_test_api.md | 新增使用者 API 測試規格，涵蓋 query/add/update/del |
