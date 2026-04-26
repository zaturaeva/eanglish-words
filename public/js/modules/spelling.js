import api from '../api.js';

export function renderSpellingGame() {
    const container = document.getElementById('screen-container');
    container.innerHTML = '<p>Загрузка...</p>';

    loadGame();

    async function loadGame() {
        try {
            const words = await api.get('/games/spelling');
            if (words.length === 0) {
                container.innerHTML = '<p style="text-align:center;">Нет карточек для игры</p>';
                return;
            }

            let currentIndex = 0;
            let score = 0;
            renderWord();

            function renderWord() {
                const word = words[currentIndex];
                container.innerHTML = `
                    <div class="spelling-game">
                        <p>Правильно: ${score} / ${words.length}</p>
                        <p>Слово ${currentIndex + 1} из ${words.length}</p>
                        <div class="translation">${word.translation}</div>
                        <input type="text" id="spelling-input" placeholder="Введите слово..." autofocus>
                        <p id="spelling-feedback" style="min-height:24px;"></p>
                    </div>
                `;

                const input = document.getElementById('spelling-input');
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const userAnswer = input.value.trim().toLowerCase();
                        const correctAnswer = word.word.toLowerCase();

                        if (userAnswer === correctAnswer) {
                            score++;
                            input.classList.add('correct');
                            document.getElementById('spelling-feedback').textContent = '✅ Правильно!';
                        } else {
                            input.classList.add('wrong');
                            document.getElementById('spelling-feedback').textContent =
                                `❌ Неправильно. Правильно: ${word.word}`;
                        }

                        setTimeout(() => {
                            currentIndex++;
                            if (currentIndex < words.length) {
                                renderWord();
                            } else {
                                container.innerHTML = `
                                    <div class="spelling-game">
                                        <h2>Игра завершена!</h2>
                                        <p>Ваш результат: ${score} из ${words.length}</p>
                                        <button class="btn btn-primary mt-2" id="btn-restart">Ещё раз</button>
                                    </div>
                                `;
                                document.getElementById('btn-restart').addEventListener('click', renderSpellingGame);
                            }
                        }, 800);
                    }
                });
            }
        } catch (err) {
            container.innerHTML = `<p>Ошибка: ${err.message}</p>`;
        }
    }
}