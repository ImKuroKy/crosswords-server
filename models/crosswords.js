import pool from "../config/exports.js";

// Получить все публичные кроссворды
export const getCrosswordsFromDB = async () => {
  const query = 'SELECT * FROM "crosswords"."crosswords_public"';
  const result = await pool.query(query);
  return result.rows;
};

// Получить кроссворды пользователя
export const getUserCrosswordsFromDB = async (userId) => {
  const query = `
    SELECT uc.user_crossword_id, cp.*
    FROM "crosswords"."user_crosswords" uc
    JOIN "crosswords"."crosswords_public" cp ON uc.crossword_id = cp.crossword_id
    WHERE uc.user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Добавить кроссворд в библиотеку пользователя
export const addCrosswordToLibraryInDB = async (userId, crosswordId) => {
  const query = `
    INSERT INTO "crosswords"."user_crosswords" (user_id, crossword_id)
    VALUES ($1, $2)
    RETURNING user_crossword_id
  `;
  const result = await pool.query(query, [userId, crosswordId]);
  return result.rows[0];
};

// Удалить кроссворд из библиотеки пользователя
export const deleteCrosswordFromLibraryInDB = async (userId, crosswordId) => {
  const query = `
    DELETE FROM "crosswords"."user_crosswords"
    WHERE user_id = $1 AND crossword_id = $2
    RETURNING user_crossword_id
  `;
  const result = await pool.query(query, [userId, crosswordId]);
  return result.rows[0];
};

// Получить прогресс пользователя по кроссворду
export const getUserCrosswordProgressFromDB = async (userCrosswordId) => {
  const query = 'SELECT * FROM "crosswords"."crossword_progress" WHERE user_crossword_id = $1';
  const result = await pool.query(query, [userCrosswordId]);
  return result.rows[0];
};

// Обновить прогресс пользователя по кроссворду
export const updateUserCrosswordProgressInDB = async (userCrosswordId, progress) => {
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
