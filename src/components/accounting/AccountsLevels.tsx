import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

import { getAccounts,addAccount,updateAccount,deleteAccount } from '@/api/accountsApi';
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { toast } from '@/hooks/use-toast';

interface Account {
  account_id: number;
  account_code: string;
  account_name: string;
/*  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'; */
  
  // parent?: string;
  account_type: string;
  parent_account_id:number;
 
}

const ChartOfAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts", error);
    }
  };
  const filteredAccounts = accounts.filter(account => 
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) 
   
  );

  const getTypeColor = (account_type: string) => {
    switch (account_type) {
      case 'ASSET': return 'bg-green-100 text-green-800';
      case 'LIABILITY': return 'bg-red-100 text-red-800';
      case 'EQUITY': return 'bg-blue-100 text-blue-800';
      case 'REVENUE': return 'bg-purple-100 text-purple-800';
      case 'EXPENSE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

 const handleSaveAccount = async (data: Omit<Account, "account_id">) => {
      try {
        if (editingAccount) {
          await updateAccount(
            editingAccount.account_id,
            data.account_code,
            data.account_name,
            data.account_type,
            data.parent_account_id
          );
          toast({ title: "Updated", description: "Account updated successfully!" });
        } else {
          await addAccount(
            data.account_code,
            data.account_name,
            data.account_type,
            data.parent_account_id
          );
          toast({ title: "Created", description: "Account created successfully!" });
        }
        setShowForm(false);
        loadAccounts();
      } catch (error) {
        console.error("Error saving account", error);
        toast({ title: "Error", description: "Failed to save warehouse" });
      }
    };

 const handleDeleteAccount = async (accountId: number) => {
     if (confirm("Are you sure you want to delete this Account?")) {
       try {
         await deleteAccount(accountId);
         loadAccounts();
         toast({ title: "Deleted", description: "Account deleted successfully!" });
       } catch (error) {
         console.error("Error deleting account", error);
         toast({ title: "Error", description: "Failed to delete account" });
       }
     }
   };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chart of Accounts</CardTitle>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600"
              onClick={handleAddAccount}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search accounts..."
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
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.account_id}>
                  <TableCell className="font-mono">{account.account_code}</TableCell>
                  <TableCell className="font-medium" >
                    {account.account_name}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(account.account_type)}>
                      {account.account_type}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAccount(account.account_id)}
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

      {showForm && (
        <AccountForm
          account={editingAccount}
          onClose={() => setShowForm(false)}
          onSave={handleSaveAccount}
        />
      )}
    </>
  );
};
const AccountForm: React.FC<{
  account: Account | null;
  onClose: () => void;
  onSave: (data: Omit<Account, "account_id">) => void;
}> = ({ account, onClose, onSave }) => {
  const [account_code, setAccountCode] = useState(account?.account_code || "");
  const [account_name, setAccountName] = useState(account?.account_name || "");
  const [account_type, setAccountType] = useState(account?.account_type || "");
  const [parent_account_id, setParentAccountId] = useState(account?.parent_account_id);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        account_code, account_name, account_type,
        parent_account_id
      });
    };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {account ? "Edit Account" : "Add Account"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
          value={account_type} 
          onChange={(e) => setAccountType(e.target.value)}
           className="w-full border p-2 rounded"
           >
            <option value="">Select Account Type</option>
           <option value="ASSET">Asset</option>
           <option value="LIABILITY">Liability</option>
           <option value="EQUITY">Equity</option>
           <option value="REVENUE">Revenue</option>
           <option value="EXPENSE">Expense</option>
         </select>
          <Input
            value={account_code}
            onChange={(e) => setAccountCode(e.target.value)}
            placeholder="Account Code"
          />
          <span className="text-sm whitespace-nowrap">
              Level 2
            </span>
          <Input
            value={account_name}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account Name"
          />

         
              
         <Input
            value={parent_account_id}
            onChange={(e) => setParentAccountId(Number(e.target.value))}
            placeholder="Parent Account ID"
          />

          <div className="flex  gap-2">
            
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChartOfAccounts;