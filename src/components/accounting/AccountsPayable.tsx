import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Clock, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import PaymentForm from '@/components/forms/PaymentForm';

interface APBill {
  id: string;
  billNumber: string;
  vendor: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Overdue' | 'Pending';
}

const AccountsPayable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<APBill | null>(null);
  const [bills, setBills] = useState<APBill[]>([
    {
      id: '1',
      billNumber: 'BILL-001',
      vendor: 'Office Supplies Co',
      date: '2024-01-01',
      dueDate: '2024-01-31',
      amount: 1200.00,
      paid: 1200.00,
      balance: 0.00,
      status: 'Paid'
    },
    {
      id: '2',
      billNumber: 'BILL-002',
      vendor: 'Utilities Inc',
      date: '2024-01-05',
      dueDate: '2024-02-04',
      amount: 850.00,
      paid: 0.00,
      balance: 850.00,
      status: 'Pending'
    }
  ]);

  const filteredBills = bills.filter(bill => 
    bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const totalOutstanding = bills.reduce((sum, bill) => sum + bill.balance, 0);
  const overdueAmount = bills.filter(bill => bill.status === 'Overdue').reduce((sum, bill) => sum + bill.balance, 0);
  const totalBilled = bills.reduce((sum, bill) => sum + bill.amount, 0);

  const handleNewPayment = () => {
    setEditingBill(null);
    setShowForm(true);
  };

  const handleEditBill = (bill: APBill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleSavePayment = (paymentData: any) => {
    if (editingBill) {
      setBills(bills.map(bill => 
        bill.id === editingBill.id ? { ...bill, paid: bill.paid + paymentData.amount, balance: bill.balance - paymentData.amount } : bill
      ));
    } else {
      const newBill = {
        ...paymentData,
        id: Date.now().toString(),
        billNumber: paymentData.invoiceNumber,
        vendor: paymentData.vendor,
        date: paymentData.paymentDate,
        dueDate: paymentData.paymentDate,
        paid: paymentData.amount,
        balance: 0,
        status: 'Paid' as const
      };
      setBills([newBill, ...bills]);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalOutstanding.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">
                ${overdueAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Billed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${totalBilled.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Accounts Payable</CardTitle>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-purple-600"
                onClick={handleNewPayment}
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bills..."
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
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono">{bill.billNumber}</TableCell>
                    <TableCell className="font-medium">{bill.vendor}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.dueDate}</TableCell>
                    <TableCell className="font-mono">${bill.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-green-600">
                      ${bill.paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-red-600">
                      ${bill.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bill.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditBill(bill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <PaymentForm
          payment={editingBill}
          onClose={() => setShowForm(false)}
          onSave={handleSavePayment}
        />
      )}
    </>
  );
};

export default AccountsPayable;