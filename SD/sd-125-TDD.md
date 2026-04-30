# TDD：[SD] P1-code增設structure.md文件

## 工作項目

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | 其他 | 建立 `P1-code/CLAUDE.md`：撰寫整體程式架構文件，內容含資料夾/檔案架構、技術堆疊說明、程式工作流程（Database → CRUD → Middleware → API），作為 AI coding 每次觸發時的持久化載入文件 | — |
| 2 | 其他 | 建立 `.claude/skills/coding-database.md`：定義資料庫 Schema 建立與 Migration 的 coding skill，含觸發條件、輸入規格與輸出格式 | — |
| 3 | 其他 | 建立 `.claude/skills/coding-crud.md`：定義 CRUD 基礎操作的 coding skill，含觸發條件、輸入規格與輸出格式 | — |
| 4 | 其他 | 建立 `.claude/skills/coding-middleware.md`：定義 Middleware（含認證/授權）coding skill，含觸發條件、輸入規格與輸出格式 | — |
| 5 | 其他 | 建立 `.claude/skills/coding-api.md`：定義 API 邏輯層 coding skill，含觸發條件、輸入規格與輸出格式 | — |
| 6 | 其他 | 建立 `.claude/skills/subagent-python-pro.md`：定義從 open source 引入 Python-Pro subagent 的定義文件，包含 agent 來源、觸發條件與整合方式 | — |
| 7 | 其他 | 建立 `.claude/skills/subagent-fastapi-developer.md`：定義從 open source 引入 fastapi-developer subagent 的定義文件，包含 agent 來源、觸發條件與整合方式 | — |
| 8 | Test | 驗證 `CLAUDE.md` 文件完整性與可載入性 | — |
| 9 | Test | 驗證各 skill 定義文件格式正確性與觸發條件完備性 | — |
| 10 | Test | 驗證各 subagent 定義文件可正確引用外部 agent 來源 | — |

**── AI 填寫結束 ──**

## 設計決定

**⚠️ ── AI 填寫開始，請逐行審查 ──**

1. **使用 CLAUDE.md 而非獨立 structure.md**：SA 分析明確指出須將架構資訊寫入 `CLAUDE.md`，因 Claude Agent 在每次 coding 任務觸發時會自動載入此檔案，確保 AI 具備整體架構概念。

2. **Skill 以工作流程順序拆分**：根據 SA 分析的開發邏輯（Database → CRUD → Middleware → API），分別建立對應 skill 檔案，確保自動化生成程式碼順序正確、職責清晰。

3. **Subagent 採外部引用方式**：SA 指出需從 GitHub 開源 repository 引入 Python-Pro 與 fastapi-developer agent，本設計在 `.claude/skills/` 建立 subagent 定義文件說明引用來源與整合方式，而非複製完整 agent 內容，保持可維護性。

**── AI 填寫結束 ──**

## 測試案例

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | 其他 | P1-code repository 尚未存在 `CLAUDE.md` | 依工作項目 #1 建立 `CLAUDE.md` | 文件存在於 P1-code 根目錄，內容包含：資料夾/檔案架構說明、技術堆疊、程式工作流程（Database → CRUD → Middleware → API）各段落 |
| T2 | 其他 | `CLAUDE.md` 已建立 | Claude Agent 執行 coding 任務時自動載入 `CLAUDE.md` | Agent 能正確讀取架構文件，生成程式碼符合所定義的架構框架 |
| T3 | 其他 | `.claude/skills/` 目錄不存在或為空 | 依工作項目 #2 建立 `coding-database.md` | 檔案存在，包含：觸發條件（trigger）、輸入規格（需處理的 table 定義）、輸出格式（migration 檔案路徑規範） |
| T4 | 其他 | `.claude/skills/` 目錄已建立 `coding-database.md` | 依工作項目 #3 建立 `coding-crud.md` | 檔案存在，包含：觸發條件、輸入規格（CRUD 操作類型）、輸出格式（對應程式檔案結構） |
| T5 | 其他 | `.claude/skills/` 目錄已有前序 skill 檔案 | 依工作項目 #4 建立 `coding-middleware.md` | 檔案存在，包含：觸發條件（需要認證/授權的情境）、輸入規格、輸出格式（middleware 掛載位置） |
| T6 | 其他 | `.claude/skills/` 目錄已有前序 skill 檔案 | 依工作項目 #5 建立 `coding-api.md` | 檔案存在，包含：觸發條件（新增 API 端點需求）、輸入規格（API 規格文件路徑）、輸出格式（FastAPI router 結構） |
| T7 | 其他 | `.claude/skills/` 目錄已建立 | 依工作項目 #6 建立 `subagent-python-pro.md` | 檔案存在，包含：agent 名稱、GitHub 開源來源 URL、觸發條件（需要 Python 最佳實踐審查時）、整合呼叫方式 |
| T8 | 其他 | `.claude/skills/` 目錄已建立 | 依工作項目 #7 建立 `subagent-fastapi-developer.md` | 檔案存在，包含：agent 名稱、GitHub 開源來源 URL、觸發條件（FastAPI 路由/依賴注入實作時）、整合呼叫方式 |
| T9 | 其他 | 所有 skill 與 subagent 文件皆已建立 | 逐一檢查各 `.claude/skills/` 文件格式 | 每份文件均具備：標題、觸發條件、輸入規格、輸出格式四個段落，格式符合 Claude Agent SDK skill 規範 |
| T10 | 其他 | 所有文件已建立完畢 | 使用 Claude Agent 執行一次完整 coding 流程（從 Database 到 API） | Agent 依序呼叫 coding-database → coding-crud → coding-middleware → coding-api skills，生成符合架構規範的程式碼 |

**── AI 填寫結束 ──**
