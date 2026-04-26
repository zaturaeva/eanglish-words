const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const TextImportService = require('../services/textImportService');

const router = express.Router();
const textImportService = new TextImportService();

// Создание карточки в наборе
router.post('/', authenticate, async (req, res) => {
    const { set_id, word, translation, transcription } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO cards (set_id, word, translation, transcription) VALUES ($1, $2, $3, $4) RETURNING *',
            [set_id, word, translation, transcription]
        );

        // Добавляем карточку пользователю
        await db.query(
            `INSERT INTO user_cards (user_id, card_id, set_id, status, next_review)
             VALUES ($1, $2, $3, 'learning', CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, card_id) DO NOTHING`,
            [req.userId, result.rows[0].id, set_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Импорт карточек из текста
router.post('/import-text', authenticate, async (req, res) => {
    const { set_id, text } = req.body;
    try {
        const words = textImportService.parse(text);
        let created = 0;

        for (const word of words) {
            const result = await db.query(
                'INSERT INTO cards (set_id, word, translation) VALUES ($1, $2, $3) RETURNING id',
                [set_id, word, '']
            );
            await db.query(
                `INSERT INTO user_cards (user_id, card_id, set_id, status, next_review)
                 VALUES ($1, $2, $3, 'learning', CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id, card_id) DO NOTHING`,
                [req.userId, result.rows[0].id, set_id]
            );
            created++;
        }

        res.json({ created });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;