import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, Package, ChevronsUpDown, Check, ArrowUp, Loader2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GenericForm from '@/components/forms/GenericForm';
import { getItems, addItem, updateItem, deleteItem, getSaleItemsAccounts, getPurchaseItemsAccounts } from '@/api/itemsApi';
import { getItemCategory } from '@/api/itemCategoryApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import { getUOM } from '@/api/uomApi';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Item {
    item_id: number,
    item_code: string,
    item_name: string,
    description: string,
    uom_id: number,
    unit: string,
    price: number,
    category?: number,
    category_name?: string,
    purchase_account_id: number,
    sale_account_id: number,
    warehouse_id?: number,
    warehouse_name?: string
    uom_name: string;
}

interface UOM {
    uom_name: string;
    uom_id: number;
}

interface Category {
    category_id: number;
    category_name: string;
}

const Items: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // 💡 New State for Category Filtering
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);

    // Load Items and Categories
    useEffect(() => {
        loadItems();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getItemCategory();
            setCategories(data);
        } catch (error) {
            console.error("Error loading categories", error);
        }
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

    const loadItems = async () => {
        try {
            const data = await getItems();
            setItems(data);
        } catch (error) {
            console.error("Error loading items", error);
        }
    };

    const { toast } = useToast();
    
    const handleAddItem = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleSaveItem = async (itemData: Omit<Item, "item_id">) => {
        setIsLoading(true);
        try {
            if (editingItem) {
                await updateItem(
                    editingItem.item_id,
                    itemData.item_name,
                    itemData.description,
                    itemData.category!,
                    itemData.purchase_account_id,
                    itemData.sale_account_id,
                    itemData.uom_id,
                    itemData.price
                );
                toast({ title: "Updated", description: "Item updated successfully!", duration: 3000 });
            } else {
                await addItem(
                    itemData.item_name,
                    itemData.description,
                    itemData.category!,
                    itemData.purchase_account_id,
                    itemData.sale_account_id,
                    itemData.uom_id,
                    itemData.price
                );
                toast({ title: "Created", description: "Item created successfully!", duration: 3000 });
            }
            setShowForm(false);
            loadItems();
        } catch (error) {
            console.error("Error saving item", error);
            toast({ 
                title: "Error", 
                description: "Failed to save item. Please try again.", 
                duration: 3000,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteItem(itemId);
                toast({ title: "Deleted", description: "Item deleted successfully!", duration: 3000 });
                loadItems();
            } catch (error) {
                console.error("Error deleting item", error);
            }
        }
    };

    // 💡 Updated filtering logic
    const filteredItems = items.filter((item) => {
        const matchesSearch = 
            item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesCategory = selectedCategoryId === null || item.category === selectedCategoryId;
        
        return matchesSearch && matchesCategory;
    });

    const handleViewItem = (itemId: number) => { 
        toast({ title: "View Item", description: `Opening item ${itemId} details...` }); 
    };

    const getStockStatus = (stock: number, minStock: number) => {
        if (stock <= minStock) return 'bg-red-100 text-red-800';
        if (stock <= minStock * 2) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const selectedCategoryName = selectedCategoryId === null 
        ? "All Categories" 
        : categories.find(c => c.category_id === selectedCategoryId)?.category_name || "All Categories";

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Item Master
                        </CardTitle>
                        <Button 
                            onClick={handleAddItem}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Item
                        </Button>
                    </div>
                    <div className="flex space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search items by code or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {/* 💡 Category Filter Dropdown */}
                        <Popover open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={categoryFilterOpen}
                                    className="w-[200px] justify-between"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {selectedCategoryName}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search category..." />
                                    <CommandEmpty>No category found.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => {
                                                setSelectedCategoryId(null);
                                                setCategoryFilterOpen(false);
                                            }}
                                            value="all-categories"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCategoryId === null ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            All Categories
                                        </CommandItem>
                                        {categories.map((category) => (
                                            <CommandItem
                                                key={category.category_id}
                                                onSelect={() => {
                                                    setSelectedCategoryId(category.category_id);
                                                    setCategoryFilterOpen(false);
                                                }}
                                                value={category.category_name}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCategoryId === category.category_id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {category.category_name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {/* ------------------------------- */}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.item_id}>
                                    <TableCell className="font-medium">{item.item_code}</TableCell>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.category_name}</TableCell>
                                    <TableCell>{item.uom_name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleEditItem(item)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteItem(item.item_id)}
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
            
            {showForm && (
                <ItemForm 
                    item={editingItem} 
                    onClose={() => setShowForm(false)} 
                    onSave={handleSaveItem} 
                    isLoading={isLoading}
                />
            )}

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
        </>
    );
};

const ItemForm: React.FC<{
    item: Item | null;
    onClose: () => void;
    onSave: (data: Omit<Item, "item_id">) => void;
    isLoading: boolean;
}> = ({ item, onClose, onSave, isLoading }) => {
    const [item_name, setItemName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<number | undefined>();

    const [uom_id, setUomId] = useState<number>(0); 
    const [uom_name_display, setUomNameDisplay] = useState(""); 
    const [uomOpen, setUomOpen] = useState(false);
    const [uoms, setUoms] = useState<UOM[]>([]);
    
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [category, setCategoryId] = useState<number | undefined>(0); 
    const [categories, setCategories] = useState<any[]>([]);

    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [purchase_account_id, setPurchaseAccountId] = useState<number>(0); 
    const [saleOpen, setSaleOpen] = useState(false);
    const [sale_account_id, setSaleAccountId] = useState<number>(0); 
    const [saleItemaccounts, setSaleItemAccounts] = useState<any[]>([]);
    const [purchaseItemaccounts, setPurchaseItemAccounts] = useState<any[]>([]);

    // Fetch categories and accounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, saleAccountsData, purchaseAccountsData, uomsData] = await Promise.all([
                    getItemCategory(),
                    getSaleItemsAccounts(),
                    getPurchaseItemsAccounts(),
                    getUOM(),
                ]);

                setCategories(categoriesData);
                setSaleItemAccounts(saleAccountsData);
                setPurchaseItemAccounts(purchaseAccountsData);
                setUoms(uomsData);

                // ✅ After data is loaded, then set item details
                if (item) {
                    setItemName(item.item_name || "");
                    setDescription(item.description || "");
                    setPrice(item.price);

                    // Category
                    setCategoryId(item.category);

                    // UOM (unit)
                    setUomId(item.uom_id || 0);
                    const initialUomName =
                        uomsData.find((u: UOM) => u.uom_id === item.uom_id)?.uom_name ||
                        item.unit ||
                        "";
                    setUomNameDisplay(initialUomName);

                    // Purchase account
                    setPurchaseAccountId(item.purchase_account_id || 0);

                    // Sale account
                    setSaleAccountId(item.sale_account_id || 0);
                }
            } catch (err) {
                console.error("Error loading form data", err);
            }
        };

        fetchData();
    }, [item]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Check for required fields
        if (!item_name || !category || !description || !uom_id || !purchase_account_id || !sale_account_id || price === undefined) {
            alert("Please fill all required fields: Item Name, Description, Price, Unit, Category, Purchase Account, and Sale Account.");
            return;
        }
        onSave({
            item_name,
            price: price!, // price is defined due to the check above
            category,
            purchase_account_id,
            sale_account_id,
            description,
            uom_id,
            unit: uom_name_display,
            item_code: '',
            uom_name: ''
        });
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-200 p-6 rounded-lg w-full max-w-lg shadow-2xl bg-opacity-90">

        {/* HEADER */}
        <h2 className="text-lg font-semibold mb-4 text-black  text-left">
            {item ? "Edit Item" : "Add Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

            {/* ITEM NAME & DESCRIPTION */}
            <div className="flex space-x-4">
                <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-blue-700">Item Name</span>
                    <Input
                        value={item_name}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Item Name"
                        required
                        className="mt-1 bg-white border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-blue-700">Item Description</span>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        type='text'
                        placeholder="Description"
                        required
                        className="mt-1 bg-white border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                </div>
            </div>

            {/* PRICE & UNIT */}
            <div className="flex space-x-4">
                <div className="flex flex-col flex-1">
                    <span className="text-xs text-blue-700 mb-0">Price</span>
                    <Input
                        type="number"
                        value={price === undefined ? '' : price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="Price"
                        required
                        className="mt-1 bg-white border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-xs text-blue-700 mb-0">Unit</span>
                    <Popover open={uomOpen} onOpenChange={setUomOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between bg-blue-50 border border-blue-300 hover:bg-blue-100">
                                {uom_name_display ? uom_name_display : "Select Unit"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[300px] overflow-auto p-0 bg-white">
                            <Command>
                                <CommandInput placeholder="Search units..." className="text-black" />
                                <CommandEmpty>No unit found.</CommandEmpty>
                                <CommandGroup>
                                    {uoms.map((uom: UOM) => (
                                        <CommandItem
                                            key={uom.uom_id}
                                            className="hover:bg-blue-50"
                                            onSelect={() => {
                                                setUomId(uom.uom_id);
                                                setUomNameDisplay(uom.uom_name);
                                                setUomOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-green-500",
                                                    uom_id === uom.uom_id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {uom.uom_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* CATEGORY */}
            <div className="flex flex-col flex-1">
                <span className="text-xs text-blue-700 mb-0">Category</span>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between bg-blue-50 border border-blue-300 hover:bg-blue-100">
                            {category ? `${categories.find((c) => c.category_id === category)?.category_name}` : "Select Category"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto p-0 bg-white">
                        <Command>
                            <CommandInput placeholder="Search categories..." className="text-black" />
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                                {categories.map((cat) => (
                                    <CommandItem
                                        key={cat.category_id}
                                        className="hover:bg-blue-50"
                                        onSelect={() => {
                                            setCategoryId(cat.category_id);
                                            setCategoryOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 text-green-500",
                                                category === cat.category_id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {cat.category_name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* PURCHASE & SALE ACCOUNT */}
            <div className="flex space-x-4">
                <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-blue-700">Purchase Account</span>
                    <Popover open={purchaseOpen} onOpenChange={setPurchaseOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between bg-blue-50 border border-blue-300 hover:bg-blue-100">
                                {purchase_account_id
                                    ? `${purchaseItemaccounts.find((a: any) => a.account_id === purchase_account_id)?.account_name} (${purchaseItemaccounts.find((a: any) => a.account_id === purchase_account_id)?.account_code})`
                                    : "Select Purchase Account"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[300px] overflow-auto p-0 bg-white">
                            <Command>
                                <CommandInput placeholder="Search accounts..." className="text-black" />
                                <CommandEmpty>No account found.</CommandEmpty>
                                <CommandGroup>
                                    {purchaseItemaccounts.map((acc: any) => (
                                        <CommandItem
                                            key={acc.account_id}
                                            className="hover:bg-blue-50"
                                            onSelect={() => {
                                                setPurchaseAccountId(acc.account_id);
                                                setPurchaseOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-green-500",
                                                    purchase_account_id === acc.account_id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {acc.account_name} ({acc.account_code})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-blue-700">Sale Account</span>
                    <Popover open={saleOpen} onOpenChange={setSaleOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between bg-blue-50 border border-blue-300 hover:bg-blue-100">
                                {sale_account_id
                                    ? `${saleItemaccounts.find((a: any) => a.account_id === sale_account_id)?.account_name} (${saleItemaccounts.find((a: any) => a.account_id === sale_account_id)?.account_code})`
                                    : "Select Account"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[300px] overflow-auto p-0 bg-white">
                            <Command>
                                <CommandInput placeholder="Search accounts..." className="text-black" />
                                <CommandEmpty>No account found.</CommandEmpty>
                                <CommandGroup>
                                    {saleItemaccounts.map((acc: any) => (
                                        <CommandItem
                                            key={acc.account_id}
                                            className="hover:bg-blue-50"
                                            onSelect={() => {
                                                setSaleAccountId(acc.account_id);
                                                setSaleOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-green-500",
                                                    sale_account_id === acc.account_id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {acc.account_name} ({acc.account_code})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2 pt-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isLoading}
                    className="border-red-400 text-red-500 hover:bg-red-50"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save'
                    )}
                </Button>
            </div>
        </form>
    </div>
</div>
    );
};

export default Items;