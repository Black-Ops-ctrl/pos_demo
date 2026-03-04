import api, { ERROR_MESSAGES, DEBUG_MESSAGES } from './config';
// API function to check if a barcode already exists in the product database
export const checkBarcodeExists = async (barcode) => {
  console.log("🔍 Checking barcode:", barcode);
  
  try {
    // Make API call to fetch all products with operation type 1
    const response = await api.post('/products', {
      p_operation: 1
    });
    
    // Extract products list from various possible response formats
    let productsList = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      productsList = response.data.data;
    } else if (Array.isArray(response.data)) {
      productsList = response.data;
    }
    // Find if any product matches the given barcode
    const existingProduct = productsList.find(
      product => product.bar_code === barcode
    );
    
    console.log("Barcode check result:", existingProduct ? "EXISTS" : "AVAILABLE");
    
    // Return result with existence flag and product data if found
    return {
      exists: !!existingProduct,
      product: existingProduct || null
    };
    
  } catch (error) {
    // Handle any errors during the API call
    console.error("Error checking barcode:", error);
    return {
      exists: false,
      error: error.message
    };
  }
};