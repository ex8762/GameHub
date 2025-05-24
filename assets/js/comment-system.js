// HTML 清理函數
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 保存評論到 localStorage
function saveComment(gameId, comment) {
    try {
        if (!gameId || typeof gameId !== 'string') {
            throw new Error('無效的遊戲 ID');
        }
        if (!comment || typeof comment !== 'object') {
            throw new Error('無效的評論資料');
        }

        const comments = JSON.parse(localStorage.getItem('game_comments') || '{}');
        if (!comments[gameId]) {
            comments[gameId] = [];
        }

        // 驗證評論資料
        const { username, content, rating, date } = comment;
        if (!username || !content || typeof rating !== 'number' || !date) {
            throw new Error('評論資料不完整');
        }

        // 限制評論長度
        if (content.length > 500) {
            throw new Error('評論內容過長（最多 500 字）');
        }

        // 清理 HTML
        const sanitizedComment = {
            username: sanitizeHTML(username.trim()),
            content: sanitizeHTML(content.trim()),
            rating: Math.min(Math.max(1, rating), 5),
            date: new Date().toLocaleDateString()
        };

        comments[gameId].push(sanitizedComment);
        localStorage.setItem('game_comments', JSON.stringify(comments));
        return true;
    } catch (error) {
        console.error('儲存評論時發生錯誤：', error);
        alert('無法儲存評論：' + error.message);
        return false;
    }
}

// 從 localStorage 載入評論
function loadComments() {
    try {
        const comments = JSON.parse(localStorage.getItem('game_comments') || '{}');
        Object.entries(comments).forEach(([gameId, gameComments]) => {
            const commentsList = document.getElementById(`${gameId}-comments`);
            if (!commentsList) {
                console.warn(`找不到遊戲 ${gameId} 的評論列表元素`);
                return;
            }

            // 清空現有評論
            commentsList.innerHTML = '';

            if (!Array.isArray(gameComments)) {
                console.error(`遊戲 ${gameId} 的評論資料格式錯誤`);
                return;
            }

            gameComments.forEach(comment => {
                try {
                    const sanitizedComment = {
                        username: sanitizeHTML(comment.username || ''),
                        content: sanitizeHTML(comment.content || ''),
                        rating: Math.min(Math.max(1, comment.rating || 0), 5),
                        date: sanitizeHTML(comment.date || '')
                    };

                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-username">${sanitizedComment.username}</span>
                            <span class="comment-date">${sanitizedComment.date}</span>
                        </div>
                        <div class="comment-content">${sanitizedComment.content}</div>
                        <div class="comment-rating">
                            ${Array(5).fill().map((_, i) => 
                                `<i class="${i < sanitizedComment.rating ? 'fas' : 'far'} fa-star"></i>`
                            ).join('')}
                        </div>
                    `;
                    commentsList.appendChild(commentElement);
                } catch (error) {
                    console.error('載入評論時發生錯誤：', error);
                }
            });
        });
    } catch (error) {
        console.error('載入評論時發生錯誤：', error);
    }
}

// 評論表單初始化
function initCommentForms() {
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const gameId = form.dataset.game;
                if (!gameId) throw new Error('無效的遊戲 ID');

                const username = form.querySelector('[name="username"]')?.value.trim();
                const content = form.querySelector('[name="comment"]')?.value.trim();
                const ratingElement = form.querySelector('.stars-input .fas');
                const rating = ratingElement ? parseInt(ratingElement.dataset.rating) : 0;

                if (!username || username.length < 2) throw new Error('請輸入至少 2 個字的暱稱');
                if (!content || content.length < 10) throw new Error('請輸入至少 10 個字的評論內容');
                if (!rating || rating < 1) throw new Error('請選擇評分');

                const commentData = {
                    username,
                    content,
                    rating,
                    date: new Date().toLocaleDateString()
                };

                if (saveComment(gameId, commentData)) {
                    updateGameRating(gameId, rating);
                    form.reset();
                    form.querySelectorAll('.stars-input i').forEach(star => {
                        star.classList.replace('fas', 'far');
                    });
                    loadComments(); // 重新載入所有評論
                    alert('評論發表成功！');
                }
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    initCommentForms();
    loadComments();
});
