# SpecDiff：Issue #116 實作「角色」功能

## 修改項目及內容
- **Prototype/fn_role.html**（modified，+20 -3）
```diff
@@ -50,7 +50,18 @@ <h3 id="rModalTitle" style="margin-bottom:16px; flex-shrink:0; color:#1e293b;">
                     </div>
                     <div id="r_users_checks" style="border:1px solid #e2e8f0; border-radius:8px; padding:4px; background:#f8fafc; max-height:110px; overflow-y:auto;"></div>
                 </div>
-<<<<<<< HEAD
+                <!-- 功能權限 -->
+                <div style="padding:14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
+                    <label style="font-weight:700; display:block; margin-bottom:12px; color:#1e293b; font-size:14px;">功能權限</label>
+                    <label class="permission-item" style="display:flex; align-items:center; gap:10px; padding:8px; border-radius:6px; background:white; border:1px solid #e2e8f0; margin-bottom:8px;">
+                        <input type="checkbox" id="p_manage_accounts" style="width:16px;height:16px;accent-color:#2e3f6e;cursor:pointer;">
+                        <span><strong style="display:block;font-size:13px;">使用者管理</strong><small style="color:#64748b;">可新增、修改、刪除使用者</small></span>
+                    </label>
+                    <label class="permission-item" style="display:flex; align-items:center; gap:10px; padding:8px; border-radius:6px; background:white; border:1px solid #e2e8f0;">
+                        <input type="checkbox" id="p_manage_roles" style="width:16px;height:16px;accent-color:#2e3f6e;cursor:pointer;">
+                        <span><strong style="display:block;font-size:13px;">角色管理</strong><small style="color:#64748b;">可新增、修改、刪除角色與權限</small></span>
+                    </label>
+                </div>
 
             </div>
             <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; flex-shrink:0; padding-top:15px; border-top:1px solid #e2e8f0;">
@@ -105,6 +116,8 @@ <h3 id="rModalTitle" style="margin-bottom:16px; flex-shrink:0; color:#1e293b;">
             currentEditingRoleId = null;
             document.getElementById('rModalTitle').innerText = '新增角色';
             document.getElementById('r_name').value = '';
+            document.getElementById('p_manage_accounts').checked = false;
+            document.getElementById('p_manage_roles').checked = false;
             renderRoleUserChecks([]);
             document.getElementById('roleModal').style.display = 'flex';
         }
@@ -116,23 +129,27 @@ <h3 id="rModalTitle" style="margin-bottom:16px; flex-shrink:0; color:#1e293b;">
         currentEditingRoleId = id;
         document.getElementById('rModalTitle').innerText = '編輯角色';
         document.getElementById('r_name').value = r.name;
+        document.getElementById('p_manage_accounts').checked = r.canManageAccounts || false;
+        document.getElementById('p_manage_roles').checked = r.canManageRoles || false;
         const currentMembers = allUsers.filter(u => (u.roles || []).includes(r.name)).map(u => u.id);
         renderRoleUserChecks(currentMembers);
         document.getElementById('roleModal').style.display = 'flex';
     }
 
     function saveRole() {
         const name = document.getElementById('r_name').value;
+        const canManageAccounts = document.getElementById('p_manage_accounts').checked;
+        const canManageRoles = document.getElementById('p_manage_roles').checked;
         if (!name) { alert('請輸入角色名稱'); return; }
         const selectedUserIds = Array.from(document.querySelectorAll('.role-user-check:checked')).map(cb => parseInt(cb.value));
         let oldName = null;
         if (currentEditingRoleId) {
             const idx = allRoles.findIndex(r => r.id === currentEditingRoleId);
             oldName = allRoles[idx].name;
-            allRoles[idx] = { ...allRoles[idx], name };
+            allRoles[idx] = { ...allRoles[idx], name, canManageAccounts, canManageRoles };
             currentEditingRoleId = null;
         } else {
-            allRoles.push({ id: Date.now(), name });
+            allRoles.push({ id: Date.now(), name, canManageAccounts, canManageRoles });
         }
         allUsers.forEach(u => {
             let roles = (u.roles || []).filter(r => r !== (oldName || name));
```

