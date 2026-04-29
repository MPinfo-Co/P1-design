# fn_role API 測試規格

| ID  | API                          | 前置條件                                                     | 操作                                          | 預期結果                                                              |
| --- | ---------------------------- | -------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| T1  | GET /api/roles               | 已登入且使用者角色具備 fn_role 功能權限，DB 有多筆角色                        | GET /api/roles                              | 200，data 包含每筆角色名稱、使用者陣列及 functions 陣列                             |
| T2  | GET /api/roles               | 已登入但使用者角色不具備 fn_role 功能權限                               | GET /api/roles                              | 403 您沒有執行此操作的權限                                                   |
| T3  | GET /api/roles               | 已登入且使用者角色具備 fn_role 功能權限，DB 有名稱含「管理員」的角色                 | GET /api/roles?keyword=管理員                  | 200，data 只包含名稱含「管理員」的角色                                           |
| T4  | POST /api/roles              | 已登入且使用者角色具備 fn_role 功能權限，角色名稱「測試角色」不存在                  | POST /api/roles，傳入角色名稱「測試角色」、function_ids [1] | 201 新增成功                                                          |
| T5  | POST /api/roles              | 已登入且使用者角色具備 fn_role 功能權限，角色名稱「測試角色」已存在                  | POST /api/roles，傳入角色名稱「測試角色」                | 400 此角色名稱已存在                                                      |
| T6  | POST /api/roles              | 已登入且使用者角色具備 fn_role 功能權限                                 | POST /api/roles，角色名稱傳入空字串                   | 400 角色名稱未填寫                                                       |
| T7  | PATCH /api/roles/{name}      | 已登入且使用者角色具備 fn_role 功能權限，角色「測試角色」存在                      | PATCH /api/roles/測試角色，傳入新角色名稱「修改後角色」、function_ids [2] | 200 更新成功                                                          |
| T8  | PATCH /api/roles/{name}      | 已登入且使用者角色具備 fn_role 功能權限                                 | PATCH /api/roles/不存在的角色，傳入任意名稱              | 404 角色不存在                                                         |
| T9  | PATCH /api/roles/{name}      | 已登入且使用者角色具備 fn_role 功能權限，「角色A」「角色B」均存在                   | PATCH /api/roles/角色A，角色名稱傳入「角色B」            | 400 此角色名稱已被其他角色使用                                                 |
| T10 | DELETE /api/roles/{name}     | 已登入且使用者角色具備 fn_role 功能權限，角色「待刪角色」存在                      | DELETE /api/roles/待刪角色                      | 200 刪除成功，tb_roles、tb_role_function 及 tb_user_roles 中對應紀錄均移除       |
| T11 | DELETE /api/roles/{name}     | 已登入且使用者角色具備 fn_role 功能權限                                 | DELETE /api/roles/不存在的角色                    | 404 角色不存在                                                         |
