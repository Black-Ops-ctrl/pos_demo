import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import OrderSummary from "../common/OrderSummary";
import TopBar from "../common/TopBar";
import ProductGrid from "../common/ProductGrid";
import CategoryTabs from "../common/CategoryTabs"; 
import { fetchCategories } from "../../core/services/api/fetchCategories";  
import { fetchProducts } from "../../core/services/api/fetchProducts"; 

const POSLayout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      console.log("Raw categories response:", response);
      
      const categoriesData = Array.isArray(response) ? response : (response?.data || []);
      console.log("Categories data array:", categoriesData);
      
      const categoryNames = Array.isArray(categoriesData) 
        ? categoriesData.map(cat => {
            console.log("Individual category object:", cat);
            return cat?.category_name || cat?.name || cat?.title || cat?.catName || "Unknown";
          }).filter(name => name !== "Unknown") 
        : [];
      
      console.log("Final category names:", categoryNames);
      setCategories(categoryNames);
      
      if (categoryNames.length > 0) {
        setSelectedCategory(categoryNames[0]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories(["Popular", "Ice Cream", "Rice Bowl", "Coffee", "Snack"]);
      setSelectedCategory("Rice Bowl");
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      console.log("Raw products response:", response);
      
      // ✅ FIXED: Check response structure properly
      let productsData = [];
      
      // Agar response direct array hai
      if (Array.isArray(response)) {
        console.log("✅ Response is direct array");
        productsData = response;
      } 
      // Agar response mein data property hai jo array hai
      else if (response?.data && Array.isArray(response.data)) {
        console.log("✅ Response has data array");
        productsData = response.data;
      }
      // Agar response mein data property hai lekin array nahi
      else if (response?.data) {
        console.log("⚠️ Response.data is not an array:", response.data);
        productsData = [response.data];
      }
      else {
        console.log("❌ Unknown response format:", response);
        productsData = [];
      }
      
      console.log("Final products data array:", productsData);
      console.log("Products count:", productsData.length);
      
      const formattedProducts = Array.isArray(productsData) ? productsData.map((prod, index) => {
        console.log(`Product ${index}:`, {
          id: prod.product_id,
          name: prod.product_name,
          bar_code: prod.bar_code,
          product_code: prod.product_code,
          price: prod.price
        });
        
        // Image URL construct karo
        const imageUrl = prod.image_ext && prod.product_id
          ? `/uploads/${prod.product_id}.${prod.image_ext}` 
          : "/img_categoryFive.webp";
        
        return {
          id: prod.product_id || index,
          title: prod.product_name || "Product",
          price: prod.price?.toString() || "0",
          image: imageUrl,
          barcode: prod.bar_code || prod.product_code || `PROD-${index}`,
          desc: prod.description || "",
          category: prod.category_name || "",
          category_id: prod.category_id
        };
      }) : [];
      
      console.log("✅ Formatted products count:", formattedProducts.length);
      console.log("Formatted products with barcodes:", 
        formattedProducts.map(p => ({ 
          title: p.title, 
          barcode: p.barcode,
          category: p.category 
        })));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = (barcode) => {
    console.log("Barcode scanned in POSLayout:", barcode);
    setScannedBarcode(barcode);
    setSearchTerm("");
  };

  const handleProductSelect = (barcode) => {
    console.log("Product selected with barcode:", barcode);
    setScannedBarcode(barcode);
  };

  const handleSearch = (term) => {
    console.log("Search term:", term);
    setSearchTerm(term);
  };

  const handleEnterPress = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const term = searchTerm.toLowerCase().trim();
    const matchedProduct = products.find(product => 
      product.title.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term)) ||
      (product.desc && product.desc.toLowerCase().includes(term))
    );
    
    if (matchedProduct) {
      console.log("Enter pressed - auto-selecting product:", matchedProduct.title);
      setScannedBarcode(matchedProduct.barcode);
      setSearchTerm("");
    }
  };

  const handleBarcodeProcessed = () => {
    console.log("Barcode processed");
    setScannedBarcode(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };

  return (
    <div className="h-screen bg-rose-50 p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl h-full flex flex-col lg:flex-row overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="p-2 sm:p-3 md:p-4 lg:p-5 pb-1 sm:pb-2 md:pb-2 lg:pb-3">
            <TopBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              onBarcodeScanned={handleBarcodeScanned}
              onEnterPress={handleEnterPress}
            />
          </div>

          <div className="px-3 sm:px-4 md:px-5 pb-2 sm:pb-3 md:pb-4">
            <CategoryTabs 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          <div className="flex-1 flex flex-col lg:flex-row min-h-0 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 gap-4 overflow-hidden">
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <ProductGrid 
                onProductSelect={handleProductSelect}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                products={products}
                loading={loading}
              />
            </div>

            <div className="w-full md:w-80 lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 h-full overflow-hidden">
              <OrderSummary 
                scannedBarcode={scannedBarcode}
                onBarcodeProcessed={handleBarcodeProcessed}
                products={products}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSLayout;