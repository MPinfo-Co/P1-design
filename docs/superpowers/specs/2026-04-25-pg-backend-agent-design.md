# PG Backend Agent 設計文件

## 目標

設計一套 agent 系統，能依據 SD 文件（TDD、SA logic、Spec、schema）自動撰寫後端 code，並驗證產出與規格的一致性，最終產出 TestReport。

---

## 範圍

- 對象：PG issue 專用（後端 agent）
- 測試案例：issue-66（使用者維護功能）
- 前端 agent 為獨立專案，本文件不涵蓋

---

## 架構

### 三個元件

| 元件 | 職責 |
|---|---|
| **Orchestrator** | 控制流程、傳遞 feedback、管理重試 |
| **寫作 agent** | 讀 SD 文件 → 產出 DB model、FastAPI route、pytest |
| **驗證 agent** | 讀 SD 文件 + code → 比對規格合規 + 跑 pytest → 產出結構化報告或 TestReport |

### 呼叫鏈

```
Orchestrator
  ├── 呼叫 寫作 agent（第 N 輪，帶 feedback）
  ├── 呼叫 驗證 agent
  ├── 通過 → 結束，產出 TestReport
  └── 失敗 → feedback 回寫作 agent，再試
      最多 3 輪，超過則報錯停止
```

### 實作形式

全部使用 **Claude Code Skill（markdown）**，透過 `Agent()` tool 呼叫子 agent，不需額外程式語言。

---

## 三階段部署

| Phase | 觸發方式 | 呼叫 |
|---|---|---|
| 1 | 手動 CLI | `claude "run pg-agent --issue 66"` |
| 2 | Slash command | `/pg 66` |
| 3 | GitHub Actions | SD merge 後自動觸發 |

Phase 2、3 只是包裝層，agent 邏輯完全不變。

---

## 輸入 / 輸出

### 寫作 agent

**輸入**
- issue N（+ 第二輪起的 feedback）

**讀取**
- `TDD/issue-{N}.md` — 工作項目清單
- `SA/sa-{N}-logic.md` — 商業邏輯背景
- `schema/schema.md` — DB 結構
- `Spec/fn_xxx/Api/*.md` — API 規格
- `Spec/fn_xxx/Api/_fn_xxx_test_api.md` — 測試案例
- `techStack.md` — 技術選型

**產出（本地，不 push）**
- DB model（SQLAlchemy）
- FastAPI routes
- pytest 檔案（每個 test function 標注 TestSpec ID）

### 驗證 agent

**輸入**
- issue N + 寫作 agent 產出的 code 路徑

**讀取**
- 同上所有 SD 文件
- 實際產出的 code 檔案

**執行**
- pytest

**產出**
- 失敗時：結構化 feedback（哪個 TDD 項目未實作 / 不符 Spec / pytest 失敗）
- 通過時：`TestReport/issue-{N}.md`

---

## 分支策略

| | 讀（P1-design） | 寫（P1-code） |
|---|---|---|
| Phase 1 測試 | `issue-66-issue`（未 merge） | 本地 `test/pg-agent-66`，不 push |
| Phase 3 正式 | `main`（SD merge 後） | Actions 建立的 PG branch |

---

## 人工確認流程（Phase 1）

1. 驗證 agent 產出 `TestReport/issue-66.md`（規格合規 + pytest 結果）
2. 人工讀報告 + `git diff main` 抽查 code
3. 滿意 → 手動 `git push` → 開 PR
4. 不滿意 → `git branch -D test/pg-agent-66` 清掉重跑

**Agent 本身永遠不 push**，push 動作保留給人工。

---

## 工作執行順序

```
Step 1  寫作 agent        → 驗證能讀 SD 文件並產出正確 code
Step 2  驗證 agent        → 驗證合規邏輯（正確 code + 刻意改壞的 code）
Step 3  Orchestrator      → 串接兩個 agent，測試迴圈與重試
Step 4  Phase 2 Skill     → 包裝成 /pg N slash command
Step 5  Phase 3 Actions   → 接入 GitHub Actions 自動觸發
```

---

## 測試方式

- **測試案例**：issue-66（使用者維護功能，含 4 支 API + 2 個畫面 Spec）
- **Step 1**：跑 agent，人工確認 code 對應 TDD 每個工作項目
- **Step 2**：餵正確 code（應通過）+ 手動改壞的 code（應抓出問題）
- **Step 3**：端對端跑，確認迴圈在 3 輪內收斂，產出 TestReport

---

## 成功標準

- [ ] 寫作 agent 能依 TDD 工作項目產出完整後端 code
- [ ] 驗證 agent 能抓出規格不符的問題
- [ ] Orchestrator 在 3 輪內收斂，產出 TestReport
- [ ] 全程不 push 到 remote（Phase 1）
