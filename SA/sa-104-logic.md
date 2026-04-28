# 業務邏輯分析：SA/SD Orchestrator + Reviewer 流程驗證

## 需求說明
驗證 SA 和 SD 新加入 orchestrator + reviewer 機制後，完整自動化流程能正常運作。

測試範圍：
1. Epic 觸發後，SA orchestrator 能自動執行 writer → reviewer 迴圈（最多 2 輪）
2. SA reviewer 正確審查 SA 分析文件品質
3. SA merge 後，SD orchestrator 能自動執行 writer → reviewer 迴圈（最多 3 輪）
4. SD reviewer 正確審查 TDD 工作項目與測試案例
5. 全程無人工介入，最終產出符合規範

## 畫面/操作邏輯示意（選填）

**⚠️ ── AI 填寫開始，請逐行審查 ──**

本需求為系統自動化流程驗證，無使用者操作畫面。以下以業務語言說明各場景的預期行為：

### 場景一：SA orchestrator 迴圈行為

Epic 需求建立後，系統自動啟動 SA 撰寫流程，無需任何人工介入。orchestrator 依序指派 SA writer 產出分析文件，再交由 SA reviewer 審查。若審查未通過，orchestrator 自動發起下一輪修改；最多執行 2 輪後，無論結果如何，流程即告終止。每一輪的啟動與銜接均由系統自行完成，不等待人工確認。

### 場景二：SA reviewer 審查行為

SA reviewer 接收 SA writer 產出的分析文件後，依照 SA 文件品質規範逐項檢核。審查結果明確區分「通過」與「未通過」兩種狀態：通過時流程進入下一階段；未通過時，reviewer 提供具體回饋，orchestrator 據此重新指派 writer 修正。reviewer 的判斷標準須與 SA 規範保持一致，不得遺漏必填項目或放行不符格式的產出。

### 場景三：SD orchestrator 迴圈行為

SA 文件審查通過並完成合併後，系統自動啟動 SD 撰寫流程，同樣無需人工介入。orchestrator 指派 SD writer 產出 TDD 工作項目與測試案例，再交由 SD reviewer 審查。若審查未通過，orchestrator 自動發起下一輪修改；最多執行 3 輪後，流程終止。SA 合併到 SD 流程啟動之間的銜接由系統自動觸發。

### 場景四：SD reviewer 審查行為

SD reviewer 接收 SD writer 產出的 TDD 工作項目與測試案例後，依照 SD 規範逐項檢核。審查結果同樣區分「通過」與「未通過」：通過時流程結束；未通過時，reviewer 提供具體回饋，orchestrator 據此重新指派 writer 修正。reviewer 必須確認測試案例完整對應需求場景，且工作項目拆分合理。

### 場景五：全程無人工介入

從 Epic 觸發到最終 SD 產出，整個流程不依賴任何人工操作或手動確認。orchestrator 負責流程推進，reviewer 負責品質把關，writer 負責內容產出，三個角色各司其職、自動銜接。最終交付的 SA 分析文件與 SD TDD 工作項目，均須符合各自的規範要求，方視為流程成功完成。

**── AI 填寫結束 ──**
