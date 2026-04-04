/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createProduct, checkBarcodeExists } from "../core/services/api";
import { getUOM } from "../api/departmentApi"; 
import Toast from "../components/common/Toast";

const AddProductPage = ({ categories = [], onSuccess, onClose }) => {
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState(null);
  const [uomList, setUomList] = useState([]); 
  const [loadingUOM, setLoadingUOM] = useState(false);
  const [alwaysLowStock, setAlwaysLowStock] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    uom_id: "",
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
  const barcodeInputRef = useRef(null);
  const checkTimeoutRef = useRef(null);
  const lastCheckedBarcode = useRef("");
  
  // Fetch UOM list on component mount
  useEffect(() => {
    fetchUOMList();
  }, []);

  const fetchUOMList = async () => {
    setLoadingUOM(true);
    try {
      const response = await getUOM();
      console.log("UOM List Response:", response);
      
      if (response && response.data) {
        setUomList(response.data);
      } else if (Array.isArray(response)) {
        setUomList(response);
      } else {
        console.error("Unexpected UOM response format:", response);
        setUomList([]);
      }
    } catch (error) {
      console.error("Error fetching UOM list:", error);
      showToast("Failed to load UOM list", "error");
      setUomList([]);
    } finally {
      setLoadingUOM(false);
    }
  };
  
  // Function to check if barcode already exists
  const checkDuplicateBarcode = useCallback(async (barcodeToCheck) => {
    // Don't check empty barcodes
    if (!barcodeToCheck || barcodeToCheck.trim() === "") {
      setBarcodeExists(false);
      setExistingProductName("");
      return;
    }
    
    // Don't check the same barcode multiple times in a row
    if (lastCheckedBarcode.current === barcodeToCheck) {
      console.log(`⏭️ Skipping duplicate check for: ${barcodeToCheck} (already checked)`);
      return;
    }
    
    setCheckingBarcode(true);
    try {
      console.log(`🔍 Checking barcode: ${barcodeToCheck}`);
      const result = await checkBarcodeExists(barcodeToCheck);
      console.log(`Barcode check result:`, result);
      
      if (result.exists) {
        setBarcodeExists(true);
        setExistingProductName(result.product?.product_name || "another product");
        showToast(`Barcode already exists for product: ${result.product?.product_name}`, "warning");
      } else {
        setBarcodeExists(false);
        setExistingProductName("");
      }
      
      lastCheckedBarcode.current = barcodeToCheck;
    } catch (error) {
      console.error("Error checking barcode:", error);
      setBarcodeExists(false);
      setExistingProductName("");
    } finally {
      setCheckingBarcode(false);
    }
  }, []);

  // Debounced barcode check for manual typing
  const debouncedCheckBarcode = useCallback((barcodeToCheck) => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    // Only check if barcode has at least 1 character
    if (barcodeToCheck && barcodeToCheck.trim().length > 0) {
      checkTimeoutRef.current = setTimeout(() => {
        checkDuplicateBarcode(barcodeToCheck);
      }, 500);
    } else {
      setBarcodeExists(false);
      setExistingProductName("");
    }
  }, [checkDuplicateBarcode]);
  
  // Handle barcode scanner input - IMPROVED VERSION
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isBarcodeInputFocused = activeElement === barcodeInputRef.current;
      
      // Always capture Enter key for barcode completion
      if (e.key === "Enter") {
        // If barcode input is focused, use its value
        if (isBarcodeInputFocused && barcodeInputRef.current) {
          e.preventDefault();
          const currentBarcode = barcodeInputRef.current.value;
          if (currentBarcode && currentBarcode.trim().length > 0) {
            console.log(`📦 Scanner completed (focused input): ${currentBarcode}`);
            checkDuplicateBarcode(currentBarcode);
          }
          inputBuffer.current = "";
          return;
        }
        
        // If no input focused, use the buffer from scanner
        if (inputBuffer.current.length > 0) {
          e.preventDefault();
          const scannedBarcode = inputBuffer.current;
          console.log(`📦 Scanner detected (no focus): ${scannedBarcode}`);
          setBarcode(scannedBarcode);
          checkDuplicateBarcode(scannedBarcode);
          inputBuffer.current = "";
          return;
        }
      }
      
      // Accumulate scanner input when no input is focused
      if (!isBarcodeInputFocused && e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        const now = Date.now();
        if (now - lastTime.current > 100) {
          inputBuffer.current = "";
        }
        lastTime.current = now;
        inputBuffer.current += e.key;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checkDuplicateBarcode]);
  
  // Handler for manual barcode input changes
  const handleBarcodeChange = (e) => {
    const newBarcode = e.target.value;
    setBarcode(newBarcode);
    
    // Clear previous check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    // Reset barcode exists status while typing
    setBarcodeExists(false);
    setExistingProductName("");
    lastCheckedBarcode.current = "";
    
    // Debounced check for manual typing
    if (newBarcode && newBarcode.trim().length > 0) {
      checkTimeoutRef.current = setTimeout(() => {
        checkDuplicateBarcode(newBarcode);
      }, 600); // Longer delay for manual typing
    }
  };
  
  // Handle Enter key on barcode input
  const handleBarcodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentBarcode = e.target.value;
      if (currentBarcode && currentBarcode.trim().length > 0) {
        console.log(`📦 Enter pressed - checking: ${currentBarcode}`);
        // Clear any pending timeout
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        checkDuplicateBarcode(currentBarcode);
      }
    }
  };
  
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName?.trim()) {
      showToast("Please enter product name", "warning");
      return;
    }
    
    if (!formData.category) {
      showToast("Please select a category", "warning");
      return;
    }

    if (!formData.uom_id) {
      showToast("Please select a unit of measurement", "warning");
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast("Please enter a valid price", "warning");
      return;
    }
    
    if (!barcode?.trim()) {
      showToast("Please scan or enter barcode", "warning");
      return;
    }
    
    // FINAL CHECK before submitting
    if (barcodeExists) {
      showToast(`Cannot create product. Barcode already used for: ${existingProductName}`, "error");
      return;
    }
    
    // Double-check barcode existence one more time before submitting
    setLoading(true);
    setCheckingBarcode(true);
    
    try {
      const finalCheck = await checkBarcodeExists(barcode);
      if (finalCheck.exists) {
        showToast(`Barcode already exists for product: ${finalCheck.product?.product_name}`, "error");
        setBarcodeExists(true);
        setExistingProductName(finalCheck.product?.product_name);
        setLoading(false);
        setCheckingBarcode(false);
        return;
      }
      
      // Proceed with product creation
      const lowStockQty = alwaysLowStock ? 999999 : 5;
      const result = await createProduct(formData, categories, barcode, image, formData.uom_id, lowStockQty);
      
      if (result.success) {
        showToast(result.message, "success");
        console.log("✅ Product created:", result.data);
        
        // Reset form
        setFormData({ productName: "", category: "", uom_id: "", price: "" });
        setBarcode("");
        setImage(null);
        setBarcodeExists(false);
        setExistingProductName("");
        setAlwaysLowStock(false);
        lastCheckedBarcode.current = "";
        
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        if (onSuccess) onSuccess(result.data);     
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      showToast("Error creating product", "error");
    } finally {
      setLoading(false);
      setCheckingBarcode(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);
  
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
              ref={barcodeInputRef}
              type="text"
              value={barcode}
              onChange={handleBarcodeChange}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Scan or enter barcode"
              className={`w-full px-4 py-3 border rounded-md pr-28 ${
                barcodeExists 
                  ? 'border-red-500 bg-red-50' 
                  : barcode && !barcodeExists && !checkingBarcode && barcode.trim().length > 0
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-500'
              }`}
            />
            <div className="absolute right-3 top-0 h-full flex items-center">
              {checkingBarcode && (
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {barcode && !checkingBarcode && barcode.trim().length > 0 && (
                <>
                  {barcodeExists ? (
                    <span className="text-red-500 text-xs font-medium">Already exists</span>
                  ) : (
                    <span className="text-green-500 text-xs font-medium flex items-center gap-1">
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
          <div className="flex items-center justify-between">
            <label className="font-bold text-secondary text-lg">Product Name *</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alwaysLowStock}
                onChange={(e) => setAlwaysLowStock(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Marked as low stock product</span>
            </label>
          </div>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            placeholder="Enter Product Name"
            className={inputClass}
          />
          {alwaysLowStock && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ This product will always show as "Low Stock" regardless of purchase quantity
            </p>
          )}
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
              <option key={category.category_id || category.id} value={category.category_id || category.id}>
                {category.category_name || category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Unit of Measurement (UOM) *</label>
          <select
            name="uom_id"
            value={formData.uom_id}
            onChange={handleInputChange}
            className={`${inputClass} ${loadingUOM ? 'opacity-50' : ''}`}
            disabled={loadingUOM}
          >
            <option value="">
              {loadingUOM ? 'Loading UOM...' : 'Select UOM'}
            </option>
            {uomList.map((uom) => (
              <option 
                key={uom.uom_id || uom.id} 
                value={uom.uom_id || uom.id}
              >
                {uom.uom_name || uom.name}
              </option>
            ))}
          </select>
          {loadingUOM && (
            <p className="text-xs text-gray-500 mt-1">Fetching UOM list...</p>
          )}
          {uomList.length === 0 && !loadingUOM && (
            <p className="text-xs text-red-500 mt-1">No UOM available. Please contact admin.</p>
          )}
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
          disabled={loading || checkingBarcode || barcodeExists || loadingUOM}
          className={`bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-8 py-3 rounded-md ${
            loading || checkingBarcode || barcodeExists || loadingUOM
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'
          }`}
        >
          {loading ? 'Saving...' : checkingBarcode ? 'Checking Barcode...' : loadingUOM ? 'Loading UOM...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default AddProductPage;