import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment,getBranchAndCompanyList } from "@/api/departmentApi";
import { getBranches } from "@/api/getBranchesApi";
import { getCompanies } from "@/api/getCompaniesApi";

interface Department {
  dep_id: number;
  dep_name: string;
  branch_name?: string;
  company_name?: string;
  branch_id?: number;
  company_id?: number;
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
        await updateDepartment
        (editingDepartment.dep_id, depData.dep_name, depData.branch_id, depData.company_id);
      } else {
        await addDepartment(depData.dep_name, depData.branch_id, depData.company_id);
      }
      setShowForm(false);
      loadDepartments();
    } catch (error) {
      console.error("Error saving department", error);
    }
  };

  const handleDeleteDepartment = async (depId: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(depId);
        loadDepartments();
      } catch (error) {
        console.error("Error deleting department", error);
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
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAddDepartment}>
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
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.dep_id}>
                  <TableCell className="font-medium">{dept.dep_name}</TableCell>
                  <TableCell>{dept.branch_name || "-"}</TableCell>
                  <TableCell>{dept.company_name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditDepartment(dept)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteDepartment(dept.dep_id)}>
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
        <DepartmentForm department={editingDepartment} 
        onClose={() => setShowForm(false)} 
        onSave={handleSaveDepartment} />
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
  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, companiesData] = await Promise.all([
          getBranches(),
          getCompanies(),
        ]);
        setBranches(branchesData);
        setCompanies(companiesData);

        if (department) {
          setDepName(department.dep_name || "");
          setBranchId(department.branch_id || 0);
          setCompanyId(department.company_id || 0);
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dep_name || !branch_id || !company_id) {
      alert("Please fill all fields.");
      return;
    }
    onSave({ dep_name, branch_id, company_id });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {department ? "Edit Department" : "Add Department"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <Input
            value={dep_name}
            onChange={(e) => setDepName(e.target.value)}
            placeholder="Department Name"
          />

          {/* Branch Dropdown */}
          <select
            value={branch_id}
            onChange={(e) => setBranchId(Number(e.target.value))}
            className="w-full border p-2 rounded"
          >
            <option value={0}>Select Branch</option>
            {branches.map((b) => (
              <option key={b.branch_id} value={b.branch_id}>
                {b.branch_name}
              </option>
            ))}
          </select>

          {/* Company Dropdown */}
          <select
            value={company_id}
            onChange={(e) => setCompanyId(Number(e.target.value))}
            className="w-full border p-2 rounded"
          >
            <option value={0}>Select Company</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>
                {c.company_name}
              </option>
            ))}
          </select>

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
export default Departments;