- **Spec/fn_role/Api/_fn_role_test_api.md**（added，+15 -0）
```diff
@@ -0,0 +1,15 @@
+# fn_role API 測試規格
+
+| ID  | API                          | 前置條件                                                     | 操作                                          | 預期結果                                                              |
+| --- | ---------------------------- | -------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
+| T1  | GET /api/roles               | 已登入且使用者角色具備 fn_role 功能權限，DB 有多筆角色                        | GET /api/roles                              | 200，data 包含每筆角色名稱、使用者陣列及 functions 陣列                             |
+| T2  | GET /api/roles               | 已登入但使用者角色不具備 fn_role 功能權限                               | GET /api/roles                              | 403 您沒有執行此操作的權限                                                   |
+| T3  | GET /api/roles               | 已登入且使用者角色具備 fn_role 功能權限，DB 有名稱含「管理員」的角色                 | GET /api/roles?keyword=管理員                  | 200，data 只包含名稱含「管理員」的角色                                           |
+| T4  | POST /api/roles              | 已登入且使用者角色具備 fn_role 功能權限，角色名稱「測試角色」不存在                  | POST /api/roles，傳入角色名稱「測試角色」、function_ids [1] | 201 新增成功                                                          |
+| T5  | POST /api/roles              | 已登入且使用者角色具備 fn_role 功能權限，角色名稱「測試角色」已存在                  | POST /api/roles，傳入角色名稱「測試角色」                | 400 此角色名稱已存在                                                      |
+| T6  | POST /api/roles              | 已登入且使用者角色具備 fn_role 功能權限                                 | POST /api/roles，角色名稱傳入空字串                   | 400 角色名稱未填寫                                                       |
+| T7  | PATCH /api/roles/{name}      | 已登入且使用者角色具備 fn_role 功能權限，角色「測試角色」存在                      | PATCH /api/roles/測試角色，傳入新角色名稱「修改後角色」、function_ids [2] | 200 更新成功                                                          |
+| T8  | PATCH /api/roles/{name}      | 已登入且使用者角色具備 fn_role 功能權限                                 | PATCH /api/roles/不存在的角色，傳入任意名稱              | 404 角色不存在                                                         |
+| T9  | PATCH /api/roles/{name}      | 已登入且使用者角色具備 fn_role 功能權限，「角色A」「角色B」均存在                   | PATCH /api/roles/角色A，角色名稱傳入「角色B」            | 400 此角色名稱已被其他角色使用                                                 |
+| T10 | DELETE /api/roles/{name}     | 已登入且使用者角色具備 fn_role 功能權限，角色「待刪角色」存在                      | DELETE /api/roles/待刪角色                      | 200 刪除成功，tb_roles、tb_role_function 及 tb_user_roles 中對應紀錄均移除       |
+| T11 | DELETE /api/roles/{name}     | 已登入且使用者角色具備 fn_role 功能權限                                 | DELETE /api/roles/不存在的角色                    | 404 角色不存在                                                         |
```

- **Spec/fn_role/Api/fn_function_options_api.md**（added，+34 -0）
```diff
@@ -0,0 +1,34 @@
+# fn_function_options_api規格
+
+## 介面說明
+
+| 項目       | 內容                      |
+| -------- | ----------------------- |
+| Method   | GET                     |
+| Endpoint | /api/functions/options  |
+
+> 輕量選項端點，供其他功能（如角色管理）取得功能清單。需登入，不需特定管理權限。
+
+## 傳入參數
+
+無。
+
+## 處理邏輯
+
+### 檢核
+
+| 檢核項目  | 失敗條件          | 回應訊息              |
+| ----- | ------------- | ------------------- |
+| JWT 驗證 | 未登入或 Token 過期 | 401 未登入或 Token 過期 |
+
+### 執行
+
+- 查詢 tb_functions 所有紀錄
+- 依 function_id 升冪排序
+
+## 傳回結果
+
+| Response | Message | data                                      |
+| -------- | ------- | ----------------------------------------- |
+| 200      | 查詢成功    | `[{ function_id, function_name }]` 功能選項陣列 |
+| 4xx      | 依據檢核邏輯  | 無                                         |
```

