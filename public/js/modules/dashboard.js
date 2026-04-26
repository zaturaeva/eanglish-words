import api from '../api.js';
import router from '../router.js';
import { renderFlashcardTraining } from './flashcard.js';
import { renderSpellingGame } from './spelling.js';

export function renderDashboard() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div class="dashboard">
            <div class="dashboard-layout">
                <div class="dashboard-left">
                    <div class="progress-circle" id="progress-circle"></div>
                </div>
                <div class="dashboard-right">
                    <h3>Доступные наборы</h3>
                    <div class="sets-list" id="daily-sets">Загрузка...</div>
                    <div class="dashboard-actions">
                        <button class="btn-start-training" id="btn-start-training">Начать тренировку</button>
                        <button class="game-banner" id="btn-spelling-game">Играть</button>
                    </div>
                    <div class="dashboard-badges" id="dashboard-badges">
                        <h4>Мои достижения</h4>
                        <div id="badges-content">Загрузка...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadDashboardData();

    document.getElementById('btn-start-training').addEventListener('click', () => {
        renderFlashcardTraining();
    });

    document.getElementById('btn-spelling-game').addEventListener('click', () => {
        renderSpellingGame();
    });

    async function loadDashboardData() {
        try {
            const [stats, user] = await Promise.all([
                api.get('/stats'),
                api.get('/auth/me'),
            ]);

            const dailyGoal = user.daily_goal || 20;
            const progress = Math.min(stats.daily_progress / dailyGoal, 1);
            const radius = 80;
            const circumference = 2 * Math.PI * radius;

            document.getElementById('progress-circle').innerHTML = `
                <svg width="190" height="190" viewBox="0 0 190 190">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#5ea8bb;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#5ebb6a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#27ae60;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle cx="95" cy="95" r="${radius}" fill="none" stroke="#e0e6ed" stroke-width="12"/>
                    <circle cx="95" cy="95" r="${radius}" fill="none" stroke="url(#grad)" stroke-width="12"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - progress)}"
                            stroke-linecap="round" transform="rotate(-90 95 95)"/>
                    <text x="95" y="88" text-anchor="middle" font-size="32" font-weight="800" fill="#2e7d4d">
                        ${stats.daily_progress}
                    </text>
                    <text x="95" y="110" text-anchor="middle" font-size="14" fill="#7f8c8d">
                        из ${dailyGoal}
                    </text>
                </svg>
            `;

            const setsHtml = stats.total_cards > 0
                ? `<div class="info-card">
                     <h3>Всего карточек: ${stats.total_cards}</h3>
                     <p>Изучено: ${stats.learned_cards}</p>
                   </div>`
                : '<p style="color:#7f8c8d;">Добавьте наборы из каталога, чтобы начать</p>';
            document.getElementById('daily-sets').innerHTML = setsHtml;

            // Блок достижений
            const earnedBadges = stats.badges.filter(function(b) { return !!b.awarded_at; });
            const badgesContent = document.getElementById('badges-content');

            if (earnedBadges.length === 0) {
                badgesContent.innerHTML = `
                    <p style="color:#7f8c8d;text-align:center;padding:16px;">Пока здесь пусто</p>
                    <button class="btn-view-all" id="btn-view-all-badges">Посмотреть все достижения</button>
                `;
            } else {
                badgesContent.innerHTML = `
                    <div class="dashboard-badges-grid">
                        ${earnedBadges.map(function(badge) {
                            var icons = {
                                'Первая сотня': '💯',
                                'Идеальная неделя': '🔥',
                                'Полуночник': '🦉',
                                'Первая тренировка': '🎯',
                                'Знаток слов': '📚',
                                'Без ошибок': '✨',
                                'Коллекционер': '📦'
                            };
                            return `
                                <div class="badge-card earned badge-sm">
                                    <div class="badge-icon">${icons[badge.name] || '🏅'}</div>
                                    <div class="badge-name">${badge.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button class="btn-view-all" id="btn-view-all-badges">Посмотреть все достижения</button>
                `;
            }

            document.getElementById('btn-view-all-badges').addEventListener('click', function() {
                router.navigate('stats');
            });

        } catch (err) {
            console.error(err);
        }
    }
}