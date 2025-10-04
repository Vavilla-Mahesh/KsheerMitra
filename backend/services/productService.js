import * as productModel from '../models/productModel.js';

export const createProduct = async (productData) => {
  const product = await productModel.createProduct(productData);
  return product;
};

export const getAllProducts = async (options) => {
  const result = await productModel.findAllProducts(options);
  return result;
};

export const getProductById = async (id) => {
  const product = await productModel.findProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

export const updateProduct = async (id, updates) => {
  const product = await productModel.findProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  const updatedProduct = await productModel.updateProduct(id, updates);
  return updatedProduct;
};

export const deleteProduct = async (id) => {
  const product = await productModel.findProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  const deletedProduct = await productModel.deleteProduct(id);
  return deletedProduct;
};
