import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGRNDetails } from "@/api/grnApi"; // Adjust path if needed
import { Item } from "@radix-ui/react-select";
import { useNavigate } from "react-router-dom";

type GRNItem = {
    item_name: string;
  item_code: string;
  
  ordered_qty: number;
  received_qty: number;
  
  unit_price: number;
  total_price: number;
};

type GRNData = {
  grn_id: number;
  po_id: number;
  vendor_name: string;
  creation_date: string;
  remarks: string;
  items: GRNItem[];
};
const PrintStyles = () => (
  <style>{`
    @media print {
      .no-print { display: none !important; }
      html, body { background: #fff; margin: 0; padding: 0; }
    }
  `}</style>
);
const GRNDetail = () => {
  const { grn_id } = useParams<{ grn_id: string }>();
  const [data, setData] = useState<GRNData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const navigate = useNavigate();
  useEffect(() => {
    if (!grn_id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getGRNDetails(grn_id);
        setData(response);
      } catch (err) {
        setError("Failed to load GRN details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [grn_id]);
  //const total_amount = data.items.reduce((sum, item) => sum + item.total_price, 0) || 0;

  if (loading) return <p>Loading GRN details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>No GRN details found.</p>;
  const handlePrint = () => {
    window.print(); // ✅ Simple way to print current page
  };
  
  return (
    <div className="p-6 space-y-4">
         <PrintStyles />
       <div className="space-x-2 mb-4 flex justify-between no-print">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 no-print"
          >
           ← Back
          </button>
          <button
           onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 no-print"
          >
            Print
          </button>
        </div>
      <h1 className="text-2xl font-bold text-center">Good Receipt Note (GRN)</h1>
      <div className="space-y-2">
        <p><strong>GRN ID:</strong> {data.grn_id}</p>
        <p><strong>PO ID:</strong> {data.po_id}</p>
        <p><strong>Vendor:</strong> {data.vendor_name}</p>
        <p><strong>Date:</strong> {new Date(data.creation_date).toLocaleDateString()}</p>
        
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Items</h2>
      <table className="table-auto w-full border-collapse border border-gray-300 text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Item Code</th>
            <th className="border border-gray-300 p-2">Item Name</th>
            <th className="border border-gray-300 p-2">Ordered Qty</th>
            <th className="border border-gray-300 p-2">Received Qty</th>

            <th className="border border-gray-300 p-2">Unit Price</th>
            <th className="border border-gray-300 p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.item_code}>
              <td className="border border-gray-300 p-2 ">{item.item_code}</td>
              <td className="border border-gray-300 p-2">{item.item_name}</td>
              <td className="border border-gray-300 p-2">{item.ordered_qty}</td>
              <td className="border border-gray-300 p-2">{item.received_qty}</td>
              
              <td className="border border-gray-300 p-2">{item.unit_price}</td>
              <td className="border border-gray-300 p-2">{item.total_price}
              </td>
               
            </tr>
          ))}
        </tbody>
      </table>
      {/* Remarks */}
        <div className="mb-4">
          <p><strong>Remarks:</strong> {data.remarks || "None"}</p>
        </div>
       
        
      </div>
  );
};

export default GRNDetail;
