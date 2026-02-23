import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GRNDetail from "./components/purchasing/GRNDetail";
import Login from "./components/security/LoginPage";
import PrivateRoute from "./components/security/PrivateRoute";
import ModulesPage from "./components/modules/ModulesPage";
import ViewProduct from "@/pages/ViewProductPage"; 
import AddProductPage from "@/pages/AddProductPage";  




const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/"      element={<PrivateRoute><Index /></PrivateRoute>}/>
           <Route path="*" element={<NotFound />} />
           <Route path="/view-products/:categoryName" element={<ViewProduct />} />
           <Route path="/add-product" element={<PrivateRoute><AddProductPage /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
