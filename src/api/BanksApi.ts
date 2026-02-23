import axios from "axios";

import { getCurrentUserId } from "@/components/security/LoginPage";
const user_id = getCurrentUserId();

// First API for fetching Bank Accounts/Chart of Accounts (used in the form)
const ACCOUNTS_API_URL = "http://84.16.235.111:2135/api/bankAccounts";

// Second API for Bank Details (main CRUD operations)
const BANK_DETAILS_API_URL = "http://84.16.235.111:2135/api/bank";

// 💡 Helper to get the module_id from session storage (Copied from City API logic)
const getModuleId = (): string => {
  // It's returned as a string, which is what the API likely expects (even if it's a number in the database)
  return sessionStorage.getItem('selectedBranchId') || 'N/A'; 
};

// Use the dynamic module_id
const module_id = getModuleId();

// Re-exported: Function to get bank accounts (used for dropdown)
export const getBAccounts = async () => {
  const response = await axios.get(ACCOUNTS_API_URL);
  // Assuming this returns an array of account objects
  return response.data;
};

// --- NEW BANK DETAILS API FUNCTIONS (http://84.16.235.111:2091/api/bank) ---

/**
 * GET operation for Bank Details.
 * Body: { "operation": 1, "module_id": dynamic }
 */
export const getBanks = async () => {
  const body = {
    operation: 1
  };
  // Using POST method with a body for GET operation
  const response = await axios.post(BANK_DETAILS_API_URL, body);
  // Assuming the response data contains the list of bank details
  return response.data;
};

interface BankInsertBody {
  bank_name: string;
  bank_code: string; // Mapped from ItemCategory.description
  account_id: number;
  account_no: string; // Mapped from ItemCategory.account_no
}

/**
 * INSERT operation for Bank Details.
 * Body: { "operation": 2, "bank_name": "...", "bank_code": "...", "account_id": 46, "account_no": "...", "module_id": dynamic, "created_by": 7960 }
 */
export const insertBank = async (bankDetails: BankInsertBody) => {
  const body = {
    operation: 2,
    ...bankDetails,
    // Using dynamic module_id
    module_id: module_id, 
    // Note: Assuming a hardcoded or globally managed created_by/updated_by user ID (e.g., 7960)
    created_by: user_id, 
  };
  const response = await axios.post(BANK_DETAILS_API_URL, body);
  return response.data;
};

interface BankUpdateBody extends BankInsertBody {
  bank_id: number;
}

/**
 * UPDATE operation for Bank Details.
 * Body: { "operation": 3, "bank_id": 5, "bank_name": "...", "bank_code": "...", "account_id": 12, "account_no": "...", "module_id": dynamic, "updated_by": 2 }
 */
export const updateBank = async (bankDetails: BankUpdateBody) => {
  const body = {
    operation: 3,
    ...bankDetails,
    // Using dynamic module_id
    module_id: module_id, 
    // Note: Assuming a hardcoded or globally managed created_by/updated_by user ID (e.g., 2)
    updated_by: user_id,
  };
  const response = await axios.post(BANK_DETAILS_API_URL, body);
  return response.data;
};

/**
 * DELETE operation for Bank Details.
 * Body: { "operation": 4, "bank_id": 4, "module_id": dynamic }
 */
export const deleteBank = async (bank_id: number) => {
  const body = {
    operation: 4,
    bank_id: bank_id,
    // Using dynamic module_id
    module_id: module_id, 
  };
  // Using POST method with a body for DELETE operation
  const response = await axios.post(BANK_DETAILS_API_URL, body);
  return response.data;
};