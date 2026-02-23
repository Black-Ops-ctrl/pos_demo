import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, MessageSquare, AlertCircle, CheckCircle, Building } from 'lucide-react';
import LeadManagement from '@/components/crm/LeadManagement';
import OpportunityManagement from '@/components/crm/OpportunityManagement';
import SupportTickets from '@/components/crm/SupportTickets';
import CommunicationCenter from '@/components/crm/CommunicationCenter';
import CustomerAccounts from '@/components/crm/CustomerAccounts';
import TasksActivities from '@/components/crm/TasksActivities';

const CRMModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for overview metrics
  const overviewMetrics = {
    totalLeads: 156,
    newLeads: 23,
    qualifiedLeads: 45,
    totalOpportunities: 89,
    activeOpportunities: 34,
    wonOpportunities: 12,
    totalCustomers: 78,
    activeCustomers: 65,
    totalTickets: 45,
    openTickets: 18,
    totalTasks: 67,
    pendingTasks: 23,
    pipelineValue: 2450000,
    monthlyRevenue: 185000
  };

  const recentActivities = [
    { id: '1', type: 'Lead', action: 'New lead from website', time: '2 hours ago', user: 'Sarah Johnson' },
    { id: '2', type: 'Opportunity', action: 'Moved to Negotiation stage', time: '4 hours ago', user: 'Mike Davis' },
    { id: '3', type: 'Task', action: 'Follow-up call completed', time: '6 hours ago', user: 'Sarah Johnson' },
    { id: '4', type: 'Ticket', action: 'Support ticket resolved', time: '8 hours ago', user: 'John Support' },
    { id: '5', type: 'Communication', action: 'Email campaign sent', time: '1 day ago', user: 'Mike Davis' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Lead': return <Users className="h-4 w-4 text-blue-500" />;
      case 'Opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Task': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'Ticket': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Communication': return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CRM Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage customer relationships, leads, and opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
            Quick Actions
          </Button>
          <Button variant="outline">
            Reports
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-900">{overviewMetrics.totalLeads}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">+{overviewMetrics.newLeads} new this month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Active Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-900">{overviewMetrics.activeOpportunities}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">{overviewMetrics.wonOpportunities} won this month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-900">${(overviewMetrics.pipelineValue / 1000000).toFixed(1)}M</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">Weighted pipeline value</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Open Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-900">{overviewMetrics.openTickets}</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">of {overviewMetrics.totalTickets} total tickets</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time} • {activity.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                    <span className="text-sm font-medium">Lead Conversion Rate</span>
                    <span className="text-sm font-bold text-blue-600">28.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                    <span className="text-sm font-medium">Opportunity Win Rate</span>
                    <span className="text-sm font-bold text-green-600">35.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50">
                    <span className="text-sm font-medium">Avg. Deal Size</span>
                    <span className="text-sm font-bold text-purple-600">$72K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50">
                    <span className="text-sm font-medium">Avg. Response Time</span>
                    <span className="text-sm font-bold text-orange-600">2.4 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <LeadManagement />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunityManagement />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerAccounts />
        </TabsContent>

        <TabsContent value="support">
          <SupportTickets />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationCenter />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksActivities />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMModule;