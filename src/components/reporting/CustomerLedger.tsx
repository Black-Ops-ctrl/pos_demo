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
import { getCustomerLedger } from '@/api/CustomerLedgerApi';
import { getCustomerAccounts } from '@/api/getAccountsApi';
import { getCompanies, getCompanyimg } from '@/api/CustomerLedgerApi';
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

interface CustomerLedger {
  journal_entry_id: number;
  voucher_id: number;
  category: string;
  entry_date: string | Date;
  tran_no: string;
  remarks: string;
  // item_name:string; // Commented out
  // quantity:string; // Commented out
  // vehicle_no: string; // Commented out
  // live_birds: string; // Commented out
  rate: string;
  line_id: number;
  account_id: number;
  account_code: string;
  debit: number;
  credit: number;
  line_description: string;
  created_by: number;
  user_name: string;
  running_balance: string; // "585800.0 CR" या "585800.0 DR" फॉर्मेट में
}

const CustomerLedger: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [ledger, setLedger] = useState<CustomerLedger[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [account_id, setAccountId] = useState<number>(0);
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');

  // Format running balance string (e.g., "585800.0 CR") to display format
  const formatRunningBalance = (balanceString: string): string => {
    if (!balanceString) return '0';
    
    const parts = balanceString.trim().split(' ');
    if (parts.length < 2) return formatNumber(parts[0] || '0');
    
    const amount = parts[0];
    const type = parts[1]; // CR या DR
    
    const formattedAmount = formatNumber(amount);
    
    // Return with type indicator
    return `${formattedAmount} ${type}`;
  };

  // Get only the numeric value from running balance for calculations
  const getBalanceValue = (balanceString: string): number => {
    if (!balanceString) return 0;
    
    const parts = balanceString.trim().split(' ');
    const amount = parts[0];
    
    const numericValue = parseFloat(amount);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Get balance type (CR/DR) for styling
  const getBalanceType = (balanceString: string): string => {
    if (!balanceString) return '';
    
    const parts = balanceString.trim().split(' ');
    return parts.length > 1 ? parts[1] : '';
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

  // Load ledger data
  const loadCustomerLedgers = async () => {
    try {
      const data = await getCustomerLedger(
        account_id,
        start_date ? new Date(start_date) : undefined,
        end_date ? new Date(end_date) : undefined
      );
      setLedger(data);
    } catch (error) {
      console.error('Error loading Customer ledgers', error);
    }
  };

  // Load accounts
  const loadAccounts = async () => {
    try {
      const res = await getCustomerAccounts();
      setAccounts(res);
    } catch (error) {
      console.error('Error loading accounts', error);
    }
  };

  // Load companies
  const loadCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(res);
      if (res && res.length > 0) {
        setSelectedCompany(res[0]);
      }
    } catch (error) {
      console.error('Error loading companies', error);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadCompanies();
    loadCompanyImage();
  }, []);

  // Filter ledger based on search term
  const filteredLedgers = ledger.filter((ledger) => {
    const refNumber = ledger.tran_no?.toLowerCase() || '';
    const voucherName = ledger.category?.toLowerCase() || '';
    const accountCode = ledger.account_code?.toLowerCase() || '';
    // const itemName = ledger.item_name?.toLowerCase() || ''; // Commented out
    // const vehicleNo = ledger.vehicle_no?.toLowerCase() || ''; // Commented out
    const searchLower = searchTerm.toLowerCase();

    return (
      refNumber.includes(searchLower) ||
      voucherName.includes(searchLower) ||
      accountCode.includes(searchLower)
      // itemName.includes(searchLower) || // Commented out
      // vehicleNo.includes(searchLower) // Commented out
    );
  });
    
  // Compute totals
  const totalDebit = filteredLedgers.reduce((sum, row) => {
    const debitValue = Number(row.debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);

  const totalCredit = filteredLedgers.reduce((sum, row) => {
    const creditValue = Number(row.credit);
    return sum + (isNaN(creditValue) ? 0 : creditValue);
  }, 0);

  // Get final running balance (last entry's running balance)
  const finalRunningBalance = filteredLedgers.length > 0 
    ? filteredLedgers[filteredLedgers.length - 1].running_balance 
    : '0';

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

     printWindow.document.write(`
<html>
  <head>
    
    <style>
     @page {
        margin-top: 0;
         margin-bottom:0;
        
      }
      body {
        font-family: 'Times New Roman', serif;
        font-size: 11px;
        margin: 15px;
        color: #000;
      }

      /* Header layout */
      .header {
        display: flex;
        align-items: center; /* vertically center content */
        justify-content: space-between;
        border-bottom: 1px solid #000;
        padding: 10px 0;
      }

      /* Logo on the left */
      .logo img {
        width: 160px;
        height: auto;
      }

      /* Company info at center */
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
        margin-top: 5px;
        font-size: 10px;
      }

      th, td {
        border: 0.6px solid #000;
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

      .balance-cr {
        color: green;
      }
      
      .balance-dr {
        color: red;
      }

      .page-break {
        page-break-after: always;
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

    
    </div>
       <div style="width: 100%; text-align: right; margin: 8px 0;">
  Print Date: ${formatDate(new Date())}
</div>

    <div class="report-title">CUSTOMER LEDGER REPORT</div>

    <div class="report-info">
      <div>
        <p>  <strong class="report-heading">Account:</strong> ${accounts.find(a => a.account_id === account_id) 
                ? `${accounts.find(a => a.account_id === account_id)?.account_name} (${accounts.find(a => a.account_id === account_id)?.account_code})`
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
            <CardTitle>Customer Item wise Ledger</CardTitle>
            <div className="flex gap-4">
              {/* Account Popover */}
              <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {account_id
                      ? `${accounts.find((a) => a.account_id === account_id)?.account_name} (${accounts.find((a) => a.account_id === account_id)?.account_code})`
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
                          key={a.account_id}
                          className="hover:bg-gray-100"
                          onSelect={() => {
                            setAccountId(a.account_id);
                            setAccountOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              account_id === a.account_id ? 'opacity-100' : 'opacity-0'
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
              <Button onClick={loadCustomerLedgers}>Load</Button>
              <Button onClick={handlePrint} variant="outline">
                Print
              </Button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Invoice No, Customer Name, Account Code..."
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
                  <TableHead className="text-center align-middle">Date</TableHead>
                  <TableHead className="text-center align-middle">Customer Name</TableHead>
                  <TableHead className="text-center align-middle">Invoice Number</TableHead>
                  {/* <TableHead className="text-center align-middle">Narration</TableHead> Commented out */}
                  {/* <TableHead className="text-center align-middle">Item</TableHead> Commented out */}
                  {/* <TableHead className="text-center align-middle">Quantity</TableHead> Commented out */}
                  {/* <TableHead className="text-center align-middle">Vehicle No</TableHead> Commented out */}
                  {/* <TableHead className="text-center align-middle">Weight</TableHead> Commented out */}
                  <TableHead className="text-center align-middle">Total Amount</TableHead>
                  <TableHead className="text-center align-middle">Debit</TableHead>
                  <TableHead className="text-center align-middle">Credit</TableHead>
                  <TableHead className="text-center align-middle">Remaining Balance</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLedgers.map((ledger) => {
                  const balanceType = getBalanceType(ledger.running_balance);
                  return (
                    <TableRow key={ledger.journal_entry_id}>
                      <TableCell className="text-center align-middle">{formatDate(ledger.entry_date)}</TableCell>
                      <TableCell className="text-center align-middle">{ledger.category}</TableCell> {/* Customer name */}
                      <TableCell className="text-center align-middle font-mono">{ledger.tran_no}</TableCell> {/* Invoice number */}
                      {/* <TableCell className="text-center align-middle">{ledger.remarks}</TableCell> Commented out */}
                      {/* <TableCell className="text-center align-middle">{ledger.item_name}</TableCell> Commented out */}
                      {/* <TableCell className="text-center align-middle">{ledger.quantity}</TableCell> Commented out */}
                      {/* <TableCell className="text-center align-middle">{ledger.vehicle_no}</TableCell> Commented out */}
                      {/* <TableCell className="text-center align-middle">{ledger.live_birds}</TableCell> Commented out */}
                      <TableCell className="text-center align-middle">{ledger.rate}</TableCell> {/* Total amount */}
                      <TableCell className="text-center align-middle">{formatNumber(ledger.debit)}</TableCell>
                      <TableCell className="text-center align-middle">{formatNumber(ledger.credit)}</TableCell>
                      <TableCell className={`text-center align-middle ${
                        balanceType === 'CR' ? 'text-green-600' : 
                        balanceType === 'DR' ? 'text-red-600' : ''
                      }`}>
                        {formatRunningBalance(ledger.running_balance)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-8 px-6 mt-4 text-sm text-gray-800">
            <span>
              <strong>Total Debit:</strong> {formatNumber(totalDebit)}
            </span>
            <span>
              <strong>Total Credit:</strong> {formatNumber(totalCredit)}
            </span>
            <span>
              <strong>Running Balance:</strong> 
              <span className={
                finalRunningBalance.includes('CR') ? 'text-green-600 ml-1' : 
                finalRunningBalance.includes('DR') ? 'text-red-600 ml-1' : 'ml-1'
              }>
                {formatRunningBalance(finalRunningBalance)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Hidden print section */}
      <div className="hidden" ref={printRef}>
        <table className="w-full text-sm border border-collapse border-gray-400">
          <thead className="border-b border-gray-400">
            <tr>
              <th className="text-center border px-2 py-1 align-middle">Date</th>
              <th className="text-center border px-2 py-1 align-middle">Customer Name</th>
              <th className="text-center border px-2 py-1 align-middle">Invoice Number</th>
              {/* <th className="text-center border px-2 py-1 align-middle">Narration</th> Commented out */}
              {/* <th className="text-center border px-2 py-1 align-middle">Item</th> Commented out */}
              {/* <th className="text-center border px-2 py-1 align-middle">Quantity</th> Commented out */}
              {/* <th className="text-center border px-2 py-1 align-middle">Vehicle No</th> Commented out */}
              {/* <th className="text-center border px-2 py-1 align-middle">Weight</th> Commented out */}
              <th className="text-center border px-2 py-1 align-middle">Total Amount</th>
              <th className="text-center border px-2 py-1 align-middle">Debit</th>
              <th className="text-center border px-2 py-1 align-middle">Credit</th>
              <th className="text-center border px-2 py-1 align-middle">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedgers.map((ledger) => {
              const balanceType = getBalanceType(ledger.running_balance);
              return (
                <tr key={ledger.journal_entry_id}>
                  <td className="border px-2 py-1 text-center align-middle">{formatDate(ledger.entry_date)}</td>
                  <td className="border px-2 py-1 text-center align-middle">{ledger.category}</td> {/* Customer name */}
                  <td className="border px-2 py-1 text-center align-middle">{ledger.tran_no}</td> {/* Invoice number */}
                  {/* <td className="text-left">{(ledger.remarks || "").toUpperCase()}</td> Commented out */}  
                  {/* <td className="border px-2 py-1 text-center align-middle">{ledger.item_name}</td> Commented out */}
                  {/* <td className="border px-2 py-1 text-center align-middle">{ledger.quantity}</td> Commented out */}
                  {/* <td className="border px-2 py-1 text-center align-middle">{ledger.vehicle_no}</td> Commented out */}
                  {/* <td className="border px-2 py-1 text-center align-middle">{ledger.live_birds}</td> Commented out */}
                  <td className="border px-2 py-1 text-center align-middle">{ledger.rate}</td> {/* Total amount */}
                  <td className="border px-2 py-1 text-center align-middle">{formatNumber(ledger.debit)}</td>
                  <td className="border px-2 py-1 text-center align-middle">{formatNumber(ledger.credit)}</td>
                  <td className={`border px-2 py-1 text-center align-middle ${
                    balanceType === 'CR' ? 'balance-cr' : 
                    balanceType === 'DR' ? 'balance-dr' : ''
                  }`}>
                    {formatRunningBalance(ledger.running_balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td colSpan={6} className="border px-2 py-1 text-center align-middle font-bold">
                Totals:
              </td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalDebit)}</td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalCredit)}</td>
              <td className={`border px-2 py-1 text-center align-middle font-bold ${
                finalRunningBalance.includes('CR') ? 'balance-cr' : 
                finalRunningBalance.includes('DR') ? 'balance-dr' : ''
              }`}>
                {formatRunningBalance(finalRunningBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default CustomerLedger;