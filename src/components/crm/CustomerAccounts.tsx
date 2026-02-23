import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, Users, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GenericForm from '@/components/forms/GenericForm';

interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive';
  creditLimit: number;
  balance: number;
}

const CustomerAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', code: 'CUST001', name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1-555-0123', address: '123 Main St', city: 'New York', country: 'USA', status: 'active', creditLimit: 50000, balance: 12500 },
    { id: '2', code: 'CUST002', name: 'XYZ Ltd', email: 'info@xyz.com', phone: '+1-555-0456', address: '456 Oak Ave', city: 'Los Angeles', country: 'USA', status: 'active', creditLimit: 30000, balance: 8200 },
    { id: '3', code: 'CUST003', name: 'Tech Solutions Inc', email: 'hello@techsol.com', phone: '+1-555-0789', address: '789 Pine Rd', city: 'Chicago', country: 'USA', status: 'inactive', creditLimit: 25000, balance: 0 },
  ]);
  const { toast } = useToast();

  const formFields = [
    { name: 'code', label: 'Customer Code', type: 'text' as const, required: true },
    { name: 'name', label: 'Customer Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'text' as const, required: true },
    { name: 'address', label: 'Address', type: 'textarea' as const },
    { name: 'city', label: 'City', type: 'text' as const, required: true },
    { name: 'country', label: 'Country', type: 'select' as const, options: ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia'] },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['active', 'inactive'] },
    { name: 'creditLimit', label: 'Credit Limit', type: 'number' as const, required: true },
    { name: 'balance', label: 'Current Balance', type: 'number' as const, required: true },
  ];

  const filteredCustomers = customers.filter(customer => 
    customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleViewCustomer = (customerId: string) => {
    toast({
      title: "View Customer",
      description: `Opening customer ${customerId} details...`,
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    toast({
      title: "Customer Deleted",
      description: `Customer ${customerId} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (formData: any) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id ? { ...customer, ...formData, creditLimit: Number(formData.creditLimit), balance: Number(formData.balance) } : customer
      ));
      toast({
        title: "Customer Updated",
        description: "Customer has been updated successfully.",
      });
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        creditLimit: Number(formData.creditLimit),
        balance: Number(formData.balance)
      };
      setCustomers(prev => [...prev, newCustomer]);
      toast({
        title: "Customer Created",
        description: "New customer has been created successfully.",
      });
    }
  };

  const getCreditStatus = (balance: number, creditLimit: number) => {
    const utilization = (balance / creditLimit) * 100;
    if (utilization >= 90) return 'bg-red-100 text-red-800';
    if (utilization >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Accounts
            </CardTitle>
            <Button 
              onClick={handleNewCustomer}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.code}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{customer.city}</div>
                      <div className="text-gray-500">{customer.country}</div>
                    </div>
                  </TableCell>
                  <TableCell>${customer.creditLimit.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getCreditStatus(customer.balance, customer.creditLimit)}>
                      ${customer.balance.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewCustomer(customer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCustomer(customer.id)}
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
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        fields={formFields}
        initialData={editingCustomer}
      />
    </>
  );
};

export default CustomerAccounts;