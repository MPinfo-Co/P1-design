# 業務邏輯分析：[Epic] Prototype 介面風格優化

## 需求說明
## 功能說明

現有 Prototype 介面的視覺風格過於寬鬆、圓角偏大、字重層次不清，影響整體質感。
本 Epic 針對 `_style.css`、`_nav.js` 及各 HTML 頁面進行統一的視覺收緊與層次調整，
不改變任何功能邏輯，僅調整視覺呈現。

設計規格：`docs/superpowers/specs/2026-04-28-ui-style-refine-design.md`

## 驗收條件

- [ ] Header 高度縮小至 38px，頁面標題顯示於 Header 左側（最大、最深的字）
- [ ] `admin@mp.com` 顯示於 Header 右側、登出按鈕左邊；側欄底部移除 email
- [ ] 卡片圓角 4px、按鈕圓角 3px，整體偏方正
- [ ] 按鈕與輸入框高度約 24px，不再過高
- [ ] 表格列 padding 縮小（上下 6px），資訊密度提升
- [ ] `detail-block-header` 改為 `font-weight:500`，不再粗體
- [ ] 表格 `td` 文字一律 `font-weight:400`
- [ ] `filter-label`（如「關鍵字搜尋:」）改為深色粗體
- [ ] 各頁面移除重複的 h2 頁面標題列
- [ ] 「新增」類主要操作按鈕移至 filter bar 右側，與「套用」並排
- [ ] 卡片之間 `margin-bottom` 縮小至 5px

## 畫面/操作邏輯示意（選填）
