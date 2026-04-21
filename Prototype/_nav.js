// _nav.js — 注入共用 sidebar / header，設定 active 狀態
// 各頁面在 <body> 上加 data-page="ai-partner" 等屬性來控制 active 項目

(function() {
    const sidebarHTML = `
    <div class="sidebar">
        <div class="sidebar-brand" onclick="location.href='ai-partner.html'" style="cursor:pointer;user-select:none;">
            MP-Box
        </div>
        <ul class="nav-menu">
            <li class="nav-item" id="nav-aiPartner" onclick="location.href='ai-partner.html'">
                <svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 13h0M15 13h0" stroke-width="3" stroke-linecap="round"/><path d="M12 2v4M2 12h2M20 12h2"/></svg> AI夥伴
            </li>
            <li class="nav-item" id="nav-kb" onclick="location.href='kb.html'">
                <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 知識庫
            </li>
            <li class="nav-item" id="nav-settings" onclick="toggleSubmenu('settingSubmenu')">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> 設定 ▾
            </li>
            <ul id="settingSubmenu" class="nav-submenu">
                <li class="submenu-item" onclick="location.href='fn_user.html'">帳號</li>
                <li class="submenu-item" onclick="location.href='fn_role.html'">角色</li>
                <li class="submenu-item" onclick="location.href='settings-ai.html'">AI夥伴管理</li>
            </ul>
        </ul>
        <div style="padding:12px 25px;font-size:11px;color:#475569;border-top:1px solid #1e293b;">prototype</div>
    </div>`;

    const headerHTML = `
    <div class="header">
        <div style="font-weight:800;font-size:18px;color:#0f172a;" id="pageTitle">MP-Box</div>
        <div class="header-actions">
            <div class="logout-btn" onclick="logout()">登出</div>
        </div>
    </div>`;

    function init() {
        if (!requireAuth()) return;
        const app = document.getElementById('appContainer');
        if (!app) return;
        app.insertAdjacentHTML('afterbegin', sidebarHTML + headerHTML);

        // 設定 active nav item
        const page = document.body.dataset.page || '';
        const navMap = {
            'ai-partner': 'nav-aiPartner',
            'ai-detail':  'nav-aiPartner',
            'kb':         'nav-kb',
            'fn_user': 'nav-settings',
            'fn_role': 'nav-settings',
            'settings-ai':      'nav-settings'
        };
        const activeId = navMap[page];
        if (activeId) {
            const el = document.getElementById(activeId);
            if (el) el.classList.add('active');
        }

        // 設定頁面標題
        const titleMap = {
            'ai-partner':      'AI夥伴',
            'ai-detail':       '事件詳情',
            'kb':              '知識庫',
            'fn_user': '帳號',
            'fn_role': '角色',
            'settings-ai':     'AI夥伴管理'
        };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl && titleMap[page]) titleEl.innerText = titleMap[page];

    }

    function toggleSubmenu(id) {
        document.getElementById(id).classList.toggle('open');
    }

    // 頁面載入後執行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露 toggleSubmenu 到全域（HTML onclick 使用）
    window.toggleSubmenu = toggleSubmenu;
})();
