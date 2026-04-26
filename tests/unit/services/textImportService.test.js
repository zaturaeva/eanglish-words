const TextImportService = require('../../../src/services/textImportService');

describe('TextImportService', () => {
    let service;

    beforeEach(() => {
        service = new TextImportService();
    });

    test('парсит строку с 5 словами через запятую', () => {
        const text = 'dog, cat, bird, fish, horse';
        const result = service.parse(text);
        expect(result).toHaveLength(5);
        expect(result).toEqual(['dog', 'cat', 'bird', 'fish', 'horse']);
    });

    test('корректно обрабатывает лишние пробелы', () => {
        const text = 'dog,   cat   , bird';
        const result = service.parse(text);
        expect(result).toHaveLength(3);
        expect(result).toEqual(['dog', 'cat', 'bird']);
    });

    test('возвращает пустой массив для пустой строки', () => {
        const result = service.parse('');
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
    });

    test('возвращает пустой массив для строки из пробелов', () => {
        const result = service.parse('   ');
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
    });

    test('корректно обрабатывает русские символы (UTF-8)', () => {
        const text = 'собака, кот, птица, рыба';
        const result = service.parse(text);
        expect(result).toHaveLength(4);
        expect(result).toEqual(['собака', 'кот', 'птица', 'рыба']);
    });

    test('игнорирует пустые элементы между запятыми', () => {
        const text = 'dog,,cat,,,bird';
        const result = service.parse(text);
        expect(result).toHaveLength(3);
        expect(result).toEqual(['dog', 'cat', 'bird']);
    });
});