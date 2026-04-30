# TDD：[SD] [Epic] 資安專家設定功能

**⚠️ ── AI 填寫開始，請逐行審查 ──**

## 工作項目

| # | 類型 | 工作內容 | 參照規格 |
|---|------|--------|--------|
| 1 | Schema | 建立 `tb_expert_settings` | `schema/schema.md` |
| 2 | API | 建立 `partner_list_api`（GET /api/partners） | `Spec/partner/Api/partner_list_api.md` |
| 3 | API | 建立 `expert_setting_get_api`（GET /api/expert/setting） | `Spec/partner/Api/expert_setting_get_api.md` |
| 4 | API | 建立 `expert_setting_save_api`（PUT /api/expert/setting） | `Spec/partner/Api/expert_setting_save_api.md` |
| 5 | API | 建立 `expert_ssb_test_api`（POST /api/expert/ssb-test） | `Spec/partner/Api/expert_ssb_test_api.md` |
| 6 | 畫面 | 建立 `partner_00_overview`（AI 夥伴管理功能總覽） | `Spec/partner/partner_00_overview.md` |
| 7 | 畫面 | 調整 `partner_01_selection`：改寫為 AI 夥伴管理列表畫面規格 | `Spec/partner/partner_01_list.md` |
| 8 | 畫面 | 調整 `partner_02_config`：改寫為資安專家設定畫面規格 | `Spec/partner/partner_02_expert_setting.md` |
| 9 | API | 建立 `partner_weekday_options_api`（GET /api/partners/weekday-options） | `Spec/partner/Api/partner_weekday_options_api.md` |
| 10 | 畫面 | 調整 `partner_02_expert_setting`：`**星期幾**` select 欄位補標選項來源 `Api/partner_weekday_options_api.md` | `Spec/partner/partner_02_expert_setting.md` |
| 11 | Test | 建立 `_partner_test_api.md` | `Spec/partner/Api/_partner_test_api.md` |

## 設計決定

1. **SSB 密碼加密**：密碼以 AES-256 對稱加密存入 `tb_expert_settings`；API 回傳設定時，密碼欄位以固定遮罩字串（`"••••••••"`）回傳，前端不取得明碼。測試連線 API 接收明碼密碼（HTTPS 傳輸），不存入 DB。

2. **排程「每週」weekday 格式**：存整數 0–6（週日=0，週一=1，…，週六=6），符合 cron / Python weekday 慣例。觸發時間儲存為 `HH:MM` 字串。

3. **`tb_expert_settings` 設計為單列設定表**：唯一一位資安專家對應唯一一筆設定，以 `partner_id` FK 至 `tb_ai_partners` 做關聯，避免日後多夥伴擴充時設計衝突。

4. **AI 夥伴管理列表不分頁**：目前夥伴數量少（唯一為資安專家），清單採全量查詢不分頁，可依關鍵字篩選。

5. **「星期幾」select 選項以獨立 options API 提供**：依 spec-guide 規範，select 欄位須標明選項來源 API。weekday 為固定靜態選項（週一～週日），以輕量端點 `partner_weekday_options_api`（GET /api/partners/weekday-options）統一回傳，前端不硬編碼選項內容，未來如需 i18n 擴充也只需調整後端。

## 測試案例

| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|--------|------|--------|
| T1 | API | 已登入且具備 partner 功能權限，DB 有 1 筆 AI 夥伴（資安專家） | GET /api/partners | 200，data 包含 id、name、description、is_enabled |
| T2 | API | 已登入但不具備 partner 功能權限 | GET /api/partners | 403 您沒有執行此操作的權限 |
| T3 | API | 已登入且具備 partner 功能權限，DB 有 `tb_expert_settings` 記錄 | GET /api/expert/setting | 200，data 包含 schedule（frequency、time、weekday）與 ssb（host、port、logspace、username），password 欄位為遮罩 `"••••••••"` |
| T4 | API | 已登入且具備 partner 功能權限，DB 無 `tb_expert_settings` 記錄 | GET /api/expert/setting | 200，data 為預設值（frequency: daily、time: 02:00、port: 443，其餘空值） |
| T5 | API | 未登入 | GET /api/expert/setting | 401 未登入或 Token 過期 |
| T6 | API | 已登入且具備 partner 功能權限，傳入合法設定值 | PUT /api/expert/setting，傳入 frequency=daily、time=03:00、host=192.168.1.1、port=443、logspace=center、username=admin、password=secret | 200 儲存成功 |
| T7 | API | 已登入且具備 partner 功能權限 | PUT /api/expert/setting，frequency=weekly 但未傳 weekday | 400 每週排程需指定星期幾 |
| T8 | API | 已登入且具備 partner 功能權限 | PUT /api/expert/setting，port=99999 | 400 Port 需在 1–65535 範圍內 |
| T9 | API | 已登入且具備 partner 功能權限 | PUT /api/expert/setting，time 格式不合法（如 "25:00"） | 400 觸發時間格式無效 |
| T10 | API | 已登入且具備 partner 功能權限，SSB 連線成功 | POST /api/expert/ssb-test，傳入合法 host/port/logspace/username/password | 200 連線成功 |
| T11 | API | 已登入且具備 partner 功能權限，SSB 連線失敗（錯誤憑證） | POST /api/expert/ssb-test，傳入錯誤 password | 200，連線失敗訊息含原因（注意：HTTP 狀態碼仍為 200，錯誤原因放在 message 欄） |
| T12 | API | 已登入且具備 partner 功能權限 | POST /api/expert/ssb-test，host 空白 | 400 Host 為必填 |
| T13 | 畫面 | 已登入且具備 partner 功能權限，DB 有資安專家夥伴 | 進入 AI 夥伴管理列表頁（/settings/ai-partners） | 顯示資安專家列，欄位含夥伴名稱、描述、啟用狀態、[設定]按鈕 |
| T14 | 畫面 | 在 AI 夥伴管理列表頁 | 輸入關鍵字「資安」後點[套用] | 清單過濾為含「資安」的夥伴 |
| T15 | 畫面 | 在 AI 夥伴管理列表頁 | 點資安專家列的[設定]按鈕 | 進入資安專家設定頁（/settings/ai-partners/expert） |
| T16 | 畫面 | 已進入資安專家設定頁，DB 有已儲存設定 | 頁面載入 | 排程與 SSB 欄位自動帶入上次儲存的值；密碼欄顯示遮罩 |
| T17 | 畫面 | 在資安專家設定頁，觸發頻率選「每週」 | 切換觸發頻率為「每週」 | 顯示「星期幾」選擇欄位 |
| T18 | 畫面 | 在資安專家設定頁，觸發頻率選「手動」 | 切換觸發頻率為「手動」 | 觸發時間欄位 disabled，顯示提示文字 |
| T19 | 畫面 | 在資安專家設定頁，填入合法資料後點[測試連線]，SSB 回應成功 | 點[測試連線] | 顯示連線成功訊息，不觸發儲存 |
| T20 | 畫面 | 在資安專家設定頁，填入合法資料後點[儲存] | 點[儲存] | 呼叫 PUT /api/expert/setting，成功後顯示「儲存成功」提示 |
| T21 | API | 已登入 | GET /api/partners/weekday-options | 200，data 含 7 筆 { value, label }，value 範圍 0–6（週日=0，週一=1，…，週六=6） |
| T22 | API | 未登入 | GET /api/partners/weekday-options | 401 未登入或 Token 過期 |

**── AI 填寫結束 ──**