- **Spec/fn_role/Api/fn_role_add_api.md**（modified，+6 -18）
```diff
@@ -11,22 +11,11 @@
 
 ### 參數類型：Request Body
 
-| 欄位             | 型別        | 必填  |
-| -------------- | --------- | --- |
+| 欄位        | 型別        | 必填  |
+| --------- | --------- | --- |
 | **角色名稱**       | string    | 是   |
-| **成員**       | integer[] | 否   |
-| **可用 AI 夥伴**   | integer[] | 否   |
-| **可存取知識庫**     | integer[] | 否   |
-| **功能權限**       | object    | 否   |
-
-**功能權限結構**
-
-| 欄位               | 型別      |
-| ---------------- | ------- |
-| ai_partner       | boolean |
-| manage_accounts  | boolean |
-| manage_roles     | boolean |
-| edit_ai          | boolean |
+| **成員**          | integer[] | 否   |
+| **function_ids** | integer[] | 否   |
 
 ## 處理邏輯
 
@@ -35,16 +24,15 @@
 | 檢核項目          | 失敗條件                | 回應訊息                  |
 | ------------- | ------------------- | --------------------- |
 | JWT 驗證        | 未登入或 Token 過期       | 401 未登入或 Token 過期     |
-| 權限            | 無 `can_manage_roles` | 403 您沒有執行此操作的權限       |
+| 權限            | 使用者角色不具備 fn_role 功能權限 | 403 您沒有執行此操作的權限       |
 | **角色名稱**      | 未填寫                 | 400 角色名稱未填寫           |
 | **角色名稱** 唯一性  | 已存在                 | 400 此角色名稱已存在          |
 
 ### 執行
 
 - 寫入 tb_roles
 - 逐筆寫入 tb_user_roles（成員）
-- 逐筆寫入 tb_role_ai_partners（可用 AI 夥伴）
-- 逐筆寫入 tb_role_kb_map（可存取知識庫）
+- 逐筆寫入 tb_role_function（function_ids）
 
 ## 傳回結果
 
```

- **Spec/fn_role/Api/fn_role_del_api.md**（modified，+2 -3）
```diff
@@ -22,14 +22,13 @@
 | 檢核項目  | 失敗條件                | 回應訊息                  |
 | ----- | ------------------- | --------------------- |
 | JWT 驗證 | 未登入或 Token 過期       | 401 未登入或 Token 過期     |
-| 權限    | 無 `can_manage_roles` | 403 您沒有執行此操作的權限       |
+| 權限    | 使用者角色不具備 fn_role 功能權限 | 403 您沒有執行此操作的權限       |
 | 角色存在  | 不存在                 | 404 角色不存在             |
 
 ### 執行
 
+- 刪除 tb_role_function 中該角色的所有功能關聯
 - 刪除 tb_user_roles 中該角色的所有成員關聯
-- 刪除 tb_role_ai_partners 中該角色的所有設定
-- 刪除 tb_role_kb_map 中該角色的所有設定
 - 刪除 tb_roles 中該筆紀錄
 
 ## 傳回結果
```

