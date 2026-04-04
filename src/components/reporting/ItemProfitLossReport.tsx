import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Loader2,
  Download,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { getProductProfitLoss } from "@/api/itemProfitLossApi";
import { fetchProducts } from '@/core/services/api/fetchProducts';
import { toast } from '@/hooks/use-toast';

interface Product {
  product_id: number;
  product_name: string;
}

interface ProfitLossRow {
  product_id: number;
  product_name: string;
  total_purchase: string;
  total_sale: string;
  sold_quantity: string;
  profit: string;
  loss: string;
}

const ItemProfitLoss: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [product_id, setProductId] = useState<number>(0);
  const [productOpen, setProductOpen] = useState(false);
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [report, setReport] = useState<ProfitLossRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [totalSoldQty, setTotalSoldQty] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Load products list
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsData = await fetchProducts();
      console.log("Products loaded:", productsData);
      
      const transformedProducts = productsData.map((prod: any) => ({
        product_id: prod.product_id || prod.id || prod.item_id || 0,
        product_name: prod.product_name || prod.name || prod.title || `Product #${prod.product_id || prod.id}`
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error loading products", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load report using the API
  const loadReport = async () => {
    if (!start_date || !end_date) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (new Date(start_date) > new Date(end_date)) {
      toast({
        title: "Validation Error",
        description: "Start date cannot be greater than end date",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const data = await getProductProfitLoss(
        product_id || null,
        start_date,
        end_date
      );
      
      console.log("Report data received:", data);
      setReport(data);
      
      // Calculate totals from API data
      let profitTotal = 0;
      let lossTotal = 0;
      let soldQtyTotal = 0;
      
      data.forEach((item: ProfitLossRow) => {
        profitTotal += parseFloat(item.profit) || 0;
        lossTotal += parseFloat(item.loss) || 0;
        soldQtyTotal += parseFloat(item.sold_quantity) || 0;
      });
      
      setTotalProfit(profitTotal);
      setTotalLoss(lossTotal);
      setTotalSoldQty(soldQtyTotal);
      setNetProfit(profitTotal - lossTotal);
      
      // Filter products to only show those that exist in the report
      if (data.length > 0) {
        const reportItemIds = new Set(data.map((item: ProfitLossRow) => item.product_id));
        const availableProducts = products.filter(prod => 
          reportItemIds.has(prod.product_id)
        );
        setFilteredProducts(availableProducts);
      } else {
        setFilteredProducts([]);
      }
      
      toast({
        title: "Success",
        description: `Report loaded with ${data.length} items`,
        duration: 3000
      });
    } catch (error) {
      console.error("Error loading profit/loss report", error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const handleClear = () => {
    setProductId(0);
    setStartDate("");
    setEndDate("");
    setReport([]);
    setFilteredProducts([]);
    setTotalProfit(0);
    setTotalLoss(0);
    setTotalSoldQty(0);
    setNetProfit(0);
  };

  // Format number with commas and decimal places
  const formatNumber = (num: string | number): string => {
    if (num === null || num === undefined || num === '') return '0';
    
    const numberValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numberValue)) return '0';
    
    return numberValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get status badge based on profit/loss
  const getStatusBadge = (profit: string, loss: string) => {
    const profitNum = parseFloat(profit) || 0;
    const lossNum = parseFloat(loss) || 0;
    
    if (profitNum > 0) {
      return (
        <div className="flex items-center justify-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">Profit</span>
        </div>
      );
    } else if (lossNum > 0) {
      return (
        <div className="flex items-center justify-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <span className="text-red-600 font-medium">Loss</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center gap-1">
          {/* <Minus] className="w-4 h-4 text-gray-500" /> */}
          <span className="text-gray-500 font-medium">N/A</span>
        </div>
      );
    }
  };

  // Get product name by ID
  const getProductName = (id: number): string => {
    if (id === 0) return "All Items";
    const product = products.find(p => p.product_id === id);
    return product?.product_name || `Product #${id}`;
  };

  // Handle print
  const handlePrint = () => {
    if (!printRef.current) return;
    if (report.length === 0) {
      toast({
        title: "No Data",
        description: "No report data to print",
        variant: "destructive"
      });
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=800");
    const today = new Date().toLocaleDateString();
    
    printWindow!.document.write(`
      <html>
        <head>
          <title>Profit & Loss Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #333; text-align: center; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 14px; color: #666; }
            .summary-value { font-size: 18px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .text-center { text-align: center; }
            .profit { color: #16a34a; font-weight: bold; }
            .loss { color: #dc2626; font-weight: bold; }
            .break-even { color: #6b7280; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h2>Product Profit & Loss Report</h2>
          <div class="header">
            <div><strong>Period:</strong> ${start_date} to ${end_date}</div>
            <div><strong>Generated:</strong> ${today}</div>
            ${product_id ? `<div><strong>Product:</strong> ${getProductName(product_id)}</div>` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Sold Quantity</div>
                <div class="summary-value">${formatNumber(totalSoldQty)}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value profit">${formatNumber(totalProfit)}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Loss</div>
                <div class="summary-value loss">${formatNumber(totalLoss)}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Net Profit/Loss</div>
                <div class="summary-value ${netProfit >= 0 ? 'profit' : 'loss'}">${formatNumber(Math.abs(netProfit))}</div>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Total Purchase</th>
                <th>Total Sale</th>
                <th>Sold Quantity</th>
                <th class="text-center">Status</th>
                <th>Profit</th>
                <th>Loss</th>
              </tr>
            </thead>
            <tbody>
              ${report.map(r => {
                const profitNum = parseFloat(r.profit) || 0;
                const lossNum = parseFloat(r.loss) || 0;
                const status = profitNum > 0 ? 'Profit' : lossNum > 0 ? 'Loss' : 'Break Even';
                const statusClass = profitNum > 0 ? 'profit' : lossNum > 0 ? 'loss' : 'break-even';
                return `
                  <tr>
                    <td>${r.product_name}</td>
                    <td>${formatNumber(r.total_purchase)}</td>
                    <td>${formatNumber(r.total_sale)}</td>
                    <td>${formatNumber(r.sold_quantity)}</td>
                    <td class="text-center ${statusClass}">${status}</td>
                    <td class="profit">${formatNumber(r.profit)}</td>
                    <td class="loss">${formatNumber(r.loss)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is a system generated report</p>
          </div>
        </body>
      </html>
    `);
    printWindow!.document.close();
    setTimeout(() => printWindow!.print(), 500);
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Profit & Loss Report</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Filters Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          {/* Product Dropdown */}
          <div className="w-full md:w-80">
            <Popover open={productOpen} onOpenChange={setProductOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={loadingProducts}>
                  {loadingProducts ? (
                    "Loading products..."
                  ) : (
                    product_id && product_id !== 0
                      ? getProductName(product_id)
                      : "All Products"
                  )}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[320px] max-h-[300px] overflow-auto p-0">
                <Command>
                  <CommandInput placeholder="Search products..." className="h-9" />
                  <CommandEmpty>
                    {loadingProducts 
                      ? "Loading products..." 
                      : filteredProducts.length === 0 && report.length > 0 
                        ? "No products available in current report" 
                        : "No products found"}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[250px] overflow-auto">
                    {filteredProducts.length > 0 ? (
                      <>
                        <CommandItem
                          onSelect={() => {
                            setProductId(0);
                            setProductOpen(false);
                          }}
                          className="cursor-pointer border-b pb-2 mb-2 font-medium"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              product_id === 0 ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Products
                        </CommandItem>
                        
                        {filteredProducts.map(prod => (
                          <CommandItem
                            key={prod.product_id}
                            onSelect={() => {
                              setProductId(prod.product_id);
                              setProductOpen(false);
                            }}
                            className="cursor-pointer pl-8"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                product_id === prod.product_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {prod.product_name}
                          </CommandItem>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {loadingProducts 
                          ? "Loading products..." 
                          : report.length > 0 
                            ? "No matching products found in report"
                            : "Load report first to see products"}
                      </div>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Inputs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">From:</span>
              <Input
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto"
                max={end_date || undefined}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">To:</span>
              <Input
                type="date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto"
                min={start_date || undefined}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button 
              onClick={loadReport} 
              disabled={loading || !start_date || !end_date || loadingProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Loading...
                </>
              ) : (
                "Load Report"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handlePrint}
              disabled={report.length === 0 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 h-4 w-4 text-white" />
              Print
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {report.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Total Sold Quantity</p>
              <p className="text-2xl font-bold text-purple-700">{formatNumber(totalSoldQty)}</p>
            </div> */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Profit</p>
              <p className="text-2xl font-bold text-green-700">{formatNumber(totalProfit)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Total Loss</p>
              <p className="text-2xl font-bold text-red-700">{formatNumber(totalLoss)}</p>
            </div>
            {/* <div className={`${netProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'} p-4 rounded-lg`}>
              <p className={`text-sm ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-medium`}>
                Net {netProfit >= 0 ? 'Profit' : 'Loss'}
              </p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatNumber(Math.abs(netProfit))}
              </p>
            </div> */}
          </div>
        )}

        {/* Report Table - Showing ONLY API Data */}
        <div ref={printRef}>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[250px]">Product Name</TableHead>
                  <TableHead className="text-right">Purchase Amount</TableHead>
                  <TableHead className="text-right">Sale Amount</TableHead>
                  {/* <TableHead className="text-right">Sold Quantity</TableHead> */}
                  {/* <TableHead className="text-center">Status</TableHead> */}
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Loss</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {report.length > 0 ? (
                  report.map((r) => {
                    const profitNum = parseFloat(r.profit) || 0;
                    const lossNum = parseFloat(r.loss) || 0;
                    
                    return (
                      <TableRow key={r.product_id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{r.product_name}</TableCell>
                        <TableCell className="text-right">{formatNumber(r.total_purchase)}</TableCell>
                        <TableCell className="text-right">{formatNumber(r.total_sale)}</TableCell>
                        {/* <TableCell className="text-right">{formatNumber(r.sold_quantity)}</TableCell> */}
                        {/* <TableCell className="text-center">
                          {getStatusBadge(r.profit, r.loss)}
                        </TableCell> */}
                        <TableCell className="text-right text-green-600 font-semibold">
                          {formatNumber(r.profit)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">
                          {formatNumber(r.loss)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Loading report...
                        </div>
                      ) : start_date && end_date ? (
                        "No data found for selected date range"
                      ) : (
                        "Select date range and click Load Report"
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer with record count */}
        {report.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Total {report.length} product(s) found
          </div>  
        )}
      </CardContent>
    </Card>
  );
};

export default ItemProfitLoss;