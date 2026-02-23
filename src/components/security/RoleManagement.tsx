import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Plus, Edit, Trash2, Users, CheckCircle, Slash } from 'lucide-react';
import { addRole, getRoles, updateRole } from '@/api/rolesApi';
import { toast } from '../ui/use-toast';
import { date } from 'zod';


interface Role {
  role_id: number | null;
  role_name: string;
  description: string;
  created_by: number;
  updated_by: number | null;

  // Permissions (int 0/1)
  sales_read: number;
  sales_write: number;
  sales_delete: number;
  sales_export: number;
  sales_approve: number;
  sales_unapprove:number;

  accounting_read: number;
  accounting_write: number;
  accounting_delete: number;
  accounting_export: number;
  accounting_approve: number;
  accounting_unapprove:number;

  hr_read: number;
  hr_write: number;
  hr_delete: number;
  hr_export: number;
  hr_approve: number;

  inventory_read: number;
  inventory_write: number;
  inventory_delete: number;
  inventory_export: number;
  inventory_approve: number;
  inventory_unapprove:number;

  crm_read: number;
  crm_write: number;
  crm_delete: number;
  crm_export: number;
  crm_approve: number;
  crm_unapprove:number;

  purchasing_read: number;
  purchasing_write: number;
  purchasing_delete: number;
  purchasing_export: number;
  purchasing_approve: number;
  purchasing_unapprove:number;

  reports_read: number;
  reports_write: number;
  reports_delete: number;
  reports_export: number;
  reports_approve: number;
  reports_unapprove:number;

  security_read: number;
  security_write: number;
  security_delete: number;
  security_export: number;
  security_approve: number;
  security_unapprove:number;
}

