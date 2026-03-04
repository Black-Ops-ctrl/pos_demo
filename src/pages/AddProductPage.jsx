/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef } from "react";
import { createProduct, checkBarcodeExists } from "../core/services/api"; 
import Toast from "../components/common/Toast"; 
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
  const [checkingBarcode, setCheckingBarcode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [barcodeExists, setBarcodeExists] = useState(false); 
  const [existingProductName, setExistingProductName] = useState(""); 
  // Refs for handling barcode scanner input
  const inputBuffer = useRef("");
  const lastTime = useRef(Date.now());
  // Effect to handle barcode scanner input by capturing rapid key presses
  useEffect(() => {
    const handleKeyPress = (e) => {
      const activeElement = document.activeElement;
      // Ignore keypress if user is typing in a form field
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT"
      ) return; 
      // Reset buffer if keys are pressed too slowly (not from scanner)
      const now = Date.now();
      if (now - lastTime.current > 100) {
        inputBuffer.current = "";
      }
      lastTime.current = now;
      // Handle Enter key as end of barcode scan
      if (e.key === "Enter") {
        if (inputBuffer.current.length > 0) {
          setBarcode(inputBuffer.current);
          checkDuplicateBarcode(inputBuffer.current);
        }
        inputBuffer.current = "";
      } else if (e.key.length === 1) { // Accumulate alphanumeric characters from scanner
        if (/[a-zA-Z0-9]/.test(e.key)) {
          inputBuffer.current += e.key;
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);
  // Function to check if barcode already exists in database
  const checkDuplicateBarcode = async (barcodeToCheck) => {
    if (!barcodeToCheck) return;
    setCheckingBarcode(true);
    try {
      const result = await checkBarcodeExists(barcodeToCheck);
      if (result.exists) {
        setBarcodeExists(true);
        setExistingProductName(result.product?.product_name || "another product");
        showToast(`Barcode already exists for product: ${result.product?.product_name}`, "warning");
      } else {
        setBarcodeExists(false);
        setExistingProductName("");
      }
    } catch (error) {
      console.error("Error checking barcode:", error);
    } finally {
      setCheckingBarcode(false);
    }
  };
  // Handler for manual barcode input changes
  const handleBarcodeChange = (e) => {
    const newBarcode = e.target.value;
    setBarcode(newBarcode);
    if (newBarcode) {
      checkDuplicateBarcode(newBarcode);
    } else {
      setBarcodeExists(false);
      setExistingProductName("");
    }
  };
  // Function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };
  // Handler for all form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.productName || !formData.category || !formData.quantity || !barcode) {
      showToast("Please fill all required fields", "warning");
      return;
    }
    // Check if barcode is already taken
    if (barcodeExists) {
      showToast(`Cannot create product. Barcode already used for: ${existingProductName}`, "error");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    // Pass the image file to createProduct
    const result = await createProduct(formData, categories, barcode, image);
    
    if (result.success) {
      showToast(result.message, "success");
      console.log("✅ Product created:", result.data);
      if (result.data.image_path) {
        console.log("🖼️ Image saved at:", result.data.image_path);
      }
      
      // Reset form after successful submission
      setFormData({ productName: "", category: "", quantity: "", price: "" });
      setBarcode("");
      setImage(null);
      setBarcodeExists(false);
      setExistingProductName("");
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      if (onSuccess) onSuccess(result.data);     
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } else {
      showToast(result.message, "error");
    }
    setLoading(false);
  };
  // Reusable input class for consistent styling
  const inputClass = "mt-2 px-4 py-3 border-2 border-gray-200 rounded-md bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-indigo-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-poppins">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="font-bold text-secondary text-lg">Barcode *</label>
          <div className="relative mt-2">
            <input
              type="text"
              value={barcode}
              onChange={handleBarcodeChange}
              placeholder="Scan or enter barcode"
              className={`w-full px-4 py-3 border rounded-md pr-24 ${
                barcodeExists 
                  ? 'border-red-500 bg-red-50' 
                  : barcode && !barcodeExists && !checkingBarcode
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-500'
              }`}
            />
            <div className="absolute right-3 top-0 h-full flex items-center">
              {checkingBarcode && (
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {barcode && !checkingBarcode && (
                <>
                  {barcodeExists ? (
                    <span className="text-red-500 text-sm font-medium">Already exists</span>
                  ) : (
                    <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                      <span>✓</span> Available
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {barcodeExists && (
            <p className="text-red-500 text-xs mt-1">
              This barcode is already used for "{existingProductName}". Please use a different barcode.
            </p>
          )}
        </div>
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
      <div className="text-center">
        <button
          type="submit"
          disabled={loading || checkingBarcode || barcodeExists}
          className={`bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-8 py-3 rounded-md ${
            loading || checkingBarcode || barcodeExists
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'
          }`}
        >
          {loading ? 'Saving...' : checkingBarcode ? 'Checking Barcode...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};
export default AddProductPage;