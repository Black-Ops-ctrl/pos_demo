import CRV from '../accounting/CRV';
import BRV from '../accounting/BRV';
import BPV from '../accounting/BPV';
import JournalEntries from './JournalEntries';
import { useState } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '../ui/colorful-tabs';
import { Building, CreditCard } from 'lucide-react';
import Vouchers from '../others/Vouchers';
import CPV from '../accounting/CPV';
import JV from '../accounting/JV';
const Journal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vouchers');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="mb-2">
          <p className="text-gray-600">Manage your Companies,Branches and Departments</p>
        </div>

        <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
          <ColorfulTabsList className="grid w-full grid-cols-6 mb-4 overflow-hidden">
             <ColorfulTabsTrigger value="vouchers"  icon={CreditCard}>Voucher Types</ColorfulTabsTrigger>
            {/* <ColorfulTabsTrigger value="JournalEntries" icon={Building}>Journal Entries</ColorfulTabsTrigger> */}
            <ColorfulTabsTrigger value="crv" icon={Building}>Cash Receipt</ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="brv" icon={CreditCard}>Bank Receipt </ColorfulTabsTrigger>
            <ColorfulTabsTrigger value="bpv" icon={Building}>Bank Payment</ColorfulTabsTrigger>
             <ColorfulTabsTrigger value="cpv" icon={Building}>Cash Payment</ColorfulTabsTrigger>
              <ColorfulTabsTrigger value="jv" icon={Building}>Journal Voucher</ColorfulTabsTrigger>
            
          </ColorfulTabsList>

{/* 
          <ColorfulTabsContent value="JournalEntries">
            <JournalEntries />
          </ColorfulTabsContent> */}
           <ColorfulTabsContent value="vouchers">
            <Vouchers />
          </ColorfulTabsContent>
          <ColorfulTabsContent value="crv">
            <CRV />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="brv">
            <BRV />
          </ColorfulTabsContent>

          <ColorfulTabsContent value="bpv">
            <BPV />
          </ColorfulTabsContent>
          <ColorfulTabsContent value="cpv">
            <CPV />
          </ColorfulTabsContent>
          <ColorfulTabsContent value="jv">
            <JV />
          </ColorfulTabsContent>
        </ColorfulTabs>
      </div>
    </div>
  );
};

export default Journal;