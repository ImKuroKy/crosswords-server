import express from 'express';
import {
  getUserID,
  getCrosswords,
  getUserCrosswords,
  addCrosswordToLibrary,
  deleteCrosswordFromLibrary,
  getUserCrosswordProgress,
  updateUserCrosswordProgress
} from '../controllers/crosswordsController.js';
import authenticateJWT from "../middleware/authenticateJWT.js";

const router = express.Router();

router.get('/user', authenticateJWT, getUserID);
router.get('/library', authenticateJWT, getCrosswords);
router.get('/user/library', authenticateJWT, getUserCrosswords);
router.post('/user/library', authenticateJWT, addCrosswordToLibrary);
router.delete('/user/library', authenticateJWT, deleteCrosswordFromLibrary);
router.get('/user/library/progress/:id', authenticateJWT, getUserCrosswordProgress);
router.put('/user/library/progress/:id', authenticateJWT, updateUserCrosswordProgress);

export default router;
