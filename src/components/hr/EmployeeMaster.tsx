import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GenericForm from '@/components/forms/GenericForm';

interface Employee {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
}

const EmployeeMaster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', empId: 'EMP001', name: 'John Doe', email: 'john@company.com', phone: '+1-555-0123', department: 'IT', position: 'Software Engineer', salary: 75000, hireDate: '2023-01-15', status: 'active' },
    { id: '2', empId: 'EMP002', name: 'Jane Smith', email: 'jane@company.com', phone: '+1-555-0456', department: 'HR', position: 'HR Manager', salary: 65000, hireDate: '2022-03-20', status: 'active' },
    { id: '3', empId: 'EMP003', name: 'Bob Johnson', email: 'bob@company.com', phone: '+1-555-0789', department: 'Finance', position: 'Accountant', salary: 55000, hireDate: '2023-06-10', status: 'active' },
  ]);
  const { toast } = useToast();

  const formFields = [
    { name: 'empId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'name', label: 'Full Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'text' as const, required: true },
    { name: 'department', label: 'Department', type: 'select' as const, options: ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'] },
    { name: 'position', label: 'Position', type: 'text' as const, required: true },
    { name: 'salary', label: 'Salary', type: 'number' as const, required: true },
    { name: 'hireDate', label: 'Hire Date', type: 'date' as const, required: true },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['active', 'inactive', 'terminated'] },
  ];

  const filteredEmployees = employees.filter(employee => 
    employee.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleViewEmployee = (employeeId: string) => {
    toast({
      title: "View Employee",
      description: `Opening employee ${employeeId} details...`,
    });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== employeeId));
    toast({
      title: "Employee Deleted",
      description: `Employee ${employeeId} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (formData: any) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(employee => 
        employee.id === editingEmployee.id ? { ...employee, ...formData, salary: Number(formData.salary) } : employee
      ));
      toast({
        title: "Employee Updated",
        description: "Employee has been updated successfully.",
      });
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        salary: Number(formData.salary)
      };
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Employee Created",
        description: "New employee has been created successfully.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Master
            </CardTitle>
            <Button 
              onClick={handleNewEmployee}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Employee
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
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
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.empId}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>${employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{employee.hireDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewEmployee(employee.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <GenericForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleFormSubmit}
        title={editingEmployee ? 'Edit Employee' : 'New Employee'}
        fields={formFields}
        initialData={editingEmployee}
      />
    </>
  );
};

export default EmployeeMaster;