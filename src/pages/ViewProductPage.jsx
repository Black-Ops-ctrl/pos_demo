import React, { useState, useEffect } from "react";
import editIcon from '../assets/png/ic_edit_button.png';
import { fetchProducts, deleteProduct, updateProduct } from "../core/services/api";
import Toast from "../components/common/Toast";
import DeleteConfirmButton from "../components/common/DeleteConfirmButton";

const ViewProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null); 

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: 'single', 
    productId: null,
    productName: '',
    count: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await fetchProducts(); 
      
      if (result?.success) {
        const productsList = result.data?.data || result.data || [];
        console.log("Raw API Data:", productsList);
        
        const transformedProducts = productsList.map((item) => ({
          id: item?.product_id,
          name: item?.product_name || "Unknown Product",
          category: item?.category || "Uncategorized",
          barcode: item?.bar_code || "N/A",
          status: getStockStatus(parseInt(item?.quantity) || 0),
          quantity: parseInt(item?.quantity) || 0,
          reorder: 100,
          price: parseFloat(item?.price) || 0,
          image: "https://via.placeholder.com/150",
          description: item?.description || "",
          productCode: item?.product_code,
          apiStatus: item?.status,
        }));
        
        setProducts(transformedProducts);
        setSelectedProducts([]);
        setSelectAll(false);
      } else {
        setError(result?.message || "Failed to load products");
      }
    } catch (err) {
      setError("An error occurred while loading products");
      console.error(err);
    }
    
    setLoading(false);
  };

  const refreshProducts = async () => {
    await loadProducts();
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return "Stock Out";
    if (quantity < 5) return "Low Stock";
    return "In Stock";
  };

  const limitWords = (str, limit) => {
    if (!str) return "";
    if (str.length <= limit) return str;
    return str.slice(0, limit) + "...";
  };

  const displayedProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    if (displayedProducts.length > 0) {
      setSelectAll(selectedProducts.length === displayedProducts.length);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, displayedProducts]);

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

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      showToast("Please select products to delete", "warning");
      return;
    }

    setDeleteLoading(true);
    
    let successCount = 0;
    let failCount = 0;

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

  const handleCheckboxChange = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(displayedProducts.map(p => p.id));
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct({ ...product });
    setOriginalProduct({ ...product }); 
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prevProduct) => ({
          ...prevProduct,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = async () => {
    if (!selectedProduct || !originalProduct) return;
    
    setDeleteLoading(true);
    const updateData = {};
    
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
    
    if (selectedProduct.category !== originalProduct.category) {
      updateData.category = selectedProduct.category;
    }
    
    if (Object.keys(updateData).length === 0) {
      showToast("No changes to save", "warning");
      setModalOpen(false);
      setSelectedProduct(null);
      setOriginalProduct(null);
      setDeleteLoading(false);
      return;
    }

    console.log("Updating only changed fields:", updateData);
    
    try {
      const result = await updateProduct(selectedProduct.id, updateData);
      
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
      showToast("Failed to update product", "error");
    }
    
    setDeleteLoading(false);
  };

  const handleCancelClick = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setOriginalProduct(null);
  };

  const totalStockValue = displayedProducts.reduce(
    (sum, p) => sum + (p.price * p.quantity),
    0
  );
  const totalProducts = displayedProducts.length;
  const lowStockCount = displayedProducts.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = displayedProducts.filter((p) => p.status === "Stock Out").length;

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

  if (error) {
    return (
      <div className="p-6 bg-lightGreyColor font-sans">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading products: {error}
        </div>
        <button 
          onClick={loadProducts}
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

      {/* Summary Cards */}
      <div className="flex gap-6 font-poppins mb-6">
        <div className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-400 p-4 rounded-xl border shadow-md flex flex-col">
          <span className="text-primary font-sans text-lg font-semibold mb-1">
            Total Stock Value
          </span>
          <span className="text-lg font-semibold font-sans">
            Rs{" "}
            {totalStockValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
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
            Low Stock Products
          </span>
          <span className="text-lg font-semibold font-sans">{lowStockCount}</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-200 p-4 rounded-xl border shadow-md flex flex-col">
          <span className="text-primary font-sans text-lg mb-1 font-semibold">
            Out of Stock Products
          </span>
          <span className="text-lg font-semibold font-sans">{outOfStockCount}</span>
        </div>
      </div>

      {/* Filters and Delete Selected */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search Products..."
            className="rounded-full px-2 py-2 w-64 sm:w-72 md:w-80 lg:w-96 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Bulk Delete Button - Using DeleteConfirmButton */}
          {selectedProducts.length > 0 && (
            <DeleteConfirmButton
              onConfirm={handleBulkDelete}
              title="Delete Multiple Products?"
              message={`Are you sure you want to delete ${selectedProducts.length} selected product(s)?`}
              buttonText="Delete All"
              cancelText="Cancel"
              icon={
                <div className="flex items-center gap-2">
                  <img src={deleteIcon} alt="Delete" className="w-5 h-5 filter brightness-0 invert" />
                  <span>Delete Selected ({selectedProducts.length})</span>
                </div>
              }
              buttonClassName="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition shadow-md"
            />
          )}

          {/* Status Filter */}
          <select
            className="border shadow rounded-full px-3 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-400 text-primary font-poppins focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {["All Status", "In Stock", "Low Stock", "Stock Out"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
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
            {displayedProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              displayedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-lightGreyColor transition">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      className="rounded w-4 h-4"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleCheckboxChange(product.id)}
                    />
                  </td>
                  <td className="p-3 flex flex-col items-center gap-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover border shadow rounded-md"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                    <span className="text-sm">{limitWords(product.name, 16)}</span>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{product.barcode}</td>
                  <td className="p-3">
                    <span
                      className={`px-4 py-2 rounded-full text-md font-light-bold ${
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
                  <td className="p-3">{product.quantity} pcs</td>
                  <td className="p-3">Rs {product.price.toFixed(2)}</td>
                  <td className="p-3">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="gap-6"
                        disabled={deleteLoading}
                        title="Edit Product"
                      >
                        <img
                          src={editIcon}
                          alt="Edit"
                          className="w-7 h-7 object-cover"
                        />
                      </button>
                      
                      <DeleteConfirmButton
                        onConfirm={() => handleSingleDelete(product.id)}
                        title="Delete Product?"
                        message="Are you sure you want to delete this product?"
                        itemName={product.name}
                        iconClassName="w-7 h-7" 
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

              {/* Quantity */}
              <div>
                <label className="block text-secondary mb-1 font-medium">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={selectedProduct.quantity}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
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
                {selectedProduct.image && (
                  <img 
                    src={selectedProduct.image} 
                    alt="Preview" 
                    className="mt-2 w-20 h-20 object-cover rounded border"
                  />
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
    </div>
  );
};

export default ViewProduct;