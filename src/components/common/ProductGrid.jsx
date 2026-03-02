/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

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
  { title: "Smoke Salmon Rice Bowl", price: "27.09", image: "/img_categoryOne.webp", barcode: "SALM3RD234", desc: "With Fresh Salmon" },
  { title: "Healthy Rice Bowl", price: "27.09", image: "/img_categoryTwo.webp", barcode: "HEALTH5678", desc: "Quinoa Base" },
];

const ProductGrid = ({ onProductSelect, searchTerm }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    setFilteredProducts(allProducts);
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      const filtered = allProducts.filter(product => 
        product.title.toLowerCase().includes(term) || 
        product.barcode.toLowerCase().includes(term) ||
        (product.desc && product.desc.toLowerCase().includes(term))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchTerm]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 pb-3">
        <h2 className="font-semibold text-secondary text-sm sm:text-base">
          Total Products {searchTerm && `(Found: ${filteredProducts.length})`}
        </h2>
      </div>

      {/* Scrollable Product Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No Products Found "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredProducts.map((item, index) => (
              <ProductCard 
                key={item.barcode || index}
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