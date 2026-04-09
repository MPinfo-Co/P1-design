# Spec：初始資料 Migration（roles + admin 帳號）

## 概述

新增一個 Alembic data migration，在 `alembic upgrade head` 時自動插入預設角色與 admin 帳號，解決 Production 首次部署後無法登入的問題。

## Migration 資訊

| 欄位 | 值 |
|------|----|
| 檔案命名 | `{revision_id}_seed_initial_roles_and_admin.py` |
| `down_revision` | `4ccbef57de2b`（目前 HEAD） |
| 邏輯依賴 | `5db1ff7f746b`（users / roles / user_roles 建表） |

## 插入資料

### roles 表

| name | can_access_ai | can_use_kb | can_manage_accounts | can_manage_roles | can_edit_ai | can_manage_kb |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| admin | true | true | true | true | true | true |
| user  | true | true | false | false | false | false |

### users 表

| name | email | password_hash | is_active |
|------|-------|--------------|:---------:|
| Admin | admin@mpinfo.com.tw | bcrypt("admin123")，執行時計算 | true |

### user_roles 表

| user_id | role_id |
|---------|---------|
| admin user 的 id | admin role 的 id |

## 冪等設計

每次插入前先查詢是否存在，已存在則略過：

```python
# roles 冪等
for role in default_roles:
    exists = conn.execute(
        sa.text("SELECT id FROM roles WHERE name = :name"),
        {"name": role["name"]}
    ).fetchone()
    if not exists:
        conn.execute(sa.text("INSERT INTO roles ..."), role)

# users 冪等
admin_user = conn.execute(
    sa.text("SELECT id FROM users WHERE email = :email"),
    {"email": "admin@mpinfo.com.tw"}
).fetchone()
if not admin_user:
    # INSERT INTO users ...
    # INSERT INTO user_roles ...
```

## downgrade

刪除 admin@mpinfo.com.tw 的 user_roles、users 記錄，以及 name IN ('admin', 'user') 的 roles 記錄（若存在）。

## 注意事項

- `password_hash` 使用 `bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()` 於 migration 執行時動態計算，不寫死 hash 字串
- 預設密碼 `admin123` 部署後應立即更改
- `seed.py` 保留不刪除，可繼續作為本機開發環境的初始化腳本
