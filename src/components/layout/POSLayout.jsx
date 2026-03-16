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
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products after categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [categories, refreshTrigger]); 

  // Fetch categories from API and process response
  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      
      const categoriesData = Array.isArray(response) ? response : (response?.data || []);
      
      // Extract category names from various possible field names
      const categoryNames = Array.isArray(categoriesData) 
        ? categoriesData.map(cat => {
            return cat?.category_name || cat?.name || cat?.title || cat?.catName || "Unknown";
          }).filter(name => name !== "Unknown") 
        : [];
      
      setCategories(categoryNames);
      
      // Set default selected category to first category
      if (categoryNames.length > 0) {
        setSelectedCategory(categoryNames[0]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback categories if API fails
      setCategories(["Popular", "Ice Cream", "Rice Bowl", "Coffee", "Snack"]);
      setSelectedCategory("Rice Bowl");
    }
  };

  // Fetch products from API and format them for display
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      
      // Handle different response formats properly
      let productsData = [];
      
      // If response is direct array
      if (Array.isArray(response)) {
        productsData = response;
      } 
      // If response has data property that is an array
      else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      }
      // If response has data property but not array
      else if (response?.data) {
        productsData = [response.data];
      }
      else {
        productsData = [];
      }
      
      console.log("Products data for POS:", productsData);
      
      // Format each product for consistent structure
      const formattedProducts = Array.isArray(productsData) ? productsData.map((prod, index) => {
        
        // Construct image URL from API response
        let imageUrl = "/img_categoryFive.webp"; // Default fallback
        
        // Check for image_url from API (your API now returns this)
        if (prod.image_url) {
          imageUrl = prod.image_url;
        } 
        // Construct from image_ext and product_id if available
        else if (prod.image_ext && prod.product_id) {
          imageUrl = `http://84.16.235.111:2140/uploads/products/prod_${prod.product_id}.${prod.image_ext}`;
        }
        // Construct from product_id only (assuming png)
        else if (prod.product_id) {
          imageUrl = `http://84.16.235.111:2140/uploads/products/prod_${prod.product_id}.png`;
        }
        
        // Parse quantity to number
        const quantity = parseInt(prod.quantity) || 0;
        
        return {
          id: prod.product_id || index,
          title: prod.product_name || "Product",
          price: prod.price?.toString() || "0",
          image: imageUrl,
          barcode: prod.bar_code || prod.product_code || `PROD-${index}`,
          desc: prod.description || "",
          category: prod.category_name || "",
          category_id: prod.category_id,
          quantity: quantity,
          stockStatus: quantity <= 0 ? "out" : quantity < 5 ? "low" : "in",
          image_ext: prod.image_ext,
          image_url: prod.image_url
        };
      }) : [];
      
      console.log("Formatted products for POS:", formattedProducts);
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh products
  const refreshProducts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle barcode scanned from TopBar
  const handleBarcodeScanned = (barcode) => {
    setScannedBarcode(barcode);
    setSearchTerm("");
  };

  // Handle product selection from grid
  const handleProductSelect = (barcode) => {
    setScannedBarcode(barcode);
  };

  // Handle search term changes
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle Enter key press - auto-select product if search matches
  const handleEnterPress = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const term = searchTerm.toLowerCase().trim();
    const matchedProduct = products.find(product => 
      product.title.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term)) ||
      (product.desc && product.desc.toLowerCase().includes(term))
    );
    
    if (matchedProduct) {
      setScannedBarcode(matchedProduct.barcode);
      setSearchTerm("");
    }
  };

  // Reset scanned barcode after processing
  const handleBarcodeProcessed = () => {
    setScannedBarcode(null);
  };

  // Handle category selection change
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="h-screen bg-rose-50 p-2 sm:p-3 md:p-4 overflow-hidden">
      {/* Main container with responsive padding */}
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar navigation */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar with search and user profile */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-5 pb-1 sm:pb-2 md:pb-2 lg:pb-3">
            <TopBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              onBarcodeScanned={handleBarcodeScanned}
              onEnterPress={handleEnterPress}
            />
          </div>
          
          {/* Main content with Category Tabs and Order Summary in same row */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 px-3 sm:px-4 md:px-5 gap-4 overflow-hidden">
            {/* Left Column - Categories and Products */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
              {/* Category tabs */}
              <div className="pb-2 sm:pb-3 md:pb-4">
                <CategoryTabs 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
              </div>
              
              {/* Product grid */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ProductGrid 
                  onProductSelect={handleProductSelect}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  products={products}
                  loading={loading}
                />
              </div>
            </div>
            
            {/* Right Column - Order Summary (shifted up) */}
            <div className="w-full md:w-80 lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 overflow-hidden">
              <OrderSummary 
                scannedBarcode={scannedBarcode}
                onBarcodeProcessed={handleBarcodeProcessed}
                products={products}
                onRefreshProducts={refreshProducts} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSLayout; 