import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { Users, Clock, DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react';
import EmployeeMaster from '../hr/EmployeeMaster';
import PayrollProcessing from '../hr/PayrollProcessing';
import LeaveManagement from '../hr/LeaveManagement';
import AttendanceManagement from '../hr/AttendanceManagement';

const HRModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const hrStats = [
    { title: 'Total Employees', value: '47', icon: Users, color: 'text-blue-600' },
    { title: 'Present Today', value: '42', icon: Clock, color: 'text-green-600' },
    { title: 'Monthly Payroll', value: '$121K', icon: DollarSign, color: 'text-purple-600' },
    { title: 'Leave Requests', value: '12', icon: Calendar, color: 'text-orange-600' }
  ];

  const recentActivities = [
    { type: 'Payroll', description: 'February payroll processed', time: '2 hours ago', status: 'completed' },
    { type: 'Leave', description: 'Leave request approved - John Doe', time: '4 hours ago', status: 'approved' },
    { type: 'Employee', description: 'New employee onboarded', time: '1 day ago', status: 'new' },
    { type: 'Attendance', description: 'Biometric sync completed', time: '2 days ago', status: 'synced' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'synced': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR & Payroll Management</h1>
          <p className="text-gray-600">Manage employees, payroll, attendance, and leave</p>
        </div>
      </div>

      <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
        <ColorfulTabsList className="grid w-full grid-cols-5">
          <ColorfulTabsTrigger value="overview" icon={TrendingUp}>Overview</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="employees" icon={Users}>Employees</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="payroll" icon={DollarSign}>Payroll</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="attendance" icon={Clock}>Attendance</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="leave" icon={Calendar}>Leave</ColorfulTabsTrigger>
        </ColorfulTabsList>

        <ColorfulTabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hrStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={() => setActiveTab('employees')}
                  >
                    Add Employee
                  </Button>
                  <Button 
                    className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    onClick={() => setActiveTab('payroll')}
                  >
                    Run Payroll
                  </Button>
                  <Button 
                    className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    onClick={() => setActiveTab('attendance')}
                  >
                    Mark Attendance
                  </Button>
                  <Button 
                    className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    onClick={() => setActiveTab('leave')}
                  >
                    Manage Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ColorfulTabsContent>

        <ColorfulTabsContent value="employees">
          <EmployeeMaster />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="payroll">
          <PayrollProcessing />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="attendance">
          <AttendanceManagement />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="leave">
          <LeaveManagement />
        </ColorfulTabsContent>
      </ColorfulTabs>
    </div>
  );
};

export default HRModule;