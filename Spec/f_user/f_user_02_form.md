# f_user_02 — 帳號表單

## 畫面名稱：新增模式

## 畫面

> 圖檔：`Screen/f_user_02_form.png`（待補）

以 Modal 呈現，標題「新增帳號」。

## 欄位說明

| 欄位 | 元件 | 必填 | 驗證規則 | 預設值 |
|---|---|---|---|---|
| 名稱 | text input | 是 | 不可空白，最長 100 字 | 空白 |
| Email | text input | 是 | email 格式，系統內不可重複 | 空白 |
| 密碼 | text input | 是 | 最少 8 字元 | 空白 |
| 角色 | checkbox group | 是 | 至少選一個 | 全不選 |

> 角色選項來源：roles 表所有角色，含「全選」切換按鈕。

## 操作說明

**[全選]**（角色區塊內連結）
- 切換角色 checkbox 全選 / 全不選

**[取消]**
- 關閉 Modal → 回查詢模式，不儲存

**[儲存]**
- → `Api/f_user_add.api.md`
  - 傳入：name、email、password、role_ids
  - 成功：關閉 Modal，重新整理清單
  - 失敗（email 重複）：Email 欄位下方顯示「此 Email 已被使用」
  - 失敗（其他）：顯示通用錯誤訊息

---

## 畫面名稱：修改模式

與新增模式之差異：

| 項目 | 新增模式 | 修改模式 |
|---|---|---|
| Modal 標題 | 新增帳號 | 編輯帳號 |
| 欄位初始值 | 空白 | 帶入現有資料（姓名、Email、已指派角色） |
| 密碼欄位 | 顯示（必填） | 不顯示（密碼修改為獨立功能） |
| [儲存] API | `Api/f_user_add.api.md` | `Api/f_user_update.api.md`（傳入 user_id） |
