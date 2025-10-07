import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Outlet } from "react-router-dom";
import { useIsMobile } from '@/hooks/use-mobile';
import ERPDashboard from './ERPDashboard';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 ">
      <ERPDashboard />
    </div>
  );
};

export default AppLayout;