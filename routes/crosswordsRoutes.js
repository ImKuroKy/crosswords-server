import express from 'express';
import {
  getUserID,
  getCrosswords,
  getUserCrosswords,
  addCrosswordToLibrary,
  deleteCrosswordFromUserLibrary,
  deleteCrosswordFromPublicLibrary,
  getUserCrosswordProgress,
  updateUserCrosswordProgress,
  getAllDictionaries,
  postDictionary,
  deleteDictionary
} from '../controllers/crosswordsController.js';
import authenticateJWT from "../middleware/authenticateJWT.js";
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/user', authenticateJWT, getUserID);
router.get('/library', authenticateJWT, getCrosswords);
router.delete('/library', authenticateJWT, deleteCrosswordFromPublicLibrary);
router.get('/user/library', authenticateJWT, getUserCrosswords);
router.post('/user/library', authenticateJWT, addCrosswordToLibrary);
router.delete('/user/library', authenticateJWT, deleteCrosswordFromUserLibrary);
router.get('/user/library/progress/:id', authenticateJWT, getUserCrosswordProgress);
router.put('/user/library/progress/:id', authenticateJWT, updateUserCrosswordProgress);

router.get('/dictionaries', authenticateJWT, getAllDictionaries);
router.post('/dictionaries', authenticateJWT, upload.single('file'), postDictionary);
router.delete('/dictionaries/:id', authenticateJWT, deleteDictionary);

export default router;
