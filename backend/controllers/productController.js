import * as productService from '../services/productService.js';

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Convert string values from multipart form data to proper types
    if (productData.unit_price) {
      productData.unit_price = parseFloat(productData.unit_price);
    }

    if (productData.is_active !== undefined) {
      productData.is_active = productData.is_active === 'true' || productData.is_active === true;
    }

    // Add image URL if file was uploaded
    if (req.file) {
      productData.image_url = `/uploads/products/${req.file.filename}`;
    }
    
    const product = await productService.createProduct(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    
    const products = await productService.getAllProducts({ activeOnly, page, limit, category });
    
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    
    // Convert string values from multipart form data to proper types
    if (updates.unit_price) {
      updates.unit_price = parseFloat(updates.unit_price);
    }

    if (updates.is_active !== undefined) {
      updates.is_active = updates.is_active === 'true' || updates.is_active === true;
    }

    // Add image URL if file was uploaded
    if (req.file) {
      updates.image_url = `/uploads/products/${req.file.filename}`;
    }
    
    const product = await productService.updateProduct(req.params.id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
