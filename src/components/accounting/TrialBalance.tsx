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
import { getTrialBalance } from '@/api/getTrialBalanceApi';
import { getAccounts } from '@/api/accountsApi';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Account {
  level_no: number;
  account_id: number;
  account_name: string;
  account_code: string;
}

interface TrilaBalance {
  account_id: number,
        account_code:string;
        o_total_debit: number;
        o_total_credit: number;
        b_total_debit: number;
        b_total_credit: number;
        debit: number;
        credit:number;
        c_debit: number;
        c_credit: number;
}

const TrialBalance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFromOpen, setAccountFromOpen] = useState(false);
  const [accountToOpen, setAccountToOpen] = useState(false);
  const [balances, setBalances] = useState<TrilaBalance[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [p_account_from, setAccountFrom] = useState<number>(0); // default account
  const [p_account_to, setAccountTo] = useState<number>(0);
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [level, setLevel] = React.useState<number | undefined>(undefined);
  // Load ledger data
  const loadgeneralLedgers = async () => {
    try {
      const data = await getTrialBalance(
        level,
        p_account_from,
        p_account_to,
        start_date ? new Date(start_date) : undefined,
        end_date ? new Date(end_date) : undefined
      );
      setBalances(data);
    } catch (error) {
      console.error('Error loading TrilaBalance', error);
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
  const filteredBlanaces = balances.filter((balance) =>
    balance.account_code.toLowerCase().includes(searchTerm.toLowerCase())
  );
    
  // Compute totals
   //  o_total_debit
   const o_totaldebit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.o_total_debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);
  // o_total_credit
   const o_totalcredit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.o_total_credit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);
  // b_total_debit
   const b_totaldebit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.b_total_debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);

  ///   b_total_credit
   const b_totalcredit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.b_total_credit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);
//      total debit

  const totalDebit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);