- **Spec/fn_role/Api/fn_role_query_api.md**（modified，+8 -6）
```diff
@@ -22,17 +22,19 @@
 | 檢核項目  | 失敗條件                | 回應訊息                  |
 | ----- | ------------------- | --------------------- |
 | JWT 驗證 | 未登入或 Token 過期       | 401 未登入或 Token 過期     |
-| 權限    | 無 `can_manage_roles` | 403 您沒有執行此操作的權限       |
+| 權限    | 使用者角色不具備 fn_role 功能權限 | 403 您沒有執行此操作的權限       |
 
 ### 執行
 
-- 查詢 tb_roles，LEFT JOIN tb_role_ai_partners + tb_ai_partners
+- 查詢 tb_roles
+- LEFT JOIN tb_user_roles + tb_users[]
+- LEFT JOIN tb_role_function + tb_functions 取得 functions[]
 - 若傳入 **關鍵字**，過濾 **角色名稱** ILIKE
 - 依 tb_roles 建立時間升冪排序
 
 ## 傳回結果
 
-| Response | Message  | data                                           |
-| -------- | -------- | ---------------------------------------------- |
-| 200      | 查詢成功     | 角色名稱, AI夥伴使用權, 使用者管理權, 角色管理權, AI夥伴管理權, 可用AI夥伴[] |
-| 4xx      | 依據檢核邏輯   | 無                                              |
+| Response | Message | data                        |
+| -------- | ------- | --------------------------- |
+| 200      | 查詢成功    | 角色名稱, 使用者[], functions[]     |
+| 4xx      | 依據檢核邏輯  | 無                           |
```

- **Spec/fn_role/Api/fn_role_update_api.md**（modified，+7 -10）
```diff
@@ -17,13 +17,11 @@
 
 ### 參數類型：Request Body
 
-| 欄位             | 型別        | 必填  |
-| -------------- | --------- | --- |
-| **角色名稱**       | string    | 否   |
-| **成員**       | integer[] | 否   |
-| **可用 AI 夥伴**   | integer[] | 否   |
-| **可存取知識庫**     | integer[] | 否   |
-| **功能權限**       | object    | 否   |
+| 欄位        | 型別        | 必填  |
+| --------- | --------- | --- |
+| **角色名稱**        | string    | 否   |
+| **成員**           | integer[] | 否   |
+| **function_ids** | integer[] | 否   |
 
 > 僅傳入需修改的欄位，未傳入欄位保持不變。
 
@@ -34,16 +32,15 @@
 | 檢核項目          | 失敗條件                | 回應訊息                  |
 | ------------- | ------------------- | --------------------- |
 | JWT 驗證        | 未登入或 Token 過期       | 401 未登入或 Token 過期     |
-| 權限            | 無 `can_manage_roles` | 403 您沒有執行此操作的權限       |
+| 權限            | 使用者角色不具備 fn_role 功能權限 | 403 您沒有執行此操作的權限       |
 | 角色存在          | 不存在                 | 404 角色不存在             |
 | **角色名稱** 唯一性  | 已被其他角色使用            | 400 此角色名稱已被其他角色使用     |
 
 ### 執行
 
 - 更新 tb_roles 對應欄位
 - 若傳入 **成員**，重新寫入 tb_user_roles
-- 若傳入 **可用 AI 夥伴**，重新寫入 tb_role_ai_partners
-- 若傳入 **可存取知識庫**，重新寫入 tb_role_kb_map
+- 若傳入 **function_ids**，重新寫入 tb_role_function
 
 ## 傳回結果
 
```

- **Spec/fn_role/fn_role_00_overview.md**（modified，+1 -4）
```diff
@@ -2,13 +2,10 @@
 
 ## 功能說明
 
-管理系統角色，包含新增、查詢、修改、刪除角色，以及設定角色的成員、可用 AI 夥伴、可存取知識庫與功能權限。
+管理系統角色，包含新增、查詢、修改、刪除角色，以及設定角色的成員與功能權限。
 
 雛形畫面：[▶ 開啟雛形](../../Prototype/fn_role.html)
 
-## 主要使用角色
-
-具備 `can_manage_roles` 權限的角色
 
 ## 畫面清單
 
```

