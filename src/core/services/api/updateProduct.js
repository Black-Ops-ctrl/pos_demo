import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';
// API function to update an existing product with partial data
export const updateProduct = async (productId, updateData, imageFile) => {
  console.log(DEBUG_MESSAGES.UPDATE_REQUEST, { productId, updateData });
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    // Create FormData object
    const formDataObj = new FormData();
    
    // Required fields
    formDataObj.append('p_operation', '3');
    formDataObj.append('p_product_id', productId);
    formDataObj.append('p_updated_by', 1);
    
    // Conditionally add fields only if they are provided in updateData
    if (updateData.productName !== undefined) {
      formDataObj.append('p_product_name', updateData.productName);
    }
    
    if (updateData.price !== undefined) {
      formDataObj.append('p_price', parseFloat(updateData.price));
    }
    
    if (updateData.quantity !== undefined) {
      formDataObj.append('p_quantity', parseInt(updateData.quantity));
    }
    
    if (updateData.category !== undefined) {
      formDataObj.append('p_category', updateData.category);
    }
    
    if (updateData.barcode !== undefined) {
      formDataObj.append('p_bar_code', updateData.barcode);
    }
    
    // Add new image if provided
    if (imageFile) {
      formDataObj.append('image', imageFile);
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      formDataObj.append('p_image_ext', fileExt);
    }

    console.log("Update FormData with image:", imageFile ? 'Yes' : 'No');
    
    // Make API call
    const response = await api.post('/products', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log(DEBUG_MESSAGES.UPDATE_SUCCESS, response.data);
    
    return { 
      success: true, 
      data: response.data,
      message: "Product updated successfully!"
    };
    
  } catch (error) {
    console.log(DEBUG_MESSAGES.UPDATE_FAILURE, error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to update product",
      error: error
    };
  }
};