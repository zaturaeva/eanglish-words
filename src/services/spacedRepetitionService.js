class SpacedRepetitionService {
    calculate(card, rating) {
        let { interval, ease_factor, repetitions } = card;
        const now = new Date();

        switch (rating) {
            case 'hard':
                repetitions = 0;
                interval = 1; // 1 минута
                ease_factor = Math.max(1.3, ease_factor - 0.15);
                break;

            case 'normal':
                repetitions += 1;
                if (repetitions === 1) {
                    interval = 1; // 1 день
                } else if (repetitions === 2) {
                    interval = 6; // 6 дней
                } else {
                    interval = Math.round(interval * ease_factor);
                }
                break;

            case 'easy':
                repetitions += 1;
                if (repetitions === 1) {
                    interval = 1;
                } else if (repetitions === 2) {
                    interval = 6;
                } else {
                    interval = Math.round(interval * ease_factor * 1.3);
                }
                ease_factor += 0.15;
                break;

            default:
                throw new Error(`Неизвестная оценка: ${rating}`);
        }

        // Рассчитываем next_review
        const nextReview = new Date(now);
        if (interval === 1 && rating === 'hard') {
            nextReview.setMinutes(nextReview.getMinutes() + 1);
        } else {
            nextReview.setDate(nextReview.getDate() + interval);
            nextReview.setHours(0, 0, 0, 0);
        }

        return {
            interval,
            ease_factor: Math.round(ease_factor * 100) / 100,
            repetitions,
            next_review: nextReview,
        };
    }
}

module.exports = SpacedRepetitionService;