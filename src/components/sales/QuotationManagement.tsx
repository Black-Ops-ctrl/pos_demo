import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Send, CheckCircle, XCircle, Edit, Eye, Trash2, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuotationForm from '@/components/forms/QuotationForm';

interface Quotation {
  id: string;
  quoteNumber: string;
  customer: string;
  date: string;
  validUntil: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: number;
}

const QuotationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([
    { id: '1', quoteNumber: 'QT-001', customer: 'ABC Corp', date: '2024-01-15', validUntil: '2024-02-15', amount: 5000, status: 'sent', items: 5 },
    { id: '2', quoteNumber: 'QT-002', customer: 'XYZ Ltd', date: '2024-01-16', validUntil: '2024-02-16', amount: 3500, status: 'accepted', items: 3 },
    { id: '3', quoteNumber: 'QT-003', customer: 'Tech Solutions', date: '2024-01-17', validUntil: '2024-02-17', amount: 7200, status: 'draft', items: 8 },
    { id: '4', quoteNumber: 'QT-004', customer: 'Global Inc', date: '2024-01-18', validUntil: '2024-02-18', amount: 4800, status: 'rejected', items: 6 },
  ]);
  const { toast } = useToast();

  const filteredQuotations = quotations.filter(quote => 
    quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewQuotation = () => {
    setEditingQuotation(null);
    setShowForm(true);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setShowForm(true);
  };

  const handleViewQuotation = (quoteId: string) => {
    toast({
      title: "View Quotation",
      description: `Opening quotation ${quoteId} details...`,
    });
  };

  const handleSendQuotation = (quoteId: string) => {
    setQuotations(prev => prev.map(quote => 
      quote.id === quoteId ? { ...quote, status: 'sent' } : quote
    ));
    toast({
      title: "Quotation Sent",
      description: `Quotation ${quoteId} has been sent to customer.`,
    });
  };

  const handleConvertToSO = (quoteId: string) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (quote) {
      toast({
        title: "Converting to Sales Order",
        description: `Converting quotation ${quote.quoteNumber} to sales order...`,
      });
    }
  };

  const handleDuplicateQuotation = (quoteId: string) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (quote) {
      const newQuote = {
        ...quote,
        id: Date.now().toString(),
        quoteNumber: `QT-${String(quotations.length + 1).padStart(3, '0')}`,
        status: 'draft' as const,
        date: new Date().toISOString().split('T')[0]
      };
      setQuotations(prev => [...prev, newQuote]);
      toast({
        title: "Quotation Duplicated",
        description: `Created duplicate quotation ${newQuote.quoteNumber}`,
      });
    }
  };

  const handleDownloadQuotation = (quoteId: string) => {
    toast({
      title: "Downloading Quotation",
      description: `Downloading quotation ${quoteId} as PDF...`,
    });
  };

  const handleDeleteQuotation = (quoteId: string) => {
    setQuotations(prev => prev.filter(quote => quote.id !== quoteId));
    toast({
      title: "Quotation Deleted",
      description: `Quotation ${quoteId} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (formData: any) => {
    if (editingQuotation) {
      setQuotations(prev => prev.map(quote => 
        quote.id === editingQuotation.id 
          ? { ...quote, ...formData, amount: formData.total }
          : quote
      ));
      toast({
        title: "Quotation Updated",
        description: "Quotation has been updated successfully.",
      });
    } else {
      const newQuotation: Quotation = {
        id: Date.now().toString(),
        quoteNumber: `QT-${String(quotations.length + 1).padStart(3, '0')}`,
        customer: formData.customer,
        date: formData.quoteDate,
        validUntil: formData.validUntil,
        amount: formData.total,
        status: 'draft',
        items: formData.items.length
      };
      setQuotations(prev => [...prev, newQuotation]);
      toast({
        title: "Quotation Created",
        description: "New quotation has been created successfully.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quotation Management</CardTitle>
            <Button 
              onClick={handleNewQuotation}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search quotations..."
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
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>{quote.date}</TableCell>
                  <TableCell>{quote.validUntil}</TableCell>
                  <TableCell>{quote.items}</TableCell>
                  <TableCell>${quote.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewQuotation(quote.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditQuotation(quote)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {quote.status === 'draft' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleSendQuotation(quote.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {quote.status === 'accepted' && (
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleConvertToSO(quote.id)}
                        >
                          Convert to SO
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDuplicateQuotation(quote.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadQuotation(quote.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteQuotation(quote.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <QuotationForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleFormSubmit}
        initialData={editingQuotation}
      />
    </>
  );
};

export default QuotationManagement;