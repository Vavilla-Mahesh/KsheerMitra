import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken } from '../middlewares/auth.js';
import { validate, updateUserSchema } from '../utils/validation.js';

const router = express.Router();

router.get('/me', verifyToken, userController.getMe);
router.put('/me', verifyToken, validate(updateUserSchema), userController.updateMe);

export default router;
