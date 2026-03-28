import { getCurrentUserId } from "@/components/security/LoginPage";
import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/sales-invoices";
const PRODUCTS_API_URL = "http://84.16.235.111:2149/api/products";

// 🔹 Get current user ID with validation
const getCurrentUserIdSafely = (): number => {
  const userId = getCurrentUserId();
  
  if (!userId || userId === null || userId === undefined || userId === 0) {
    console.error("❌ No valid user ID found! User might not be logged in.");
    // Try to get from sessionStorage as fallback
    const sessionUserId = sessionStorage.getItem("userId");
    if (sessionUserId && !isNaN(parseInt(sessionUserId))) {
      const parsedId = parseInt(sessionUserId);
      console.log("✅ Using user ID from sessionStorage:", parsedId);
      return parsedId;
    }
    
    // Try localStorage as another fallback
    const localUserId = localStorage.getItem("userId");
    if (localUserId && !isNaN(parseInt(localUserId))) {
      const parsedId = parseInt(localUserId);
      console.log("✅ Using user ID from localStorage:", parsedId);
      return parsedId;
    }
    
    console.error("❌ No valid user ID found in any storage!");
    return 1; // Default to user ID 1 as last resort (you might want to throw error instead)
  }
  
  return typeof userId === 'number' ? userId : parseInt(userId);
};

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

// 🔹 Centralized error handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('❌ Server Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      let errorMessage = `API Error: ${error.response.status}`;
      
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("No response from server. Please check your connection.");
    }
  }
  throw new Error("An unexpected error occurred.");
};

