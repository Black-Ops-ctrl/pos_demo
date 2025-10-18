import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/sales-invoices";



const getModuleId = (): string => {
  // Use 'selectedBranchId' as the module_id for API operations
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
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

// 🔹 Get All Sale Invoices
export const getSaleInvoices = async () => {
      const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, { operation: 1,
      module_id,  
     });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert Sale Invoice (with JSON items)
export const createSalesInvoice = async (

customer_id: number,
 invoice_date: Date, 
 status: string,
  remarks: string,
 created_by: number, // Removed discount and tax from main invoice level based on your JSON example
 total_amount: number,
 items: {item_id: number; quantity: number;unit_price: number; discount: number; tax: number; 
}[]) => {
        const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, {
      operation: 2, 
      customer_id,
      status,
      remarks,
      created_by,
      // Removed discount and tax fields from payload based on your JSON example
      total_amount,
      items,
              module_id, 
              invoice_date
 // The array is automatically converted to JSON by axios
    });

    // Backend expected: { success: true, so_id: 123, message: "SO created successfully" }
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};