const RoleManagement: React.FC = () => {

const [roles, setRoles] = useState<Role[]>([]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
 const [showForm, setShowForm] = useState(false);
   const [editRole, setEditRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const modules = [
  'Sales',
  'Accounting',
 // 'HR',
  'Inventory',
 // 'CRM',
  'Purchasing',
  'Reports',
  'Security'
];
 

   const loadRoles = async () => {
       try {
         const res = await getRoles();
         setRoles(res.data || res);
       } catch (error) {
         console.error("Error loading users", error);
       }
     };
     useEffect(() => {
       loadRoles();
     }, []);

     const handleAddRole = () => {
    setEditRole(null);
    setShowForm(true);
  };
  const handleEditRole = (role: Role) => {
    setEditRole(role);
    setShowForm(true);
  };

   const handleSaveRole = async (data: Omit<Role, "role">) => {
  try {
    if (editRole) {
      // Update existing role
      await updateRole(
        editRole.role_id,
        data.role_name,
        data.description,
        data.updated_by,

        data.sales_read,
        data.sales_write,
        data.sales_delete,
        data.sales_export,
        data.sales_approve,
        data.sales_unapprove,

        data.accounting_read,
        data.accounting_write,
        data.accounting_delete,
        data.accounting_export,
        data.accounting_approve,
        data.accounting_unapprove,

        data.hr_read,
        data.hr_write,
        data.hr_delete,
        data.hr_export,
        data.hr_approve,

        data.inventory_read,
        data.inventory_write,
        data.inventory_delete,
        data.inventory_export,
        data.inventory_approve,
        data.inventory_unapprove,

        data.crm_read,
        data.crm_write,
        data.crm_delete,
        data.crm_export,
        data.crm_approve,
        data.crm_unapprove,

        data.purchasing_read,
        data.purchasing_write,
        data.purchasing_delete,
        data.purchasing_export,
        data.purchasing_approve,
        data.purchasing_unapprove,

        data.reports_read,
        data.reports_write,
        data.reports_delete,
        data.reports_export,
        data.reports_approve,
        data.reports_unapprove,

        data.security_read,
        data.security_write,
        data.security_delete,
        data.security_export,
        data.security_approve,
        data.security_unapprove
      );

      toast({ title: "Updated", description: "Role updated successfully!" });
    } else {
      // Add new role
      await addRole(
        data.role_name,
        data.description,
        data.created_by,

        data.sales_read,
        data.sales_write,
        data.sales_delete,
        data.sales_export,
        data.sales_approve,
        data.sales_unapprove,

        data.accounting_read,
        data.accounting_write,
        data.accounting_delete,
        data.accounting_export,
        data.accounting_approve,
        data.accounting_unapprove,

        data.hr_read,
        data.hr_write,
        data.hr_delete,
        data.hr_export,
        data.hr_approve,

        data.inventory_read,
        data.inventory_write,
        data.inventory_delete,
        data.inventory_export,
        data.inventory_approve,
        data.inventory_unapprove,

        data.crm_read,
        data.crm_write,
        data.crm_delete,
        data.crm_export,
        data.crm_approve,
        data.crm_unapprove,


        data.purchasing_read,
        data.purchasing_write,
        data.purchasing_delete,
        data.purchasing_export,
        data.purchasing_approve,
        data.purchasing_unapprove,


        data.reports_read,
        data.reports_write,
        data.reports_delete,
        data.reports_export,
        data.reports_approve,
        data.reports_unapprove,

        data.security_read,
        data.security_write,
        data.security_delete,
        data.security_export,
        data.security_approve,
        data.security_unapprove
      );

      toast({ title: "Created", description: "Role created successfully!" });
    }

    setShowForm(false);
    loadRoles();
  } catch (error) {
    console.error("Error saving role", error);
    toast({
      title: "Error",
      description: "Failed to save role",
      variant: "destructive",
    });
  }
};


  const filteredRoles = roles.filter(role => 
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionCount = (role: Role): number => {
    const values = Object.values(role);
    return values.filter(val => val === 1).length;
};
const getModulePermissionCount = (role: Role, module: string): number => {
    // 1. Convert module name to the lowercase prefix (e.g., 'Sales' -> 'sales')
    const prefix = module.toLowerCase();

    // 2. Define the 5 standard actions
    const actions = ['read', 'write', 'delete', 'export', 'approve','unapprove'];

    // 3. Calculate the count by summing up the values (0 or 1)
    return actions.reduce((count, action) => {
        const key = `${prefix}_${action}`;
        
        // Use type assertion to safely access the property value
        const permissionValue = role[key as keyof Role]; 
        
        // If the value is 1, add it to the count. Otherwise, add 0.
        // We ensure the value is treated as a number for safety.
        return count + (Number(permissionValue) === 1 ? 1 : 0);
    }, 0);
};

// Assuming max permissions per module is 5
const MAX_PERMISSIONS = 6;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role Management</h2>
            <Button
            onClick={handleAddRole}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>                  
            </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Roles ({filteredRoles.length})
            </CardTitle>
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">Role List</TabsTrigger>
              <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                   
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.role_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.role_name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </TableCell>
                     
                     
                      <TableCell>
                        <Badge variant="secondary">
                          {getPermissionCount(role)} permissions
                        </Badge>
                      </TableCell>
                     
                      <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditRole(role)}>
                      <Edit className="h-4 w-4" />
                      </Button>
                      
                      
                    </div>
                    
                  </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
        <TabsContent value="matrix">
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Role</TableHead>
                    {/* Headers remain the same */}
                    {modules.map(module => (
                        <TableHead key={module} className="text-center">{module}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* NOTE: I've updated role.id to role.role_id and role.name to role.role_name 
                  to align with the standard 'Role' interface used in previous answers.
                  Please adjust role.role_id and role.role_name if your Role interface 
                  still uses 'id' and 'name'.
                */}
                {filteredRoles.map((role) => (
                    <TableRow key={role.role_id}>
                        <TableCell className="font-medium">{role.role_name}</TableCell>
                        
                        {modules.map(module => {
                            // 💡 Use the new helper function to calculate the granted permissions
                            const grantedCount = getModulePermissionCount(role, module);
                            const permCount = grantedCount; // Use grantedCount for clarity
                            
                            // 💡 Determine the Badge variant based on the count, matching your image style
                            let variant: 'default' | 'secondary' | 'outline' = 'outline';
                            if (permCount === MAX_PERMISSIONS) {
                                variant = 'default'; // Blue background for 5/5
                            } else if (permCount >= 1) {
                                variant = 'secondary'; // Lighter background for partial access (1/5 to 4/5)
                            }
                            // If permCount is 0, it defaults to 'outline'
                            
                            return (
                                <TableCell key={module} className="text-center">
                                    <Badge variant={variant} className={permCount === 0 ? 'text-gray-400 border-gray-200' : ''}>
                                        {permCount}/{MAX_PERMISSIONS}
                                    </Badge>
                                </TableCell>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
       {
       showForm && (
        <RoleForm 
        role={editRole}
         onClose={() => setShowForm(false)}
          onSave={handleSaveRole}        
        
         />
      )}
    </div>
  );
};
const actions = ["read", "write", "delete", "export", "approve","unapprove"];
const modules = ['sales', 'accounting', 
  //'hr', 
   'inventory',
   // 'crm', 
    'purchasing', 'reports', 'security'];
const RoleForm: React.FC<{
  role: Role | null;
  onClose: () => void;
  onSave: (data: Omit<Role, "role">) => void;
}> = ({ role, onClose, onSave }) => {
  const [role_name, setRoleName] = useState("");
  const [description, setDescription] = useState("");
 const [permissions, setPermissions] = useState<Record<string, 0 | 1>>({});

  useEffect(() => {
    if (role) {
      setRoleName(role.role_name || "");
      setDescription(role.description || "");

      const loadedPermissions: Record<string, 0 | 1> = {};
      modules.forEach((mod) => {
  actions.forEach((act) => {
   const key = `${mod.toLowerCase()}_${act}`;
   role[key as keyof Role];
const value = role[key as keyof Role];
loadedPermissions[key] = value === 1 ? 1 : 0;
  });
});

      setPermissions(loadedPermissions);
    } else {
      // Default permissions to 0
      const initialPermissions: Record<string, 0 | 1> = {};
      modules.forEach((mod) =>
        actions.forEach((act) => {
          initialPermissions[`${mod}_${act}`] = 0;
        })
      );
      setPermissions(initialPermissions);
    }
  }, [role]);

   const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };


 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role_name || !description) {
      alert("Please fill all fields.");
      return;
    }

    
    const permissionFields: Partial<Role> = {};
    modules.forEach((mod) =>
      actions.forEach((act) => {
        const key = `${mod.toLowerCase()}_${act}`;
       
        permissionFields[key] = permissions[key] ?? 0;
      })
    );

    const payload: Omit<Role, "role"> = {
      role_id: role?.role_id ?? null,
      role_name,
      description,
      created_by: role?.created_by ?? 1,
      updated_by: role ? 1 : null,
      // Permissions
      sales_read: permissionFields.sales_read ?? 0,
      sales_write: permissionFields.sales_write ?? 0,
      sales_delete: permissionFields.sales_delete ?? 0,
      sales_export: permissionFields.sales_export ?? 0,
      sales_approve: permissionFields.sales_approve ?? 0,
      sales_unapprove: permissionFields.sales_unapprove ?? 0,


      accounting_read: permissionFields.accounting_read ?? 0,
      accounting_write: permissionFields.accounting_write ?? 0,
      accounting_delete: permissionFields.accounting_delete ?? 0,
      accounting_export: permissionFields.accounting_export ?? 0,
      accounting_approve: permissionFields.accounting_approve ?? 0,
      accounting_unapprove: permissionFields.accounting_unapprove ?? 0,

      hr_read: permissionFields.hr_read ?? 0,
      hr_write: permissionFields.hr_write ?? 0,
      hr_delete: permissionFields.hr_delete ?? 0,
      hr_export: permissionFields.hr_export ?? 0,
      hr_approve: permissionFields.hr_approve ?? 0,

      inventory_read: permissionFields.inventory_read ?? 0,
      inventory_write: permissionFields.inventory_write ?? 0,
      inventory_delete: permissionFields.inventory_delete ?? 0,
      inventory_export: permissionFields.inventory_export ?? 0,
      inventory_approve: permissionFields.inventory_approve ?? 0,
      inventory_unapprove: permissionFields.inventory_unapprove ?? 0,

      crm_read: permissionFields.crm_read ?? 0,
      crm_write: permissionFields.crm_write ?? 0,
      crm_delete: permissionFields.crm_delete ?? 0,
      crm_export: permissionFields.crm_export ?? 0,
      crm_approve: permissionFields.crm_approve ?? 0,
      crm_unapprove: permissionFields.crm_unapprove ?? 0,

      purchasing_read: permissionFields.purchasing_read ?? 0,
      purchasing_write: permissionFields.purchasing_write ?? 0,
      purchasing_delete: permissionFields.purchasing_delete ?? 0,
      purchasing_export: permissionFields.purchasing_export ?? 0,
      purchasing_approve: permissionFields.purchasing_approve ?? 0,
      purchasing_unapprove: permissionFields.purchasing_unapprove ?? 0,

      reports_read: permissionFields.reports_read ?? 0,
      reports_write: permissionFields.reports_write ?? 0,
      reports_delete: permissionFields.reports_delete ?? 0,
      reports_export: permissionFields.reports_export ?? 0,
      reports_approve: permissionFields.reports_approve ?? 0,
      reports_unapprove: permissionFields.reports_unapprove ?? 0,

      security_read: permissionFields.security_read ?? 0,
      security_write: permissionFields.security_write ?? 0,
      security_delete: permissionFields.security_delete ?? 0,
      security_export: permissionFields.security_export ?? 0,
      security_approve: permissionFields.security_approve ?? 0,
      security_unapprove: permissionFields.security_unapprove ?? 0,
    };

    onSave(payload);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {role ? "Edit Role" : "Add Role"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username and Email */}
          <div className="flex space-x-4">
             <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">Role Name</span>
          <Input
            value={role_name}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Role Name"
          />
          </div>
          <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-700">Description</span>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          </div>
          </div>
          {/* Permissions Grid */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Permissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm text-center">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">Module</th>
                    {actions.map((action) => (
                      <th key={action} className="border px-2 py-1 capitalize">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                 {modules.map((module) => (
  <tr key={module}>
    <td className="border px-2 py-1 text-left capitalize">
      {module}
    </td>
    {actions.map((action) => {
      const key = `${module.toLowerCase()}_${action}`;   // FIX HERE
      return (
        <td key={key} className="border px-2 py-1">
          <input
            type="checkbox"
            checked={permissions[key] === 1}
            onChange={() => togglePermission(key)}
          />
        </td>
      );
    })}
  </tr>
))}
                </tbody>
              </table>
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

export default RoleManagement;