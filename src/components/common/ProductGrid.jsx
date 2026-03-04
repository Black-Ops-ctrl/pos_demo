/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ onProductSelect, searchTerm = "", selectedCategory = "", products = [], loading = false }) => {
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sticky header showing product count */}
      <div className="sticky top-0 bg-white z-10 pb-3">
        <h2 className="font-semibold text-secondary text-sm sm:text-base">
          {loading ? "Loading Products..." : `Total Products ${searchTerm ? `(Found: ${filteredProducts.length})` : `(${filteredProducts.length})`}`}
        </h2>
      </div>
      
      {/* Scrollable product grid area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          // Loading skeleton - displays animated placeholder cards while loading
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-2 sm:p-3 shadow-sm border border-gray-200">
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          // No results message
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No Products Found {searchTerm && `"${searchTerm}"`}</p>
          </div>
        ) : (
          // Actual product grid with filtered items
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredProducts.map((item, index) => (
              <ProductCard 
                key={item.barcode || item.id || index}
                title={item.title}
                price={item.price}
                image={item.image}
                desc={item.desc}
                barcode={item.barcode}
                onProductClick={onProductSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;