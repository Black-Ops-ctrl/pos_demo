import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown } from 'lucide-react';
import { useAppContext, Vendor } from '@/contexts/AppContext';
import { getPRs,createPR, updatePR,deletePR } from '@/api/prApi';
import { getDepartments } from '@/api/departmentApi';
import { getItems } from '@/api/itemsApi';

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
import { useToast } from '@/hooks/use-toast';
import { addItem } from '@/api/itemsApi';
import { get } from 'node:http';
import { set } from 'date-fns';

interface PR {
  pr_id: number;
  created_by: number;
  status: string;
  remarks: string;
  item_id?: number;
  item_name: string;
  qty: number;
  updated_date: string;
  dep_id?: number;
  dep_name: string;
  approved_by?: number;
    created_date: string;

}
const PurchaseRequisition: React.FC = () => {
 const [searchTerm, setSearchTerm] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [purchaseRequisitions, setPurchaseRequisitions] = useState<PR[]>([]);
   const [editingPR, setEditingPR] = useState<PR | null>(null);
//Load Purchase Requisitions
  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    try {
      const data = await getPRs();
      setPurchaseRequisitions(data);
    } catch (error) {
      console.error("Error loading purchase requisitions", error);
    }
  };

const { toast } = useToast();
  const handleAddPR = () => {
    setEditingPR(null);
    setShowForm(true);
  };
const handleEditPR = (pr: PR) => {
    setEditingPR(pr);
    setShowForm(true);
  };
 const handleSavePR = async (prData: Omit<PR, "pr_id">) => {
    try {
      if (editingPR) {
        await updatePR(
          editingPR.pr_id,
          prData.created_by,
          prData.status,
          prData.remarks,
          prData.item_id,
          prData.qty,
          prData.approved_by,
          prData.dep_id // Add dep_id as the 9th argument
        );
         toast({ title: "Updated", description: "PR updated successfully!" , duration: 3000 });
      } else {
        await createPR(
          prData.created_by,
          prData.status,
          prData.remarks,
          prData.item_id,
          prData.qty,
          prData.approved_by,
          prData.dep_id
        );
        toast({ title: "Created", description: "PR created successfully!", duration: 3000 });
      }
      setShowForm(false);
      loadPRs();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save PR", variant: "destructive", duration: 3000 });
      console.error("Error saving PR", error);
    }
  };

  
  const handleDeletePR = async (prId: number) => {
    if (confirm("Are you sure you want to delete this PR?")) {
      try {
        await deletePR(prId);
        toast({ title: "Deleted", description: "PR deleted successfully!", duration: 3000 });
        loadPRs();
      } catch (error) {
        console.error("Error deleting PR", error);
        toast({ title: "Error", description: "Failed to delete PR", variant: "destructive", duration: 3000 });
      }
    }
  };

     const filteredPR = purchaseRequisitions.filter((pr) =>
    pr.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.dep_name.toString().includes(searchTerm)
  );
  const totalPRs = purchaseRequisitions.length;
  const createdPRs = purchaseRequisitions.filter(pr => pr.status === 'CREATED').length;
  const approvedPRs = purchaseRequisitions.filter(pr => pr.status === 'APPROVED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'RECEIVED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPRs}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{createdPRs}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{approvedPRs}</div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchase Requisitions
            </CardTitle>
           <Button
              onClick={handleAddPR}
              className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create PR
                </Button>
          </div>
         <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search Purchase Requisitions..."
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
                
                <TableHead>PR ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Status</TableHead>
               
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPR.map((pr) => (
                <TableRow key={pr.pr_id}>
                  <TableCell className="font-medium">{pr.pr_id}</TableCell>
                  <TableCell>{pr.item_name}</TableCell>
                  <TableCell>{pr.dep_name}</TableCell>
                  <TableCell>
                 {new Date(pr.created_date).toLocaleString('en-PK',
                         {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}
                  </TableCell>
                 <TableCell>{pr.qty}</TableCell>
                 <TableCell>{pr.remarks}</TableCell>
                  <TableCell>{pr.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPR(pr)}
                         >
                        <Edit className="h-4 w-4" />
                    </Button>
                <Button 
                     size="sm" 
                    variant="outline"
                     className="text-red-600 hover:text-red-700"
                       onClick={() => handleDeletePR(pr.pr_id)}
                         >
                        <Trash2 className="h-4 w-4" />
                       </Button>
                         </div>
                         </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
     {showForm && (
        <PRForm pr={editingPR} onClose={() => setShowForm(false)} onSave={handleSavePR} />
      )}
    </div>
  );
};

const PRForm: React.FC<{
  pr: PR | null;
  onClose: () => void;
  onSave: (data: Omit<PR, "pr_id">) => void;
}> = ({ pr, onClose, onSave }) => {
  const [item_id, setItemId] =useState<number>(0);
  const [items, setItems] = useState<any[]>([]);
  const [openItem, setOpenItem] = useState(false);

  const [dep_id, setDepId] = useState<number>(0);
  const [departments, setDepartments] = useState<any[]>([]);
  const [openDep, setOpenDep] = useState(false);

const [qty, setQty] = useState<number>(0);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("CREATED");
  const [created_by, setCreatedBy] = useState<number>(0);
  const [approved_by, setApprovedBy] = useState<number | null>(null);
  // Load items and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsData = await getItems();
        const departmentsData = await getDepartments();
        setItems(itemsData);
        setDepartments(departmentsData);
        if (pr) {
          setCreatedBy(pr.created_by || null);
          setStatus(pr.status || "CREATED");
          setRemarks(pr.remarks || "");
          setItemId(pr.item_id || 0);
          setQty(pr.qty || 0);
          setApprovedBy(pr.approved_by || null);
          setDepId(pr.dep_id || null);
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [pr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item_id || !dep_id || !remarks || !qty) {
      alert("Please fill all fields.");
      return;
    }

    onSave({
        created_by,
        status,
        remarks,
        item_id,
        qty,
        approved_by,
        dep_id,
        item_name: '',
        updated_date: '',
        dep_name: '',
        created_date: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {pr ? "Edit PR" : "Add PR"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selection */}
          <Popover open={openItem} onOpenChange={setOpenItem}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {item_id
                  ? `${items.find((i) => i.item_id === item_id)?.item_name} (${items.find((i) => i.item_id === item_id)?.item_code})`
                  : "Select Item"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command>
                <CommandInput placeholder="Search items..." />
                <CommandEmpty>No item found.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.item_id}
                      onSelect={() => {
                        setItemId(item.item_id);
                        setOpenItem(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", item_id === item.item_id ? "opacity-100" : "opacity-0")} />
                      {item.item_name} ({item.item_code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Department Selection */}
          <Popover open={openDep} onOpenChange={setOpenDep}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {dep_id
                  ? `${departments.find((d) => d.dep_id === dep_id)?.dep_name}`
                  : "Select Department"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command>
                <CommandInput placeholder="Search departments..." />
                <CommandEmpty>No department found.</CommandEmpty>
                <CommandGroup>
                  {departments.map((dep) => (
                    <CommandItem
                      key={dep.dep_id}
                      onSelect={() => {
                        setDepId(dep.dep_id);
                        setOpenDep(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", dep_id === dep.dep_id ? "opacity-100" : "opacity-0")} />
                      {dep.dep_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Quantity */}
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            placeholder="Quantity"
          />

          {/* Remarks */}
          <Input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Remarks"
          />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
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


export default PurchaseRequisition;