import axios from 'axios';

const API_URL = 'http://84.16.235.111:2138/api';

export const DEBUG_MESSAGES = {
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
  
  API_CALL_START: '🚀 API Call Started:',
  API_CALL_END: '🏁 API Call Completed:',
  NETWORK_ISSUE: '⚠️ Network issue detected:',
  SERVER_RESPONSE: '📡 Server response:'
};

export const ERROR_MESSAGES = {
  CREATE: 'Failed to create product',
  FETCH: 'Failed to fetch products',
  DELETE: 'Failed to delete product',
  UPDATE: 'Failed to update product',
  NETWORK: 'Network error. Check your connection.',
  SERVER: 'Server error. Please try again later.'
};

export const SUCCESS_MESSAGES = {
  CREATE: 'Product created successfully!',
  FETCH: 'Products fetched successfully!',
  DELETE: 'Product deleted successfully!',
  UPDATE: 'Product updated successfully!'
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;