import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Check, X, Edit, Trash2, ChevronsUpDown, ArrowUp, Printer } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { getJournalEntries, createJournalEntry, updateJournalEntry, UnapproveJournalEnrtries, approveJournalEnrtries, deleteJournalEntry, getCompanyimg } from '@/api/journalEntryApi';
import { getAccounts } from "@/api/getAccountsApi";
import { getUserId } from "@/utils/auth";
import { getExpense } from '@/api/expenseApi'; // Import the expense API

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
import DatePicker from 'react-datepicker';
import { getVouchers } from '@/api/vouchersApi';
import { getBranches } from '@/api/branchApi';

import { toast } from '@/hooks/use-toast';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFlockByBranch } from '@/api/flockApi';

//import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';


const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};
interface Branch {
  branch_id: number;
  branch_name: string;
  status: string;
}

interface JournalLine {
  account_id: number;
  item_id: number;
  quantity: number;
  rate: number;
  debit: number;
  credit: number;
  description: string;
}


// Add interface for company data
interface CompanyData {
  company_id: number;
  company_name: string;
  registration_number: string;
  address: string;
  phone: string;
  email: string;
  image: string; // base64 image string
  module_id: number;
}

interface JV {
  journal_entry_id: number;
  voucher_id: number;
  voucher_name: string;
  branch_id: number;
  branch_name: string;
  flock_id: number;
  flock_name: string;
  expense_id: number; // Add expense_id
  expense_name: string; // Add expense_name
  invoice_id: number;
  entry_date: Date;
  reference_number: string;
  status: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  created_by: string;
  updated_by:string;
  lines: JournalLine[];
}

const JV: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
          const [startDate, setStartDate] = useState<string>(getTodayDate);
        const [endDate, setEndDate] = useState<string>(getTodayDate);
  const [editingEntry, setEditingEntry] = useState<JV | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [selectedJournalEntry, setselectedJournalEntry] = useState<number[]>([]);
  const [printingEntry, setPrintingEntry] = useState<JV | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [entries, setEntries] = useState<JV[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null); // Add this line
  const voucher_id = 10;

  // Load company image data - Add this function
  const loadCompanyImage = async () => {
    try {
      const data = await getCompanyimg();
      if (data && data.length > 0) {
        setCompanyData(data[0]); // Assuming first item is the company data
      }
    } catch (error) {
      console.error("Error loading company image", error);
      // Keep AhmadPoultryLogo as fallback
    }
  };
const loadJournalEntries = async () => {
  try {
    // Remove the date validation check
    const data = await getJournalEntries(voucher_id, startDate, endDate);
    setEntries(data);
    console.log(data);
  } catch (error) {
    console.error("Error loading Journal Entries", error);
  }
};
const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);

  useEffect(() => {
    loadJournalEntries();
    loadCompanyImage(); // Add this line
  }, []);

  // Determine field label based on module_id
  // const branchFieldLabel = module_id === 3 ? "Branch" : "Farm";


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Reversed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Posted': return <Check className="h-4 w-4" />;
      case 'Draft': return <FileText className="h-4 w-4" />;
      case 'Reversed': return <X className="h-4 w-4" />;
      default: return null;
    }
  };
const filteredJE = entries.filter((entry) => {
  // Status filtering
  const statusMatch = statusFilter === 'ALL' || entry.status === statusFilter;
  
  // Search filtering only
  const searchMatch = 
    entry.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_name.toLowerCase().includes(searchTerm.toLowerCase());
  
  return statusMatch && searchMatch;
});



  const handleEditEntry = (entry: JV) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDeleteEntry = async (entry: JV) => {
    if (!window.confirm(`Are you sure you want to delete voucher ${entry.reference_number}?`)) {
      return;
    }

    try {
      await deleteJournalEntry(entry.journal_entry_id);
      toast({
        title: "Deleted",
        description: `Voucher ${entry.reference_number} deleted successfully!`,
        duration: 3000,
      });
      loadJournalEntries();
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast({
        title: "Error",
        description: "Failed to delete voucher.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handlePrintEntry = (entry: JV) => {
    setPrintingEntry(entry);
  };

  const checkScrollTop = useCallback(() => {
    if (!showScrollToTop && window.scrollY > 400) {
      setShowScrollToTop(true);
    } else if (showScrollToTop && window.scrollY <= 400) {
      setShowScrollToTop(false);
    }
  }, [showScrollToTop]);

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [checkScrollTop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };



// In the JV component, update handleSaveEntry to properly handle async
const handleSaveEntry = async (payload: {
  voucher_id: number;
  branch_id: number;
  //flock_id: number;
  //expense_id: number;
  entry_date: Date;
  description: string;
  lines: JournalLine[];
}) => {
  try {
    // Add validation for branch_id
    if (!payload.branch_id) {
      toast({
        title: "Error",
        description: "Please select a branch",
        variant: "destructive",
      });
      throw new Error("Branch selection required");
    }

    // Optional: Add validation for other required fields
    if (!payload.voucher_id) {
      toast({
        title: "Error",
        description: "Please select a voucher type",
        variant: "destructive",
      });
      throw new Error("Voucher type required");
    }

    if (!payload.entry_date) {
      toast({
        title: "Error",
        description: "Please select an entry date",
        variant: "destructive",
      });
      throw new Error("Entry date required");
    }

    if (!payload.lines || payload.lines.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one journal line",
        variant: "destructive",
      });
      throw new Error("Journal lines required");
    }

    const userId = getUserId();
    if (editingEntry) {
      await updateJournalEntry(
        editingEntry.journal_entry_id,
        payload.voucher_id,
        payload.branch_id,
       // payload.flock_id,
       // payload.expense_id,
        payload.entry_date.toISOString(),
        payload.description,
        payload.lines
      );
      toast({ title: "Updated", description: "Journal Entry updated successfully!" });
    } else {
      await createJournalEntry(
        payload.voucher_id,
        payload.branch_id,
      //  payload.flock_id,
      //  payload.expense_id,
        payload.entry_date,
        payload.description,
      //  userId,
        payload.lines
      );
      toast({ title: "Created", description: "Journal Entry created successfully!" });
    }
    setShowForm(false);
    setEditingEntry(null);
    loadJournalEntries();
  } catch (err) {
    console.error("Save Journal Entry failed", err);
    // Only show toast if it's not a validation error (validation errors already show toast)
    if (!err.message.includes("required")) {
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    }
    throw err; // Re-throw so form can catch it
  }
};






  const handleApproveJournalEnrtries = async () => {
    if (selectedJournalEntry.length === 0) return;

    try {
      await approveJournalEnrtries(selectedJournalEntry);
      toast({
        title: "Approved",
        description: `${selectedJournalEntry.length} voucher(s) approved successfully.`,
        duration: 3000,
      });

      setselectedJournalEntry([]);
      loadJournalEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve selected vouchers.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error approving vouchers:", error);
    }
  };

  const handleUnApproveJournalEnrtries = async () => {
    if (selectedJournalEntry.length === 0) return;

    try {
      await UnapproveJournalEnrtries(selectedJournalEntry);
      toast({
        title: "UnApproved",
        description: `${selectedJournalEntry.length} voucher(s) unapproved successfully.`,
        duration: 3000,
      });

      setselectedJournalEntry([]);
      loadJournalEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unapprove selected vouchers.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error unapproving vouchers:", error);
    }
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Journal Vouchers</CardTitle>
    <div className="flex gap-4 items-center">
      {/* Date Filters - Now Required */}

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="CREATED">Created</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
        </SelectContent>
      </Select>
    </div>
            <div className="flex justify-end gap-2 mt-2">
              {selectedJournalEntry.length > 0 && (
                <>
                  {selectedJournalEntry.some(id =>
                    entries.find(entry => entry.journal_entry_id === id)?.status === 'APPROVED'
                  ) && permissions.accounting_unapprove === 1 && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={handleUnApproveJournalEnrtries}
                    >
                      UnApprove ({selectedJournalEntry.length})
                    </Button>
                  )}
            
                  {selectedJournalEntry.some(id =>
                    entries.find(entry => entry.journal_entry_id === id)?.status === 'CREATED'
                  ) && permissions.accounting_approve === 1 && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleApproveJournalEnrtries}
                    >
                      Approve ({selectedJournalEntry.length})
                    </Button>
                  )}
                </>
              )}
            </div>
            <Button
              className="bg-gradient-to-r from-green-500 to-green-600 text-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search journal entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>


                <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <Label htmlFor="startDate" className="text-xs">From *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
            required
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="endDate" className="text-xs">To *</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
            required
          />
        </div>

                <div className="flex flex-col">
          <Label className="text-xs invisible">Apply</Label>
          <Button
            onClick={loadJournalEntries}
            disabled={!startDate || !endDate}
            className="bg-blue-500 hover:bg-blue-600 text-white h-10"
          >
            Apply Filter
          </Button>
        </div>
                  {/* Clear Dates Button */}
    {(startDate || endDate) && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setStartDate('');
          setEndDate('');
          setEntries([]); // Clear entries when clearing dates
        }}
        className="ml-2"
      >
        Clear Dates
      </Button>
    )}
      </div>
      

      
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
<input
  type="checkbox"
  checked={
    selectedJournalEntry.length > 0 &&
    selectedJournalEntry.length === filteredJE.filter(entry => 
      entry.status === 'CREATED' || entry.status === 'APPROVED'
    ).length
  }
  onChange={(e) => {
    if (e.target.checked) {
      setselectedJournalEntry(
        filteredJE
          .filter(entry => entry.status === 'CREATED' || entry.status === 'APPROVED')
          .map((entry) => entry.journal_entry_id)
      );
    } else {
      setselectedJournalEntry([]);
    }
  }}
  title="Select All CREATED/APPROVED"
  className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
/>
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Voucher No</TableHead>
                <TableHead>Branch Name</TableHead>
                {/* <TableHead>{branchFieldLabel}</TableHead> */}
                {/* {module_id === 2 && <TableHead>Flock</TableHead>} */}
                {/* <TableHead>Expense</TableHead>  */}
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJE.map((entry) => (
                <TableRow key={entry.journal_entry_id}>
                  <TableCell className='w-10'>
<input
  type="checkbox"
  checked={selectedJournalEntry.includes(entry.journal_entry_id)}
  disabled={entry.status !== 'CREATED' && entry.status !== 'APPROVED'}
  onChange={(e) => {
    const currentStatus = entry.status;
    
    // Filter selected entries to get only those in current filtered view
    const filteredSelectedEntries = selectedJournalEntry.filter(id => {
      const journalEntry = entries.find(en => en.journal_entry_id === id);
      return journalEntry && filteredJE.some(filteredEntry => filteredEntry.journal_entry_id === id);
    });

    const selectedStatuses = filteredSelectedEntries
      .map(id => entries.find(en => en.journal_entry_id === id)?.status)
      .filter(Boolean);

    if (
      selectedStatuses.length > 0 &&
      !selectedStatuses.includes(currentStatus)
    ) {
      toast({
        title: "Invalid Selection",
        description: "You can only select entries with the same status.",
        variant: "destructive",
      });
      return;
    }

    if (e.target.checked) {
      setselectedJournalEntry(prev => [...prev, entry.journal_entry_id]);
    } else {
      setselectedJournalEntry(prev =>
        prev.filter(id => id !== entry.journal_entry_id)
      );
    }
  }}
  className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
/>
                  </TableCell>
                  <TableCell>{entry.entry_date ? new Date(entry.entry_date).toLocaleDateString() : ''}</TableCell>
                  <TableCell className="font-mono">{entry.reference_number}</TableCell>
                  {/* <TableCell className="font-medium">{entry.voucher_name}</TableCell> */}
                  <TableCell className="font-medium">{entry.branch_name}</TableCell>
                  {/* {module_id === 2 && <TableCell className="font-medium">{entry.flock_name}</TableCell>} */}
                  {/* <TableCell className="font-medium">{entry.expense_name || 'N/A'}</TableCell>  */}
                  <TableCell>
                    <Badge className={getStatusColor(entry.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(entry.status)}
                        {entry.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{entry.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.status === "CREATED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                            title="Edit Voucher"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry)}
                            title="Delete Voucher"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePrintEntry(entry)}
                        title="Print Voucher"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg 
                     bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {showForm && (
        <JVForm
          entry={editingEntry}
          onClose={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          onSave={handleSaveEntry}
        />
      )}

      {printingEntry && (
        <JVPrintView
          entry={printingEntry}
          onClose={() => setPrintingEntry(null)}
              companyData={companyData} // Add this line

        />
      )}
    </>
  );
};

interface JVFormProps {
  onClose: () => void;
  onSave: (payload: {
    voucher_id: number;
    branch_id: number;
   // flock_id: number;
   // expense_id: number; // Add expense_id
    entry_date: Date;
    description: string;
    lines: JournalLine[];
  }) => void;
  entry: JV | null;
}

const JVForm: React.FC<JVFormProps> = ({ onClose, onSave, entry }) => {
  const [showBalanceError, setShowBalanceError] = useState(false);
  const [accountOpen, setAccountOpen] = useState<number | null>(null);
  const [branch_id, setBranchId] = useState<number>(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchOpen, setBranchOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]); // Add expenses state
  const [expenseOpen, setExpenseOpen] = useState(false); // Add expense popover state
  const [expense_id, setExpenseId] = useState<number>(0); // Add expense_id state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [voucher_id, setVoucherId] = useState<number>(10);
  const [entry_date, setEntryDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>('');
  const [flock_id, setFlockId] = useState<number>(0);
  const [flocks, setFlock] = useState<any[]>([]);
  const [flockOpen, setFlockOpen] = useState(false);
  const [entryLines, setEntryLines] = useState<JournalLine[]>([{ account_id: 0, item_id: 0, quantity: 0, rate: 0, debit: 0, credit: 0, description: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  // Determine field label based on module_id
 // const branchFieldLabel = module_id === 3 ? "Branch" : "Farm";
  const branchPlaceholder = "Select Branch" ;
  const branchSearchPlaceholder ="Search branches...";
  const branchNotFoundText = "No branch found.";

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [accountsData, branchData, vouchersData, expensesData] =
        await Promise.all([
          getAccounts(),
          getBranches(),
          getVouchers(),
          getExpense(),
        ]);

      // FIX: Show both CREATED and APPROVED branches (remove branch_id === 1 filter)
        const availableBranches = branchData.filter(
          (branch: Branch) => branch.status === "APPROVED" || branch.status === "CREATED"
        );

        setBranches(availableBranches);

        // Default branch = first available branch
        if (!entry && availableBranches.length > 0) {
          setBranchId(availableBranches[0].branch_id); 
        }

      setAccounts(accountsData);
      setVouchers(vouchersData);
      setExpenses(expensesData);

      if (entry) {
        setBranchId(entry.branch_id);
        setVoucherId(entry.voucher_id);
        setDescription(entry.description);
         if (entry.entry_date) {
  const date = new Date(entry.entry_date);
  const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
  setEntryDate(formattedDate);
}
      } else {
        setVoucherId(10);
        setDescription("");
      }
    } catch (err) {
      console.error("Error loading categories", err);
    }
  };

  fetchData();
}, [entry]);

  // useEffect(() => {
  //   if (!branch_id) return;

  //   const loadFlocks = async () => {
  //     try {
  //       const flockData = await getFlockByBranch(branch_id);
  //       setFlock(flockData);
  //     } catch (err) {
  //       console.error("Failed to load flocks for branch:", err);
  //     }
  //   };

  //   loadFlocks();
  // }, [branch_id]);

  const addLine = () => {
    setEntryLines(prevLines => [
      ...prevLines,
      { account_id: 0, item_id: 0, quantity: 0, rate: 0, description: '', debit: 0, credit: 0 }
    ]);
  };

  const removeLine = (index: number) => {
    const newLines = entryLines.filter((_, i) => i !== index);
    setEntryLines(newLines);
  };

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const newLines = [...entryLines];
    if (field === 'debit' || field === 'credit') {
      newLines[index] = { ...newLines[index], [field]: parseFloat(value) || 0 };
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    setEntryLines(newLines);
  };

  const totalDebit = entryLines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = entryLines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isBalanced) {
    setShowBalanceError(true);
    return;
  }
  setShowBalanceError(false);

  setIsSaving(true); // Start loading

  try {
    const payload = {
      voucher_id,
      branch_id,
     // flock_id,
     // expense_id, // Include expense_id in payload
      entry_date: new Date(entry_date),
      description,
      lines: entryLines.map((line) => ({
        account_id: line.account_id,
        item_id: line.item_id,
        quantity: line.quantity,
        rate: line.rate,
        debit: line.debit,
        credit: line.credit,
        description: line.description
      }))
    };

    console.log("Submitting payload:", payload);
    await onSave(payload); // Wait for save to complete
  } catch (error) {
    console.error("Save failed:", error);
    // Error is already shown by handleSaveEntry's toast
  } finally {
    setIsSaving(false); // Stop loading regardless of success or error
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[98vh] overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-2xl flex flex-col">

        {/* HEADER - Fixed at top */}
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <CardTitle className="text-lg sm:text-xl font-bold tracking-wide text-white">
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* CONTENT - Scrollable area */}
        <CardContent className="flex-grow overflow-y-auto px-3 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* TOP FORM SECTION */}
            <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                {/* DATE */}
                <div>
                  <Label className="text-indigo-700 text-xs sm:text-sm">Date</Label>
                  <Input
                    type="date"
                    value={entry_date}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="mt-1 bg-white border-purple-500 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 h-9 sm:h-10 text-sm"
                  />
                </div>

                {/* VOUCHER TYPE */}
                <div>
                  <Label className="text-indigo-700 text-xs sm:text-sm">Voucher Type</Label>
                  <select
                    value={voucher_id || ""}
                    onChange={(e) => setVoucherId(parseInt(e.target.value) || 0)}
                    required
                    className="mt-1 h-9 sm:h-10 w-full rounded-md border-purple-500 bg-white px-3 text-sm
                               focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="" disabled>Select a voucher type</option>
                    {vouchers
                      .filter(v => v.voucher_name === "JV")
                      .map(v => (
                        <option key={v.voucher_id} value={String(v.voucher_id)}>
                          {v.voucher_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* BRANCH */}
                <div>
                  <Label className="text-indigo-700 text-xs sm:text-sm">
                    Branch <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between mt-1 bg-gradient-to-r from-indigo-100 to-purple-100 border-purple-500 h-9 sm:h-10 text-sm",
                          !branch_id && "border-red-400 focus:ring-red-400"
                        )}
                      >
                        {branch_id
                          ? branches.find((br) => br.branch_id === branch_id)?.branch_name
                          : "Select Branch"}
                        <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[250px] overflow-auto bg-white w-[250px] sm:w-[300px]">
                      <Command>
                        <CommandInput placeholder="Search branches..." className="text-sm" />
                        <CommandEmpty>No branch found.</CommandEmpty>
                        <CommandGroup>
                          {branches.map((br) => (
                            <CommandItem
                              key={br.branch_id}
                              className="text-sm"
                              onSelect={() => {
                                setBranchId(br.branch_id);
                                setBranchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500",
                                  branch_id === br.branch_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {br.branch_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {!branch_id && (
                    <p className="text-red-500 text-xs mt-1">Branch selection is required</p>
                  )}
                </div>

                {/* DESCRIPTION - Full width */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label className="text-indigo-700 text-xs sm:text-sm">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="mt-1 bg-white border-purple-500 focus:ring-2 focus:ring-purple-400 h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* JOURNAL LINES SECTION */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-purple-700 mb-2">
                Journal Lines
              </h3>

              <div className="rounded-2xl overflow-hidden border border-purple-200 bg-white shadow-md">
                <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-gradient-to-r from-purple-500 to-indigo-500">
                        <TableHead className="text-white py-2 text-xs sm:text-sm">Account</TableHead>
                        <TableHead className="text-white py-2 text-xs sm:text-sm">Description</TableHead>
                        <TableHead className="text-white py-2 text-xs sm:text-sm">Debit</TableHead>
                        <TableHead className="text-white py-2 text-xs sm:text-sm">Credit</TableHead>
                        <TableHead className="text-white py-2 text-xs sm:text-sm w-10"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {entryLines.map((line, index) => (
                        <TableRow key={index} className="hover:bg-purple-50">
                          <TableCell className="py-1 px-1 sm:px-2">
                            <Popover
                              open={accountOpen === index}
                              onOpenChange={(open) => setAccountOpen(open ? index : null)}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between bg-indigo-50 border border-gray-300 text-black h-8 sm:h-9 text-xs sm:text-sm px-2 truncate"
                                >
                                  {line.account_id
                                    ? accounts.find((a) => a.account_id === line.account_id)?.account_name
                                    : "Select Account"}
                                  <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-60 ml-1 flex-shrink-0" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="bg-white w-[200px] sm:w-[250px]">
                                <Command>
                                  <CommandGroup className="max-h-[200px] overflow-auto">
                                    {accounts.map((a) => (
                                      <CommandItem
                                        key={a.account_id}
                                        onSelect={() => {
                                          updateLine(index, 'account_id', a.account_id);
                                          setAccountOpen(null);
                                        }}
                                        className="text-xs sm:text-sm"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500",
                                            line.account_id === a.account_id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {`${a.account_code} - ${a.account_name}`}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </TableCell>

                          <TableCell className="py-1 px-1 sm:px-2">
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(index, 'description', e.target.value)}
                              placeholder="Description"
                              className="bg-indigo-50 h-8 sm:h-9 text-xs sm:text-sm border-purple-500"
                            />
                          </TableCell>

                          <TableCell className="py-1 px-1 sm:px-2">
                            <Input
                              type="number"
                              value={line.debit || ''}
                              onChange={(e) => {
                                const debitValue = parseFloat(e.target.value) || 0;
                                if (debitValue > 0 && line.credit > 0) updateLine(index, 'credit', 0);
                                updateLine(index, 'debit', debitValue);
                              }}
                              step="0.01"
                              className={cn(
                                "h-8 sm:h-9 text-xs sm:text-sm border-purple-500",
                                line.credit > 0 ? "bg-gray-100 cursor-not-allowed" : "bg-indigo-50"
                              )}
                              disabled={line.credit > 0}
                              onWheel={(e) => e.currentTarget.blur()}
                            />
                          </TableCell>

                          <TableCell className="py-1 px-1 sm:px-2">
                            <Input
                              type="number"
                              value={line.credit || ''}
                              onChange={(e) => {
                                const creditValue = parseFloat(e.target.value) || 0;
                                if (creditValue > 0 && line.debit > 0) updateLine(index, 'debit', 0);
                                updateLine(index, 'credit', creditValue);
                              }}
                              step="0.01"
                              className={cn(
                                "h-8 sm:h-9 text-xs sm:text-sm border-purple-500",
                                line.debit > 0 ? "bg-gray-100 cursor-not-allowed" : "bg-indigo-50"
                              )}
                              disabled={line.debit > 0}
                              onWheel={(e) => e.currentTarget.blur()}
                            />
                          </TableCell>

                          <TableCell className="py-1 px-1 sm:px-2">
                            {entryLines.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLine(index)}
                                className="text-red-500 hover:bg-red-100 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <Button
                  type="button"
                  onClick={addLine}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add Line
                </Button>

                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm font-medium text-indigo-700">
                    Debit: Rs.{totalDebit.toFixed(2)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-indigo-700">
                    Credit: Rs.{totalCredit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* TOTALS & BALANCE */}
              <div className="mt-3 p-2 sm:p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center shadow-md">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-5 font-semibold text-xs sm:text-sm">
                  <span>Total Debit: Rs.{totalDebit.toFixed(2)}</span>
                  <span className="hidden sm:inline">|</span>
                  <span>Total Credit: Rs.{totalCredit.toFixed(2)}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs",
                    isBalanced ? "bg-green-600 text-white" : "bg-red-600 text-white"
                  )}>
                    {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                  </span>
                </div>

                {showBalanceError && (
                  <div className="mt-1 text-xs sm:text-sm text-yellow-200">
                    Journal entry must be balanced (total debits must equal total credits).
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm sm:text-base shadow-xl h-9 sm:h-10"
                disabled={!isBalanced || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Journal Entry'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="border-red-400 text-red-500 hover:bg-red-50 h-9 sm:h-10 text-sm sm:text-base"
              >
                Cancel
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};
// Add this function above your JVPrintView component
const amountInWords = (num: number): string => {
  if (num === 0) return 'Zero Rupees';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];
  
  const convertBelowThousand = (n: number): string => {
    if (n === 0) return '';
    
    let result = '';
    
    const hundreds = Math.floor(n / 100);
    if (hundreds > 0) {
      result += ones[hundreds] + ' Hundred ';
    }
    n %= 100;
    
    if (n > 0) {
      if (n < 10) {
        result += ones[n] + ' ';
      } else if (n < 20) {
        result += teens[n - 10] + ' ';
      } else {
        const ten = Math.floor(n / 10);
        const one = n % 10;
        result += tens[ten] + ' ';
        if (one > 0) {
          result += ones[one] + ' ';
        }
      }
    }
    
    return result.trim();
  };
  
  let integerPart = Math.floor(num);
  let decimalPart = Math.round((num - integerPart) * 100);
  
  if (integerPart === 0) {
    return 'Zero Rupees';
  }
  
  let words = '';
  let thousandIndex = 0;
  
  while (integerPart > 0) {
    const chunk = integerPart % 1000;
    if (chunk !== 0) {
      const chunkWords = convertBelowThousand(chunk);
      if (chunkWords) {
        words = chunkWords + (thousands[thousandIndex] ? ' ' + thousands[thousandIndex] + ' ' : '') + words;
      }
    }
    integerPart = Math.floor(integerPart / 1000);
    thousandIndex++;
  }
  
  words = words.trim() + ' Rupees';
  
  // Add paise if decimal part exists
  if (decimalPart > 0) {
    words += ' and ';
    if (decimalPart < 10) {
      words += ones[decimalPart] + ' Paise';
    } else if (decimalPart < 20) {
      words += teens[decimalPart - 10] + ' Paise';
    } else {
      const ten = Math.floor(decimalPart / 10);
      const one = decimalPart % 10;
      words += tens[ten];
      if (one > 0) {
        words += ' ' + ones[one];
      }
      words += ' Paise';
    }
  }
  
  return words + ' Only';
};

interface JVPrintViewProps {
  entry: JV;
  onClose: () => void;
  companyData: CompanyData | null;
}

const JVPrintView: React.FC<JVPrintViewProps> = ({ entry, onClose, companyData }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [masterData, setMasterData] = useState<{ accounts: any[], branches: any[],  vouchers: any[], expenses: any[] }>({
    accounts: [], branches: [],  vouchers: [], expenses: []
  });

  useEffect(() => {
    const fetchAllMasterData = async () => {
      try {
        const [accountsData, branchesData, vouchersData,  expensesData] = await Promise.all([
          getAccounts(),
          getBranches(),
          getVouchers(),
         
          getExpense(),
        ]);

        const approvedBranches = branchesData.filter((branch: any) => 
          branch.status === 'APPROVED'
        );

        setMasterData({
          accounts: accountsData,
          branches: approvedBranches,
         
          vouchers: vouchersData,
          expenses: expensesData,
        });
      } catch (error) {
        console.error("Error loading master data for print:", error);
        toast({ title: "Error", description: "Failed to load print master data.", variant: "destructive" });
      }
    };
    fetchAllMasterData();
  }, [entry.branch_id]);

  const getLogoSource = () => {
    return companyData?.image ;
  };

  const getAccountInfo = (accountId: number) => {
    const account = masterData.accounts.find(a => a.account_id === accountId);
    return {
      name: account?.account_name || 'Unknown Account',
      code: account?.account_code || 'N/A'
    };
  };

  const getMasterName = (list: any[], id: number, idKey: string, nameKey: string) => {
    const item = list.find(i => i[idKey] === id);
    return item?.[nameKey] || 'N/A';
  };

  const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  
  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };
  
  const formatNumber = (num: number | string): string => {
    if (num === null || num === undefined || num === '') return '0';

    const numberValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numberValue)) return '0';

    const hasDecimals = numberValue % 1 !== 0;

    return numberValue.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0
    });
  };

  const handlePrint = () => {
    if (!componentRef.current) return;

    const printWindow = window.open('', 'PRINT', 'height=600,width=800');
    if (!printWindow) {
      alert('Could not open print window. Please allow popups.');
      return;
    }

    const content = componentRef.current.innerHTML;

    printWindow.document.write('<html><head><title>Journal Voucher</title>');
    printWindow.document.write(`
  <style>
      @page {
        margin-top: 0;    
      }
      body { font-family: Arial, sans-serif; margin: 20px; }
      @media print {
        .no-print { display: none; }
        .print-container { page-break-before: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
        th {
          white-space: nowrap;
        } 
        .master-data-box { 
          border: 1px solid #000; 
          padding: 15px; 
          margin: 15px 0; 
        }
        .master-data-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px;
        }
        .master-data-col { 
          display: flex; 
          flex-direction: column;
        }
        .master-data-col:first-child {
          border-right: 1px solid #000;
          padding-right: 15px;
        }
        .master-data-col:last-child {
          padding-left: 15px;
        }
        .master-data-item { 
          display: flex; 
          align-items: center;
          padding: 5px 0; 
          font-size: 11px;
        }
        .master-data-label { 
          font-weight: bold; 
          margin-right: 5px;
          min-width: 80px;
          font-size: 12px;
        }
        .totals-row td { font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .signature-block { display: flex; justify-content: space-between; margin-top: 60px; }
        .signature-item { text-align: center; width: 30%; font-size: 12px; }
        .signature-line { border-top: 0.8px solid #000; margin-bottom: 5px; width: 80%; }
        
        .voucher-header {
          display: flex;
          justify-content: start;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
        }
        .logo-section {
          display: flex;
          align-items: start;
        }
        .logo {
          width: 180px;  
          height: auto;
          object-fit: contain;
        }
        .title-section { 
          width: 60%; 
          text-align: center; 
          font-size: 12px;
        }
        .amount-in-words {
          margin-top: 20px;
          padding: 10px;
          border: 1px solid #000;
          font-size: 12px;
          min-height: 40px;
        }
        .amount-label {
          font-weight: bold;
          margin-right: 10px;
          white-space: nowrap;
        }
      }
      .modal-content-wrapper {
        padding: 20px;
        background: white;
      }
    </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="print-container">');
    printWindow.document.write(content);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
      onClose();
    };
  };

  const isLoading = masterData.accounts.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between no-print">
          <CardTitle>Print Journal Voucher</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={handlePrint}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Print'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto modal-content-wrapper">
          {isLoading ? (
            <div className="text-center py-10">Loading voucher details...</div>
          ) : (
            <div ref={componentRef}>
              {/* Updated Voucher Header with logo in top left */}
              <div className="voucher-header">
                <div className="logo-section">
                  <img
                    src={getLogoSource()}
                    alt={companyData?.company_name || "Company Logo"}
                    className="logo"
                  />
                </div>
                <div className="title-section">
                  <h1 className="text-xl font-bold uppercase">Journal Voucher</h1>
                </div>
              </div>

              <div className="master-data-box">
                <div className="master-data-grid">
                  <div className="master-data-col">
                    <div className="master-data-item">
                      <span className="master-data-label">Date: </span>
                      <span>{formatDate(entry.entry_date)}</span>
                    </div>
                    <div className="master-data-item">
                      <span className="master-data-label">Voucher No: </span>
                      <span>{entry.reference_number || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="master-data-col">
                    <div className="master-data-item">
                      <span className="master-data-label">Branch: " </span>
                      <span>{getMasterName(masterData.branches, entry.branch_id, 'branch_id', 'branch_name')}</span>
                    </div>
                    <div className="master-data-item">
                      <span className="master-data-label">Status: </span>
                      <span>{entry.status || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

              <Table className="border border-black">
                <TableHeader>
                  <TableRow className="bg-gray-200">
                    <TableHead className="font-bold border-black whitespace-nowrap">Account Code</TableHead>
                    <TableHead className="font-bold border-black">Account Name</TableHead>
                    <TableHead className="font-bold border-black">Narration</TableHead>
                    <TableHead className="font-bold border-black whitespace-nowrap">Debit (Rs.)</TableHead>
                    <TableHead className="font-bold border-black whitespace-nowrap">Credit (Rs.)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.lines.map((line, index) => {
                    const accountInfo = getAccountInfo(line.account_id);
                    return (
                      <TableRow key={index}>
                        <TableCell className="border-black">{accountInfo.code}</TableCell>
                        <TableCell className="border-black">{accountInfo.name.toUpperCase()}</TableCell>
                        <TableCell className="border-black">{(line.description || entry.description || "").toUpperCase()}</TableCell>
                        <TableCell className="border-black text-right">{formatNumber(line.debit)}</TableCell>
                        <TableCell className="border-black text-left">{formatNumber(line.credit)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="totals-row bg-gray-100">
                    <TableCell colSpan={3} className="font-bold text-right border-black">TOTALS:</TableCell>
                    <TableCell className="font-bold text-left border-black">{formatNumber(totalDebit)}</TableCell>
                    <TableCell className="font-bold text-left border-black">{formatNumber(totalCredit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Amount in Words Section - Added here */}
              <div className="amount-in-words mt-4 border border-black p-3">
                <div className="flex items-start">
                  <span className="amount-label font-bold">Amount in Words:</span>
                  <span className="text-sm uppercase flex-1">{amountInWords(totalDebit)}</span>
                </div>
              </div>

              <div className="signature-block">
                <div className="signature-item text-center min-w-[140px]">
                  <span>{entry.created_by}</span>
                  <div className="signature-line"></div>
                  <span>Prepared By</span>
                </div>

                <div className="signature-item text-center min-w-[140px]">
                  <span>{entry.created_by}</span>
                  <div className="signature-line"></div>
                  <span>Checked By</span>
                </div>
                <div className="signature-item text-center min-w-[140px]">
                  <span>{entry.updated_by}</span>
                      <br />

                  <div className="signature-line"></div>
                  <span>Approved By</span>
                </div>

                                                                  <div className="signature-item text-center min-w-[140px]">
    <br />
                   <div className="signature-line"></div>
    <span>Received By</span>
  </div>
              </div>

              <p className="text-sm mt-10 text-gray-500 text-center">**This is a system generated voucher and does not require a signature or stamp.**</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JV;