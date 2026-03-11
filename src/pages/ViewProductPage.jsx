/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import editIcon from '../assets/png/ic_edit_button.png';
import { fetchProducts, deleteProduct, updateProduct, fetchCategories } from "../core/services/api"; 
import Toast from "../components/common/Toast";
import DeleteConfirmButton from "../components/common/DeleteConfirmButton";
import { Plus } from "lucide-react";
import AddProductPage from "../pages/AddProductPage";

const ViewProductsByCategory = () => {
  // Get category name from URL parameters and initialize navigation
  const { categoryName } = useParams();
  const navigate = useNavigate();
  
  // State management for products and filtering
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Selection state for bulk operations
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null); 
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [openProductModal, setOpenProductModal] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: 'single', 
    productId: null,
    productName: '',
    count: 0
  });

  // Decode the category name from URL
  const decodedCategoryName = decodeURIComponent(categoryName);
  
  // Load products and categories when component mounts or category changes
  useEffect(() => {
    loadProductsAndCategories();
  }, [categoryName]);
  
  // Function to fetch products and categories from API
  const loadProductsAndCategories = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch both products and categories in parallel
      const [productsResult, categoriesResult] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      
      console.log("Products Result:", productsResult);
      console.log("Categories Result:", categoriesResult);
      
      // Handle products data - extract from various response formats
      let productsList = [];
      if (productsResult?.success && productsResult.data) {
        productsList = productsResult.data.data || productsResult.data;
      } else if (Array.isArray(productsResult)) {
        productsList = productsResult;
      }
      
      // Handle categories data - extract from various response formats
      let categoriesList = [];
      if (Array.isArray(categoriesResult)) {
        categoriesList = categoriesResult;
      } else if (categoriesResult?.data) {
        categoriesList = categoriesResult.data;
      }
      
      setCategories(categoriesList);
      console.log("Processed categories:", categoriesList);
      
      // Find the current category ID by matching name
      const currentCategory = categoriesList.find(
        cat => cat.category_name?.toLowerCase() === decodedCategoryName.toLowerCase()
      );
      
      console.log("Current category from URL:", decodedCategoryName);
      console.log("Found category:", currentCategory);
      
      // Transform products with category names and images for display
      const transformedProducts = productsList.map((item) => {
        // Find category name from categories list
        const productCategory = categoriesList.find(
          cat => cat.category_id === item.category_id
        );
        
        // Get image URL from the API response
        const imageUrl = item.image_url || `http://84.16.235.111:2140/uploads/products/prod_${item.product_id}.png`;
        
        return {
          id: item?.product_id,
          name: item?.product_name || "Unknown Product",
          category_id: item?.category_id,
          category_name: productCategory?.category_name || item?.category_name || "Uncategorized",
          barcode: item?.bar_code || "N/A",
          status: getStockStatus(parseInt(item?.quantity) || 0),
          quantity: parseInt(item?.quantity) || 0,
          price: parseFloat(item?.price) || 0,
          image: imageUrl,
          image_ext: item?.image_ext,
          description: item?.description || "",
          productCode: item?.product_code,
        };
      });
      
      setProducts(transformedProducts);
      console.log("Transformed products:", transformedProducts);
      
      // Filter products by current category using category_id
      let filtered = [];
      if (currentCategory) {
        filtered = transformedProducts.filter(
          product => product.category_id === currentCategory.category_id
        );
      } else {
        // Fallback to name matching if category not found
        filtered = transformedProducts.filter(
          product => product.category_name.toLowerCase() === decodedCategoryName.toLowerCase()
        );
      }
      
      console.log("Filtered products:", filtered);
      setFilteredProducts(filtered);
      setSelectedProducts([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("An error occurred while loading products");
    }
    setLoading(false);
  };
  
  // Refresh products data
  const refreshProducts = async () => {
    await loadProductsAndCategories();
  };
  
  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };
  
  // Determine stock status based on quantity
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return "Stock Out";
    if (quantity < 5) return "Low Stock";
    return "In Stock";
  };
  
  // Apply search and status filters to displayed products
  const displayedProducts = filteredProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });
  
  // Update select all checkbox state based on selections
  useEffect(() => {
    if (displayedProducts.length > 0) {
      setSelectAll(selectedProducts.length === displayedProducts.length);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, displayedProducts]);
  
  // Handle single product deletion
  const handleSingleDelete = async (productId) => {
    setDeleteLoading(true);
    try {
      const result = await deleteProduct(productId);
      if (result?.success) {
        showToast("Product deleted successfully!", "success");
        await refreshProducts();
      } else {
        showToast(`Failed to delete product: ${result?.message}`, "error");
      }
    } catch (err) {
      showToast("Failed to delete product", "error");
    }
    setDeleteLoading(false);
  };
  
  // Handle bulk deletion of selected products
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      showToast("Please select products to delete", "warning");
      return;
    }
    setDeleteLoading(true);
    let successCount = 0;
    let failCount = 0;
    
    // Delete each selected product sequentially
    for (const productId of selectedProducts) {
      try {
        const result = await deleteProduct(productId);
        if (result?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }
    
    if (successCount > 0) {
      showToast(`${successCount} product(s) deleted successfully!`, "success");
      await refreshProducts();
    }
    if (failCount > 0) {
      showToast(`Failed to delete ${failCount} product(s)`, "error");
    }
    setSelectedProducts([]);
    setSelectAll(false);
    setDeleteLoading(false);
    setDeleteDialog({ ...deleteDialog, isOpen: false });
  };
  
  // Handle individual checkbox selection
  const handleCheckboxChange = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  
  // Handle select all checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(displayedProducts.map(p => p.id));
    }
  };
  
  // Open edit modal with selected product data
  const handleEditClick = (product) => {
    setSelectedProduct({ ...product });
    setOriginalProduct({ ...product }); 
    setModalOpen(true);
  };
  
  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };
  
  // Handle image file selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prevProduct) => ({
          ...prevProduct,
          newImage: reader.result, // For preview
          imageFile: file, // Store actual file for upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Save edited product changes
  const handleSaveClick = async () => {
    if (!selectedProduct || !originalProduct) return;
    setDeleteLoading(true);
    const updateData = {};
    
    // Compare and track only changed fields
    if (selectedProduct.name !== originalProduct.name) {
      updateData.productName = selectedProduct.name;
    }
    if (selectedProduct.price !== originalProduct.price) {
      updateData.price = selectedProduct.price;
    }
    if (selectedProduct.quantity !== originalProduct.quantity) {
      updateData.quantity = selectedProduct.quantity;
    }
    if (selectedProduct.barcode !== originalProduct.barcode) {
      updateData.barcode = selectedProduct.barcode;
    }
    
    // Check if any changes were made (including image)
    const hasChanges = Object.keys(updateData).length > 0 || selectedProduct.imageFile;
    
    if (!hasChanges) {
      showToast("No changes to save", "warning");
      setModalOpen(false);
      setSelectedProduct(null);
      setOriginalProduct(null);
      setDeleteLoading(false);
      return;
    }
    
    console.log("Updating fields:", updateData);
    console.log("New image:", selectedProduct.imageFile ? selectedProduct.imageFile.name : 'No new image');
    
    try {
      // Pass both updateData and image file to updateProduct
      const result = await updateProduct(
        selectedProduct.id, 
        updateData, 
        selectedProduct.imageFile // Pass the image file if selected
      );
      
      if (result?.success) {
        showToast("Product updated successfully!", "success");
        await refreshProducts();
        setModalOpen(false);
        setSelectedProduct(null);
        setOriginalProduct(null);
      } else {
        showToast(`Failed to update product: ${result?.message}`, "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("Failed to update product", "error");
    }
    setDeleteLoading(false);
  };
  
  // Cancel edit and close modal
  const handleCancelClick = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setOriginalProduct(null);
  };
  
  // Navigate back to previous page
  const handleBackToCategories = () => {
    navigate(-1);
  };
  
  // Calculate summary statistics
  const totalStockValue = displayedProducts.reduce(
    (sum, p) => sum + (p.price * p.quantity),
    0
  );
  const totalProducts = displayedProducts.length;
  const lowStockCount = displayedProducts.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = displayedProducts.filter((p) => p.status === "Stock Out").length;
  
  // Loading state UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }
  
  // Error state UI
  if (error) {
    return (
      <div className="p-6 bg-lightGreyColor font-sans">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading products: {error}
        </div>
        <button 
          onClick={loadProductsAndCategories}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-lightGreyColor font-sans">
      {/* Toast Message */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back 
          </button>
          <h1 className="text-lg font-semibold font-helvetica">
            Products in "{decodedCategoryName}"
          </h1>
        </div>
      </div>

      {/* Summary Cards - Only show if products exist */}
      {displayedProducts.length > 0 && (
        <div className="flex gap-6 font-poppins mb-6">
          <div className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-400 p-4 rounded-xl border shadow-md flex flex-col">
            <span className="text-primary font-sans text-lg font-semibold mb-1">
              Total Stock Value
            </span>
            <span className="text-lg font-semibold font-sans">
              Rs {totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-pink-500 to-red-300 p-4 rounded-xl border shadow-md flex flex-col">
            <span className="text-primary font-sans text-lg mb-1 font-semibold">
              Total Products
            </span>
            <span className="text-lg font-semibold font-sans">{totalProducts}</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-amber-500 to-orange-300 p-4 rounded-xl border shadow-md flex flex-col">
            <span className="text-primary font-sans text-lg mb-1 font-semibold">
              Low Stock
            </span>
            <span className="text-lg font-semibold font-sans">{lowStockCount}</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-200 p-4 rounded-xl border shadow-md flex flex-col">
            <span className="text-primary font-sans text-lg mb-1 font-semibold">
              Out of Stock
            </span>
            <span className="text-lg font-semibold font-sans">{outOfStockCount}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="search"
          placeholder="Search Products..."
          className="rounded-full px-4 py-2 w-96 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          {/* Add Product Button */}
          <button
            onClick={() => setOpenProductModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
          >
            <Plus size={16} />
            Add Product
          </button>
          
          {/* Delete Selected Button */}
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleteLoading}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition shadow-md whitespace-nowrap"
            >
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          
          <select
            className="border shadow rounded-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {["All Status", "In Stock", "Low Stock", "Stock Out"].map((status) => (
              <option key={status} value={status} className="bg-white text-black">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No Products Message */}
      {!loading && displayedProducts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 text-xl mb-2">No products found</p>
          <p className="text-gray-400 mb-6">This category doesn't have any products yet.</p>
        </div>
      )}

      {/* Products Table */}
      {displayedProducts.length > 0 && (
        <div className="overflow-auto rounded-xl shadow border bg-white">
          <table className="w-full text-center text-md font-poppins">
            <thead className="bg-gray-300 border-b">
              <tr>
                <th className="p-3">
                  <input 
                    type="checkbox" 
                    className="rounded w-4 h-4"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Price</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-lightGreyColor transition">
                  <td className="p-3 align-middle">
                    <input 
                      type="checkbox" 
                      className="rounded w-4 h-4"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleCheckboxChange(product.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover border shadow rounded-md flex-shrink-0"
                        onError={(e) => {
                          console.log('Image failed to load:', product.image);
                          e.target.src = "https://placehold.co/150x150/6b7280/white?text=No+Image";
                        }}
                      />
                      <span className="text-sm text-left break-words max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 align-middle">{product.category_name}</td>
                  <td className="p-3 align-middle">{product.barcode}</td>
                  <td className="p-3 align-middle">
                    <span
                      className={`px-3 py-1 rounded-full text-sm inline-block ${
                        product.status === "In Stock"
                          ? "bg-green-100 text-green-700"
                          : product.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-3 align-middle">{product.quantity} pcs</td>
                  <td className="p-3 align-middle">Rs {product.price.toFixed(2)}</td>
                  <td className="p-3 align-middle">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => handleEditClick(product)} title="Edit Product">
                        <img src={editIcon} alt="Edit" className="w-6 h-6" />
                      </button>
                      <DeleteConfirmButton
                        onConfirm={() => handleSingleDelete(product.id)}
                        title="Delete Product?"
                        message="Are you sure you want to delete this product?"
                        itemName={product.name}
                        iconClassName="w-6 h-6"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Product Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-primary p-8 rounded-xl shadow-xl w-96 max-w-full">
            <h2 className="text-xl font-semibold text-secondary font-poppins mb-4 text-start">
              Edit Product
            </h2>
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-secondary mb-1 font-medium">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={selectedProduct.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-secondary mb-1 font-medium">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={selectedProduct.barcode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-secondary mb-1 font-medium">Price (Rs)</label>
                <input
                  type="number"
                  name="price"
                  value={selectedProduct.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-secondary mb-1 font-medium">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
                />
                
                {/* Show current image */}
                {selectedProduct.image && !selectedProduct.newImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/150x150/6b7280/white?text=No+Image";
                      }}
                    />
                  </div>
                )}
                
                {/* Show new image preview if selected */}
                {selectedProduct.newImage && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-1">New Image Preview:</p>
                    <img 
                      src={selectedProduct.newImage} 
                      alt="New preview" 
                      className="w-20 h-20 object-cover rounded border border-green-500"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg shadow font-poppins hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={deleteLoading}
                  className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-lg shadow border font-poppins hover:opacity-90 transition ${
                    deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deleteLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal - Add New Product */}
      {openProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl overflow-auto max-h-[90vh] border border-gray-300">
            {/* Modal Header with Border */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500 to-indigo-400 p-4 border-b border-purple-600 rounded-t-xl">
              <div className="flex justify-center items-center">
                <h2 className="text-lg font-medium text-white font-sans">Add New Product</h2>
              </div>
            </div>
            
            {/* Content Area with Border */}
            <div className="p-6 border-x border-gray-200 bg-white">
              <AddProductPage 
                categories={categories}
                onSuccess={() => {
                  showToast("Product added successfully!", "success");
                  setOpenProductModal(false);
                  loadProductsAndCategories(); // Refresh the products list
                }}
                onClose={() => setOpenProductModal(false)}
              />
            </div>
            
            {/* Optional Footer with Border */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end rounded-b-xl">
              <button
                onClick={() => setOpenProductModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow font-poppins hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProductsByCategory;