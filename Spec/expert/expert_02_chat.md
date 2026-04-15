# expert-02 聊天 UI 面板

## 對應程式碼

| 層 | 檔案 |
|----|------|
| 前端 | `pages/AiPartner/IssueDetail.jsx`（右側 Chat Panel 區塊） |

---

## 畫面說明

位於事件詳情頁（IssueDetail）右側，寬度 360px，可收合至 40px。

### 目前狀態（佔位）

右側面板已建立結構，但功能尚未實作，顯示「即將推出」提示：

- 標題：「諮詢資安專家」（含 SmartToy icon）
- 收合按鈕：展開/收合（ChevronLeft / ChevronRight）
- 內容區：顯示佔位卡片
  - 大 SmartToy icon
  - 文字：「AI 諮詢功能」
  - 說明：「即將推出 — 可針對事件詢問詳細處理步驟、技術背景或風險評估」

### 預計功能（未實作）

- 使用者可針對當前事件輸入問題
- AI 回覆處理步驟、技術背景、風險評估
- 對話歷史保存（見 expert-04）
