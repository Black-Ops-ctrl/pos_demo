/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { fetchProducts } from "@/core/services/api/fetchProducts";

const PURCHASE_API_URL = "http://84.16.235.111:2140/api/purchase-orders";
const SALES_API_URL = "http://84.16.235.111:2140/api/sales-invoices";

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

// 🔹 Handle API errors
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("No response from server");
    }
  }
  throw new Error("Unexpected error");
};

// 🔹 Get all products with their sale prices
export const getAllProductsWithPrices = async () => {
  try {
    const productsList = await fetchProducts();
    
    // Create a map of item_id to product details including sale price
    const productMap = new Map();
    productsList.forEach((prod: any) => {
      const prodId = prod.product_id || prod.id || prod.item_id;
      if (prodId) {
        productMap.set(prodId, {
          name: prod.product_name || prod.name || prod.title || `Product #${prodId}`,
          sale_price: parseFloat(prod.price) || 0, // Sale price from products API
          id: prodId
        });
      }
    });
    
    console.log("Product map created with sale prices:", productMap);
    return productMap;
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Map();
  }
};

// 🔹 Get Purchase Orders by date range (to get purchase rates)
export const getPurchaseOrdersByDate = async (start_date: string, end_date: string) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(PURCHASE_API_URL, { 
      operation: 1,
      module_id,
      start_date: start_date, 
      end_date: end_date
    });
    
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return [];
  }
};

// 🔹 Get Sales Invoices by date range (to get sold quantities)
export const getSalesInvoicesByDate = async (start_date: string, end_date: string) => {
  try {
    const module_id = getModuleId();
    const requestData: any = { 
      operation: 1, 
      module_id,
      start_date: start_date,
      end_date: end_date
    };
    
    const res = await axios.post(SALES_API_URL, requestData);
    
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data?.data) {
      return res.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching sales invoices:", error);
    return [];
  }
};

// 🔹 Calculate Profit/Loss Report (Profit/Loss = (Sale Rate - Purchase Rate) × Quantity Sold)
export const getItemProfitLoss = async (item_id: number, start_date: string, end_date: string) => {
  try {
    console.log("Fetching profit/loss for item:", item_id, "from", start_date, "to", end_date);
    
    if (!start_date || !end_date) {
      return [];
    }

    // Fetch all products with their sale prices
    const productMap = await getAllProductsWithPrices();
    
    // Fetch purchase and sales data
    const [purchaseOrders, salesInvoices] = await Promise.all([
      getPurchaseOrdersByDate(start_date, end_date),
      getSalesInvoicesByDate(start_date, end_date)
    ]);

    console.log("Purchase Orders:", purchaseOrders);
    console.log("Sales Invoices:", salesInvoices);

    // Create maps to store item-wise data
    const purchaseRateMap = new Map(); // Store latest purchase rate per item
    const itemDetailsMap = new Map(); // Store item details

    // Process purchase orders to get purchase rates
    purchaseOrders.forEach((po: any) => {
      if (po.items && Array.isArray(po.items)) {
        po.items.forEach((item: any) => {
          const itemId = item.item_id;
          const purchaseRate = Number(item.unit_price) || 0;
          
          // Store the purchase rate (latest one will overwrite)
          purchaseRateMap.set(itemId, purchaseRate);
          
          if (!itemDetailsMap.has(itemId)) {
            itemDetailsMap.set(itemId, {
              item_id: itemId,
              item_name: item.item_name || productMap.get(itemId)?.name || `Item #${itemId}`,
              total_purchase_amount: 0,
              total_sold_quantity: 0,
              purchase_rate: purchaseRate,
              sale_rate: productMap.get(itemId)?.sale_price || 0,
              profit: 0,
              loss: 0
            });
          } else {
            // Update purchase rate if needed
            const current = itemDetailsMap.get(itemId);
            current.purchase_rate = purchaseRate;
            itemDetailsMap.set(itemId, current);
          }
        });
      }
    });

    // Process sales invoices to get sold quantities
    salesInvoices.forEach((invoice: any) => {
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach((item: any) => {
          const itemId = item.item_id;
          const quantity = Number(item.quantity) || 0;
          const saleRate = Number(item.unit_price) || 0;
          
          if (!itemDetailsMap.has(itemId)) {
            // If item not in purchase orders, still show it with available data
            itemDetailsMap.set(itemId, {
              item_id: itemId,
              item_name: item.item_name || productMap.get(itemId)?.name || `Item #${itemId}`,
              total_purchase_amount: 0,
              total_sold_quantity: 0,
              purchase_rate: purchaseRateMap.get(itemId) || 0,
              sale_rate: productMap.get(itemId)?.sale_price || saleRate,
              profit: 0,
              loss: 0
            });
          }
          
          const current = itemDetailsMap.get(itemId);
          current.total_sold_quantity += quantity;
          // Update sale rate if needed (use the one from sales invoice)
          if (saleRate > 0) {
            current.sale_rate = saleRate;
          }
          itemDetailsMap.set(itemId, current);
        });
      }
    });

    // Calculate profit/loss using formula: (Sale Rate - Purchase Rate) × Quantity Sold
    const report: any[] = [];
    itemDetailsMap.forEach((value, key) => {
      const purchaseRate = value.purchase_rate;
      const saleRate = value.sale_rate;
      const soldQuantity = value.total_sold_quantity;
      
      if (soldQuantity > 0 && purchaseRate > 0) {
        // Calculate difference per unit
        const differencePerUnit = saleRate - purchaseRate;
        const totalDifference = differencePerUnit * soldQuantity;
        
        const reportItem = {
          item_id: value.item_id,
          item_name: value.item_name,
          purchase_rate: purchaseRate,
          sale_rate: saleRate,
          sold_quantity: soldQuantity,
          difference_per_unit: differencePerUnit,
          total_difference: totalDifference
        };
        
        // Add profit/loss flags
        if (totalDifference > 0) {
          reportItem['profit'] = totalDifference;
          reportItem['loss'] = 0;
        } else if (totalDifference < 0) {
          reportItem['profit'] = 0;
          reportItem['loss'] = Math.abs(totalDifference);
        } else {
          reportItem['profit'] = 0;
          reportItem['loss'] = 0;
        }
        
        report.push(reportItem);
      }
    });

    // Filter by specific item if selected
    if (item_id && item_id !== 0) {
      return report.filter(item => item.item_id === item_id);
    }

    console.log("Final Profit/Loss Report:", report);
    return report;

  } catch (error) {
    console.error("Error calculating profit/loss:", error);
    handleApiError(error);
    return [];
  }
};