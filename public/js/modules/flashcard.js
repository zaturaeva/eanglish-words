import api from '../api.js';
import router from '../router.js';

export function renderFlashcardTraining() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div class="flashcard-container" id="training-container">
            <p style="text-align:center;">Загрузка карточек...</p>
        </div>
    `;

    loadTraining();

    async function loadTraining() {
        try {
            const cards = await api.get('/training/queue');
            if (cards.length === 0) {
                container.innerHTML = `
                    <div class="training-complete">
                        <h2>🎉 Тренировка завершена!</h2>
                        <p>На сегодня карточек больше нет.</p>
                        <button class="btn btn-primary mt-2" id="btn-back-dashboard">На главную</button>
                    </div>
                `;
                document.getElementById('btn-back-dashboard').addEventListener('click', () => {
                    router.navigate('dashboard');
                });
                return;
            }

            let currentIndex = 0;
            renderCard(cards[currentIndex]);

            function renderCard(card) {
                const trainingContainer = document.getElementById('training-container');
                trainingContainer.innerHTML = `
                    <p style="text-align:center; color:#888;">${currentIndex + 1} / ${cards.length}</p>
                    <div class="flashcard" id="flashcard">
                        <div class="flashcard-inner" id="flashcard-inner">
                            <div class="flashcard-front">
                                <span class="flashcard-word">${card.word}</span>
                                <button class="btn-speak" id="btn-speak">🔊</button>
                            </div>
                            <div class="flashcard-back">
                                <span class="flashcard-translation">${card.translation || '—'}</span>
                                <span class="flashcard-transcription">${card.transcription || ''}</span>
                                <p class="flashcard-example">${card.example_sentence || ''}</p>
                            </div>
                        </div>
                    </div>
                    <div class="rating-buttons">
                        <button class="btn-hard" data-rating="hard">Сложно</button>
                        <button class="btn-normal" data-rating="normal">Нормально</button>
                        <button class="btn-easy" data-rating="easy">Легко</button>
                    </div>
                `;

                setupDragAndDrop(card);
                document.getElementById('btn-speak').addEventListener('click', () => {
                    const utterance = new SpeechSynthesisUtterance(card.word);
                    utterance.lang = 'en-US';
                    speechSynthesis.speak(utterance);
                });

                document.querySelectorAll('.rating-buttons button').forEach(btn => {
                    btn.addEventListener('click', () => handleRating(card, btn.dataset.rating));
                });
            }

            function setupDragAndDrop(card) {
                const flashcard = document.getElementById('flashcard');
                const inner = document.getElementById('flashcard-inner');
                let startX = 0, currentX = 0, isDragging = false;

                flashcard.addEventListener('pointerdown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    flashcard.setPointerCapture(e.pointerId);
                    inner.classList.remove('flipped');
                });

                flashcard.addEventListener('pointermove', (e) => {
                    if (!isDragging) return;
                    currentX = e.clientX - startX;
                    flashcard.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`;
                    if (currentX > 60 || currentX < -60) {
                        inner.classList.add('flipped');
                    } else {
                        inner.classList.remove('flipped');
                    }
                });

                flashcard.addEventListener('pointerup', () => {
                    if (!isDragging) return;
                    isDragging = false;
                    const absX = Math.abs(currentX);
                    flashcard.style.transition = 'transform 0.3s ease-out';

                    if (absX < 80) {
                        flashcard.style.transform = 'translateX(0) rotate(0)';
                        return;
                    }

                    let rating = 'normal';
                    if (currentX < -80) rating = 'hard';
                    if (currentX > 150) rating = 'easy';

                    flashcard.style.transform = `translateX(${currentX > 0 ? 500 : -500}px) rotate(${currentX > 0 ? 30 : -30}deg)`;
                    flashcard.style.opacity = '0';

                    setTimeout(() => handleRating(card, rating), 300);
                });
            }

            async function handleRating(card, rating) {
                try {
                    await api.post('/training/rate', { card_id: card.card_id, rating });
                    currentIndex++;
                    if (currentIndex < cards.length) {
                        renderCard(cards[currentIndex]);
                    } else {
                        document.getElementById('training-container').innerHTML = `
                            <div class="training-complete">
                                <h2>🎉 Тренировка завершена!</h2>
                                <p>Вы повторили ${cards.length} карточек.</p>
                                <button class="btn btn-primary mt-2" id="btn-back-dashboard">На главную</button>
                            </div>
                        `;
                        document.getElementById('btn-back-dashboard').addEventListener('click', () => {
                            router.navigate('dashboard');
                        });
                    }
                } catch (err) {
                    alert('Ошибка: ' + err.message);
                }
            }
        } catch (err) {
            container.innerHTML = `<p>Ошибка загрузки: ${err.message}</p>`;
        }
    }
}