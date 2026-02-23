/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef } from "react";

const AddProductPage = () => {
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState(null);
  const inputBuffer = useRef("");
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyPress = (e) => {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT"
      ) return; 

      const now = Date.now();
      if (now - lastTime.current > 100) {
        inputBuffer.current = "";
      }
      lastTime.current = now;

      if (e.key !== "Enter") {
        inputBuffer.current += e.key;
      } else {
        if (inputBuffer.current.length > 0) {
          setBarcode(inputBuffer.current);
        }
        inputBuffer.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const inputClass =
    "mt-2 px-4 py-3 border-2 border-gray-200 rounded-md bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-indigo-400";

  return (
    <div className="space-y-8 font-poppins border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Barcode */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary text-lg">Barcode</label>
          <input
            type="text"
            value={barcode}
            placeholder="Scan the barcode"
            readOnly
            className="mt-2 px-4 py-3 border border-gray-500 rounded-md bg-gradient-to-r from-purple-500 to-indigo-300 text-primary placeholder-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Product Name</label>
          <input type="text" placeholder="Enter Product Name" className={inputClass} />
        </div>

        {/* Quantity */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Quantity</label>
          <input type="number" placeholder="Enter Quantity" className={inputClass + " appearance-none"} />
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Price</label>
          <input type="number" placeholder="Enter Price" className={inputClass + " appearance-none"} />
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Category</label>
          <select className={inputClass}>
            <option value="" disabled selected>Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="books">Books</option>
            <option value="home">Home & Kitchen</option>
            <option value="sports">Sports</option>
          </select>
        </div>

        {/* Category Image */}
        <div className="flex flex-col">
          <label className="font-bold text-secondary">Product Image</label>
          <input
            type="file"
            accept="image/*"
            className={inputClass}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-8 py-3 rounded-md">
          Save Product
        </button>
      </div>
    </div>
  );
};

export default AddProductPage;
