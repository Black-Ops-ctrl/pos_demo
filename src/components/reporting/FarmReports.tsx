import React, { useEffect, useState, useRef } from "react";
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
import { Package, ChevronsUpDown, Check, Search, Printer, Scale, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlockByBranch } from "@/api/flockApi";
import { getBranches } from "@/api/branchApi";
import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';

interface FormLedgerData {
  rate: any;
  branch_id: number;
  branch_name: string;
  flock_id: number;
  flock_name: string;
  item_name: string;
  category: string;
  entry_date: string;
  remarks: string;
  tran_no: string;
  medicine: number;
  feed: number;
  chicks: number;
  weight: number;
  discount_amount: number;
  line_description: string;
  journal_description: string;
  debit: string;
  credit: string;
  running_balance: string;
}

interface FormLedgerCategoryData {
  branch_id: number;
  branch_name: string;
  flock_id: number;
  flock_name: string;
  category: string;
  medicine: string;
  feed: string;
  chicks: string;
  weight: string;
  discount_amount: string;
  total_debit: string;
  total_credit: string;
  running_balance: string;
}

interface FormLedgerSummaryData {
  branch_name: string;
  flock_name: string;
  weight_avg: string;
  unit_cost: string;
}

interface FormData {
  branch_id: number;
  flock_id: number;
}

