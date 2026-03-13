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
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    uom: "", 
    // quantity: "",
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
  const isManualTrigger = useRef(false); 
  
  // Fetch UOM list on component mount
  useEffect(() => {
    fetchUOMList();
  }, []);

  // Function to fetch UOM from API
  const fetchUOMList = async () => {
    setLoadingUOM(true);
    try {
      const response = await getUOM();
      console.log("UOM List Response:", response);
      
      // Handle different response structures
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
  
  // Function to check if barcode already exists in database
  const checkDuplicateBarcode = useCallback(async (barcodeToCheck, manualTrigger = false) => {
    // Don't check empty barcodes
    if (!barcodeToCheck || barcodeToCheck.length < 3) return;
    
    // Don't check the same barcode multiple times UNLESS it's a manual trigger (Enter key)
    if (!manualTrigger && lastCheckedBarcode.current === barcodeToCheck) {
      console.log(`⏭️ Skipping duplicate check for: ${barcodeToCheck} (not manual)`);
      return;
    }
    
    setCheckingBarcode(true);
    try {
      console.log(`🔍 Checking complete barcode: ${barcodeToCheck} ${manualTrigger ? '(manual)' : '(auto)'}`);
      const result = await checkBarcodeExists(barcodeToCheck);
      console.log(`Barcode check result for ${barcodeToCheck}:`, result.exists ? 'EXISTS' : 'AVAILABLE');
      
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
    } finally {
      setCheckingBarcode(false);
    }
  }, []);

  // Debounced barcode check (auto mode)
  const debouncedCheckBarcode = useCallback((barcodeToCheck) => {
    // Clear any pending check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    // Set a new timeout to check after typing stops
    checkTimeoutRef.current = setTimeout(() => {
      checkDuplicateBarcode(barcodeToCheck, false); // false = not manual
    }, 500); // Wait 500ms after last keystroke before checking
  }, [checkDuplicateBarcode]);
  
  // Effect to handle barcode scanner input by capturing rapid key presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isBarcodeInputFocused = activeElement === barcodeInputRef.current;
      
      // If any input is focused (including barcode field), we still want to detect Enter key
      // to know when a barcode scan is complete
      if (activeElement.tagName === "INPUT" || 
          activeElement.tagName === "TEXTAREA" || 
          activeElement.tagName === "SELECT") {
        
        // Special handling for barcode input - detect Enter key for scanner completion
        if (isBarcodeInputFocused && e.key === "Enter") {
          e.preventDefault(); // Prevent form submission
          e.stopPropagation(); // Stop event from bubbling to other handlers
          
          const currentBarcode = barcodeInputRef.current.value;
          if (currentBarcode && currentBarcode.length > 0) {
            console.log(`📦 Scanner completed barcode (focused): ${currentBarcode}`);
            checkDuplicateBarcode(currentBarcode, true); // true = manual trigger
          }
        }
        
        // Reset scanner buffer when user types in any input
        inputBuffer.current = "";
        return;
      }
      
      // This section is for when NO input field is focused
      // This is the typical scanner mode
      
      // Reset buffer if keys are pressed too slowly (not from scanner)
      const now = Date.now();
      if (now - lastTime.current > 100) {
        inputBuffer.current = "";
      }
      lastTime.current = now;
      
      // Handle Enter key as end of barcode scan
      if (e.key === "Enter") {
        if (inputBuffer.current.length > 0) {
          const scannedBarcode = inputBuffer.current;
          console.log(`📦 Scanner detected barcode (no focus): ${scannedBarcode}`);
          setBarcode(scannedBarcode);
          checkDuplicateBarcode(scannedBarcode, true); // true = manual trigger
        }
        inputBuffer.current = "";
        e.preventDefault(); // Prevent form submission on Enter
      } else if (e.key.length === 1) { // Accumulate alphanumeric characters from scanner
        if (/[a-zA-Z0-9]/.test(e.key)) {
          inputBuffer.current += e.key;
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checkDuplicateBarcode]);
  
  // Handler for manual barcode input changes
  const handleBarcodeChange = (e) => {
    const newBarcode = e.target.value;
    setBarcode(newBarcode);
    
    // Debounce the check for manual typing (auto mode)
    if (newBarcode && newBarcode.length >= 3) {
      debouncedCheckBarcode(newBarcode);
    } else {
      setBarcodeExists(false);
      setExistingProductName("");
      // Clear any pending timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    }
  };
  
  // Handle key press specifically on the barcode input
  const handleBarcodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      e.stopPropagation(); // Stop event from bubbling to other handlers
      
      const currentBarcode = e.target.value;
      if (currentBarcode && currentBarcode.length > 0) {
        console.log(`📦 Enter pressed in barcode field: ${currentBarcode}`);
        checkDuplicateBarcode(currentBarcode, true); // true = manual trigger
      }
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
    if (!formData.productName?.trim()) {
      showToast("Please enter product name", "warning");
      return;
    }
    
    if (!formData.category) {
      showToast("Please select a category", "warning");
      return;
    }

    if (!formData.uom) {
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
    
    // Check if barcode is already taken
    if (barcodeExists) {
      showToast(`Cannot create product. Barcode already used for: ${existingProductName}`, "error");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    // Pass the image file and UOM to createProduct
    const result = await createProduct(formData, categories, barcode, image, formData.uom); // Added UOM parameter
    
    if (result.success) {
      showToast(result.message, "success");
      console.log("✅ Product created:", result.data);
      if (result.data.image_path) {
        console.log("🖼️ Image saved at:", result.data.image_path);
      }
      
      // Reset form after successful submission
      setFormData({ 
        productName: "", 
        category: "", 
        uom: "", // Reset UOM
        // quantity: "", 
        price: "" 
      });
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
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);
  
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
              ref={barcodeInputRef}
              type="text"
              value={barcode}
              onChange={handleBarcodeChange}
              onKeyDown={handleBarcodeKeyDown}
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
        {/* <div className="flex flex-col">
          <label className="font-bold text-secondary">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter Quantity"
            className={inputClass}
          />
        </div> */}
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
        {/* UOM Dropdown - Added below category */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Unit of Measurement (UOM) *</label>
          <select
            name="uom"
            value={formData.uom}
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