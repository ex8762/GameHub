// 主題切換功能
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('themeSwitch');
    const themeIcon = themeSwitch.querySelector('i');

    // 從本地儲存讀取主題設定
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeSwitch.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.classList.replace(
            newTheme === 'dark' ? 'fa-moon' : 'fa-sun',
            newTheme === 'dark' ? 'fa-sun' : 'fa-moon'
        );

        // 儲存主題設定
        localStorage.setItem('theme', newTheme);
    });
});
