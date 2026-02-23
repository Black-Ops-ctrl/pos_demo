import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AttendanceManagement: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 'ATT001',
      empId: 'EMP001',
      empName: 'John Doe',
      date: '2024-03-15',
      shift: 'Day Shift',
      timeIn: '09:00',
      timeOut: '17:30',
      status: 'Present',
      overtime: 0.5,
      late: false
    },
    {
      id: 'ATT002',
      empId: 'EMP002',
      empName: 'Jane Smith',
      date: '2024-03-15',
      shift: 'Day Shift',
      timeIn: '09:15',
      timeOut: '17:00',
      status: 'Late',
      overtime: 0,
      late: true
    },
    {
      id: 'ATT003',
      empId: 'EMP003',
      empName: 'Bob Wilson',
      date: '2024-03-15',
      shift: 'Night Shift',
      timeIn: '',
      timeOut: '',
      status: 'Absent',
      overtime: 0,
      late: false
    }
  ]);

  const [shifts, setShifts] = useState([
    {
      id: 'SH001',
      name: 'Day Shift',
      startTime: '09:00',
      endTime: '17:00',
      employees: 25
    },
    {
      id: 'SH002',
      name: 'Night Shift',
      startTime: '21:00',
      endTime: '05:00',
      employees: 12
    },
    {
      id: 'SH003',
      name: 'Split Shift',
      startTime: '06:00',
      endTime: '14:00',
      employees: 8
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    empId: '',
    date: '',
    timeIn: '',
    timeOut: '',
    shift: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: `ATT${String(attendanceRecords.length + 1).padStart(3, '0')}`,
      empName: 'Employee Name',
      status: 'Present',
      overtime: 0,
      late: false,
      ...formData
    };
    setAttendanceRecords([...attendanceRecords, newRecord]);
    setFormData({
      empId: '',
      date: '',
      timeIn: '',
      timeOut: '',
      shift: ''
    });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Half Day': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Late': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'Absent': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const todayStats = {
    present: attendanceRecords.filter(r => r.status === 'Present').length,
    late: attendanceRecords.filter(r => r.status === 'Late').length,
    absent: attendanceRecords.filter(r => r.status === 'Absent').length,
    total: attendanceRecords.length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shift">Shift</Label>
                <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(shift => (
                      <SelectItem key={shift.id} value={shift.name}>{shift.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeIn">Time In</Label>
                  <Input
                    id="timeIn"
                    type="time"
                    value={formData.timeIn}
                    onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="timeOut">Time Out</Label>
                  <Input
                    id="timeOut"
                    type="time"
                    value={formData.timeOut}
                    onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Mark Attendance</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{todayStats.late}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((todayStats.present / todayStats.total) * 100)}%
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">{record.empName}</p>
                        <p className="text-sm text-gray-600">{record.empId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{record.shift}</TableCell>
                  <TableCell>{record.timeIn || 'N/A'}</TableCell>
                  <TableCell>{record.timeOut || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.overtime}h</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift Name</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">{shift.name}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                  <TableCell>{shift.employees}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Assign
                      </Button>
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

export default AttendanceManagement;