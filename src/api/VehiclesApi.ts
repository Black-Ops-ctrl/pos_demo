import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/vehicles";

const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || '2'; 
};

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

  // Something else happened
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// ----------------------------------------------------
// --- API Functions Updated for Vehicles ---
// ----------------------------------------------------

// Get all vehicles (Operation 1)
export const getVehicles = async () => {
  try {
    const res = await axios.post(API_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get vehicle by ID (Operation 4)
export const getVehicleById = async (vehicle_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      vehicle_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new vehicle (Operation 2)
export const addVehicle = async (
  vehicle_name: string,
  account_id: number,
  updated_by?: number
) => {
  try {
    const payload: any = {
      operation: 2,
      vehicle_name,
      account_id
    };

    // Add updated_by if provided
    if (updated_by) {
      payload.updated_by = updated_by;
    }

    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update existing vehicle (Operation 3)
export const updateVehicle = async (
  vehicle_id: number,
  vehicle_name: string,
  account_id: number,
  updated_by?: number
) => {
  try {
    const payload: any = {
      operation: 3,
      vehicle_id,
      vehicle_name,
      account_id
    };

    // Add updated_by if provided
    if (updated_by) {
      payload.updated_by = updated_by;
    }

    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete vehicle (Operation 4) - Note: Same operation as get by ID, but typically delete would be a different operation
// If delete is actually a different operation number, please update accordingly
export const deleteVehicle = async (vehicle_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4, // Confirm if this is the correct operation for delete
      vehicle_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};