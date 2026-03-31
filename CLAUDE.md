# CLAUDE.md

## 角色說明

P1-design 是系統設計（SD）階段的 Repo。
SD Issue 由 P1-analysis 的 a-workflow 自動建立，**不可手動建立**。

## 工作內容

收到 SD Issue 後，依「設計範圍」（自動從 SD-WBS.md 複製）完成：

1. **Prototype/** — 修改 UI 原型 HTML（活文件，直接改最新版）
2. **Spec/** — 修改 API 與畫面規格文件（活文件，直接改最新版）
3. **schema/** — 若有 Schema 異動，修改對應 DDL 文件
4. **TestPlan/issue-{N}.md** — 填寫測試案例（系統自動建立框架）

## TestPlan 最低要求

- 每個 API：至少一個成功案例（2xx）+ 一個失敗案例（4xx/5xx）
- 每個畫面：至少一個主要操作流程的正常案例
- 測試案例總數 ≥ SD-WBS.md 工作項目數

```markdown
| ID | 類型 | 前置條件 | 操作 | 預期結果 |
|----|------|---------|------|---------|
| T1 | 整合 | 已登入 | POST /api/xxx | 201，回傳 id |
| T2 | 整合 | 已登入 | POST /api/xxx（缺少必填欄位）| 422 |
```

## 活文件原則

`Spec/`、`Prototype/`、`schema/` 永遠反映最新狀態，直接修改，不保留舊版。
`TestPlan/issue-{N}.md` 是 delta record，以 Issue 為單位保存。

## Commit 格式

```
{type}({scope}): 說明
```

範例：`feat(spec): 新增 POST /api/users API 規格`

## 完整流程

請參考 [quick-start.md](https://github.com/MPinfo-Co/P1-project/blob/main/docs/workflow/quick-start.md)
