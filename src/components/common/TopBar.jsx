import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

// TopBar component handles search input and barcode scanning only
const TopBar = ({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  onBarcodeScanned, 
  onEnterPress
}) => {
  // Local state for immediate input updates while maintaining parent state
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");

  // Refs for barcode scanner input buffer and timing
  const inputBuffer = useRef("");
  const lastTime = useRef(0);
  const barcodeTimeout = useRef(null);

  // Update local state when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm || "");
  }, [searchTerm]);

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
          // Clean barcode by removing non-printable characters
          const cleanBarcode = scannedBarcode.replace(/[^\x20-\x7E]/g, '').trim();
          console.log("Cleaned barcode:", cleanBarcode);
          
          if (cleanBarcode) {
            setLocalSearchTerm(cleanBarcode);
            setSearchTerm(cleanBarcode);
            onBarcodeScanned(cleanBarcode);
          }
          inputBuffer.current = "";
        }
      } else if (e.key.length === 1) { 
        inputBuffer.current += e.key;
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
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
  <Search 
    className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-900 transition-colors z-10" 
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
    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-900 border border-gray-300 focus:border-blue-300 text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm transition-colors"
  />
</div>
  );
};

export default TopBar;