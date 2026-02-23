import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card,  CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
import { getItemProfitLoss } from "@/api/itemProfitLossApi";
import { getItems } from '@/api/itemsApi';


interface Item {
  item_id: number;
  item_name: string;
}

interface ProfitLossRow {
  item_id: number;
  item_name: string;
  total_purchase: number;
  total_sale: number;
  profit: number;
  loss: number;
}

const ItemProfitLoss: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [item_id, setItemId] = useState<number>(0);
  const [itemOpen, setItemOpen] = useState(false);

  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");

  const [report, setReport] = useState<ProfitLossRow[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Load item list
  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading items", error);
    }
  };

  // Load report
  const loadReport = async () => {
    try {
      const data = await getItemProfitLoss(item_id, start_date, end_date);
      setReport(data);
    } catch (error) {
      console.error("Error loading profit/loss report", error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Formatting helpers
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

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank", "width=1000,height=700");
    printWindow!.document.write(`
      <html>
        <head><title>Profit & Loss Report</title></head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow!.document.close();
    setTimeout(() => printWindow!.print(), 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Profit & Loss Report</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 mb-4 w-full">
         {/* Item Dropdown */}
            <Popover open={itemOpen} onOpenChange={setItemOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[350px] justify-between">
                  {item_id
                    ? items.find(i => i.item_id === item_id)?.item_name
                    : "Select Item"}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[350px] max-h-[300px] overflow-auto">
                <Command>
                  <CommandInput placeholder="Search items..." />
                  <CommandEmpty>No items found.</CommandEmpty>
                  <CommandGroup>
                    {items.map(i => (
                      <CommandItem
                        key={i.item_id}
                        onSelect={() => {
                          setItemId(i.item_id);
                          setItemOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            item_id === i.item_id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {i.item_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Date Inputs - smaller width */}
            <Input
              type="date"
              value={start_date}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[200]"
            />

            <Input
              type="date"
              value={end_date}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[200]"
            />
          <Button onClick={loadReport}>Load</Button>
          {/* <Button variant="secondary" onClick={handlePrint}>Print</Button> */}
        </div>

        {/* Table */}
        <div ref={printRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Total Purchase</TableHead>
                <TableHead>Total Sale</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Loss</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {report.map(r => (
                <TableRow key={r.item_id}>
                  <TableCell>{r.item_name}</TableCell>
                  <TableCell>{formatNumber(r.total_purchase)}</TableCell>
                  <TableCell>{formatNumber(r.total_sale)}</TableCell>
                  <TableCell className="text-green-700 font-bold">
                    {formatNumber(r.profit)}
                  </TableCell>
                  <TableCell className="text-red-700 font-bold">
                    {formatNumber(r.loss)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemProfitLoss;
