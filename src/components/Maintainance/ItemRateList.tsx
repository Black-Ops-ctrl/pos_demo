import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, Package, ChevronsUpDown, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { getAllItems, updateItemRates} from '@/api/updateItemRateApi'; 

import { cn } from "@/lib/utils";


interface ItemsRate {
    rate_id:number,
    item_id:number,
    item_code:string,
    item_name:string,
    category:number,
    category_name?:string,
    description:string,
    
    module_id:number,
    rate:number,
    
    warehouse_id?:number,
    warehouse_name?:string,
    updated_date:Date
}


const ItemsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [items, setItems] = useState<ItemsRate[]>([]);
  const [editingItem, setEditingItem] = useState<ItemsRate | null>(null);
 const [editableItems, setEditableItems] = useState<ItemsRate[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const { toast } = useToast();
 useEffect(() => {
        loadItemsList();
    }, []);

    const loadItemsList = async () => {
        try {
            const data: ItemsRate[] = await getAllItems();
            setItems(data);
            setEditableItems(data); // Initialize editable state with fetched data
        } catch (error) {
            console.error("Error loading ItemsList", error);
            toast({ title: "Error", description: "Failed to load item rates.", variant: "destructive" });
        }
    };
    // --- Rate Editing Handler ---
    // --- Rate Editing Handler (MODIFIED TO USE rate_id) ---
    const handleRateChange = (rateId: number, newRateString: string) => { // Use rateId
        const newRate = parseFloat(newRateString);
        
        // Basic validation for numbers
        if (isNaN(newRate) && newRateString !== '') {
            return; 
        }

        setEditableItems(prevItems => {
            // Find the index using the unique ID
            const itemIndex = prevItems.findIndex(item => item.rate_id === rateId);
            if (itemIndex === -1) return prevItems; // Exit if item not found

            const newItems = [...prevItems];
            newItems[itemIndex] = { 
                ...newItems[itemIndex], 
                // Set rate to 0 if input is cleared, otherwise set the new number
                rate: newRateString === '' ? 0 : newRate 
            };

            // Check for changes against the original 'items' array
            const changesExist = newItems.some((editableItem) => {
                const originalItem = items.find(i => i.rate_id === editableItem.rate_id);
                // Check if the rate is different
                return originalItem && editableItem.rate !== originalItem.rate;
            });
            setHasChanges(changesExist);
            
            return newItems;
        });
    };

    // --- Batch Update Handler (remains logically correct, using flat arrays) ---
    const handleBatchUpdate = async () => {
        if (!hasChanges) {
            toast({ title: "Info", description: "No changes to save.", variant: "default" });
            return;
        }

        setIsSaving(true);
        try {
            // Filter only the items that have a change in rate compared to original data
            const updatedItems = editableItems.filter((editableItem) => {
                const originalItem = items.find(i => i.rate_id === editableItem.rate_id);
                return originalItem && editableItem.rate !== originalItem.rate;
            });


            if (updatedItems.length === 0) {
                toast({ title: "Info", description: "No changes detected for saving.", variant: "default" });
                setIsSaving(false);
                return;
            }

            // Create arrays for the API function
            const rate_ids = updatedItems.map(item => item.rate_id);
            const item_ids = updatedItems.map(item => item.item_id);
            const categories = updatedItems.map(item => item.category);
            const warehouse_ids = updatedItems.map(item => item.warehouse_id || 0); // Handle potential undefined/null
            const prices = updatedItems.map(item => item.rate);

            // Call the batch update API
            await updateItemRates(
                rate_ids,
                item_ids,
                categories,
                warehouse_ids,
                prices
            );

            // Reload data to show the updated rates and reset state
            await loadItemsList(); 

            toast({ 
                title: "Success", 
                description: `${updatedItems.length} item rate(s) updated successfully!`, 
                duration: 3000,
            });
            setHasChanges(false);

        } catch (error) {
            console.error("Error updating item rates", error);
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
  const filteredItemsList = editableItems.filter((item) => 
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
const handleViewItem = (itemId: number) => { toast({ title: "View Item", description: `Opening item ${itemId} details...`, }); };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'bg-red-100 text-red-800';
    if (stock <= minStock * 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
 return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            {/* ... (CardHeader content remains largely the same) ... */}
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Item Rates Master
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleBatchUpdate}
                            disabled={!hasChanges || isSaving}
                            className={cn(
                                "bg-blue-600 hover:bg-blue-700",
                              //  hasChanges ? "animate-pulse" : "" // Visual cue for unsaved changes
                            )}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search ItemsList..."
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
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead className="w-[150px]">Rate</TableHead> 
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItemsList.map((item) => {
                            // Find the original rate for comparison, robust against filtering
                            const originalRate = items.find(i => i.rate_id === item.rate_id)?.rate;
                            const isChanged = item.rate !== originalRate;

                            return (
                                <TableRow key={item.rate_id}>
                                    <TableCell className="font-medium">{item.item_code}</TableCell>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.category_name}</TableCell>
                                    <TableCell>{item.warehouse_name}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.rate}
                                            // CORRECTED: Pass item.rate_id instead of 'index'
                                            onChange={(e) => handleRateChange(item.rate_id, e.target.value)} 
                                            className={cn(
                                                "text-right",
                                                // Use the isChanged variable
                                                isChanged ? "border-amber-500 bg-amber-50" : "" 
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

};



export default ItemsList;