// 🔹 Get All Sales Invoices (Operation 1)
export const getSaleInvoices = async (startDate?: string, endDate?: string) => {
  try {
    const module_id = getModuleId();
    const user_id = getCurrentUserIdSafely();
    
    const requestData: any = { 
      operation: 1, 
      module_id,
      created_by: user_id
    };
    
    if (startDate && endDate) {
      requestData.start_date = startDate;
      requestData.end_date = endDate;
    }
    
    console.log("📤 Fetching sales invoices with:", requestData);
    const res = await axios.post(API_URL, requestData);
    console.log("📥 Sales invoices response:", res.data);
    
    // Handle different response structures
    let invoices = [];
    if (Array.isArray(res.data)) {
      invoices = res.data;
    } else if (res.data?.data) {
      invoices = res.data.data;
    } else {
      return [];
    }

    // Fetch all products to create a lookup map
    try {
      const productsRes = await axios.post(PRODUCTS_API_URL, {
        p_operation: 1
      });
      
      // Create a map of item_id to item_name
      const productNameMap = new Map();
      let productsList = [];
      
      if (productsRes.data?.data && Array.isArray(productsRes.data.data)) {
        productsList = productsRes.data.data;
      } else if (Array.isArray(productsRes.data)) {
        productsList = productsRes.data;
      } else if (productsRes.data?.products && Array.isArray(productsRes.data.products)) {
        productsList = productsRes.data.products;
      }
      
      productsList.forEach((product: any) => {
        const productId = product.id || product.item_id || product.product_id;
        const productName = product.name || product.item_name || product.title || product.product_name || `Product #${productId}`;
        
        if (productId) {
          productNameMap.set(productId, productName);
        }
      });

      // Enrich invoice items with product names
      invoices = invoices.map((invoice: any) => {
        if (invoice.items && Array.isArray(invoice.items)) {
          invoice.items = invoice.items.map((item: any) => ({
            ...item,
            item_name: productNameMap.get(item.item_id) || `Item #${item.item_id}`
          }));
        }
        return invoice;
      });
      
    } catch (productsError) {
      console.error("Error fetching products:", productsError);
    }

    return invoices;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// 🔹 Create Sales Invoice (Operation 2)
export const createSalesInvoice = async (
  customer_id: number, 
  invoice_date: Date,
  remarks: string,
  total_amount: number,
  commission_amount: number,
  company_id: number | null,
  branch_id: number | null,
  items: Array<{
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax: number;
    extra_discount: number;
    commission_percentge: number;
    commission_amount: number;
  }>,
  payment_method?: string,
  received_amount?: number,
  payback?: number,
  source: 'POS' | 'MANUAL' = 'MANUAL'
) => {
  try {
    const module_id = getModuleId();
    const user_id = getCurrentUserIdSafely(); // Use the safe function
    
    const formattedDate = invoice_date instanceof Date 
      ? invoice_date.toISOString().split('T')[0]
      : invoice_date;
    
    // Validate required fields
    if (!customer_id || customer_id === 0) {
      throw new Error("Customer ID is required");
    }
    
    if (!items || items.length === 0) {
      throw new Error("At least one item is required");
    }
    
    if (!user_id || user_id === 0) {
      throw new Error("User ID is required. Please log in again.");
    }
    
    const requestData = {
      operation: 2,
      customer_id: Number(customer_id),
      invoice_date: formattedDate,
      created_by: user_id, // This will now have a valid value
      updated_by: user_id, // Also set updated_by for consistency
      module_id: module_id ? Number(module_id) : null,
      company_id: company_id ? Number(company_id) : null,
      branch_id: branch_id ? Number(branch_id) : null,
      remarks: remarks || '',
      total_amount: Number(total_amount),
      commission_amount: Number(commission_amount),
      payment_method: payment_method || 'cash', 
      received_amount: received_amount ? Number(received_amount) : 0,
      payback: payback ? Number(payback) : 0,
      source: source || 'MANUAL',
      status: 'CREATED', // Add default status
      items: items.map(item => ({
        item_id: Number(item.item_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_percentage: Number(item.discount_percentage),
        discount_amount: Number(item.discount_amount),
        tax: Number(item.tax),
        extra_discount: Number(item.extra_discount),
        commission_percentge: Number(item.commission_percentge),
        commission_amount: Number(item.commission_amount)
      }))
    };
    
    console.log("📤 Creating sales invoice with data:", JSON.stringify(requestData, null, 2));
    console.log("✅ User ID being sent:", user_id);
    
    const res = await axios.post(API_URL, requestData);
    console.log("✅ Invoice created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error in createSalesInvoice:");
    handleApiError(error);
    throw error;
  }
};

// 🔹 Update Sales Invoice (Operation 3)
export const updateSalesInvoice = async (
  sales_invoice_id: number,
  customer_id: number,
  invoice_date: Date,
  remarks: string,
  total_amount: number,
  commission_amount: number,
  company_id: number,
  branch_id: number,
  items: Array<{
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax: number;
    extra_discount: number;
    commission_percentge: number;
    commission_amount: number;
  }>
) => {
  try {
    const module_id = getModuleId();
    const user_id = getCurrentUserIdSafely();
    
    const formattedDate = invoice_date instanceof Date 
      ? invoice_date.toISOString().split('T')[0]
      : invoice_date;
    
    const requestData = {
      operation: 3,
      sales_invoice_id,
      customer_id,
      invoice_date: formattedDate,
      updated_by: user_id,
      module_id,
      company_id,
      branch_id,
      remarks,
      total_amount,
      commission_amount,
      items,
    };
    
    console.log("📤 Updating sales invoice with data:", requestData);
    const res = await axios.post(API_URL, requestData);
    console.log("✅ Invoice updated successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Delete Sales Invoice (Operation 3 with delete flag)
export const deleteSalesInvoice = async (sales_invoice_id: number) => {
  try {
    const module_id = getModuleId();
    const user_id = getCurrentUserIdSafely();
    
    const requestData = {
      operation: 3,
      sales_invoice_id,
      module_id,
      updated_by: user_id,
      is_deleted: 1 // Add flag to indicate deletion
    };
    
    console.log("📤 Deleting sales invoice:", sales_invoice_id);
    const res = await axios.post(API_URL, requestData);
    console.log("✅ Invoice deleted successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Approve Multiple Sales Invoices (Operation 4)
export const approveSaleInvoices = async (sales_invoice_ids: number[]) => {
  try {
    const module_id = getModuleId();
    const user_id = getCurrentUserIdSafely();
    
    const requestData = {
      operation: 4,
      updated_by: user_id,
      module_id,
      sales_invoice_ids,
    };
    
    console.log("📤 Approving invoices:", sales_invoice_ids);
    const res = await axios.post(API_URL, requestData);
    console.log("✅ Invoices approved successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Unapprove Sales Invoices (Operation 5)
export const unapproveSaleInvoices = async (sales_invoice_ids: number[]) => {
  try {
    const module_id = getModuleId();
    const user_id = getCurrentUserIdSafely();
    
    const requestData = {
      operation: 5,
      updated_by: user_id,
      module_id,
      sales_invoice_ids,
    };
    
    console.log("📤 Unapproving invoices:", sales_invoice_ids);
    const res = await axios.post(API_URL, requestData);
    console.log("✅ Invoices unapproved successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Get Company Image/Info
export const getCompanyimg = async () => {
  try {
    const image_URL = "http://84.16.235.111:2149/api/company";
    const requestData = { operation: 1 };
    
    const res = await axios.post(image_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Get Items for Discount (if needed)
export const getItemsfordiscount = async () => {
  try {
    const module_id = getModuleId();
    const requestData = {
      operation: 1,
      module_id
    };
    
    const res = await axios.post("http://84.16.235.111:2149/api/items", requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};