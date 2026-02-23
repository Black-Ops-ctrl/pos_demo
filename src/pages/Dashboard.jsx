import React from "react";
import POSLayout from "../components/layout/POSLayout";
import TopBar from "../components/common/TopBar";
import CategoryTabs from "../components/common/CategoryTabs";
import ProductGrid from "../components/common/ProductGrid";

const Dashboard = () => {
  return (
    <POSLayout>
      <TopBar />
      <CategoryTabs />
      <ProductGrid />
    </POSLayout>
  );
};

export default Dashboard;
