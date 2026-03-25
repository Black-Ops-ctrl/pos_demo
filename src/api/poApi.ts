/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
const Items_API_URL = "http://84.16.235.111:2149/api/items";
const vendor_new = "http://84.16.235.111:2149/api/getvendors";
const API_URL = "http://84.16.235.111:2149/api/purchase-orders";
const PRODUCTS_API_URL = "http://84.16.235.111:2149/api/products";

import { getCurrentUserId } from "@/components/security/LoginPage";
const user_id = getCurrentUserId();

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

// 🔹 Centralized error handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(
        error.response.data?.message || `API Error: ${error.response.status}`
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      throw new Error("No response from server. Please check your connection.");
    }
  }
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// 🔹 Get All Purchase Orders
export const getPurchaseOrders = async (startDate?: string, endDate?: string) => {
  const module_id = getModuleId(); 
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id,
      start_date: startDate, 
      end_date: endDate,
      created_by: user_id
    });
    
    console.log("Raw API Response:", res.data);
    const purchaseOrders = res.data.data || [];
    return purchaseOrders;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Get Purchase Order by ID
export const getPurchaseOrderById = async (po_id: number) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id,
      po_id
    });
    
    const purchaseOrders = res.data.data || [];
    return purchaseOrders.find((po: any) => po.po_id === po_id);
  } catch (error) {
    console.error(`Error fetching PO #${po_id}:`, error);
    return null;
  }
};

// 🔹 Update Product Quantity in Inventory
export const updateProductQuantity = async (
  productId: number,
  quantityChange: number,
  operation: 'add' | 'subtract' = 'add'
) => {
  try {
    console.log(`Updating product ${productId}: ${operation} ${quantityChange}`);
    
    // First, get current product details
    const productResponse = await axios.post(PRODUCTS_API_URL, {
      p_operation: 1
    });
    
    let productsList = [];
    if (productResponse.data?.data && Array.isArray(productResponse.data.data)) {
      productsList = productResponse.data.data;
    } else if (Array.isArray(productResponse.data)) {
      productsList = productResponse.data;
    }
    
    // Find the specific product
    const product = productsList.find((p: any) => p.product_id === productId);
    
    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      return { success: false, message: 'Product not found' };
    }
    
    // Calculate new quantity
    const currentQuantity = parseInt(product.quantity) || 0;
    const newQuantity = operation === 'add' 
      ? currentQuantity + quantityChange 
      : Math.max(0, currentQuantity - quantityChange);
    
    console.log(`Product ${productId}: Current=${currentQuantity}, ${operation}=${quantityChange}, New=${newQuantity}`);
    
    // Update the product quantity using FormData
    const formData = new FormData();
    formData.append('p_operation', '3');
    formData.append('p_product_id', productId.toString());
    formData.append('p_product_name', product.product_name || '');
    formData.append('p_category', product.category_id?.toString() || '');
    formData.append('p_quantity', newQuantity.toString());
    formData.append('p_price', product.price?.toString() || '0');
    formData.append('p_bar_code', product.bar_code || '');
    formData.append('p_description', product.description || '');
    formData.append('p_status', product.status || 'CREATED');
    formData.append('p_product_code', product.product_code || '');
    formData.append('p_account_id', '1');
    formData.append('p_purchase_account_id', '2');
    formData.append('p_sale_account_id', '3');
    formData.append('p_website_chk', 'N');
    formData.append('p_updated_by', user_id?.toString() || '1');
    
    const updateResponse = await axios.post(PRODUCTS_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("Quantity update response:", updateResponse.data);
    return { 
      success: true, 
      message: `Product quantity ${operation === 'add' ? 'increased' : 'decreased'} successfully`,
      newQuantity 
    };
    
  } catch (error) {
    console.error("Error updating product quantity:", error);
    return { success: false, message: error.message };
  }
};

// 🔹 Insert Purchase Order - UPDATED with warehouse_id
export const createPurchaseOrder = async (
  branch_id: number,
  flock_id: number,
  vendor_id: number,
  total_amount: number,
  items: {
    item_id: number; 
    item_name?: string;
    item_code?: string;
    quantity: number; 
    unit_price: number;
    uom_id?: number;
    uom_name?: string;
    discount: number;
    discount_percentage: number;
  }[],
  order_date: string,
  vehicle_no?: string,
  warehouse_id?: number  // ✅ NEW PARAMETER
) => {
  const module_id = getModuleId();
  try {
    console.log("Sending to API:", {
      operation: 2,
      order_date,
      branch_id,
      flock_id, 
      vendor_id,
      total_amount,
      module_id,
      created_by: user_id,
      vehicle_no,
      warehouse_id,  // ✅ Added to log
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name || '',
        item_code: item.item_code || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        uom_id: item.uom_id,
        uom_name: item.uom_name || '',
        discount: item.discount,
        discount_percentage: item.discount_percentage
      }))
    });

    const res = await axios.post(API_URL, {
      operation: 2,
      order_date,
      branch_id,
      flock_id, 
      vendor_id: vendor_id,
      total_amount,
      module_id: module_id,
      created_by: user_id,
      vehicle_no,
      warehouse_id: warehouse_id || null,  // ✅ ADDED warehouse_id
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name || '',     
        item_code: item.item_code || '',     
        quantity: item.quantity,
        unit_price: item.unit_price,
        uom_id: item.uom_id,
        uom_name: item.uom_name || '',     
        discount: item.discount,
        discount_percentage: item.discount_percentage
      })),
    });

    console.log("Create PO Response:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("Create PO Error:", error);
    handleApiError(error);
  }
};

