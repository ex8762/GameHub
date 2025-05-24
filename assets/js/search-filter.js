// 搜尋功能
function initializeSearch() {
    const gameSearch = document.getElementById('gameSearch');
    const clearSearch = document.getElementById('clearSearch');
    const gameSections = document.querySelectorAll('.game-section');

    if (!gameSearch || !clearSearch) {
        console.warn('搜尋元素未找到');
        return;
    }

    gameSearch.addEventListener('input', () => {
        const searchTerm = gameSearch.value.toLowerCase();
        gameSections.forEach(section => {
            const title = section.querySelector('h2')?.textContent.toLowerCase() || '';
            const description = section.querySelector('.game-description')?.textContent.toLowerCase() || '';
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    });

    clearSearch.addEventListener('click', () => {
        gameSearch.value = '';
        gameSections.forEach(section => {
            section.style.display = 'block';
        });
    });
}

// 分類過濾功能
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryTags = document.querySelectorAll('.category-tag');
    const gameSections = document.querySelectorAll('.game-section');

    function filterGames(category) {
        gameSections.forEach(section => {
            const categories = section.dataset.categories?.split(' ') || [];
            if (category === 'all' || categories.includes(category)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGames(btn.dataset.filter);
        });
    });

    categoryTags.forEach(tag => {
        tag.addEventListener('click', () => {
            categoryTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterGames(tag.dataset.category);
        });
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
    initializeFilters();
});
