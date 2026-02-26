import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const createProduct = async (formData, categories, barcode) => {
  console.log(DEBUG_MESSAGES.CREATE_REQUEST, formData);
  
  try {
    const selectedCategory = categories.find(c => c.id.toString() === formData.category.toString());

    const response = await api.post('/products', {
      p_operation: 2,
      p_product_name: formData.productName,
      p_category: selectedCategory?.name || formData.category,
      p_quantity: parseInt(formData.quantity),
      p_price: parseFloat(formData.price) || 0,
      p_bar_code: barcode
    });
    
    return { 
      success: true, 
      data: response.data,
      message: SUCCESS_MESSAGES.CREATE
    };
    
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || ERROR_MESSAGES.CREATE
    };
  }
};