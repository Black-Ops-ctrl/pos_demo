import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Edit, Lock, Unlock, Shield, Users, Download, Upload, ChevronsUpDown, Check } from 'lucide-react';
import { getUsers,addUser,updateUser, LockStatus, ChangeStatus  } from '@/api/usersApi';
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
import { getBranches } from '@/api/branchApi';
import { getCompanies } from '@/api/companyApi';
import { getRoles } from '@/api/rolesApi';
import { getDepartments } from '@/api/departmentApi';
import { emit } from 'process';
import { toast } from '../ui/use-toast';

interface User {
  user_id: number;
  user_name: string;
  email: string;
  full_name: string;
  password:string;
  dep_id: number,
  dep_name: string,
  branch_id:number,
  branch_name:string,
  role_id:number,
  role_name :string,
  status:string,
  created_by:number,
  creation_date:Date,
  updated_by:number,
  updated_date: Date,
  mfaEnabled :boolean
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  //  Fetch users list
 const loadusers = async () => {
     try {
       const res = await getUsers();
       setUsers(res.data || res);
     } catch (error) {
       console.error("Error loading users", error);
     }
   };
   useEffect(() => {
     loadusers();
   }, []);
const handleAddUser = () => {
    setEditUser(null);
    setShowForm(true);
  };
  const handleEdituser = (user: User) => {
    setEditUser(user);
    setShowForm(true);
  };
  const handleSaveUser = async (data: Omit<User, "user">) => {
    try {
      if (editUser) {
        await updateUser(
          editUser.user_id,
          data.full_name,
          data.user_name,
          data.email,
          data.password,
          data.dep_id,
          data.branch_id,
          data.role_id,
          data.status,
          data.updated_by
        );
        toast({ title: "Updated", description: "User updated successfully!" });
      } else {
        await addUser(
          data.full_name,
          data.user_name,
          data.email,
          data.password,
         
          data.dep_id,
           data.branch_id,
          data.role_id,
          data.created_by
        );
        toast({ title: "Created", description: "User created successfully!" });
      }
      setShowForm(false);
      loadusers();
    } catch (error) {
      console.error("Error saving User", error);
      toast({ title: "Error", description: "Failed to save User", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_name .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

 
  
const handleUserStatusToggle = async (userId: number) => {
  try {
    // Find the current user in state
    const u = users.find((x) => x.user_id === userId);
    if (!u) return;

    // Toggle status
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Replace with logged-in user's id when available
    const currentUserId = 1; 

    // Call your API
    await ChangeStatus(userId, newStatus, currentUserId);

    // Update UI only if backend succeeds
    setUsers((prev) =>
      prev.map((x) =>
        x.user_id === userId ? { ...x, status: newStatus } : x
      )
    );

    toast({
      title: "Success",
      description: `User status changed to ${newStatus}`,
    });
  } catch (err) {
    console.error("Error changing user status", err);
    toast({
      title: "Error",
      description: "Failed to update user status",
      variant: "destructive",
    });
  }
};

const handleUserLock = async (userId: number) => {
  try {
    // Find the current user in state
    const u = users.find((x) => x.user_id === userId);
    if (!u) return;
    // Toggle status
    const newStatus = u.status === "LOCKED" ? "ACTIVE" : "LOCKED";
    // Replace with logged-in user's id when available
    const currentUserId = 1; 
    // Call your Function
    await LockStatus(userId, newStatus, currentUserId);
    // Update UI only if backend succeeds
    setUsers((prev) =>
      prev.map((x) =>
        x.user_id === userId ? { ...x, status: newStatus } : x
      )
    );

    toast({
      title: "Success",
      description: `User status changed to ${newStatus}`,
    });
  } catch (err) {
    console.error("Error changing user status", err);
    toast({
      title: "Error",
      description: "Failed to update user status",
      variant: "destructive",
    });
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-200 text-green-800';
      case 'INACTIVE': return 'bg-gray-300 text-gray-800';
      case 'LOCKED': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

 
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2 ">
          {/* <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Users
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button> */}
        
              <Button onClick={handleAddUser}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
           
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({filteredUsers.length})
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creation Date</TableHead>
                 {/* 
                <TableHead>MFA</TableHead>
                */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">@{user.user_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{user.dep_name}</div>
                      <div className="text-xs text-gray-500">{user.branch_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-wrap gap-1">
                      {
                        <Badge key={user.role_id} variant="default" className="text-xs">
                          {user.role_name}
                        </Badge>
                      }
                    </div>
                  </TableCell>
                   <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     {new Date(user.creation_date ).toLocaleString('en-PK',
                         {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}
                  </TableCell>
                 
                 {/*
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={user.mfaEnabled}  />
                      <span className="text-sm">{user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </TableCell>
                 */}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEdituser(user)}>
                      <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserLock(user.user_id)}
                      >
                        {user.status === 'Locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserStatusToggle(user.user_id)}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                    
                  </TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {
       showForm && (
        <UserForm user={editUser} onClose={() => setShowForm(false)} onSave={handleSaveUser} />
      )}
    </div>
  );
};
const UserForm: React.FC<{
  user: User | null;
  onClose: () => void;
  onSave: (data: Omit<User, "user">) => void;
}> = ({ user, onClose, onSave }) => {
  const [user_name, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [full_name, setFullName] = useState("");
  const [password, setPassword] = useState("");

  

  const [branch_id, setBranchId] = useState<number >(0);
   const [branches, setBranches] = useState([]);
  const [branchOpen, setBranchOpen] = useState(false);

  const [dep_id, setDepartmentId] = useState<number >(0);
  const [departments, setDepartments] = useState([]);
  const [departmentOpen, setDepartmentOpen] = useState(false);

  const [role_id, setRoleId] = useState<number >(0);
   const [roles, setRoles] = useState([]);
  const [roleOpen, setRoleOpen] = useState(false);


  // Fetch categories
useEffect(() => {
  const fetchData = async () => {
    try {
      const [branchData, departmentData, rolesData] = await Promise.all([
        getBranches(),
        getDepartments(),
        getRoles()
      ]);

      setBranches(branchData);
      setDepartments(departmentData);
      setRoles(rolesData);

      // set user values AFTER lists are ready
      if (user) {
        setUserName(user.user_name ?? "");
        setEmail(user.email ?? "");
        setFullName(user.full_name ?? "");

        setBranchId(Number(user.branch_id));
        setDepartmentId(Number(user.dep_id));
        setRoleId(Number(user.role_id));
      }
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  fetchData();
}, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_name || !email || !full_name || !branch_id  || !dep_id || !role_id) {
      alert("Please fill all fields.");
      return;
    }
      // Check password only when adding
    if (!user && !password) {
      alert("Password is required for new user.");
      return;
    }
    onSave({
      user_name,
      email,
      full_name,
      branch_id,
      dep_id,
      role_id,
      created_by: 0,
      updated_by: 0,
      password: user ? "" : password,
      user_id: user ? user.user_id : 0,
      dep_name: '',
      branch_name: '',
      role_name: '',
      status: '',
      creation_date: undefined,
      updated_date: undefined,
      mfaEnabled: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {user ? "Edit User" : "Add User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username and Email */}
          <div className="flex space-x-4">
             <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">User Name</span>
          <Input
            value={user_name}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="User Name"
          />
          </div>
          <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          </div>
          </div>
         {/* Username and Email End */}


         {/* Full name and Password */}
        <div className="flex space-x-4">
  <div className="flex flex-col flex-1">
    <span className="text-sm font-medium text-gray-700">Full Name</span>
    <Input
      value={full_name}
      onChange={(e) => setFullName(e.target.value)}
      placeholder="Full Name"
    />
  </div>

  {/* Keep column reserved even when password is hidden */}
  <div className="flex flex-col flex-1">
    {!user ? (
      <>
        <span className="text-sm font-medium text-gray-700">Password</span>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </>
    ) : (
      <div className="h-full" />  
    )}
  </div>
</div>
 {/* Full name and Password End */}


           <div className="flex space-x-4">
             <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">Department</span>
           <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
                      <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {dep_id
                  ? `${departments.find((d) => d.dep_id === dep_id)?.dep_name}`
                  : "Select Department"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command >
                <CommandInput placeholder="Search designation..." className="text-black" />
                <CommandEmpty >No Department found.</CommandEmpty>
                <CommandGroup>
                  {departments.map((d) => (
                    <CommandItem
                      key={d.dep_id}
                      className="hover:bg-gray-100"
                      onSelect={() => {
                        setDepartmentId(d.dep_id);
                        setDepartmentOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                           "mr-2 h-4 w-4",
                          dep_id === d.dep_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {d.dep_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          </div>
           <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">Branch</span>
         <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                      <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {branch_id
                  ? `${branches.find((br) => br.branch_id === branch_id)?.branch_name}`
                  : "Select Branch"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command >
                <CommandInput placeholder="Search branches..." className="text-black" />
                <CommandEmpty >No branch found.</CommandEmpty>
                <CommandGroup>
                  {branches.map((br) => (
                    <CommandItem
                      key={br.branch_id}
                      className="hover:bg-gray-100"
                      onSelect={() => {
                        setBranchId(br.branch_id);
                        setBranchOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                           "mr-2 h-4 w-4",
                          branch_id === br.branch_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {br.branch_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          </div>
          </div>
                     <div className="flex space-x-4">
                  <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">Role</span>
          
        <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                      <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {role_id
                  ? `${roles.find((r) => r.role_id === role_id)?.role_name}`
                  : "Select Role"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-auto">
              <Command >
                <CommandInput placeholder="Search roles..." className="text-black" />
                <CommandEmpty >No role found.</CommandEmpty>
                <CommandGroup>
                  {roles.map((r) => (
                    <CommandItem
                      key={r.role_id}
                      className="hover:bg-gray-100"
                      onSelect={() => {
                        setRoleId(r.role_id);
                        setRoleOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                           "mr-2 h-4 w-4",
                          role_id === r.role_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {r.role_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          </div>
           <div className="flex flex-col flex-1">
          {/* Region Popover */}
          
          </div>
          </div>
           <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600">
                        Save
                      </Button>
                    </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
