import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { DollarSign, TrendingUp, TrendingDown, FileText, CreditCard, Building, BarChart3 } from 'lucide-react';
import ChartOfAccounts from '@/components/accounting/ChartOfAccounts';
import JournalEntries from '@/components/accounting/JournalEntries';
import AccountsReceivable from '@/components/accounting/AccountsReceivable';
import AccountsPayable from '@/components/accounting/AccountsPayable';
import FinancialReports from '@/components/accounting/FinancialReports';
import BankReconciliation from '@/components/accounting/BankReconciliation';
import Branch from '@/components/others/Branches';
import Company from '@/components/others/Company';
import Department from '../others/Department';
import Others from '../others/Others';
import GeneralLedger from '@/components/accounting/GeneralLedger';
import TrialBalance from '@/components/accounting/TrialBalance'

const AccountingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Financial summary data
  const totalAssets = 205000;
  const totalLiabilities = 70000;
  const totalEquity = 135000;
  const netIncome = 45000;
  const totalRevenue = 125000;
  const totalExpenses = 80000;
  const cashBalance = 25750;
  const accountsReceivable = 18500;
  const accountsPayable = 12300;

  const DashboardContent = () => (
    <div className="space-y-6 no-print">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-800"> Rs.{totalAssets.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-800"> Rs.{totalLiabilities.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-800"> Rs.{totalEquity.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-800"> Rs.{netIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => setActiveTab('ar')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button 
                className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => setActiveTab('journal')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Journal Entry
              </Button>
              <Button 
                className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => setActiveTab('ap')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
              <Button 
                className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => setActiveTab('reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Cash Balance</span>
                <span className="text-green-600 font-bold"> Rs.{cashBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Accounts Receivable</span>
                <span className="text-blue-600 font-bold"> Rs.{accountsReceivable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">Accounts Payable</span>
                <span className="text-red-600 font-bold"> Rs.{accountsPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-t">
                <span className="font-medium">Working Capital</span>
                <span className="text-purple-600 font-bold"> Rs.{(accountsReceivable - accountsPayable + cashBalance).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100  ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 no-print">Accounting & Finance</h1>
          <p className="text-gray-600">Manage your complete financial lifecycle with comprehensive accounting tools</p>
        </div>

        <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
        
          <ColorfulTabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 mb-6">
            <ColorfulTabsTrigger value="dashboard" icon={BarChart3}>Dashboard</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="coa" icon={Building}>Chart of Accounts</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="journal" icon={FileText}>Journal Entries</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value='ledger' icon={CreditCard}>General Ledger</ColorfulTabsTrigger>
            {/* 
            <ColorfulTabsTrigger value="ar" icon={CreditCard}>Accounts Receivable</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="ap" icon={DollarSign}>Accounts Payable</ColorfulTabsTrigger>
            
            <ColorfulTabsTrigger value="bank" icon={Building}>Bank Reconciliation</ColorfulTabsTrigger>
            */}
            <ColorfulTabsTrigger value="balance" icon={Building}>Trial Balance</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="reports" icon={TrendingUp}>Financial Reports</ColorfulTabsTrigger>
            {/* <ColorfulTabsTrigger value="others" icon={Building}>Others</ColorfulTabsTrigger> */}
          </ColorfulTabsList>

          <ColorfulTabsContent value="dashboard">
            <DashboardContent />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="coa">
            <ChartOfAccounts />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="journal">
            <JournalEntries />
          </ColorfulTabsContent>
          
          <ColorfulTabsContent value="ledger">
            <GeneralLedger />
          </ColorfulTabsContent>
{/* 
          <ColorfulTabsContent value="ar">
            <AccountsReceivable />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="ap">
            <AccountsPayable />
          </ColorfulTabsContent>
*/}
          <ColorfulTabsContent value="balance">
            <TrialBalance />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="reports">
            <FinancialReports />
          </ColorfulTabsContent>

          {/* <ColorfulTabsContent value="others">
            <Others />
          </ColorfulTabsContent> */}
        </ColorfulTabs>
      </div>
    </div>
  );
};

export default AccountingModule;