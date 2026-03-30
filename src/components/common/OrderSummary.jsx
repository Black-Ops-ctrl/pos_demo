/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { printReceipt } from "./../common/PrintReceipt";
import { updateStockAfterSale } from "../../core/services/api/updateStock";
import Toast from "./../common/Toast"; 
import { createSalesInvoice } from "../../api/salesInvoiceApi";
import { getCustomers } from "../../api/customerApi";

// Import icons individually to avoid issues
import { User, ChevronDown, CreditCard, TrendingUp, ShoppingCart, Banknote, Printer, Trash2 } from "lucide-react";

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
  const [discountPercentage, setDiscountPercentage] = useState("");
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
  const discountInputRef = useRef(null);

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
          icon: firstCustomer.customer_type === 'credit' ? 'TrendingUp' : 'CreditCard'
        };
        
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
      icon: customer.customer_type === 'credit' ? 'TrendingUp' : 'CreditCard'
    };
    
    setLocalSelectedCustomer(selectedCustomerData);
    if (onCustomerSelect) onCustomerSelect(selectedCustomerData);
    setIsCustomerDropdownOpen(false);
  };

  // Get selected customer details for display
  const selectedCustomerDetails = localSelectedCustomer ? {
    id: localSelectedCustomer.id,
    name: localSelectedCustomer.name,
    phone: localSelectedCustomer.phone,
    type: localSelectedCustomer.type
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
    if (!item) return;
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

  // Handle manual quantity change
  const handleManualQuantityChange = (barcode, e) => {
    const item = cartItems.find(i => i.barcode === barcode);
    if (!item) return;
    
    let newQuantity = parseInt(e.target.value);
    
    if (e.target.value === "") {
      return;
    }
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    
    const stockCheck = checkStockAvailability(item, newQuantity);
    if (!stockCheck.available) {
      showToast(`Only ${stockCheck.currentStock} ${item.title} available in stock!`, 'warning');
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

  const handleQuantityFocus = (barcode, e) => {
    e.target.value = "";
  };

  const handleQuantityBlur = (barcode, e) => {
    const item = cartItems.find(i => i.barcode === barcode);
    if (!item) return;
    if (e.target.value === "") {
      e.target.value = item.quantity;
    }
  };

  const handleReceivedAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setReceivedAmount(value);
    }
  };

  // Handle discount change - now clears field on focus for easy typing
  const handleDiscountChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setDiscountPercentage(value);
    }
  };

  const handleDiscountFocus = (e) => {
    // Clear the field when user clicks on it
    e.target.value = "";
    setDiscountPercentage("");
  };

  const handleDiscountBlur = () => {
    // If field is empty after blur, set to 0
    if (discountPercentage === "" || discountPercentage === "0") {
      setDiscountPercentage("0");
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Calculations
  const subtotal = Math.round(
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const parsedDiscount = discountPercentage === "" ? 0 : parseFloat(discountPercentage) || 0;
  const discountAmount = Math.round((subtotal * parsedDiscount) / 100);
  const taxPercentage = 0;
  const taxAmount = 0;
  const totalAmount = Math.round(subtotal - discountAmount);
  const payback = receivedAmount && Math.round(parseFloat(receivedAmount) - totalAmount);
  const isAnySelected = cartItems.some((item) => item.selected);
  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  const generateInvoiceNo = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };

  const generateFbrInvoiceNo = () => {
    return `FBR-${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
  };

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
        item_id: parseInt(item.id),
        quantity: parseInt(item.quantity),
        unit_price: Math.round(parseFloat(item.price)),
        discount_percentage: parseFloat(parsedDiscount),
        discount_amount: Math.round((item.price * item.quantity * parsedDiscount) / 100),
        tax: parseFloat(taxPercentage),
        extra_discount: 0,
        commission_percentge: 0,
        commission_amount: 0
      }));

      const customerIdValue = localSelectedCustomer?.id && localSelectedCustomer.id !== 'walkin' 
        ? parseInt(localSelectedCustomer.id) 
        : 0;

      if (customerIdValue === 0) {
        showToast("Please select a customer!", 'warning');
        setIsProcessing(false);
        return;
      }

      if (itemsForApi.length === 0) {
        showToast("No items in cart!", 'warning');
        setIsProcessing(false);
        return;
      }

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
          
          printReceipt(receiptData);
          setCartItems([]);
          setReceivedAmount("");
          setDiscountPercentage("0");
          
          showToast(`Sale completed successfully! Invoice: ${receiptData.invoiceNo}`, 'success');
          
          if (onRefreshProducts) {
            setTimeout(() => onRefreshProducts(), 500);
          }
        } catch (invoiceError) {
          console.error('Failed to save invoice:', invoiceError);
          showToast('Sale completed but invoice was not saved: ' + (invoiceError.message || 'Unknown error'), 'warning');
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
      showToast("An error occurred while processing the sale: " + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to render icon
  const renderIcon = (IconComponent, size, className) => {
    if (!IconComponent) return null;
    try {
      return React.createElement(IconComponent, { size, className });
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden border border-gray-200">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast}
        />
      )}

      {/* Header */}
      <div className="px-3 pt-2 pb-1 border-b border-gray-100 bg-white">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5">
            {renderIcon(ShoppingCart, 16, "text-blue-900")}
            <h2 className="font-semibold text-sm">
              Cart <span className="text-blue-900">({cartItems.length})</span>
            </h2>
          </div>
          
          {/* Customer Dropdown */}
          <div className="relative" ref={customerDropdownRef}>
            <button
              onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
              className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full text-xs border border-gray-200 hover:bg-gray-100 transition-colors"
              type="button"
            >
              {selectedCustomerDetails ? (
                <>
                  {renderIcon(User, 12, "text-gray-600")}
                  <span className="font-medium text-gray-700 max-w-[100px] truncate text-xs">
                    {selectedCustomerDetails.name}
                  </span>
                </>
              ) : (
                <>
                  {renderIcon(User, 12, "text-gray-500")}
                  <span className="text-gray-600 text-xs">Customer</span>
                </>
              )}
              {renderIcon(ChevronDown, 12, "text-gray-400")}
            </button>
            
            {/* Dropdown Menu */}
            {isCustomerDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-56 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 border-b border-gray-100">
                  SELECT CUSTOMER
                </div>
                
                {loadingCustomers ? (
                  <div className="px-2 py-1.5 text-[10px] text-gray-500 text-center">Loading...</div>
                ) : (
                  <>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <button
                          key={customer.customer_id}
                          onClick={() => handleCustomerSelect(customer)}
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                            localSelectedCustomer?.id === customer.customer_id ? 'bg-blue-50' : ''
                          }`}
                          type="button"
                        >
                          {customer.customer_type === 'credit' ? (
                            renderIcon(TrendingUp, 10, localSelectedCustomer?.id === customer.customer_id ? 'text-blue-900' : 'text-gray-500')
                          ) : (
                            renderIcon(CreditCard, 10, localSelectedCustomer?.id === customer.customer_id ? 'text-blue-900' : 'text-gray-500')
                          )}
                          <div className="flex-1 text-left">
                            <div className={`font-medium text-[11px] ${localSelectedCustomer?.id === customer.customer_id ? 'text-blue-900' : 'text-gray-700'}`}>
                              {customer.customer_name}
                            </div>
                          </div>
                          <span className={`text-[8px] px-1 py-0.5 rounded-full ${
                            customer.customer_type === 'credit' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {customer.customer_type === 'credit' ? 'Credit' : 'Debit'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-[10px] text-gray-500 text-center">No customers found</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Select All Row */}
        {cartItems.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              disabled={isProcessing}
              className="w-3.5 h-3.5 accent-blue-900 cursor-pointer rounded"
            />
            <span className="text-[11px] text-gray-600">Select All</span>
            {isAnySelected && (
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 text-blue-900 rounded-md text-[11px] font-medium transition-colors border border-blue-200"
              >
                {renderIcon(Trash2, 12, "")}
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 bg-gray-50"
      >
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-400 py-8 flex flex-col items-center gap-1">
            {renderIcon(ShoppingCart, 36, "text-gray-300")}
            <p className="text-xs">Empty Cart</p>
            <p className="text-[10px] text-gray-400">Scan or search products to add</p>
          </div>
        ) : (
          <div className="space-y-1 p-1.5">
            {cartItems.map((item) => (
              <div key={item.barcode} className="bg-white p-1.5 shadow-sm border border-gray-100 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => handleSelect(item.barcode)}
                  disabled={isProcessing}
                  className="w-3.5 h-3.5 accent-blue-900 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <p className="font-medium text-[11px] truncate">{item.title}</p>
                      <span className="text-[9px] text-gray-400">({item.uom})</span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleQuantityChange(item.barcode, -1)}
                        disabled={isProcessing}
                        className="w-5 h-5 bg-red-500 rounded-full flex text-white items-center justify-center  text-[12px] flex-shrink-0 disabled:opacity-50 transition-colors"
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
                        className="w-8 text-center text-[10px] border border-gray-200 rounded px-0.5 py-0 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.barcode, 1)}
                        disabled={isProcessing}
                        className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center  text-[12px] flex-shrink-0 disabled:opacity-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-900 text-[11px]">
                    Rs {Math.round(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Section - REDUCED GAPS between subtotal to received and smaller button */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-3 py-1.5 space-y-1">
          {/* Summary - reduced gap */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">Rs {subtotal}</span>
            </div>
            
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  <input
                    ref={discountInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={discountPercentage}
                    onChange={handleDiscountChange}
                    onFocus={handleDiscountFocus}
                    onBlur={handleDiscountBlur}
                    disabled={isProcessing}
                    className="w-10 px-1 py-0 border border-gray-300 rounded text-center text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-300"
                    placeholder="0"
                  />
                  <span className="text-gray-600 text-[10px]">%</span>
                </div>
                <span className="text-blue-900  text-[11px] font-semibold">
                  -Rs {discountAmount}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">Rs 0</span>
            </div>
            
            <div className="border-t border-gray-200 pt-0.5 mt-0.5">
              <div className="flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span className="text-blue-900">Rs {totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods - reduced gap */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-gray-600">Payment</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handlePaymentMethodChange("cash")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  paymentMethod === "cash"
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isProcessing}
              >
                {renderIcon(Banknote, 10, "")}
                Cash
              </button>
              <button
                onClick={() => handlePaymentMethodChange("card")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  paymentMethod === "card"
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isProcessing}
              >
                {renderIcon(CreditCard, 10, "")}
                Card
              </button>
            </div>
          </div>

          {/* Received Amount - reduced gap */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-gray-600">Received</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-[10px]">Rs</span>
              <input
                type="number"
                value={receivedAmount}
                onChange={handleReceivedAmountChange}
                disabled={isProcessing}
                className="w-20 px-2 py-0.5 border border-gray-300 rounded text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-blue-300"
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
          </div>

          {/* Change - reduced gap */}
          {receivedAmount && payback !== undefined && (
            <div className="flex justify-between text-[10px] py-0.5 px-1.5 bg-gray-50 rounded mt-0.5">
              <span className="text-gray-600">Change</span>
              <span className={payback < 0 ? "text-blue-900 font-semibold" : "text-green-600 font-semibold"}>
                Rs {Math.abs(payback)} {payback < 0 ? "(Due)" : ""}
              </span>
            </div>
          )}

          {/* Print Button - smaller size */}
          <button 
            onClick={handlePrint}
            disabled={isProcessing || cartItems.length === 0}
            className={`w-full bg-blue-900 text-white py-1 rounded-lg font-medium text-[11px] transition-all flex items-center justify-center gap-1 mt-1 ${
              isProcessing || cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-900"
            }`}
          >
            {renderIcon(Printer, 12, "")}
            {isProcessing ? "Processing..." : "Print Receipt"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;