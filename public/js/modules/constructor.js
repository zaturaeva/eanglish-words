import api from '../api.js';
import router from '../router.js';

export function renderSetDetail(setId) {
    const container = document.getElementById('screen-container');
    container.innerHTML = '<p class="loading">Загрузка...</p>';

    loadSetDetail();

    async function loadSetDetail() {
        try {
            const set = await api.get('/sets/' + setId);
            container.innerHTML = `
                <div>
                    <button class="btn btn-secondary mb-2" id="btn-back">← Назад к каталогу</button>
                    <h2>${set.name}</h2>
                    <p>${set.description || ''}</p>
                    <div class="flex gap-1 mb-2" style="display:flex; gap:10px;">
                        <button class="btn btn-primary" id="btn-learn-new" style="width:auto;">Учить новые</button>
                    </div>
                    <h3>Карточки (${set.cards.length})</h3>
                    <table class="set-detail-table">
                        <thead>
                            <tr>
                                <th>Слово</th>
                                <th>Перевод</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${set.cards.map(function(card) {
                                var statusText = '—';
                                if (card.user_status === 'learning') statusText = 'Изучаю';
                                else if (card.user_status === 'learned') statusText = 'Выучено';
                                else if (card.user_status === 'difficult') statusText = 'Сложное';
                                return `
                                    <tr>
                                        <td><strong>${card.word}</strong></td>
                                        <td>${card.translation || '—'}</td>
                                        <td>${statusText}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Кнопка "Назад" — возвращает в каталог
            document.getElementById('btn-back').addEventListener('click', function() {
                router.navigate('catalog');
            });

            document.getElementById('btn-learn-new').addEventListener('click', async function() {
                const { renderFlashcardTraining } = await import('./flashcard.js');
                renderFlashcardTraining();
            });

        } catch (err) {
            container.innerHTML = '<p style="color:red;">Ошибка: ' + err.message + '</p>';
        }
    }
}