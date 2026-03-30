# P1-design — 系統設計（SD）

P1 產品的系統設計文件庫。存放 API 規格、畫面原型、資料庫 Schema 與測試計劃。

## 在四 Repo 流程中的角色

```
P1-project（PM）→ P1-analysis（SA）
    └─ A-workflow 自動建立 SD Issue + D-Branch + Draft PR
        └─ P1-design（SD）  ← 你在這裡
            └─ SD merge → D-workflow 自動建立 PG Issue
                └─ P1-code（PG／AI）
```

## 目錄結構

```
P1-design/
├── FunctionList.md               # 產品功能清單
├── TechStack.md                  # 技術棧選型
├── schema/                       # 資料庫 Schema（活文件，永遠反映最新狀態）
├── Prototype/                    # UI 原型 HTML（活文件，永遠反映最新狀態）
├── Spec/                         # API 與畫面規格文件（活文件）
└── TestPlan/
    ├── issue-{N}.md              # 測試案例（SA trigger 時系統建立框架，SD 填寫案例）
    └── issue-{N}-diff.md         # 本次異動摘要（SD merge 時系統自動產生）
```

## SD 工作起點

收到 SD Issue 後：

1. Pull 分支（Issue body 中有分支連結）
2. 修改 `Prototype/`、`Spec/`、`schema/`（活文件，直接改最新版）
3. 在 `TestPlan/issue-{N}.md` 填寫測試案例（最低要求：每個 API 各一個成功 + 失敗案例）
4. Push → Draft PR 已自動建立，確認後轉 **Ready for Review**
5. Merge 後系統自動建立 PG Issue，SD Issue 自動關閉

**Branch 命名：** `issue-{N}-{slug}`（由系統建立，不手動建立）

## 各資料夾說明

| 資料夾 / 檔案 | 內容 |
|---|---|
| `Prototype/` | UI 原型 HTML，直接修改最新版（不保留舊版） |
| `Spec/` | API 與畫面規格 Markdown，直接修改最新版 |
| `schema/` | 資料庫 Schema DDL 與實體分析 |
| `TestPlan/issue-{N}.md` | 測試案例，系統建立框架，SD 填寫 |
| `TestPlan/issue-{N}-diff.md` | merge 時自動產生，記錄本次異動檔案清單 |

## 完整工作流程規範

請參考 [P1-project/docs/github-workflow/quick-start.md](https://github.com/MPinfo-Co/P1-project/blob/main/docs/github-workflow/quick-start.md)
