/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const PROFIT_LOSS_API_URL = "http://84.16.235.111:2140/api/product-profit-loss";

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

// 🔹 Get Product Profit/Loss Report using consolidated API
export const getProductProfitLoss = async (
  p_product_id: number | null, 
  p_start_date: string, 
  p_end_date: string
) => {
  try {
    console.log("Fetching profit/loss report for product:", p_product_id, "from", p_start_date, "to", p_end_date);
    
    if (!p_start_date || !p_end_date) {
      return [];
    }

    const module_id = getModuleId();
    
    const requestData = {
      p_operation: 1,
      p_product_id: p_product_id,
      p_start_date: p_start_date,
      p_end_date: p_end_date,
      module_id: module_id
    };
    
    console.log("Sending request to profit/loss API:", requestData);
    
    const res = await axios.post(PROFIT_LOSS_API_URL, requestData);
    
    console.log("Profit/Loss API Response:", res.data);
    
    // Handle the actual API response structure
    let reportData = [];
    
    if (res.data?.data && Array.isArray(res.data.data)) {
      reportData = res.data.data;
    } else if (Array.isArray(res.data)) {
      reportData = res.data;
    } else {
      console.warn("Unexpected response structure:", res.data);
      return [];
    }
    
    console.log("Raw report data:", reportData);
    
    // Simply return the data as-is from API without any transformations
    const transformedData = reportData.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      total_purchase: item.total_purchase,
      total_sale: item.total_sale,
      sold_quantity: item.sold_quantity,
      profit: item.profit,
      loss: item.loss
    }));
    
    console.log("Transformed profit/loss report:", transformedData);
    
    // Filter by specific product if selected
    if (p_product_id) {
      return transformedData.filter(item => item.product_id === p_product_id);
    }
    
    return transformedData;

  } catch (error) {
    console.error("Error fetching profit/loss report:", error);
    handleApiError(error);
    return [];
  }
};