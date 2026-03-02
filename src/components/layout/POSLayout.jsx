import React, { useState } from "react";
import Sidebar from "./Sidebar";
import OrderSummary from "../common/OrderSummary";
import TopBar from "../common/TopBar";
import ProductGrid from "../common/ProductGrid";
import CategoryTabs from "../common/CategoryTabs"; 

const allProducts = [
  { title: "Thai Rice Bowl", price: "27.09", image: "/img_categoryFive.webp", barcode: "M-MARK2212010015", desc: "Spicy Thai Style" },
  { title: "Smoke Salmon Rice Bowl", price: "27.09", image: "/img_categoryOne.webp", barcode: "695240103033", desc: "With Fresh Salmon" },
  { title: "Healthy Rice Bowl", price: "27.09", image: "/img_categoryTwo.webp", barcode: "4792210131204", desc: "Quinoa Base" },
  { title: "Bibimbap Rice Bowl", price: "27.09", image: "/img_categoryThree.webp", barcode: "AIPI16002537", desc: "Korean Style" },
  { title: "Golden Beef Rice Bowl", price: "27.09", image: "/img_categoryFour.webp", barcode: "4057733899759", desc: "Tender Beef" },
  { title: "Thai Rice Bowl", price: "27.09", image: "/img_categoryFive.webp", barcode: "THAI2ND456", desc: "Spicy Thai Style" },
  { title: "Smoke Salmon Rice Bowl", price: "27.09", image: "/img_categoryOne.webp", barcode: "SALM2ND789", desc: "With Fresh Salmon" },
  { title: "Healthy Rice Bowl", price: "27.09", image: "/img_categoryTwo.webp", barcode: "HEALTH2345", desc: "Quinoa Base" },
  { title: "Bibimbap Rice Bowl", price: "27.09", image: "/img_categoryThree.webp", barcode: "BIBIM6789", desc: "Korean Style" },
  { title: "Golden Beef Rice Bowl", price: "27.09", image: "/img_categoryFour.webp", barcode: "GBEEF345678", desc: "Tender Beef" },
  { title: "Thai Rice Bowl", price: "27.09", image: "/img_categoryFive.webp", barcode: "THAI3RD901", desc: "Spicy Thai Style" },
];

const POSLayout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Rice Bowl");

  const handleBarcodeScanned = (barcode) => {
    console.log("Barcode scanned in POSLayout:", barcode);
    setScannedBarcode(barcode);
    setSearchTerm("");
  };

  const handleProductSelect = (barcode) => {
    console.log("Product selected with barcode:", barcode);
    setScannedBarcode(barcode);
  };

  const handleSearch = (term) => {
    console.log("Search term:", term);
    setSearchTerm(term);
  };

  const handleEnterPress = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const term = searchTerm.toLowerCase().trim();
    const matchedProduct = allProducts.find(product => 
      product.title.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term)) ||
      (product.desc && product.desc.toLowerCase().includes(term))
    );
    
    if (matchedProduct) {
      console.log("Enter pressed - auto-selecting product:", matchedProduct.title);
      setScannedBarcode(matchedProduct.barcode);
      setSearchTerm("");
    }
  };

  const handleBarcodeProcessed = () => {
    console.log("Barcode processed");
    setScannedBarcode(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
    // You can add filtering logic here based on category
  };

  return (
    <div className="h-screen bg-rose-50 p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Fixed for all screens */}
        <Sidebar />
        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TopBar Section */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-5 pb-1 sm:pb-2 md:pb-2 lg:pb-3">
            <TopBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              onBarcodeScanned={handleBarcodeScanned}
              onEnterPress={handleEnterPress}
            />
          </div>

          {/* Category Tabs Section - Added below TopBar */}
          <div className="px-3 sm:px-4 md:px-5 pb-2 sm:pb-3 md:pb-4">
            <CategoryTabs 
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Product Grid and Order Summary */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 gap-4 overflow-hidden">
            {/* Product Grid - Takes remaining space */}
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <ProductGrid 
                onProductSelect={handleProductSelect}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory} 
              />
            </div>

            {/* Order Summary */}
            <div className="w-full md:w-80 lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 h-full overflow-hidden">
              <OrderSummary 
                scannedBarcode={scannedBarcode}
                onBarcodeProcessed={handleBarcodeProcessed}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSLayout;