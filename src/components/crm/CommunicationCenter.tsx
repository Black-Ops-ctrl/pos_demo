import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Mail, Phone, MessageSquare, Send } from 'lucide-react';

interface Communication {
  id: string;
  type: 'Email' | 'SMS' | 'Call';
  subject: string;
  contact: string;
  direction: 'Inbound' | 'Outbound';
  status: 'Sent' | 'Delivered' | 'Read' | 'Replied';
  date: string;
  assignedTo: string;
}

const CommunicationCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newMessage, setNewMessage] = useState({ type: 'Email', to: '', subject: '', content: '' });
  
  const [communications] = useState<Communication[]>([
    { id: '1', type: 'Email', subject: 'Welcome to our service', contact: 'john@techcorp.com', direction: 'Outbound', status: 'Read', date: '2024-01-18', assignedTo: 'Sarah Johnson' },
    { id: '2', type: 'Call', subject: 'Follow-up call', contact: 'emma@designstudio.com', direction: 'Outbound', status: 'Delivered', date: '2024-01-17', assignedTo: 'Mike Davis' },
    { id: '3', type: 'SMS', subject: 'Appointment reminder', contact: '+1234567890', direction: 'Outbound', status: 'Delivered', date: '2024-01-16', assignedTo: 'Sarah Johnson' },
    { id: '4', type: 'Email', subject: 'Support inquiry', contact: 'support@manufacturing.com', direction: 'Inbound', status: 'Replied', date: '2024-01-15', assignedTo: 'Mike Davis' },
  ]);

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || comm.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'SMS': return <MessageSquare className="h-4 w-4" />;
      case 'Call': return <Phone className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Read': return 'bg-purple-100 text-purple-800';
      case 'Replied': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCommunications = communications.length;
  const emailCount = communications.filter(c => c.type === 'Email').length;
  const smsCount = communications.filter(c => c.type === 'SMS').length;
  const callCount = communications.filter(c => c.type === 'Call').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Communications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalCommunications}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{emailCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{smsCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{callCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="communications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        <TabsContent value="communications">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Communication History</CardTitle>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Communication
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search communications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(comm.type)}
                          <span>{comm.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{comm.subject}</TableCell>
                      <TableCell>{comm.contact}</TableCell>
                      <TableCell>
                        <span className={comm.direction === 'Inbound' ? 'text-green-600' : 'text-blue-600'}>
                          {comm.direction}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(comm.status)}>
                          {comm.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{comm.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Reply
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newMessage.type} onValueChange={(value) => setNewMessage({...newMessage, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Input
                    placeholder="Enter recipient"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                  />
                </div>
              </div>
              {newMessage.type === 'Email' && (
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Enter subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Enter your message..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-green-500 to-green-600">
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline">
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;