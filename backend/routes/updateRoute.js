import express from 'express';
import updateController from '../controllers/updateController.js'
import authMiddleware from '../middleware/authMiddleware.js';
import { multerMiddleware } from '../config/cloudinaryConfig.js';

const router = express.Router();

//protected routes
router.post('/', authMiddleware , multerMiddleware , updateController.createUpdate);
router.get('/', authMiddleware , updateController.getUpdates);
router.put('/:updateId/view', authMiddleware , updateController.viewUpdates);
router.delete('/:updateId', authMiddleware , updateController.deleteUpdate);

export default router;