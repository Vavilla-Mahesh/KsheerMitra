import * as productService from '../services/productService.js';

export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.validatedData);
    
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
    const products = await productService.getAllProducts(activeOnly);
    
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
    const product = await productService.updateProduct(req.params.id, req.validatedData);
    
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
