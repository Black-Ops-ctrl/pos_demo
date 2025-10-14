import axios from "axios";

// 💡 NEW: Function to get the Branch ID from sessionStorage
const getSelectedBranchId = (): string | null => {
    // Assuming 'selectedBranchId' is the key used to store the Branch ID
    return sessionStorage.getItem("selectedBranchId");
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


const API_URL = "http://84.16.235.111:2091/api/salespersons";
const REGION_API_URL = "http://84.16.235.111:2091/api/getregions";

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

// 🔹 Get Sales Persons (UPDATED to include module_id)
export const getSalesPersons = async () => {
    const module_id = getModuleId(); // Get the branch ID

    try {
        // Now sending module_id with operation 1
        const res = await axios.post(API_URL, { 
            operation: 1, 
            module_id: module_id 
        });
        console.log("API Request Payload for getSalesPersons:", { operation: 1, module_id: module_id });
        console.log("API Response:", res.data);
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Add Sales Person (UPDATED to include module_id)
export const addSalePerson = async (
    sales_person_name: string,
    father_name: string,
    phone: string,
    designation_id: number,
    branch_id: number,
    company_id: number,
    region_id: number,
    created_by: number,
    updated_by: number
) => {
    const module_id = getModuleId(); // Get the branch ID

    try {
        const res = await axios.post(API_URL, {
            operation: 2,
            sales_person_name,
            father_name,
            phone,
            designation_id,
            branch_id,
            company_id,
            region_id,
            created_by,
            updated_by,
            // 👇 Added module_id to the API payload
            module_id: module_id
        });
        console.log("API Request Payload for addSalePerson:", { 
            operation: 2, 
            sales_person_name, 
            phone, 
            designation_id, 
            branch_id, 
            region_id, 
            module_id 
        });
        // Backend returns: { success: true, message: "SalesPerson added successfully" }
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Update Sales Person
export const updateSalePerson = async (
    sales_person_id: number,
    sales_person_name: string,
    father_name: string,
    phone: string,
    designation_id: number,
    branch_id: number,
    company_id: number,
    region_id: number,
    created_by: number,
    updated_by: number
) => {
    // NOTE: module_id is typically not needed for 'Update' operation (operation 3) 
    // unless the API specifically requires it. We will leave it out for now.
    try {
        const res = await axios.post(API_URL, {
            operation: 3,
            sales_person_id,
            sales_person_name,
            father_name,
            phone,
            designation_id,
            branch_id,
            company_id,
            region_id,
            created_by,
            updated_by
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Delete Item
export const deleteSalePerson = async (sales_person_id: number) => {
    try {
        const res = await axios.post(API_URL, {
            operation: 4,
            sales_person_id,
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

// 🔹 Get Regions (No module_id required, as regions are typically universal)
export const getRegions = async () => {
    try {
        // Assuming REGION_API_URL is a GET endpoint that doesn't require a payload
        const res = await axios.get(REGION_API_URL); 
        return res.data; // [{ region_id, region_name }]
    } catch (error) {
        handleApiError(error);
    }
};