- **Spec/fn_role/fn_role_01_list.md**（modified，+4 -4）
```diff
@@ -14,13 +14,13 @@
 
 | 欄位           | 顯示元件                 |
 | ------------ | -------------------- |
-| **角色名稱**     | 純文字                  |
-| **可用 AI 夥伴** | 純文字，逗號分隔，無則顯示「無權限」  |
-| 執行動作         | 修改按鈕 / 刪除按鈕          |
+| **角色名稱** | 純文字                      |
+| **使用者**  | 純文字，逗號分隔，無則顯示「無」        |
+| 執行動作     | 修改按鈕 / 刪除按鈕              |
 
 ## 操作說明
 
-**[新增角色]**（頁面右上角按鈕）
+**[新增角色]**（篩選列右側按鈕）
 - → 角色表單（新增模式）
 
 **[套用]**（篩選列按鈕）
```

- **Spec/fn_role/fn_role_02_form.md**（modified，+9 -21）
```diff
@@ -4,32 +4,20 @@
 
 ## 欄位說明
 
-| 欄位             | 輸入元件             | 必填  | 驗證規則          | 預設值  |
-| -------------- | -------------- | --- | ------------- | ---- |
-| **角色名稱**       | text input     | 是   | 不可空白，系統內不可重複  | 空白   |
-| **成員**       | checkbox group | 否   | —             | 全不選  |
-| **可用 AI 夥伴**   | checkbox group | 否   | —             | 全不選  |
-| **可存取知識庫**     | checkbox group | 否   | —             | 全不選  |
-| **功能權限**       | checkbox group | 否   | —             | 全不選  |
-
-> **成員**選項來源：tb_users 所有使用者，含「全選」切換按鈕。
-> **可用 AI 夥伴**選項來源：tb_ai_partners 所有夥伴（停用中者顯示但不可選）。
-> **可存取知識庫**選項來源：tb_knowledge_bases 所有知識庫，含「全選」切換按鈕。
-
-### 功能權限選項
-
-| 權限項目       | 說明                   |
-| ---------- | -------------------- |
-| AI 夥伴      | 可使用 AI 夥伴進行分析        |
-| 使用者管理      | 可新增、修改、刪除使用者         |
-| 角色管理       | 可新增、修改、刪除角色與權限       |
-| AI 夥伴管理    | 可調整 AI 夥伴設定與綁定知識庫    |
+| 欄位       | 輸入元件           | 必填  | 驗證規則         | 預設值 |
+| -------- | -------------- | --- | ------------ | --- |
+| **角色名稱** | text input     | 是   | 不可空白，系統內不可重複 | 空白  |
+| **成員**   | checkbox group | 否   | —            | 全不選 |
+| **功能權限** | checkbox group | 否   | —            | 全不選 |
+
+> **成員**選項來源：`Api/fn_user_options_api.md`，含「全選」切換按鈕。
+> **功能權限**選項來源：`Api/fn_function_options_api.md`。
 
 ## 操作說明
 
 **[儲存]**
 - → `Api/fn_role_add_api.md`
-  - 傳入：**角色名稱**、**成員**、**可用 AI 夥伴**、**可存取知識庫**、**功能權限**
+  - 傳入：**角色名稱**、**成員**、**功能權限**
   - 成功：關閉表單 → **查詢畫面**，重新整理清單
 
 **[取消]**
```

