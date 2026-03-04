import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';
// API function to fetch all categories from the server
export const fetchCategories = async () => {
  console.log(DEBUG_MESSAGES.API_CALL_START, 'GET /api/itemCategories');
  console.log(DEBUG_MESSAGES.CATEGORY_FETCH_REQUEST);

  try {
    // Make API call to fetch categories with operation type 1 (read operation)
    const response = await api.post('/itemCategories', {
      operation: 1
    });

    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.data);
    console.log(DEBUG_MESSAGES.CATEGORY_FETCH_SUCCESS, response.data?.length || 0);
    console.log(DEBUG_MESSAGES.API_CALL_END, 'GET /api/itemCategories');
    
    // Return categories array or empty array if no data
    return response.data || [];
  } catch (error) {
    console.error(DEBUG_MESSAGES.CATEGORY_FETCH_FAILURE, error.message);
    
    // Handle network connectivity issues
    if (!error.response) {
      console.error(DEBUG_MESSAGES.NETWORK_ISSUE, error.message);
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    
    // Handle server-side errors (500+ status codes)
    if (error.response?.status >= 500) {
      throw new Error(ERROR_MESSAGES.SERVER);
    }
    
    // Handle other errors with server-provided message or default
    throw new Error(error.response?.data?.message || ERROR_MESSAGES.CATEGORY_FETCH);
  }
};