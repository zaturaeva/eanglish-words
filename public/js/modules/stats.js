import api from '../api.js';

export function renderStats() {
    const container = document.getElementById('screen-container');
    container.innerHTML = '<div class="loading">Загрузка статистики...</div>';
    loadStats();

    async function loadStats() {
        try {
            const stats = await api.get('/stats');
            container.innerHTML = `
                <div class="stats-full">
                    <h2>Статистика</h2>
                    <div class="stats-summary">
                        <div class="stat-card">
                            <div class="stat-value">${stats.total_cards}</div>
                            <div class="stat-label">Всего карточек</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.learned_cards}</div>
                            <div class="stat-label">Изучено</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.streak}</div>
                            <div class="stat-label">Дней подряд</div>
                        </div>
                    </div>

                    <h3>Активность</h3>
                    <div class="calendar-grid" id="calendar-grid"></div>

                    <div class="badges-section">
                        <h3>Достижения</h3>
                        <div class="badges-grid" id="badges-grid"></div>
                    </div>
                </div>
            `;

            const calendarGrid = document.getElementById('calendar-grid');
            const today = new Date();
            const calendarMap = {};
            stats.calendar.forEach(function(d) {
                calendarMap[d.date.split('T')[0]] = d.cards_studied;
            });

            for (var i = 83; i >= 0; i--) {
                var d = new Date(today);
                d.setDate(d.getDate() - i);
                var key = d.toISOString().split('T')[0];
                var count = calendarMap[key] || 0;
                var level = 0;
                if (count >= 20) level = 4;
                else if (count >= 10) level = 3;
                else if (count >= 5) level = 2;
                else if (count >= 1) level = 1;

                var dayEl = document.createElement('div');
                dayEl.className = 'calendar-day level-' + level;
                dayEl.title = key + ': ' + count + ' карт.';
                calendarGrid.appendChild(dayEl);
            }

            const badgesGrid = document.getElementById('badges-grid');
            const badgeIcons = {
                'Первая сотня': '💯',
                'Идеальная неделя': '🔥',
                'Полуночник': '🦉',
                'Первая тренировка': '🎯',
                'Знаток слов': '📚',
                'Без ошибок': '✨',
                'Коллекционер': '📦'
            };
            badgesGrid.innerHTML = stats.badges.map(function(badge) {
                var earned = !!badge.awarded_at;
                var dateStr = earned ? new Date(badge.awarded_at).toLocaleDateString('ru-RU') : '';
                return `
                    <div class="badge-card ${earned ? 'earned' : 'locked'}">
                        <div class="badge-icon">${badgeIcons[badge.name] || '🏅'}</div>
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-desc">${badge.description || ''}</div>
                        ${earned ? '<div class="badge-date">' + dateStr + '</div>' : '<div class="badge-desc">🔒 Не получено</div>'}
                    </div>
                `;
            }).join('');
        } catch (err) {
            container.innerHTML = '<p style="color:red;">Ошибка: ' + err.message + '</p>';
        }
    }
}