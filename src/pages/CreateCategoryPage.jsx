/* eslint-disable react-hooks/set-state-in-effect */
import DeleteConfirmButton from "../components/common/DeleteConfirmButton";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddProductPage from "../pages/AddProductPage";
import Toast from "../components/common/Toast"; 
import { createCategory, fetchCategories, deleteCategory } from "../core/services/api";
import { fetchProducts } from "../core/services/api"; 
const CreateCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState({
    fetch: false,
    create: false,
    delete: false
  });
  const navigate = useNavigate();

  /* ---------------- FETCH CATEGORIES FROM API ---------------- */
  const loadCategories = async (showLoadingToast = false) => {
    setApiLoading(prev => ({ ...prev, fetch: true }));
    if (showLoadingToast) {
      showToast("Loading categories...", "info");
    }
    try {
      // Fetch both categories and products in parallel
      const [categoriesData, productsData] = await Promise.all([
        fetchCategories(),
        fetchProducts() 
      ]);
      // Ensure productsData is an array before using reduce
      const productsList = Array.isArray(productsData) ? productsData : [];
      // Calculate product count per category for display
      const productCountByCategory = productsList.reduce((acc, product) => {
        const catId = product.category_id;
        if (catId) {
          acc[catId] = (acc[catId] || 0) + 1;
        }
        return acc;
      }, {});
      // Ensure categoriesData is an array before using map
      const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];
      // Transform API data to component-friendly format
      const transformedCategories = categoriesList.map(cat => ({
        id: cat.category_id,
        name: cat.category_name,
        description: cat.description,
        image: null,
        products: productCountByCategory[cat.category_id] || 0, 
        created_date: cat.created_date,
        updated_date: cat.updated_date
      }));
      setCategories(transformedCategories);
    } catch (error) {
      showToast(error.message || "Failed to load categories", "error");
      setCategories([]);
    } finally {
      setApiLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  /* ---------------- LOAD CATEGORIES ON MOUNT ---------------- */
  useEffect(() => {
    loadCategories(true);
  }, []);

  /* ---------------- SHOW TOAST MESSAGE ---------------- */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  /* ---------------- CREATE CATEGORY ---------------- */
  const handleCreate = async () => {
    if (!name.trim()) {
      showToast("Please enter category name", "warning");
      return;
    }
    setApiLoading(prev => ({ ...prev, create: true }));
    setLoading(true);
    try {
      const updatedCategories = await createCategory({
        category_name: name.trim(),
        description: name.trim() 
      });
      // Ensure updatedCategories is an array
      const categoriesList = Array.isArray(updatedCategories) ? updatedCategories : [];
      // Transform the response data
      const transformedCategories = categoriesList.map(cat => ({
        id: cat.category_id,
        name: cat.category_name,
        description: cat.description,
        image: null,
        products: 0,
        created_date: cat.created_date,
        updated_date: cat.updated_date
      }));
      setCategories(transformedCategories);
      showToast(`Category "${name.trim()}" created successfully!`, "success");
      setName("");
      setImage(null);
      setOpen(false);
    } catch (error) {
      showToast(error.message || "Failed to create category", "error");
      setName("");
      setImage(null);
      setOpen(false);
    } finally {
      setApiLoading(prev => ({ ...prev, create: false }));
      setLoading(false);
    }
  };

  /* ---------------- DELETE CATEGORY ---------------- */
  const handleDelete = async (id) => {
    const categoryToDelete = categories.find(c => c.id === id);
    const categoryName = categoryToDelete?.name;
    // Optimistically remove category from UI
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setApiLoading(prev => ({ ...prev, delete: true }));
    try {
      const updatedCategories = await deleteCategory(id);
      // Ensure updatedCategories is an array
      const categoriesList = Array.isArray(updatedCategories) ? updatedCategories : [];
      // Transform the response data
      const transformedCategories = categoriesList.map(cat => ({
        id: cat.category_id,
        name: cat.category_name,
        description: cat.description,
        image: null,
        products: 0,
        created_date: cat.created_date,
        updated_date: cat.updated_date
      }));
      setCategories(transformedCategories);
      showToast(`Category "${categoryName}" deleted successfully!`, "success");
    } catch (error) {
      // Revert optimistic update on error
      setCategories((prev) => [...prev, categoryToDelete]);
      showToast(error.message || "Failed to delete category", "error");
    } finally {
      setApiLoading(prev => ({ ...prev, delete: false }));
    }
  };

  /* ---------------- REFRESH CATEGORIES ---------------- */
  const handleRefresh = () => {
    loadCategories(true);
  };
  
  return (
    <div className="relative">
      {/* Toast Message */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold font-sans">All Categories</h2>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={apiLoading.fetch}
              className="p-1 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
              title="Refresh categories"
            >
              <svg 
                className={`w-5 h-5 ${apiLoading.fetch ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-greyColor font-sans text-sm mt-1">
            Select a category to view its products or add a new product.
          </p>
          {apiLoading.fetch && (
            <p className="text-sm text-purple-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
              Loading categories...
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            disabled={apiLoading.create}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-5 py-2 rounded-full font-poppins disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            <Plus size={16} />
            {apiLoading.create ? 'Creating...' : 'Create Category'}
          </button>
          <button
            onClick={() => setOpenProductModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white px-5 py-2 rounded-full font-poppins hover:shadow-lg transition"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      {/* ================= GRID ================= */}
      {apiLoading.fetch && categories.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-2 text-greyColor">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg font-sans text-greyColor">No categories added.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-lightGreyColor px-4 py-4 rounded-xl shadow flex flex-col items-center border border-purple-500 hover:shadow-lg transition"
            >
              {/* Image */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-32 h-32 object-cover rounded-xl mb-3"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 border border-blackColor mb-3 flex items-center rounded-xl justify-center text-gray-500 font-poppins">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    No Image
                  </div>
                </div>
              )}

              {/* Name */}
              <h3 className="font-sans font-semibold text-lg">{cat.name}</h3>

              {/* Description */}
              {cat.description && cat.description !== cat.name && (
                <p className="text-xs text-gray-400 text-center mt-1">{cat.description}</p>
              )}

              {/* Count */}
              <p className="text-gray-500 text-base mb-4 font-poppins">
                {cat.products} {cat.products === 1 ? 'Product' : 'Products'}
              </p>

              {/* Buttons */}
              <div className="flex justify-center items-center gap-2 w-full">
                {/* View Products Button */}
                <button
                  onClick={() => navigate(`/view-products/${cat.name}`)}
                  disabled={apiLoading.delete}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-400 text-white py-2.5 rounded-full font-poppins text-sm hover:opacity-90 transition shadow-sm disabled:opacity-50"
                >
                  View Products
                </button>
                
                {/* DeleteConfirmButton */}
                <DeleteConfirmButton
                  onConfirm={() => handleDelete(cat.id)}
                  title="Delete Category?"
                  message={`Are you sure you want to delete "${cat.name}"?`}
                  itemName={cat.name}
                  buttonText="Delete"
                  cancelText="Cancel"
                  iconClassName="w-9 h-9" 
                  buttonClassName={`p-2.5 bg-red-500 hover:bg-red-600 rounded-full transition shadow-sm ${
                    apiLoading.delete ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={apiLoading.delete}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl p-6 shadow-xl border border-blackColor">
            <h3 className="text-md font-semibold mb-4 font-sans">
              Create New Category
            </h3>

            {/* Name */}
            <input
              type="text"
              placeholder="Enter category name"
              className="w-full border border-blackColor rounded-lg p-2 mb-4 font-poppins focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={apiLoading.create}
              autoFocus
            />

            {/* Image picker */}
            <label className="block mb-4 cursor-pointer font-poppins">
              <span className="text-sm text-greyColor font-sans">
                Category Image (Optional)
              </span>
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full text-sm"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setImage(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                disabled={apiLoading.create}
              />
            </label>

            {/* Image preview if selected */}
            {image && (
              <div className="mb-4">
                <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setOpen(false);
                  setName("");
                  setImage(null);
                }}
                disabled={apiLoading.create}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg shadow font-poppins hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={apiLoading.create || !name.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-lg shadow border font-poppins disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg transition"
              >
                {apiLoading.create && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {apiLoading.create ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCT MODAL ================= */}
      {openProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl p-6 shadow-xl overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold font-sans">Add New Product</h2>
              <button
                className="text-gray-500 hover:text-gray-700 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                onClick={() => setOpenProductModal(false)}
              >
                ✕
              </button>
            </div>
            <AddProductPage 
              categories={categories}
              onSuccess={() => {
                showToast("Product added successfully!", "success");
                setOpenProductModal(false);
                loadCategories();
              }}
              onClose={() => setOpenProductModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default CreateCategoryPage;