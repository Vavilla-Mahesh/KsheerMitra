import express from 'express';
import * as productController from '../controllers/productController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, productSchema, updateProductSchema } from '../utils/validation.js';

const router = express.Router();

router.get('/', verifyToken, productController.getAllProducts);
router.get('/:id', verifyToken, productController.getProductById);
router.post('/', verifyToken, checkRole('admin'), validate(productSchema), productController.createProduct);
router.put('/:id', verifyToken, checkRole('admin'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', verifyToken, checkRole('admin'), productController.deleteProduct);

export default router;
