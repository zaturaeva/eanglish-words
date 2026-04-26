const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Получение слов для игры "Собери слово"
router.get('/spelling', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.id, c.word, c.translation
             FROM user_cards uc
             JOIN cards c ON uc.card_id = c.id
             WHERE uc.user_id = $1 AND uc.status = 'learning'
             ORDER BY RANDOM()
             LIMIT 20`,
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;