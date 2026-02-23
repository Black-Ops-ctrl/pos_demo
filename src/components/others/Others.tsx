import Branch from '@/components/others/Branches';
import Company from '@/components/others/Company';
import Department from '@/components/others/Department';
import Vouchers from '@/components/others/Vouchers';
import { useState } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '../ui/colorful-tabs';
import { Building } from 'lucide-react';
const Others: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branches');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="mb-2">
          <p className="text-gray-600">Manage your Companies,Branches and Departments</p>
        </div>

        <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
          <ColorfulTabsList className="grid w-full grid-cols-4 mb-4 overflow-hidden">
            
            
            <ColorfulTabsTrigger value="branches" icon={Building}>Branches</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="company" icon={Building}>Company</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="department" icon={Building}>Departments</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="vouchers" icon={Building}>Vouchers</ColorfulTabsTrigger>
          </ColorfulTabsList>
          <ColorfulTabsContent value="branches">
            <Branch />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="company">
            <Company />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="department">
            <Department />
          </ColorfulTabsContent>
          <ColorfulTabsContent value="vouchers">
            <Vouchers />
          </ColorfulTabsContent>
        </ColorfulTabs>
      </div>
    </div>
  );
};

export default Others;