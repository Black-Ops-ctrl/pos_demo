import api, { DEBUG_MESSAGES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './config';
/**
 * Delete a category by ID
 * @param {number|string} categoryId - ID of the category to delete
 * @returns {Promise<Array>} Updated list of all categories
 */
export const deleteCategory = async (categoryId) => {
  console.log(DEBUG_MESSAGES.API_CALL_START);
  console.log(DEBUG_MESSAGES.CATEGORY_DELETE_REQUEST, categoryId);

  try {
    // Make API call to delete category with operation type 4
    const response = await api.post('/itemCategories', {
      operation: 4,
      category_id: parseInt(categoryId) // Convert to integer for API
    });

    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.data);
    console.log(DEBUG_MESSAGES.CATEGORY_DELETE_SUCCESS, response.data?.length || 0);
    console.log(DEBUG_MESSAGES.API_CALL_END);
    
    // Return the updated categories list from server
    return response.data; 
  } catch (error) {
    console.error(DEBUG_MESSAGES.CATEGORY_DELETE_FAILURE, error.message);
    
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
    throw new Error(error.response?.data?.message || ERROR_MESSAGES.CATEGORY_DELETE);
  }
};
export default deleteCategory;