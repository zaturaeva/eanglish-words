const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Получение статистики
router.get('/', authenticate, async (req, res) => {
    try {
        // Дневной прогресс
        const today = new Date().toISOString().split('T')[0];
        const dailyResult = await db.query(
            'SELECT cards_studied FROM progress WHERE user_id = $1 AND date = $2',
            [req.userId, today]
        );
        const dailyProgress = dailyResult.rows[0]?.cards_studied || 0;

        // Данные для календаря (последние 90 дней)
        const calendarResult = await db.query(
            `SELECT date, cards_studied FROM progress
             WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '90 days'
             ORDER BY date`,
            [req.userId]
        );

        // Серия дней (streak)
        const streakResult = await db.query(
            `WITH dates AS (
                SELECT date FROM progress
                WHERE user_id = $1 AND cards_studied > 0
                ORDER BY date DESC
            )
            SELECT COUNT(*) as streak FROM (
                SELECT date,
                       date - ROW_NUMBER() OVER (ORDER BY date DESC) * INTERVAL '1 day' as grp
                FROM dates
            ) sub WHERE grp = (SELECT MAX(date) - COUNT(*) * INTERVAL '1 day' FROM dates)`,
            [req.userId]
        );
        const streak = parseInt(streakResult.rows[0]?.streak || 0);

        // Достижения пользователя
        const badgesResult = await db.query(
            `SELECT b.*, ub.awarded_at
             FROM badges b
             LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1`,
            [req.userId]
        );

        // Общая статистика
        const totalResult = await db.query(
            `SELECT
                COUNT(DISTINCT uc.card_id) as total_cards,
                COUNT(DISTINCT CASE WHEN uc.status = 'learned' THEN uc.card_id END) as learned_cards
             FROM user_cards uc WHERE uc.user_id = $1`,
            [req.userId]
        );

        res.json({
            daily_progress: dailyProgress,
            calendar: calendarResult.rows,
            streak,
            badges: badgesResult.rows,
            total_cards: parseInt(totalResult.rows[0].total_cards),
            learned_cards: parseInt(totalResult.rows[0].learned_cards),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;