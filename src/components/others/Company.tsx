import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react";
import { getCompanies, addCompany, updateCompany, deleteCompany } from "@/api/companyApi";

// Company type
export interface Company {
  company_id: number;
  company_name: string;
  registration_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  image?: string; 
}

const CompanyComponent: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Load companies
  useEffect(() => {
    loadCompanies();
    
  }, []);
  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
      console.log(data);
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };



  const handleAdd = () => {
    setEditingCompany(null);
    setOpen(true);
  };

  const handleEdit = (c: Company) => {
    setEditingCompany(c);
    setOpen(true);
  };

  const handleDelete = async (company_id: number) => {
    if (confirm("Delete this company?")) {
      try {
        await deleteCompany(company_id);
        setCompanies((prev) => prev.filter((c) => c.company_id !== company_id));
      } catch (error) {
        console.error("Error deleting company:", error);
        alert("Failed to delete company.");
      }
    }
  };

 const handleSave = async (company_data: Omit<Company, "company_id">) => {
     try {
       if (editingCompany) {
         await updateCompany(
           editingCompany.company_id,
           company_data.company_name,
           company_data.registration_number,
           company_data.address,
           company_data.phone,
           company_data.email,
           company_data.image,
         );
       } else {
         await addCompany(
           company_data.company_name,
           company_data.registration_number,
           company_data.address,
           company_data.phone,
           company_data.email,
           company_data.image
         );
       }
       setOpen(false);
       loadCompanies();
     } catch (error) {
       console.error("Error saving department", error);
     }
   };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company
            </CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add Company
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reg. No.</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.company_id}>
                  <TableCell>{c.company_name}</TableCell>
                  <TableCell>{c.registration_number || "-"}</TableCell>
                  <TableCell>{c.address || "-"}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>
                  <TableCell>{c.email || "-"}</TableCell>
                  <TableCell>
  {c.image ? (
    <img
     src={c.image}
      
      className="h-10 w-10 rounded object-cover border"
    />
  ) : (
    <span className="text-gray-400 italic text-sm">No Image</span>
  )}
</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/*
                      <Button variant="outline" size="sm" onClick={() => handleDelete(c.company_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      */ }
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                    No companies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       {open && (
        <CompanyForm
          company={editingCompany}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

const CompanyForm: React.FC<{
 company: Company | null;
  onClose: () => void;
  onSave: (data: Omit<Company, "company_id">) => void;
}> = ({ company, onClose, onSave  }) => {
  const [name, setName] = useState("");
  const [registration_number, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync form state with "initial" prop
   useEffect(() => {
     const fetchData = async () => {
       try {
         
        
 
         if (company) {
           setName(company.company_name || "");
           setRegistrationNumber(company.registration_number || "");
           setAddress(company.address || "");
           setPhone(company.phone || "");
           setEmail(company.email || "");
           setImageFile(null);
           if (company.image) {
             setPreviewUrl(company.image);
           } else {
             setPreviewUrl(null);
           }
         }
       } catch (err) {
         console.error("Error loading dropdown data", err);
       }
     };
     fetchData();
   }, [company]);

  

  const submit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim() || !registration_number || !address || !email || !phone || !imageFile) {
    alert("Please fill all fields.");
    return;
  }


  // Convert imageFile to base64 if present
  let imageBase64: string | undefined = undefined;
  if (imageFile) {
    const reader = new FileReader();
    reader.onloadend = () => {
      imageBase64 = reader.result as string;
      onSave({
        company_name: name,
        registration_number,
        address,
        phone,
        email,
       image: imageBase64,
      });
    };
    reader.readAsDataURL(imageFile);
    return;
  }

  onSave({
    company_name: name,
    registration_number,
    address,
    phone,
    email,
    image: undefined,
  });
};

  return (
   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[650px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {company ? "Edit Company" : "Add Company"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex space-x-4">
          <div className="flex flex-col flex-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col flex-1">
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input
              id="registration_number"
              value={registration_number}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </div>
          </div>
          <div className="flex space-x-4">
          <div className="flex flex-col flex-1">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="flex flex-col flex-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          </div>
          <div >
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
             style={{ width: '300px' }}/>
          </div>
          <div>
  <Label htmlFor="image">Image</Label>
  <Input
    id="image"
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;
      setImageFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }}
  />
  {previewUrl && (
    <img
      src={previewUrl}
      alt="Preview"
      className="mt-2 max-h-32 rounded border border-gray-300"
    />
  )}
</div>
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

export default CompanyComponent;
