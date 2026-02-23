import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Phone, Mail, Calendar, Star, User } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
  assignedTo: string;
  score: number;
  createdDate: string;
  lastContact: string;
  value: number;
}

const LeadManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [leads] = useState<Lead[]>([
    { id: '1', name: 'John Smith', email: 'john@techcorp.com', phone: '555-0101', company: 'Tech Corp', source: 'Website', stage: 'New', assignedTo: 'Sarah Johnson', score: 85, createdDate: '2024-01-15', lastContact: '2024-01-15', value: 50000 },
    { id: '2', name: 'Emma Wilson', email: 'emma@designstudio.com', phone: '555-0102', company: 'Design Studio', source: 'Referral', stage: 'Contacted', assignedTo: 'Mike Davis', score: 92, createdDate: '2024-01-14', lastContact: '2024-01-16', value: 25000 },
    { id: '3', name: 'Robert Brown', email: 'robert@manufacturing.com', phone: '555-0103', company: 'Manufacturing Inc', source: 'Cold Call', stage: 'Qualified', assignedTo: 'Sarah Johnson', score: 78, createdDate: '2024-01-10', lastContact: '2024-01-17', value: 75000 },
    { id: '4', name: 'Lisa Davis', email: 'lisa@retail.com', phone: '555-0104', company: 'Retail Plus', source: 'Trade Show', stage: 'Unqualified', assignedTo: 'Mike Davis', score: 45, createdDate: '2024-01-12', lastContact: '2024-01-13', value: 15000 },
  ]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Unqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.stage === 'New').length;
  const qualifiedLeads = leads.filter(l => l.stage === 'Qualified').length;
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalLeads}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{newLeads}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">{qualifiedLeads}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Management</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Unqualified">Unqualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.company}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(lead.stage)}>
                      {lead.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                      <span className={`font-medium ${getScoreColor(lead.score)}`}>{lead.score}</span>
                    </div>
                  </TableCell>
                  <TableCell>${lead.value.toLocaleString()}</TableCell>
                  <TableCell>{lead.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3" />
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

export default LeadManagement;