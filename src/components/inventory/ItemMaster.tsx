import Branch from '@/components/others/Branches';
import Company from '@/components/others/Company';
import Department from '@/components/others/Department';
import { useState } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '../ui/colorful-tabs';
import { Building, Package } from 'lucide-react';
import Items from '../inventory/Items';
import ItemCategories from './ItemCategory';
import UOM from './UOM';
const Others: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-5">
        <div className="mb-1 mt-0">
          <p className="text-gray-600" >Manage your Items, Items Categories and Stock</p>
        </div>

        <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
          <ColorfulTabsList className="grid w-full grid-cols-3 mb-2 overflow-hidden">

          <ColorfulTabsTrigger value="uom" icon={Package}>
            UOM
          </ColorfulTabsTrigger>
          
            <ColorfulTabsTrigger
             value="items" 
             icon={Building}>
              Items
            </ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="item-categories" icon={Building}>
              Item Categories
            </ColorfulTabsTrigger>
          </ColorfulTabsList>

                       <ColorfulTabsContent value="uom">
          <UOM />
        </ColorfulTabsContent>

        
          <ColorfulTabsContent value="items">
            <Items />
          </ColorfulTabsContent>



          <ColorfulTabsContent value="item-categories">
            <ItemCategories />
          </ColorfulTabsContent>

         
        </ColorfulTabs>
      </div>
    </div>
  );
};

export default Others;