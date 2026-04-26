const SpacedRepetitionService = require('../../../src/services/spacedRepetitionService');

describe('SpacedRepetitionService', () => {
    let service;
    let baseCard;

    beforeEach(() => {
        service = new SpacedRepetitionService();
        baseCard = {
            interval: 0,
            ease_factor: 2.5,
            repetitions: 0,
        };
    });

    describe('calculate (rating: hard)', () => {
        test('сбрасывает repetitions в 0', () => {
            baseCard.repetitions = 5;
            const result = service.calculate(baseCard, 'hard');
            expect(result.repetitions).toBe(0);
        });

        test('устанавливает interval = 1 (минута)', () => {
            baseCard.interval = 10;
            const result = service.calculate(baseCard, 'hard');
            expect(result.interval).toBe(1);
        });

        test('снижает ease_factor на 0.15', () => {
            baseCard.ease_factor = 2.5;
            const result = service.calculate(baseCard, 'hard');
            expect(result.ease_factor).toBe(2.35);
        });

        test('не опускает ease_factor ниже 1.3', () => {
            baseCard.ease_factor = 1.35;
            const result = service.calculate(baseCard, 'hard');
            expect(result.ease_factor).toBe(1.3);
        });

        test('next_review устанавливается через 1 минуту от текущего времени', () => {
            const before = new Date();
            const result = service.calculate(baseCard, 'hard');
            const diffMs = new Date(result.next_review) - before;
            expect(diffMs).toBeGreaterThan(50000); // ~50-60 секунд
            expect(diffMs).toBeLessThan(70000);
        });
    });

    describe('calculate (rating: normal)', () => {
        test('увеличивает repetitions на 1', () => {
            const result = service.calculate(baseCard, 'normal');
            expect(result.repetitions).toBe(1);
        });

        test('первое повторение: interval = 1 день', () => {
            baseCard.repetitions = 0;
            const result = service.calculate(baseCard, 'normal');
            expect(result.interval).toBe(1);
        });

        test('второе повторение: interval = 6 дней', () => {
            baseCard.repetitions = 1;
            const result = service.calculate(baseCard, 'normal');
            expect(result.interval).toBe(6);
        });

        test('третье и далее: interval = round(interval * ease_factor)', () => {
            baseCard.repetitions = 2;
            baseCard.interval = 6;
            baseCard.ease_factor = 2.5;
            const result = service.calculate(baseCard, 'normal');
            expect(result.interval).toBe(15); // 6 * 2.5 = 15
        });

        test('ease_factor не изменяется', () => {
            baseCard.ease_factor = 2.5;
            const result = service.calculate(baseCard, 'normal');
            expect(result.ease_factor).toBe(2.5);
        });

        test('next_review устанавливается на начало дня через interval дней', () => {
            const result = service.calculate(baseCard, 'normal');
            const nextReview = new Date(result.next_review);
            const expected = new Date();
            expected.setDate(expected.getDate() + 1);
            expected.setHours(0, 0, 0, 0);
            expect(nextReview.getTime()).toBe(expected.getTime());
        });
    });

    describe('calculate (rating: easy)', () => {
        test('увеличивает repetitions на 1', () => {
            const result = service.calculate(baseCard, 'easy');
            expect(result.repetitions).toBe(1);
        });

        test('первое повторение: interval = 1 день', () => {
            baseCard.repetitions = 0;
            const result = service.calculate(baseCard, 'easy');
            expect(result.interval).toBe(1);
        });

        test('второе повторение: interval = 6 дней', () => {
            baseCard.repetitions = 1;
            const result = service.calculate(baseCard, 'easy');
            expect(result.interval).toBe(6);
        });

        test('третье и далее: interval = round(interval * ease_factor * 1.3)', () => {
            baseCard.repetitions = 2;
            baseCard.interval = 6;
            baseCard.ease_factor = 2.5;
            const result = service.calculate(baseCard, 'easy');
            expect(result.interval).toBe(20); // 6 * 2.5 * 1.3 = 19.5 -> 20
        });

        test('увеличивает ease_factor на 0.15', () => {
            baseCard.ease_factor = 2.5;
            const result = service.calculate(baseCard, 'easy');
            expect(result.ease_factor).toBe(2.65);
        });

        test('next_review устанавливается на начало дня через interval дней', () => {
            const result = service.calculate(baseCard, 'easy');
            const nextReview = new Date(result.next_review);
            const expected = new Date();
            expected.setDate(expected.getDate() + 1);
            expected.setHours(0, 0, 0, 0);
            expect(nextReview.getTime()).toBe(expected.getTime());
        });
    });

    describe('calculate (edge cases)', () => {
        test('многократные "hard" не роняют ease_factor ниже 1.3', () => {
            let card = { interval: 5, ease_factor: 2.5, repetitions: 10 };

            for (let i = 0; i < 50; i++) {
                card = service.calculate(card, 'hard');
            }

            expect(card.ease_factor).toBe(1.3);
        });

        test('неизвестный рейтинг выбрасывает ошибку', () => {
            expect(() => {
                service.calculate(baseCard, 'impossible');
            }).toThrow('Неизвестная оценка: impossible');
        });
    });
});