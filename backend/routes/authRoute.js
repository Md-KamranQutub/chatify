import express from 'express';
import authcontroller from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { multerMiddleware } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.post('/send-otp', authcontroller.sendOtp);
router.post('/verify-otp', authcontroller.verifyOtp);
router.get('/logout', authcontroller.logOut);

//protected route 
router.put('/update-profile', authMiddleware , multerMiddleware , authcontroller.updateProfile);
router.get('/check-auth' , authMiddleware , authcontroller.checkAuthenticated);
router.get('/users', authMiddleware, authcontroller.getAllUsers);

export default router;
