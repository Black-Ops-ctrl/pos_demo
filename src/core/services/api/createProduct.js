import api from './config';
export const createProduct = async (formData, categories, barcode, imageFile) => {
  console.log("📤 Creating product with data:", formData);
  console.log("Selected category ID from form:", formData.category);
  console.log("📸 Image provided:", imageFile ? imageFile.name : 'No image');
  
  try {
    const selectedCategory = categories.find(c => c.id.toString() === formData.category.toString());
    const categoryId = selectedCategory?.id || parseInt(formData.category);
    console.log("Sending category ID:", categoryId);
    const formDataObj = new FormData();
    formDataObj.append('p_operation', '2');
    formDataObj.append('p_product_name', formData.productName);
    formDataObj.append('p_category', categoryId);
    formDataObj.append('p_quantity', parseInt(formData.quantity));
    formDataObj.append('p_price', parseFloat(formData.price) || 0);
    formDataObj.append('p_bar_code', barcode);
    formDataObj.append('p_description', formData.description || formData.productName);
    formDataObj.append('p_status', "CREATED");
    formDataObj.append('p_product_code', `PROD_${Date.now()}`);
    formDataObj.append('p_account_id', 1);
    formDataObj.append('p_purchase_account_id', 2);
    formDataObj.append('p_sale_account_id', 3);
    formDataObj.append('p_website_chk', "N");
    formDataObj.append('p_created_by', 1);
      if (imageFile) {
      formDataObj.append('image', imageFile);
      const fileExt = imageFile.name.split('.').pop() || 'png';
      formDataObj.append('p_image_ext', fileExt);
      console.log("📸 Image extension:", fileExt);
    } else {
      formDataObj.append('p_image_ext', 'jpg'); 
    }
    
    console.log("📤 Sending FormData with image:", imageFile ? 'Yes' : 'No');
      const response = await api.post('/products', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("✅ API Response:", response.data);
    const imagePath = response.data.saved_image?.publicPath || null;
    
    return { 
      success: true, 
      data: {
        ...response.data,
        product_id: response.data.data?.product_id,
        image_path: imagePath
      },
      message: "Product created successfully!"
    };
    
  } catch (error) {
    console.error("❌ Error details:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to create product"
    };
  }
};