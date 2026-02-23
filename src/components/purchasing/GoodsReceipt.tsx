import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Package, AlertTriangle, CheckCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getGRNs, createGRN, getPODetails } from '@/api/grnApi';
import { getPurchaseOrders } from '@/api/poApi';
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
import { useNavigate } from 'react-router-dom';


interface GRNItem {
  item_id: number;
  item_code: string;
  item_name: string;
  ordered_qty: number;
  received_qty: number;
  rejected_qty: number;
  unit_price: number;

}
interface GRN {
  grn_id: number; 
  po_id: number;
  vendor_name: string;
  created_date: string;
  created_by: string;
  remarks: string;
  items: GRNItem[];
  status: string;
 
}

const GoodsReceipt: React.FC = () => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadGRNs();
  }, []);

  const loadGRNs = async () => {
    try {
      const data = await getGRNs();
      setGrns(data);
    } catch (error) {
      console.error('Error loading GRNs', error);
    }
  };

  const handleAddGRN = () => {
    setShowForm(true);
  };

  const handleSaveGRN = async (
    po_id: number,
    vendor_id: number,
    created_by: number,
    remarks: string,
    items: GRNItem[]
  ) => {
    try {
      await createGRN(po_id, vendor_id, created_by, remarks, items);
      toast({ title: 'Created', description: 'GRN created successfully!', duration: 3000 });
      setShowForm(false);
      loadGRNs();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create GRN." + error.message, variant: "destructive", duration: 3000 });
      console.error('Error saving GRN', error);
    }
  };
 
  const filteredGRNs = grns.filter(
    (grn) =>
      grn.grn_id.toString().includes(searchTerm) ||
      grn.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 

  const totalGRNs = grns.length;
  const completedGRNs = grns.filter((grn) => grn.status === 'Completed').length;
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total GRNs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGRNs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed GRNs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGRNs}</div>
          </CardContent>
        </Card>
       
      </div>

      {/* GRN Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Goods Receipt Notes
            </CardTitle>
            <Button onClick={handleAddGRN} className="bg-gradient-to-r from-purple-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" /> Create GRN
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by PO or Vendor..."
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
                <TableHead>GRN ID</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead> Created Date</TableHead>
                <TableHead> Created By</TableHead>
                <TableHead>Status</TableHead>
               
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGRNs.map((grn) => (
                <TableRow key={grn.grn_id}
                onClick={() => navigate(`/grn/${grn.grn_id}`)} className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>{grn.grn_id}</TableCell>
                  <TableCell>{grn.po_id}</TableCell>
                   <TableCell>{grn.vendor_name}</TableCell>
                  <TableCell>{new Date(grn.created_date).toLocaleString('en-PK',
                         {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}</TableCell>
                  <TableCell>{grn.created_by}</TableCell>
                  <TableCell>
                    <Badge variant={grn.status === 'Completed' ? 'default' : 'secondary'}>
                      {grn.status}
                    </Badge>
                  </TableCell>

                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && <GRNForm onClose={() => setShowForm(false)} onSave={handleSaveGRN} />}
    </div>
  );
};

const GRNForm: React.FC<{
  onClose: () => void;
  onSave: (
    po_id: number,
    vendor_id: number,
    created_by: number,
    remarks: string,
    items: GRNItem[]
  ) => void;
}> = ({ onClose, onSave }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null); // PO info
  const [poItems, setPoItems] = useState<GRNItem[]>([]); // Table items
  const [openPO, setOpenPO] = useState(false);
  const [received_by, setReceivedBy] = useState("");
  const [remarks, setRemarks] = useState("");

  //  Fetch PO list
  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const data = await getPurchaseOrders();
        setPurchaseOrders(data);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };
    fetchPOs();
  }, []);

  //  Fetch PO details (only update items)
  const fetchPODetails = async (po_id: number) => {
    try {
      const data = await getPODetails(po_id);
      const formattedItems: GRNItem[] = data.items.map((item: any) => ({
        item_id: item._item_id,
        item_code: item.item_code,
        item_name: item.item_name,
        ordered_qty: Number(item.quantity),
        received_qty: 0,
        rejected_qty: 0,
        unit_price: item.unit_price,
      }));
      setPoItems(formattedItems);
    } catch (error) {
      console.error("Error fetching PO details:", error);
    }
  };

  //  Handle PO selection
  const handleSelectPO = (po: any) => {
    setSelectedPO(po); // Keep vendor_name, po_id, vendor_id, etc.
    setOpenPO(false);
    fetchPODetails(po.po_id); // Load table separately
  };

  const handleItemChange = (
    index: number,
    field: "received_qty" | "rejected_qty",
    value: number
  ) => {
    const updated = [...poItems];
    updated[index][field] = value;
    setPoItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) {
      alert("Please select a Purchase Order");
      return;
    }

    onSave(
      selectedPO.po_id,
      selectedPO.vendor_id,
      Number(received_by),
      remarks,
      poItems
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Add GRN</h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Purchase Order Selection */}
          <div>
            <label className="block text-sm font-medium mb-0">Purchase Order</label>
            <Popover open={openPO} onOpenChange={setOpenPO}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedPO
                    ? `PO-${selectedPO.po_id} (${selectedPO.vendor_name})`
                    : "Select Purchase Order"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-h-[300px] overflow-auto">
                <Command>
                  <CommandInput placeholder="Search purchase orders..." />
                  <CommandEmpty>No purchase order found.</CommandEmpty>
                  <CommandGroup>
                    {purchaseOrders.map((po) => (
                      <CommandItem
                        key={po.po_id}
                        onSelect={() => handleSelectPO(po)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPO?.po_id === po.po_id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        PO-{po.po_id} ({po.vendor_name})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <Input value={selectedPO?.vendor_name || ""} readOnly />
          </div>

          {/* Created By */}
          <div>
            <label className="block text-sm font-medium mb-1">Created By (User ID)</label>
            <Input
              type="number"
              value={received_by}
              onChange={(e) => setReceivedBy(e.target.value)}
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <Input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Items Table */}
          <div>
            <label className="block text-sm font-medium mb-1">Items</label>
            <div className="overflow-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Item Code</th>
                    <th className="border p-2">Item Name</th>
                    <th className="border p-2">Ordered Qty</th>
                    <th className="border p-2">Received Qty</th>
                    <th className="border p-2">Rejected Qty</th>
                    <th className="border p-2">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item, index) => (
                    <tr key={item.item_id}>
                      <td className="border p-2">{item.item_code}</td>
                      <td className="border p-2">{item.item_name}</td>
                      <td className="border p-2">{Number(item.ordered_qty)}</td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          value={item.received_qty}
                          onChange={(e) =>
                            handleItemChange(index, "received_qty", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          value={item.rejected_qty}
                          onChange={(e) =>
                            handleItemChange(index, "rejected_qty", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="border p-2">{item.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end mt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoodsReceipt;
