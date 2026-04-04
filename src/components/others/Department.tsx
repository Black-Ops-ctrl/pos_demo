import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment, getBranchAndCompanyList } from "@/api/departmentApi";
import { getBranches } from "@/api/branchApi"; 
import { getCompanies } from "@/api/getCompaniesApi";

interface Department {
  dep_id: number;
  dep_name: string;
  branch_name?: string;
  company_name?: string;
  branch_id?: number;
  company_id?: number;
}

interface Branch {
  branch_id: number;
  branch_name: string;
}

interface Company {
  company_id: number;
  company_name: string;
}

const Departments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments", error);
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleSaveDepartment = async (depData: Omit<Department, "dep_id">) => {
    try {
      if (editingDepartment) {
        await updateDepartment(
          editingDepartment.dep_id, 
          depData.dep_name, 
          depData.branch_id || 0, 
          depData.company_id || 0
        );
      } else {
        await addDepartment(
          depData.dep_name, 
          depData.branch_id || 0, 
          depData.company_id || 0
        );
      }
      setShowForm(false);
      loadDepartments();
    } catch (error) {
      console.error("Error saving department", error);
      alert("Failed to save department. Please try again.");
    }
  };

  const handleDeleteDepartment = async (depId: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(depId);
        loadDepartments();
      } catch (error) {
        console.error("Error deleting department", error);
        alert("Failed to delete department. Please try again.");
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.dep_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.branch_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Departments</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary" onClick={handleAddDepartment}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search departments..."
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
                <TableHead>Department Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.dep_id}>
                    <TableCell className="font-medium">{dept.dep_name}</TableCell>
                    <TableCell>{dept.branch_name || "-"}</TableCell>
                    <TableCell>{dept.company_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditDepartment(dept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteDepartment(dept.dep_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <DepartmentForm 
          department={editingDepartment} 
          onClose={() => setShowForm(false)} 
          onSave={handleSaveDepartment} 
        />
      )}
    </>
  );
};

const DepartmentForm: React.FC<{
  department: Department | null;
  onClose: () => void;
  onSave: (data: Omit<Department, "dep_id">) => void;
}> = ({ department, onClose, onSave }) => {
  const [dep_name, setDepName] = useState("");
  const [branch_id, setBranchId] = useState<number>(0);
  const [company_id, setCompanyId] = useState<number>(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch branches and companies from their respective APIs
        const [branchesData, companiesData] = await Promise.all([
          getBranches(),
          getCompanies(),
        ]);
        
        setBranches(Array.isArray(branchesData) ? branchesData : []);
        setCompanies(Array.isArray(companiesData) ? companiesData : []);

        // If editing, populate form fields
        if (department) {
          setDepName(department.dep_name || "");
          setBranchId(department.branch_id || 0);
          setCompanyId(department.company_id || 0);
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
        alert("Failed to load branches and companies. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!dep_name.trim()) {
      alert("Please enter department name.");
      return;
    }
    if (!branch_id || branch_id === 0) {
      alert("Please select a branch.");
      return;
    }
    if (!company_id || company_id === 0) {
      alert("Please select a company.");
      return;
    }
    
    onSave({ dep_name: dep_name.trim(), branch_id, company_id });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {department ? "Edit Department" : "Add Department"}
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <Input
                  value={dep_name}
                  onChange={(e) => setDepName(e.target.value)}
                  placeholder="Enter department name"
                  required
                  autoFocus
                />
              </div>

              {/* Branch Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch *
                </label>
                <select
                  value={branch_id}
                  onChange={(e) => setBranchId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <select
                  value={company_id}
                  onChange={(e) => setCompanyId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Select Company</option>
                  {companies.map((company) => (
                    <option key={company.company_id} value={company.company_id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                >
                  {department ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;