import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

// Data interfaces
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
  createdAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: 'Active' | 'Inactive';
  hireDate: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  minStock: number;
  status: 'Active' | 'Inactive';
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  orderDate: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // Data
  customers: Customer[];
  invoices: Invoice[];
  employees: Employee[];
  items: Item[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  // Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Customer actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    toast({ title: 'Customer added successfully' });
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    toast({ title: 'Customer updated successfully' });
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Customer deleted successfully' });
  };

  // Invoice actions
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    toast({ title: 'Invoice created successfully' });
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...invoiceData } : i));
    toast({ title: 'Invoice updated successfully' });
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Invoice deleted successfully' });
  };

  // Employee actions
  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: uuidv4(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    toast({ title: 'Employee added successfully' });
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employeeData } : e));
    toast({ title: 'Employee updated successfully' });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Employee deleted successfully' });
  };

  // Item actions
  const addItem = (itemData: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...itemData,
      id: uuidv4(),
    };
    setItems(prev => [...prev, newItem]);
    toast({ title: 'Item added successfully' });
  };

  const updateItem = (id: string, itemData: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...itemData } : i));
    toast({ title: 'Item updated successfully' });
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Item deleted successfully' });
  };

  // Purchase Order actions
  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id'>) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: uuidv4(),
    };
    setPurchaseOrders(prev => [...prev, newPO]);
    toast({ title: 'Purchase Order created successfully' });
  };

  const updatePurchaseOrder = (id: string, poData: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, ...poData } : po));
    toast({ title: 'Purchase Order updated successfully' });
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    toast({ title: 'Purchase Order deleted successfully' });
  };

  // Vendor actions
  const addVendor = (vendorData: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: uuidv4(),
    };
    setVendors(prev => [...prev, newVendor]);
    toast({ title: 'Vendor added successfully' });
  };

  const updateVendor = (id: string, vendorData: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...vendorData } : v));
    toast({ title: 'Vendor updated successfully' });
  };

  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    toast({ title: 'Vendor deleted successfully' });
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        customers,
        invoices,
        employees,
        items,
        purchaseOrders,
        vendors,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addItem,
        updateItem,
        deleteItem,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        addVendor,
        updateVendor,
        deleteVendor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };