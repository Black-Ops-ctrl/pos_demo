import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check, X, Calendar, Clock } from 'lucide-react';

const LeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LR001',
      empId: 'EMP001',
      empName: 'John Doe',
      leaveType: 'Annual',
      fromDate: '2024-03-15',
      toDate: '2024-03-17',
      days: 3,
      reason: 'Family vacation',
      status: 'Pending',
      appliedDate: '2024-03-01'
    },
    {
      id: 'LR002',
      empId: 'EMP002',
      empName: 'Jane Smith',
      leaveType: 'Sick',
      fromDate: '2024-03-10',
      toDate: '2024-03-12',
      days: 3,
      reason: 'Medical treatment',
      status: 'Approved',
      appliedDate: '2024-03-08'
    }
  ]);

  const [leaveBalances, setLeaveBalances] = useState([
    {
      empId: 'EMP001',
      empName: 'John Doe',
      annual: { total: 21, used: 5, remaining: 16 },
      sick: { total: 10, used: 2, remaining: 8 },
      casual: { total: 12, used: 3, remaining: 9 }
    },
    {
      empId: 'EMP002',
      empName: 'Jane Smith',
      annual: { total: 21, used: 8, remaining: 13 },
      sick: { total: 10, used: 5, remaining: 5 },
      casual: { total: 12, used: 1, remaining: 11 }
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    empId: '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const newRequest = {
      id: `LR${String(leaveRequests.length + 1).padStart(3, '0')}`,
      empName: 'Current User',
      days,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      ...formData
    };
    
    setLeaveRequests([...leaveRequests, newRequest]);
    setFormData({
      empId: '',
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    });
    setIsDialogOpen(false);
  };

  const handleApproval = (requestId: string, action: 'approve' | 'reject') => {
    const updatedRequests = leaveRequests.map(request => 
      request.id === requestId 
        ? { ...request, status: action === 'approve' ? 'Approved' : 'Rejected' }
        : request
    );
    setLeaveRequests(updatedRequests);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leave Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="empId">Employee ID</Label>
                <Input
                  id="empId"
                  value={formData.empId}
                  onChange={(e) => setFormData({...formData, empId: e.target.value})}
                  placeholder="EMP001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData({...formData, leaveType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual">Annual Leave</SelectItem>
                    <SelectItem value="Sick">Sick Leave</SelectItem>
                    <SelectItem value="Casual">Casual Leave</SelectItem>
                    <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please provide reason for leave"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'Pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'Approved').length}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave Today</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.empName}</p>
                      <p className="text-sm text-gray-600">{request.empId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell>{request.fromDate}</TableCell>
                  <TableCell>{request.toDate}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(request.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(request.id, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Annual Leave</TableHead>
                <TableHead>Sick Leave</TableHead>
                <TableHead>Casual Leave</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveBalances.map((balance) => (
                <TableRow key={balance.empId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{balance.empName}</p>
                      <p className="text-sm text-gray-600">{balance.empId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Used: {balance.annual.used}/{balance.annual.total}</p>
                      <p className="text-green-600">Remaining: {balance.annual.remaining}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Used: {balance.sick.used}/{balance.sick.total}</p>
                      <p className="text-green-600">Remaining: {balance.sick.remaining}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Used: {balance.casual.used}/{balance.casual.total}</p>
                      <p className="text-green-600">Remaining: {balance.casual.remaining}</p>
                    </div>
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

export default LeaveManagement;