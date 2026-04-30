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


**── AI 填寫結束 ──**

## 設計決定

**⚠️ ── AI 填寫開始，請逐行審查 ──**

1. **使用 CLAUDE.md 而非獨立 structure.md**：SA 分析明確指出須將架構資訊寫入 `CLAUDE.md`，因 Claude Agent 在每次 coding 任務觸發時會自動載入此檔案，確保 AI 具備整體架構概念。

2. **Skill 以工作流程順序拆分**：根據 SA 分析的開發邏輯（Database → CRUD → Middleware → API），分別建立對應 skill 檔案，確保自動化生成程式碼順序正確、職責清晰。

3. **Subagent 採外部引用方式**：SA 指出需從 GitHub 開源 repository 引入 Python-Pro 與 fastapi-developer agent，本設計在 `.claude/skills/` 建立 subagent 定義文件說明引用來源與整合方式，而非複製完整 agent 內容，保持可維護性。

**── AI 填寫結束 ──**

## 測試案例
無須測試
**── AI 填寫結束 ──**
