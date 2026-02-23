import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Check, X } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Debit' | 'Credit';
  reconciled: boolean;
}

const BankReconciliation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-01-15',
      description: 'Customer Payment - ABC Corp',
      amount: 2500.00,
      type: 'Credit',
      reconciled: true
    },
    {
      id: '2',
      date: '2024-01-14',
      description: 'Office Supplies Payment',
      amount: 150.00,
      type: 'Debit',
      reconciled: false
    },
    {
      id: '3',
      date: '2024-01-13',
      description: 'Bank Service Charge',
      amount: 25.00,
      type: 'Debit',
      reconciled: false
    }
  ]);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleReconciled = (id: string) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, reconciled: !t.reconciled } : t
    ));
  };

  const reconciledBalance = transactions
    .filter(t => t.reconciled)
    .reduce((sum, t) => sum + (t.type === 'Credit' ? t.amount : -t.amount), 0);

  const unreconciledBalance = transactions
    .filter(t => !t.reconciled)
    .reduce((sum, t) => sum + (t.type === 'Credit' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reconciled Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${reconciledBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unreconciled Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${unreconciledBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bank Reconciliation</CardTitle>
            <Button className="bg-gradient-to-r from-green-500 to-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Import Statement
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
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
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge className={transaction.type === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-mono ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                    ${transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={transaction.reconciled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {transaction.reconciled ? 'Reconciled' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleReconciled(transaction.id)}
                    >
                      {transaction.reconciled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankReconciliation;