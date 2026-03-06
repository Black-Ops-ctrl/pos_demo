import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Package } from 'lucide-react';

interface StockTransaction {
  id: string;
  type: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  item: string;
  quantity: number;
  warehouse: string;
  reference: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  reason?: string;
}

const StockTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([
    { id: '1', type: 'receipt', item: 'Laptop Computer', quantity: 50, warehouse: 'Main Warehouse', reference: 'GRN-001', date: '2024-01-15', status: 'completed' },
    { id: '2', type: 'issue', item: 'Office Chair', quantity: 10, warehouse: 'Main Warehouse', reference: 'SO-001', date: '2024-01-16', status: 'completed' },
    { id: '3', type: 'transfer', item: 'Wireless Mouse', quantity: 25, warehouse: 'Main Warehouse', reference: 'ST-001', date: '2024-01-17', status: 'pending' },
    { id: '4', type: 'adjustment', item: 'Desk Lamp', quantity: -5, warehouse: 'Secondary Warehouse', reference: 'ADJ-001', date: '2024-01-18', status: 'completed', reason: 'Damaged goods' }
  ]);

  const [newTransaction, setNewTransaction] = useState({
    type: 'receipt' as const,
    item: '',
    quantity: 0,
    warehouse: '',
    reference: '',
    reason: ''
  });

  const items = ['Laptop Computer', 'Office Chair', 'Wireless Mouse', 'Desk Lamp', 'Raw Material A'];
  const warehouses = ['Main Warehouse', 'Secondary Warehouse', 'Retail Store'];
  const transactionTypes = [
    { value: 'receipt', label: 'Goods Receipt', icon: ArrowUpCircle, color: 'text-green-500' },
    { value: 'issue', label: 'Goods Issue', icon: ArrowDownCircle, color: 'text-red-500' },
    { value: 'transfer', label: 'Stock Transfer', icon: ArrowRightLeft, color: 'text-blue-500' },
    { value: 'adjustment', label: 'Stock Adjustment', icon: Package, color: 'text-yellow-500' }
  ];

  const handleAddTransaction = () => {
    if (newTransaction.item && newTransaction.warehouse && newTransaction.reference) {
      const transaction: StockTransaction = {
        id: Date.now().toString(),
        type: newTransaction.type,
        item: newTransaction.item,
        quantity: newTransaction.quantity,
        warehouse: newTransaction.warehouse,
        reference: newTransaction.reference,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        reason: newTransaction.reason || undefined
      };
      setTransactions([transaction, ...transactions]);
      setNewTransaction({ type: 'receipt', item: '', quantity: 0, warehouse: '', reference: '', reason: '' });
    }
  };

  const getTransactionIcon = (type: string) => {
    const transactionType = transactionTypes.find(t => t.value === type);
    if (transactionType) {
      const Icon = transactionType.icon;
      return <Icon className={`h-4 w-4 ${transactionType.color}`} />;
    }
    return <Package className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receipt': return 'bg-green-100 text-green-800';
      case 'issue': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const receiptTransactions = transactions.filter(t => t.type === 'receipt');
  const issueTransactions = transactions.filter(t => t.type === 'issue');
  const transferTransactions = transactions.filter(t => t.type === 'transfer');
  const adjustmentTransactions = transactions.filter(t => t.type === 'adjustment');

  const TransactionTable = ({ data }: { data: StockTransaction[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {getTransactionIcon(transaction.type)}
                <Badge className={getTypeColor(transaction.type)}>
                  {transaction.type}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="font-medium">{transaction.item}</TableCell>
            <TableCell className={transaction.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
              {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
            </TableCell>
            <TableCell>{transaction.warehouse}</TableCell>
            <TableCell>{transaction.reference}</TableCell>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell>{transaction.reason || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {transactionTypes.map((type) => {
          const count = transactions.filter(t => t.type === type.value).length;
          const Icon = type.icon;
          return (
            <Card key={type.value} className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{type.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <span className="text-2xl font-bold">{count}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Transactions</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Stock Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Transaction Type</Label>
                    <Select value={newTransaction.type} onValueChange={(value: any) => setNewTransaction({...newTransaction, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="item">Item</Label>
                    <Select value={newTransaction.item} onValueChange={(value) => setNewTransaction({...newTransaction, item: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map(item => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      value={newTransaction.quantity} 
                      onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouse">Warehouse</Label>
                    <Select value={newTransaction.warehouse} onValueChange={(value) => setNewTransaction({...newTransaction, warehouse: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(warehouse => (
                          <SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input 
                      id="reference" 
                      value={newTransaction.reference} 
                      onChange={(e) => setNewTransaction({...newTransaction, reference: e.target.value})} 
                      placeholder="e.g., GRN-001, SO-001"
                    />
                  </div>
                  {newTransaction.type === 'adjustment' && (
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Input 
                        id="reason" 
                        value={newTransaction.reason} 
                        onChange={(e) => setNewTransaction({...newTransaction, reason: e.target.value})} 
                        placeholder="Reason for adjustment"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleAddTransaction}>Create Transaction</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
              <TabsTrigger value="receipt">Receipt ({receiptTransactions.length})</TabsTrigger>
              <TabsTrigger value="issue">Issue ({issueTransactions.length})</TabsTrigger>
              <TabsTrigger value="transfer">Transfer ({transferTransactions.length})</TabsTrigger>
              <TabsTrigger value="adjustment">Adjustment ({adjustmentTransactions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <TransactionTable data={transactions} />
            </TabsContent>
            <TabsContent value="receipt" className="mt-4">
              <TransactionTable data={receiptTransactions} />
            </TabsContent>
            <TabsContent value="issue" className="mt-4">
              <TransactionTable data={issueTransactions} />
            </TabsContent>
            <TabsContent value="transfer" className="mt-4">
              <TransactionTable data={transferTransactions} />
            </TabsContent>
            <TabsContent value="adjustment" className="mt-4">
              <TransactionTable data={adjustmentTransactions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTransactions;