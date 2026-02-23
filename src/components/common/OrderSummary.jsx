/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import deleteIcon from "/public/ic_delete_button.png";
import { printReceipt } from "./../common/PrintReceipt"; 

const OrderSummary = ({ scannedBarcode, onBarcodeProcessed }) => {
  const [cartItems, setCartItems] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("2");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const scrollContainerRef = useRef(null);

  const productDatabase = {
    "M-MARK2212010015": { 
      id: 1, 
      title: "Thai Rice Bowl", 
      desc: "Over Hard, Mild", 
      price: 27.09, 
      image: "/img_category.webp" 
    },
    "695240103033": { 
      id: 2, 
      title: "Smoke Salmon Rice Bowl", 
      desc: "Over Hard, Mild", 
      price: 27.09, 
      image: "/img_categoryOne.webp" 
    },
    "4792210131204": { 
      id: 3, 
      title: "Healthy Rice Bowl", 
      desc: "Over Hard, Mild", 
      price: 27.09, 
      image: "/img_categoryTwo.webp" 
    },
    "AIPI16002537": { 
      id: 4, 
      title: "Bibimbap Rice Bowl", 
      desc: "Over Hard, Mild", 
      price: 27.09, 
      image: "/img_categoryThree.webp" 
    },
    "4057733899759": { 
      id: 5, 
      title: "Golden Beef Rice Bowl", 
      desc: "Over Hard, Mild", 
      price: 27.09, 
      image: "/img_categoryFour.webp" 
    },
    "THAI2ND456": { 
      id: 6, 
      title: "Thai Rice Bowl", 
      desc: "Extra Spicy", 
      price: 27.09, 
      image: "/img_category.webp" 
    },
    "SALM2ND789": { 
      id: 7, 
      title: "Smoke Salmon Rice Bowl", 
      desc: "Extra Salmon", 
      price: 27.09, 
      image: "/img_categoryOne.webp" 
    },
    "HEALTH2345": { 
      id: 8, 
      title: "Healthy Rice Bowl", 
      desc: "Vegan Option", 
      price: 27.09, 
      image: "/img_categoryTwo.webp" 
    },
    "BIBIM6789": { 
      id: 9, 
      title: "Bibimbap Rice Bowl", 
      desc: "With Egg", 
      price: 27.09, 
      image: "/img_categoryThree.webp" 
    },
    "GBEEF345678": { 
      id: 10, 
      title: "Golden Beef Rice Bowl", 
      desc: "Well Done", 
      price: 27.09, 
      image: "/img_categoryFour.webp" 
    },
    "THAI3RD901": { 
      id: 11, 
      title: "Thai Rice Bowl", 
      desc: "Mild Spice", 
      price: 27.09, 
      image: "/img_category.webp" 
    },
    "SALM3RD234": { 
      id: 12, 
      title: "Smoke Salmon Rice Bowl", 
      desc: "Light Salt", 
      price: 27.09, 
      image: "/img_categoryOne.webp" 
    },
    "HEALTH5678": { 
      id: 13, 
      title: "Healthy Rice Bowl", 
      desc: "Gluten Free", 
      price: 27.09, 
      image: "/img_categoryTwo.webp" 
    },
  };

  // Auto-scroll to bottom when new items added
  useEffect(() => {
    if (scrollContainerRef.current && cartItems.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [cartItems.length]);

  // Handle scanned barcode
  useEffect(() => {
    if (scannedBarcode && productDatabase[scannedBarcode]) {
      addToCart(productDatabase[scannedBarcode]);
      onBarcodeProcessed(); 
    }
  }, [scannedBarcode, onBarcodeProcessed]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.barcode === scannedBarcode);
      
      if (existingItem) {
        return prev.map((item) =>
          item.barcode === scannedBarcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { 
          ...product, 
          barcode: scannedBarcode, 
          quantity: 1, 
          selected: false 
        }];
      }
    });
  };

  const handleSelect = (barcode) => {
    setCartItems((prev) =>
      prev.map((item) => 
        item.barcode === barcode 
          ? { ...item, selected: !item.selected } 
          : item
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const handleDelete = () => {
    setCartItems((prev) => prev.filter((item) => !item.selected));
  };

  const handleQuantityChange = (barcode, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleReceivedAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setReceivedAmount(value);
    }
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setDiscountPercentage(value);
    }
  };

  const handleDiscountBlur = () => {
    if (discountPercentage === "" || discountPercentage === "0") {
      setDiscountPercentage("2");
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const parsedDiscount = discountPercentage === "" ? 0 : parseFloat(discountPercentage) || 0;
  const discountAmount = (subtotal * parsedDiscount) / 100;
  const tax = 1.99;
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = totalAfterDiscount + tax;
  const payback = receivedAmount && parseFloat(receivedAmount) - totalAmount;
  const isAnySelected = cartItems.some((item) => item.selected);
  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  const generateInvoiceNo = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };

  const generateFbrInvoiceNo = () => {
    return `FBR-${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
  };

  const handlePrint = () => {
    const receiptData = {
      cartItems,
      subtotal,
      discountPercentage: parsedDiscount,
      discountAmount,
      tax,
      totalAmount,
      paymentMethod,
      receivedAmount,
      payback,
      invoiceNo: generateInvoiceNo(),
      fbrInvoiceNo: generateFbrInvoiceNo(),
      shopName: "Smart Shop",
      shopAddress: "Abc Street, City, Country",
      shopPhone: "+92-308-4416769"
    };
    
    printReceipt(receiptData);
  };

  return (
    <div className="bg-lightGreyColor rounded-xl h-full flex flex-col overflow-hidden shadow-lg border">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-primary">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xs sm:text-sm md:text-base text-secondary">
            Cart Items ({cartItems.length})
          </h2>
          <button
            onClick={handleDelete}
            disabled={!isAnySelected}
            className={`rounded-lg transition-colors ${
              isAnySelected 
                ? "" 
                : "opacity-30 cursor-not-allowed"
            }`}
          >
            <img src={deleteIcon} alt="delete" className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {cartItems.length > 0 && (
          <div className="flex items-center gap-2 mt-2 sm:mt-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-red-500 cursor-pointer rounded"
            />
            <span className="text-xs sm:text-sm text-gray-500">Delete All</span>
          </div>
        )}
      </div>

      {/* Scrollable Items - Fixed height with proper constraints */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ maxHeight: "calc(100vh - 450px)" }}
      >
        {cartItems.length === 0 ? (
          <p className="text-center text-secondary flex items-center justify-center h-full text-xs sm:text-sm p-4">
            Empty Cart.
          </p>
        ) : (
          <div className="p-2 sm:p-3 space-y-2">
            {cartItems.map((item) => (
              <div key={item.barcode} className="flex items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => handleSelect(item.barcode)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-red-500 cursor-pointer flex-shrink-0"
                />
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{item.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.desc}</p>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <button
                      onClick={() => handleQuantityChange(item.barcode, -1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs sm:text-sm flex-shrink-0"
                    >
                      -
                    </button>
                    <span className="text-xs sm:text-sm font-medium w-5 sm:w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.barcode, 1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs sm:text-sm flex-shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="font-bold text-red-500 text-xs sm:text-sm whitespace-nowrap ml-1">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing Section */}
      {cartItems.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white space-y-2 sm:space-y-3">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  type="text"
                  value={discountPercentage}
                  onChange={handleDiscountChange}
                  onBlur={handleDiscountBlur}
                  className="w-10 sm:w-12 p-1 border border-gray-300 rounded text-center text-xs sm:text-sm"
                  placeholder="2"
                />
                <span className="text-red-500 text-xs sm:text-sm font-medium">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
              <div className="flex justify-between font-bold text-sm sm:text-base">
                <span>Total</span>
                <span className="text-red-500">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Payment</span>
              <div className="flex gap-2 sm:gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => handlePaymentMethodChange("cash")}
                    className="accent-red-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span className="text-xs sm:text-sm">Cash</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => handlePaymentMethodChange("card")}
                    className="accent-red-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span className="text-xs sm:text-sm">Card</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Received</span>
              <input
                type="number"
                value={receivedAmount}
                onChange={handleReceivedAmountChange}
                className="w-20 sm:w-24 p-1 sm:p-1.5 border border-gray-300 rounded text-xs sm:text-sm text-right"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            {receivedAmount && payback !== undefined && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Change</span>
                <span className={payback < 0 ? "text-red-500" : "text-green-600 font-medium"}>
                  ${payback.toFixed(2)}
                </span>
              </div>
            )}

            <button 
              onClick={handlePrint}
              className="w-full bg-red-500 text-white py-2 sm:py-3 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm sm:text-base mt-1 sm:mt-2"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;