const FarmReports = () => {
  const [flock_id, setFlockId] = useState<number>(0);
  const [flocks, setFlock] = useState<any[]>([]);
  const [flockOpen, setFlockOpen] = useState(false);

  const [branch_id, setBranchId] = useState<number>(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchOpen, setBranchOpen] = useState(false);

  const [formLedgerData, setFormLedgerData] = useState<FormLedgerData[]>([]);
  const [formLedgerCategoryData, setFormLedgerCategoryData] = useState<FormLedgerCategoryData[]>([]);
  const [formLedgerSummary, setFormLedgerSummary] = useState<FormLedgerSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string>("");
  const [summaryError, setSummaryError] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch form ledger data
  const fetchFormLedgerData = async (branchId: number, flockId: number) => {
    if (!branchId || !flockId) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://84.16.235.111:2091/api/form-ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_id: branchId,
          flock_id: flockId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFormLedgerData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch form ledger data:", err);
      setError("Failed to load form ledger data");
      setFormLedgerData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch form ledger category-wise data
  const fetchFormLedgerCategoryData = async (branchId: number, flockId: number) => {
    if (!branchId || !flockId) return;
    
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const response = await fetch("http://84.16.235.111:2091/api/form-ledger-category-wise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_id: branchId,
          flock_id: flockId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFormLedgerCategoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch form ledger category data:", err);
      setCategoryError("Failed to load category-wise data");
      setFormLedgerCategoryData([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Fetch form ledger summary data
  const fetchFormLedgerSummary = async (branchId: number, flockId: number) => {
    if (!branchId || !flockId) return;
    
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const response = await fetch("http://84.16.235.111:2091/api/form-ledger-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_id: branchId,
          flock_id: flockId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // If data is array, take first item, otherwise set directly
      setFormLedgerSummary(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error("Failed to fetch form ledger summary:", err);
      setSummaryError("Failed to load summary data");
      setFormLedgerSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch all three datasets when branch and flock are selected
  const fetchAllData = async (branchId: number, flockId: number) => {
    await Promise.all([
      fetchFormLedgerData(branchId, flockId),
      fetchFormLedgerCategoryData(branchId, flockId),
      fetchFormLedgerSummary(branchId, flockId)
    ]);
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null || value === 0) return '-';
    return value.toLocaleString('en-IN');
  };

  const formatCategoryValue = (value: string) => {
    if (value === '0' || value === '0.00' || value === '0.000') return '-';
    return value;
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentBranch = branches.find(br => br.branch_id === branch_id);
    const currentFlock = flocks.find(fl => fl.flock_id === flock_id);

    // Define the dark grey color
    const headerBgColor = '#8f8f8fff'; // Dark grey

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Farm Reports - ${currentBranch?.branch_name || 'Farm'} - ${currentFlock?.flock_name || 'Flock'}</title>
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
            
            .branch-flock-info {
              margin-top: 5px;
              margin-bottom: 20px;
              padding: 12px;
              background: #f8fafc;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              display: flex;
              justify-content: center;
              gap: 100px;
              font-size: 14px;
              font-weight: 500;
            }
            
            .branch-info, .flock-info {
              color: #4b5563;
            }
            
            .info-label {
              font-weight: 600;
              color: #111827;
              margin-right: 8px;
            }
            
            .summary-cards {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .summary-card {
              flex: 1;
              padding: 16px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              text-align: center;
            }
            
            .summary-card-title {
              font-size: 14px;
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            
            .summary-card-value {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
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
            
            .category-badge {
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 700;
              display: inline-block;
            }
            
            .category-medicine {
              background: #1e40af;
              color: white;
            }
            
            .category-feed {
              background: #166534;
              color: white;
            }
            
            .category-chicks {
              background: #7c2d12;
              color: white;
            }
            
            .category-live-birds {
              background: #7e22ce;
              color: white;
            }
            
            .category-other {
              background: #374151;
              color: white;
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

            .category-summary {
              margin-top: 30px;
              margin-bottom: 20px;
            }

            .category-summary h3 {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 15px;
              color: #111827;
              text-align: center;
            }

            .category-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              border: 2px solid #000000;
            }

            /* CHANGE: Updated to use dark grey background */
            .category-table th {
              background: ${headerBgColor} !important;
              padding: 12px 8px;
              text-align: left;
              font-weight: 700;
              color: white !important; /* Keep text white for contrast */
              border-bottom: 2px solid #000000;
              border-right: 1px solid #333333;
              font-size: 11px;
            }

            .category-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #000000;
              border-right: 1px solid #000000;
              color: #111827;
              font-weight: 500;
            }

            .category-table tr:nth-child(even) {
              background: #f9fafb;
            }

            /* NEW: Added bolder font for medicine, feed, chicks, live birds in print */
            .bold-numeric {
              font-family: 'Courier New', monospace;
              font-weight: 700 !important;
              font-size: 11px;
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
              
              .summary-cards {
                gap: 15px;
              }
              
              .summary-card {
                padding: 12px;
              }
              
              .summary-card-value {
                font-size: 20px;
              }
              
              .print-table, .category-table {
                font-size: 10px;
                border: 2px solid #000000 !important;
              }
              
              /* CHANGE: Updated to use dark grey background and force exact printing */
              .print-table th, .category-table th {
                background: ${headerBgColor} !important; 
                color: white !important;
                border-bottom: 2px solid #000000 !important;
                border-right: 1px solid #333333 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-table td, .category-table td {
                padding: 8px 6px;
                border-bottom: 1px solid #000000 !important;
                border-right: 1px solid #000000 !important;
              }
              
              .print-table th:last-child, .category-table th:last-child {
                border-right: none !important;
              }
              
              .print-table td:last-child, .category-table td:last-child {
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
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <div class="logo-section">
              </div>
              <div class="company-info">
                <div class="company-name">Yasin Poultry Farm & Broker</div>
                <div class="report-title">Farm Reports</div>
              </div>
              <div class="header-spacer"></div>
            </div>

            <div class="branch-flock-info">
              ${currentBranch ? `<div class="branch-info"><span class="info-label">Farm:</span>${currentBranch.branch_name}</div>` : ''}
              ${currentFlock ? `<div class="flock-info"><span class="info-label">Flock:</span>${currentFlock.flock_name}</div>` : ''}
            </div>

            ${formLedgerSummary ? `
              <div class="summary-cards">
                <div class="summary-card">
                  <div class="summary-card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 3v18M3 12h18" />
                    </svg>
                    Average Weight
                  </div>
                  <div class="summary-card-value">${formLedgerSummary.weight_avg === "0" ? "-" : formLedgerSummary.weight_avg}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Unit Cost
                  </div>
                  <div class="summary-card-value">${formLedgerSummary.unit_cost === "0" ? "-" : formLedgerSummary.unit_cost}</div>
                </div>
              </div>
            ` : ''}

            <table class="print-table">
              <thead>
                <tr>
                  <th>Entry Date</th>
                  <th>Category</th>
                  <th>Item Name</th>
                  <th>Narration</th>
                  <th>Medicine</th>
                  <th>Feed</th>
                  <th>Chicks</th>
                  <th>Weight</th>
                  <th>Discount</th>
                  <th>Rate</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                ${formLedgerData.length > 0 
                  ? formLedgerData.map((item, index) => `
                    <tr>
                      <td>${new Date(item.entry_date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span class="category-badge ${
                          item.category === 'MEDICINE' ? 'category-medicine' :
                          item.category === 'FEED' ? 'category-feed' :
                          item.category === 'CHICKS' ? 'category-chicks' :
                          item.category === 'WEIGHT' ? 'category-live-birds' : 'category-other'
                        }">
                          ${item.category || 'VOUCHER'}
                        </span>
                      </td>
                      <td>${item.item_name || '-'}</td>
                      <td>${item.remarks || '-'}</td>
<td class="text-center bold-numeric">
  ${item.medicine === 0 ? '-' : formatNumber(item.medicine)}
</td>
<td class="text-center bold-numeric">
  ${item.feed === 0 ? '-' : formatNumber(item.feed)}
</td>
<td class="text-center bold-numeric">
  ${item.chicks === 0 ? '-' : formatNumber(item.chicks)}
</td>
<td class="text-center bold-numeric">
  ${item.weight === 0 ? '-' : formatNumber(item.weight)}
</td>
<td class="text-center bold-numeric">
  ${item.discount_amount === 0 ? '-' : formatNumber(item.discount_amount)}
</td>
<td class="font-medium">
  ${item.rate === 0 ? '-' : item.rate}
</td>
<td class="text-right numeric-value bold-data">
  <strong>${item.debit === 0 ? '-' : item.debit}</strong>
</td>
<td class="text-right numeric-value bold-data">
  <strong>${item.credit === 0 ? '-' : item.credit}</strong>
</td>
<td class="text-right numeric-value bold-data">
  <strong>${item.running_balance === 0 ? '-' : item.running_balance}</strong>
</td>
                    </tr>
                  `).join('')
                  : `
                    <tr>
                      <td colspan="14" class="no-data">
                        No form ledger records found for the selected farm and flock.
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            ${formLedgerCategoryData.length > 0 ? `
              <div class="category-summary">
                <h3>Category-wise Summary</h3>
                <table class="category-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Medicine</th>
                      <th>Feed</th>
                      <th>Chicks</th>
                      <th>Weight</th>
                      <th>Total Debit</th>
                      <th>Total Credit</th>
                      <th>Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${formLedgerCategoryData.map((item, index) => `
                      <tr>
                        <td>
                          <span class="category-badge ${
                            item.category === 'MEDICINE' ? 'category-medicine' :
                            item.category === 'FEED' ? 'category-feed' :
                            item.category === 'CHICKS' ? 'category-chicks' :
                            item.category === 'weight' ? 'category-live-birds' : 'category-other'
                          }">
                            ${item.category || 'OTHER'}
                          </span>
                        </td>
                        <td class="text-center bold-numeric">${formatCategoryValue(item.medicine)}</td>
                        <td class="text-center bold-numeric">${formatCategoryValue(item.feed)}</td>
                        <td class="text-center bold-numeric">${formatCategoryValue(item.chicks)}</td>
                        <td class="text-center bold-numeric">${formatCategoryValue(item.weight)}</td>
                        <td class="text-right numeric-value bold-data"><strong>${item.total_debit}</strong></td>
                        <td class="text-right numeric-value bold-data"><strong>${item.total_credit}</strong></td>
                        <td class="text-right numeric-value bold-data"><strong>${item.running_balance}</strong></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="print-footer">
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
    // ✅ Load farm list on mount
    const loadBranches = async () => {
      try {
        const branchData = await getBranches();
        const normalized = Array.isArray(branchData?.data)
          ? branchData.data
          : branchData;
        setBranches(normalized || []);
      } catch (err) {
        console.error("Failed to load farms:", err);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    // ✅ Load flocks when farm changes
    if (!branch_id) {
      setFlock([]);
      setFlockId(0);
      return;
    }

    const loadFlocks = async () => {
      try {
        const flockData = await getFlockByBranch(branch_id);
        const normalized = Array.isArray(flockData?.data)
          ? flockData.data
          : flockData;
        setFlock(normalized || []);
        setFlockId(0); // Reset flock selection when farm changes
        setFormLedgerData([]); // Clear previous data
        setFormLedgerCategoryData([]); // Clear previous category data
        setFormLedgerSummary(null); // Clear previous summary data
      } catch (err) {
        console.error("Failed to load flocks for farm:", err);
        setFlock([]);
        setFlockId(0);
      }
    };

    loadFlocks();
  }, [branch_id]);

  useEffect(() => {
    // ✅ Fetch form ledger data when both farm and flock are selected
    if (branch_id && flock_id) {
      fetchAllData(branch_id, flock_id);
    }
  }, [branch_id, flock_id]);

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


  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MEDICINE':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'FEED':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'CHICKS':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'WEIGHT':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Farm Reports
            </CardTitle>
            
            {/* Print Button */}
            <Button
              onClick={handlePrint}
              disabled={!formLedgerData.length || loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ✅ Farm Selector */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2">Farm</span>
              <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox" 
                    className="w-full justify-between"
                  >
                    {branch_id
                      ? branches.find((br: any) => br.branch_id === branch_id)
                          ?.branch_name
                      : "Select Farm"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search farms..."
                      className="h-9"
                    />
                    <CommandEmpty>No farm found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {branches.map((br: any) => (
                        <CommandItem
                          key={br.branch_id}
                          value={br.branch_name}
                          onSelect={() => {
                            setBranchId(br.branch_id);
                            setBranchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              branch_id === br.branch_id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {br.branch_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* ✅ Flock Selector */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2">Flock</span>
              <Popover open={flockOpen} onOpenChange={setFlockOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    role="combobox" 
                    className="w-full justify-between"
                    disabled={!branch_id || flocks.length === 0}
                  >
                    {flock_id
                      ? flocks.find((fl: any) => fl.flock_id === flock_id)
                          ?.flock_name
                      : "Select Flock"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search flocks..."
                      className="h-9"
                    />
                    <CommandEmpty>No flock found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {flocks.map((fl: any) => (
                        <CommandItem
                          key={fl.flock_id}
                          value={fl.flock_name}
                          onSelect={() => {
                            setFlockId(fl.flock_id);
                            setFlockOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              flock_id === fl.flock_id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {fl.flock_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>

        {/* Summary Cards Section */}
        {formLedgerSummary && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Average Weight Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-2">Average Weight</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {formLedgerSummary.weight_avg === "0" ? "-" : formLedgerSummary.weight_avg}
                      </h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Scale className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unit Cost Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-2">Unit Cost</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {formLedgerSummary.unit_cost === "0" ? "-" : formLedgerSummary.unit_cost}
                      </h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}

        {/* ✅ Table Section */}
        <CardContent>
          {loading && (
            <div className="text-center py-4">Loading form ledger data...</div>
          )}
          
          {error && (
            <div className="text-center py-4 text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div ref={printRef} className="space-y-8">
              {/* Summary Cards for Print View */}
              {formLedgerSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print-summary-cards">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600 mb-2">Average Weight</p>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {formLedgerSummary.weight_avg === "0" ? "-" : formLedgerSummary.weight_avg}
                          </h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Scale className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-2">Unit Cost</p>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {formLedgerSummary.unit_cost === "0" ? "-" : formLedgerSummary.unit_cost}
                          </h3>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main Form Ledger Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black hover:bg-black">
                      <TableHead className="font-bold text-white bg-black">Entry Date</TableHead>
                      <TableHead className="font-bold text-white bg-black">Category</TableHead>
                      <TableHead className="font-bold text-white bg-black">Item Name</TableHead>
                      <TableHead className="font-bold text-white bg-black">Line Description</TableHead>
                      <TableHead className="font-bold text-white bg-black text-center">Medicine</TableHead>
                      <TableHead className="font-bold text-white bg-black text-center">Feed</TableHead>
                      <TableHead className="font-bold text-white bg-black text-center">Chicks</TableHead>
                      <TableHead className="font-bold text-white bg-black text-center">Weight</TableHead>
                      <TableHead className="font-bold text-white bg-black text-center">Discount</TableHead>
                      <TableHead className="font-bold text-white bg-black">Rate</TableHead>
                      <TableHead className="font-bold text-white bg-black text-right">Debit</TableHead>
                      <TableHead className="font-bold text-white bg-black text-right">Credit</TableHead>
                      <TableHead className="font-bold text-white bg-black text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formLedgerData.length > 0 ? (
                      formLedgerData.map((item, index) => (
                        <TableRow key={`${item.tran_no}-${index}`}>
                         <TableCell className="whitespace-nowrap">
                          {formatDate(item.entry_date)}
                        </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          </TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell className="max-w-xs truncate" 
                          title={item.remarks}>
                            {item.remarks}
                          </TableCell>
<TableCell className="text-center font-mono font-bold">
  {item.medicine == 0 ? "-" : formatNumber(item.medicine)}
</TableCell>

<TableCell className="text-center font-mono font-bold">
  {item.feed == 0 ? "-" : formatNumber(item.feed)}
</TableCell>

<TableCell className="text-center font-mono font-bold">
  {item.chicks == 0 ? "-" : formatNumber(item.chicks)}
</TableCell>

<TableCell className="text-center font-mono font-bold">
  {item.weight == 0 ? "-" : formatNumber(item.weight)}
</TableCell>

<TableCell className="text-center font-mono font-bold">
  {item.discount_amount == 0 ? "-" : formatNumber(item.discount_amount)}
</TableCell>

<TableCell className="text-right font-mono font-medium">
  {item.rate == 0 ? "-" : item.rate}
</TableCell>
<TableCell className="text-right font-mono font-medium">
  {item.debit === "0" ? "-" : item.debit}
</TableCell>
<TableCell className="text-right font-mono font-medium">
  {item.credit === "0" ? "-" : item.credit}
</TableCell>
<TableCell className="text-right font-bold font-mono">
  {item.running_balance === "0" ? "-" : item.running_balance}
</TableCell>

                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={16} className="text-center text-gray-500 py-8">
                          {branch_id && flock_id 
                            ? "No form ledger records found for the selected farm and flock." 
                            : "Please select a farm and flock to view form ledger data."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Category-wise Summary Table */}
              {formLedgerCategoryData.length > 0 && (
                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        Category-wise Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryLoading && (
                        <div className="text-center py-4">Loading category summary...</div>
                      )}
                      
                      {categoryError && (
                        <div className="text-center py-4 text-red-500">{categoryError}</div>
                      )}

                      {!categoryLoading && !categoryError && (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-900 hover:bg-gray-900">
                              <TableHead className="font-bold text-white bg-gray-900">Farm</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900">Flock</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900">Category</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-center">Medicine</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-center">Feed</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-center">Chicks</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-center">Weight</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-right">Total Debit</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-right">Total Credit</TableHead>
                              <TableHead className="font-bold text-white bg-gray-900 text-right">Running Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formLedgerCategoryData.map((item, index) => (
                              <TableRow key={`${item.category}-${index}`}>
                                <TableCell>
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCategoryColor(item.category)}`}>
                                    {item.branch_name}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCategoryColor(item.category)}`}>
                                    {item.flock_name}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCategoryColor(item.category)}`}>
                                    {item.category}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center font-mono font-bold">
                                  {formatCategoryValue(item.medicine)}
                                </TableCell>
                                <TableCell className="text-center font-mono font-bold">
                                  {formatCategoryValue(item.feed)}
                                </TableCell>
                                <TableCell className="text-center font-mono font-bold">
                                  {formatCategoryValue(item.chicks)}
                                </TableCell>
                                <TableCell className="text-center font-mono font-bold">
                                  {formatCategoryValue(item.weight)}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-red-600">
                                  {item.total_debit}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-green-600">
                                  {item.total_credit}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-blue-600">
                                  {item.running_balance}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmReports;