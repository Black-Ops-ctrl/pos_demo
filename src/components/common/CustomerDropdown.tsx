import React, { useState, useEffect, useRef } from "react";
import { User, ChevronDown, CreditCard, TrendingUp } from "lucide-react";
import { getCustomers } from "../../api/customerApi";

const CustomerDropdown = ({ selectedCustomer, onCustomerSelect }) => {
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [localSelectedCustomer, setLocalSelectedCustomer] = useState(selectedCustomer || null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const dropdownRef = useRef(null);

  // Load customers from API
  const loadCustomers = async (isInitialLoad = false) => {
    setLoadingCustomers(true);
    try {
      const response = await getCustomers();
      const customersData = response?.data || response || [];
      setCustomers(customersData);
      console.log("Loaded customers:", customersData);
      
      // Auto-select first customer on initial load
      if (isInitialLoad && customersData.length > 0 && !selectedCustomer) {
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
        onCustomerSelect(defaultCustomer);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoadingCustomers(false);
      setInitialLoadDone(true);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    loadCustomers(true);
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    if (selectedCustomer) {
      setLocalSelectedCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  // Refresh customers when dropdown opens
  useEffect(() => {
    if (isCustomerDropdownOpen) {
      loadCustomers(false);
    }
  }, [isCustomerDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    onCustomerSelect(selectedCustomerData);
    setIsCustomerDropdownOpen(false);
  };

  // Get selected customer details for display
  const getSelectedCustomerDetails = () => {
    if (!localSelectedCustomer) return null;
    
    return {
      id: localSelectedCustomer.id,
      name: localSelectedCustomer.name,
      phone: localSelectedCustomer.phone,
      icon: localSelectedCustomer.icon || (localSelectedCustomer.type === 'credit' ? TrendingUp : CreditCard)
    };
  };

  const selectedCustomerDetails = getSelectedCustomerDetails();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
        className="flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        type="button"
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedCustomerDetails ? (
            <>
              <selectedCustomerDetails.icon size={16} className="text-red-500" />
              <span className="text-xs sm:text-sm font-medium truncate">
                {selectedCustomerDetails.name}
              </span>
              {selectedCustomerDetails.phone && (
                <span className="text-xs text-gray-500 hidden sm:inline">
                  ({selectedCustomerDetails.phone})
                </span>
              )}
            </>
          ) : (
            <>
              <User size={16} className="text-gray-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Select Customer
              </span>
            </>
          )}
        </div>
        <ChevronDown 
          size={14} 
          className={`text-gray-500 transition-transform duration-200 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Dropdown Menu */}
      {isCustomerDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 sticky top-0 bg-white">
            SELECT CUSTOMER
          </div>
          
          {/* Loading State */}
          {loadingCustomers ? (
            <div className="px-4 py-8 text-xs text-gray-500 text-center">
              Loading customers...
            </div>
          ) : (
            <>
              {/* Customers List */}
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <button
                    key={customer.customer_id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700 border-b border-gray-50 last:border-b-0 ${
                      localSelectedCustomer?.id === customer.customer_id ? 'bg-red-50' : ''
                    }`}
                    type="button"
                  >
                    {customer.customer_type === 'credit' ? (
                      <TrendingUp size={16} className={localSelectedCustomer?.id === customer.customer_id ? 'text-red-500' : 'text-gray-500'} />
                    ) : (
                      <CreditCard size={16} className={localSelectedCustomer?.id === customer.customer_id ? 'text-red-500' : 'text-gray-500'} />
                    )}
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${localSelectedCustomer?.id === customer.customer_id ? 'text-red-600' : 'text-gray-700'}`}>
                        {customer.customer_name}
                      </div>
                      {customer.phone && (
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                      )}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      customer.customer_type === 'credit' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {customer.customer_type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-xs text-gray-500 text-center">
                  No customers found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDropdown;