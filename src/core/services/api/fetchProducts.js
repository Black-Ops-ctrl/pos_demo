import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';
// API function to fetch all products from the server
export const fetchProducts = async () => {
  console.log(DEBUG_MESSAGES.FETCH_REQUEST);
  console.log(DEBUG_MESSAGES.API_CALL_START, new Date().toISOString());
  
  try {
    // Make API call to fetch products with operation type 1 (read operation)
    const response = await api.post('/products', {
      p_operation: 1
    });
    
    console.log("Products API raw response:", response.data);
    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.status);
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    // Extract products list from various possible response formats
    let productsList = [];
    // Check if data is nested in response.data.data
    if (response.data?.data && Array.isArray(response.data.data)) {
      productsList = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Check if response.data itself is the array
      productsList = response.data;
    } else if (response.data?.products && Array.isArray(response.data.products)) {
      // Check if products are under response.data.products
      productsList = response.data.products;
    }
    
    console.log("✅ Products fetched successfully. Count:", productsList.length, "products");
    console.log("Processed products list:", productsList);
    
    return productsList; 
    
  } catch (error) {
    console.error(DEBUG_MESSAGES.FETCH_FAILURE, error.message);
    console.error("Error response:", error.response?.data);
    
    // Log network issues if no response received
    if (!error.response) {
      console.error(DEBUG_MESSAGES.NETWORK_ISSUE, 'No response from server');
    }
    
    console.log(DEBUG_MESSAGES.API_CALL_END, new Date().toISOString());
    
    // Return empty array on error to prevent UI crashes
    return []; 
  }
};