- **Spec/fn_user/Api/_fn_user_test_api.md**（modified，+17 -15）
```diff
@@ -2,18 +2,20 @@
 
 > 活文件：每次 SD 新增或修改 API 時同步更新，ID 累積不重置。
 
-| ID | 說明 | 前置條件 | 操作 | 預期結果 |
-|----|------|----------|------|----------|
-| T1 | 查詢成功 | 已登入且具 `can_manage_accounts` 權限 | GET /api/users | 200，data 包含每位使用者的姓名、Email、is_active、角色陣列 |
-| T2 | 查詢無權限 | 已登入但無 `can_manage_accounts` 權限 | GET /api/users | 403 您沒有執行此操作的權限 |
-| T3 | 新增成功 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，傳入有效姓名、Email、密碼（≥ 8 字元）、至少一個角色 | 201 新增成功 |
-| T4 | 新增 Email 重複 | 已登入且具 `can_manage_accounts` 權限，系統中 Email 已存在 | POST /api/users，傳入相同 Email | 400 此 Email 已被使用 |
-| T5 | 新增密碼不足 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
-| T6 | 角色不可為空 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，角色陣列為空 | 400 角色未設定 |
-| T7 | 修改成功 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，傳入有效新姓名 | 200 更新成功 |
-| T8 | 修改使用者不存在 | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com，傳入任意姓名 | 404 使用者不存在 |
-| T9 | 刪除成功 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在且非操作者本身 | DELETE /api/users/{email} | 200 刪除成功，tb_users 及 tb_user_roles 對應紀錄移除 |
-| T10 | 刪除自己 | 已登入且具 `can_manage_accounts` 權限 | DELETE /api/users/{操作者自己的 email} | 400 無法刪除自己的帳號 |
-| T11 | 依角色過濾 | 已登入且具 `can_manage_accounts` 權限，DB 有多筆不同角色的使用者 | GET /api/users?role_id={id} | 200，data 只包含具該角色的使用者 |
-| T12 | 依關鍵字過濾 | 已登入且具 `can_manage_accounts` 權限，DB 有多筆名稱或 Email 不同的使用者 | GET /api/users?keyword=xxx | 200，data 只包含名稱或 Email 含 xxx 的使用者 |
-| T13 | 修改密碼不足 8 字元 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
+| ID  | 說明             | 前置條件                                                     | 操作                                              | 預期結果                                             |
+| --- | -------------- | -------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
+| T1  | 查詢成功           | 已登入且使用者角色具備 fn_user 功能權限                                 | GET /api/users                                  | 200，data 包含每位使用者的姓名、Email、is_active、角色陣列          |
+| T2  | 查詢無權限          | 已登入但使用者角色不具備 fn_user 功能權限                               | GET /api/users                                  | 403 您沒有執行此操作的權限                                   |
+| T3  | 新增成功           | 已登入且使用者角色具備 fn_user 功能權限                                 | POST /api/users，傳入有效姓名、Email、密碼（≥ 8 字元）、至少一個角色 | 201 新增成功                                         |
+| T4  | 新增 Email 重複    | 已登入且使用者角色具備 fn_user 功能權限，系統中 Email 已存在                  | POST /api/users，傳入相同 Email                      | 400 此 Email 已被使用                                 |
+| T5  | 新增密碼不足         | 已登入且使用者角色具備 fn_user 功能權限                                 | POST /api/users，密碼傳入 7 字元字串                      | 400 密碼最少 8 字元                                    |
+| T6  | 角色不可為空         | 已登入且使用者角色具備 fn_user 功能權限                                 | POST /api/users，角色陣列為空                          | 400 角色未設定                                        |
+| T7  | 修改成功           | 已登入且使用者角色具備 fn_user 功能權限，目標使用者存在                        | PATCH /api/users/{email}，傳入有效新姓名                 | 200 更新成功                                         |
+| T8  | 修改使用者不存在       | 已登入且使用者角色具備 fn_user 功能權限                                 | PATCH /api/users/notexist@example.com，傳入任意姓名     | 404 使用者不存在                                       |
+| T9  | 刪除成功           | 已登入且使用者角色具備 fn_user 功能權限，目標使用者存在且非操作者本身                 | DELETE /api/users/{email}                       | 200 刪除成功，tb_users 及 tb_user_roles 對應紀錄移除         |
+| T10 | 刪除自己           | 已登入且使用者角色具備 fn_user 功能權限                                 | DELETE /api/users/{操作者自己的 email}                 | 400 無法刪除自己的帳號                                    |
+| T11 | 依角色過濾          | 已登入且使用者角色具備 fn_user 功能權限，DB 有多筆不同角色的使用者                 | GET /api/users?role_id={id}                     | 200，data 只包含具該角色的使用者                             |
+| T12 | 依關鍵字過濾         | 已登入且使用者角色具備 fn_user 功能權限，DB 有多筆名稱或 Email 不同的使用者         | GET /api/users?keyword=xxx                      | 200，data 只包含名稱或 Email 含 xxx 的使用者                 |
+| T13 | 修改密碼不足 8 字元    | 已登入且使用者角色具備 fn_user 功能權限，目標使用者存在                        | PATCH /api/users/{email}，密碼傳入 7 字元字串            | 400 密碼最少 8 字元                                    |
+| T14 | options 查詢成功   | 已登入                                                      | GET /api/users/options                          | 200，data 為 `[{ id, name }]` 陣列，只含 is_active = true 的使用者 |
+| T15 | options 未登入    | 未登入                                                      | GET /api/users/options                          | 401 未登入或 Token 過期                                |
```

