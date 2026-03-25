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
      className="bg-gray-50 rounded-xl p-2 sm:p-3 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200"
    >
      {/* Product image container with responsive sizing */}
      <div className="w-full aspect-square rounded-lg mb-2 overflow-hidden bg-gray-100">
        {isValidImage ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // No Image Placeholder
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mb-1 sm:mb-2" 
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
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium text-center">
              No Image Uploaded
            </span>
          </div>
        )}
      </div>
      
      {/* Product title with truncation for long names */}
      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">
        {title}
      </h3>
      
      {/* Product price with responsive font sizes and red accent color */}
      <p className="text-red-500 font-semibold mt-2 text-sm sm:text-sm md:text-base lg:text-md">
        Rs {price}
      </p>
    </div>
  );
};

export default ProductCard;