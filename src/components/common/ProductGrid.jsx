import React, { useEffect } from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ 
  onProductSelect, 
  products = [], 
  loading = false,
  activeSection = false,
  selectedProductIndex = -1,
  columns = 4
}) => {
  // Auto-scroll to selected product
  useEffect(() => {
    if (activeSection && selectedProductIndex >= 0 && selectedProductIndex < products.length) {
      const selectedElement = document.getElementById(`product-${selectedProductIndex}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [selectedProductIndex, activeSection, products.length]);

  const getGridColsClass = () => {
    switch(columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 sm:grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case 5: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h2 className="font-semibold text-gray-500 text-[11px]">
          {loading ? "Loading Products..." : `${products.length} Products`}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 custom-scroll">
        {loading ? (
          <div className={`grid ${getGridColsClass()} gap-1.5`}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-1.5 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-md mb-1.5"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-xs">No Products Found</p>
          </div>
        ) : (
          <div className={`grid ${getGridColsClass()} gap-1.5`}>
            {products.map((item, index) => (
              <div
                key={item.barcode || item.id || index}
                id={`product-${index}`}
                data-product-index={index}
                className="cursor-pointer"
                onClick={() => {
                  console.log("Product clicked:", item.title);
                  onProductSelect(item.barcode);
                }}
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
};

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;