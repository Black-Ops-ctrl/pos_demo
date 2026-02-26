/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef } from "react";
import { createProduct } from "../core/services/api/createProduct";
import Toast from "../components/common/Toast"; // Import Toast component

const AddProductPage = ({ categories = [], onSuccess, onClose }) => {
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    quantity: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // Toast state

  const inputBuffer = useRef("");
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyPress = (e) => {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT"
      ) return; 

      const now = Date.now();
      if (now - lastTime.current > 100) {
        inputBuffer.current = "";
      }
      lastTime.current = now;

      if (e.key !== "Enter") {
        inputBuffer.current += e.key;
      } else {
        if (inputBuffer.current.length > 0) {
          setBarcode(inputBuffer.current);
        }
        inputBuffer.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  /* ---------------- SHOW TOAST MESSAGE ---------------- */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.category || !formData.quantity || !barcode) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    const result = await createProduct(formData, categories, barcode);

    if (result.success) {
      showToast(result.message, "success");
      setFormData({ productName: "", category: "", quantity: "", price: "" });
      setBarcode("");
      setImage(null);
      
      if (onSuccess) onSuccess(result.data);     
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } else {
      showToast(result.message, "error");
    }

    setLoading(false);
  };

  const inputClass = "mt-2 px-4 py-3 border-2 border-gray-200 rounded-md bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-indigo-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-poppins">
      {/* Toast Message */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Barcode */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary text-lg">Barcode *</label>
          <input
            type="text"
            value={barcode}
            placeholder="Scan the barcode"
            readOnly
            className="mt-2 px-4 py-3 border border-gray-500 rounded-md bg-gradient-to-r from-purple-500 to-indigo-300 text-primary placeholder-white"
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Product Name *</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            placeholder="Enter Product Name"
            className={inputClass}
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter Quantity"
            className={inputClass}
          />
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter Price"
            className={inputClass}
          />
        </div>

        {/* Category - Dynamic */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Image */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Product Image</label>
          <input
            type="file"
            accept="image/*"
            className={inputClass}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className={`bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-8 py-3 rounded-md ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default AddProductPage;