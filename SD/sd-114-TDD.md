# TDD：[SD] Prototype 介面風格優化

## 工作項目
| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | 畫面 | 調整 `frontend/src/pages/fn_user/FnUserList.tsx`：移除頁面標題 Box（含 `<Typography variant="h6">使用者管理</Typography>` 與「新增使用者」Button 的外層 Box） | `Prototype/fn_user.html` |
| 2 | 畫面 | 調整 `frontend/src/pages/fn_user/FnUserList.tsx`：「新增使用者」`<Button>` 移至 filter bar Box 最後一個子元素，加 `sx={{ ml: 'auto' }}` 使其靠右 | `Prototype/fn_user.html` |
| 3 | 畫面 | 調整 `frontend/src/pages/fn_user/FnUserList.tsx`：filter bar Box sx 改為 `bgcolor: '#f1f5f9'`、`borderRadius: '4px'`、`padding: '5px 12px'`、`flexWrap: 'nowrap'`、`mb: '5px'` | `Prototype/_style.css` |
| 4 | 畫面 | 調整 `frontend/src/pages/fn_user/FnUserList.tsx`：名稱欄 renderCell `fontWeight` `600` → `400`；DataGrid sx 補充 `'& .MuiDataGrid-columnHeaders': { bgcolor: '#f1f5f9' }` | `Prototype/_style.css` |

## 測試案例
| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | 畫面 | 開啟使用者管理頁（已登入） | 檢視主內容區頂端 | 無獨立頁面標題列，主內容區直接由 filter bar 開始 |
| T2 | 畫面 | 開啟使用者管理頁（已登入） | 檢視 filter bar | 「新增使用者」按鈕位於 filter bar 最右側，與「套用」並排同列 |
| T3 | 畫面 | 開啟使用者管理頁（已登入） | 檢視 filter bar 背景色 | Filter bar 背景色為 `#f1f5f9`，與表格標題列（column headers）同色 |
| T4 | 畫面 | 開啟使用者管理頁（已登入） | 檢視表格名稱欄文字 | 名稱文字 font-weight 為 400，非粗體 |
| T5 | 畫面 | 開啟使用者管理頁（已登入） | 檢視表格標題列 | Column headers 背景色為 `#f1f5f9`，與 filter bar 視覺齊平 |

**⚠️ ── AI 填寫開始，請逐行審查 ──**

### 設計決定說明

**工作項目 1（移除頁面標題 Box）**：頁面標題由 Header layout 統一顯示（設計規格：Header 左側為最大最深字），主內容區不重複。Header layout 元件為獨立 Epic，本次不涉及。

**工作項目 2（新增按鈕移至 filter bar 右側）**：將操作按鈕與篩選條件收進同一列，減少頁面層次，與 Prototype 規格一致。

**工作項目 3（filter bar 樣式）**：底色 `#f1f5f9` 與表格標題列同色，視覺上形成連貫的操作區；padding 收緊使其高度與表格標題列等高。

**工作項目 4（DataGrid column headers）**：MUI DataGrid 的標題列預設底色為白色，需透過 sx override 改為 `#f1f5f9` 以符合規格。

**範圍說明**：本 TDD 僅涵蓋 P1-code 中已存在的 `fn_user` 頁面。其餘頁面（fn_role、events、kb 等）尚未實作，待各頁面對應 Issue 時再依此規格建立。

**── AI 填寫結束 ──**
