# SpecDiff：Issue #66 實作[使用者]維護功能

## 修改項目及內容
- **Prototype/fn_user.html**（modified，+4 -20）
```diff
@@ -25,14 +25,14 @@ <h2 style="color:#1e293b;">帳號管理</h2>
                         <option value="一般使用者">一般使用者</option>
                     </select>
                     <label style="margin-left:10px;">關鍵字:</label>
-                    <input type="text" id="userSearchKeyword" placeholder="搜尋姓名或信箱...">
+                    <input type="text" id="userSearchKeyword" placeholder="搜尋名稱或信箱...">
                 </div>
                 <button class="btn-filter" onclick="renderUserTable()">套用</button>
             </div>
             <div class="card" style="padding:0;">
                 <table class="table">
                     <thead>
-                        <tr><th>姓名</th><th>電子信箱</th><th>角色</th><th>執行動作</th></tr>
+                        <tr><th>名稱</th><th>電子信箱</th><th>角色</th><th>執行動作</th></tr>
                     </thead>
                     <tbody id="userTableBody"></tbody>
                 </table>
@@ -109,8 +109,6 @@ <h3 id="uModalTitle" style="color:#1e293b; margin-bottom:20px; flex-shrink:0;">
                 '<td>' + rolesHtml + '</td>' +
                 '<td>' +
                     '<button class="btn btn-outline" style="padding:4px 8px;" onclick="prepareEditUser(' + u.id + ')">修改</button> ' +
-                    '<button class="btn btn-outline" style="padding:4px 8px;" onclick="toggleUserStatus(' + u.id + ')">' + (u.status === '停用' ? '啟用' : '停用') + '</button> ' +
-                    '<button class="btn btn-outline" style="padding:4px 8px;" onclick="resetUserPassword(' + u.id + ')">重設密碼</button> ' +
                     '<button class="btn btn-outline" style="padding:4px 8px; color:#ef4444; border-color:#fca5a5;" onclick="deleteItem(' + u.id + ')">刪除</button>' +
                 '</td></tr>';
         });
@@ -155,26 +153,12 @@ <h3 id="uModalTitle" style="color:#1e293b; margin-bottom:20px; flex-shrink:0;">
     }
 
     function deleteItem(id) {
-        if (!confirm('確定要刪除此帳號嗎？無法復原。')) return;
+        const user = allUsers.find(u => u.id === id);
+        if (!confirm(`確定要刪除 ${user ? user.name : ''}？此操作無法還原`)) return;
         allUsers = allUsers.filter(u => u.id !== id);
         renderUserTable();
     }
 
-    function toggleUserStatus(id) {
-        var u = allUsers.find(function(x){ return x.id === id; });
-        if (!u) return;
-        u.status = (u.status === '停用') ? '啟用' : '停用';
-        alert('已將「' + u.name + '」狀態切換為：' + u.status);
-        renderUserTable();
-    }
-
-    function resetUserPassword(id) {
-        var u = allUsers.find(function(x){ return x.id === id; });
-        if (!u) return;
-        var newPass = 'P' + Math.random().toString(36).substr(2, 7);
-        alert('「' + u.name + '」的新密碼為：\n\n' + newPass + '\n\n請通知使用者首次登入後修改。');
-    }
-
     document.addEventListener('DOMContentLoaded', renderUserTable);
     </script>
 </body>
```

- **Spec/fn_role/Api/fn_role_options_api.md**（added，+34 -0）
```diff
@@ -0,0 +1,34 @@
+# fn_role_options_api規格
+
+## 介面說明
+
+| 項目       | 內容                  |
+| -------- | ------------------- |
+| Method   | GET                 |
+| Endpoint | /api/roles/options  |
+
+> 輕量選項端點，供其他功能（如帳號管理）取得角色 id + name 清單。需登入，不需特定管理權限。
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
+- 查詢 tb_roles 所有紀錄
+- 依名稱升冪排序
+
+## 傳回結果
+
+| Response | Message | data                        |
+| -------- | ------- | --------------------------- |
+| 200      | 查詢成功    | `[{ id, name }]` 角色選項陣列 |
+| 4xx      | 依據檢核邏輯  | 無                           |
```

- **Spec/fn_user/Api/_fn_user_test_api.md**（added，+19 -0）
```diff
@@ -0,0 +1,19 @@
+# fn_user API 測試規格
+
+> 活文件：每次 SD 新增或修改 API 時同步更新，ID 累積不重置。
+
+| ID | 說明 | 前置條件 | 操作 | 預期結果 |
+|----|------|----------|------|----------|
+| T1 | 查詢成功 | 已登入且具 `can_manage_accounts` 權限 | GET /api/users | 200，data 包含每位使用者的姓名、Email、is_active、角色陣列 |
+| T2 | 查詢無權限 | 已登入但無 `can_manage_accounts` 權限 | GET /api/users | 403 您沒有執行此操作的權限 |
+| T3 | 新增成功 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，傳入有效姓名、Email、密碼（≥ 8 字元）、至少一個角色 | 201 新增成功 |
+| T4 | 新增 Email 重複 | 已登入且具 `can_manage_accounts` 權限，系統中 Email 已存在 | POST /api/users，傳入相同 Email | 400 此 Email 已被使用 |
+| T5 | 新增密碼不足 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
+| T6 | 角色不可為空 | 已登入且具 `can_manage_accounts` 權限 | POST /api/users，角色陣列為空 | 400 角色未設定 |
+| T7 | 修改成功 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，傳入有效新姓名 | 200 更新成功 |
+| T8 | 修改使用者不存在 | 已登入且具 `can_manage_accounts` 權限 | PATCH /api/users/notexist@example.com，傳入任意姓名 | 404 使用者不存在 |
+| T9 | 刪除成功 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在且非操作者本身 | DELETE /api/users/{email} | 200 刪除成功，tb_users 及 tb_user_roles 對應紀錄移除 |
+| T10 | 刪除自己 | 已登入且具 `can_manage_accounts` 權限 | DELETE /api/users/{操作者自己的 email} | 400 無法刪除自己的帳號 |
+| T11 | 依角色過濾 | 已登入且具 `can_manage_accounts` 權限，DB 有多筆不同角色的使用者 | GET /api/users?role_id={id} | 200，data 只包含具該角色的使用者 |
+| T12 | 依關鍵字過濾 | 已登入且具 `can_manage_accounts` 權限，DB 有多筆名稱或 Email 不同的使用者 | GET /api/users?keyword=xxx | 200，data 只包含名稱或 Email 含 xxx 的使用者 |
+| T13 | 修改密碼不足 8 字元 | 已登入且具 `can_manage_accounts` 權限，目標使用者存在 | PATCH /api/users/{email}，密碼傳入 7 字元字串 | 400 密碼最少 8 字元 |
```

