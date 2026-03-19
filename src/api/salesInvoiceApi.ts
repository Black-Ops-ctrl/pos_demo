import { getCurrentUserId } from "@/components/security/LoginPage";
import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/sales-invoices";
const PRODUCTS_API_URL = "http://84.16.235.111:2140/api/products";
const user_id = getCurrentUserId();

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

// 🔹 Centralized error handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
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
    const requestData: any = { 
      operation: 1, 
      module_id,
      created_by: user_id
    };
    
    if (startDate && endDate) {
      requestData.start_date = startDate;
      requestData.end_date = endDate;
    }
    
    const res = await axios.post(API_URL, requestData);
    
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

// 🔹 Create Sales Invoice (Operation 2) - SIRF CUSTOMER_ID ADD KI HAI
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
    
    const formattedDate = invoice_date instanceof Date 
      ? invoice_date.toISOString().split('T')[0]
      : invoice_date;
    
    const requestData = {
      operation: 2,
      customer_id,
      invoice_date: formattedDate,
      created_by: user_id,
      module_id,
      company_id,
      branch_id,
      remarks,
      total_amount,
      commission_amount,
      payment_method: payment_method || 'cash', 
      received_amount: received_amount || 0,
      payback: payback || 0,
      source,
      items,
    };
    
    console.log("Creating sales invoice with data:", requestData);
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
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
    
    const res = await axios.post(API_URL, requestData);
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
    const requestData = {
      operation: 4,
      updated_by: user_id,
      module_id,
      sales_invoice_ids,
    };
    
    const res = await axios.post(API_URL, requestData);
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
    const requestData = {
      operation: 5,
      updated_by: user_id,
      module_id,
      sales_invoice_ids,
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Delete Sales Invoice (Operation 3)
export const deleteSalesInvoice = async (sales_invoice_id: number) => {
  try {
    const module_id = getModuleId();
    const requestData = {
      operation: 3,
      sales_invoice_id,
      module_id,
      updated_by: user_id
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Get Company Image/Info
export const getCompanyimg = async () => {
  try {
    const image_URL = "http://84.16.235.111:2140/api/company";
    const requestData = { operation: 1 };
    
    const res = await axios.post(image_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};