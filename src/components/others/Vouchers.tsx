import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getVouchers, addVoucher, updateVoucher, getVoucherByID } from "@/api/vouchersApi";

interface Voucher {
  voucher_id: number;
  voucher_name: string;
  description: string;
}

const Vouchers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Fetch vouchers on load
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Error loading branches", error);
    }
  };

  const handleAddVoucher = () => {
    setEditingVoucher(null);
    setShowForm(true);
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setShowForm(true);
  };

  const handleSaveVoucher = async (voucherData: Omit<Voucher, "voucher_id">) => {
    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher.voucher_id, voucherData.voucher_name, voucherData.description);
      } else {
        await addVoucher(voucherData.voucher_name, voucherData.description);
      }
      setShowForm(false);
      loadVouchers();
    } catch (error) {
      console.error("Error saving voucher", error);
    }
  };



  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.voucher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vouchers</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAddVoucher}>
              <Plus className="h-4 w-4 mr-2" />
              Add Voucher
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search branches..."
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
                <TableHead>Voucher Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.voucher_id}>
                  <TableCell className="font-medium">{voucher.voucher_name}</TableCell>
                  <TableCell>{voucher.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditVoucher(voucher)}>
                        <Edit className="h-4 w-4" />
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
        <VoucherForm voucher={editingVoucher} onClose={() => setShowForm(false)} onSave={handleSaveVoucher} />
      )}
    </>
  );
};

const VoucherForm: React.FC<{
  voucher: Voucher | null;
  onClose: () => void;
  onSave: (data: Omit<Voucher, "voucher_id">) => void;
}> = ({ voucher, onClose, onSave }) => {
  const [voucher_name, setVoucherName] = useState(voucher?.voucher_name || "");
  const [description, setDescription] = useState(voucher?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ voucher_name, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">{voucher ? "Edit Voucher" : "Add Voucher"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Voucher Name" value={voucher_name} onChange={(e) => setVoucherName(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Vouchers;
