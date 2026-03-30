/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, forwardRef } from "react";
import ProductCard from "./ProductCard";

const ProductGrid = forwardRef(({ 
  onProductSelect, 
  searchTerm = "", 
  selectedCategory = "", 
  products = [], 
  loading = false,
  activeSection = false,
  selectedProductIndex = -1
}, ref) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  useEffect(() => {
    let filtered = [...products];
    if (!searchTerm || searchTerm.trim() === "") {
      if (selectedCategory && selectedCategory !== "Popular" && selectedCategory !== "") {
        filtered = filtered.filter(product => {
          const productCategory = product.category?.toLowerCase() || "";
          const searchCategory = selectedCategory.toLowerCase();
          return productCategory.includes(searchCategory) ||
                 product.title?.toLowerCase().includes(searchCategory) ||
                 product.desc?.toLowerCase().includes(searchCategory);
        });
      }
    }
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(term) || 
        (product.barcode && product.barcode.toLowerCase().includes(term)) ||
        (product.desc && product.desc.toLowerCase().includes(term))
      );
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Auto-scroll to selected product
  useEffect(() => {
    if (activeSection && selectedProductIndex >= 0 && selectedProductIndex < filteredProducts.length) {
      const selectedElement = document.getElementById(`product-${selectedProductIndex}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [selectedProductIndex, activeSection, filteredProducts]);

  return (
    <div 
      ref={ref}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Sticky header showing product count - smaller */}
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h2 className="font-semibold text-gray-500 text-[11px]">
          {loading ? "Loading Products..." : `${filteredProducts.length} ${searchTerm ? `Found for "${searchTerm}"` : "Products"}`}
        </h2>
      </div>
      
      {/* Scrollable product grid area - more columns, smaller gaps */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scroll">
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-1.5 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-md mb-1.5"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-xs">No Products Found {searchTerm && `for "${searchTerm}"`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5">
            {filteredProducts.map((item, index) => (
              <div
                key={item.barcode || item.id || index}
                id={`product-${index}`}
                className="cursor-pointer"
              >
                <ProductCard 
                  title={item.title}
                  price={item.price}
                  image={item.image}
                  desc={item.desc}
                  barcode={item.barcode}
                  onProductClick={onProductSelect}
                  isSelected={activeSection && selectedProductIndex === index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;