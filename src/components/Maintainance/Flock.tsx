import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getDepartments, addDepartment, updateDepartment, deleteDepartment,getBranchAndCompanyList } from "@/api/departmentApi";


import { addFlock, deleteFlock, getFlock, updateFlock } from "@/api/flockApi";
import { Plus, Search, Edit, Trash2, Building2, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GenericForm from "@/components/forms/GenericForm";
import { getItemCategory, addItemCategory, updateItemCategory, deleteItemCategory } from "@/api/itemCategoryApi";
import { getAccounts } from "@/api/getAccountsApi";
import { getRegions } from "@/api/salesPersonApi";
import { getSalesPersons,addSalePerson,updateSalePerson,deleteSalePerson } from "@/api/salesPersonApi";
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
import { getBranches } from "@/api/branchApi";
import { getCompanies } from "@/api/companyApi";
import { getDesignations } from "@/api/getDesignationApi";
import { set } from "react-hook-form";
import { getCity } from "@/api/cityApi";


interface Flock {
  flock_id: number;
  flock_name: string;
  branch_id?: number;
  branch_name?: string;
  company_id?: number;
  company_name?: string;
  city_id:number;
  city_name:string;
  region_id:number;
  region_name:string;
  stock:number;
  qty:number;
  
}

const Flock: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFlock, setEditingFlock] = useState<Flock | null>(null);
  const [flocks, setFlocks] = useState<Flock[]>([]);

  // Load flocks on mount
  useEffect(() => {
    loadFlocks();
  }, []);

  const loadFlocks = async () => {
    try {
      const data = await getFlock();
      setFlocks(data);
    } catch (error) {
      console.error("Error loading Flocks", error);
    }
  };

  const handleAddFlock = () => {
    setEditingFlock(null);
    setShowForm(true);
  };

  const handleEditFlock = (flock: Flock) => {
    setEditingFlock(flock);
    setShowForm(true);
  };

