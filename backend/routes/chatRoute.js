import express from 'express';
import chatController from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { multerMiddleware } from '../config/cloudinaryConfig.js';

const router = express.Router();

//protected routes
router.post('/send-message', authMiddleware , multerMiddleware , chatController.sendMessage);
router.get('/conversations', authMiddleware , chatController.getAllConversation);
router.get('/conversation/:conversationId/messages', authMiddleware , chatController.getMessages);
router.put('/mark-as-read', authMiddleware , chatController.markAsRead);
router.delete('/messages/:messageId', authMiddleware , chatController.deleteMessage);

export default router;