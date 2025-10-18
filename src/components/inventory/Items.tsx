import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, Package, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GenericForm from '@/components/forms/GenericForm';
import { getItems,addItem,updateItem,deleteItem } from '@/api/itemsApi'; 
import { getItemCategory } from '@/api/itemCategoryApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover";
import {Command,CommandEmpty,CommandGroup,CommandInput,CommandItem,} from "@/components/ui/command";
import { cn } from "@/lib/utils";


interface Item {
   item_id:number,
    item_code:string,
    item_name:string,
    description:string,
    
    unit:string,
    price:number,
    category_id?:number,
    category_name?:string,
    warehouse_id?:number,
    warehouse_name?:string
}


const Items: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

//Load Items 
  useEffect(() => {
    loadItems();
  }, []);

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
    try {
      if (editingItem) {
        await updateItem(
          editingItem.item_id,
          itemData.item_name,
          itemData.description,
          itemData.category_id,
          itemData.warehouse_id,
          itemData.unit,
          itemData.price
        );
         toast({ title: "Updated", description: "Item updated successfully!" ,duration: 3000,});
      } else {
        await addItem(
          itemData.item_name,
          itemData.description,
          itemData.category_id,
          itemData.warehouse_id,
          itemData.unit,
          itemData.price
        );
        toast({ title: "Created", description: "Item created successfully!" ,duration: 3000});
      }
      setShowForm(false);
      loadItems();
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(itemId);
        toast({ title: "Deleted", description: "Item deleted successfully!", duration: 3000,});
        loadItems();
      } catch (error) {
        console.error("Error deleting item", error);
      }
    }
  };

  const filteredItems = items.filter((item) =>
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
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
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
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell className="font-medium">{item.item_code}</TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.category_name}</TableCell>
                    <TableCell>{item.warehouse_name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  
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
        <ItemForm item={editingItem} onClose={() => setShowForm(false)} onSave={handleSaveItem} />
      )}

    </>
  );
};
const ItemForm: React.FC<{
  item: Item | null;
  onClose: () => void;
  onSave: (data: Omit<Item, "item_id">) => void;
}> = ({ item, onClose, onSave }) => {
  const [item_name, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState<number>(0);

   const [categoryOpen, setCategoryOpen] = useState(false);
  const [category_id, setCategoryId] = useState<number>(0);  // Initially set to 0
  const [categories, setCategories] = useState<any[]>([]);

  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [warehouse_id, setWarehouseId] = useState<number>(0);  // Initially set to 0
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getItemCategory();
        const warehousesData = await getWarehouses();
        setCategories(categoriesData);
        setWarehouses(warehousesData);
   if (item) {
          setItemName(item.item_name || "");
          setDescription(item.description || "");
          setPrice(item.price);
          setUnit(item.unit || "");
          setCategoryId(item.category_id || 0);
          setWarehouseId(item.warehouse_id || 0);
        }
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    fetchData();
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item_name  || !category_id  || !description || !unit) {
      alert("Please fill all fields.");
      return;
    }
    onSave({
      item_name,
      price,
      category_id,
      warehouse_id,
      description,
      unit,
      item_code: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {item ? "Edit Item" : "Add Item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
             {/* <Input
            value={item_code}
            onChange={(e) => setItemCode(e.target.value)}
            placeholder="Item Code"
          /> */}
          <Input
            value={item_name}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name"
          />
          <Input
           
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type='text'
            placeholder="Description"
          />
          <div className="flex flex-col">
            <span className="text-xs text-gray-700 mb-0">Price</span>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Price"
          />
          </div>
           <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit"
          />

           {/* Category Dropdown */}
               <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                          <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {category_id
                      ? `${categories.find((c) => c.category_id === category_id)?.category_name}`
                      : "Select Category"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command >
                    <CommandInput placeholder="Search categories..." className="text-black" />
                    <CommandEmpty >No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat.category_id}
                          className="hover:bg-gray-100"
                          onSelect={() => {
                            setCategoryId(cat.category_id);
                            setCategoryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                               "mr-2 h-4 w-4",
                              category_id === cat.category_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cat.category_name} 
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            {/* Warehouse Dropdown */}
           <Popover open={warehouseOpen} onOpenChange={setWarehouseOpen}>
                      <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {warehouse_id
                  ? `${warehouses.find((w) => Number(w.warehouse_id) === warehouse_id)?.warehouse_name}`
                  : "Select Warehouse"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command >
                <CommandInput placeholder="Search warehouses..." className="text-black" />
                <CommandEmpty >No warehouse found.</CommandEmpty>
                <CommandGroup>
                  {warehouses.map((w) => (
                    <CommandItem
                      key={w.warehouse_id}
                      className="hover:bg-gray-100"
                      onSelect={() => {
                        setWarehouseId(w.warehouse_id);
                        setWarehouseOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                           "mr-2 h-4 w-4",
                          warehouse_id === w.warehouse_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {w.warehouse_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex  gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
                          Cancel
                        </Button>
            
            
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
              Save
            </Button>
            
          </div>
        </form>
      </div>
    </div>
  );
};


export default Items;