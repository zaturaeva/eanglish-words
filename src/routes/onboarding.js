const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/complete', authenticate, async (req, res) => {
    const { level, target, daily_goal } = req.body;

    try {
        await db.query(
            'UPDATE users SET level = $1, target = $2, daily_goal = $3 WHERE id = $4',
            [level, target, daily_goal, req.userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;