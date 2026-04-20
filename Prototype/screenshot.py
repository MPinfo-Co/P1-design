#!/usr/bin/env python3
"""
截圖 MP-Box HTML prototype 的每個頁面。
用法：
    python screenshot.py
    python screenshot.py --file MP-Box_資安專家_v73_claude.html
    python screenshot.py --width 1440 --height 900
"""
import argparse
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAGES = [
    {
        "name": "login",
        "description": "登入頁",
        "setup": None,
    },
    {
        "name": "ai-partner-selector",
        "description": "AI 夥伴選擇",
        "setup": "login",
    },
    {
        "name": "ai-partner-list",
        "description": "安全事件清單",
        "setup": "login_and_open_expert",
    },
    {
        "name": "ai-partner-detail",
        "description": "安全事件詳情",
        "setup": "login_and_open_detail",
    },
    {
        "name": "kb",
        "description": "知識庫",
        "setup": "login_and_page",
        "page_id": "kb",
    },
    {
        "name": "account",
        "description": "帳號管理",
        "setup": "login_and_page",
        "page_id": "account",
    },
    {
        "name": "role",
        "description": "角色管理",
        "setup": "login_and_page",
        "page_id": "role",
    },
    {
        "name": "ai-config",
        "description": "AI 夥伴管理",
        "setup": "login_and_page",
        "page_id": "aiConfig",
    },
]


def do_login(page):
    page.fill("#loginUser", "rex")
    page.fill("#loginPass", "123")
    page.click(".login-btn")
    page.wait_for_selector("#appInterface", state="visible")


def screenshot_all(html_file: Path, output_dir: Path, width: int, height: int):
    # 注意：部分頁面使用固定 wait_for_timeout，在極慢的環境下可能截到中間狀態。
    chrome = Path(CHROME_PATH)
    if not chrome.exists():
        print(f"找不到 Chrome：{CHROME_PATH}")
        print("請確認 Google Chrome 已安裝於 /Applications/")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)
    file_url = html_file.resolve().as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
        )
        valid_setups = {None, "login", "login_and_open_expert", "login_and_open_detail", "login_and_page"}
        for page_cfg in PAGES:
            assert page_cfg.get("setup") in valid_setups, f"未知 setup: {page_cfg.get('setup')}"
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            page.goto(file_url)
            page.wait_for_load_state("networkidle")

            setup = page_cfg["setup"]

            if setup == "login":
                do_login(page)
            elif setup == "login_and_open_expert":
                do_login(page)
                page.evaluate("openSecurityExpert()")
                page.wait_for_timeout(300)
            elif setup == "login_and_open_detail":
                do_login(page)
                page.evaluate("openSecurityExpert()")
                page.wait_for_timeout(200)
                page.locator("#issueTableBody tr").first.click()
                page.wait_for_timeout(300)
            elif setup == "login_and_page":
                do_login(page)
                page_id = page_cfg["page_id"]
                page.evaluate(f"showPage('{page_id}')")
                page.wait_for_timeout(300)

            out_path = output_dir / f"{page_cfg['name']}.png"
            page.screenshot(path=str(out_path), full_page=False)
            print(f"  截圖完成：{out_path.name}  ({page_cfg['description']})")
            context.close()

        browser.close()


def main():
    parser = argparse.ArgumentParser(description="截圖 HTML Prototype 每個頁面")
    parser.add_argument(
        "--file",
        default="MP-Box_資安專家_v73_claude.html",
        help="HTML 檔案名稱（相對於此腳本目錄）",
    )
    parser.add_argument("--width", type=int, default=1440, help="視窗寬度（預設 1440）")
    parser.add_argument("--height", type=int, default=900, help="視窗高度（預設 900）")
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    html_file = script_dir / args.file
    output_dir = script_dir / "screens"

    if not html_file.exists():
        print(f"找不到檔案：{html_file}")
        sys.exit(1)

    print(f"來源：{html_file.name}")
    print(f"輸出：{output_dir}/")
    print(f"解析度：{args.width}x{args.height}")
    print()
    screenshot_all(html_file, output_dir, args.width, args.height)
    print("\n完成！")


if __name__ == "__main__":
    main()
