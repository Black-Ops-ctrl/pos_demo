import React, { useState } from "react";
import TabItems from "../common/TabItems";
import AddProductPage from "../../pages/AddProductPage";
import CreateCategoryPage from "../../pages/CreateCategoryPage";

function Inventory() {
  const [activeTab, setActiveTab] = useState(0);

  const tabItems = [
    {label: "Add Product", content: <AddProductPage /> },
    {label: "Categories", content: ( <CreateCategoryPage goToAddProduct={() => setActiveTab(0)} />) },
  ];

  return (
    <div className="max-w-full mx-auto mt-10 px-6 font-poppins">
      <TabItems tabs={tabItems} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default Inventory;
