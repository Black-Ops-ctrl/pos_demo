import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Printer, ArrowUp, Loader2 } from 'lucide-react';
import { FileText, BadgePercent, Tags, Edit } from 'lucide-react';
import { getAccounts, addAccount, updateAccount } from '@/api/accountsApi';
import { toast } from '@/hooks/use-toast';

interface Account {
  account_id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_account_id: number | null;
  level_no: number;
  children?: Account[];
}

// Recursive component for rendering the tree structure
const TreeItem: React.FC<{
  account: Account;
  handleAddAccount: (parentId: number) => void;
  handleEditAccount: (account: Account) => void;
  getTypeColor: (type: string) => string;
  getAccountNameTextColor: (level: number) => string;
  isPrintMode: boolean;
}> = ({ account, handleAddAccount, handleEditAccount, getTypeColor, getAccountNameTextColor, isPrintMode }) => {
  const [isExpanded, setIsExpanded] = useState(account.level_no === 0);

  const hasChildren = account.children && account.children.length > 0;

  return (
    <li>
      <div 
        className="flex items-center justify-items-center border-b hover:bg-gray-50 px-2 py-2 text-sm print:py-1 print:text-xs"
        style={{ paddingLeft: `${account.level_no * 20}px` }}
      >
        
        {/* Expand/Collapse Button or Spacer */}
        <div className="w-[24px] flex justify-center items-center print:hidden">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none cursor-pointer"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '►'}
            </button>
          ) : (
            <div className="w-[16px]" />
          )}
        </div>

        {/* Account Code */}
        <div className="w-[100px] font-mono print:text-xs">{account.account_code}</div>

        {/* Account Name (flex-1) with INDENTATION */}
        <div className="flex-1">
          <div style={{ paddingLeft: `${account.level_no * 20}px` }}>
            <button
              onClick={() => handleAddAccount(account.account_id)}
              className={`${getAccountNameTextColor(account.level_no)} hover:underline text-left w-full focus:outline-none print:no-underline print:cursor-text`}
            >
              {account.account_name}
            </button>
          </div>
        </div>

        {/* Account Type Badge */}
        <div className="flex-1 flex items-center justify-between pl-4">
          <Badge className={`${getTypeColor(account.account_type)} print:text-xs print:px-1 print:py-0`}>
            {account.account_type}
          </Badge>
        
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditAccount(account)}
            aria-label={`Edit ${account.account_name}`}
            className="print:hidden"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recursive children if expanded */}
      {(isExpanded || isPrintMode) && hasChildren && (
        <ul className="space-y-2 tree-item-children">
          {account.children.map((child) => (
            <TreeItem
              key={child.account_id}
              account={child}
              handleAddAccount={handleAddAccount}
              handleEditAccount={handleEditAccount}
              getTypeColor={getTypeColor}
              getAccountNameTextColor={getAccountNameTextColor}
              isPrintMode={isPrintMode}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Form component for adding/editing accounts
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
  isLoading: boolean;
}> = ({ accounts, account, parentId = null, onClose, onSave, isLoading }) => {
  const [account_name, setAccountName] = useState(account?.account_name || '');
  const [account_type, setAccountType] = useState(account?.account_type || '');
  const [parent_account_id, setParentAccountId] = useState<number | null>(
    account?.parent_account_id ?? parentId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalAccountType = account_type;
    if (parent_account_id !== null) {
      const parent = accounts.find((a) => a.account_id === parent_account_id);
      if (parent) {
        finalAccountType = parent.account_type;
      }
    }

    onSave({
      account_name,
      account_type: finalAccountType,
      parent_account_id,
    });
  };

  const isTopLevel = parent_account_id === null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          {account ? 'Edit Account' : 'Add Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isTopLevel && (
            <select
              value={account_type}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Account Type</option>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </select>
          )}

          <Input
            value={account_name}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account Name"
            required
          />

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-primary "
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Print Header Component
const PrintHeader: React.FC = () => (
  <div className="hidden print:block print:mb-6 print:border-b print:pb-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800">Ahmed Poultry</h1>
      <h2 className="text-xl font-semibold text-gray-600 mt-2">Chart of Accounts</h2>
      <p className="text-gray-500 mt-1">
        Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </p>
    </div>
  </div>
);

// Main Chart of Accounts component
const ChartOfAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [parentAccountIdForForm, setParentAccountIdForForm] = useState<number | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [treeAccounts, setTreeAccounts] = useState<Account[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const checkScrollTop = useCallback(() => {
    if (!showScrollToTop && window.scrollY > 400) {
      setShowScrollToTop(true);
    } else if (showScrollToTop && window.scrollY <= 400) {
      setShowScrollToTop(false);
    }
  }, [showScrollToTop]);

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [checkScrollTop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const buildTree = (
    accounts: Account[],
    parentId: number | null = null,
    level = 0
  ): Account[] => {
    return accounts
      .filter((account) => {
        // Treat null, undefined, or 0 as top-level parent
        if (parentId === null) {
          return (
            account.parent_account_id === null ||
            account.parent_account_id === undefined ||
            account.parent_account_id === 0
          );
        }
        return account.parent_account_id === parentId;
      })
      .map((account) => ({
        ...account,
        level_no: level,
        children: buildTree(accounts, account.account_id, level + 1),
      }));
  };

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      console.log('API accounts:', data); // Debugging line, remove in production

      // If your API returns { accounts: [...] } uncomment next line and adjust:
      // const accountsData = data.accounts || [];

      // For now, assuming data is the array of accounts directly
      const accountsData = Array.isArray(data) ? data : [];

      const sortedData = accountsData.sort((a, b) =>
        a.account_code.localeCompare(b.account_code)
      );
      setAccounts(sortedData);

      const treeData = buildTree(sortedData);
      setTreeAccounts(treeData);
    } catch (error) {
      console.error('Error loading accounts', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts.',
        variant: 'destructive',
      });
    }
  };

  const filterTree = (tree: Account[], term: string): Account[] => {
    if (!term.trim()) return tree;

    const lowerCaseTerm = term.toLowerCase();
    
    return tree.flatMap((account) => {
      // Safe null checks for all properties
      const accountName = account.account_name || '';
      const accountCode = account.account_code || '';
      const accountType = account.account_type || '';

      const matches =
        accountName.toLowerCase().includes(lowerCaseTerm) ||
        accountCode.toLowerCase().includes(lowerCaseTerm) ||
        accountType.toLowerCase().includes(lowerCaseTerm);

      const children = account.children ? filterTree(account.children, term) : [];

      if (matches || children.length > 0) {
        return [{
          ...account, 
          children, 
          level_no: account.level_no 
        }];
      }
      return [];
    });
  };

  const filteredTreeAccounts = useMemo(() => {
    return searchTerm
      ? filterTree(treeAccounts, searchTerm)
      : treeAccounts;
  }, [treeAccounts, searchTerm]);

  const getTypeColor = (account_type: string) => {
    switch (account_type) {
      case 'ASSET':
        return 'bg-green-100 text-green-800';
      case 'LIABILITY':
        return 'bg-red-100 text-red-800';
      case 'EQUITY':
        return 'bg-blue-100 text-blue-800';
      case 'REVENUE':
        return 'bg-purple-100 text-purple-800';
      case 'EXPENSE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountNameTextColor = (level_no: number) => {
    switch (level_no) {
      case 0: // top-level (root)
        return 'text-green-600 font-extrabold';
      case 1:
        return 'text-red-600 font-bold';
      case 2:
        return 'text-blue-600 font-medium';
      case 3:
        return 'text-purple-600';
      default:
        return 'text-gray-900';
    }
  };

  const handleAddAccount = (parent_account_id: number | null = null) => {
    setEditingAccount(null);
    setParentAccountIdForForm(parent_account_id);
    setShowForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setParentAccountIdForForm(null);
    setShowForm(true);
  };

  const handleSaveAccount = async (data: {
    account_name: string;
    account_type: string;
    parent_account_id: number | null;
  }) => {
    setIsLoading(true);
    try {
      if (editingAccount) {
        await updateAccount(
          editingAccount.account_id,
          undefined,
          data.account_name,
          data.account_type,
          data.parent_account_id
        );
        toast({
          title: 'Updated',
          description: 'Account updated successfully!',
        });
      } else {
        await addAccount(
          data.account_name,
          data.account_type,
          data.parent_account_id
        );
        toast({
          title: 'Created',
          description: 'Account created successfully!',
          duration: 3000,
        });
      }
      setShowForm(false);
      setParentAccountIdForForm(null);
      loadAccounts();
    } catch (error) {
      console.error('Error saving account', error);
      toast({
        title: 'Error',
        description: 'Failed to save account',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    
    // Give React a moment to re-render before printing
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => {
        setIsPrintMode(false);
      }, 500);
    }, 100);
  };

  // Add print styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          margin: 1cm;
          size: A4 portrait;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:block {
          display: block !important;
        }
        .print\\:mb-6 {
          margin-bottom: 1.5rem !important;
        }
        .print\\:border-b {
          border-bottom: 1px solid #e5e7eb !important;
        }
        .print\\:pb-4 {
          padding-bottom: 1rem !important;
        }
        .print\\:py-1 {
          padding-top: 0.25rem !important;
          padding-bottom: 0.25rem !important;
        }
        .print\\:text-xs {
          font-size: 0.75rem !important;
          line-height: 1rem !important;
        }
        .print\\:px-1 {
          padding-left: 0.25rem !important;
          padding-right: 0.25rem !important;
        }
        .print\\:py-0 {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .print\\:no-underline {
          text-decoration: none !important;
        }
        .print\\:cursor-text {
          cursor: text !important;
        }
        button, [onclick] {
          pointer-events: none !important;
        }
        .bg-white {
          background-color: white !important;
        }
        .bg-green-100, .bg-red-100, .bg-blue-100, .bg-purple-100, .bg-orange-100, .bg-gray-100 {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg print:shadow-none">
        <CardHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <CardTitle>Chart of Accounts</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Accounts
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary"
                onClick={() => handleAddAccount(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
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
          <PrintHeader />
          
          {filteredTreeAccounts.length > 0 ? (
            <ul className="space-y-2">
              <div className="flex items-center border-y py-2 text-sm font-medium text-gray-700 print:text-xs">
                {/* Expand/Collapse Placeholder */}
                <div className="w-[20px] print:hidden"></div>

                {/* Account Code */}
                <div className="w-[100px] font-mono">Account Code</div>

                {/* Account Name */}
                <div className="flex-1 pl-4">Account Name</div>

                {/* Account Type and Edit Icon in one div */}
                <div className="flex-1 flex items-center justify-between pl-0">
                  <div>Account Type</div>
                  <div className="text-gray-400 text-xs print:hidden"/>
                </div>
              </div>
              {filteredTreeAccounts.map((account) => (
                <TreeItem
                  key={account.account_id}
                  account={account}
                  handleAddAccount={handleAddAccount}
                  handleEditAccount={handleEditAccount}
                  getTypeColor={getTypeColor}
                  getAccountNameTextColor={getAccountNameTextColor}
                  isPrintMode={isPrintMode}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No accounts match your search.' : 'No accounts found.'}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <AccountForm
          accounts={accounts}
          account={editingAccount}
          parentId={parentAccountIdForForm}
          onClose={() => {
            setShowForm(false);
            setParentAccountIdForForm(null);
          }}
          onSave={handleSaveAccount}
          isLoading={isLoading}
        />
      )}

      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg 
                   bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default ChartOfAccounts;