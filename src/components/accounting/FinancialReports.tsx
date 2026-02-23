import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar } from 'lucide-react';

const FinancialReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('balance-sheet');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const balanceSheetData = [
    { account: 'Cash', amount: 25750, type: 'Asset' },
    { account: 'Accounts Receivable', amount: 18500, type: 'Asset' },
    { account: 'Inventory', amount: 45000, type: 'Asset' },
    { account: 'Equipment', amount: 115750, type: 'Asset' },
    { account: 'Accounts Payable', amount: -12300, type: 'Liability' },
    { account: 'Notes Payable', amount: -57700, type: 'Liability' },
    { account: 'Owner Equity', amount: -135000, type: 'Equity' }
  ];

  const incomeStatementData = [
    { account: 'Sales Revenue', amount: 125000, type: 'Revenue' },
    { account: 'Service Revenue', amount: 35000, type: 'Revenue' },
    { account: 'Cost of Goods Sold', amount: -65000, type: 'Expense' },
    { account: 'Salaries Expense', amount: -25000, type: 'Expense' },
    { account: 'Rent Expense', amount: -8000, type: 'Expense' },
    { account: 'Utilities Expense', amount: -2500, type: 'Expense' }
  ];

  const getCurrentData = () => {
    return selectedReport === 'balance-sheet' ? balanceSheetData : incomeStatementData;
  };

  const getReportTitle = () => {
    return selectedReport === 'balance-sheet' ? 'Balance Sheet' : 'Income Statement';
  };

  const totalAssets = balanceSheetData.filter(item => item.type === 'Asset').reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = Math.abs(balanceSheetData.filter(item => item.type === 'Liability').reduce((sum, item) => sum + item.amount, 0));
  const totalEquity = Math.abs(balanceSheetData.filter(item => item.type === 'Equity').reduce((sum, item) => sum + item.amount, 0));

  const totalRevenue = incomeStatementData.filter(item => item.type === 'Revenue').reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = Math.abs(incomeStatementData.filter(item => item.type === 'Expense').reduce((sum, item) => sum + item.amount, 0));
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs.{totalAssets.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rs.{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Rs.{netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Reports</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                <SelectItem value="income-statement">Income Statement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {getReportTitle()}
            </h3>
            <p className="text-sm text-gray-600">As of {new Date().toLocaleDateString()}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentData().map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.account}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell className={`text-right font-mono ${
                    item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(item.amount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {selectedReport === 'balance-sheet' && (
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total Assets:</span>
                <span className="font-mono">Rs.{totalAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Liabilities:</span>
                <span className="font-mono">Rs.{totalLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Equity:</span>
                <span className="font-mono">Rs.{totalEquity.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          {selectedReport === 'income-statement' && (
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Total Revenue:</span>
                <span className="font-mono text-green-600">Rs.{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses:</span>
                <span className="font-mono text-red-600">Rs.{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Net Income:</span>
                <span className={`font-mono ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rs.{netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;