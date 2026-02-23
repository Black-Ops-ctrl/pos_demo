import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVehicleLedger } from "@/api/VehicleprofitlossresportAPi";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const VehicleProfitLossReport: React.FC = () => {
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [ledgerData, setLedgerData] = useState<VehicleLedgerEntry[]>([]);
  const [filteredData, setFilteredData] = useState<VehicleLedgerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Calculate summary for filtered data
  useEffect(() => {
    let totalPurchase = 0;
    let totalSale = 0;
    let totalFreight = 0;
    let totalDiscount = 0;
    let totalWeight = 0;

    filteredData.forEach(entry => {
      totalPurchase += parseFloat(entry.purchase_amount) || 0;
      totalSale += parseFloat(entry.sale_amount) || 0;
      totalFreight += parseFloat(entry.freight) || 0;
      totalDiscount += parseFloat(entry.discount_amount) || 0;
      totalWeight += parseFloat(entry.weight) || 0;
    });

    const profit = totalSale > totalPurchase ? totalSale - totalPurchase : 0;
    const loss = totalPurchase > totalSale ? totalPurchase - totalSale : 0;

    setSummary({
      totalPurchase,
      totalSale,
      totalFreight,
      totalDiscount,
      totalWeight,
      profit,
      loss
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
      const data = await getVehicleLedger(start_date, end_date);
      
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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
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

  // Get unique vehicle count
  const uniqueVehicles = Array.from(new Set(filteredData.map(item => item.vehicle_no)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Ledger Report</CardTitle>
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

        {/* Detailed Ledger Table */}
        <div ref={printRef}>
          {filteredData.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Vehicle Ledger Details</h3>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Vehicle No</TableHead>
                      {/* <TableHead className="font-semibold">Vehicle Name</TableHead> */}
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
                        {/* <TableCell>
                          {entry.vehicle_name || (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell> */}
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
                  </TableBody>
                </Table>
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

export default VehicleProfitLossReport;