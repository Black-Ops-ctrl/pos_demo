import React from "react";
import { Routes, Route } from "react-router-dom";
import Inventory from "../../components/layout/Inventory";
import ViewProduct from "../../pages/ViewProductPage"; 

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Inventory />} />
      <Route path="/view-products/:categoryName" element={<ViewProduct />} />
\    </Routes>
  );
};

export default AppRouter;
