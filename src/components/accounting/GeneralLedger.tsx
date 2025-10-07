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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Account {
  account_id: number;
  account_name: string;
  account_code: string;
}

interface GeneralLedger {
  journal_entry_id: number;
  voucher_id: number;
  voucher_name: string;
  entry_date: string | Date; // You may get string from API, so union is safer
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
  const [account_id, setAccountId] = useState<number>(0); // default account
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');

  // Load ledger data
  const loadgeneralLedgers = async () => {
    try {
      const data = await getGeneralLedger(
        account_id,
        start_date ? new Date(start_date) : undefined,
        end_date ? new Date(end_date) : undefined
      );
      setLedger(data);
    } catch (error) {
      console.error('Error loading General ledgers', error);
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
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Unable to open print window');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print - General Ledger Report</title>
          <!-- Tailwind CDN for print styles -->
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #444;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #eee;
            }
            .text-right {
              text-align: right;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>General Ledger</CardTitle>
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
              />
              <Input
                type="date"
                placeholder="End Date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
              />

              {/* Load Button */}
              <Button onClick={loadgeneralLedgers}>Load</Button>
              <Button onClick={handlePrint} variant="secondary">
                Print
              </Button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mt-4">
           <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search ..."
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
                <TableHead>Date</TableHead>
                <TableHead>Voucher Type</TableHead>
                <TableHead>Voucher No#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredLedgers.map((ledger) => (
                <TableRow key={ledger.journal_entry_id}>
                  <TableCell>{ledger.entry_date ? new Date(ledger.entry_date).toLocaleDateString() : ''}</TableCell>
                  <TableCell className="font-medium">{ledger.voucher_name}</TableCell>
                  <TableCell className="font-mono">{ledger.reference_number}</TableCell>
                  <TableCell className="font-medium">{ledger.journal_description}</TableCell>
                  <TableCell className="font-medium">{ledger.debit}</TableCell>
                  <TableCell className="font-medium">{ledger.credit}</TableCell>
                  <TableCell className="font-medium">{ledger.running_balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end gap-8 px-6 mt-4 text-sm text-gray-800">
            <span>
              <strong>Total Debit:</strong> {totalDebit.toFixed(2)}
            </span>
            <span>
              <strong>Total Credit:</strong> {totalCredit.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Hidden print section */}
      <div className="hidden print:block p-8" ref={printRef}>
        <h1 className="text-2xl font-bold text-center mb-4">General Ledger Report</h1>
        <p>
          <strong>Account:</strong> {accounts.find(a => a.account_id === account_id) 
  ? ` ${accounts.find(a => a.account_id === account_id)?.account_name} - ${accounts.find(a => a.account_id === account_id)?.account_code} `
  : ''}
        </p>
        <p>
          <strong>Date Range:</strong> {new Date(start_date).toLocaleDateString()} to {new Date(end_date).toLocaleDateString()}
        </p>
        <table className="w-full text-sm mt-4 border border-collapse border-gray-400">
          <thead className="border-b border-gray-400">
            <tr>
              <th className="text-left border px-2 py-1">Date</th>
              <th className="text-left border px-2 py-1">Voucher Type</th>
              <th className="text-left border px-2 py-1">Voucher No#</th>
              <th className="text-left border px-2 py-1">Description</th>
              <th className="text-right border px-2 py-1">Debit</th>
              <th className="text-right border px-2 py-1">Credit</th>
              <th className="text-right border px-2 py-1">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedgers.map((ledger) => (
              <tr key={ledger.journal_entry_id}>
                <td className="border px-2 py-1">{new Date(ledger.entry_date).toLocaleDateString()}</td>
                <td className="border px-2 py-1">{ledger.voucher_name}</td>
                <td className="border px-2 py-1">{ledger.reference_number}</td>
                <td className="border px-2 py-1">{ledger.journal_description}</td>
                <td className="border px-2 py-1 text-right">{ledger.debit}</td>
                <td className="border px-2 py-1 text-right">{ledger.credit}</td>
                <td className="border px-2 py-1 text-right">{ledger.running_balance}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
  <tr>
    <td colSpan={4} className="border px-2 py-1 text-right font-bold"style={{ fontWeight: 'bold !important' }}>
      Totals:
    </td>
    <td className="border px-2 py-1 text-right font-bold">{totalDebit.toFixed(2)}</td>
    <td className="border px-2 py-1 text-right font-bold">{totalCredit.toFixed(2)}</td>
    <td className="border px-2 py-1 text-right font-bold">-</td>
  </tr>
</tfoot>
        </table>
      </div>
    </>
  );
};

export default GeneralLedger;
