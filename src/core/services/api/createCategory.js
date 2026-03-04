import api, { DEBUG_MESSAGES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './config';
/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.category_name - Name of the category
 * @param {string} categoryData.description - Category description
 * @returns {Promise<Array>} Updated list of all categories
 */
export const createCategory = async (categoryData) => {
  console.log(DEBUG_MESSAGES.API_CALL_START);
  console.log(DEBUG_MESSAGES.CATEGORY_CREATE_REQUEST, categoryData);

  try {
    // Make API call to create new category with operation type 2
    const response = await api.post('/itemCategories', {
      operation: 2,
      category_name: categoryData.category_name,
      account_id: 1, // Hardcoded as per requirement
      description: categoryData.description,
      module_id: 1 // Hardcoded as per requirement
    });

    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.data);
    console.log(DEBUG_MESSAGES.CATEGORY_CREATE_SUCCESS, response.data?.length || 0);
    console.log(DEBUG_MESSAGES.API_CALL_END);
    
    // Return the updated categories list from server
    return response.data; 
  } catch (error) {
    console.error(DEBUG_MESSAGES.CATEGORY_CREATE_FAILURE, error.message);
    
    // Handle network connectivity issues
    if (!error.response) {
      console.error(DEBUG_MESSAGES.NETWORK_ISSUE, error.message);
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    
    // Handle server-side errors (500+ status codes)
    if (error.response?.status >= 500) {
      throw new Error(ERROR_MESSAGES.SERVER);
    }
    
    // Handle other errors with server-provided message or default
    throw new Error(error.response?.data?.message || ERROR_MESSAGES.CATEGORY_CREATE);
  }
};
export default createCategory;