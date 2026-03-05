import api, { ERROR_MESSAGES, SUCCESS_MESSAGES, DEBUG_MESSAGES } from './config';

export const fetchCategories = async () => {
  console.log(DEBUG_MESSAGES.API_CALL_START, 'GET /api/itemCategories');
  console.log(DEBUG_MESSAGES.CATEGORY_FETCH_REQUEST);

  try {
    const response = await api.post('/itemCategories', {
      p_operation: 1
    });

    console.log("Categories API raw response:", response.data);
    console.log(DEBUG_MESSAGES.SERVER_RESPONSE, response.status);
    
    let categoriesList = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      categoriesList = response.data.data;
    } else if (Array.isArray(response.data)) {
      categoriesList = response.data;
    } else if (response.data?.categories && Array.isArray(response.data.categories)) {
      categoriesList = response.data.categories;
    }
    
    console.log("✅ Categories fetched successfully. Count:", categoriesList.length, "categories");
    console.log("Processed categories list:", categoriesList);
    console.log(DEBUG_MESSAGES.API_CALL_END, 'GET /api/itemCategories');
    
    return categoriesList; 
    
  } catch (error) {
    console.error(DEBUG_MESSAGES.CATEGORY_FETCH_FAILURE, error.message);
    console.error("Error response:", error.response?.data);
        if (!error.response) {
      console.error(DEBUG_MESSAGES.NETWORK_ISSUE, 'No response from server');
    }
    console.log(DEBUG_MESSAGES.API_CALL_END, 'GET /api/itemCategories');
    return [];
  }
};