// _state.js — sessionStorage 登入狀態工具
const STATE_KEY = 'mpbox_user';

function getUser() {
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY)); }
    catch(e) { return null; }
}

function setUser(user) {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(user));
}

function clearUser() {
    sessionStorage.removeItem(STATE_KEY);
}

function requireAuth() {
    if (!getUser()) {
        location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    clearUser();
    location.href = 'login.html';
}
