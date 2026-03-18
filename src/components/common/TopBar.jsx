import React, { useState, useEffect, useRef } from "react";
import { Search, User, ChevronDown, UserPlus, CreditCard, TrendingUp } from "lucide-react";

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
  
  // Refs for barcode scanner input buffer and timing
  const inputBuffer = useRef("");
  const lastTime = useRef(0);
  const barcodeTimeout = useRef(null);
  const customerDropdownRef = useRef(null);

  // Customer options
  const customerOptions = [
    { id: 'walkin', name: 'Walk In Customer', icon: UserPlus, type: 'walkin' },
    { id: 'debit', name: 'Debit Customer', icon: CreditCard, type: 'debit' },
    { id: 'credit', name: 'Credit Customer', icon: TrendingUp, type: 'credit' }
  ];

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelectedCustomer(selectedCustomer);
  }, [selectedCustomer]);

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

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    console.log("Customer selected in TopBar:", customer);
    setLocalSelectedCustomer(customer);
    onCustomerSelect(customer);
    setIsCustomerDropdownOpen(false);
  };

  // Get selected customer details
  const getSelectedCustomerDetails = () => {
    if (localSelectedCustomer) {
      return customerOptions.find(c => c.id === localSelectedCustomer.id);
    }
    return null;
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
        
        {/* Dropdown Menu */}
        {isCustomerDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
              SELECT CUSTOMER TYPE
            </div>
            {customerOptions.map((customer) => {
              const Icon = customer.icon;
              const isSelected = localSelectedCustomer?.id === customer.id;
              
              return (
                <button
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-red-50 text-red-600' : 'text-gray-700'
                  }`}
                  type="button"
                >
                  <Icon size={16} className={isSelected ? 'text-red-500' : 'text-gray-500'} />
                  <span className="flex-1 text-left font-medium">{customer.name}</span>
                  {customer.type === 'walkin' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Default
                    </span>
                  )}
                  {customer.type === 'debit' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Prepaid
                    </span>
                  )}
                  {customer.type === 'credit' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                      Postpaid
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;