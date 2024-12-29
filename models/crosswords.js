import pool from "../config/exports.js";

// Проверить, существует ли кроссворд с указанным названием
export const doesCrosswordExistInDB = async (title) => {
  const query = `
    SELECT COUNT(*) > 0 AS exists
    FROM "crosswords"."crosswords_public"
    WHERE title = $1
  `;
  const result = await pool.query(query, [title]);
  return result.rows[0].exists;
};

// Проверить, существует ли кроссворд с таким названием в пользовательской библиотеке
export const doesCrosswordExistInUserDB = async (userId, title) => {
  const query = `
    SELECT COUNT(*) > 0 AS exists
    FROM "crosswords"."user_crosswords"
    WHERE user_id = $1 AND crossword_content->>'title' = $2
  `;
  const result = await pool.query(query, [userId, title]);
  return result.rows[0].exists;
};


// Получить все публичные кроссворды
export const getCrosswordsFromDB = async () => {
  const query = 'SELECT * FROM "crosswords"."crosswords_public"';
  const result = await pool.query(query);
  return result.rows;
};

// Получить кроссворд по id
export const getCrosswordToPlayByIdFromDB = async (crosswordId) => {
  const query = 'SELECT "content" FROM "crosswords"."crosswords_public" WHERE crossword_id = $1';
  const result = await pool.query(query, [crosswordId]);
  return result.rows[0];
};

// Получить кроссворды пользователя
export const getUserCrosswordsFromDB = async (userId) => {
  const query = `
    SELECT user_crossword_id AS id,
           crossword_content->>'title' AS title
    FROM "crosswords"."user_crosswords"
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};


// Добавить кроссворд в библиотеку пользователя
export const addCrosswordToLibraryInDB = async (userId, crosswordId) => {
  const query = `
    INSERT INTO "crosswords"."user_crosswords" (user_id, crossword_content)
    SELECT $1, cp.content
    FROM "crosswords"."crosswords_public" cp
    WHERE cp.crossword_id = $2
    RETURNING user_crossword_id
  `;
  const result = await pool.query(query, [userId, crosswordId]);
  return result.rows[0];
};


// Добавить кроссворд в библиотеку пользователя
export const saveCrosswordToPublicLibraryDB = async (crosswordData) => {
  const dictionaryName = crosswordData.title; // Извлекаем название кроссворда из JSON
  const content = crosswordData; // Полный JSON объект

  const query = `
    INSERT INTO "crosswords"."crosswords_public" (title, content)
    VALUES ($1, $2)
    RETURNING crossword_id
  `;
  const values = [dictionaryName, content];

  try {
    const result = await pool.query(query, values);
    return result.rows[0].dictionary_id;
  } catch (error) {
    console.error('Ошибка при сохранении кроссворда:', error);
    throw error;
  }
};

// Удалить кроссворд из библиотеки пользователя
export const deleteCrosswordFromUserLibraryInDB = async (
  userId,
  userCrosswordId
) => {
  const query = `
    DELETE FROM "crosswords"."user_crosswords"
    WHERE user_id = $1 AND user_crossword_id = $2
    RETURNING user_crossword_id
  `;
  const result = await pool.query(query, [userId, userCrosswordId]);
  return result.rows[0];
};


// Удалить кроссворд из общей библиотеки
export const deleteCrosswordFromPublicLibraryInDB = async (crosswordId) => {
  const query = `
    DELETE FROM "crosswords"."crosswords_public"
    WHERE crossword_id = $1
    RETURNING crossword_id
  `;
  const result = await pool.query(query, [crosswordId]);
  return result.rows[0];
};

// Получить прогресс пользователя по кроссворду
export const getUserCrosswordProgressFromDB = async (userCrosswordId) => {
  const query =
    'SELECT * FROM "crosswords"."crossword_progress" WHERE user_crossword_id = $1';
  const result = await pool.query(query, [userCrosswordId]);
  return result.rows[0];
};

// Обновить прогресс пользователя по кроссворду
export const updateUserCrosswordProgressInDB = async (
  userCrosswordId,
  progress
) => {
  const query = `
    INSERT INTO "crosswords"."crossword_progress" (user_crossword_id, progress)
    VALUES ($1, $2)
    ON CONFLICT (user_crossword_id) DO UPDATE
    SET progress = EXCLUDED.progress
    RETURNING progress_id
  `;
  const result = await pool.query(query, [userCrosswordId, progress]);
  return result.rows[0];
};
