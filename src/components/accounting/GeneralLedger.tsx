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
import { getGeneralLedger } from '@/api/getGeneralLedger';
import { getAccounts } from '@/api/getAccountsApi';
import { getCompanyimg } from '@/api/getGeneralLedger'; // Import the company image API
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

interface GeneralLedger {
  journal_entry_id: number;
  voucher_id: number;
  voucher_name: string;
  entry_date: string | Date;
  reference_number: string;
  journal_description: string;
  line_id: number;
  account_id: number;
  account_code: string;
  debit: number;
  credit: number;
  line_description: string;
  created_by: number;
  user_name: string;
  running_balance: string;
}

const GeneralLedger: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [ledger, setLedger] = useState<GeneralLedger[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [account_id, setAccountId] = useState<number>(0);
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Load ledger data
  const loadgeneralLedgers = async () => {
    setLoading(true); // Set loading to true when starting
    try {
      const data = await getGeneralLedger(
        account_id,
        start_date ? new Date(start_date) : undefined,
        end_date ? new Date(end_date) : undefined
      );
      setLedger(data);
    } catch (error) {
      console.error('Error loading General ledgers', error);
      // Optional: Show error toast here
    } finally {
      setLoading(false); // Set loading to false when done (whether success or error)
    }
  };

  // Load accounts
  const loadAccounts = async () => {
    try {
      const res = await getAccounts();
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
  const filteredLedgers = ledger.filter((ledger) =>
    ledger.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.voucher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.account_code.toLowerCase().includes(searchTerm.toLowerCase())
  );
    
  // Compute totals
  const totalDebit = filteredLedgers.reduce((sum, row) => {
    const debitValue = Number(row.debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);

  const totalCredit = filteredLedgers.reduce((sum, row) => {
    const creditValue = Number(row.credit);
    return sum + (isNaN(creditValue) ? 0 : creditValue);
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

   printWindow.document.write(`
<html>
  <head>
    <title>Accounts ledger</title>
    <style>
      /* Remove browser default headers and footers */
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

      /* Header layout */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding: 10px 0;
        margin-bottom: 15px;
      }

      /* Logo on the left */
      .logo img {
        width: 150px;
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

      <div class="header-right">
        <div><strong>Printed On:</strong><br>${formatDate(new Date())}</div>
      </div>
    </div>

    <div class="report-title">Accounts ledger</div>

    <div class="report-info">
      <div>
        <p><strong class="report-heading">Account:</strong> ${accounts.find(a => a.account_id === account_id) 
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
            <CardTitle>Accounts Ledger</CardTitle>
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
            <Button 
              onClick={loadgeneralLedgers}
              className="bg-blue-500 text-primary hover:bg-blue-500 border border-gray-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
                  Loading...
                </>
              ) : (
                'Load'
              )}
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="secondary"
              className="bg-blue-500 text-primary hover:bg-blue-500 border border-gray-300"
            >
              Print
            </Button>
            </div>
            </div>
          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Voucher No, Type, Account Code..."
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
                  <TableHead className="text-center align-middle">Voucher Type</TableHead>
                  <TableHead className="text-center align-middle">Voucher No</TableHead>
                  <TableHead className="text-center align-middle">Description</TableHead>
                  <TableHead className="text-center align-middle">Debit</TableHead>
                  <TableHead className="text-center align-middle">Credit</TableHead>
                  <TableHead className="text-center align-middle">Balance</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLedgers.map((ledger) => (
                  <TableRow key={ledger.journal_entry_id}>
                    <TableCell className="text-center align-middle">{formatDate(ledger.entry_date)}</TableCell>
                    <TableCell className="text-center align-middle">{ledger.voucher_name}</TableCell>
                    <TableCell className="text-center align-middle font-mono">{ledger.reference_number}</TableCell>
                    <TableCell className="text-center align-middle">{ledger.journal_description}</TableCell>
                    <TableCell className="text-center align-middle">{formatNumber(ledger.debit)}</TableCell>
                    <TableCell className="text-center align-middle">{formatNumber(ledger.credit)}</TableCell>
                    <TableCell className="text-center align-middle">{formatNumber(ledger.running_balance)}</TableCell>
                  </TableRow>
                ))}
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
              <strong>Running Balance:</strong> {formatNumber(totalCredit - totalDebit)}
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
              <th className="text-center border px-2 py-1 align-middle">Voucher Type</th>
              <th className="text-center border px-2 py-1 align-middle">Voucher No#</th>
              <th className="text-center border px-2 py-1 align-middle">Description</th>
              <th className="text-center border px-2 py-1 align-middle">Debit</th>
              <th className="text-center border px-2 py-1 align-middle">Credit</th>
              <th className="text-center border px-2 py-1 align-middle">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedgers.map((ledger) => (
              <tr key={ledger.journal_entry_id}>
                <td className="border px-2 py-1 text-center align-middle">{formatDate(ledger.entry_date)}</td>
                <td className="border px-2 py-1 text-center align-middle">{ledger.voucher_name}</td>
                <td className="border px-2 py-1 text-center align-middle">{ledger.reference_number}</td>
                <td className="border px-2 py-1 text-center align-middle">{ledger.journal_description}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(ledger.debit)}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(ledger.credit)}</td>
                <td className="border px-2 py-1 text-center align-middle">{formatNumber(ledger.running_balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td colSpan={4} className="border px-2 py-1 text-center align-middle font-bold">
                Totals:
              </td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalDebit)}</td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalCredit)}</td>
              <td className="border px-2 py-1 text-center align-middle font-bold">{formatNumber(totalCredit - totalDebit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default GeneralLedger;