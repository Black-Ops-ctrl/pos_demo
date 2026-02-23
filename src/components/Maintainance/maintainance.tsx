import Branch from '@/components/others/Branches';
import Company from '@/components/others/Company';
import Department from '@/components/others/Department';
import Vouchers from '@/components/others/Vouchers';
import SalesPersons from '../sales/SalesPerson';
import Customers from '../sales/Customers';
import Items from '../Maintainance/ItemRateList';
import City from './City';
import Expense from './Expense';
import Region from './Region';
import Vehicles from './Vehicles'; // Import the new Vehicles component
import { useState, useEffect } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '../ui/colorful-tabs';
import { Bike, Briefcase, Building, Car, Cylinder, DollarSign, Globe, MapPin, Sun, User } from 'lucide-react';
import Flock from './Flock';

const getSelectedBranchId = (): string | null => {
    return sessionStorage.getItem("selectedBranchId");
};

const getModuleId = () => {
    const selectedBranchId = getSelectedBranchId();
    const module_id = selectedBranchId && selectedBranchId !== 'N/A'
        ? parseInt(selectedBranchId, 10)
        : null;
    return module_id;
}

const module_id = getModuleId();

const Maintainance: React.FC = () => {
    const [activeTab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('maintainanceActiveTab') || 'branches';
    });

    useEffect(() => {
        sessionStorage.setItem('maintainanceActiveTab', activeTab);
    }, [activeTab]);

    const getBranchesTabName = () => {
        return module_id === 3 ? 'Branch' : 'Main Farms';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto p-6">
                <div className="mb-2">
                    <p className="text-gray-600">Manage your Companies,Branches and Departments</p>
                </div>

                <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
                   <ColorfulTabsList
                        className="grid w-full grid-cols-5 mb-4 overflow-hidden"
                        >
                        <ColorfulTabsTrigger value="company" icon={Building}>Company</ColorfulTabsTrigger>

                        <ColorfulTabsTrigger value="branches" icon={Sun}>
                            {/* {getBranchesTabName()} */}
                            Branches
                        </ColorfulTabsTrigger>
                        
                        <ColorfulTabsTrigger value="city" icon={MapPin}>City</ColorfulTabsTrigger>
                        {/* <ColorfulTabsTrigger value="Expense" icon={MapPin}>Expenses</ColorfulTabsTrigger> */}
                        {/* <ColorfulTabsTrigger value="region" icon={Globe}>Region</ColorfulTabsTrigger> */}
                        
                        {/* {module_id === 2 && (
                            <ColorfulTabsTrigger value="flock" icon={Cylinder}>
                                Flock
                            </ColorfulTabsTrigger>
                        )} */}
                        
                        {/* <ColorfulTabsTrigger value="vehicles" icon={Car}>Transport Vehicle</ColorfulTabsTrigger> */}
                        <ColorfulTabsTrigger value="SalesPersons" icon={Briefcase}>SalesPersons</ColorfulTabsTrigger>
                        <ColorfulTabsTrigger value="Customers" icon={User}>Customers</ColorfulTabsTrigger>
                        {/* <ColorfulTabsTrigger value="Items" icon={DollarSign}>Items Rate List</ColorfulTabsTrigger> */}
                    </ColorfulTabsList>
                    
                    <ColorfulTabsContent value="SalesPersons">
                        <SalesPersons />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="Customers">
                        <Customers />
                    </ColorfulTabsContent>
                    
                    <ColorfulTabsContent value="Items">
                        <Items />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="branches">
                        <Branch />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="city">
                        <City />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="Expense">
                        <Expense />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="region">
                        <Region />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="company">
                        <Company />
                    </ColorfulTabsContent>
                    
                    <ColorfulTabsContent value="flock">
                        <Flock />
                    </ColorfulTabsContent>

                    <ColorfulTabsContent value="vehicles">
                        <Vehicles />
                    </ColorfulTabsContent>
                </ColorfulTabs>
            </div>
        </div>
    );
};

export default Maintainance;