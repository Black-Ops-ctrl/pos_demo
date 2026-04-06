import React, { useState, useEffect, useRef } from "react";

const QuantityModal = ({ isOpen, product, onConfirm, onCancel }) => {
  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setTimeout(() => {
        inputRef.current?.focus();
        // Select all text in input so user can type directly
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, product]);

  const handleConfirm = () => {
    const finalQuantity = parseInt(quantity);
    if (finalQuantity >= 1 && !isNaN(finalQuantity)) {
      onConfirm(product, finalQuantity);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleQuantityChange = (e) => {
    let value = e.target.value;
    
    // Allow empty string for typing
    if (value === "") {
      setQuantity("");
      return;
    }
    
    // Parse the value
    let parsedValue = parseInt(value);
    
    // Check if it's a valid number
    if (!isNaN(parsedValue)) {
      // Don't allow negative numbers
      if (parsedValue < 1) {
        setQuantity(1);
      } else {
        setQuantity(parsedValue);
      }
    }
  };

  const handleBlur = () => {
    // If field is empty or invalid, set to 1
    if (quantity === "" || isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    const currentValue = quantity === "" ? 1 : parseInt(quantity);
    setQuantity(currentValue + 1);
  };

  const decrementQuantity = () => {
    const currentValue = quantity === "" ? 1 : parseInt(quantity);
    if (currentValue > 1) {
      setQuantity(currentValue - 1);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90%] p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Enter Quantity
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Product: <span className="font-medium text-gray-800">{product.title}</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Price: <span className="font-medium text-blue-600">Rs {product.price}</span>
          </p>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={decrementQuantity}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg font-semibold hover:bg-gray-200 transition-colors"
              type="button"
            >
              -
            </button>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
            <button
              onClick={incrementQuantity}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg font-semibold hover:bg-gray-200 transition-colors"
              type="button"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Tip: Type directly to enter custom quantity
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;