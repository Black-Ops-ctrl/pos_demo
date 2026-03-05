import api from './config';

/**
 * Create a new category with optional image
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.category_name - Name of the category
 * @param {string} categoryData.description - Category description
 * @param {File|null} imageFile - Image file to upload
 * @returns {Promise<Object>} Created category data
 */
export const createCategory = async (categoryData, imageFile = null) => {
  console.log('📝 Creating category:', categoryData);
  
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('p_operation', '2');
    formData.append('p_category_name', categoryData.category_name);
    formData.append('p_description', categoryData.description || categoryData.category_name);
    formData.append('p_account_id', '1');
    formData.append('p_module_id', '1');
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    // Make API call with multipart/form-data
    const response = await api.post('/itemCategories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log("✅ Category created:", response.data);
    
    // Return the created category data
    return response.data;
    
  } catch (error) {
    console.error('❌ Category creation failed:', error);
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

export default createCategory;