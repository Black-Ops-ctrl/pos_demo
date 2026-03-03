import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const fetchCategories = async () => {
  console.log(DEBUG_MESSAGES.API_CALL_START, 'GET /api/itemCategories');
  console.log(DEBUG_MESSAGES.CATEGORY_FETCH_REQUEST);

  try {
    const response = await api.post('/itemCategories', {
      operation: 1
    });

    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.data);
    console.log(DEBUG_MESSAGES.CATEGORY_FETCH_SUCCESS, response.data?.length || 0);
    console.log(DEBUG_MESSAGES.API_CALL_END, 'GET /api/itemCategories');
    
    return response.data || [];
  } catch (error) {
    console.error(DEBUG_MESSAGES.CATEGORY_FETCH_FAILURE, error.message);
    
    if (!error.response) {
      console.error(DEBUG_MESSAGES.NETWORK_ISSUE, error.message);
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    
    if (error.response?.status >= 500) {
      throw new Error(ERROR_MESSAGES.SERVER);
    }
    
    throw new Error(error.response?.data?.message || ERROR_MESSAGES.CATEGORY_FETCH);
  }
};