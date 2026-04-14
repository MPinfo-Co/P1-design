# 程式碼命名規則

- **產品功能檔名（`.py` / `.tsx` / `.jsx` / `.js`）**：以 `{domain}_{NN}_{semantic}` 為前綴
  - 只有一個語意名稱時可省略 semantic，例：`auth_01.py`
  - 多個檔案屬同一編號時以 semantic 區分，例：`expert_01_ssb_client.py`
- **共用 / 框架檔案**：不加前綴，保留原檔名。清單詳見 `Spec/framework/`
- **Spec 檔名（`.md`）**：放於對應 domain 子目錄，例：`Spec/auth/auth_01_auth.md`
- **pytest 檔名**：以 `test_{domain}_{NN}.py` 命名，一個子功能一個測試檔
  - 例：`test_auth_01.py`、`test_expert_01.py`
