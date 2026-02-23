import React, { useEffect, useMemo, useState ,useCallback} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Building2, Loader2, ArrowUp } from "lucide-react";
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
      const [showScrollToTop, setShowScrollToTop] = useState(false); // ✅ New state for scroll button
  
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
  
  // Filtered companies based on search (using useMemo for performance)
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      company.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (company.registration_number?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [companies, search]);


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
        // When updating, 'image' might be undefined (no change) or a new base64 string
        await updateCompany(
          editingCompany.company_id,
          company_data.company_name,
          company_data.registration_number || "",
          company_data.address || "",
          company_data.phone || "",
          company_data.email || "",
          company_data.image // This will be the new base64 or the old one, or undefined/null
        );
      } else {
        // When adding, 'image' will be a new base64 string or undefined/null
        await addCompany(
          company_data.company_name,
          company_data.registration_number || "",
          company_data.address || "",
          company_data.phone || "",
          company_data.email || "",
          company_data.image
        );
      }
      setOpen(false);
      loadCompanies();
    } catch (error) {
      console.error("Error saving department", error);
      alert(`Error saving company: ${error instanceof Error ? error.message : "An unknown error occurred"}`);
      throw error; // Re-throw the error so CompanyForm can catch it and reset loading state
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
            {/* <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add Company
            </Button> */}
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
              {filteredCompanies.map((c) => (
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
                        alt={`${c.company_name} logo`}
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
                      <Button variant="outline" size="sm" onClick={() => handleDelete(c.company_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                    No companies found.
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
                  className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg 
                             bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              )}
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

// --- CompanyForm Component ---
const CompanyForm: React.FC<{
  company: Company | null;
  onClose: () => void;
  onSave: (data: Omit<Company, "company_id">) => Promise<void>; // Updated return type to Promise<void>
}> = ({ company, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [registration_number, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  // Sync form state with "initial" prop (for edit)
  useEffect(() => {
    // Only set the state if a company is being edited
    if (company) {
      setName(company.company_name || "");
      setRegistrationNumber(company.registration_number || "");
      setAddress(company.address || "");
      setPhone(company.phone || "");
      setEmail(company.email || "");
      setImageFile(null); // Reset file input
      // Set preview URL to existing image if it exists
      if (company.image) {
        setPreviewUrl(company.image);
      } else {
        setPreviewUrl(null);
      }
    } else {
        // Reset for add
        setName("");
        setRegistrationNumber("");
        setAddress("");
        setPhone("");
        setEmail("");
        setImageFile(null);
        setPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]); // Added dependency for safety

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
        alert("Please enter the company name.");
        return;
    }

    setIsLoading(true); // Start loading

    const data: Omit<Company, "company_id"> = {
      company_name: name,
      registration_number,
      address,
      phone,
      email,
      image: previewUrl || undefined, // Start with existing image/null
    };

    const saveData = async (finalData: Omit<Company, "company_id">) => {
      try {
        await onSave(finalData);
        // Loading is reset in the finally block after onSave successfully closes the dialog
      } catch (error) {
        console.error("Save operation failed in form:", error);
        // Keep the dialog open, reset loading state
        setIsLoading(false); 
      }
    };

    // --- Image Handling Logic ---
    if (imageFile) {
      // 1. New image file selected: Convert to Base64 and save
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageBase64 = reader.result as string;
        saveData({ ...data, image: imageBase64 }); // Override image with new Base64 string
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        alert("Could not read image file.");
        setIsLoading(false); // Stop loading on file read error
      };
      reader.readAsDataURL(imageFile);
    } else {
      // 2. No new file selected: Save with the existing 'previewUrl' which holds the current image (or null/undefined)
      saveData(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* Used a plain div for the modal container for simplicity, Dialog/DialogContent is not being used as per the original structure */}
      <div className="bg-white p-6 rounded-lg w-[650px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {company ? "Edit Company" : "Add Company"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="flex flex-col flex-1">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={registration_number}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} />
            </div>
            <div className="flex flex-col flex-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
            </div>
          </div>
          <div >
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading}
              style={{ width: '300px' }}
            />
          </div>
          <div>
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setPreviewUrl(reader.result as string);
                  reader.readAsDataURL(file);
                } else {
                  // If a file is cleared, revert to the original image if editing, otherwise clear.
                  setPreviewUrl(company?.image || null); 
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600"
              disabled={isLoading} // Disable button while loading
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

export default CompanyComponent;  