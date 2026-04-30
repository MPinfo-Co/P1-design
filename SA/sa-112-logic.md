# 業務邏輯分析：P1-code增設structure.md文件

## 需求說明
### 需求說明
目前程式尚未有程式架構文件，需於P1-code repository建立S

### 建立MP-Box產品 程式架構文件
針對後端為利PG階段程式能自動產生且符合 SD 文件，增設相關文件
包含以下文件:
1. 主要程式架構文件，並因需在每次程式碼自動產生皆須載入，將程式架構資訊寫於P1-code/CLAUDE.md
2. .claude/skills 中增設所需skills
3. .claude/skills 中增設所需subagent，由github抓取適當agent使用

## 畫面/操作邏輯示意（選填）
無
**⚠️ ── AI 填寫開始，請逐行審查 ──**

本需求屬於內部開發工具與文件建置，不涉及一般使用者操作介面，無需描述畫面操作邏輯。

以下就三項需求內容說明業務目標與預期效益：

### 1. 主要程式架構文件（structure.md）

**業務目標：** 在P1-code repositroy增加架構文件，目前使用CLAUDE.md作為持久化文件，每次AI觸發coding皆能載入程式框架進行後續程式碼生成。

**預期內容範疇：**
- CLAUDE.md文件包含整體程式框架，含資料夾/檔案架構以及程式工作流程。
- 提高後續生成內容可維護性。

**效益：** 新進開發者可透過此文件在短時間內掌握整體架構，降低理解成本，並作為後續自動生成程式碼提供框架指引

### 2. 在 .claude/skills 中增設所需 skills

**業務目標：** 在 `.claude/skills/` 目錄下新增 skill 定義檔，讓 Claude Agent 能在自動化流程中被呼叫執行特定的重複性任務。

**預期效益：**
- LLM具有整體程式架構概念，明確各新增需求要寫在何程式區塊
- 確保各 skill 有明確的觸發條件（trigger）、輸入規格與輸出格式，減少人工介入
- 提升開發流程的一致性與可維護性
- 生成程式碼順序符合程式開發邏輯(Database -> CRUD -> Middleware邏輯 -> API邏輯)

**判斷依據：** 根據現有 functionList.md 所列功能範疇，規劃處理database creating, database migration, authentic coding, middleware coding等，依更細項目規劃 coding skills

### 3. 在 .claude/skills 中增設所需 subagent

**業務目標：** 在 `.claude/skills/` 目錄下新增 subagent 定義，讓主 Agent 可將子任務委派給專門的 subagent 處理，實現多層次的 AI 協作分工。

**預期效益：**
- 建立coding subagent 架構，方便後續擴充
- 由open source github repository 找符合MP-Box需要agent(Python-Pro, fastapi-developer)，增加Generative code品質

**效益：** 後續程式AI產出可以有更佳品質

**── AI 填寫結束 ──**
