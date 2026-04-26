const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Получение словаря пользователя
router.get('/dictionary', authenticate, async (req, res) => {
    const { status } = req.query;
    try {
        let query = `
            SELECT uc.*, c.word, c.translation, c.transcription, s.name as set_name
            FROM user_cards uc
            JOIN cards c ON uc.card_id = c.id
            LEFT JOIN sets s ON uc.set_id = s.id
            WHERE uc.user_id = $1
        `;
        const params = [req.userId];

        if (status && ['learning', 'learned', 'difficult'].includes(status)) {
            params.push(status);
            query += ` AND uc.status = $${params.length}`;
        }

        query += ' ORDER BY uc.id DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Массовое удаление карточек из словаря
router.post('/dictionary/delete', authenticate, async (req, res) => {
    const { card_ids } = req.body;
    try {
        await db.query(
            'DELETE FROM user_cards WHERE user_id = $1 AND card_id = ANY($2)',
            [req.userId, card_ids]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;