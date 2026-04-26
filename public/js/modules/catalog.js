import api from '../api.js';
import { renderSetDetail } from './constructor.js';

function showModal(message, callback) {
    document.getElementById('modal-body').innerHTML = `
        <p style="font-size:1.1rem;margin-bottom:20px;">${message}</p>
        <button class="btn btn-primary" id="modal-confirm">OK</button>
    `;
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modal-confirm').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
        if (callback) callback();
    });
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
        if (callback) callback();
    });
}

export function renderCatalog() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div class="catalog">
            <h2>Каталог наборов</h2>
            <div class="catalog-filters">
                <div class="catalog-search-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="catalog-search" placeholder="Поиск...">
                </div>
                <select id="catalog-level">
                    <option value="">Все уровни</option>
                    <option value="A1">A1 — Начальный</option>
                    <option value="A2">A2 — Базовый</option>
                    <option value="B1">B1 — Средний</option>
                    <option value="B2">B2 — Продвинутый</option>
                </select>
                <select id="catalog-category">
                    <option value="">Все категории</option>
                    <option value="Глаголы">Глаголы</option>
                    <option value="Существительные">Существительные</option>
                    <option value="Прилагательные">Прилагательные</option>
                    <option value="Бизнес">Бизнес</option>
                    <option value="IT">IT и технологии</option>
                    <option value="Тематический">Тематический</option>
                    <option value="Грамматика">Грамматика</option>
                </select>
            </div>
            <div class="catalog-table" id="catalog-grid">
                <div class="loading">Загрузка наборов...</div>
            </div>
        </div>
    `;

    loadSets();

    document.getElementById('catalog-search').addEventListener('input', function() {
        clearTimeout(this.timer);
        this.timer = setTimeout(loadSets, 300);
    });
    document.getElementById('catalog-level').addEventListener('change', loadSets);
    document.getElementById('catalog-category').addEventListener('change', loadSets);

    async function loadSets() {
        const search = document.getElementById('catalog-search').value;
        const level = document.getElementById('catalog-level').value;
        const category = document.getElementById('catalog-category').value;

        var params = new URLSearchParams();
        if (search) params.append('search', search);
        if (level) params.append('level', level);
        if (category) params.append('category', category);

        try {
            const sets = await api.get('/sets/catalog?' + params.toString());
            const grid = document.getElementById('catalog-grid');

            if (sets.length === 0) {
                grid.innerHTML = '<p style="text-align:center;padding:40px;color:#94a3b8;">Ничего не найдено</p>';
                return;
            }

            grid.innerHTML = `
                <div class="catalog-table-header">
                    <div>Название</div>
                    <div>Категория</div>
                    <div>Слов</div>
                    <div>Уровень</div>
                    <div>Действия</div>
                </div>
                ${sets.map(function(s) {
                    return `
                        <div class="catalog-table-row">
                            <div class="catalog-table-name">${s.name}</div>
                            <div><span class="category-badge">${s.category || 'Общее'}</span></div>
                            <div>${s.cards_count}</div>
                            <div><span class="level-badge">${s.level || 'A1'}</span></div>
                            <div class="catalog-table-actions">
                                <button class="btn-view" data-id="${s.id}">Смотреть</button>
                                <button class="btn-add" data-id="${s.id}">Добавить</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;

            grid.querySelectorAll('.btn-view').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    renderSetDetail(btn.dataset.id);
                });
            });

            grid.querySelectorAll('.btn-add').forEach(function(btn) {
                btn.addEventListener('click', async function() {
                    try {
                        const result = await api.post('/sets/' + btn.dataset.id + '/add');
                        showModal('Набор добавлен! Карточек: ' + result.cards_added);
                    } catch (err) {
                        showModal('Ошибка: ' + err.message);
                    }
                });
            });

        } catch (err) {
            document.getElementById('catalog-grid').innerHTML = '<p style="color:red;">Ошибка: ' + err.message + '</p>';
        }
    }
}