- **Spec/fn_user/Api/fn_user_update_api.md**（modified，+3 -3）
```diff
@@ -20,7 +20,7 @@
 | 欄位        | 型別        | 必填  |
 | --------- | --------- | --- |
 | **名稱**    | string    | 否   |
-| **Email** | string    | 否   |
+| **密碼**    | string    | 否   |
 | **角色**    | integer[] | 否   |
 
 > 僅傳入需修改的欄位，未傳入欄位保持不變。
@@ -35,12 +35,12 @@
 | 權限            | 無 `can_manage_accounts` | 403 您沒有執行此操作的權限           |
 | 使用者存在         | 不存在                    | 404 使用者不存在                |
 | **名稱** 格式     | 超過 100 字               | 400 使用者顯示名稱不可超過 100 字     |
-| **Email** 格式  | 格式不符                   | 400 登入信箱格式不正確             |
+| **密碼** 格式     | 少於 8 字元                | 400 密碼至少需要 8 個字元          |
 | **角色**        | 傳入但為空                  | 400 角色不可為空                |
-| **Email** 唯一性 | 已被其他帳號使用               | 400 此 Email 已被其他帳號使用      |
 
 ### 執行
 
+- 若傳入 **密碼**，以 bcrypt hash 後更新
 - 更新 tb_users 中對應欄位
 - 若傳入 **角色**，先刪除 tb_user_roles 中該使用者的所有紀錄，再重新寫入
 
```

- **Spec/fn_user/fn_user_01_list.md**（modified，+6 -3）
```diff
@@ -1,5 +1,8 @@
 # 查詢畫面
 
+路由路徑：`/settings/account`
+Sidebar：設定群組，標籤「帳號管理」，icon: PeopleAlt
+
 雛形畫面：[▶ 開啟雛形](../../Prototype/fn_user.html#userList)
 
 ## 欄位說明
@@ -9,13 +12,13 @@
 | 欄位       | 輸入元件         | 說明                                  |
 | -------- | ---------- | ----------------------------------- |
 | **角色職位** | select     | 選項來源：tb_roles 所有角色名稱，加上「全部」選項（預設選中） |
-| **關鍵字**  | text input | 搜尋範圍：**姓名**、**電子信箱**                |
+| **關鍵字**  | text input | 搜尋範圍：**名稱**、**電子信箱**                |
 
 ### 清單表格
 
 | 欄位       | 顯示元件        |
 | -------- | ----------- |
-| **姓名**   | 純文字         |
+| **名稱**   | 純文字         |
 | **電子信箱** | 純文字         |
 | **角色**   | badge（可多個） |
 
@@ -33,7 +36,7 @@
 - 帶入 **電子信箱** → 修改畫面
 
 **[刪除]**（各列操作欄按鈕）
-- 顯示確認訊息：「確定要刪除此帳號嗎？無法復原。」
+- 顯示確認訊息：「確定要刪除 {名稱}？此操作無法還原」
 - 確認後 → `Api/fn_user_del_api.md`
   - 傳入：**電子信箱**
   - 成功：重新整理清單
```

- **Spec/fn_user/fn_user_02_form.md**（modified，+4 -2）
```diff
@@ -15,6 +15,8 @@
 
 ## 操作說明
 
+欄位驗證失敗時，在對應欄位下方顯示錯誤說明文字。
+
 **[儲存]**
 - → `Api/fn_user_add_api.md`
   - 傳入：**名稱**、**Email**、**密碼**、**角色**
@@ -27,6 +29,6 @@
 |          | 新增畫面                     | 修改畫面                               |
 | -------- | ------------------------ | ---------------------------------- |
 | 標題       | 新增帳號                     | 修改帳號                               |
-| 欄位初始值    | 空白                       | 帶入現有資料（**名稱**、**Email**、已指派**角色**） |
-| **密碼**欄位 | 顯示（必填）                   | 不顯示（密碼修改為獨立功能）                     |
+| 欄位初始值    | 空白                       | 帶入現有資料（**名稱**、**Email**（唯讀）、已指派**角色**） |
+| **密碼**欄位 | 顯示（必填）                   | 顯示（必填）                     |
 | [儲存] API | `Api/fn_user_add_api.md` | `Api/fn_user_update_api.md`        |
```

## 關聯項目
- Epic：MPinfo-Co/P1-project#115
- SA Issue：P1-design #（請查 Epic）
- SD Issue：P1-design #66
- 上一個 commit：c94af84
- 本次 commit：44f3600