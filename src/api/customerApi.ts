import axios from "axios";

// 💡 CHANGE 1: Function to get the Branch ID from sessionStorage
const getSelectedBranchId = (): string | null => {
    return sessionStorage.getItem("selectedBranchId");
};

const API_URL = "http://84.16.235.111:2091/api/customers";
const SALES_PERSON_API_URL = "http://84.16.235.111:2091/api/salespersons";

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

// Utility function to get the numeric module_id
const getModuleId = () => {
    const selectedBranchId = getSelectedBranchId();
    // Parse the ID to a number if it's not "N/A", otherwise set to null for the API
    const module_id = selectedBranchId && selectedBranchId !== 'N/A'
        ? parseInt(selectedBranchId, 10)
        : null;
    return module_id;
}


// 🔹 Get Customers
// 💡 CHANGE 2: Read branch ID and include it as 'module_id' in the POST payload.
export const getCustomers = async () => {
    const module_id = getModuleId();

    try {
        const res = await axios.post(API_URL, {
            operation: 1,
            module_id: module_id // Sending the branch ID to the API
        });
        console.log("API Request Payload for getCustomers:", { operation: 1, module_id: module_id });
        console.log("API Response:", res.data);
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Add Customer (UPDATED to include module_id and 3 new fields)
export const addCustomer = async (
    customer_name: string,
    phone: string,
    email: string,
    address: string,
    city: string,
    status: string,
    country: string,
    credit_limit: number,
    payment_term: string,
    sales_person_id: number,
    account_id: number,
    region_id: number,
    // 👇 NEW FIELDS
    ntn: string, 
    reg_no: string,
    discount: number, // 1 for true, 0 for false
    // 👆 END NEW FIELDS
    created_by: number,
    updated_by: number
) => {
    // 💡 REQUIRED CHANGE: Get the branch ID to include in the payload
    const module_id = getModuleId();

    try {
        const res = await axios.post(API_URL, {
            operation: 2,
            customer_name,
            phone,
            email,
            address,
            city,
            status,
            country,
            credit_limit,
            payment_term,
            sales_person_id,
            account_id,
            region_id,
            // 👇 Added new fields
            ntn, 
            reg_no,
            discount, // Send 1 or 0
            // 👆 End new fields
            created_by,
            updated_by,
            // 👇 Added module_id to the API payload
            module_id: module_id 
        });
        console.log("API Request Payload for addCustomer:", { 
            operation: 2, 
            customer_name, 
            phone,
            email,
            address,
            city,
            status,
            country,
            credit_limit,
            payment_term,
            sales_person_id,
            account_id,
            region_id,
            ntn, 
            reg_no,
            discount,
            created_by,
            updated_by,
            module_id 
        });
        // Backend returns: { success: true, message: "Customer added successfully" }
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Update Customer (UPDATED to include 3 new fields)
export const updateCustomer = async (
    customer_id: number,
    customer_name: string,
    phone: string,
    email: string,
    address: string,
    city: string,
    status: string,
    country: string,
    credit_limit: number,
    payment_term: string,
    sales_person_id: number,
    account_id: number,
    region_id: number,
    // 👇 NEW FIELDS
    ntn: string, 
    reg_no: string,
    discount: number, // 1 for true, 0 for false
    // 👆 END NEW FIELDS
    created_by: number,
    updated_by: number
) => {
    try {
        const res = await axios.post(API_URL, {
            operation: 3,
            customer_id,
            customer_name,
            phone,
            email,
            address,
            city,
            status,
            country,
            credit_limit,
            payment_term,
            sales_person_id,
            account_id,
            region_id,
            // 👇 Added new fields
            ntn, 
            reg_no,
            discount, // Send 1 or 0
            // 👆 End new fields
            created_by,
            updated_by
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Delete Customer
export const deleteCustomer = async (customer_id: number) => {
    try {
        const res = await axios.post(API_URL, {
            operation: 4,
            customer_id,
        });
        return res.data ;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Get Sales Persons
// 💡 REQUIRED CHANGE: Include 'module_id' (Branch ID) in the payload.
export const getSalesPersons = async () => {
    const module_id = getModuleId(); // Get the branch ID

    try {
        // API is now a POST request to send module_id
        const res = await axios.post(SALES_PERSON_API_URL, { 
            operation: 1,
            module_id: module_id 
        });
        console.log("API Request Payload for getSalesPersons:", { module_id: module_id });
        return res.data; // [{ sales_person_id, sales_person_name }]
    } catch (error) {
        handleApiError(error);
    }
};