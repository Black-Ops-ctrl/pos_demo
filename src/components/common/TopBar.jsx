import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

const TopBar = ({ searchTerm, setSearchTerm, onSearch, onBarcodeScanned, onEnterPress }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const inputBuffer = useRef("");
  const lastTime = useRef(0);
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

      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "Tab") {
        return;
      }

      const now = Date.now();
      if (now - lastTime.current > 100) {
        inputBuffer.current = "";
      }
      lastTime.current = now;

      if (e.key === "Enter") {
        e.preventDefault();
      }

      if (e.key !== "Enter") {
        if (e.key.length === 1) {
          inputBuffer.current += e.key;
        }
      } else {
        if (inputBuffer.current.length > 0) {
          const scannedBarcode = inputBuffer.current;
          console.log("Barcode scanned:", scannedBarcode);
          
          const cleanBarcode = scannedBarcode.replace(/[^\x20-\x7E]/g, '').trim();
          
          setLocalSearchTerm(cleanBarcode);
          setSearchTerm(cleanBarcode);
          onBarcodeScanned(cleanBarcode);
          
          inputBuffer.current = "";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBarcodeScanned, setSearchTerm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setSearchTerm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(localSearchTerm);
      
      if (onEnterPress) {
        onEnterPress(localSearchTerm);
      }
    }
  };

  const handleSearchClick = () => {
    onSearch(localSearchTerm);
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
      {/* Search Bar - Responsive width */}
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
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full bg-gray-100 focus:outline-none focus:ring- focus:ring-gray-300 border border-transparent focus:border-gray-300 text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
        />
      </div>

      {/* User Info - Responsive */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <img
          src="/img_category.webp"
          alt="avatar"
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="text-right hidden xs:block">
          <p className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">Lauren Smith</p>
          <p className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">Cashier</p>
        </div>
      </div>
    </div>
  );
};

export default TopBar;