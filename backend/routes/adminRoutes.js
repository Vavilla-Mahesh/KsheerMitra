import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, adminUpdateUserSchema, adminUpdateDeliveryBoySchema, adminAssignDeliverySchema } from '../utils/validation.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, checkRole('admin'));

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', validate(adminUpdateUserSchema), adminController.updateUser);
router.patch('/users/:id/deactivate', adminController.deactivateUser);

// Delivery Boy Management
router.get('/delivery-boy', adminController.getDeliveryBoy);
router.put('/delivery-boy', validate(adminUpdateDeliveryBoySchema), adminController.updateDeliveryBoy);

// Delivery Assignment
router.post('/assign-delivery', validate(adminAssignDeliverySchema), adminController.assignDelivery);

// Dashboard Stats
router.get('/dashboard', adminController.getDashboardStats);

export default router;
