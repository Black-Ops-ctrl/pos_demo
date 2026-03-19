import React, { useEffect, useState, useRef ,useCallback} from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader, 
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Package, ChevronsUpDown, Check, Search, Printer, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';

interface StockItem {
  item_id: string;
  item_name: string;
  uom_id: number;
  stock_quantity: string;
  uom_name: string;
}

const FarmReports = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [filteredStockData, setFilteredStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
    const [showScrollToTop, setShowScrollToTop] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch stock data
  const fetchStockData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://84.16.235.111:2140/api/item-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const safeData = Array.isArray(data) ? data : [];
      setStockData(safeData);
      setFilteredStockData(safeData);
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
      setError("Failed to load stock data");
      setStockData([]);
      setFilteredStockData([]);
    } finally {
      setLoading(false);
    }
  };

// Filter function to search ONLY by Item Name
const filterStockData = (data: StockItem[], term: string) => {
  if (!term.trim()) {
    return data;
  }

  const lowercasedTerm = term.toLowerCase();
  
  return data.filter(item => {
    // Safely get item_name
    const itemName = item?.item_name?.toLowerCase() || '';
    
    // Search ONLY in item_name
    return itemName.includes(lowercasedTerm);
  });
};

  // Filter stock data based on search term
  useEffect(() => {
    const filtered = filterStockData(stockData, searchTerm);
    setFilteredStockData(filtered);
  }, [searchTerm, stockData]);

  const formatNumber = (value: string) => {
    if (!value) return '-';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';
    if (numValue === 0) return '-';
    
    return numValue.toLocaleString('en-IN', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });
  };

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
  // Function to determine stock quantity color
  const getStockQuantityColor = (quantity: string) => {
    if (!quantity) return 'text-gray-500';
    
    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity)) return 'text-gray-500';
    
    return numQuantity < 10 ? 'text-red-600 font-bold' : 'text-green-600 font-bold';
  };

  // Function to determine stock quantity color for print
  const getStockQuantityColorForPrint = (quantity: string) => {
    if (!quantity) return 'color: #6b7280;';
    
    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity)) return 'color: #6b7280;';
    
    return numQuantity < 10 ? 'color: #dc2626; font-weight: 700;' : 'color: #16a34a; font-weight: 700;';
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML; 

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Define the dark grey color
    const headerBgColor = '#8f8f8fff'; // Dark grey

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock Reports - Ahmad Poultry</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              background: white;
              color: #111827;
              line-height: 1.5;
              padding: 10px;
              font-size: 14px;
            }
            
            .print-container {
              max-width: 100%;
              background: white;
              padding: 0px;
            }
            
            .print-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 10px;
              padding-bottom: 10px;
              padding-top: 5px;
              border-bottom: 2px solid #000000;
            }
            
            .logo-section {
              flex: 1;
            }

            .logo-placeholder {
              width: 80px;
              height: 80px;
              border: none;
              display: flex;
              align-items: center;
              justify-content: flex-start;
            }

            .logo-placeholder img {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            
            .company-info {
              flex: 2;
              text-align: center;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            }
            
            .report-title {
              font-size: 20px;
              font-weight: 600;
              color: #374151;
            }
            
            .header-spacer {
              flex: 1;
            }
            
            .search-info {
              margin-top: 5px;
              margin-bottom: 20px;
              padding: 12px;
              background: #f8fafc;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              text-align: center;
              font-size: 14px;
              font-weight: 500;
              color: #4b5563;
            }
            
            .search-term {
              font-weight: 600;
              color: #111827;
              margin-left: 8px;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              font-size: 12px;
              border: 2px solid #000000;
            }
            
            /* CHANGE: Updated to use dark grey background */
            .print-table th {
              background: ${headerBgColor} !important; 
              padding: 12px 8px;
              text-align: left;
              font-weight: 700;
              color: white !important; /* Keep text white for contrast */
              border-bottom: 2px solid #000000;
              border-right: 1px solid #333333;
              font-size: 11px;
            }
            
            .print-table th:last-child {
              border-right: none;
            }
            
            .print-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #000000;
              border-right: 1px solid #000000;
              color: #111827;
              font-weight: 500;
            }
            
            .print-table td:last-child {
              border-right: none;
            }
            
            .print-table tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .numeric-value {
              font-family: 'Courier New', monospace;
              font-weight: 600;
            }

            .bold-data strong {
                font-weight: 700;
            }
            
            .no-data {
              text-align: center;
              padding: 40px 20px;
              color: #6b7280;
              font-style: italic;
              background: #f9fafb;
            }
            
            .print-footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 2px solid #000000;
              text-align: center;
              color: #374151;
              font-size: 12px;
              font-weight: 500;
            }

            /* NEW: Added bolder font for stock quantity in print */
            .bold-numeric {
              font-family: 'Courier New', monospace;
              font-weight: 700 !important;
              font-size: 11px;
            }
            
            /* Stock quantity colors for print */
            .stock-low {
              color: #dc2626 !important;
              font-weight: 700 !important;
            }
            
            .stock-ok {
              color: #16a34a !important;
              font-weight: 700 !important;
            }
            
            /* Force dark styling for print */
            @media print {
              body {
                padding: 0;
                margin: 0;
                font-size: 12px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-container {
                padding: 5px;
              }
              
              .print-table {
                font-size: 10px;
                border: 2px solid #000000 !important;
              }
              
              /* CHANGE: Updated to use dark grey background and force exact printing */
              .print-table th {
                background: ${headerBgColor} !important; 
                color: white !important;
                border-bottom: 2px solid #000000 !important;
                border-right: 1px solid #333333 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-table td {
                padding: 8px 6px;
                border-bottom: 1px solid #000000 !important;
                border-right: 1px solid #000000 !important;
              }
              
              .print-table th:last-child {
                border-right: none !important;
              }
              
              .print-table td:last-child {
                border-right: none !important;
              }
              
              .company-name {
                font-size: 24px;
              }
              
              .report-title {
                font-size: 18px;
              }

              /* NEW: Ensure bold numeric values remain bold in print */
              .bold-numeric {
                font-weight: 700 !important;
                font-size: 10px;
              }
              
              /* Ensure colors print correctly */
              .stock-low, .stock-ok {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <div class="logo-section">
                <div class="logo-placeholder">
                  <img src="${AhmadPoultryLogo}" alt="Company Logo" />
                </div>
              </div>
              <div class="company-info">                                                                         
                <div class="company-name">Ahmad Poultry</div>
                <div class="report-title">Stock Reports</div>
              </div>
              <div class="header-spacer"></div>
            </div>

            ${searchTerm ? `
              <div class="search-info">
                Showing results for: <span class="search-term">"${searchTerm}"</span>
                (${filteredStockData.length} items found)
              </div>
            ` : ''}

            <table class="print-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>UOM ID</th>
                  <th>Stock Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStockData.length > 0 
                  ? filteredStockData.map((item) => {
                      const stockClass = parseFloat(item?.stock_quantity || '0') < 10 ? 'stock-low' : 'stock-ok';
                      const safeItemId = item?.item_id || 'N/A';
                      const safeItemName = item?.item_name || 'N/A';
                      const safeUomId = item?.uom_id || 'N/A';
                      const safeStockQuantity = item?.stock_quantity || '0';
                      
                      return `
                        <tr>
                          <td class="font-medium">${safeItemId}</td>
                          <td>${safeItemName}</td>
                          <td class="text-center">${safeUomId}</td>
                          <td class="text-right numeric-value bold-numeric ${stockClass}">${formatNumber(safeStockQuantity)}</td>
                        </tr>
                      `;
                    }).join('')
                  : `
                    <tr>
                      <td colspan="4" class="no-data">
                        ${searchTerm ? 'No stock items found matching your search.' : 'No stock items found.'}
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            <div class="print-footer">
              <div>Total Items: ${filteredStockData.length}</div>
              <div>Confidential - For Internal Use Only</div>
              <div>Page 1 of 1</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  useEffect(() => {
    // Fetch stock data on component mount
    fetchStockData();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Stock Reports
            </CardTitle>
            
            {/* Print Button */}
            <Button
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>

          {/* Search Input */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
<Input
  placeholder="Search by item name only..."
  value={searchTerm}
  onChange={handleSearchChange}
  className="pl-10 pr-4 py-2"
/>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button
                onClick={fetchStockData}
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Package className="h-4 w-4" />
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Showing {filteredStockData.length} of {stockData.length} items
                {searchTerm && ` for "${searchTerm}"`}
                {filteredStockData.length === 0 && " - No matches found"}
              </div>
            )}
          </div>
        </CardHeader>

        {/* ✅ Table Section */}
        <CardContent>
          {loading && (
            <div className="text-center py-4">Loading stock data...</div>
          )}
          
          {error && (
            <div className="text-center py-4 text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div ref={printRef} className="space-y-8">
              {/* Main Stock Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black hover:bg-black">
                      <TableHead className="font-bold text-white bg-black">Item ID</TableHead>
                      <TableHead className="font-bold text-white bg-black">Item Name</TableHead>
                      <TableHead className="font-bold text-white bg-black text-center">UOM Name</TableHead>
                      <TableHead className="font-bold text-white bg-black text-right">Stock Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockData.length > 0 ? (
                      filteredStockData.map((item) => {
                        const safeItemId = item?.item_id || 'N/A';
                        const safeItemName = item?.item_name || 'N/A';
                        const safeStockQuantity = item?.stock_quantity || '0';
                        const uomname = item?.uom_name || 'N/A';
                        
                        return (
                          <TableRow key={safeItemId} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{safeItemId}</TableCell>
                            <TableCell>{safeItemName}</TableCell>
                            <TableCell className="text-center">KG</TableCell>
                            <TableCell className={`text-right font-mono font-bold ${getStockQuantityColor(safeStockQuantity)}`}>
                              {formatNumber(safeStockQuantity)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          {searchTerm 
                            ? "No stock items found matching your search." 
                            : "No stock data available."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
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
    </div>
  );
};

export default FarmReports;