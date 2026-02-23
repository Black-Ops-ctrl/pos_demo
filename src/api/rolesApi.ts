// src/api/companyApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/roles";

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
role_name: string, description: string, created_by: number, sales_read: number, sales_write: number, sales_delete: number, sales_export: number, sales_approve: number,sales_unapprove:number,
 accounting_read: number, accounting_write: number, accounting_delete: number, accounting_export: number, 
 accounting_approve: number, accounting_unapprove: number, hr_read: number, hr_write: number, hr_delete: number, 
  hr_export: number, hr_approve: number, inventory_read: number, inventory_write: number, inventory_delete: number,
   inventory_export: number, inventory_approve: number, inventory_unapprove: number, crm_read: number, crm_write: number,
    crm_delete: number, crm_export: number, crm_approve: number, crm_unapprove: number, purchasing_read: number,
     purchasing_write: number, purchasing_delete: number, purchasing_export: number, purchasing_approve: number,
      purchasing_unapprove: number, reports_read: number, reports_write: number, reports_delete: number,
       reports_export: number, reports_approve: number, reports_unapprove: number, security_read: number, 
       security_write: number, security_delete: number, security_export: number, security_approve: number, security_unapprove: number) => {
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
      sales_unapprove,

      accounting_read,
      accounting_write,
      accounting_delete,
      accounting_export,
      accounting_approve,
      accounting_unapprove,

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
      inventory_unapprove,

      crm_read,
      crm_write,
      crm_delete,
      crm_export,
      crm_approve,
      crm_unapprove,

      purchasing_read,
      purchasing_write,
      purchasing_delete,
      purchasing_export,
      purchasing_approve,
      purchasing_unapprove,

      reports_read,
      reports_write,
      reports_delete,
      reports_export,
      reports_approve,
      reports_unapprove,

      security_read,
      security_write,
      security_delete,
      security_export,
      security_approve,
      security_unapprove
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
sales_unapprove:number|null,
accounting_read: number | null, 
accounting_write: number | null,
accounting_delete: number | null,
accounting_export: number | null, 
accounting_approve: number | null, 
accounting_unapprove: number |null,
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
inventory_unapprove:number|null,
crm_read: number | null, 
crm_write: number | null, 
crm_delete: number | null, 
crm_export: number | null, 
crm_approve: number | null, 
crm_unapprove:number|null,
purchasing_read: number | null, 
purchasing_write: number | null, 
purchasing_delete: number | null, 
purchasing_export: number | null, 
purchasing_approve: number | null, 
purchasing_unapprove:number|null,
reports_read: number | null, 
reports_write: number | null, 
reports_delete: number | null, 
reports_export: number | null, 
reports_approve: number | null,
reports_unapprove: number,
security_read: number, 
security_write: number, 
security_delete: number, 
security_export: number, 
security_approve: number, 
security_unapprove: number) => {
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
      sales_unapprove,

      accounting_read,
      accounting_write,
      accounting_delete,
      accounting_export,
      accounting_approve,
      accounting_unapprove,

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
      inventory_unapprove,

      crm_read,
      crm_write,
      crm_delete,
      crm_export,
      crm_approve,
      crm_unapprove,

      purchasing_read,
      purchasing_write,
      purchasing_delete,
      purchasing_export,
      purchasing_approve,
      purchasing_unapprove,

      reports_read,
      reports_write,
      reports_delete,
      reports_export,
      reports_approve,
      reports_unapprove,

      security_read,
      security_write,
      security_delete,
      security_export,
      security_approve,
      security_unapprove
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
