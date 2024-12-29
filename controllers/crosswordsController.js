import {
  getCrosswordToPlayByIdFromDB,
  getCrosswordsFromDB,
  getUserCrosswordsFromDB,
  addCrosswordToLibraryInDB,
  saveCrosswordToPublicLibraryDB,
  deleteCrosswordFromUserLibraryInDB,
  deleteCrosswordFromPublicLibraryInDB,
  getUserCrosswordProgressFromDB,
  updateUserCrosswordProgressInDB,
  doesCrosswordExistInDB,
  doesCrosswordExistInUserDB,
} from "../models/crosswords.js";
import {
  getAllDictionariesFromDB,
  getDictionaryContentByNameFromDB,
  postDictionaryInDB,
  deleteDictionaryFromDB,
} from "../models/dictionary.js";
import fs from "fs/promises";
import path from "path";

// Получение всех словарей
export const getAllDictionaries = async (req, res) => {
  try {
    const dictionaries = await getAllDictionariesFromDB();
    res.json(dictionaries);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении словарей" });
  }
};

// Получение кроссворда по Id
export const getCrosswordToPlayById = async (req, res) => {
  const crosswordId = req.params.crosswordId;  // Получаем ID из параметров
  try {
    const crossword = await getCrosswordToPlayByIdFromDB(crosswordId);
    res.json({ crossword });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении кроссворда" });
    console.log(error);
  }
};


// Получение содержимого словаря по имени
export const getDictionaryByName = async (req, res) => {
  const { name } = req.params; // Получаем имя словаря из параметров URL
  try {
    const content = await getDictionaryContentByNameFromDB(name); // Запросим только content
    if (content) {
      res.json({ content }); // Отправляем содержимое словаря клиенту
    } else {
      res.status(404).json({ message: "Словарь не найден" }); // Если словарь не найден
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении словаря" });
  }
};

// Загрузка нового словаря
export const postDictionary = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res
        .status(400)
        .json({ message: "Необходимо предоставить название и файл словаря" });
    }

    const filePath = path.resolve(file.path);
    const fileContent = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);

    const dictionary = await postDictionaryInDB(name, jsonData);

    // Удаляем временный файл после прочтения
    await fs.unlink(filePath);

    res.status(201).json(dictionary);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при загрузке словаря" });
    console.log(error);
  }
};

// Удаление словаря
export const deleteDictionary = async (req, res) => {
  try {
    const dictionaryId = req.params.id;
    const dictionary = await deleteDictionaryFromDB(dictionaryId);
    if (!dictionary) {
      return res.status(404).json({ message: "Словарь не найден" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении словаря" });
  }
};

// Получить ID пользователя
export const getUserID = async (req, res) => {
  try {
    const userId = req.user.userId;
    res.status(200).json({ userId });
  } catch (error) {
    console.error("Error fetching user ID: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Получить все публичные кроссворды
export const getCrosswords = async (req, res) => {
  try {
    const crosswords = await getCrosswordsFromDB();
    res.status(200).json(crosswords);
  } catch (error) {
    console.error("Error fetching crosswords: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Получить кроссворды пользователя
export const getUserCrosswords = async (req, res) => {
  try {
    const userId = req.user.userId;
    const crosswords = await getUserCrosswordsFromDB(userId);
    res.status(200).json(crosswords);
  } catch (error) {
    console.error("Error fetching user crosswords: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Добавить кроссворд в библиотеку пользователя
export const addCrosswordToLibrary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const crosswordId = req.body.id; // ID кроссворда из общей библиотеки

    // Проверяем, существует ли кроссворд с таким ID в общей библиотеке
    const crossword = await getCrosswordToPlayByIdFromDB(crosswordId);
    if (!crossword || !crossword.content) {
      return res.status(404).json({ message: "Кроссворд не найден или данные отсутствуют" });
    }

    // Извлекаем название кроссворда из поля content
    const title = crossword.content.title; 
    if (!title) {
      return res.status(400).json({ message: "Название кроссворда отсутствует" });
    }

    // Проверка на существование кроссворда с таким же названием в пользовательской библиотеке
    const exists = await doesCrosswordExistInUserDB(userId, title);
    if (exists) {
      return res.status(400).json({ message: "Кроссворд с таким названием уже существует в вашей библиотеке" });
    }

    // Добавляем кроссворд в пользовательскую библиотеку, клонируя JSONB
    const newEntry = await addCrosswordToLibraryInDB(userId, crosswordId);
    res.status(201).json({ message: "Кроссворд успешно добавлен в вашу библиотеку", newEntry });
  } catch (error) {
    console.error("Error adding crossword to library: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// Добавить кроссворд в публичную библиотеку
export const addCrosswordToPublicLibrary = async (req, res) => {
  const crosswordData = req.body;

  try {
    const { title } = crosswordData;

    // Проверка на существование кроссворда с таким названием
    const exists = await doesCrosswordExistInDB(title);
    if (exists) {
      return res.status(400).json({ message: "Кроссворд с таким названием уже существует" });
    }

    const crosswordId = await saveCrosswordToPublicLibraryDB(crosswordData);
    res.status(201).json({ message: 'Кроссворд успешно сохранен', crosswordId });
  } catch (error) {
    console.error('Ошибка при сохранении кроссворда:', error);
    res.status(500).json({ error: 'Ошибка при сохранении кроссворда' });
  }
};

// Удалить кроссворд из библиотеки пользователя
export const deleteCrosswordFromUserLibrary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userCrosswordId = req.body.id; // Идентификатор кроссворда в пользовательской библиотеке
    const deletedEntry = await deleteCrosswordFromUserLibraryInDB(
      userId,
      userCrosswordId
    );
    if (!deletedEntry) {
      return res.status(404).json({ message: "Кроссворд не найден" });
    }
    res.status(200).json(deletedEntry);
  } catch (error) {
    console.error("Error deleting crossword from library: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Удалить кроссворд из общей библиотеки
export const deleteCrosswordFromPublicLibrary = async (req, res) => {
  try {
    const crosswordId = req.body.id;
    const deletedEntry = await deleteCrosswordFromPublicLibraryInDB(
      crosswordId
    );
    res.status(200).json(deletedEntry);
  } catch (error) {
    console.error("Error deleting crossword from library: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Получить прогресс пользователя по кроссворду
export const getUserCrosswordProgress = async (req, res) => {
  try {
    const userCrosswordId = req.params.id;
    const progress = await getUserCrosswordProgressFromDB(userCrosswordId);
    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching crossword progress: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Обновить прогресс пользователя по кроссворду
export const updateUserCrosswordProgress = async (req, res) => {
  try {
    const userCrosswordId = req.params.id;
    const progress = req.body.progress;
    const updatedProgress = await updateUserCrosswordProgressInDB(
      userCrosswordId,
      progress
    );
    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error("Error updating crossword progress: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
