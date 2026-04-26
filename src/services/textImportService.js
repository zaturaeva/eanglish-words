class TextImportService {
    parse(text) {
        if (!text || !text.trim()) {
            return [];
        }

        return text
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);
    }
}

module.exports = TextImportService;