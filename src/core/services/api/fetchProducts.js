import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const fetchProducts = async () => {
  console.log(DEBUG_MESSAGES.FETCH_REQUEST);
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    const response = await api.post('/products', {
      p_operation: 1
    });
    
    const productCount = response.data?.length || 0;
    console.log(DEBUG_MESSAGES.FETCH_SUCCESS, productCount, 'products');
    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.status);
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    return { 
      success: true, 
      data: response.data,  
      message: SUCCESS_MESSAGES.FETCH
    };
    
  } catch (error) {
    console.log(DEBUG_MESSAGES.FETCH_FAILURE, error.message);
    
    if (!error.response) {
      console.log(DEBUG_MESSAGES.NETWORK_ISSUE, 'No response from server');
    }
    
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    return { 
      success: false, 
      message: error.response?.data?.message || ERROR_MESSAGES.FETCH,
      error: error
    };
  }
};