import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  ChevronsUpDown,
  Check,
  Search
} from 'lucide-react';
import { getAllCustomersLedger } from '@/api/AllLedgers'; // Updated API import
import { getCustomerParentAccounts } from '@/api/getAccountsApi';
import { getCompanyimg } from '@/api/getGeneralLedger';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Account {
  account_id: number;
  account_name: string;
  account_code: string;
}

interface Company {
  company_id: number;
  company_name: string;
  registration_number: string;
  address: string;
  phone: string;
  email: string;
  image: string;
}

interface VendorLedgerEntry {
  account_name: string;
  account_code: string;
  opening_balance: string;
  period_debit: string;
  period_credit: string;
  closing_balance: string;
}

const CustomerBalance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [ledger, setLedger] = useState<VendorLedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>(''); // Changed to account_code
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');

  // Format date to DD-MMM-YYYY
  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  // Format number with commas and remove decimal zeros
  const formatNumber = (num: number | string): string => {
    if (num === null || num === undefined || num === '') return '0';

    const numberValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numberValue)) return '0';

    // Check if number has decimals
    const hasDecimals = numberValue % 1 !== 0;

    return numberValue.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0
    });
  };

  // Load company image and data
  const loadCompanyImage = async () => {
    try {
      const data = await getCompanyimg();
      if (data && data.length > 0) {
        setCompanyData(data[0]);
      }
    } catch (error) {
      console.error("Error loading company image", error);
    }
  };

  // Load ledger data using account_code
  const loadVendorsLedger = async () => {
    try {
      if (!selectedAccountCode) {
        alert('Please select an account first');
        return;
      }
      
      const data = await getAllCustomersLedger(
        selectedAccountCode,
        start_date,
        end_date
      );
      setLedger(data);
    } catch (error) {
      console.error('Error loading Vendors ledger', error);
    }
  };

  // Load accounts
  const loadAccounts = async () => {
    try {
      const res = await getCustomerParentAccounts();
      setAccounts(res);
    } catch (error) {
      console.error('Error loading accounts', error);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadCompanyImage();
  }, []);

  // Filter ledger based on search term
  const filteredLedgers = ledger.filter((entry) =>
    entry.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.account_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute totals
  const totalDebit = filteredLedgers.reduce((sum, row) => {
    const debitValue = Number(row.period_debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);

  const totalCredit = filteredLedgers.reduce((sum, row) => {
    const creditValue = Number(row.period_credit);
    return sum + (isNaN(creditValue) ? 0 : creditValue);
  }, 0);

  const totalOpeningBalance = filteredLedgers.reduce((sum, row) => {
    const openingValue = Number(row.opening_balance);
    return sum + (isNaN(openingValue) ? 0 : openingValue);
  }, 0);

  const totalClosingBalance = filteredLedgers.reduce((sum, row) => {
    const closingValue = Number(row.closing_balance);
    return sum + (isNaN(closingValue) ? 0 : closingValue);
  }, 0);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=1000,height=700');

    if (!printWindow) {
      alert('Unable to open print window');
      return;
    }

    // Get company data for print
    const logoSource = companyData?.image || '';
    const companyName = companyData?.company_name || "Company Name";
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";
    const companyReg = companyData?.registration_number || "";

    // Get selected account info
    const selectedAccount = accounts.find(a => a.account_code === selectedAccountCode);

    printWindow.document.write(`
<html>
  <head>
    <title>Customer Ledger</title>
    <style>
      @page {
        margin-top: 0;
      }
      
      body {
        font-family: 'Times New Roman', serif;
        font-size: 11px;
        margin: 15;
        padding: 15px;
        color: #000;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding: 10px 0;
        margin-bottom: 15px;
      }

      .logo img {
        width: 150px;
        height: auto;
      }

      .company-info {
        text-align: center;
        flex: 1;
      }

      .company-info h2 {
        margin: 0;
        font-size: 20px;
        font-weight: bold;
      }

      .company-details {
        font-size: 13px;
        color: #666;
        margin-top: 3px;
      }

      .header-right {
        text-align: right;
        font-size: 10px;
        white-space: nowrap;
      }

      .report-title {
        text-align: center;
        margin: 12px 0;
        font-size: 16px;
        font-weight: bold;
        text-decoration: underline;
      }
      
      .report-heading {
        font-size: 14px;   
        font-weight: 700; 
      }

      .report-info {
        margin: 8px 0;
        font-size: 11px;
        display: flex;
        justify-content: space-between;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 10px;
      }

      th, td {
        border: 1px solid #000;
        padding: 4px;
        text-align: center;
        vertical-align: top;
      }

      th {
        background-color: #f0f0f0;
        font-weight: bold;
      }

      .text-right { text-align: right; }
      .text-left { text-align: left !important; }
      .text-center { text-align: center; }

      .footer {
        margin-top: 15px;
        border-top: 1px solid #000;
        padding-top: 8px;
        font-size: 10px;
      }

      .totals-row {
        font-weight: bold;
        background-color: #f8f8f8;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">
        ${logoSource ? `<img src="${logoSource}" alt="Company Logo" />` : ''}
      </div>

      <div class="company-info">
        <h2>${companyName}</h2>
        <div class="company-details">
          ${companyAddress ? `<div>${companyAddress}</div>` : ''}
          ${companyPhone ? `<div>${companyPhone} ${companyEmail ? '| ' + companyEmail : ''}</div>` : ''}
        </div>
      </div>

      <div class="header-right">
        <div><strong>Printed On:</strong><br>${formatDate(new Date())}</div>
      </div>
    </div>

    <div class="report-title">Customer Ledger</div>

    <div class="report-info">
      <div>
        <p><strong class="report-heading">Account:</strong> ${selectedAccount 
                ? `${selectedAccount.account_name} (${selectedAccount.account_code})`
                : 'All Accounts'}</p>
      </div>
      <div>
        <p><strong class="report-heading">Date Range:</strong> ${formatDate(start_date)} to ${formatDate(end_date)}</p>
      </div>
    </div>

    ${printContent}
  </body>
</html>
`);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Balance</CardTitle>
            <div className="flex gap-4">
              {/* Account Popover - now using account_code */}
              <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedAccountCode
                      ? `${accounts.find((a) => a.account_code === selectedAccountCode)?.account_name} (${selectedAccountCode})`
                      : 'Select Account'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command>
                    <CommandInput placeholder="Search accounts..." className="text-black" />
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                      {accounts.map((a) => (
                        <CommandItem
                          key={a.account_code} // Changed key to account_code
                          className="hover:bg-gray-100"
                          onSelect={() => {
                            setSelectedAccountCode(a.account_code); // Set account_code
                            setAccountOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedAccountCode === a.account_code ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {`${a.account_code} - ${a.account_name}`}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Date Inputs */}
              <Input
                type="date"
                placeholder="Start Date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />

              {/* Load Button */}
              <Button onClick={loadVendorsLedger}>Load</Button>
              <Button onClick={handlePrint} variant="outline">
                Print
              </Button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Vendor Name, Account Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="text-center align-middle">SR #</TableHead>
                  <TableHead className="text-center align-middle">Customer Name</TableHead>
                  <TableHead className="text-center align-middle">Account Code</TableHead>
                  <TableHead className="text-center align-middle">Opening Balance</TableHead>
                  <TableHead className="text-center align-middle">Period Debit</TableHead>
                  <TableHead className="text-center align-middle">Period Credit</TableHead>
                  <TableHead className="text-center align-middle">Closing Balance</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLedgers.map((entry, index) => (
                 <TableRow key={`${entry.account_code}-${entry.account_name}-${index}`}>
  <TableCell className="text-center align-middle font-medium">
    {index + 1}
  </TableCell>

  <TableCell className="text-center align-middle">
    {entry.account_name}
  </TableCell>

  <TableCell className="text-center align-middle">
    {entry.account_code}
  </TableCell>

  <TableCell className="text-center align-middle">
    {formatNumber(entry.opening_balance)}
  </TableCell>

  <TableCell className="text-center align-middle">
    {formatNumber(entry.period_debit)}
  </TableCell>

  <TableCell className="text-center align-middle">
    {formatNumber(entry.period_credit)}
  </TableCell>

  <TableCell className="text-center align-middle">
    {formatNumber(entry.closing_balance)}
  </TableCell>
</TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-8 px-6 mt-4 text-sm text-gray-800">
            <span>
              <strong>Total Opening Balance:</strong> {formatNumber(totalOpeningBalance)}
            </span>
            <span>
              <strong>Total Debit:</strong> {formatNumber(totalDebit)}
            </span>
            <span>
              <strong>Total Credit:</strong> {formatNumber(totalCredit)}
            </span>
            <span>
              <strong>Total Closing Balance:</strong> {formatNumber(totalClosingBalance)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Hidden print section */}
      <div className="hidden" ref={printRef}>
        <table className="w-full text-sm border border-collapse border-gray-400">
          <thead className="border-b border-gray-400">
            <tr>
              <th className="text-center border px-2 py-1 align-middle">Vendor Name</th>
              <th className="text-center border px-2 py-1 align-middle">Account Code</th>
              <th className="text-center border px-2 py-1 align-middle">Opening Balance</th>
              <th className="text-center border px-2 py-1 align-middle">Period Debit</th>
              <th className="text-center border px-2 py-1 align-middle">Period Credit</th>
              <th className="text-center border px-2 py-1 align-middle">Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedgers.map((entry, index) => (
              <tr key={`${entry.account_code}-${entry.account_name}-${index}`}>
                <td className="border px-2 py-1 text-center align-middle">{entry.account_name}</td>
                <td className="border px-2 py-1 text-center align-middle">{entry.account_code}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(entry.opening_balance)}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(entry.period_debit)}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(entry.period_credit)}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(entry.closing_balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td colSpan={2} className="border px-2 py-1 text-center align-middle font-bold">
                Totals:
              </td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalOpeningBalance)}</td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalDebit)}</td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalCredit)}</td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalClosingBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default CustomerBalance;