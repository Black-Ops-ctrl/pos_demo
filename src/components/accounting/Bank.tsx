import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Building2, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Removed ItemCategoryApi import
import { getBAccounts, getBanks, insertBank, updateBank, deleteBank } from "@/api/BanksApi"; // NEW IMPORTS

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";


// ⭐️ UPDATED INTERFACE: Fields are now logically mapped to Bank Details
interface BankDetail {
  // Corresponds to category_id
  bank_id: number; 
  // Corresponds to category_name
  bank_name: string; 
  account_id: number;
  // Account details that might come from the lookup
  account_code?: string;
  account_name?: string;
  // Corresponds to description field (for Bank Code)
  bank_code: string; 
  // Corresponds to account_no field
  account_no: string; 
}


// --- Component for Listing and CRUD Operations ---

const ItemCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  // Using the new interface
  const [editingCategory, setEditingCategory] = useState<BankDetail | null>(null);
  // Using the new interface
  const [categories, setCategories] = useState<BankDetail[]>([]);

  const { toast } = useToast();

  /**
   * Loads Bank Details from the new API.
   */
  const loadCategories = async () => {
    try {
      // ⭐️ REPLACED: getItemCategory() with getBanks()
      const res = await getBanks();
      // Assuming res is the array of bank details
      // Note: API response structure might differ. We assume it returns an array of objects
      // that can be mapped to BankDetail interface, possibly needing a mapping step.
      // For now, we use a simple assignment.
      setCategories(res.data || res); 
    } catch (error) {
      console.error("Error loading bank details", error);
    }
  };


  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  // Using the new interface
  const handleEditCategory = (cat: BankDetail) => {
    setEditingCategory(cat);
    setShowForm(true);
  };

  /**
   * Handles saving (Insert/Update) the bank details.
   * Data object now correctly reflects required fields: bank_name, bank_code, account_id, account_no.
   */
  const handleSaveCategory = async (
    data: Omit<BankDetail, "bank_id" | "account_code" | "account_name">
  ) => {
    try {
      if (editingCategory) {
        // ⭐️ UPDATED: Using updateBank() from BanksApi
        await updateBank({
          bank_id: editingCategory.bank_id, // Required for update
          bank_name: data.bank_name,
          bank_code: data.bank_code,
          account_id: data.account_id,
          account_no: data.account_no,
        });
        toast({ title: "Updated", description: "Bank details updated successfully!", duration: 3000 });
      } else {
        // ⭐️ UPDATED: Using insertBank() from BanksApi
        await insertBank({
          bank_name: data.bank_name,
          bank_code: data.bank_code,
          account_id: data.account_id,
          account_no: data.account_no,
        });
        toast({ title: "Created", description: "Bank details created successfully!", duration: 3000 });
      }
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error("Error saving bank details", error);
      toast({ title: "Error", description: "Failed to save bank details", variant: "destructive", duration: 3000 });
    }
  };

  /**
   * Handles deletion of bank details.
   */
  const handleDeleteCategory = async (bankId: number) => {
    if (confirm("Are you sure you want to delete this bank's details?")) {
      try {
        // ⭐️ UPDATED: Using deleteBank() from BanksApi
        await deleteBank(bankId);
        loadCategories();
        toast({ title: "Deleted", description: "Bank details deleted successfully!", duration: 3000 });
      } catch (error) {
        console.error("Error deleting bank details", error);
        toast({ title: "Error", description: "Failed to delete bank details", variant: "destructive", duration: 3000 });
      }
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by Bank Name
      (cat.bank_code || "").toLowerCase().includes(searchTerm.toLowerCase()) || // Search by Bank Code
      (cat.account_no || "").toLowerCase().includes(searchTerm.toLowerCase()) // Search by Account Number
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Details
            </CardTitle>
            <Button
              onClick={handleAddCategory}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bank
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Bank Name, Code, or Account No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Name</TableHead>
                <TableHead>Bank Code</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead>Account No.</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                // ⭐️ Using bank_id as key
                <TableRow key={cat.bank_id}>
                  {/* Bank Name */}
                  <TableCell className="font-medium">{cat.bank_name}</TableCell>
                  {/* Bank Code */}
                  <TableCell>{cat.bank_code || "-"}</TableCell>
                  {/* Account (account_name - account_code) */}
                  <TableCell>{cat.account_name
                    ? `${cat.account_name} (${cat.account_code})`
                    : "-"}</TableCell>
                  {/* Account No. */}
                  <TableCell>{cat.account_no || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        // ⭐️ Using bank_id for delete
                        onClick={() => handleDeleteCategory(cat.bank_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                    No bank details found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {
        showForm && (
          // ⭐️ Passing BankDetail to the form
          <CategoryForm category={editingCategory} onClose={() => setShowForm(false)} onSave={handleSaveCategory} />
        )}
    </>
  );
};

// --- Form Component for Bank Details ---

const CategoryForm: React.FC<{
  category: BankDetail | null;
  onClose: () => void;
  // ⭐️ Updated onSave signature for clarity (using new field names)
  onSave: (data: Omit<BankDetail, "bank_id" | "account_code" | "account_name">) => void;
}> = ({ category, onClose, onSave }) => {
  const [bank_name, setBankName] = useState(""); // Bank Name
  const [bank_code, setBankCode] = useState(""); // Bank Code (was description)
  const [account_id, setAccountId] = useState<number>(0); // Select Account
  const [account_no, setAccountNo] = useState(""); // Account Number

  const [accounts, setAccounts] = useState<any[]>([]); 
  const [open, setOpen] = useState(false); // State for the Account Popover

  // Fetch accounts and initialize form
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Chart of Accounts (no change here)
        const accountsData = await getBAccounts();
        setAccounts(accountsData);

        if (category) {
          // Initialize states from category data (using new field names)
          setBankName(category.bank_name || "");
          setBankCode(category.bank_code || ""); // Bank Code
          setAccountId(category.account_id || 0); // Select Account
          setAccountNo(category.account_no || ""); // Account Number
        }
      } catch (err) {
        console.error("Error loading accounts", err);
      }
    };
    fetchData();
  }, [category]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ⭐️ VALIDATION: Check all required fields
    if (!bank_name || !bank_code || !account_id || !account_no) {
      alert("Please fill all fields: Bank Name, Bank Code, Select Account, and Account Number.");
      return;
    }
    onSave({
      bank_name,
      bank_code, // Bank Code
      account_id,
      account_no // Account Number
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {category ? "Edit Bank Details" : "Add New Bank"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 1. Bank Name */}
          <Input
            value={bank_name}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Bank Name"
          />

          {/* 2. Bank Code */}
          <Input
            value={bank_code}
            onChange={(e) => setBankCode(e.target.value)}
            type='text'
            placeholder="Bank Code"
          />

          {/* 3. Select Account (using Popover/Command) */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {account_id
                  ? `${accounts.find((a: any) => a.account_id === account_id)?.account_name} (${accounts.find((a: any) => a.account_id === account_id)?.account_code})`
                  : "Select Account"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command >
                <CommandInput placeholder="Search accounts..." className="text-black" />
                <CommandEmpty >No account found.</CommandEmpty>
                <CommandGroup>
                  {accounts.map((acc: any) => (
                    <CommandItem
                      key={acc.account_id}
                      className="hover:bg-gray-100"
                      onSelect={() => {
                        setAccountId(acc.account_id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          account_id === acc.account_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {acc.account_name} ({acc.account_code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* 4. Account Number */}
          <Input
            value={account_no}
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="Account Number"
            type="text"
          />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemCategories;