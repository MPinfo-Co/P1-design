# 業務邏輯分析：P1-code增設structure.md文件

## 需求說明
### 需求說明
目前程式尚未有程式架構文件，需於P1-code repository建立文件

### 建立MP-Box產品 程式架構文件
包含以下文件:
1. 主要程式架構文件，並因需在每次程式碼自動產生皆須載入，將程式架構資訊寫於P1-code/CLAUDE.md
2. .claude/skills 中增設所需skills
3. .claude/skills 中增設所需subagent

## 畫面/操作邏輯示意（選填）
無
**⚠️ ── AI 填寫開始，請逐行審查 ──**

本需求屬於內部開發工具與文件建置，不涉及一般使用者操作介面，無需描述畫面操作邏輯。

以下就三項需求內容說明業務目標與預期效益：

### 1. 主要程式架構文件（structure.md）

**業務目標：** 建立一份描述 MP-Box 產品整體程式架構的參考文件，使開發團隊成員能快速理解專案的模組組成、目錄結構與各層職責。

**預期內容範疇：**
- 專案根目錄結構與各目錄用途說明
- 主要功能模組（auth、expert、partner、km、fn_user、fn_role、framework 等）的職責與相互關係
- 前後端分層說明（如 API 層、服務層、資料存取層）
- 與 AI 工具（Claude Agent SDK）整合的架構位置說明

**效益：** 新進開發者可透過此文件在短時間內掌握整體架構，降低理解成本，並作為後續設計決策的基準依據。

### 2. 在 .claude/skills 中增設所需 skills

**業務目標：** 在 `.claude/skills/` 目錄下新增 skill 定義檔，讓 Claude Agent 能在自動化流程中被呼叫執行特定的重複性任務。

**預期效益：**
- 將常見的 SA 分析、SD 設計、程式碼審查等工作封裝為可複用的 skill
- 確保各 skill 有明確的觸發條件（trigger）、輸入規格與輸出格式，減少人工介入
- 提升開發流程的一致性與可維護性

**判斷依據：** 根據現有 functionList.md 所列功能範疇，優先為尚未開始或規劃中的功能（partner、km、fn_user、fn_role、framework）補充對應的自動化 skill。

### 3. 在 .claude/skills 中增設所需 subagent

**業務目標：** 在 `.claude/skills/` 目錄下新增 subagent 定義，讓主 Agent 可將子任務委派給專門的 subagent 處理，實現多層次的 AI 協作分工。

**預期效益：**
- 主 Agent 聚焦於任務協調與決策，subagent 負責執行細節（如查詢資料庫、產生文件片段、驗證規格）
- 各 subagent 具備明確的職責範圍與輸入/輸出規格，避免職責重疊
- 降低單一 Agent 的上下文負擔，提高執行效率與準確性

**效益：** 建立清晰的 Agent 分工架構，使 MP-Box 的 AI 輔助開發流程更加穩健且易於擴充。

**── AI 填寫結束 ──**
