# TDD：[SD] SA/SD Orchestrator + Reviewer 流程驗證

## 工作項目

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | 其他 | 建立 SA orchestrator：依序呼叫 SA writer → SA reviewer，最多執行 2 輪；SA reviewer 通過後進入下一階段，否則重新指派 writer 修正 | `SA/sa-104-logic.md` 場景一 |
| 2 | 其他 | 建立 SA reviewer agent：依照 SA 文件品質規範逐項檢核 `sa-{N}-logic.md`，回傳「通過／未通過 + 具體回饋」 | `SA/sa-104-logic.md` 場景二 |
| 3 | 其他 | 建立 SD orchestrator：SA merge 後自動觸發，依序呼叫 SD writer → SD reviewer，最多執行 3 輪；SD reviewer 通過後流程結束，否則重新指派 writer 修正 | `SA/sa-104-logic.md` 場景三 |
| 4 | 其他 | 建立 SD reviewer agent：依照 SD 規範逐項檢核 `sd-{N}-TDD.md`，確認工作項目拆分合理且測試案例完整對應需求場景，回傳「通過／未通過 + 具體回饋」 | `SA/sa-104-logic.md` 場景四 |
| 5 | Test | 驗證 SA orchestrator 迴圈上限：第 2 輪結束後無論 reviewer 結果為何，流程即終止 | `SA/sa-104-logic.md` 場景一 |
| 6 | Test | 驗證 SD orchestrator 迴圈上限：第 3 輪結束後無論 reviewer 結果為何，流程即終止 | `SA/sa-104-logic.md` 場景三 |
| 7 | Test | 驗證全程無人工介入：從 Epic 觸發到最終 SD TDD 產出，不出現等待人工確認的中斷點 | `SA/sa-104-logic.md` 場景五 |

**── AI 填寫結束 ──**

## 測試案例

**⚠️ ── AI 填寫開始，請逐行審查 ──**

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | 其他 | Epic 需求已建立，SA orchestrator 尚未啟動 | 系統觸發 SA orchestrator 啟動 | SA writer 被自動指派，產出 `sa-{N}-logic.md`；無需任何人工操作 |
| T2 | 其他 | SA writer 已產出 `sa-{N}-logic.md` | SA reviewer 執行審查，文件符合 SA 規範所有必填項目 | SA reviewer 回傳「通過」，orchestrator 將流程推進至下一階段 |
| T3 | 其他 | SA writer 已產出 `sa-{N}-logic.md` | SA reviewer 執行審查，文件缺少必填欄位或格式不符規範 | SA reviewer 回傳「未通過 + 具體回饋」，orchestrator 重新指派 writer 修正（第 2 輪） |
| T4 | 其他 | SA orchestrator 已執行第 2 輪，SA reviewer 仍回傳「未通過」 | 第 2 輪結束 | SA orchestrator 終止流程，不發起第 3 輪；輸出最終狀態紀錄 |
| T5 | 其他 | SA 文件已通過 reviewer 審查並完成合併 | 系統觸發 SD orchestrator 啟動 | SD writer 被自動指派，產出 `sd-{N}-TDD.md`；SA merge 到 SD 啟動之間無人工介入 |
| T6 | 其他 | SD writer 已產出 `sd-{N}-TDD.md` | SD reviewer 執行審查，工作項目拆分合理且測試案例完整對應需求場景 | SD reviewer 回傳「通過」，orchestrator 結束流程 |
| T7 | 其他 | SD writer 已產出 `sd-{N}-TDD.md` | SD reviewer 執行審查，測試案例未完整對應需求場景或工作項目拆分不合理 | SD reviewer 回傳「未通過 + 具體回饋」，orchestrator 重新指派 writer 修正（下一輪） |
| T8 | 其他 | SD orchestrator 已執行第 3 輪，SD reviewer 仍回傳「未通過」 | 第 3 輪結束 | SD orchestrator 終止流程，不發起第 4 輪；輸出最終狀態紀錄 |
| T9 | 其他 | Epic 已建立，SA 及 SD orchestrator 均設定完成 | 執行完整端到端流程（Epic 觸發 → SA 產出 → SA review 通過 → SA merge → SD 產出 → SD review 通過） | 全程不出現等待人工確認的中斷點；最終 SA 分析文件與 SD TDD 工作項目均符合各自規範 |

**── AI 填寫結束 ──**