const handleSaveflock = async (flockData: Omit<Flock, "flock_id">) => {
  try {
    if (editingFlock) {
      await updateFlock(
        editingFlock.flock_id,
        flockData.flock_name,
        Number(flockData.qty),
        flockData.branch_id!,
        Number(flockData.stock),
        flockData.city_id,
        flockData.region_id
      );
    } else {
      await addFlock(
        flockData.flock_name,
        Number(flockData.qty),
        flockData.branch_id!,
        Number(flockData.stock),
        flockData.city_id,
        flockData.region_id
      );
    }

    setShowForm(false);
    loadFlocks();
  } catch (error) {
    console.error("Error saving Flock", error);
  }
};

  const handleDeleteFlock = async (flock_id: number) => {
    if (confirm("Are you sure you want to delete this Flock?")) {
      try {
        await deleteFlock(flock_id);
        loadFlocks();
      } catch (error) {
        console.error("Error deleting Flock", error);
      }
    }
  };

  const filteredFlocks = flocks.filter((flock) =>
    flock.flock_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flocks</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAddFlock}>
              <Plus className="h-4 w-4 mr-2" />
              Add Flock
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search flocks..."
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
      <TableHead>Flock Name</TableHead>
     
      <TableHead>Branch</TableHead>
      {/* <TableHead>Company</TableHead> */}
      <TableHead>City</TableHead>
      <TableHead>Region</TableHead>
       <TableHead>Qty</TableHead>
      <TableHead>Stock</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredFlocks.map((flock) => (
      <TableRow key={flock.flock_id}>
        <TableCell className="font-medium">{flock.flock_name}</TableCell>
       
        <TableCell>{flock.branch_name || "-"}</TableCell>
        {/* <TableCell>{flock.company_name || "-"}</TableCell> */}
        <TableCell>{flock.city_name || "-"}</TableCell>
        <TableCell>{flock.region_name || "-"}</TableCell>
         <TableCell>{flock.qty}</TableCell>
        <TableCell>{flock.stock}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditFlock(flock)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteFlock(flock.flock_id)}
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
        <FlockForm flock={editingFlock} 
        onClose={() => setShowForm(false)} 
         onSave={handleSaveflock}
         />
      )}
    </>
  );
};
const FlockForm: React.FC<{
  flock: Flock | null;
  onClose: () => void;
  onSave: (data: Omit<Flock, "flock_id">) => void;
}> = ({ flock, onClose, onSave }) => {
  const [flock_name, setFlockName] = useState("");
  const [qty, setQty] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  const [company_id, setCompanyId] = useState<number>(0);
  const [branch_id, setBranchId] = useState<number>(0);
  const [region_id, setRegionId] = useState<number>(0);
  const [city_id, setCityId] = useState<number>(0);

  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);

  const [branchOpen, setBranchOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, companiesData, regionsData, citiesData] =
          await Promise.all([
            getBranches(),
            getCompanies(),
            getRegions(),
            getCity(),
          ]);

        setBranches(branchesData);
        setCompanies(companiesData);
        setRegions(regionsData);
        setCities(citiesData);

        if (flock) {
          setFlockName(flock.flock_name || "");
          setQty(Number(flock.qty));
          setStock(Number(flock.stock));
          setCompanyId(flock.company_id || 0);
          setBranchId(flock.branch_id || 0);
          setRegionId(flock.region_id || 0);
          setCityId(flock.city_id || 0);
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [flock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flock_name || !branch_id || !company_id || !region_id || !city_id) {
      alert("Please fill all required fields.");
      return;
    }
    onSave({
      flock_name,
      qty,
      stock,
      company_id,
      branch_id,
      region_id,
      region_name: regions.find((r) => r.region_id === region_id)?.region_name || "",
      city_id,
      city_name: cities.find((c) => c.city_id === city_id)?.city_name || "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-lg w-[700px]">
    <h2 className="text-lg font-semibold mb-4">
      {flock ? "Edit Flock" : "Add Flock"}
    </h2>
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="flex gap-4 mb-4">
        {/* Company Dropdown */}
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">Company</span>
          <select
            value={company_id}
            onChange={(e) => setCompanyId(Number(e.target.value))}
            className="w-full border p-2 rounded mt-1"
          >
            <option value={0}>Select Company</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* Flock Name */}
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">Flock Name</span>
          <Input
            value={flock_name}
            onChange={(e) => setFlockName(e.target.value)}
            placeholder="Flock Name"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        {/* Quantity */}
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            placeholder="Quantity"
            className="mt-1"
          />
        </div>

        {/* Stock */}
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">Stock</span>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="Stock"
            className="mt-1"
          />
        </div>
      </div>

      {/* Branch Dropdown */}
      <span className="text-sm font-medium text-gray-700">Branch</span>
      <Popover open={branchOpen} onOpenChange={setBranchOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {branch_id
              ? branches.find((br) => br.branch_id === branch_id)?.branch_name
              : "Select Branch"}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[300px] overflow-auto">
          <Command>
            <CommandInput placeholder="Search branches..." className="text-black" />
            <CommandEmpty>No branch found.</CommandEmpty>
            <CommandGroup>
              {branches.map((br) => (
                <CommandItem
                  key={br.branch_id}
                  onSelect={() => {
                    setBranchId(br.branch_id);
                    setBranchOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", branch_id === br.branch_id ? "opacity-100" : "opacity-0")}
                  />
                  {br.branch_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Region Dropdown */}
      <span className="text-sm font-medium text-gray-700">Region</span>
      <Popover open={regionOpen} onOpenChange={setRegionOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {region_id
              ? regions.find((r) => r.region_id === region_id)?.region_name
              : "Select Region"}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[300px] overflow-auto">
          <Command>
            <CommandInput placeholder="Search region..." className="text-black" />
            <CommandEmpty>No region found.</CommandEmpty>
            <CommandGroup>
              {regions.map((r) => (
                <CommandItem
                  key={r.region_id}
                  onSelect={() => {
                    setRegionId(r.region_id);
                    setRegionOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", region_id === r.region_id ? "opacity-100" : "opacity-0")}
                  />
                  {r.region_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* City Dropdown */}
      <span className="text-sm font-medium text-gray-700">City</span>
      <Popover open={cityOpen} onOpenChange={setCityOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {city_id
              ? cities.find((c) => c.city_id === city_id)?.city_name
              : "Select City"}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[300px] overflow-auto">
          <Command>
            <CommandInput placeholder="Search cities..." className="text-black" />
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {cities.map((c) => (
                <CommandItem
                  key={c.city_id}
                  onSelect={() => {
                    setCityId(c.city_id);
                    setCityOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", city_id === c.city_id ? "opacity-100" : "opacity-0")}
                  />
                  {c.city_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600">
          Save
        </Button>
      </div>
    </form>
  </div>
</div>

  );
};

export default Flock;

