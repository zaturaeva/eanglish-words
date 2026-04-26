const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Получение публичных наборов (каталог)
router.get('/catalog', async (req, res) => {
    const { category, level, search } = req.query;
    let query = 'SELECT s.*, u.email as author_email FROM sets s LEFT JOIN users u ON s.author_id = u.id WHERE s.is_public = true';
    const params = [];

    if (category) {
        params.push(category);
        query += ` AND s.category = $${params.length}`;
    }
    if (level) {
        params.push(level);
        query += ` AND s.level = $${params.length}`;
    }
    if (search) {
        params.push(`%${search}%`);
        query += ` AND s.name ILIKE $${params.length}`;
    }

    query += ' ORDER BY s.id DESC';

    try {
        const result = await db.query(query, params);

        // Получаем количество карточек для каждого набора
        const setsWithCount = await Promise.all(
            result.rows.map(async (set) => {
                const countResult = await db.query(
                    'SELECT COUNT(*) as count FROM cards WHERE set_id = $1',
                    [set.id]
                );
                return { ...set, cards_count: parseInt(countResult.rows[0].count) };
            })
        );

        res.json(setsWithCount);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение наборов пользователя
router.get('/my', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM sets WHERE author_id = $1 ORDER BY id DESC',
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание набора
router.post('/', authenticate, async (req, res) => {
    const { name, description, level } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO sets (name, description, level, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, level, req.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение набора по ID с карточками
router.get('/:id', authenticate, async (req, res) => {
    try {
        const setResult = await db.query('SELECT * FROM sets WHERE id = $1', [req.params.id]);
        if (setResult.rows.length === 0) {
            return res.status(404).json({ error: 'Набор не найден' });
        }

        const cardsResult = await db.query('SELECT * FROM cards WHERE set_id = $1', [req.params.id]);

        // Получаем статусы карточек для пользователя
        const userCardsResult = await db.query(
            'SELECT card_id, status FROM user_cards WHERE user_id = $1 AND set_id = $2',
            [req.userId, req.params.id]
        );
        const statusMap = {};
        userCardsResult.rows.forEach(uc => {
            statusMap[uc.card_id] = uc.status;
        });

        const cards = cardsResult.rows.map(card => ({
            ...card,
            user_status: statusMap[card.id] || null,
        }));

        res.json({ ...setResult.rows[0], cards });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавление публичного набора пользователю
router.post('/:id/add', authenticate, async (req, res) => {
    const setId = req.params.id;
    try {
        // Проверяем, что набор существует и публичный
        const setResult = await db.query('SELECT * FROM sets WHERE id = $1 AND is_public = true', [setId]);
        if (setResult.rows.length === 0) {
            return res.status(404).json({ error: 'Набор не найден или недоступен' });
        }

        // Получаем карточки набора
        const cardsResult = await db.query('SELECT id FROM cards WHERE set_id = $1', [setId]);

        // Добавляем карточки пользователю
        for (const card of cardsResult.rows) {
            await db.query(
                `INSERT INTO user_cards (user_id, card_id, set_id, status, next_review)
                 VALUES ($1, $2, $3, 'learning', CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id, card_id) DO NOTHING`,
                [req.userId, card.id, setId]
            );
        }

        res.json({ success: true, cards_added: cardsResult.rows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;