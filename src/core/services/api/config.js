import axios from 'axios';

const API_URL = 'http://84.16.235.111:2140/api';  

export const DEBUG_MESSAGES = {
  // Product messages
  CREATE_REQUEST: '📤 Creating product with data:',
  CREATE_SUCCESS: '✅ Product created successfully. Response:',
  CREATE_FAILURE: '❌ Product creation failed. Error:',
  
  FETCH_REQUEST: '📤 Fetching products...',
  FETCH_SUCCESS: '✅ Products fetched successfully. Count:',
  FETCH_FAILURE: '❌ Failed to fetch products. Error:',
  
  DELETE_REQUEST: '📤 Deleting product ID:',
  DELETE_SUCCESS: '✅ Product deleted successfully. Response:',
  DELETE_FAILURE: '❌ Failed to delete product. Error:',
  
  UPDATE_REQUEST: '📤 Updating product with data:',
  UPDATE_SUCCESS: '✅ Product updated successfully. Response:',
  UPDATE_FAILURE: '❌ Product update failed. Error:',
  
  // Category messages
  CATEGORY_CREATE_REQUEST: '📝 Creating category with data:',
  CATEGORY_CREATE_SUCCESS: '✨ Category created successfully. Updated list:',
  CATEGORY_CREATE_FAILURE: '❌ Category creation failed. Error:',
  
  CATEGORY_FETCH_REQUEST: '📋 Fetching categories...',
  CATEGORY_FETCH_SUCCESS: '✅ Categories fetched successfully. Count:',
  CATEGORY_FETCH_FAILURE: '❌ Failed to fetch categories. Error:',
  
  CATEGORY_DELETE_REQUEST: '🗑️ Deleting category ID:',
  CATEGORY_DELETE_SUCCESS: '✅ Category deleted successfully. Updated list:',
  CATEGORY_DELETE_FAILURE: '❌ Failed to delete category. Error:',
  
  // Common messages
  API_CALL_START: '🚀 API Call Started:',
  API_CALL_END: '🏁 API Call Completed:',
  NETWORK_ISSUE: '⚠️ Network issue detected:',
  SERVER_RESPONSE: '📡 Server response:'
};

export const ERROR_MESSAGES = {
  // Product errors
  CREATE: 'Failed to create product',
  FETCH: 'Failed to fetch products',
  DELETE: 'Failed to delete product',
  UPDATE: 'Failed to update product',
  
  // Category errors
  CATEGORY_CREATE: 'Failed to create category',
  CATEGORY_FETCH: 'Failed to fetch categories',
  CATEGORY_DELETE: 'Failed to delete category',
  
  // Common errors
  NETWORK: 'Network error. Check your connection.',
  SERVER: 'Server error. Please try again later.'
};

export const SUCCESS_MESSAGES = {
  // Product success
  CREATE: 'Product created successfully!',
  FETCH: 'Products fetched successfully!',
  DELETE: 'Product deleted successfully!',
  UPDATE: 'Product updated successfully!',
  
  // Category success
  CATEGORY_CREATE: 'Category created successfully!',
  CATEGORY_FETCH: 'Categories fetched successfully!',
  CATEGORY_DELETE: 'Category deleted successfully!'
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;