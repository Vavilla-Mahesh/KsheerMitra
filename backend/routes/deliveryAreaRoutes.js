import express from 'express';
import * as deliveryAreaController from '../controllers/deliveryAreaController.js';
import { validate, deliveryAreaSchema, assignCustomersSchema, generateRouteSchema, updateRouteStatusSchema, updateDeliveryLogSchema } from '../utils/validation.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Delivery Area Management (Admin only)
router.post(
  '/areas',
  authenticateToken,
  authorizeRoles('admin'),
  validate(deliveryAreaSchema),
  deliveryAreaController.createDeliveryArea
);

router.get(
  '/areas',
  authenticateToken,
  authorizeRoles('admin', 'delivery_boy'),
  deliveryAreaController.getAllDeliveryAreas
);

router.get(
  '/areas/:id',
  authenticateToken,
  authorizeRoles('admin', 'delivery_boy'),
  deliveryAreaController.getDeliveryAreaById
);

router.put(
  '/areas/:id',
  authenticateToken,
  authorizeRoles('admin'),
  validate(deliveryAreaSchema),
  deliveryAreaController.updateDeliveryArea
);

router.delete(
  '/areas/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deliveryAreaController.deleteDeliveryArea
);

router.post(
  '/areas/:id/assign-customers',
  authenticateToken,
  authorizeRoles('admin'),
  validate(assignCustomersSchema),
  deliveryAreaController.assignCustomersToArea
);

router.get(
  '/areas/:id/customers',
  authenticateToken,
  authorizeRoles('admin', 'delivery_boy'),
  deliveryAreaController.getCustomersInArea
);

// Customer location map view (Admin only)
router.get(
  '/customers/locations',
  authenticateToken,
  authorizeRoles('admin'),
  deliveryAreaController.getCustomersWithLocation
);

// Route Optimization
router.post(
  '/routes/generate',
  authenticateToken,
  authorizeRoles('admin', 'delivery_boy'),
  validate(generateRouteSchema),
  deliveryAreaController.generateOptimizedRoute
);

router.get(
  '/routes/delivery-boy/:deliveryBoyId',
  authenticateToken,
  authorizeRoles('admin', 'delivery_boy'),
  deliveryAreaController.getDeliveryBoyRoutes
);

router.get(
  '/routes/:id',
  authenticateToken,
  authorizeRoles('admin', 'delivery_boy'),
  deliveryAreaController.getRouteDetails
);

router.put(
  '/routes/:id/status',
  authenticateToken,
  authorizeRoles('delivery_boy'),
  validate(updateRouteStatusSchema),
  deliveryAreaController.updateRouteStatus
);

router.put(
  '/logs/:id',
  authenticateToken,
  authorizeRoles('delivery_boy'),
  validate(updateDeliveryLogSchema),
  deliveryAreaController.updateDeliveryLog
);

export default router;