// 🔹 Update Purchase Order - UPDATED with warehouse_id
export const updatePurchaseOrder = async (
  po_id: number,
  branch_id: number,
  flock_id: number,
  vendor_id: number,
  status: string,
  total_amount: number,
  items: { 
    item_id: number; 
    item_name?: string;        
    item_code?: string;       
    quantity: number; 
    unit_price: number;
    uom_id?: number;
    uom_name?: string;         
    discount: number;
    discount_percentage?: number;
  }[],
  order_date: string,
  vehicle_no?: string,
  warehouse_id?: number  // ✅ NEW PARAMETER
) => {  
  const module_id = getModuleId();
  try {
    console.log("Updating PO with items:", items.map(item => ({
      item_id: item.item_id,
      item_name: item.item_name,
      uom_id: item.uom_id,
      uom_name: item.uom_name
    })));

    const res = await axios.post(API_URL, {
      operation: 3,
      branch_id,
      flock_id,
      po_id,
      vendor_id: vendor_id,
      total_amount,
      module_id: module_id, 
      status,
      updated_by: user_id,
      order_date,
      vehicle_no,
      warehouse_id: warehouse_id || null,  // ✅ ADDED warehouse_id
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name || '',     
        item_code: item.item_code || '',     
        quantity: item.quantity,
        unit_price: item.unit_price,
        uom_id: item.uom_id,
        uom_name: item.uom_name || '',       
        discount: item.discount,
        discount_percentage: item.discount_percentage
      })),
    });
    return res.data.data;
  } catch (error) {
    console.error("Update PO Error:", error);
    handleApiError(error);
  }
};

// 🔹 Bulk Update Purchase Order Statuses with Inventory Update
export const UpdatePOStatus = async (
  po_ids: number[],
  status: string
) => {
  const module_id = getModuleId();
  const current_user_id = getCurrentUserId();
  
  try {
    console.log("UpdatePOStatus called with:", { po_ids, status, module_id, updated_by: current_user_id });
    
    // If approving, update inventory for each PO
    if (status === 'APPROVED') {
      console.log("PO is being approved - updating inventory");
      
      for (const po_id of po_ids) {
        const poDetails = await getPurchaseOrderById(po_id);
        if (poDetails && poDetails.items && poDetails.items.length > 0) {
          console.log(`Updating inventory for PO #${po_id}:`, poDetails.items);
          
          for (const item of poDetails.items) {
            const result = await updateProductQuantity(
              item.item_id,
              item.quantity,
              'add'
            );
            
            if (result.success) {
              console.log(`✅ Product ${item.item_id} quantity increased by ${item.quantity}`);
            } else {
              console.error(`❌ Failed to update product ${item.item_id}:`, result.message);
            }
          }
        }
      }
    }
    
    // Update PO status
    const res = await axios.post(API_URL, {
      operation: 5,
      module_id: module_id,
      po_ids,
      status,
      updated_by: current_user_id,
      user_id: current_user_id
    });
    
    console.log("UpdatePOStatus response:", res.data);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update New Purchase Order Status
export const UpdateNewPOStatus = async (
  po_ids: number[],
  status: string
) => {
  const module_id = getModuleId();
  const current_user_id = getCurrentUserId();
  
  try {
    console.log("UpdateNewPOStatus called with:", { po_ids, status, module_id, updated_by: current_user_id });
    
    // If approving, update inventory
    if (status === 'APPROVED') {
      console.log("PO is being approved - updating inventory");
      
      for (const po_id of po_ids) {
        const poDetails = await getPurchaseOrderById(po_id);
        if (poDetails && poDetails.items && poDetails.items.length > 0) {
          console.log(`Updating inventory for PO #${po_id}:`, poDetails.items);
          
          for (const item of poDetails.items) {
            const result = await updateProductQuantity(
              item.item_id,
              item.quantity,
              'add'
            );
            
            if (result.success) {
              console.log(`✅ Product ${item.item_id} quantity increased by ${item.quantity}`);
            } else {
              console.error(`❌ Failed to update product ${item.item_id}:`, result.message);
            }
          }
        }
      }
    }
    
    const res = await axios.post(API_URL, {
      operation: 5,
      module_id: module_id,
      po_ids,
      status,
      updated_by: current_user_id,
      user_id: current_user_id
    });
    
    console.log("UpdateNewPOStatus response:", res.data);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Delete Purchase Order
export const deletePurchaseOrder = async (po_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 7,
      po_id,
      updated_by: user_id
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Get Items for Discount
export const getItemsfordiscount = async (branch_id: number) => {
  const module_id = getModuleId();
  
  try {
    const res = await axios.post(Items_API_URL, { 
      operation: 1,
      module_id,
      branch_id,
    });
    console.log("API Response for branch", branch_id, ":", res.data);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getnewVendors = async () => {
  try {
    const res = await axios.post(vendor_new, {});
    console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPurchaseOrdersinvoice = async () => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, { operation: 6, module_id: module_id });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};