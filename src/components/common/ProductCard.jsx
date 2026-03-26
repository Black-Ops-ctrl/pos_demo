import React, { useState } from "react";

// ProductCard component displays individual product information in a card format
const ProductCard = ({ image, title, price, desc, barcode, onProductClick }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    if (onProductClick && barcode) {
      console.log("Product clicked with barcode:", barcode);
      onProductClick(barcode);
    }
  };

  // Check if image is valid
  const isValidImage = image && 
    image !== "/img_categoryFive.webp" && 
    image !== "/img_category.webp" &&
    !imageError;

  return (
    <div
      onClick={handleClick}
      className="bg-gray-50 rounded-lg p-1 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200"
    >
      {/* Product image container - REDUCED SIZE */}
      <div className="w-full aspect-square rounded-md mb-1 overflow-hidden bg-gray-100">
        {isValidImage ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // No Image Placeholder - REDUCED SIZE
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium text-center">
              No Image
            </span>
          </div>
        )}
      </div>
      
      {/* Product title - REDUCED TEXT SIZE */}
      <h3 className="font-semibold text-gray-800 text-[10px] sm:text-xs truncate">
        {title}
      </h3>
      
      {/* Product price - REDUCED SIZE */}
      <p className="text-red-500 font-semibold mt-0.5 text-[10px] sm:text-xs">
        Rs {price}
      </p>
    </div>
  );
};

export default ProductCard;