// src/api/companyApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/roles";

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

// Get all companies
export const getRoles = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
// Insert new role
export const addRole = async (
  role_name: string,
  description: string,
  created_by: number,

  sales_read: number,
  sales_write: number,
  sales_delete: number,
  sales_export: number,
  sales_approve: number,

  accounting_read: number,
  accounting_write: number,
  accounting_delete: number,
  accounting_export: number,
  accounting_approve: number,

  hr_read: number,
  hr_write: number,
  hr_delete: number,
  hr_export: number,
  hr_approve: number,

  inventory_read: number,
  inventory_write: number,
  inventory_delete: number,
  inventory_export: number,
  inventory_approve: number,

  crm_read: number,
  crm_write: number,
  crm_delete: number,
  crm_export: number,
  crm_approve: number,

  purchasing_read: number,
  purchasing_write: number,
  purchasing_delete: number,
  purchasing_export: number,
  purchasing_approve: number,

  reports_read: number,
  reports_write: number,
  reports_delete: number,
  reports_export: number,
  reports_approve: number,

  security_read: number,
  security_write: number,
  security_delete: number,
  security_export: number,
  security_approve: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Insert
      role_id: null,
      role_name,
      description,
      created_by,
      updated_by: null,

      sales_read,
      sales_write,
      sales_delete,
      sales_export,
      sales_approve,

      accounting_read,
      accounting_write,
      accounting_delete,
      accounting_export,
      accounting_approve,

      hr_read,
      hr_write,
      hr_delete,
      hr_export,
      hr_approve,

      inventory_read,
      inventory_write,
      inventory_delete,
      inventory_export,
      inventory_approve,

      crm_read,
      crm_write,
      crm_delete,
      crm_export,
      crm_approve,

      purchasing_read,
      purchasing_write,
      purchasing_delete,
      purchasing_export,
      purchasing_approve,

      reports_read,
      reports_write,
      reports_delete,
      reports_export,
      reports_approve,

      security_read,
      security_write,
      security_delete,
      security_export,
      security_approve,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update existing role
export const updateRole = async (
  role_id: number,
  role_name: string | null,
  description: string | null,
  updated_by: number,

  sales_read: number | null,
  sales_write: number | null,
  sales_delete: number | null,
  sales_export: number | null,
  sales_approve: number | null,

  accounting_read: number | null,
  accounting_write: number | null,
  accounting_delete: number | null,
  accounting_export: number | null,
  accounting_approve: number | null,

  hr_read: number | null,
  hr_write: number | null,
  hr_delete: number | null,
  hr_export: number | null,
  hr_approve: number | null,

  inventory_read: number | null,
  inventory_write: number | null,
  inventory_delete: number | null,
  inventory_export: number | null,
  inventory_approve: number | null,

  crm_read: number | null,
  crm_write: number | null,
  crm_delete: number | null,
  crm_export: number | null,
  crm_approve: number | null,

  purchasing_read: number | null,
  purchasing_write: number | null,
  purchasing_delete: number | null,
  purchasing_export: number | null,
  purchasing_approve: number | null,

  reports_read: number | null,
  reports_write: number | null,
  reports_delete: number | null,
  reports_export: number | null,
  reports_approve: number | null,

  security_read: number | null,
  security_write: number | null,
  security_delete: number | null,
  security_export: number | null,
  security_approve: number | null
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3, // Update
      role_id,
      role_name,
      description,
      created_by: null,
      updated_by,

      sales_read,
      sales_write,
      sales_delete,
      sales_export,
      sales_approve,

      accounting_read,
      accounting_write,
      accounting_delete,
      accounting_export,
      accounting_approve,

      hr_read,
      hr_write,
      hr_delete,
      hr_export,
      hr_approve,

      inventory_read,
      inventory_write,
      inventory_delete,
      inventory_export,
      inventory_approve,

      crm_read,
      crm_write,
      crm_delete,
      crm_export,
      crm_approve,

      purchasing_read,
      purchasing_write,
      purchasing_delete,
      purchasing_export,
      purchasing_approve,

      reports_read,
      reports_write,
      reports_delete,
      reports_export,
      reports_approve,

      security_read,
      security_write,
      security_delete,
      security_export,
      security_approve,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
