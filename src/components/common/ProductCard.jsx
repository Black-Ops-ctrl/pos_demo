import React from "react";

const ProductCard = ({ image, title, price, desc, barcode, onProductClick }) => {
  const handleClick = () => {
    if (onProductClick && barcode) {
      console.log("Product clicked with barcode:", barcode);
      onProductClick(barcode);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-50 rounded-xl p-2 sm:p-3 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200"
    >
      <img
        src={image}
        alt={title}
        className="w-full aspect-square object-cover rounded-lg mb-2"
      />

      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">
        {title}
      </h3>
      
      {desc && (
        <p className="text-gray-500 mt-1 truncate text-[10px] sm:text-xs md:text-sm">
          {desc}
        </p>
      )}
      
      <p className="text-red-500 font-semibold mt-2 text-sm sm:text-sm md:text-base lg:text-lg">
        ${price}
      </p>
    </div>
  );
};

export default ProductCard;