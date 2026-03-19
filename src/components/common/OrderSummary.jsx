/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import deleteIcon from "/public/ic_delete_button.png";
import { printReceipt } from "./../common/PrintReceipt";
import { updateStockAfterSale } from "../../core/services/api/updateStock";
import Toast from "./../common/Toast"; 
import { createSalesInvoice } from "../../api/salesInvoiceApi";

const OrderSummary = ({ 
  scannedBarcode, 
  onBarcodeProcessed, 
  products = [],
  onRefreshProducts,
  selectedCustomer // 👈 YEH PROP ADD KIYA
}) => {
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); 
  
  const scrollContainerRef = useRef(null);

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Hide toast function
  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Create product lookup database
  const productDatabase = React.useMemo(() => {
    const db = {};
    products.forEach(product => {
      if (product.barcode) {
        db[product.barcode] = {
          id: product.id,
          barcode: product.barcode,
          title: product.title,
          desc: product.desc || "",
          price: Math.round(parseFloat(product.price) || 0),
          image: product.image || "/img_category.webp",
          quantity: product.quantity || 0
        };
      }
    });
    return db;
  }, [products]);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (scrollContainerRef.current && cartItems.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [cartItems.length]);

  // Handle barcode scanning
  useEffect(() => {
    if (scannedBarcode) {
      const foundProduct = productDatabase[scannedBarcode];
      
      if (foundProduct) {
        addToCart(foundProduct);
      } else {
        showToast(`Product with barcode ${scannedBarcode} not found!`, 'error');
      }
      onBarcodeProcessed();
    }
  }, [scannedBarcode]);

  // Check stock availability
  const checkStockAvailability = (product, requestedQuantity) => {
    const productInDB = productDatabase[product.barcode] || product;
    
    if (!productInDB) {
      return { available: false, currentStock: 0 };
    }

    const currentStock = productInDB.quantity || 0;
    return {
      available: currentStock >= requestedQuantity,
      currentStock: currentStock
    };
  };

  // Add to cart with stock validation
  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.barcode === product.barcode);
    const requestedQuantity = existingItem ? existingItem.quantity + 1 : 1;

    const stockCheck = checkStockAvailability(product, requestedQuantity);
    
    if (!stockCheck.available) {
      showToast(`Only ${stockCheck.currentStock} ${product.title} available in stock!`, 'warning');
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.barcode === product.barcode);
      
      if (existingItem) {
        return prev.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { 
          ...product, 
          id: product.id,
          barcode: product.barcode, 
          quantity: 1, 
          selected: false 
        }];
      }
    });
  };

  // Toggle selection of individual cart item
  const handleSelect = (barcode) => {
    setCartItems((prev) =>
      prev.map((item) => 
        item.barcode === barcode 
          ? { ...item, selected: !item.selected } 
          : item
      )
    );
  };

  // Toggle select all items in cart
  const handleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  // Delete selected items from cart
  const handleDelete = () => {
    setCartItems((prev) => prev.filter((item) => !item.selected));
    showToast('Selected items removed from cart', 'info');
  };

  // Handle quantity change
  const handleQuantityChange = (barcode, delta) => {
    const item = cartItems.find(i => i.barcode === barcode);
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) return;
    
    if (delta > 0) {
      const stockCheck = checkStockAvailability(item, newQuantity);
      if (!stockCheck.available) {
        showToast(`Only ${stockCheck.currentStock} ${item.title} available in stock!`, 'warning');
        return;
      }
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Handle received amount
  const handleReceivedAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setReceivedAmount(value);
    }
  };

  // Handle discount change
  const handleDiscountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setDiscountPercentage(value);
    }
  };

  // Handle discount blur
  const handleDiscountBlur = () => {
    if (discountPercentage === "" || discountPercentage === "0") {
      setDiscountPercentage("2");
    }
  };

  // Handle payment method
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Calculations
  const subtotal = Math.round(
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const parsedDiscount = discountPercentage === "" ? 0 : parseFloat(discountPercentage) || 0;
  const discountAmount = Math.round((subtotal * parsedDiscount) / 100);

  // Dynamic tax based on payment method
  const taxPercentage = paymentMethod === "cash" ? 0 : 0;
  const taxAmount = Math.round((subtotal - discountAmount) * taxPercentage / 100);
  const totalAmount = Math.round(subtotal - discountAmount + taxAmount);
  const payback = receivedAmount && Math.round(parseFloat(receivedAmount) - totalAmount);
  const isAnySelected = cartItems.some((item) => item.selected);
  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  // Generate invoice number
  const generateInvoiceNo = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };

  // Generate FBR invoice number
  const generateFbrInvoiceNo = () => {
    return `FBR-${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
  };

  // Final stock validation
  const validateFinalStock = () => {
    for (const item of cartItems) {
      const productInInventory = productDatabase[item.barcode];
      
      if (!productInInventory) {
        showToast(`Product ${item.title} not found in inventory!`, 'error');
        return false;
      }
      
      if (productInInventory.quantity < item.quantity) {
        showToast(`Only ${productInInventory.quantity} ${item.title} available! You have ${item.quantity} in cart.`, 'warning');
        return false;
      }
    }
    return true;
  };

  const handlePrint = async () => {
    if (isProcessing) return;
    
    if (cartItems.length === 0) {
      showToast("Cart is empty!", 'warning');
      return;
    }

    if (paymentMethod === "cash") {
      if (!receivedAmount || parseFloat(receivedAmount) < totalAmount) {
        showToast("Please enter valid received amount!", 'warning');
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (!validateFinalStock()) {
        setIsProcessing(false);
        return;
      }

      const selectedBranchId = sessionStorage.getItem("selectedBranchId");
      const companyId = sessionStorage.getItem("companyId");

      // Prepare items for API
      const itemsForApi = cartItems.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount_percentage: parsedDiscount,
        discount_amount: Math.round((item.price * item.quantity * parsedDiscount) / 100),
        tax: taxPercentage,
        extra_discount: 0,
        commission_percentge: 0,
        commission_amount: 0
      }));

      // 👇 CUSTOMER ID NIKALO - agar walkin hai to 0 bhejo
      const customerIdValue = selectedCustomer?.id && selectedCustomer.id !== 'walkin' 
        ? parseInt(selectedCustomer.id) 
        : 0;

      console.log("Selected Customer:", selectedCustomer);
      console.log("Customer ID being sent:", customerIdValue);

      // Prepare receipt data
      const receiptData = {
        cartItems: cartItems.map(item => ({
          ...item,
          price: Math.round(item.price),
          id: item.id || item.barcode
        })),
        subtotal,
        discountPercentage: parsedDiscount,
        discountAmount,
        tax: taxAmount,
        totalAmount,
        paymentMethod,
        receivedAmount: receivedAmount ? Math.round(parseFloat(receivedAmount)) : "",
        payback: payback ? Math.round(payback) : 0,
        invoiceNo: generateInvoiceNo(),
        fbrInvoiceNo: generateFbrInvoiceNo(),
        shopName: "Smart Shop",
        shopAddress: "Abc Street, City, Country",
        shopPhone: "+92-308-4416769",
        currency: "Rs",
        customerName: selectedCustomer?.name || 'Walk In Customer'
      };

      // Update stock
      const stockUpdateResult = await updateStockAfterSale(receiptData, products);
      
      if (stockUpdateResult.success) {
        // Save invoice to database with customer_id
        try {
          const companyIdValue = companyId ? parseInt(companyId) : null;
          const branchIdValue = selectedBranchId ? parseInt(selectedBranchId) : null;
          
          const description = `POS Sale - ${paymentMethod} payment`;
          
          console.log("Calling createSalesInvoice with customer_id:", customerIdValue);
          
          // 👇 CUSTOMER_ID YAHAN SEND KARO
          await createSalesInvoice(
            customerIdValue, // 👈 YEH CUSTOMER ID HAI
            new Date(),
            description,
            totalAmount,
            0,
            companyIdValue,
            branchIdValue,
            itemsForApi,
            paymentMethod,
            receivedAmount ? Math.round(parseFloat(receivedAmount)) : 0,
            payback ? Math.round(payback) : 0,
            'POS'
          );
          
          console.log(`✅ Sale completed for customer ID: ${customerIdValue}`);
          
        } catch (invoiceError) {
          console.error('Failed to save invoice:', invoiceError);
          showToast('Sale completed but invoice was not saved', 'warning');
        }

        // Print receipt and clear cart
        printReceipt(receiptData);
        setCartItems([]);
        setReceivedAmount("");
        
        showToast(`Sale completed successfully! Invoice: ${receiptData.invoiceNo}`, 'success');
        
        if (onRefreshProducts) {
          setTimeout(() => onRefreshProducts(), 500);
        }
      } else {
        const failedItems = stockUpdateResult.failed || [];
        if (failedItems.length > 0) {
          const errorMsg = failedItems.map(f => `${f.product}: ${f.reason}`).join('\n');
          showToast(`Stock update failed:\n${errorMsg}`, 'error');
        } else {
          showToast(stockUpdateResult.message || "Failed to update stock", 'error');
        }
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      showToast("An error occurred while processing the sale", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-lightGreyColor rounded-xl h-full flex flex-col overflow-hidden shadow-lg border">
      {/* Customer Info Header - Show selected customer */}
      {selectedCustomer && (
        <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <span className="font-medium">Customer:</span>
            <span>{selectedCustomer.name}</span>
            {selectedCustomer.phone && (
              <>
                <span className="text-gray-400">|</span>
                <span>{selectedCustomer.phone}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast}
        />
      )}

      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-primary">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xs sm:text-sm md:text-base text-secondary">
            Cart Items ({cartItems.length})
          </h2>
          <button
            onClick={handleDelete}
            disabled={!isAnySelected || isProcessing}
            className={`rounded-lg transition-colors ${
              isAnySelected && !isProcessing
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
              disabled={isProcessing}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-red-500 cursor-pointer rounded"
            />
            <span className="text-xs sm:text-sm text-gray-500">Select All</span>
          </div>
        )}
      </div>

      {/* Cart Items */}
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
                  disabled={isProcessing}
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
                      disabled={isProcessing}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs sm:text-sm flex-shrink-0 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-xs sm:text-sm font-medium w-5 sm:w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.barcode, 1)}
                      disabled={isProcessing}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xs sm:text-sm flex-shrink-0 disabled:opacity-50"
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

      {/* Checkout Section */}
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
                  disabled={isProcessing}
                  className="w-10 sm:w-12 p-1 border border-gray-300 rounded text-center text-xs sm:text-sm"
                  placeholder="2"
                />
                <span className="text-red-500 text-xs sm:text-sm font-medium">
                  -Rs {discountAmount}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Tax ({taxPercentage}%)</span>
              <span className="font-medium">Rs {taxAmount}</span>
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                disabled={isProcessing}
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
              disabled={isProcessing || cartItems.length === 0}
              className={`w-full bg-red-500 text-white py-2 sm:py-3 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm sm:text-base mt-1 sm:mt-2 ${
                isProcessing || cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing ? "Processing..." : "Print Receipt"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;