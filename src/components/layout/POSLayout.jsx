import React, { useState, useEffect, useRef } from "react";
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State for keyboard navigation
  const [activeSection, setActiveSection] = useState("categories");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  
  // Ref to track grid columns dynamically
  const [columns, setColumns] = useState(4);

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

  // Filter products by search term FIRST (global search)
const searchFilteredProducts = products.filter(product => {
  if (!searchTerm || searchTerm.trim() === "") return true;
  const term = searchTerm.toLowerCase().trim();
  return product.title?.toLowerCase().includes(term) || 
         (product.barcode && product.barcode.toLowerCase().includes(term)) ||
         (product.desc && product.desc.toLowerCase().includes(term));
});

// Then filter by category (only if search is empty)
const displayedProducts = searchFilteredProducts.filter(product => {
  // If there's an active search term, show all search results regardless of category
  if (searchTerm && searchTerm.trim() !== "") {
    return true;
  }
  // Otherwise filter by selected category
  if (selectedCategory && selectedCategory !== "Popular" && selectedCategory !== "") {
    const productCategory = product.category?.toLowerCase() || "";
    const searchCategory = selectedCategory.toLowerCase();
    return productCategory === searchCategory;
  }
  return true;
});

  // Reset selected product index when category changes or filtered products change
  useEffect(() => {
    setSelectedProductIndex(0);
  }, [selectedCategory, searchTerm]);

  // Calculate grid columns dynamically based on screen size
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setColumns(6);
      } else if (width >= 1280) {
        setColumns(5);
      } else if (width >= 1024) {
        setColumns(4);
      } else if (width >= 768) {
        setColumns(3);
      } else {
        setColumns(2);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Fetch categories from API and process response
  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      const categoriesData = Array.isArray(response) ? response : (response?.data || []);
      const categoryNames = Array.isArray(categoriesData) 
        ? categoriesData.map(cat => {
            return cat?.category_name || cat?.name || cat?.title || cat?.catName || "Unknown";
          }).filter(name => name !== "Unknown") 
        : [];
      setCategories(categoryNames);
      if (categoryNames.length > 0) {
        setSelectedCategory(categoryNames[0]);
        setSelectedCategoryIndex(0);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      const fallbackCategories = ["Popular", "Fast Food", "Grains", "Electronics", "Groceries"];
      setCategories(fallbackCategories);
      setSelectedCategory("Fast Food");
      setSelectedCategoryIndex(1);
    }
  };

  // Fetch products from API and format them for display
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      let productsData = [];
      
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response?.data) {
        productsData = [response.data];
      } else {
        productsData = [];
      }
      
      const formattedProducts = Array.isArray(productsData) ? productsData.map((prod, index) => {
        let imageUrl = "/img_categoryFive.webp";
        if (prod.image_url) {
          imageUrl = prod.image_url;
        } else if (prod.image_ext && prod.product_id) {
          imageUrl = `http://84.16.235.111:2149/uploads/products/prod_${prod.product_id}.${prod.image_ext}`;
        } else if (prod.product_id) {
          imageUrl = `http://84.16.235.111:2149/uploads/products/prod_${prod.product_id}.png`;
        }
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
          image_url: prod.image_url,
          uom_name: prod.uom_name || "Pieces"
        };
      }) : [];
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBarcodeScanned = (barcode) => {
    setScannedBarcode(barcode);
    setSearchTerm("");
  };

  const handleProductSelect = (barcode) => {
    setScannedBarcode(barcode);
  };

  const handleSearch = (term) => {
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
      setScannedBarcode(matchedProduct.barcode);
      setSearchTerm("");
    }
  };

  const handleBarcodeProcessed = () => {
    setScannedBarcode(null);
  };

  const handleCategorySelect = (category, index) => {
    setSearchTerm("");
    setSelectedCategory(category);
    setSelectedCategoryIndex(index);
    setSelectedProductIndex(0);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (activeSection === "categories") {
        setActiveSection("products");
        setSelectedProductIndex(0);
      } else {
        setActiveSection("categories");
      }
      return;
    }

    if (e.key === 'ArrowDown' && activeSection === "categories") {
      e.preventDefault();
      if (displayedProducts.length > 0) {
        setActiveSection("products");
        setSelectedProductIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowUp' && activeSection === "products") {
      e.preventDefault();
      setActiveSection("categories");
      return;
    }

    if (activeSection === "categories") {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newIndex = selectedCategoryIndex > 0 ? selectedCategoryIndex - 1 : categories.length - 1;
        setSelectedCategoryIndex(newIndex);
        setSelectedCategory(categories[newIndex]);
        setSelectedProductIndex(0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newIndex = selectedCategoryIndex < categories.length - 1 ? selectedCategoryIndex + 1 : 0;
        setSelectedCategoryIndex(newIndex);
        setSelectedCategory(categories[newIndex]);
        setSelectedProductIndex(0);
      }
    } else if (activeSection === "products") {
      const totalProducts = displayedProducts.length;
      if (totalProducts === 0) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedProductIndex(prev => {
          const newIndex = prev - 1;
          return newIndex >= 0 ? newIndex : totalProducts - 1;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedProductIndex(prev => {
          const newIndex = prev + 1;
          return newIndex < totalProducts ? newIndex : 0;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedProductIndex(prev => {
          const newIndex = prev - columns;
          if (newIndex >= 0) return newIndex;
          const lastRowStart = Math.floor((totalProducts - 1) / columns) * columns;
          const currentCol = prev % columns;
          let lastRowIndex = lastRowStart + currentCol;
          if (lastRowIndex >= totalProducts) {
            lastRowIndex = lastRowStart - columns + currentCol;
          }
          return lastRowIndex >= 0 ? lastRowIndex : prev;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedProductIndex(prev => {
          const newIndex = prev + columns;
          if (newIndex < totalProducts) return newIndex;
          const currentCol = prev % columns;
          return currentCol < totalProducts ? currentCol : prev;
        });
      }
    }

    if (e.key === 'Enter' && activeSection === "products") {
      e.preventDefault();
      if (displayedProducts[selectedProductIndex]) {
        const product = displayedProducts[selectedProductIndex];
        setScannedBarcode(product.barcode);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection, selectedCategoryIndex, selectedProductIndex, categories, displayedProducts, columns]);

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <div className="h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar with search - reduced padding */}
          {/* <div className="px-4 pt-2  bg-white ">
            <TopBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              onBarcodeScanned={handleBarcodeScanned}
              onEnterPress={handleEnterPress}
            />
          </div> */}
          
          {/* Main content - reduced gaps */}
        
          <div className="flex-1 flex flex-col lg:flex-row min-h-0  pb-14  overflow-hidden">
            {/* Left Column - Products Section */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white ">
            {/* Top bar with search - reduced padding */}
            <div className="px-4 pt-2  bg-white ">
            <TopBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              onBarcodeScanned={handleBarcodeScanned}
              onEnterPress={handleEnterPress}
            />
          </div>
              {/* Category tabs - reduced padding */}
              <div className="pt-2 px-5">
                <CategoryTabs 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
              </div>
              
              {/* Product grid - no extra padding */}
              <div className="flex-1 min-h-0 overflow-hidden px-5 pb-3">
                <ProductGrid 
                  onProductSelect={handleProductSelect}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  products={displayedProducts}
                  loading={loading}
                  activeSection={activeSection}
                  selectedProductIndex={selectedProductIndex}
                />
              </div>
            </div>
            
            <div className="w-full md:w-96 lg:w-96 xl:w-[420px] 2xl:w-[480px] flex-shrink-0">
              <OrderSummary 
                scannedBarcode={scannedBarcode}
                onBarcodeProcessed={handleBarcodeProcessed}
                products={products}
                onRefreshProducts={refreshProducts}
                selectedCustomer={selectedCustomer} 
                onCustomerSelect={handleCustomerSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSLayout;