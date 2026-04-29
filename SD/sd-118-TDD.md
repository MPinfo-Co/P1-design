# TDD：[SD] [Epic] 公司背景功能

## 工作項目

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | Schema | 建立 `tb_company_data`：儲存公司資料名稱與內容 | `schema/schema.md` |
| 2 | Schema | 建立 `tb_company_data_partners`：記錄每筆資料與 AI 夥伴的多對多關聯 | `schema/schema.md` |
| 3 | API | 建立查詢公司資料 API：支援關鍵字過濾（比對名稱與內容） | `Spec/fn_company_data/Api/fn_company_data_query_api.md` |
| 4 | API | 建立新增公司資料 API：儲存名稱、內容，並寫入夥伴綁定；未指定夥伴時自動綁定「資安專家」 | `Spec/fn_company_data/Api/fn_company_data_add_api.md` |
| 5 | API | 建立修改公司資料 API：更新名稱、內容，並重建夥伴綁定 | `Spec/fn_company_data/Api/fn_company_data_update_api.md` |
| 6 | API | 建立刪除公司資料 API：連同夥伴關聯一併刪除 | `Spec/fn_company_data/Api/fn_company_data_del_api.md` |
| 7 | 畫面 | 建立公司資料列表畫面：包含關鍵字搜尋、條列內容顯示、新增/修改/刪除操作 | `Spec/fn_company_data/fn_company_data_01_list.md` |
| 8 | 畫面 | 建立新增/編輯對話框：資料名稱、內容（多行）、適用夥伴勾選 | `Spec/fn_company_data/fn_company_data_02_form.md` |
| 9 | Test | 建立 API 測試案例（共 15 筆） | `Spec/fn_company_data/Api/_fn_company_data_test_api.md` |

**── AI 填寫結束 ──**

---

## 設計決定

**⚠️ ── AI 填寫開始，請逐行審查 ──**

1. **不建立獨立 content 解析表**：內容以純文字儲存在 `tb_company_data.content`，由前端以換行切割成條列顯示。理由：需求明確排除分類層級與附件，純文字足以滿足使用情境，不需要額外解析結構。

2. **夥伴綁定採 DELETE + INSERT 全量更新**：修改 API 執行時，先刪除舊的 `tb_company_data_partners`，再依傳入夥伴 ID 陣列重新插入。理由：每筆資料綁定的夥伴數量預期極少，此做法邏輯清晰且不易產生髒資料，不需要 diff 計算。

3. **查詢不分頁**：公司資料筆數預期在個位數到數十筆，不需要分頁，直接全量回傳再由前端即時過濾關鍵字。

4. **權限沿用 `can_manage_kb`**：公司背景資料屬於公司知識管理的一部分，與知識庫共用同一權限控制即可，不另開新 flag。

5. **新增時未指定夥伴自動綁定資安專家**：SA 商業邏輯第 2 點說明「現階段每筆預設綁定資安專家」，因此新增 API 若未收到有效的夥伴 ID 陣列，後端自動以 `tb_ai_partners.name = '資安專家'` 查得 ID 並寫入 `tb_company_data_partners`。此邏輯在後端執行（不依賴前端傳值），確保資料一致性。

**── AI 填寫結束 ──**

---

## 測試案例

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | API | 已登入且具 `can_manage_kb` 權限，DB 有 2 筆公司資料 | GET /api/company-data（無關鍵字） | 200，回傳 2 筆，每筆含 id、資料名稱、內容、適用夥伴名稱[] |
| T2 | API | 已登入但無 `can_manage_kb` 權限 | GET /api/company-data | 403 您沒有執行此操作的權限 |
| T3 | API | 已登入且具 `can_manage_kb` 權限，DB 有資料名稱含「網段」及「白名單」各一筆 | GET /api/company-data?keyword=網段 | 200，data 只包含名稱含「網段」的一筆 |
| T4 | API | 已登入且具 `can_manage_kb` 權限，DB 有一筆內容含「192.168.10.30」 | GET /api/company-data?keyword=192.168.10.30 | 200，data 包含該筆資料（內容命中） |
| T5 | API | 已登入且具 `can_manage_kb` 權限 | POST /api/company-data，傳入有效資料名稱「公司網段」、有效內容、夥伴 ID 陣列 | 201 新增成功 |
| T6 | API | 已登入且具 `can_manage_kb` 權限 | POST /api/company-data，資料名稱傳入空字串 | 400 資料名稱不可空白且不超過 200 字 |
| T7 | API | 已登入且具 `can_manage_kb` 權限 | POST /api/company-data，內容傳入僅含空行的字串 | 400 內容不可空白 |
| T8 | API | 已登入且具 `can_manage_kb` 權限，目標資料存在 | PATCH /api/company-data/{id}，傳入新資料名稱、新內容、空夥伴陣列 | 200 更新成功，夥伴綁定清空 |
| T9 | API | 已登入且具 `can_manage_kb` 權限 | PATCH /api/company-data/99999，傳入有效資料 | 404 資料不存在 |
| T10 | API | 已登入且具 `can_manage_kb` 權限，目標資料存在 | DELETE /api/company-data/{id} | 200 刪除成功，tb_company_data 及 tb_company_data_partners 對應紀錄移除 |
| T11 | API | 已登入且具 `can_manage_kb` 權限 | DELETE /api/company-data/99999 | 404 資料不存在 |
| T12 | 畫面 | 已登入且具 `can_manage_kb` 權限，列表有 2 筆資料，其中一筆名稱含「網段」 | 在關鍵字欄輸入「網段」 | 列表即時過濾，僅顯示名稱含「網段」的那筆，內容以 bullet 顯示 |
| T13 | 畫面 | 已登入且具 `can_manage_kb` 權限 | 點擊右上角 [新增資料]，填入資料名稱與內容，勾選一個夥伴，點 [儲存] | 對話框關閉，列表新增一筆，適用夥伴欄顯示已勾選夥伴名稱 |
| T14 | 畫面 | 已登入且具 `can_manage_kb` 權限，列表有一筆資料 | 點擊該筆 [刪除]，在確認對話框點確認 | 該筆從列表移除 |
| T15 | API | 已登入且具 `can_manage_kb` 權限，系統存在內建夥伴「資安專家」 | POST /api/company-data，傳入有效資料名稱與內容，不傳 適用夥伴欄位（或傳空陣列） | 201 新增成功；查詢該筆資料時，適用夥伴欄顯示「資安專家」（自動綁定） |

**── AI 填寫結束 ──**
