import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Trash2 } from 'lucide-react';

interface JournalLine {
  account_id: number;
  debit: number;
  credit: number;
  description: string;
  
}

interface JournalEntryFormProps {
  onClose: () => void;
  onSave: (entry: any) => void;
  entry?: any;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onClose, onSave, entry }) => {
  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString().split('T')[0],
    reference: entry?.reference || '',
    description: entry?.description || '',
    lines: entry?.lines || [{ account: '', description: '', debit: 0, credit: 0 }]
  });

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account: '', description: '', debit: 0, credit: 0 }]
    });
  };

  const removeLine = (index: number) => {
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert('Journal entry must be balanced (total debits = total credits)');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{entry ? 'Edit Journal Entry' : 'New Journal Entry'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  placeholder="JE-001"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Journal Lines</h3>
                <Button type="button" onClick={addLine} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={line.account}
                          onChange={(e) => updateLine(index, 'account', e.target.value)}
                          placeholder="Account code"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Line description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.debit || ''}
                          onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.credit || ''}
                          onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        {formData.lines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span>Total Debit: ${totalDebit.toFixed(2)}</span>
                  <span>Total Credit: ${totalCredit.toFixed(2)}</span>
                  <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                    {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={!isBalanced}>
                Save Journal Entry
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntryForm;