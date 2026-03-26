/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import deleteIcon from "/public/ic_delete_button.png";
import { printReceipt } from "./../common/PrintReceipt";
import { updateStockAfterSale } from "../../core/services/api/updateStock";
import Toast from "./../common/Toast"; 
import { createSalesInvoice } from "../../api/salesInvoiceApi";
import { getCustomers } from "../../api/customerApi";
import { User, ChevronDown, CreditCard, TrendingUp } from "lucide-react";

const OrderSummary = ({ 
  scannedBarcode, 
  onBarcodeProcessed, 
  products = [],
  onRefreshProducts,
  selectedCustomer: propSelectedCustomer,
  onCustomerSelect 
}) => {
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); 
  
  // Customer dropdown states
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [localSelectedCustomer, setLocalSelectedCustomer] = useState(propSelectedCustomer || null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const customerDropdownRef = useRef(null);
  
  const scrollContainerRef = useRef(null);
  const quantityInputRefs = useRef({});

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Hide toast function
  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Load customers from API
  const loadCustomers = async (isInitialLoad = false) => {
    setLoadingCustomers(true);
    try {
      const response = await getCustomers();
      const customersData = response?.data || response || [];
      setCustomers(customersData);
      console.log("Loaded customers:", customersData);
      
      if (isInitialLoad && customersData.length > 0 && !propSelectedCustomer && !localSelectedCustomer) {
        const firstCustomer = customersData[0];
        const defaultCustomer = {
          id: firstCustomer.customer_id,
          name: firstCustomer.customer_name,
          phone: firstCustomer.phone,
          email: firstCustomer.email,
          address: firstCustomer.address,
          city: firstCustomer.city,
          type: firstCustomer.customer_type || 'debit',
          icon: firstCustomer.customer_type === 'credit' ? TrendingUp : CreditCard
        };
        
        console.log("✅ Auto-selecting first customer:", defaultCustomer);
        setLocalSelectedCustomer(defaultCustomer);
        if (onCustomerSelect) onCustomerSelect(defaultCustomer);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load customers on mount
  useEffect(() => {
    loadCustomers(true);
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    if (propSelectedCustomer) {
      setLocalSelectedCustomer(propSelectedCustomer);
    }
  }, [propSelectedCustomer]);

  // Load customers when dropdown opens
  useEffect(() => {
    if (isCustomerDropdownOpen) {
      loadCustomers(false);
    }
  }, [isCustomerDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create product lookup database
  const productDatabase = React.useMemo(() => {
    const db = {};
    products.forEach(product => {
      const barcode = product.bar_code || product.barcode;
      if (barcode) {
        db[barcode] = {
          id: product.product_id || product.id,
          barcode: barcode,
          title: product.product_name || product.title,
          uom: product.uom_name || "Pieces",
          desc: product.description || product.desc || "",
          price: Math.round(parseFloat(product.price) || 0),
          image: product.image_url || product.image || "/img_category.webp",
          quantity: parseFloat(product.quantity) || 0
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

  // Update input values when cartItems change
  useEffect(() => {
    cartItems.forEach(item => {
      if (quantityInputRefs.current[item.barcode]) {
        quantityInputRefs.current[item.barcode].value = item.quantity;
      }
    });
  }, [cartItems]);

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

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    const selectedCustomerData = {
      id: customer.customer_id,
      name: customer.customer_name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      type: customer.customer_type || 'debit',
      icon: customer.customer_type === 'credit' ? TrendingUp : CreditCard
    };
    
    console.log("Customer selected:", selectedCustomerData);
    setLocalSelectedCustomer(selectedCustomerData);
    if (onCustomerSelect) onCustomerSelect(selectedCustomerData);
    setIsCustomerDropdownOpen(false);
  };

  // Get selected customer details for display
  const selectedCustomerDetails = localSelectedCustomer ? {
    id: localSelectedCustomer.id,
    name: localSelectedCustomer.name,
    phone: localSelectedCustomer.phone,
    icon: localSelectedCustomer.icon || (localSelectedCustomer.type === 'credit' ? TrendingUp : CreditCard)
  } : null;

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

  // Handle quantity change with buttons
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

  // Handle manual quantity change - clears on click, user enters manually
  const handleManualQuantityChange = (barcode, e) => {
    const item = cartItems.find(i => i.barcode === barcode);
    if (!item) return;
    
    let newQuantity = parseInt(e.target.value);
    
    // If empty string (user cleared the field)
    if (e.target.value === "") {
      return; // Keep empty until user types
    }
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    
    const stockCheck = checkStockAvailability(item, newQuantity);
    if (!stockCheck.available) {
      showToast(`Only ${stockCheck.currentStock} ${item.title} available in stock!`, 'warning');
      // Reset to current quantity
      if (quantityInputRefs.current[barcode]) {
        quantityInputRefs.current[barcode].value = item.quantity;
      }
      return;
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Handle quantity input focus - clear the field for user to type
  const handleQuantityFocus = (barcode, e) => {
    e.target.value = "";
  };

  // Handle quantity input blur - restore if empty
  const handleQuantityBlur = (barcode, e) => {
    const item = cartItems.find(i => i.barcode === barcode);
    if (!item) return;
    
    if (e.target.value === "") {
      e.target.value = item.quantity;
    }
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

      const customerIdValue = localSelectedCustomer?.id && localSelectedCustomer.id !== 'walkin' 
        ? parseInt(localSelectedCustomer.id) 
        : 0;

      console.log("Selected Customer:", localSelectedCustomer);
      console.log("Customer ID being sent:", customerIdValue);

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
        customerName: localSelectedCustomer?.name || 'Walk In Customer'
      };

      const stockUpdateResult = await updateStockAfterSale(receiptData, products);
      
      if (stockUpdateResult.success) {
        try {
          const companyIdValue = companyId ? parseInt(companyId) : null;
          const branchIdValue = selectedBranchId ? parseInt(selectedBranchId) : null;
          const description = `POS Sale - ${paymentMethod} payment`;
          
          await createSalesInvoice(
            customerIdValue,
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
    <div className="bg-lightGreyColor rounded-xl h-full flex flex-col overflow-hidden shadow-lg border border-gray-300">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast}
        />
      )}

      {/* Header */}
      <div className="p-2 sm:p-3 border-b bg-primary">
        <div className="flex justify-between items-center gap-2">
          <h2 className="font-semibold text-xs sm:text-sm text-secondary whitespace-nowrap">
            Cart ({cartItems.length})
          </h2>
          
          {/* Customer Dropdown */}
          <div className="flex-1 max-w-[180px] sm:max-w-[220px]" ref={customerDropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                className="flex items-center justify-between w-full px-2 py-1 rounded-lg bg-white hover:bg-gray-50 transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                type="button"
              >
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {selectedCustomerDetails ? (
                    <>
                      <selectedCustomerDetails.icon size={12} className="text-gray-600 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-gray-700 truncate">
                        {selectedCustomerDetails.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <User size={12} className="text-gray-500 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-gray-600 truncate">
                        Customer
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown 
                  size={10} 
                  className={`text-gray-500 flex-shrink-0 ml-1 transition-transform duration-200 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {/* Dropdown Menu */}
              {isCustomerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-64 overflow-y-auto">
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 border-b border-gray-100 sticky top-0 bg-white">
                    SELECT CUSTOMER
                  </div>
                  
                  {loadingCustomers ? (
                    <div className="px-3 py-4 text-[10px] text-gray-500 text-center">
                      Loading...
                    </div>
                  ) : (
                    <>
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <button
                            key={customer.customer_id}
                            onClick={() => handleCustomerSelect(customer)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] sm:text-xs hover:bg-gray-50 transition-colors text-gray-700 border-b border-gray-50 last:border-b-0 ${
                              localSelectedCustomer?.id === customer.customer_id ? 'bg-red-50' : ''
                            }`}
                            type="button"
                          >
                            {customer.customer_type === 'credit' ? (
                              <TrendingUp size={12} className={localSelectedCustomer?.id === customer.customer_id ? 'text-red-500' : 'text-gray-500'} />
                            ) : (
                              <CreditCard size={12} className={localSelectedCustomer?.id === customer.customer_id ? 'text-red-500' : 'text-gray-500'} />
                            )}
                            <div className="flex-1 text-left">
                              <div className={`font-medium text-[11px] sm:text-xs ${localSelectedCustomer?.id === customer.customer_id ? 'text-red-600' : 'text-gray-700'}`}>
                                {customer.customer_name}
                              </div>
                            </div>
                            <span className={`text-[9px] px-1 py-0.5 rounded-full ${
                              customer.customer_type === 'credit' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {customer.customer_type === 'credit' ? 'Credit' : 'Debit'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-[10px] text-gray-500 text-center">
                          No customers found
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={!isAnySelected || isProcessing}
            className={`rounded-lg transition-colors flex-shrink-0 ${
              isAnySelected && !isProcessing
                ? "" 
                : "opacity-30 cursor-not-allowed"
            }`}
          >
            <img src={deleteIcon} alt="delete" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {cartItems.length > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              disabled={isProcessing}
              className="w-3 h-3 accent-red-500 cursor-pointer rounded"
            />
            <span className="text-[10px] sm:text-xs text-gray-500">Select All</span>
          </div>
        )}
      </div>

      {/* Cart Items - COMPACTED FOR MAXIMUM PRODUCTS */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ maxHeight: "calc(100vh - 380px)" }}
      >
        {cartItems.length === 0 ? (
          <p className="text-center text-secondary flex items-center justify-center h-full text-xs p-3">
            Empty Cart.
          </p>
        ) : (
          <div className="p-1.5 space-y-1">
            {cartItems.map((item) => (
              <div key={item.barcode} className="flex items-center gap-1.5 bg-white p-1.5 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => handleSelect(item.barcode)}
                  disabled={isProcessing}
                  className="w-2.5 h-2.5 accent-red-500 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {/* Product name with UOM in brackets */}
                  <div className="flex items-center gap-0.5 flex-wrap">
                    <p className="font-medium text-[11px] truncate">{item.title}</p>
                    <span className="text-[9px] text-gray-500">
                      ({item.uom})
                    </span>
                  </div>
                  {/* Quantity controls - COMPACT */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <button
                      onClick={() => handleQuantityChange(item.barcode, -1)}
                      disabled={isProcessing}
                      className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-[10px] flex-shrink-0 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      ref={(el) => quantityInputRefs.current[item.barcode] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      defaultValue={item.quantity}
                      onFocus={(e) => handleQuantityFocus(item.barcode, e)}
                      onChange={(e) => handleManualQuantityChange(item.barcode, e)}
                      onBlur={(e) => handleQuantityBlur(item.barcode, e)}
                      disabled={isProcessing}
                      className="w-7 text-center text-[10px] border border-gray-200 rounded px-0.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    <button
                      onClick={() => handleQuantityChange(item.barcode, 1)}
                      disabled={isProcessing}
                      className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-[10px] flex-shrink-0 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="font-bold text-red-500 text-[10px] whitespace-nowrap">
                  Rs {Math.round(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Section */}
      {cartItems.length > 0 && (
        <div className="p-2 sm:p-3 border-t border-gray-200 bg-white space-y-1.5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">Rs {subtotal}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={discountPercentage}
                  onChange={handleDiscountChange}
                  onBlur={handleDiscountBlur}
                  disabled={isProcessing}
                  className="w-10 p-0.5 border border-gray-300 rounded text-center text-[11px]"
                  placeholder="2"
                />
                <span className="text-red-500 text-xs font-bold">
                  -Rs {discountAmount}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Tax ({taxPercentage}%)</span>
              <span className="font-bold">Rs {taxAmount}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-1 mt-1">
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-red-500">Rs {totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Payment</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => handlePaymentMethodChange("cash")}
                    disabled={isProcessing}
                    className="accent-red-500 w-2.5 h-2.5"
                  />
                  <span className="text-[11px]">Cash</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => handlePaymentMethodChange("card")}
                    disabled={isProcessing}
                    className="accent-red-500 w-2.5 h-2.5"
                  />
                  <span className="text-[11px]">Card</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Received</span>
              <input
                type="number"
                value={receivedAmount}
                onChange={handleReceivedAmountChange}
                disabled={isProcessing}
                className="w-20 p-0.5 border border-gray-300 rounded text-xs text-right"
                min="0"
                step="1"
                placeholder="0"
              />
            </div>

            {receivedAmount && payback !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Change</span>
                <span className={payback < 0 ? "text-red-500" : "text-green-600 font-medium"}>
                  Rs {Math.abs(payback)} {payback < 0 ? "(Due)" : ""}
                </span>
              </div>
            )}

            <button 
              onClick={handlePrint}
              disabled={isProcessing || cartItems.length === 0}
              className={`w-full bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 transition-colors font-medium text-xs mt-1 ${
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