# TDD：[SD] Prototype 介面風格優化

## 工作項目
| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | 畫面 | 調整 `_style.css`：統一 Header 高度 38px、卡片圓角 4px、按鈕圓角 3px、按鈕高度 23–24px、表格列 padding 上下 6px、`detail-block-header` font-weight:500、`td` font-weight:400、`filter-label` 深色粗體、卡片 margin-bottom 5px | `Prototype/_style.css` |
| 2 | 畫面 | 調整 `_nav.js`：Header 右側依序顯示登入 email 與登出按鈕；側欄底部移除 email（保留 prototype 標示）| `Prototype/_nav.js` |
| 3 | 畫面 | 調整 `events.html`：filter bar 內輸入框與 select 使用全域 CSS 樣式（移除 height:36px、border-radius:6px 等與設計規格衝突的 inline style）；filter label 套用深色粗體；「新增」類主操作按鈕移至 filter bar 右側 | `Prototype/events.html` |
| 4 | 畫面 | 調整 `fn_user.html`：移除主內容區重複的 h2 頁面標題列（若有）；確認「新增使用者」按鈕位於 filter bar 右側與「套用」並排 | `Prototype/fn_user.html` |
| 5 | 畫面 | 調整 `fn_role.html`：移除主內容區重複的 h2 頁面標題列（若有）；確認「新增角色」按鈕位於 filter bar 右側與「套用」並排 | `Prototype/fn_role.html` |
| 6 | 畫面 | 調整 `kb.html`：移除新增知識庫表單區的 h2 頁面標題（`<h2 style="color:#1e293b;">新增知識庫</h2>`）；知識庫詳情區的 h2 kbDetailTitle 保留（功能性標題，非頁面層級重複）| `Prototype/kb.html` |
| 7 | 畫面 | 調整 `ai-partner.html`：確認 filter bar 樣式符合全域規格；無獨立 h2 頁面標題列需移除 | `Prototype/ai-partner.html` |
| 8 | 畫面 | 調整 `settings-ai.html`：確認各設定卡片標題使用 h3 而非 h2；無頁面層級重複標題 | `Prototype/settings-ai.html` |

## 測試案例
| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | 畫面 | 開啟任意 HTML 頁面（已登入狀態） | 檢視 Header 區塊 | Header 高度為 38px，左側顯示頁面名稱（最大最深字），右側依序顯示登入 email 與「登出」按鈕 |
| T2 | 畫面 | 開啟任意 HTML 頁面（已登入狀態） | 檢視側欄底部 | 側欄底部不顯示 email，僅保留 prototype 標示文字 |
| T3 | 畫面 | 開啟任意 HTML 頁面 | 檢視所有卡片元件 | 卡片圓角為 4px、margin-bottom 為 5px |
| T4 | 畫面 | 開啟任意 HTML 頁面 | 檢視按鈕（`.btn`） | 按鈕圓角為 3px，高度約 23–24px |
| T5 | 畫面 | 開啟任意清單頁面 | 檢視表格 `<td>` 文字 | 所有 td 文字 font-weight:400（非粗體） |
| T6 | 畫面 | 開啟任意清單頁面 | 檢視 filter bar 的 label 文字 | filter label 文字為深色（`#1e293b`）且 font-weight:700 |
| T7 | 畫面 | 開啟 `events.html` | 檢視 filter bar 內 select 與 input | 高度與全域規格一致（非 36px），border-radius 為 3px（非 6px），視覺風格緊湊 |
| T8 | 畫面 | 開啟 `fn_user.html` | 檢視 filter bar | 「新增使用者」按鈕位於 filter bar 最右側，與「套用」按鈕並排於同一列 |
| T9 | 畫面 | 開啟 `fn_role.html` | 檢視 filter bar | 「新增角色」按鈕位於 filter bar 最右側，與「套用」按鈕並排於同一列 |
| T10 | 畫面 | 開啟 `kb.html` | 點擊「新增知識庫」後檢視表單區 | 表單區頂端無獨立 h2「新增知識庫」標題列（Header 左側已顯示頁面名稱） |
| T11 | 畫面 | 開啟 `events.html` | 檢視 detail-block 區塊標題（若有） | `detail-block-header` 字重為 font-weight:500，非粗體 |

**⚠️ ── AI 填寫開始，請逐行審查 ──**

### 設計決定說明

**工作項目 1（_style.css）**：`_style.css` 已於前次迭代完成大部分視覺收緊，本次 TDD 確認其為最終規格依據，不另行新增 schema 或 API 工作項目，因本 Epic 純為 Prototype 視覺調整，不涉及後端。

**工作項目 3（events.html filter bar）**：events.html 的篩選條件輸入框使用 `height:36px`、`border-radius:6px` 等 inline style 覆蓋了全域 CSS 規範（按鈕/輸入框高度 23–24px、border-radius:3px）。需移除衝突 inline style，改為依賴全域 `.filter-group select`、`.filter-group input` 規格。理由：統一視覺語言，避免各頁面各自為政。

**工作項目 6（kb.html h2 移除）**：`kbDetailTitle` h2 保留，因其為知識庫詳情頁內的功能性標題（顯示 KB 名稱），與 Header 顯示的「知識庫」不重複。移除的僅是新增知識庫表單區頂端的獨立 h2 標題（「新增知識庫」），因 Header 已在 `openKbCreate()` 中動態更新為「新增知識庫」。

**不涉及 Schema / API / Test 工作項目**：本 Epic 僅調整 Prototype HTML/CSS/JS，不新增或修改任何 API，故無需更新 `_test_api.md`，亦無 Schema 變動。

**── AI 填寫結束 ──**
