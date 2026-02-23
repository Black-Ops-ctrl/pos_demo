import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit } from 'lucide-react';
import { getAccounts, addAccount, updateAccount } from '@/api/accountsApi';
import { toast } from '@/hooks/use-toast';

interface Account {
  account_id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_account_id: number | null;
  level_no: number;
}

const ChartOfAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
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

  const handleAddAccount = (parent_account_id: number | null = null) => {
    setEditingAccount(null);
    setParentId(parent_account_id);
    setShowForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleSaveAccount = async (data: {
    account_name: string;
    account_type: string;
    parent_account_id: number | null;
  }) => {
    try {
      if (editingAccount) {
        await updateAccount(
          editingAccount.account_id,
          undefined,
          data.account_name,
          data.account_type,
          data.parent_account_id
        );
        toast({ title: "Updated", description: "Account updated successfully!" });
      } else {
        await addAccount(
          data.account_name,
          data.account_type,
          data.parent_account_id
        );
        toast({ title: "Created", description: "Account created successfully!" });
      }
      setShowForm(false);
      setParentId(null);
      loadAccounts();
    } catch (error) {
      console.error("Error saving account", error);
      toast({ title: "Error", description: "Failed to save account" });
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
              onClick={() => handleAddAccount(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
          <div className="relative mt-4">
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
                <TableHead>Parent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const parent = accounts.find(a => a.account_id === account.parent_account_id);
                return (
                  <TableRow key={account.account_id}>
                    <TableCell className="font-mono">{account.account_code}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleAddAccount(account.account_id)}
                        className="text-blue-600 hover:underline cursor-pointer font-medium"
                        style={{ paddingLeft: `${account.level_no * 20}px` }}
                      >
                        {account.account_name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(account.account_type)}>
                        {account.account_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{parent ? parent.account_name : "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <AccountForm
          accounts={accounts}
          account={editingAccount}
          parentId={parentId}
          onClose={() => {
            setShowForm(false);
            setParentId(null);
          }}
          onSave={handleSaveAccount}
        />
      )}
    </>
  );
};

const AccountForm: React.FC<{
  accounts: Account[];
  account: Account | null;
  parentId?: number | null;
  onClose: () => void;
  onSave: (data: {
    account_name: string;
    account_type: string;
    parent_account_id: number | null;
  }) => void;
}> = ({ accounts, account, parentId = null, onClose, onSave }) => {
  const [account_name, setAccountName] = useState(account?.account_name || "");
  const [account_type, setAccountType] = useState(account?.account_type || "");
  const [parent_account_id, setParentAccountId] = useState<number | null>(
    account?.parent_account_id ?? parentId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      account_name,
      account_type,
      parent_account_id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center overflow-auto">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          {account ? "Edit Account" : "Add Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Type */}
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
            value={account_name}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account Name"
            required
          />

          <div className="flex gap-2">
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
