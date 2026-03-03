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
    const response = await api.post('/itemCategories', {
      operation: 4,
      category_id: parseInt(categoryId)
    });

    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.data);
    console.log(DEBUG_MESSAGES.CATEGORY_DELETE_SUCCESS, response.data?.length || 0);
    console.log(DEBUG_MESSAGES.API_CALL_END);
    
    return response.data; 
  } catch (error) {
    console.error(DEBUG_MESSAGES.CATEGORY_DELETE_FAILURE, error.message);
    
    if (!error.response) {
      console.error(DEBUG_MESSAGES.NETWORK_ISSUE, error.message);
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    
    if (error.response?.status >= 500) {
      throw new Error(ERROR_MESSAGES.SERVER);
    }
    
    throw new Error(error.response?.data?.message || ERROR_MESSAGES.CATEGORY_DELETE);
  }
};

export default deleteCategory;