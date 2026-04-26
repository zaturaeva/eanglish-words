const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const onboardingRoutes = require('./src/routes/onboarding');
const setsRoutes = require('./src/routes/sets');
const cardsRoutes = require('./src/routes/cards');
const trainingRoutes = require('./src/routes/training');
const gamesRoutes = require('./src/routes/games');
const profileRoutes = require('./src/routes/profile');
const statsRoutes = require('./src/routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/sets', setsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

module.exports = app;