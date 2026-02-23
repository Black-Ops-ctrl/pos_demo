import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Lock, FileText, Calculator, DollarSign } from 'lucide-react';

const PayrollProcessing: React.FC = () => {
  const [payrollRuns, setPayrollRuns] = useState([
    {
      id: 'PR001',
      period: '2024-01',
      status: 'Completed',
      employees: 45,
      totalAmount: 125000,
      processedDate: '2024-01-31',
      locked: true
    },
    {
      id: 'PR002',
      period: '2024-02',
      status: 'Draft',
      employees: 47,
      totalAmount: 0,
      processedDate: '',
      locked: false
    }
  ]);

  const [payrollDetails, setPayrollDetails] = useState([
    {
      empId: 'EMP001',
      name: 'John Doe',
      basic: 50000,
      allowances: 15000,
      overtime: 5000,
      gross: 70000,
      incomeTax: 7000,
      eobi: 1000,
      pf: 3500,
      loan: 2000,
      totalDeductions: 13500,
      netPay: 56500
    },
    {
      empId: 'EMP002',
      name: 'Jane Smith',
      basic: 60000,
      allowances: 18000,
      overtime: 0,
      gross: 78000,
      incomeTax: 8500,
      eobi: 1000,
      pf: 4000,
      loan: 0,
      totalDeductions: 13500,
      netPay: 64500
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-02');

  const handleRunPayroll = async () => {
    setIsProcessing(true);
    // Simulate payroll processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updatedRuns = payrollRuns.map(run => 
      run.period === selectedPeriod 
        ? { ...run, status: 'Completed', totalAmount: 121000, processedDate: new Date().toISOString().split('T')[0] }
        : run
    );
    setPayrollRuns(updatedRuns);
    setIsProcessing(false);
  };

  const handleLockPayroll = (runId: string) => {
    const updatedRuns = payrollRuns.map(run => 
      run.id === runId ? { ...run, locked: true } : run
    );
    setPayrollRuns(updatedRuns);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Locked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Processing</h2>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">Jan 2024</SelectItem>
              <SelectItem value="2024-02">Feb 2024</SelectItem>
              <SelectItem value="2024-03">Mar 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRunPayroll} 
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Run Payroll'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gross Payroll</p>
                <p className="text-2xl font-bold">$148K</p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold">$27K</p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Payroll</p>
                <p className="text-2xl font-bold">$121K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>{run.period}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(run.status)}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{run.employees}</TableCell>
                  <TableCell>${run.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{run.processedDate || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                      {run.status === 'Completed' && !run.locked && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleLockPayroll(run.id)}
                        >
                          <Lock className="h-4 w-4" />
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

      <Card>
        <CardHeader>
          <CardTitle>Payroll Details - {selectedPeriod}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>EOBI</TableHead>
                <TableHead>PF</TableHead>
                <TableHead>Loan</TableHead>
                <TableHead>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollDetails.map((detail) => (
                <TableRow key={detail.empId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{detail.name}</p>
                      <p className="text-sm text-gray-600">{detail.empId}</p>
                    </div>
                  </TableCell>
                  <TableCell>${detail.basic.toLocaleString()}</TableCell>
                  <TableCell>${detail.allowances.toLocaleString()}</TableCell>
                  <TableCell>${detail.overtime.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">${detail.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">${detail.incomeTax.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">${detail.eobi.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">${detail.pf.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">${detail.loan.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-green-600">${detail.netPay.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollProcessing;