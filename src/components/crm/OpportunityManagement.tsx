import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, DollarSign, Calendar, TrendingUp, User } from 'lucide-react';

interface Opportunity {
  id: string;
  name: string;
  account: string;
  stage: 'Prospecting' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  value: number;
  probability: number;
  closeDate: string;
  assignedTo: string;
  source: string;
  createdDate: string;
  lastActivity: string;
}

const OpportunityManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [opportunities] = useState<Opportunity[]>([
    { id: '1', name: 'Enterprise Software License', account: 'Tech Corp', stage: 'Negotiation', value: 150000, probability: 80, closeDate: '2024-02-15', assignedTo: 'Sarah Johnson', source: 'Lead Conversion', createdDate: '2024-01-10', lastActivity: '2024-01-18' },
    { id: '2', name: 'Website Redesign Project', account: 'Design Studio', stage: 'Proposal Sent', value: 45000, probability: 60, closeDate: '2024-02-28', assignedTo: 'Mike Davis', source: 'Referral', createdDate: '2024-01-12', lastActivity: '2024-01-17' },
    { id: '3', name: 'Manufacturing Equipment', account: 'Manufacturing Inc', stage: 'Prospecting', value: 250000, probability: 30, closeDate: '2024-03-30', assignedTo: 'Sarah Johnson', source: 'Cold Outreach', createdDate: '2024-01-15', lastActivity: '2024-01-16' },
    { id: '4', name: 'POS System Implementation', account: 'Retail Plus', stage: 'Won', value: 75000, probability: 100, closeDate: '2024-01-20', assignedTo: 'Mike Davis', source: 'Lead Conversion', createdDate: '2024-01-05', lastActivity: '2024-01-20' },
    { id: '5', name: 'Cloud Migration Services', account: 'StartupXYZ', stage: 'Lost', value: 30000, probability: 0, closeDate: '2024-01-25', assignedTo: 'Sarah Johnson', source: 'Trade Show', createdDate: '2024-01-08', lastActivity: '2024-01-25' },
  ]);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospecting': return 'bg-blue-100 text-blue-800';
      case 'Proposal Sent': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter(o => !['Won', 'Lost'].includes(o.stage)).length;
  const wonOpportunities = opportunities.filter(o => o.stage === 'Won').length;
  const totalValue = opportunities.filter(o => !['Lost'].includes(o.stage)).reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.filter(o => !['Won', 'Lost'].includes(o.stage)).reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalOpportunities}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{activeOpportunities}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Won</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">{wonOpportunities}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Weighted Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-purple-600">${Math.round(weightedValue).toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Opportunity Pipeline</CardTitle>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-green-500 to-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
              <Button variant="outline">
                Pipeline View
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
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
                <SelectItem value="Prospecting">Prospecting</SelectItem>
                <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Won">Won</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{opportunity.name}</div>
                      <div className="text-sm text-gray-500">Created: {opportunity.createdDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>{opportunity.account}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(opportunity.stage)}>
                      {opportunity.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{opportunity.value.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getProbabilityColor(opportunity.probability)}`}>
                      {opportunity.probability}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{opportunity.closeDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{opportunity.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Convert
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

export default OpportunityManagement;