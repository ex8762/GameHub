// 主題切換功能
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('themeSwitch');
    if (!themeSwitch) return; // 如果頁面沒有主題切換按鈕，則不執行後續操作

    const themeIcon = themeSwitch.querySelector('i');

    // 檢查是否有保存的主題設定或系統偏好
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
        // 更新ARIA標籤
        themeSwitch.setAttribute('aria-label', theme === 'dark' ? '切換淺色模式' : '切換深色模式');
    }

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // 預設為淺色主題
    }

    // 主題切換事件 - 支援鍵盤訪問
    themeSwitch.addEventListener('click', toggleTheme);
    themeSwitch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // 監聽系統主題變化
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) { // 僅當用戶未手動設定主題時才跟隨系統
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });
});
