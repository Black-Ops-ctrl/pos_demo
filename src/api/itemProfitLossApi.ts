/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const PROFIT_LOSS_API_URL = "http://84.16.235.111:2149/api/item-profit-loss";

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

// 🔹 Process and transform API response to match expected format
const processProfitLossData = (data: any[]) => {
  return data.map((item: any) => {
    const totalPurchase = parseFloat(item.total_purchase) || 0;
    const totalSale = parseFloat(item.total_sale) || 0;
    const profit = parseFloat(item.profit) || 0;
    const loss = parseFloat(item.loss) || 0;
    
    // Calculate sold quantity if not provided
    // Since we don't have quantity, we can't calculate per-unit rates
    // We'll use 0 and show the aggregated totals
    let soldQuantity = 0;
    
    if (item.sold_quantity) {
      soldQuantity = parseFloat(item.sold_quantity);
    } else {
      // If sold_quantity is not provided, we can't determine it from available data
      console.log(`No sold_quantity for ${item.item_name || item.product_name}`);
      // Keep as 0 - UI will show N/A for per-unit calculations
    }
    
    return {
      product_id: item.product_id || item.item_id,
      product_name: item.product_name || item.item_name,
      total_purchase: totalPurchase.toFixed(2),
      total_sale: totalSale.toFixed(2),
      sold_quantity: soldQuantity.toString(),
      profit: profit.toFixed(2),
      loss: loss.toFixed(2)
    };
  });
};

// 🔹 Get Product Profit/Loss Report
export const getProductProfitLoss = async (
  item_id: number | null, 
  start_date: string, 
  end_date: string
) => {
  try {
    console.log("Fetching profit/loss report for product:", item_id, "from", start_date, "to", end_date);
    
    if (!start_date || !end_date) {
      return [];
    }

    const module_id = getModuleId();
    
    const requestData = {
      operation: 1,
      item_id: item_id,
      start_date: start_date,
      end_date: end_date,
    };
    
    console.log("Sending request to profit/loss API:", requestData);
    
    const res = await axios.post(PROFIT_LOSS_API_URL, requestData);
    
    console.log("Profit/Loss API Response:", res.data);
    
    let reportData = [];
    
    // Handle different response structures
    if (res.data?.data && Array.isArray(res.data.data)) {
      reportData = res.data.data;
    } else if (Array.isArray(res.data)) {
      reportData = res.data;
    } else if (res.data?.Data && Array.isArray(res.data.Data)) {
      reportData = res.data.Data;
    } else {
      console.warn("Unexpected response structure:", res.data);
      return [];
    }
    
    console.log("Raw report data:", reportData);
    
    // Transform the data to match expected format
    const processedData = processProfitLossData(reportData);
    
    console.log("Processed profit/loss report:", processedData);
    
    // Filter by specific product if selected
    if (item_id) {
      return processedData.filter(item => item.product_id === item_id);
    }
    
    return processedData;

  } catch (error) {
    console.error("Error fetching profit/loss report:", error);
    handleApiError(error);
    return [];
  }
};