import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const deleteProduct = async (productId) => {
  console.log(DEBUG_MESSAGES.DELETE_REQUEST, productId);
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    const response = await api.post('/products', {
      p_operation: 4,
      p_product_id: productId
    });
    
    console.log(DEBUG_MESSAGES.DELETE_SUCCESS, response.data);
    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.status);
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    return { 
      success: true, 
      data: response.data,
      message: SUCCESS_MESSAGES.DELETE
    };
    
  } catch (error) {
    console.log(DEBUG_MESSAGES.DELETE_FAILURE, error.message);
    
    if (!error.response) {
      console.log(DEBUG_MESSAGES.NETWORK_ISSUE, 'No response from server');
    }
    
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    return { 
      success: false, 
      message: error.response?.data?.message || ERROR_MESSAGES.DELETE,
      error: error
    };
  }
};