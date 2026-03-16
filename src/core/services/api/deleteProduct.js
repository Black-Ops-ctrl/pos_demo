import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

// API function to delete a product by its ID
export const deleteProduct = async (productId) => {
  console.log(DEBUG_MESSAGES.DELETE_REQUEST, productId);
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    // Create FormData for delete operation
    const formDataObj = new FormData();
    formDataObj.append('p_operation', '4');
    formDataObj.append('p_product_id', productId);
    formDataObj.append('p_updated_by', 1);
    
    // Make API call to delete product with operation type 4
    const response = await api.post('/products', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log(DEBUG_MESSAGES.DELETE_SUCCESS, response.data);
    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.status);
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    // Return success response with deleted product data
    return { 
      success: true, 
      data: response.data,
      message: SUCCESS_MESSAGES.DELETE
    };
    
  } catch (error) {
    console.log(DEBUG_MESSAGES.DELETE_FAILURE, error.message);
    
    // Log network issues if no response received
    if (!error.response) {
      console.log(DEBUG_MESSAGES.NETWORK_ISSUE, 'No response from server');
    }
    
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    // Return formatted error response
    return { 
      success: false, 
      message: error.response?.data?.message || ERROR_MESSAGES.DELETE,
      error: error
    };
  }
};