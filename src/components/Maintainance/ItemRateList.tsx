import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, Package, ChevronsUpDown, Check, Save, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllItems, updateItemRates } from '@/api/updateItemRateApi'; 
import { cn } from "@/lib/utils";

interface ItemsRate {
    rate_id: number,
    item_id: number,
    item_code: string,
    item_name: string,
    category: number,
    category_name?: string,
    description: string,
    module_id: number,
    rate: number,
    discount: number,
    updated_date: Date
}

const ItemsList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<ItemsRate[]>([]); // Liste originale des items (non modifiée)
    const [editableItems, setEditableItems] = useState<ItemsRate[]>([]); // Liste avec les modifications de taux
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    
    const { toast } = useToast();
    
    useEffect(() => {
        loadItemsList();
    }, []);

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
    
    const loadItemsList = async () => {
        try {
            const data: ItemsRate[] = await getAllItems();
            setItems(data);
            setEditableItems(data); // Initialiser l'état modifiable avec les données récupérées
        } catch (error) {
            console.error("Error loading ItemsList", error);
            toast({ title: "Error", description: "Failed to load item rates.", variant: "destructive" });
        }
    };
    
    // --- Rate Editing Handler ---
    const handleRateChange = (rateId: number, newRateString: string) => { 
        const newRate = parseFloat(newRateString);
        
        // Basic validation for numbers
        if (isNaN(newRate) && newRateString !== '') {
            return; 
        }

        setEditableItems(prevItems => {
            const itemIndex = prevItems.findIndex(item => item.rate_id === rateId);
            if (itemIndex === -1) return prevItems; 

            const newItems = [...prevItems];
            newItems[itemIndex] = { 
                ...newItems[itemIndex], 
                rate: newRateString === '' ? 0 : newRate 
            };

            // Check for changes against the original 'items' array
            const changesExist = newItems.some((editableItem) => {
                const originalItem = items.find(i => i.rate_id === editableItem.rate_id);
                return originalItem && (editableItem.rate !== originalItem.rate || editableItem.discount !== originalItem.discount);
            });
            setHasChanges(changesExist);
            
            return newItems;
        });
    };

    // --- Discount Editing Handler ---
    const handleDiscountChange = (rateId: number, newDiscountString: string) => { 
        const newDiscount = parseFloat(newDiscountString);
        
        // Basic validation for numbers
        if (isNaN(newDiscount) && newDiscountString !== '') {
            return; 
        }

        setEditableItems(prevItems => {
            const itemIndex = prevItems.findIndex(item => item.rate_id === rateId);
            if (itemIndex === -1) return prevItems; 

            const newItems = [...prevItems];
            newItems[itemIndex] = { 
                ...newItems[itemIndex], 
                discount: newDiscountString === '' ? 0 : newDiscount 
            };

            // Check for changes against the original 'items' array
            const changesExist = newItems.some((editableItem) => {
                const originalItem = items.find(i => i.rate_id === editableItem.rate_id);
                return originalItem && (editableItem.rate !== originalItem.rate || editableItem.discount !== originalItem.discount);
            });
            setHasChanges(changesExist);
            
            return newItems;
        });
    };

    // --- Batch Update Handler ---
    const handleBatchUpdate = async () => {
        if (!hasChanges) {
            toast({ title: "Info", description: "No changes to save.", variant: "default" });
            return;
        }

        setIsSaving(true);
        try {
            // Filter only the items that have changes in rate or discount compared to original data
            const updatedItems = editableItems.filter((editableItem) => {
                const originalItem = items.find(i => i.rate_id === editableItem.rate_id);
                return originalItem && (editableItem.rate !== originalItem.rate || editableItem.discount !== originalItem.discount);
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
            const rates = updatedItems.map(item => item.rate);
            const discounts = updatedItems.map(item => item.discount);

            // Call the batch update API
            await updateItemRates(
                rate_ids,
                item_ids,
                categories,
                rates,
                discounts
            );

            // Recharger les données pour afficher les taux mis à jour et réinitialiser l'état
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
    
    // --- Logique de Filtrage CORRIGÉE (utilisation de useMemo) ---
    const filteredAndEditableItems = useMemo(() => {
        // 1. Filtrer la liste ORIGINALE (`items`) par le terme de recherche
        const filteredOriginalItems = items.filter((item) => 
            item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Mapper les items filtrés pour utiliser le taux de `editableItems`
        // Cela garantit que la vue affichée est toujours à jour avec les modifications non sauvegardées
        return filteredOriginalItems.map(originalItem => {
            const editableVersion = editableItems.find(e => e.rate_id === originalItem.rate_id);
            // On renvoie la version modifiable (avec le taux à jour) ou l'originale si elle n'est pas trouvée
            return editableVersion || originalItem; 
        });
    }, [items, editableItems, searchTerm]); // Recalculer lorsque ces dépendances changent

    const handleViewItem = (itemId: number) => { toast({ title: "View Item", description: `Opening item ${itemId} details...`, }); };

    // Cette fonction n'est pas utilisée mais je la laisse
    const getStockStatus = (stock: number, minStock: number) => {
        if (stock <= minStock) return 'bg-red-100 text-red-800';
        if (stock <= minStock * 2) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg relative">
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
            <CardContent className="relative">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="w-[150px]">Rate</TableHead> 
                            <TableHead className="w-[150px]">Discount</TableHead> 
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Utiliser la liste corrigée pour le rendu */}
                        {filteredAndEditableItems.map((item) => {
                            // Trouver les valeurs originales pour la comparaison
                            const originalItem = items.find(i => i.rate_id === item.rate_id);
                            const isRateChanged = item.rate !== originalItem?.rate;
                            const isDiscountChanged = item.discount !== originalItem?.discount;
                            const isChanged = isRateChanged || isDiscountChanged;

                            return (
                                <TableRow key={item.rate_id}>
                                    <TableCell className="font-medium">{item.item_code}</TableCell>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.category_name}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={item.rate}
                                            onChange={(e) => handleRateChange(item.rate_id, e.target.value)} 
                                            className={cn(
                                                "text-right",
                                                // Mettre en évidence si le taux est différent du taux original
                                                isRateChanged ? "border-amber-500 bg-amber-50" : "" 
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={item.discount}
                                            onChange={(e) => handleDiscountChange(item.rate_id, e.target.value)} 
                                            className={cn(
                                                "text-right",
                                                // Mettre en évidence si le discount est différent du discount original
                                                isDiscountChanged ? "border-amber-500 bg-amber-50" : "" 
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* Scroll to top button positioned at bottom right of card content */}
                {showScrollToTop && (
                    <div className="sticky bottom-4 flex justify-end mt-4">
                        <Button
                            onClick={scrollToTop}
                            size="icon"
                            className="rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ItemsList;