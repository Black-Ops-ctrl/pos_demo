import React, { useState, useEffect, useRef } from "react";
import { Search, User, ChevronDown, UserPlus, CreditCard, TrendingUp } from "lucide-react";
import { getCustomers } from "../../api/customerApi"; // Adjust the import path as needed

// TopBar component handles search input, barcode scanning, and customer selection
const TopBar = ({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  onBarcodeScanned, 
  onEnterPress,
  selectedCustomer,
  onCustomerSelect 
}) => {
  // Local state for immediate input updates while maintaining parent state
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [localSelectedCustomer, setLocalSelectedCustomer] = useState(selectedCustomer || null);
  
  // State for customers from API
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Refs for barcode scanner input buffer and timing
  const inputBuffer = useRef("");
  const lastTime = useRef(0);
  const barcodeTimeout = useRef(null);
  const customerDropdownRef = useRef(null);

  // Load customers from API
  const loadCustomers = async (isInitialLoad = false) => {
    setLoadingCustomers(true);
    try {
      const response = await getCustomers();
      // Extract customers from response (handle different response structures)
      const customersData = response?.data || response || [];
      setCustomers(customersData);
      console.log("Loaded customers:", customersData);
      
      // 👇 BY DEFAULT FIRST CUSTOMER SELECT KARO (SIRF PEHLI BAR)
      if (isInitialLoad && customersData.length > 0 && !selectedCustomer) {
        const firstCustomer = customersData[0];
        const defaultCustomer = {
          id: firstCustomer.customer_id,
          name: firstCustomer.customer_name,
          phone: firstCustomer.phone,
          email: firstCustomer.email,
          address: firstCustomer.address,
          city: firstCustomer.city,
          type: firstCustomer.customer_type || 'debit',
          icon: firstCustomer.customer_type === 'credit' ? TrendingUp : CreditCard
        };
        
        console.log("✅ Auto-selecting first customer:", defaultCustomer);
        setLocalSelectedCustomer(defaultCustomer);
        onCustomerSelect(defaultCustomer);
      }
      
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoadingCustomers(false);
      setInitialLoadDone(true);
    }
  };

  // 👇 COMPONENT MOUNT PE CUSTOMERS LOAD KARO AUR FIRST SELECT KARO
  useEffect(() => {
    loadCustomers(true); // true means initial load
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    if (selectedCustomer) {
      setLocalSelectedCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  // Load customers when dropdown opens (refresh list)
  useEffect(() => {
    if (isCustomerDropdownOpen) {
      loadCustomers(false); // false means not initial load, don't auto-select
    }
  }, [isCustomerDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effect to handle barcode scanner input by capturing rapid key presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      // Ignore if typing in form fields, except our search input
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "SELECT"
      ) {
        if (activeElement.id === "search-input") {
          return;
        }
        return;
      }
      // Ignore modifier keys and special keys
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "Tab" || e.key === "CapsLock") {
        return;
      }
      const now = Date.now();
      // Reset buffer if keys are pressed too slowly (not from scanner)
      if (now - lastTime.current > 100) {
        if (inputBuffer.current.length > 0) {
          console.log("Barcode timeout - clearing buffer:", inputBuffer.current);
        }
        inputBuffer.current = "";
      }
      lastTime.current = now;
      // Clear any pending barcode timeout
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
      // Handle Enter key as end of barcode scan
      if (e.key === "Enter") {
        e.preventDefault();
        
        if (inputBuffer.current.length > 0) {
          const scannedBarcode = inputBuffer.current;
          console.log("📦 Barcode captured on Enter:", scannedBarcode);
          console.log("Raw barcode length:", scannedBarcode.length);
          console.log("Raw barcode chars:", scannedBarcode.split('').map(c => c.charCodeAt(0)));
          // Clean barcode by removing non-printable characters
          const cleanBarcode = scannedBarcode.replace(/[^\x20-\x7E]/g, '').trim();
          console.log("Cleaned barcode:", cleanBarcode);
          console.log("Cleaned barcode length:", cleanBarcode.length);
          
          if (cleanBarcode) {
            setLocalSearchTerm(cleanBarcode);
            setSearchTerm(cleanBarcode);
            onBarcodeScanned(cleanBarcode);
          }
          inputBuffer.current = "";
        }
      } else if (e.key.length === 1) { 
        inputBuffer.current += e.key;
        console.log("Adding char to buffer:", e.key, "Current buffer:", inputBuffer.current);
        barcodeTimeout.current = setTimeout(() => {
          if (inputBuffer.current.length > 0) {
            const scannedBarcode = inputBuffer.current;
            console.log("📦 Barcode captured after timeout:", scannedBarcode);
            
            const cleanBarcode = scannedBarcode.replace(/[^\x20-\x7E]/g, '').trim();
            console.log("Cleaned barcode from timeout:", cleanBarcode);
            
            if (cleanBarcode) {
              setLocalSearchTerm(cleanBarcode);
              setSearchTerm(cleanBarcode);
              onBarcodeScanned(cleanBarcode);
            }
            inputBuffer.current = "";
          }
        }, 200);
      }
    };
    // Add and remove event listeners
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
    };
  }, [onBarcodeScanned, setSearchTerm]);

  // Handle manual input changes from search field
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setSearchTerm(value);
  };

  // Handle Enter key press for manual search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (localSearchTerm.trim()) {
        console.log("Manual search triggered:", localSearchTerm);
        onSearch(localSearchTerm);
        
        if (onEnterPress) {
          onEnterPress(localSearchTerm);
        }
      }
    }
  };

  // Handle search icon click for manual search
  const handleSearchClick = () => {
    if (localSearchTerm.trim()) {
      console.log("Search icon clicked:", localSearchTerm);
      onSearch(localSearchTerm);
    }
  };

  // Handle existing customer selection from API
  const handleExistingCustomerSelect = (customer) => {
    const selectedCustomer = {
      id: customer.customer_id,
      name: customer.customer_name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      type: customer.customer_type || 'debit',
      icon: customer.customer_type === 'credit' ? TrendingUp : CreditCard
    };
    
    console.log("Existing customer selected:", selectedCustomer);
    setLocalSelectedCustomer(selectedCustomer);
    onCustomerSelect(selectedCustomer);
    setIsCustomerDropdownOpen(false);
  };

  // Get selected customer details for display
  const getSelectedCustomerDetails = () => {
    if (!localSelectedCustomer) return null;
    
    return {
      id: localSelectedCustomer.id,
      name: localSelectedCustomer.name,
      phone: localSelectedCustomer.phone,
      icon: localSelectedCustomer.icon || (localSelectedCustomer.type === 'credit' ? TrendingUp : CreditCard)
    };
  };

  const selectedCustomerDetails = getSelectedCustomerDetails();

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
      {/* Search input with icon */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <Search 
          className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-red-500 transition-colors" 
          size={16}
          onClick={handleSearchClick}
        />
        <input
          id="search-input"
          type="text"
          value={localSearchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Search or scan barcode..."
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300 border border-transparent focus:border-red-300 text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
        />
      </div>

      {/* Customer Dropdown Menu */}
      <div className="relative flex-shrink-0" ref={customerDropdownRef}>
        <button
          onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-red-300 min-w-[140px] sm:min-w-[160px]"
          type="button"
        >
          <div className="flex items-center gap-2 flex-1">
            {selectedCustomerDetails ? (
              <>
                <selectedCustomerDetails.icon size={16} className="text-gray-600" />
                <span className="text-xs sm:text-sm font-medium truncate">
                  {selectedCustomerDetails.name}
                </span>
              </>
            ) : (
              <>
                <User size={16} className="text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Select Customer
                </span>
              </>
            )}
          </div>
          <ChevronDown 
            size={14} 
            className={`text-gray-500 transition-transform duration-200 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {/* Dropdown Menu - Only API Customers */}
        {isCustomerDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-64 sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 sticky top-0 bg-white">
              SELECT CUSTOMER
            </div>
            
            {/* Loading State */}
            {loadingCustomers ? (
              <div className="px-4 py-8 text-xs text-gray-500 text-center">
                Loading customers...
              </div>
            ) : (
              <>
                {/* Customers List */}
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.customer_id}
                      onClick={() => handleExistingCustomerSelect(customer)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700 border-b border-gray-50 last:border-b-0 ${
                        localSelectedCustomer?.id === customer.customer_id ? 'bg-red-50' : ''
                      }`}
                      type="button"
                    >
                      {customer.customer_type === 'credit' ? (
                        <TrendingUp size={16} className={localSelectedCustomer?.id === customer.customer_id ? 'text-red-500' : 'text-gray-500'} />
                      ) : (
                        <CreditCard size={16} className={localSelectedCustomer?.id === customer.customer_id ? 'text-red-500' : 'text-gray-500'} />
                      )}
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${localSelectedCustomer?.id === customer.customer_id ? 'text-red-600' : 'text-gray-700'}`}>
                          {customer.customer_name}
                        </div>
                        {customer.phone && (
                          <div className="text-xs text-gray-500">{customer.phone}</div>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        customer.customer_type === 'credit' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {customer.customer_type === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </button>
                  ))
                ) : (
                  /* No customers message */
                  <div className="px-4 py-8 text-xs text-gray-500 text-center">
                    No customers found
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;