import api, { ERROR_MESSAGES, DEBUG_MESSAGES } from './config';

export const checkBarcodeExists = async (barcode) => {
  console.log("🔍 Checking barcode:", barcode);
  
  try {
    const response = await api.post('/products', {
      p_operation: 1
    });
    
    let productsList = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      productsList = response.data.data;
    } else if (Array.isArray(response.data)) {
      productsList = response.data;
    }
        const existingProduct = productsList.find(
      product => product.bar_code === barcode
    );
    
    console.log("Barcode check result:", existingProduct ? "EXISTS" : "AVAILABLE");
    
    return {
      exists: !!existingProduct,
      product: existingProduct || null
    };
    
  } catch (error) {
    console.error("Error checking barcode:", error);
    return {
      exists: false,
      error: error.message
    };
  }
};