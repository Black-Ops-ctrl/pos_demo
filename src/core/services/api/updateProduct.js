import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const updateProduct = async (productId, updateData) => {
  console.log(DEBUG_MESSAGES.UPDATE_REQUEST, { productId, updateData });
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    const requestBody = {
      p_operation: 3,
      p_product_id: productId,
      p_updated_by: 1 
    };

    if (updateData.productName !== undefined) {
      requestBody.p_product_name = updateData.productName;
    }
    
    if (updateData.price !== undefined) {
      requestBody.p_price = parseFloat(updateData.price);
    }
    
    if (updateData.quantity !== undefined) {
      requestBody.p_quantity = parseInt(updateData.quantity);
    }
    
    if (updateData.category !== undefined) {
      requestBody.p_category = updateData.category;
    }
    
    if (updateData.barcode !== undefined) {
      requestBody.p_bar_code = updateData.barcode;
    }

    console.log("Update Request Body:", requestBody);

    const response = await api.post('/products', requestBody);
    
    console.log(DEBUG_MESSAGES.UPDATE_SUCCESS, response.data);
    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.status);
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    return { 
      success: true, 
      data: response.data,
      message: SUCCESS_MESSAGES.UPDATE || "Product updated successfully!"
    };
    
  } catch (error) {
    console.log(DEBUG_MESSAGES.UPDATE_FAILURE, error.message);
    
    if (!error.response) {
      console.log(DEBUG_MESSAGES.NETWORK_ISSUE, 'No response from server');
    }
    
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    return { 
      success: false, 
      message: error.response?.data?.message || ERROR_MESSAGES.UPDATE || "Failed to update product",
      error: error
    };
  }
};