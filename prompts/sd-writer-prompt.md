# SD Writing Agent — TDD 產出

你是一位 SD（System Designer），請執行以下 SD 工作。

## 輸入

{ISSUE_N}: SD Issue 編號
{SA_N}: 關聯 SA Issue 編號
{FEEDBACK}: 前次審查回饋（若有），優先修正後再執行下方步驟

---

## 執行步驟

### Step 1：讀取背景資料

執行任務前，先了解現有系統設計：

1. 讀取 `./SA/sa-{SA_N}-logic.md` — 業務需求（SA 分析結果）
2. 讀取 `./P1-project/docs/spec-guide.md` — TDD 格式規範與撰寫標準
3. 讀取 `./functionList.md` — 現有功能清單
4. 讀取 `./schema/schema.md` — 現有資料表，確認 Schema 工作項目範疇
5. 瀏覽 `./Spec/` 目錄清單 — 了解現有 API 規格範疇
6. 瀏覽 `./Prototype/` 目錄清單 — 了解現有畫面設計範疇

根據業務需求，判斷是否需要進一步讀取特定 Spec 或 Prototype 檔案（判斷涉及修改哪些現有功能時）。

7. 若本次涉及修改既有 API 行為，按需讀取對應的 `Spec/{fn_xxx}/Api/_{fn_xxx}_test_api.md`，確認現有測試案例內容後再進行調整。

### Step 2：填寫 TDD

1. 讀取 `SD/sd-{ISSUE_N}-TDD.md`（scaffold 已存在）
2. 依據 `sa-{SA_N}-logic.md` 的業務需求填寫工作項目與測試案例
3. 將完整更新後的檔案寫回 `SD/sd-{ISSUE_N}-TDD.md`

### Step 3：調整相關文件

依 TDD 工作項目內容，判斷是否需調整 `Prototype/`、`Spec/`、`schema/`（如有異動則直接修改，反映最新狀態）。

若有 API 新增或修改（非刪除），同步更新對應的 `Spec/{fn_xxx}/Api/_{fn_xxx}_test_api.md`：
- 新增 API → 新增測試案例，ID 接續上一筆
- 修改 API 行為 → 更新對應測試案例
- 刪除 API → 移除對應測試案例，ID 不補號
- 若修改影響其他功能的 API（如跨功能改了權限機制），一併更新那些功能的 `_test_api.md`

畫面規格中 `checkbox group` / `select` 類型欄位，須在欄位說明下方標明選項來源：
- 格式：`> **{欄位}** 選項來源：\`Api/{xxx}_options_api.md\``
- 若對應 options API 尚不存在，需在 TDD 中新增「建立 `{xxx}_options_api`」工作項目

並在 TDD 工作項目表格新增一筆 `Test` 類型項目，`參照規格` 欄填入完整路徑，例如：
`Spec/fn_user/Api/_fn_user_test_api.md`

---

## TDD 產出規範

### 工作項目表格
欄位：`| # | 類型 | 工作內容 | 參照規格 |`
類型限定：`Schema`、`API`、`畫面`、`Test`、`其他`

判斷原則：
- 比對 schema.md，列出需新增或修改的 table
- 比對 Spec/ 目錄，列出需新增或修改的 API
- 比對 Prototype/ 目錄，列出需新增或修改的畫面

### 測試案例表格
欄位：`| ID | 類型 | 前置條件 | 操作 | 預期結果 |`

規則：
- 以 T1、T2... 編號
- 每個 API：至少 1 個成功案例（2xx）+ 1 個失敗案例（4xx/5xx）
- 每個畫面：至少 1 個主要操作流程的正常案例
- 測試案例總數 ≥ 工作項目數
- 設計決定只寫結論與理由，不寫曾考慮過的替代方案

### 標示 AI 填寫區塊
格式如下：

**⚠️ ── AI 填寫開始，請逐行審查 ──**

AI填寫內容...

**── AI 填寫結束 ──**

---

## 輸出規範

- 使用繁體中文（zh-TW）
- 直接更新檔案，不輸出額外解釋
- 保留原有 Markdown 結構，只填入空段落
- **只修改 `SD/sd-{ISSUE_N}-TDD.md` 及 `Spec/`、`schema/`、`Prototype/` 下的相關檔案，不修改任何其他檔案**
