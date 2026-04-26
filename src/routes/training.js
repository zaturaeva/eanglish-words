const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const SpacedRepetitionService = require('../services/spacedRepetitionService');

const router = express.Router();
const srs = new SpacedRepetitionService();

const MAX_TRAININGS_PER_DAY = 3;

// Получение очереди карточек
router.get('/queue', authenticate, async (req, res) => {
    try {
        // Проверяем количество сегодняшних тренировок
        const today = new Date().toISOString().split('T')[0];
        const countResult = await db.query(
            'SELECT COUNT(*) as count FROM progress WHERE user_id = $1 AND date = $2',
            [req.userId, today]
        );
        const sessionsToday = parseInt(countResult.rows[0]?.count || 0);

        if (sessionsToday >= MAX_TRAININGS_PER_DAY) {
            return res.json([]);
        }

        const result = await db.query(
            `SELECT uc.*, c.word, c.translation, c.transcription, c.image_url, c.example_sentence, c.example_translation
             FROM user_cards uc
             JOIN cards c ON uc.card_id = c.id
             WHERE uc.user_id = $1 AND uc.next_review <= CURRENT_TIMESTAMP
             ORDER BY uc.next_review ASC
             LIMIT $2`,
            [req.userId, 50]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Оценка карточки
router.post('/rate', authenticate, async (req, res) => {
    const { card_id, rating } = req.body;

    if (!['hard', 'normal', 'easy'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid rating' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM user_cards WHERE user_id = $1 AND card_id = $2',
            [req.userId, card_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const userCard = result.rows[0];
        const newParams = srs.calculate(userCard, rating);

        await db.query(
            `UPDATE user_cards
             SET interval = $1, ease_factor = $2, repetitions = $3, next_review = $4,
                 status = CASE WHEN $5 = 'hard' THEN 'difficult' ELSE 'learning' END
             WHERE user_id = $6 AND card_id = $7`,
            [newParams.interval, newParams.ease_factor, newParams.repetitions,
             newParams.next_review, rating, req.userId, card_id]
        );

        // Обновляем прогресс (одна запись в день)
        const today = new Date().toISOString().split('T')[0];
        await db.query(
            `INSERT INTO progress (user_id, date, cards_studied)
             VALUES ($1, $2, 1)
             ON CONFLICT (user_id, date)
             DO UPDATE SET cards_studied = progress.cards_studied + 1`,
            [req.userId, today]
        );

        const progressResult = await db.query(
            'SELECT cards_studied FROM progress WHERE user_id = $1 AND date = $2',
            [req.userId, today]
        );

        res.json({
            success: true,
            updated_card: newParams,
            daily_progress: progressResult.rows[0]?.cards_studied || 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Проверка доступных тренировок
router.get('/remaining', authenticate, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const countResult = await db.query(
        'SELECT COUNT(*) as count FROM progress WHERE user_id = $1 AND date = $2',
        [req.userId, today]
    );
    const used = parseInt(countResult.rows[0]?.count || 0);
    res.json({ remaining: Math.max(0, MAX_TRAININGS_PER_DAY - used), max: MAX_TRAININGS_PER_DAY });
});

module.exports = router;