-- Создание базы данных (выполнить отдельно, если не создана)
-- CREATE DATABASE english_cards;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    target VARCHAR(100),
    level VARCHAR(50),
    daily_goal INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица наборов карточек
CREATE TABLE IF NOT EXISTS sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover VARCHAR(500),
    category VARCHAR(100),
    level VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица карточек
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES sets(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    translation VARCHAR(255) NOT NULL,
    transcription VARCHAR(255),
    image_url VARCHAR(500),
    example_sentence TEXT,
    example_translation TEXT
);

-- Таблица связи пользователей с карточками (состояние обучения)
CREATE TABLE IF NOT EXISTS user_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    set_id INTEGER REFERENCES sets(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'learning' CHECK (status IN ('learning', 'learned', 'difficult')),
    next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interval INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    repetitions INTEGER DEFAULT 0,
    UNIQUE(user_id, card_id)
);

-- Таблица прогресса
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    cards_studied INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    condition TEXT
);

-- Таблица связи пользователей с достижениями
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Индексы для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_user_cards_user_next ON user_cards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_user_cards_status ON user_cards(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_sets_public ON sets(is_public);

-- Предустановленные достижения
INSERT INTO badges (name, description, icon, condition) VALUES
    ('Первая сотня', 'Изучить 100 карточек', 'badge-100', 'cards_studied >= 100'),
    ('Идеальная неделя', 'Заниматься 7 дней подряд', 'badge-week', 'streak >= 7'),
    ('Полуночник', 'Завершить тренировку после 00:00', 'badge-night', 'trained_after_midnight')
ON CONFLICT DO NOTHING;

-- Предустановленные публичные наборы
INSERT INTO sets (name, description, category, level, is_public) VALUES
    ('Топ-100 глаголов', 'Самые употребляемые глаголы английского языка', 'Глаголы', 'A1', true),
    ('Бизнес-лексика', 'Слова для делового общения', 'Бизнес', 'B1', true),
    ('Еда и напитки', 'Лексика по теме еды', 'Тематический', 'A1', true)
ON CONFLICT DO NOTHING;

-- Карточки для набора "Топ-100 глаголов"
DO $$
DECLARE
    set_id_var INTEGER;
BEGIN
    SELECT id INTO set_id_var FROM sets WHERE name = 'Топ-100 глаголов' LIMIT 1;
    IF set_id_var IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cards WHERE set_id = set_id_var LIMIT 1) THEN
        INSERT INTO cards (set_id, word, translation, transcription, example_sentence, example_translation) VALUES
            (set_id_var, 'be', 'быть', '/biː/', 'I want to be a doctor.', 'Я хочу быть врачом.'),
            (set_id_var, 'have', 'иметь', '/hæv/', 'I have a cat.', 'У меня есть кот.'),
            (set_id_var, 'do', 'делать', '/duː/', 'What do you do?', 'Чем ты занимаешься?'),
            (set_id_var, 'say', 'сказать', '/seɪ/', 'What did you say?', 'Что ты сказал?'),
            (set_id_var, 'go', 'идти', '/ɡoʊ/', 'Let''s go home.', 'Пойдём домой.'),
            (set_id_var, 'get', 'получать', '/ɡet/', 'I need to get some rest.', 'Мне нужно отдохнуть.'),
            (set_id_var, 'make', 'делать/создавать', '/meɪk/', 'Let''s make a cake.', 'Давай сделаем торт.'),
            (set_id_var, 'know', 'знать', '/noʊ/', 'I know the answer.', 'Я знаю ответ.'),
            (set_id_var, 'think', 'думать', '/θɪŋk/', 'I think so.', 'Я думаю, да.'),
            (set_id_var, 'see', 'видеть', '/siː/', 'I can see you.', 'Я тебя вижу.');
    END IF;
END $$;

-- Карточки для набора "Бизнес-лексика"
DO $$
DECLARE
    set_id_var INTEGER;
BEGIN
    SELECT id INTO set_id_var FROM sets WHERE name = 'Бизнес-лексика' LIMIT 1;
    IF set_id_var IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cards WHERE set_id = set_id_var LIMIT 1) THEN
        INSERT INTO cards (set_id, word, translation, transcription, example_sentence, example_translation) VALUES
            (set_id_var, 'meeting', 'встреча/совещание', '/ˈmiːtɪŋ/', 'We have a meeting at 3 PM.', 'У нас совещание в 15:00.'),
            (set_id_var, 'deadline', 'крайний срок', '/ˈdedlaɪn/', 'The deadline is Friday.', 'Крайний срок — пятница.'),
            (set_id_var, 'budget', 'бюджет', '/ˈbʌdʒɪt/', 'We need to cut the budget.', 'Нам нужно сократить бюджет.'),
            (set_id_var, 'negotiate', 'вести переговоры', '/nɪˈɡoʊʃieɪt/', 'Let''s negotiate the terms.', 'Давайте обсудим условия.'),
            (set_id_var, 'profit', 'прибыль', '/ˈprɒfɪt/', 'The company made a profit.', 'Компания получила прибыль.');
    END IF;
END $$;

-- Карточки для набора "Еда и напитки"
DO $$
DECLARE
    set_id_var INTEGER;
BEGIN
    SELECT id INTO set_id_var FROM sets WHERE name = 'Еда и напитки' LIMIT 1;
    IF set_id_var IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cards WHERE set_id = set_id_var LIMIT 1) THEN
        INSERT INTO cards (set_id, word, translation, transcription, example_sentence, example_translation) VALUES
            (set_id_var, 'bread', 'хлеб', '/bred/', 'I bought fresh bread.', 'Я купил свежий хлеб.'),
            (set_id_var, 'water', 'вода', '/ˈwɔːtər/', 'Can I have some water?', 'Можно мне воды?'),
            (set_id_var, 'apple', 'яблоко', '/ˈæpl/', 'I eat an apple every day.', 'Я ем яблоко каждый день.'),
            (set_id_var, 'chicken', 'курица', '/ˈtʃɪkɪn/', 'We had chicken for dinner.', 'У нас была курица на ужин.'),
            (set_id_var, 'coffee', 'кофе', '/ˈkɒfi/', 'I need a cup of coffee.', 'Мне нужна чашка кофе.');
    END IF;
END $$;