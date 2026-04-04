// src/api/departmentApi.ts
import axios from "axios";

// API URLs for different endpoints
const UOM_API_URL = "http://84.16.235.111:2149/api/uom";
const DEPARTMENT_API_URL = "http://84.16.235.111:2149/api/departments";

const getModuleId = (): number | null => {
  const branchId = sessionStorage.getItem('selectedBranchId');
  console.log("Raw selectedBranchId from sessionStorage:", branchId);
  
  if (branchId && branchId !== 'N/A' && branchId !== 'null' && branchId !== 'undefined') {
    const parsedId = parseInt(branchId, 10);
    if (!isNaN(parsedId)) {
      console.log("Parsed module_id:", parsedId);
      return parsedId;
    }
  }
  console.log("No valid module_id found, using default 1");
  return 1; // Default value if none found
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

// ==================== UOM FUNCTIONS ====================

// 1️⃣ Get all UOMs (Units of Measure)
export const getUOM = async () => {
  const module_id = getModuleId();
  console.log("Fetching UOMs with module_id:", module_id);
  
  try {
    const res = await axios.post(UOM_API_URL, { 
      operation: 1,
      module_id: module_id 
    });
    console.log("UOM API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("UOM API Error:", error);
    handleApiError(error);
  }
};

// 2️⃣ Add UOM
export const addUOM = async (uom_name: string) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(UOM_API_URL, {
      operation: 2,
      uom_name,
      module_id: module_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 3️⃣ Update UOM
export const updateUOM = async (uom_id: number, uom_name: string) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(UOM_API_URL, {
      operation: 3,
      uom_id,
      uom_name,
      module_id: module_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 4️⃣ Delete UOM
export const deleteUOM = async (uom_id: number) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(UOM_API_URL, {
      operation: 4,
      uom_id,
      module_id: module_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ==================== DEPARTMENT FUNCTIONS ====================

// 1️⃣ Get all departments
export const getDepartments = async () => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(DEPARTMENT_API_URL, { 
      operation: 1,
      module_id: module_id 
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 2️⃣ Add department
export const addDepartment = async (
  dep_name: string,
  branch_id: number,
  company_id: number
) => {
  const module_id = getModuleId();
  
  // Validate required fields
  if (!dep_name || dep_name.trim() === '') {
    throw new Error("Department name is required");
  }
  
  if (!branch_id || branch_id === 0) {
    throw new Error("Branch ID is required");
  }
  
  if (!company_id || company_id === 0) {
    throw new Error("Company ID is required");
  }
  
  if (!module_id) {
    throw new Error("Module ID is required");
  }
  
  const payload = {
    operation: 2,
    dep_name: dep_name.trim(),
    branch_id: branch_id,
    company_id: company_id,
    module_id: module_id
  };
  
  console.log("Sending add department payload:", payload);
  
  try {
    const res = await axios.post(DEPARTMENT_API_URL, payload);
    console.log("Add department response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Add department error:", error);
    handleApiError(error);
  }
};

// 3️⃣ Update department
export const updateDepartment = async (
  dep_id: number,
  dep_name: string,
  branch_id: number,
  company_id: number
) => {
  const module_id = getModuleId();
  
  // Validate required fields
  if (!dep_id) {
    throw new Error("Department ID is required for update");
  }
  
  if (!dep_name || dep_name.trim() === '') {
    throw new Error("Department name is required");
  }
  
  if (!branch_id || branch_id === 0) {
    throw new Error("Branch ID is required");
  }
  
  if (!company_id || company_id === 0) {
    throw new Error("Company ID is required");
  }
  
  if (!module_id) {
    throw new Error("Module ID is required");
  }
  
  const payload = {
    operation: 3,
    dep_id: dep_id,
    dep_name: dep_name.trim(),
    branch_id: branch_id,
    company_id: company_id,
    module_id: module_id
  };
  
  console.log("Sending update department payload:", payload);
  
  try {
    const res = await axios.post(DEPARTMENT_API_URL, payload);
    console.log("Update department response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Update department error:", error);
    handleApiError(error);
  }
};

// 4️⃣ Delete department
export const deleteDepartment = async (dep_id: number) => {
  const module_id = getModuleId();
  
  if (!dep_id) {
    throw new Error("Department ID is required for deletion");
  }
  
  if (!module_id) {
    throw new Error("Module ID is required");
  }
  
  const payload = {
    operation: 4,
    dep_id: dep_id,
    module_id: module_id
  };
  
  console.log("Sending delete department payload:", payload);
  
  try {
    const res = await axios.post(DEPARTMENT_API_URL, payload);
    console.log("Delete department response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Delete department error:", error);
    handleApiError(error);
  }
};

// 5️⃣ Get dropdown data (branches & companies)
export const getBranchAndCompanyList = async () => {
  try {
    const res = await axios.get(`${DEPARTMENT_API_URL}/dropdown-data`);
    return res.data; // Expected: { branches: [], companies: [] }
  } catch (error) {
    handleApiError(error);
  }
};