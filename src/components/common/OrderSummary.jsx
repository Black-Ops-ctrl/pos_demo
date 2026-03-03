/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import deleteIcon from "/public/ic_delete_button.png";
import { printReceipt } from "./../common/PrintReceipt"; 

const OrderSummary = ({ scannedBarcode, onBarcodeProcessed, products = [] }) => {
  const [cartItems, setCartItems] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("2");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    console.log("OrderSummary received products:", products.length);
    console.log("Product barcodes:", products.map(p => ({ title: p.title, barcode: p.barcode })));
  }, [products]);

  const productDatabase = React.useMemo(() => {
    const db = {};
    console.log("Building product database...");
    
    products.forEach(product => {
      if (product.barcode) {
        db[product.barcode] = {
          id: product.barcode,
          title: product.title,
          desc: product.desc || "",
          price: Math.round(parseFloat(product.price) || 0),
          image: product.image || "/img_category.webp"
        };
        console.log(`✅ Added product: ${product.title} with barcode: ${product.barcode}`);
      } else {
        console.log(`❌ Product ${product.title} has no barcode`);
      }
    });
    
    console.log("Final product database keys:", Object.keys(db));
    return db;
  }, [products]);

  useEffect(() => {
    if (scrollContainerRef.current && cartItems.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (scannedBarcode) {
      console.log("🔍 Looking for barcode:", scannedBarcode);
      console.log("Available barcodes:", Object.keys(productDatabase));
      
      const foundProduct = productDatabase[scannedBarcode];
      
      if (foundProduct) {
        console.log("✅ Product found:", foundProduct.title);
        addToCart(foundProduct);
        onBarcodeProcessed();
      } else {
        console.log("❌ No product found with barcode:", scannedBarcode);
      }
    }
  }, [scannedBarcode, onBarcodeProcessed]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.barcode === product.id);
      
      if (existingItem) {
        console.log(`🔄 Increasing quantity for ${product.title}`);
        return prev.map((item) =>
          item.barcode === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        console.log(`🆕 Adding new item: ${product.title}`);
        return [...prev, { 
          ...product, 
          barcode: product.id, 
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

  // Calculations - all rounded to nearest integer
  const subtotal = Math.round(
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  );

  const parsedDiscount = discountPercentage === "" ? 0 : parseFloat(discountPercentage) || 0;
  const discountAmount = Math.round((subtotal * parsedDiscount) / 100);
  const tax = 199;
  const totalAfterDiscount = subtotal - discountAmount;
  const totalAmount = Math.round(totalAfterDiscount + tax);
  const payback = receivedAmount && Math.round(parseFloat(receivedAmount) - totalAmount);
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
      cartItems: cartItems.map(item => ({
        ...item,
        price: Math.round(item.price)
      })),
      subtotal,
      discountPercentage: parsedDiscount,
      discountAmount,
      tax,
      totalAmount,
      paymentMethod,
      receivedAmount: receivedAmount ? Math.round(parseFloat(receivedAmount)) : "",
      payback: payback ? Math.round(payback) : 0,
      invoiceNo: generateInvoiceNo(),
      fbrInvoiceNo: generateFbrInvoiceNo(),
      shopName: "Smart Shop",
      shopAddress: "Abc Street, City, Country",
      shopPhone: "+92-308-4416769",
      currency: "Rs"
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
                  Rs {Math.round(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white space-y-2 sm:space-y-3">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs {subtotal}</span>
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
                  -Rs {discountAmount}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">Rs {tax}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
              <div className="flex justify-between font-bold text-sm sm:text-base">
                <span>Total</span>
                <span className="text-red-500">Rs {totalAmount}</span>
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
                step="1"
                placeholder="0"
              />
            </div>

            {receivedAmount && payback !== undefined && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Change</span>
                <span className={payback < 0 ? "text-red-500" : "text-green-600 font-medium"}>
                  Rs {Math.abs(payback)} {payback < 0 ? "(Due)" : ""}
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