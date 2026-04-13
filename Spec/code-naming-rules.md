# 程式碼命名規則

- **Python 與前端（TSX / JSX / JS）檔名**：以 `f_{domain}_{NN}_{semantic}` 為前綴（底線因 Python 模組命名限制；前端為求一致亦採用）
  - 只有一個語意名稱時可省略 semantic，例：`f_auth_01.py`
  - 多個檔案屬同一編號時以 semantic 區分，例：`f_evt_01_ssb_client.py`
- **Spec 檔名**：同樣使用底線格式，放於對應 domain 子目錄，例：`Spec/f_auth/f_auth_01_auth.md`
- **Commit message**：`feat: f-evt-01 新增事件篩選邏輯`
- **pytest 檔名**：一個功能一個測試檔，以 `test_{domain}.py` 命名
  - 例：`test_auth.py`（所有 auth API 行為）、`test_users.py`（所有 user 相關行為）、`test_migrations.py`（所有 migration 行為）
- **既有檔案改名**：見 [MPinfo-Co/P1-code#93](https://github.com/MPinfo-Co/P1-code/issues/93)
