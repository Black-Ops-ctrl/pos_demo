import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Search } from "lucide-react";

const TopBar = forwardRef(({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  onBarcodeScanned, 
  onEnterPress,
  onFocus,
  onBlur
}, ref) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const inputBuffer = useRef("");
  const lastTime = useRef(0);
  const barcodeTimeout = useRef(null);

  useEffect(() => {
    setLocalSearchTerm(searchTerm || "");
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
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
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "Tab" || e.key === "CapsLock") {
        return;
      }
      const now = Date.now();
      if (now - lastTime.current > 100) {
        inputBuffer.current = "";
      }
      lastTime.current = now;
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        
        if (inputBuffer.current.length > 0) {
          const scannedBarcode = inputBuffer.current;
          const cleanBarcode = scannedBarcode.replace(/[^\x20-\x7E]/g, '').trim();
          
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
            const cleanBarcode = scannedBarcode.replace(/[^\x20-\x7E]/g, '').trim();
            
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
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
    };
  }, [onBarcodeScanned, setSearchTerm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setSearchTerm(value);
    onSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (localSearchTerm.trim()) {
        if (onEnterPress) {
          onEnterPress(localSearchTerm);
        }
      }
    }
  };

  const handleSearchClick = () => {
    if (localSearchTerm.trim()) {
      if (onEnterPress) {
        onEnterPress(localSearchTerm);
      }
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
        ref={ref}
        id="search-input"
        type="text"
        value={localSearchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search or scan barcode..."
        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-900 border border-gray-300 focus:border-blue-300 text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm transition-colors"
      />
    </div>
  );
});

TopBar.displayName = 'TopBar';

export default TopBar;