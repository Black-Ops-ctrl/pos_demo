import React, { useEffect, useState ,useCallback} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, ArrowUp } from "lucide-react";
import { addRegion, deleteRegion, getRegions, updateRegion } from "@/api/regionApi";
import { addExpense, deleteExpense, getExpense, updateExpense } from "@/api/expenseApi";

interface Expense {
  expense_id: number;
  expense_name: string;
  
}

const Expense: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
          const [showScrollToTop, setShowScrollToTop] = useState(false); // ✅ New state for scroll button
  
  const [Cities, setCities] = useState<Expense[]>([]);

  // Load departments on mount
  useEffect(() => {
    loadCities();
  }, []);




  





  const loadCities = async () => {
    try {
      const data = await getExpense();
      setCities(data);
    } catch (error) {
      console.error("Error loading Cities", error);
    }
  };



        const checkScrollTop = useCallback(() => {
        // Show button if page is scrolled down more than 400px
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

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (Expense: Expense) => {
    setEditingExpense(Expense);
    setShowForm(true);
  };

  const handleSaveExpense = async (ExpenseData: Omit<Expense, "expense_id">) => {
    try {
      if (editingExpense) {
        await updateExpense
        (editingExpense.expense_id, ExpenseData.expense_name);
      } else {
        await addExpense(ExpenseData.expense_name);
      }
      setShowForm(false);
      loadCities();
    } catch (error) {
      console.error("Error saving Expense", error);
    }
  };

  const handleDeleteExpense = async (expense_id: number) => {
    if (confirm("Are you sure you want to delete this Expense?")) {
      try {
        await deleteExpense(expense_id);
        loadCities();
      } catch (error) {
        console.error("Error deleting Cities", error);
      }
    }
  };

  const filteredCities = Cities.filter((Expense) =>
    Expense.expense_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Cities..."
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
                <TableHead>Expense Name</TableHead>
               
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((Expense) => (
                <TableRow key={Expense.expense_id}>
                  <TableCell className="font-medium">{Expense.expense_name}</TableCell>
                 
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditExpense(Expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteExpense(Expense.expense_id)}>
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


                          {showScrollToTop && (
                      <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg 
                                   bg-blue-500 hover:bg-blue-600 transition-opaExpense duration-300"
                        aria-label="Scroll to top"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                    )}

      {showForm && (
        <ExpenseForm Expense={editingExpense} 
        onClose={() => setShowForm(false)} 
        onSave={handleSaveExpense} />
      )}
    </>
  );
};
const ExpenseForm: React.FC<{
  Expense: Expense | null;
  onClose: () => void;
  onSave: (data: Omit<Expense, "expense_id">) => void;
}> = ({ Expense, onClose, onSave }) => {
  const [expense_name, setExpenseName] = useState("");
  
  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
       
       

        if (Expense) {
          setExpenseName(Expense.expense_name || "");
         
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [Expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense_name ) {
      alert("Please fill all fields.");
      return;
    }
    onSave({ expense_name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {Expense ? "Edit Expense" : "Add Expense"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <span className="text-xs text-gray-700">Expense</span>
          <Input
            value={expense_name}
            onChange={(e) => setExpenseName(e.target.value)}
           
          />

         
          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Expense;
