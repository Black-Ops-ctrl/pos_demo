import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const createProduct = async (formData, categories, barcode) => {
  console.log(DEBUG_MESSAGES.CREATE_REQUEST, formData);
  console.log("Selected category ID from form:", formData.category);
  
  try {
    // Find the selected category to get its ID
    const selectedCategory = categories.find(c => c.id.toString() === formData.category.toString());
    
    // Use category ID, not name
    const categoryId = selectedCategory?.id || parseInt(formData.category);
    
    console.log("Sending category ID:", categoryId);
    
    const requestBody = {
      p_operation: 2,
      p_product_name: formData.productName,
      p_category: categoryId, // Send ID as number, not name
      p_quantity: parseInt(formData.quantity),
      p_price: parseFloat(formData.price) || 0,
      p_bar_code: barcode,
      p_image_ext: "jpg", // Default value, you can make this dynamic later
      p_description: formData.description || formData.productName, // Optional
      p_status: "CREATED", // Default status
      p_product_code: `PROD_${Date.now()}`, // Generate a unique product code
      p_account_id: 1, // Default account_id as per your API
      p_purchase_account_id: 2, // Default
      p_sale_account_id: 3, // Default
      p_website_chk: "N", // Default
      p_created_by: 1 // Default
    };
    
    console.log("Sending request body:", requestBody);

    const response = await api.post('/products', requestBody);
    
    console.log("API Response:", response.data);
    
    return { 
      success: true, 
      data: response.data,
      message: SUCCESS_MESSAGES.CREATE
    };
    
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || ERROR_MESSAGES.CREATE
    };
  }
};