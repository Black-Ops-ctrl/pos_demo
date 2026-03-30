import React, { useState } from "react";

const ProductCard = ({ image, title, price, desc, barcode, onProductClick, isSelected = false }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    if (onProductClick && barcode) {
      onProductClick(barcode);
    }
  };

  const isValidImage = image && 
    image !== "/img_categoryFive.webp" && 
    image !== "/img_category.webp" &&
    !imageError;

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-lg p-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer border
        ${isSelected 
          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200' 
          : 'border-gray-100 hover:border-blue-200'
        }
      `}
    >
      {/* Product image container - smaller */}
      <div className="w-full aspect-square rounded-md mb-1.5 overflow-hidden bg-gray-50">
        {isValidImage ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg 
              className="w-6 h-6 text-gray-400 mb-0.5" 
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
            <span className="text-[8px] text-gray-500 font-medium">
              No Image
            </span>
          </div>
        )}
      </div>
      
      {/* Product title - smaller text */}
      <h3 className={`font-medium text-[11px] truncate leading-tight ${
        isSelected ? 'text-blue-900' : 'text-blue-900'
      }`}>
        {title}
      </h3>
      
      {/* Product price - smaller text */}
      <p className="text-blue-900 font-semibold text-[11px] mt-0.5">
        Rs {price}
      </p>
    </div>
  );
};

export default ProductCard;