- **Spec/fn_user/Api/fn_user_add_api.md**（modified，+1 -1）
```diff
@@ -25,7 +25,7 @@
 | 檢核項目          | 失敗條件                   | 回應訊息                      |
 | ------------- | ---------------------- | ------------------------- |
 | JWT 驗證        | 未登入或 Token 過期          | 401 未登入或 Token 過期         |
-| 權限            | 無 `can_manage_accounts` | 403 您沒有執行此操作的權限           |
+| 權限            | 使用者角色不具備 fn_user 功能權限 | 403 您沒有執行此操作的權限           |
 | **名稱** 格式     | 超過 100 字               | 400 使用者顯示名稱不可超過 100 字     |
 | **Email** 格式  | 格式不符                   | 400 登入信箱格式不正確             |
 | **密碼** 格式     | 少於 8 字元                | 400 密碼最少 8 字元             |
```

- **Spec/fn_user/Api/fn_user_del_api.md**（modified，+1 -1）
```diff
@@ -22,7 +22,7 @@
 | 檢核項目  | 失敗條件                   | 回應訊息                  |
 | ----- | ---------------------- | --------------------- |
 | JWT 驗證 | 未登入或 Token 過期          | 401 未登入或 Token 過期     |
-| 權限    | 無 `can_manage_accounts` | 403 您沒有執行此操作的權限       |
+| 權限    | 使用者角色不具備 fn_user 功能權限 | 403 您沒有執行此操作的權限       |
 | 使用者存在 | 不存在                    | 404 使用者不存在            |
 | 自我刪除  | 操作者刪除自己                | 400 無法刪除自己的帳號         |
 
```

- **Spec/fn_user/Api/fn_user_options_api.md**（added，+34 -0）
```diff
@@ -0,0 +1,34 @@
+# fn_user_options_api規格
+
+## 介面說明
+
+| 項目       | 內容                  |
+| -------- | ------------------- |
+| Method   | GET                 |
+| Endpoint | /api/users/options  |
+
+> 輕量選項端點，供其他功能（如角色管理）取得使用者 id + name 清單。需登入，不需特定管理權限。
+
+## 傳入參數
+
+無。
+
+## 處理邏輯
+
+### 檢核
+
+| 檢核項目  | 失敗條件          | 回應訊息              |
+| ----- | ------------- | ------------------- |
+| JWT 驗證 | 未登入或 Token 過期 | 401 未登入或 Token 過期 |
+
+### 執行
+
+- 查詢 tb_users 所有 is_active = true 的紀錄
+- 依名稱升冪排序
+
+## 傳回結果
+
+| Response | Message | data                        |
+| -------- | ------- | --------------------------- |
+| 200      | 查詢成功    | `[{ id, name }]` 使用者選項陣列 |
+| 4xx      | 依據檢核邏輯  | 無                           |
```

- **Spec/fn_user/Api/fn_user_query_api.md**（modified，+1 -1）
```diff
@@ -23,7 +23,7 @@
 | 檢核項目  | 失敗條件                   | 回應訊息                  |
 | ----- | ---------------------- | --------------------- |
 | JWT 驗證 | 未登入或 Token 過期          | 401 未登入或 Token 過期     |
-| 權限    | 無 `can_manage_accounts` | 403 您沒有執行此操作的權限       |
+| 權限    | 使用者角色不具備 fn_user 功能權限 | 403 您沒有執行此操作的權限       |
 
 ### 執行
 
```

