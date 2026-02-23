import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/getaccounts";

export const getAccounts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
////     Vendors Accounts
const venderAccounts_API_URL = "http://84.16.235.111:2135/api/venderAccounts";

export const getVendorAccounts = async () => {
  const response = await axios.get(venderAccounts_API_URL);
  return response.data;
};

////////     Items Accounts 
const ItemsAccounts_API_URL = "http://84.16.235.111:2135/api/itemAccounts";

export const getItemsAccounts = async () => {
  const response = await axios.get(ItemsAccounts_API_URL);
  return response.data;
};

////        Bank Accounts
const BankAccounts_API_URL = "http://84.16.235.111:2135/api/bankAccounts";

export const getBanksAccounts = async () => {
  const response = await axios.get(BankAccounts_API_URL);
  return response.data;
};

/////////  Customer Accounts
const CustomerAccounts_API_URL = "http://84.16.235.111:2135/api/customerAccounts";

export const getCustomerAccounts = async () => {
  const response = await axios.post(CustomerAccounts_API_URL,{operation:1});
  return response.data;
};

export const getCustomerParentAccounts = async () => {
  const response = await axios.post(CustomerAccounts_API_URL,{operation:2});
  return response.data;
};
/////////  Cash Accounts
const CashAccounts_API_URL = "http://84.16.235.111:2135/api/cashAccounts";

export const getCashAccounts = async () => {
  const response = await axios.get(CashAccounts_API_URL);
  return response.data;
};

