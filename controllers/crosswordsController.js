import {
  getCrosswordsFromDB,
  getUserCrosswordsFromDB,
  addCrosswordToLibraryInDB,
  deleteCrosswordFromUserLibraryInDB,
  deleteCrosswordFromPublicLibraryInDB,
  getUserCrosswordProgressFromDB,
  updateUserCrosswordProgressInDB,
} from "../models/crosswords.js";
import { validationResult } from "express-validator";

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
    const crosswordId = req.body.id;
    const newEntry = await addCrosswordToLibraryInDB(userId, crosswordId);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error adding crossword to library: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Удалить кроссворд из библиотеки пользователя
export const deleteCrosswordFromUserLibrary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const crosswordId = req.body.id;
    const deletedEntry = await deleteCrosswordFromUserLibraryInDB(
      userId,
      crosswordId
    );
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
    console.log(deletedEntry)
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
