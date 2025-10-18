import Branch from '@/components/others/Branches';
import Company from '@/components/others/Company';
import Department from '@/components/others/Department';
import Vouchers from '@/components/others/Vouchers';
import SalesPersons from '../sales/SalesPerson';
import Customers from '../sales/Customers';
import Items from '../Maintainance/ItemRateList';
import City from './City';
import Region from './Region';
import { useState } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '../ui/colorful-tabs';
import { Building } from 'lucide-react';
import Flock from './Flock';
const Maintainance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branches');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="mb-2">
          <p className="text-gray-600">Manage your Companies,Branches and Departments</p>
        </div>

        <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
          <ColorfulTabsList className="grid w-full grid-cols-8 mb-4 overflow-hidden">
                        <ColorfulTabsTrigger value="company" icon={Building}>Company</ColorfulTabsTrigger>

            <ColorfulTabsTrigger value="branches" icon={Building}>Branches</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="city" icon={Building}>City</ColorfulTabsTrigger>
             <ColorfulTabsTrigger value="region" icon={Building}>Region</ColorfulTabsTrigger>
              <ColorfulTabsTrigger value="flock" icon={Building}>Flock</ColorfulTabsTrigger>
            {/* <ColorfulTabsTrigger value="department" icon={Building}>Departments</ColorfulTabsTrigger> */}
                        <ColorfulTabsTrigger value="SalesPersons" icon={Building}>SalesPersons</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="Customers" icon={Building}>Customers</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="Items" icon={Building}>Items Rate List</ColorfulTabsTrigger>

                        {/* <ColorfulTabsTrigger value="ITEMS" icon={Building}>ITEMS</ColorfulTabsTrigger> */}

            {/* <ColorfulTabsTrigger value="vouchers" icon={Building}>Vouchers</ColorfulTabsTrigger> */}
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
           <ColorfulTabsContent value="region">
            <Region />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="company">
            <Company />
          </ColorfulTabsContent>
          <ColorfulTabsContent value="flock">
            <Flock />
          </ColorfulTabsContent> 
          {/* <ColorfulTabsContent value="department">
            <Department />
          </ColorfulTabsContent> */}

          

          {/* <ColorfulTabsContent value="vouchers">
            <Vouchers />
          </ColorfulTabsContent> */}
          
        </ColorfulTabs>
      </div>
    </div>
  );
};

export default Maintainance;