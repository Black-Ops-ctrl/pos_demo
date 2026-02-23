import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Building2, ChevronsUpDown, Check, ArrowUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GenericForm from "@/components/forms/GenericForm";
import { getItemCategory, addItemCategory, updateItemCategory, deleteItemCategory } from "@/api/itemCategoryApi";
import { getItemsAccounts } from "@/api/getAccountsApi";
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

interface ItemCategory {
  category_id: number;
  category_name: string;
  account_id?: number | null;
  account_code?: string;
  account_name?: string;
  description: string;
}

const ItemCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const { toast } = useToast();

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await getItemCategory();
      setCategories(res.data || res);
    } catch (error) {
      console.error("Error loading categories", error);
    }
  };

  useEffect(() => {
    loadCategories();
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

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (cat: ItemCategory) => {
    setEditingCategory(cat);
    setShowForm(true);
  };

  const handleSaveCategory = async (data: Omit<ItemCategory, "category_id">) => {
    try {
      if (editingCategory) {
        await updateItemCategory(
          editingCategory.category_id,
          data.category_name,
          data.account_id,
          data.description
        );
        toast({ title: "Updated", description: "Category updated successfully!", duration: 3000 });
      } else {
        await addItemCategory(
          data.category_name,
          data.account_id,
          data.description
        );
        toast({ title: "Created", description: "Category created successfully!", duration: 3000 });
      }
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error("Error saving category", error);
      toast({ title: "Error", description: "Failed to save category", variant: "destructive", duration: 3000 });
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteItemCategory(categoryId);
        loadCategories();
        toast({ title: "Deleted", description: "Category deleted successfully!", duration: 3000 });
      } catch (error) {
        console.error("Error deleting category", error);
        toast({ title: "Error", description: "Failed to delete category", variant: "destructive", duration: 3000 });
      }
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Item Categories
            </CardTitle>
            <Button
              onClick={handleAddCategory}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat.category_id}>
                  <TableCell className="font-medium">{cat.category_name}</TableCell>
                  <TableCell>{cat.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCategory(cat.category_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {showForm && (
        <CategoryForm 
          category={editingCategory} 
          onClose={() => setShowForm(false)} 
          onSave={handleSaveCategory} 
        />
      )}
    </>
  );
};

const CategoryForm: React.FC<{
  category: ItemCategory | null;
  onClose: () => void;
  onSave: (data: Omit<ItemCategory, "category_id">) => Promise<void>;
}> = ({ category, onClose, onSave }) => {
  const [category_name, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountsData = await getItemsAccounts();
        setAccounts(accountsData);

        if (category) {
          setCategoryName(category.category_name || "");
          setDescription(category.description || "");
        }
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    fetchData();
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category_name || !description) {
      alert("Please fill all fields.");
      return;
    }

    setIsLoading(true);

    try {
      await onSave({
        category_name,
        description
      });
      // Form will close automatically on successful save
    } catch (error) {
      // If saving fails, keep the form open and turn off loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {category ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={category_name}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            disabled={isLoading}
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type='text'
            placeholder="Description"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemCategories;