import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const updateProduct = async (productId, updateData, imageFile) => {
  console.log(DEBUG_MESSAGES.UPDATE_REQUEST, { productId, updateData });
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    const formDataObj = new FormData();
    
    formDataObj.append('p_operation', '3');
    formDataObj.append('p_product_id', productId);
    formDataObj.append('p_updated_by', 1);
    
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
    
    // ✅ ADD UOM ID TO UPDATE
    if (updateData.uom_id !== undefined) {
      formDataObj.append('p_uom_id', updateData.uom_id);
      console.log("📏 Updating UOM ID to:", updateData.uom_id);
    }
    
    // Add new image if provided
    if (imageFile) {
      formDataObj.append('image', imageFile);
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      formDataObj.append('p_image_ext', fileExt);
      console.log("📸 New image extension:", fileExt);
    }

    console.log("Update FormData with image:", imageFile ? 'Yes' : 'No');
    console.log("Update data being sent:", {
      p_product_id: productId,
      p_product_name: updateData.productName,
      p_price: updateData.price,
      p_quantity: updateData.quantity,
      p_category: updateData.category,
      p_bar_code: updateData.barcode,
      p_uom_id: updateData.uom_id,
      has_image: imageFile ? 'Yes' : 'No'
    });
    
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
    console.error("Update error details:", error.response?.data || error);
    
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to update product",
      error: error
    };
  }
};