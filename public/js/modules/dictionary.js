import api from '../api.js';
import router from '../router.js';

export function renderDictionary() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div class="dictionary">
            <h2>Мой словарь</h2>
            <div class="dictionary-tabs">
                <button class="active" data-tab="learning">Изучаю</button>
                <button data-tab="learned">Выучено</button>
                <button data-tab="difficult">Сложные</button>
            </div>
            <div class="dictionary-list" id="dictionary-list">Загрузка...</div>
            <button class="btn btn-danger mt-2 hidden" id="btn-delete-selected">Удалить выбранные</button>
        </div>
    `;

    let currentTab = 'learning';

    document.querySelectorAll('.dictionary-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dictionary-tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            loadDictionary();
        });
    });

    loadDictionary();

    async function loadDictionary() {
        try {
            const cards = await api.get(`/profile/dictionary?status=${currentTab}`);
            const list = document.getElementById('dictionary-list');

            if (cards.length === 0) {
                list.innerHTML = '<p style="padding:20px;text-align:center;">Нет карточек</p>';
                document.getElementById('btn-delete-selected').classList.add('hidden');
                return;
            }

            list.innerHTML = cards.map(card => `
                <div class="dictionary-item">
                    <div>
                        <strong>${card.word}</strong> — ${card.translation || '—'}
                        <br><small style="color:#888;">${card.set_name || ''}</small>
                    </div>
                    <input type="checkbox" class="card-checkbox" value="${card.card_id}">
                </div>
            `).join('');

            document.getElementById('btn-delete-selected').classList.remove('hidden');
            document.getElementById('btn-delete-selected').addEventListener('click', async () => {
                const selected = [...document.querySelectorAll('.card-checkbox:checked')]
                    .map(cb => parseInt(cb.value));
                if (selected.length === 0) {
                    alert('Выберите карточки для удаления');
                    return;
                }
                try {
                    await api.post('/profile/dictionary/delete', { card_ids: selected });
                    loadDictionary();
                } catch (err) {
                    alert('Ошибка: ' + err.message);
                }
            });
        } catch (err) {
            document.getElementById('dictionary-list').innerHTML = `<p>Ошибка: ${err.message}</p>`;
        }
    }
}