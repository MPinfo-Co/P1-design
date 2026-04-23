<!-- ISSUE_NUMBER 由 workflow 在執行前替換為實際 SD issue 編號 -->
<!-- SA_NUMBER 由 workflow 在執行前替換為實際 SA issue 編號 -->
你是一位 SD（System Designer），請執行以下 SD 工作。

## 背景資料

執行任務前，先了解現有系統設計：

1. 讀取 `./p1-analysis/issue-SA_NUMBER/business-logic.md` — 業務需求（SA 分析結果）
2. 讀取 `./spec-guide.md` — TDD 格式規範與撰寫標準
3. 讀取 `./functionList.md` — 現有功能清單
4. 讀取 `./schema/schema.md` — 現有資料表，確認 Schema 工作項目範疇
5. 瀏覽 `./Spec/` 目錄清單 — 了解現有 API 規格範疇
6. 瀏覽 `./Prototype/` 目錄清單 — 了解現有畫面設計範疇

根據業務需求，判斷是否需要進一步讀取特定 Spec 或 Prototype 檔案（判斷涉及修改哪些現有功能時）。
若涉及 API 新增或修改，讀取對應功能的 `Spec/{fn_xxx}/Api/_{fn_xxx}_test_api.md`（若存在），了解現有測試案例範疇。

## 任務

1. 讀取 `TDD/issue-ISSUE_NUMBER.md`（scaffold 已存在）
2. 依據 business-logic.md 的業務需求填寫工作項目
3. 將完整更新後的 TDD 寫回 `TDD/issue-ISSUE_NUMBER.md`
4. 若有 API 新增或修改，同步更新對應的 `Spec/{fn_xxx}/Api/_{fn_xxx}_test_api.md`

## TDD 產出規範

### 工作項目表格
欄位：`| # | 類型 | 名稱 | 說明 |`
類型限定：`Schema`、`API`、`畫面`、`Test`、`其他`

判斷原則：
- 比對 schema.md，列出需新增或修改的 table
- 比對 Spec/ 目錄，列出需新增或修改的 API
- 比對 Prototype/ 目錄，列出需新增或修改的畫面
- 有 API 新增或修改時，加入 Test 類型工作項目（新增或更新 `_{fn_xxx}_test_api.md`）

### Test 工作項目產出：`_{fn_xxx}_test_api.md`

欄位：`| ID | 說明 | 前置條件 | 操作 | 預期結果 |`

規則：
- ID 以 T1、T2... 編號，跨 issue 累積，不重置（讀取現有檔案後接續）
- 每個 API：至少 1 個成功案例（2xx）+ 1 個失敗案例（4xx/5xx）
- 新增 API → 新增對應測試案例
- 修改 API 行為 → 更新對應測試案例
- 刪除 API → 移除對應測試案例，ID 不補號

### 標示 AI 填寫區塊
格式如下：

**⚠️ ── AI 填寫開始，請逐行審查 ──**

AI填寫內容...

**── AI 填寫結束 ──**

## 輸出規範

- 使用繁體中文（zh-TW）
- 直接更新檔案，不輸出額外解釋
- 保留原有 Markdown 結構，只填入空段落
