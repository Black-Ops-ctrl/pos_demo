import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
// TopBar component handles search input, barcode scanning, and user profile display
const TopBar = ({ searchTerm, setSearchTerm, onSearch, onBarcodeScanned, onEnterPress }) => {
  // Local state for immediate input updates while maintaining parent state
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  // Refs for barcode scanner input buffer and timing
  const inputBuffer = useRef("");
  const lastTime = useRef(0);
  const barcodeTimeout = useRef(null);
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
      {/* User profile section */}
      {/* <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <img
          src="/img_category.webp"
          alt="avatar"
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="text-right hidden xs:block">
          <p className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">Lauren Smith</p>
          <p className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">Cashier</p>
        </div>
      </div> */}
    </div>
  );
};
export default TopBar;