- **Spec/fn_user/Api/fn_user_update_api.md**（modified，+1 -1）
```diff
@@ -32,7 +32,7 @@
 | 檢核項目          | 失敗條件                   | 回應訊息                      |
 | ------------- | ---------------------- | ------------------------- |
 | JWT 驗證        | 未登入或 Token 過期          | 401 未登入或 Token 過期         |
-| 權限            | 無 `can_manage_accounts` | 403 您沒有執行此操作的權限           |
+| 權限            | 使用者角色不具備 fn_user 功能權限 | 403 您沒有執行此操作的權限           |
 | 使用者存在         | 不存在                    | 404 使用者不存在                |
 | **名稱** 格式     | 超過 100 字               | 400 使用者顯示名稱不可超過 100 字     |
 | **密碼** 格式     | 少於 8 字元                | 400 密碼至少需要 8 個字元          |
```

- **schema/schema.md**（modified，+22 -26）
```diff
@@ -16,18 +16,28 @@
 
 ### tb_roles
 
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| id | INTEGER, PK | |
-| name | VARCHAR(100), NOT NULL, UK | 角色名稱 |
-| can_access_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 可使用 AI 夥伴功能 |
-| can_use_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | 可查閱知識庫 |
-| can_manage_accounts | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理使用者帳號 |
-| can_manage_roles | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理角色與權限 |
-| can_edit_ai | BOOLEAN, NOT NULL, DEFAULT FALSE | 可編輯 AI 夥伴設定 |
-| can_manage_kb | BOOLEAN, NOT NULL, DEFAULT FALSE | 可管理知識庫 |
-| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
-| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
+| 欄位         | 型別                                 | 說明    |
+| ---------- | ---------------------------------- | ----- |
+| id         | INTEGER, PK                        |       |
+| name       | VARCHAR(100), NOT NULL, UK         | 角色名稱  |
+| created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() |       |
+| updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() |       |
+
+### tb_functions
+
+| 欄位              | 型別                         | 說明   |
+| --------------- | -------------------------- | ---- |
+| function_id     | INTEGER, PK                |      |
+| function_name   | VARCHAR(100), NOT NULL, UK | 功能代碼 |
+
+> 初始資料：`(1, fn_user)`、`(2, fn_role)`
+
+### tb_role_function（多對多）
+
+| 欄位          | 型別                            | 說明 |
+| ----------- | ----------------------------- | -- |
+| role_id     | INTEGER, PK, FK → tb_roles    |    |
+| function_id | INTEGER, PK, FK → tb_functions |    |
 
 ### tb_user_roles（多對多）
 
@@ -63,13 +73,6 @@
 | created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
 | updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
 
-### tb_role_ai_partners（多對多）
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| role_id | INTEGER, PK, FK → tb_roles | |
-| partner_id | INTEGER, PK, FK → tb_ai_partners | |
-
 ---
 ## fn_km
 
@@ -144,13 +147,6 @@
 | created_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
 | updated_at | TIMESTAMP, NOT NULL, DEFAULT NOW() | |
 
-### tb_role_kb_map（多對多）
-
-| 欄位 | 型別 | 說明 |
-|------|------|------|
-| role_id | INTEGER, PK, FK → tb_roles | |
-| kb_id | INTEGER, PK, FK → tb_knowledge_bases | |
-
 ### tb_partner_kb_map（多對多）
 
 | 欄位 | 型別 | 說明 |
```

## 關聯項目
- Epic：MPinfo-Co/P1-project#135
- SA Issue：MPinfo-Co/P1-design#110
- SD Issue：P1-design #116
- 上一個 commit：677c275
- 本次 commit：cb679fc