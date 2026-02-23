import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getChicksLedger } from "@/api/ChicksLedgerApi";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface VehicleLedgerEntry {
  entry_date: string;
  vehicle_no: string;
  vehicle_name: string;
  weight: string;
  freight: string;
  discount_amount: string;
  remarks: string;
  model_sequence: number;
  purchase_amount: string;
  sale_amount: string;
  profit: string;
  loss: string;
  rate: string;
  purchase_rate: number;
  sale_rate: number;
  purchase_weight: number;
  sale_weight: number;
}

const Birdsvehicle: React.FC = () => {
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [ledgerData, setLedgerData] = useState<VehicleLedgerEntry[]>([]);
  const [filteredData, setFilteredData] = useState<VehicleLedgerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnTotals, setColumnTotals] = useState({
    totalPurchaseWeight: 0,
    totalSaleWeight: 0,
    totalPurchaseAmount: 0,
    totalSaleAmount: 0,
    totalProfit: 0,
    totalLoss: 0
  });
  const [summary, setSummary] = useState({
    totalPurchase: 0,
    totalSale: 0,
    totalFreight: 0,
    totalDiscount: 0,
    totalWeight: 0,
    profit: 0,
    loss: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(ledgerData);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = ledgerData.filter(entry => 
      entry.vehicle_name?.toLowerCase().includes(query) || 
      entry.vehicle_no?.toLowerCase().includes(query) ||
      entry.remarks?.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  }, [searchQuery, ledgerData]);

  // Calculate column totals and summary for filtered data
  useEffect(() => {
    let totalPurchaseWeight = 0;
    let totalSaleWeight = 0;
    let totalPurchaseAmount = 0;
    let totalSaleAmount = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let totalPurchase = 0;
    let totalSale = 0;
    let totalFreight = 0;
    let totalDiscount = 0;
    let totalWeight = 0;

    filteredData.forEach(entry => {
      const purchaseWeight = parseFloat(entry.purchase_weight?.toString()) || 0;
      const saleWeight = parseFloat(entry.sale_weight?.toString()) || 0;
      const purchaseAmount = parseFloat(entry.purchase_amount) || 0;
      const saleAmount = parseFloat(entry.sale_amount) || 0;
      const profit = parseFloat(entry.profit) || 0;
      const loss = parseFloat(entry.loss) || 0;
      
      totalPurchaseWeight += purchaseWeight;
      totalSaleWeight += saleWeight;
      totalPurchaseAmount += purchaseAmount;
      totalSaleAmount += saleAmount;
      totalProfit += profit;
      totalLoss += loss;
      
      totalPurchase += purchaseAmount;
      totalSale += saleAmount;
      totalFreight += parseFloat(entry.freight) || 0;
      totalDiscount += parseFloat(entry.discount_amount) || 0;
      totalWeight += parseFloat(entry.weight) || 0;
    });

    const netProfit = totalSale > totalPurchase ? totalSale - totalPurchase : 0;
    const netLoss = totalPurchase > totalSale ? totalPurchase - totalSale : 0;

    setColumnTotals({
      totalPurchaseWeight,
      totalSaleWeight,
      totalPurchaseAmount,
      totalSaleAmount,
      totalProfit,
      totalLoss
    });

    setSummary({
      totalPurchase,
      totalSale,
      totalFreight,
      totalDiscount,
      totalWeight,
      profit: netProfit,
      loss: netLoss
    });
  }, [filteredData]);

  const loadReport = async () => {
    if (!start_date || !end_date) {
      setError("Please select start and end dates");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchQuery(""); // Reset search on new load

    try {
      const data = await getChicksLedger(start_date, end_date);
      
      if (data && Array.isArray(data)) {
        setLedgerData(data);
        setFilteredData(data);
      } else {
        setLedgerData([]);
        setFilteredData([]);
        setError("No data found for the selected period");
      }
    } catch (error) {
      console.error("Error loading vehicle ledger", error);
      setError("Failed to load ledger data. Please try again.");
      setLedgerData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(formatDateForInput(firstDay));
    setEndDate(formatDateForInput(lastDay));
  }, []);

  // Helper to format date for input field
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formatting helper
  const formatNumber = (num: number | string): string => {
    if (num === null || num === undefined || num === '') return '0.00';
    
    const numberValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numberValue)) return '0.00';
    
    return numberValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  } catch (error) {
    return dateString;
  }
};


  const handlePrint = () => {
    if (!printRef.current || filteredData.length === 0) {
      setError("No data to print");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=700");
    printWindow!.document.write(`
      <html>
        <head>
          <title>Vehicle Ledger Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total-row { background-color: #f8f9fa; font-weight: bold; border-top: 2px solid #333; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
            .summary-card { padding: 15px; border-radius: 8px; }
            .purchase-card { background-color: #eff6ff; border-left: 4px solid #3b82f6; }
            .sale-card { background-color: #f0fdf4; border-left: 4px solid #10b981; }
            .profit-card { background-color: #fef3c7; border-left: 4px solid #f59e0b; }
            .card-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
            .card-value { font-size: 24px; font-weight: bold; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .summary-item { padding: 10px; }
            .profit { color: green; font-weight: bold; }
            .loss { color: red; font-weight: bold; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-header h2 { margin-bottom: 10px; }
            .report-info { margin-bottom: 20px; }
            .no-data { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h2>Vehicle Ledger Report</h2>
            <div class="report-info">
              <p><strong>Period:</strong> ${start_date} to ${end_date}</p>
              <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Records:</strong> ${filteredData.length}</p>
            </div>
          </div>
          
          <!-- Summary Cards for Print -->
          <div class="summary-cards">
            <div class="summary-card purchase-card">
              <div class="card-title">Total Purchase Amount</div>
              <div class="card-value text-blue-600">${formatNumber(columnTotals.totalPurchaseAmount)}</div>
            </div>
            <div class="summary-card sale-card">
              <div class="card-title">Total Sale Amount</div>
              <div class="card-value text-green-600">${formatNumber(columnTotals.totalSaleAmount)}</div>
            </div>
            <div class="summary-card profit-card">
              <div class="card-title">Total Profit</div>
              <div class="card-value text-amber-600">${formatNumber(columnTotals.totalProfit)}</div>
            </div>
          </div>
          
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow!.document.close();
    setTimeout(() => printWindow!.print(), 500);
  };

  // Clear all selections
  const handleClear = () => {
    setLedgerData([]);
    setFilteredData([]);
    setSearchQuery("");
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chicks Ledger Report</CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            {/* Date Inputs */}
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={start_date}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={end_date}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={loadReport} 
                disabled={loading || !start_date || !end_date}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Loading...
                  </>
                ) : "Load Report"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={loading || ledgerData.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Search Bar (only shown when data is loaded) */}
          {ledgerData.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by vehicle name, number, or remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {filteredData.length} of {ledgerData.length} records
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3 Summary Cards at the Top */}
        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Purchase Amount Card */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Purchase Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(columnTotals.totalPurchaseAmount)}
                </div>
              </CardContent>
            </Card>

            {/* Total Sale Amount Card */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Sale Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(columnTotals.totalSaleAmount)}
                </div>
              </CardContent>
            </Card>

            {/* Total Profit Card */}
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {formatNumber(columnTotals.totalProfit)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Ledger Table */}
        <div ref={printRef}>
          {filteredData.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Birds Vehicle Ledger Details</h3>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Vehicle No</TableHead>
                      <TableHead className="font-semibold">Purchase Weight</TableHead>
                      <TableHead className="font-semibold">Sale Weight</TableHead>
                      <TableHead className="font-semibold">Purchase Rate</TableHead>
                      <TableHead className="font-semibold">Sale Rate</TableHead>
                      <TableHead className="font-semibold">Purchase Amount</TableHead>
                      <TableHead className="font-semibold">Sale Amount</TableHead>
                      <TableHead className="font-semibold">Loss</TableHead>
                      <TableHead className="font-semibold">Profit</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredData.map((entry, index) => (
                      <TableRow key={`${entry.model_sequence}-${index}`} className="hover:bg-gray-50">
                        <TableCell>{formatDate(entry.entry_date)}</TableCell>
                        <TableCell className="font-medium">{entry.vehicle_no}</TableCell>
                        <TableCell>{formatNumber(entry.purchase_weight)}</TableCell>
                        <TableCell>{formatNumber(entry.sale_weight)}</TableCell>
                        <TableCell>{formatNumber(entry.purchase_rate)}</TableCell>
                        <TableCell>{formatNumber(entry.sale_rate)}</TableCell>
                        <TableCell className={parseFloat(entry.purchase_amount) > 0 ? "text-blue-600" : ""}>
                          {formatNumber(entry.purchase_amount)}
                        </TableCell>
                        <TableCell className={parseFloat(entry.sale_amount) > 0 ? "text-green-600" : ""}>
                          {formatNumber(entry.sale_amount)}
                        </TableCell>
                        <TableCell className={parseFloat(entry.loss) > 0 ? "text-red-600 font-medium" : ""}>
                          {parseFloat(entry.loss) > 0 ? `${formatNumber(entry.loss)}` : "—"}
                        </TableCell>
                        <TableCell className={parseFloat(entry.profit) > 0 ? "text-green-600 font-medium" : ""}>
                          {parseFloat(entry.profit) > 0 ? `${formatNumber(entry.profit)}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Total Row */}
                    <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                      <TableCell colSpan={2} className="text-right">
                        <span className="pr-4">Total:</span>
                      </TableCell>
                      <TableCell className="text-blue-700">
                        {formatNumber(columnTotals.totalPurchaseWeight)}
                      </TableCell>
                      <TableCell className="text-green-700">
                        {formatNumber(columnTotals.totalSaleWeight)}
                      </TableCell>
                      <TableCell colSpan={2} className="text-center">
                        —
                      </TableCell>
                      <TableCell className="text-blue-700">
                        {formatNumber(columnTotals.totalPurchaseAmount)}
                      </TableCell>
                      <TableCell className="text-green-700">
                        {formatNumber(columnTotals.totalSaleAmount)}
                      </TableCell>
                      <TableCell className="text-red-700">
                        {formatNumber(columnTotals.totalLoss)}
                      </TableCell>
                      <TableCell className="text-green-700">
                        {formatNumber(columnTotals.totalProfit)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Summary Cards (Original 4 cards at bottom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Purchase Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(columnTotals.totalPurchaseWeight)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Sale Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(columnTotals.totalSaleWeight)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Loss</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatNumber(columnTotals.totalLoss)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${summary.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.profit > 0 ? `${formatNumber(summary.profit)}` : 
                       summary.loss > 0 ? `${formatNumber(summary.loss)}` : '0.00'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : ledgerData.length > 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <div className="text-gray-400 mb-2">No matching records found</div>
              <div className="text-sm text-gray-500">
                Try searching with different terms or clear the search
              </div>
            </div>
          ) : !loading && (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <div className="text-gray-400 mb-2">No data available</div>
              <div className="text-sm text-gray-500">
                Select date range and click "Load Report" to view ledger
              </div>
            </div>
          )}
        </div>

        {/* Print Button (only shown when data exists) */}
        {filteredData.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button 
              variant="secondary" 
              onClick={handlePrint}
              disabled={loading}
            >
              Print Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Birdsvehicle;