//   total credit
  const totalCredit = filteredBlanaces.reduce((sum, row) => {
    const creditValue = Number(row.credit);
    return sum + (isNaN(creditValue) ? 0 : creditValue);
  }, 0);
  //    c_totaldebit
 const c_totaldebit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.c_debit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
  }, 0);
  ////   c_totalcredit
   const c_totalcredit = filteredBlanaces.reduce((sum, row) => {
    const debitValue = Number(row.c_credit);
    return sum + (isNaN(debitValue) ? 0 : debitValue);
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
            <CardTitle>Trial Balance</CardTitle>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4 p-4 rounded-xl  w-full">
    
    {/* 1. Level Selector */}
    <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-sm font-medium text-gray-700">Select Level</label>
        <Select value={level?.toString()} onValueChange={(val) => setLevel(Number(val))}>
            {/* Set width explicitly to control size on larger screens */}
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
            </SelectContent>
        </Select>
    </div>

    {/* 2. Account From Popover */}
    {/* flex-1 allows this input to expand more than others on wider screens */}
    <div className="flex flex-col gap-1 min-w-[180px] flex-1">
        <label className="text-sm font-medium text-gray-700">Account From</label>
        <Popover open={accountFromOpen} onOpenChange={setAccountFromOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between overflow-hidden text-ellipsis whitespace-nowrap">
                    {p_account_from
                        ? `${accounts.find((a) => a.account_id === p_account_from)?.account_name} (${accounts.find((a) => a.account_id === p_account_from)?.account_code})`
                        : 'Select Account'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                </Button>
            </PopoverTrigger>
            {/* Popover content width is adjusted */}
            <PopoverContent className="max-h-[300px] overflow-auto min-w-[250px] p-0 z-50">
                <Command>
                    <CommandInput placeholder="Search accounts..." className="text-black" />
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                        {accounts
                            .filter((a) => level === undefined || a.level_no === level)
                            .map((a) => (
                                <CommandItem
                                    key={a.account_id}
                                    className="hover:bg-gray-100"
                                    onSelect={() => {
                                        setAccountFrom(a.account_id);
                                        setAccountFromOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            p_account_from === a.account_id ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {`${a.account_code} - ${a.account_name}`}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    </div>

    {/* 3. Account To Popover */}
    <div className="flex flex-col gap-1 min-w-[180px] flex-1">
        <label className="text-sm font-medium text-gray-700">Account To</label>
        <Popover open={accountToOpen} onOpenChange={setAccountToOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between overflow-hidden text-ellipsis whitespace-nowrap">
                    {p_account_to
                        ? `${accounts.find((a) => a.account_id === p_account_to)?.account_name} (${accounts.find((a) => a.account_id === p_account_to)?.account_code})`
                        : 'Select Account'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto min-w-[250px] p-0 z-50">
                <Command>
                    <CommandInput placeholder="Search accounts..." className="text-black" />
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                        {accounts
                            .filter((a) => level === undefined || a.level_no === level)
                            .map((a) => (
                                <CommandItem
                                    key={a.account_id}
                                    className="hover:bg-gray-100"
                                    onSelect={() => {
                                        setAccountTo(a.account_id);
                                        setAccountToOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            p_account_to === a.account_id ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {`${a.account_code} - ${a.account_name}`}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    </div>

    {/* 4. Date From Input */}
    <div className="flex flex-col gap-1 min-w-[130px]">
        <label className="text-sm font-medium text-gray-700">Date From</label>
        <Input
            type="date"
            placeholder="Start Date"
            value={start_date}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
        />
    </div>

    {/* 5. Date To Input */}
    <div className="flex flex-col gap-1 min-w-[130px]">
        <label className="text-sm font-medium text-gray-700">Date To</label>
        <Input
            type="date"
            placeholder="End Date"
            value={end_date}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
        />
    </div>

    {/* 6. Buttons - aligned to the bottom */}
    {/* items-end in the parent ensures these buttons align with the bottom of the date inputs */}
    <div className="flex gap-3 mt-auto pt-4 md:pt-0">
        <Button onClick={loadgeneralLedgers} className="h-10">Load</Button>
        <Button onClick={handlePrint} variant="secondary" className="h-10">
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
      {/* ----------------- FIRST HEADER ROW (Main Headings) ----------------- */}
      <TableHeader>
        <TableRow>
          {/* Account (Spans one column) */}
          <TableHead rowSpan={2} className="w-[200px] text-left align-bottom">
            Account
          </TableHead>

          {/* Opening Balance (Spans 2 columns: Debit & Credit) */}
          <TableHead colSpan={2} className="text-center border-l border-r">
            Opening Balance
          </TableHead>

          {/* During Period (Spans 4 columns: Total Dr/Cr, Net Dr/Cr) */}
          <TableHead colSpan={2} className="text-center border-r">
            During Period
          </TableHead>
           {/* During Period (Spans 4 columns: Total Dr/Cr, Net Dr/Cr) */}
          <TableHead colSpan={2} className="text-center border-r">
           Net During Period 
          </TableHead>

          {/* Closing Balance (Spans 2 columns: Debit & Credit) */}
          <TableHead colSpan={2} className="text-center">
            Closing Balance
          </TableHead>
        </TableRow>

        {/* ----------------- SECOND HEADER ROW (Detail Headings) ----------------- */}
        <TableRow>
          {/* Opening Balance Details */}
          <TableHead className="text-right border-l">Debit</TableHead>
          <TableHead className="text-right border-r">Credit</TableHead>

          {/* During Period Details */}
          {/* Assuming b_total_debit/credit is the Gross Movement, and debit/credit is the Net Movement */}
          <TableHead className="text-right">Total Debit (B)</TableHead>
          <TableHead className="text-right border-r">Total Credit (B)</TableHead>
          <TableHead className="text-right">Net Debit</TableHead>
          <TableHead className="text-right border-r">Net Credit</TableHead>

          {/* Closing Balance Details */}
          <TableHead className="text-right">Debit</TableHead>
          <TableHead className="text-right">Credit</TableHead>
        </TableRow>
      </TableHeader>

      {/* ----------------- TABLE BODY (Data Rows) ----------------- */}
      <TableBody>
        {filteredBlanaces.map((balance) => (
          <TableRow key={balance.account_id}>
            {/* Account */}
            <TableCell className="font-semibold">{balance.account_code}</TableCell>

            {/* Opening Balance */}
            <TableCell className="text-right text-green-700">
              {balance.o_total_debit}
            </TableCell>
            <TableCell className="text-right text-red-700">
              {balance.o_total_credit}
            </TableCell>

            {/* During Period (Movement) */}
            <TableCell className="text-right">{balance.b_total_debit}</TableCell>
            <TableCell className="text-right">{balance.b_total_credit}</TableCell>
            <TableCell className="text-right">{balance.debit}</TableCell>
            <TableCell className="text-right">{balance.credit}</TableCell>

            {/* Closing Balance */}
            <TableCell className="text-right font-bold text-green-900">
              {balance.c_debit}
            </TableCell>
            <TableCell className="text-right font-bold text-red-900">
              {balance.c_credit}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
       <TableFooter className="bg-indigo-100/80 border-t-2 border-indigo-500">
                            <TableRow>
                                <TableCell className="text-right font-semibold text-indigo-900">
                                    TOTALS:
                                </TableCell>
                                
                                {/* Opening Balance Totals */}
                                <TableCell className="text-right font-semibold ">{o_totaldebit}</TableCell>
                                <TableCell className="text-right font-semibold ">{o_totalcredit}</TableCell>

                                {/* During Period (Gross) Totals */}
                                <TableCell className="text-right font-semibold ">{b_totaldebit}</TableCell>
                                <TableCell className="text-right font-semibold ">{b_totalcredit}</TableCell>

                                {/* During Period (Net) Totals */}
                                <TableCell className="text-right font-semibold ">{totalDebit}</TableCell>
                                <TableCell className="text-right font-semibold ">{totalCredit}</TableCell>

                                {/* Closing Balance Totals (The critical check) */}
                                <TableCell 
                                    className={`text-right font-semibold  ${c_totaldebit === c_totalcredit ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {c_totaldebit}
                                </TableCell>
                                <TableCell 
                                    className={`text-right font-semibold ${c_totaldebit === c_totalcredit ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {c_totalcredit}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={9} className="text-center bg-white/70">
                                    <span className="font-semibold">Balance Check: </span>
                                    {c_totaldebit === c_totalcredit ? (
                                        <span className="text-green-600 font-semibold">Trial Balance is Balanced!</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">
                                            WARNING: Trial Balance is Out of Balance! (Difference: {(c_totaldebit - c_totalcredit)}) 
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
    </Table>
        </CardContent>
      </Card>

      {/* Hidden print section */}
      <div className="hidden print:block p-8" ref={printRef}>
        <h1 className="text-2xl font-bold text-center mb-4">General Ledger Report</h1>
        <p>
          <strong>Account:</strong> {accounts.find(a => a.account_id === p_account_from) 
  ? ` ${accounts.find(a => a.account_id === p_account_from)?.account_name} - ${accounts.find(a => a.account_id === p_account_from)?.account_code} `
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
            {filteredBlanaces.map((balance) => (
              <tr key={balance.account_id}>
                <td className="border px-2 py-1">{balance.o_total_debit}</td>
                <td className="border px-2 py-1">{balance.o_total_credit}</td>
                <td className="border px-2 py-1">{balance.b_total_debit}</td>
                <td className="border px-2 py-1">{balance.b_total_credit}</td>
                <td className="border px-2 py-1 text-right">{balance.debit}</td>
                <td className="border px-2 py-1 text-right">{balance.credit}</td>
                <td className="border px-2 py-1 text-right">{balance.c_debit}</td>
                <td className="border px-2 py-1 text-right">{balance.c_credit}</td>
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

export default TrialBalance;
