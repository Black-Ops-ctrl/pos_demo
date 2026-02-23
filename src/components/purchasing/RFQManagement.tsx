import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Send, Eye, CheckCircle, XCircle } from 'lucide-react';

const RFQManagement: React.FC = () => {
  const [rfqs, setRfqs] = useState([
    {
      id: 'RFQ001',
      date: '2024-01-15',
      vendor: 'ABC Suppliers Ltd',
      items: [
        { itemCode: 'ITM001', description: 'Steel Rods', quantity: 100, unit: 'Kg' }
      ],
      status: 'Sent',
      validUntil: '2024-01-30',
      quotedPrice: 15000,
      responseDate: '2024-01-18'
    },
    {
      id: 'RFQ002',
      date: '2024-01-16',
      vendor: 'XYZ Trading Co',
      items: [
        { itemCode: 'ITM002', description: 'Aluminum Sheets', quantity: 50, unit: 'Pcs' }
      ],
      status: 'Draft',
      validUntil: '2024-01-31',
      quotedPrice: null,
      responseDate: null
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [formData, setFormData] = useState({
    vendor: '',
    validUntil: '',
    items: [{ itemCode: '', description: '', quantity: '', unit: 'Pcs' }]
  });

  const vendors = ['ABC Suppliers Ltd', 'XYZ Trading Co', 'DEF Industries', 'GHI Materials'];
  const units = ['Pcs', 'Kg', 'Ltr', 'Mtr', 'Box'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRFQ = {
      id: `RFQ${String(rfqs.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      vendor: formData.vendor,
      items: formData.items.map(item => ({
        ...item,
        quantity: Number(item.quantity)
      })),
      status: 'Draft',
      validUntil: formData.validUntil,
      quotedPrice: null,
      responseDate: null
    };
    setRfqs([...rfqs, newRFQ]);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      vendor: '',
      validUntil: '',
      items: [{ itemCode: '', description: '', quantity: '', unit: 'Pcs' }]
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemCode: '', description: '', quantity: '', unit: 'Pcs' }]
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const sendRFQ = (rfqId: string) => {
    setRfqs(rfqs.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: 'Sent' } : rfq
    ));
  };

  const convertToPO = (rfqId: string) => {
    setRfqs(rfqs.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: 'Converted' } : rfq
    ));
  };

  const viewRFQ = (rfq) => {
    setSelectedRFQ(rfq);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Sent': return 'default';
      case 'Quoted': return 'outline';
      case 'Converted': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">RFQ Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create RFQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New RFQ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 p-2 border rounded">
                      <Input
                        placeholder="Item Code"
                        value={item.itemCode}
                        onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                      />
                      <Select value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedItems = formData.items.filter((_, i) => i !== index);
                          setFormData({ ...formData, items: updatedItems });
                        }}
                        disabled={formData.items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create RFQ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFQ List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Quoted Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-medium">{rfq.id}</TableCell>
                  <TableCell>{rfq.date}</TableCell>
                  <TableCell>{rfq.vendor}</TableCell>
                  <TableCell>{rfq.items.length} item(s)</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(rfq.status)}>
                      {rfq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{rfq.validUntil}</TableCell>
                  <TableCell>
                    {rfq.quotedPrice ? `$${rfq.quotedPrice.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => viewRFQ(rfq)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      {rfq.status === 'Draft' && (
                        <Button size="sm" variant="outline" onClick={() => sendRFQ(rfq.id)}>
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                      {rfq.status === 'Quoted' && (
                        <Button size="sm" variant="outline" onClick={() => convertToPO(rfq.id)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>RFQ Details - {selectedRFQ?.id}</DialogTitle>
          </DialogHeader>
          {selectedRFQ && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <p className="font-medium">{selectedRFQ.vendor}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{selectedRFQ.date}</p>
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <p className="font-medium">{selectedRFQ.validUntil}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusColor(selectedRFQ.status)}>
                    {selectedRFQ.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRFQ.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemCode}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {selectedRFQ.quotedPrice && (
                <div>
                  <Label>Quoted Price</Label>
                  <p className="font-medium text-lg">${selectedRFQ.quotedPrice.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RFQManagement;