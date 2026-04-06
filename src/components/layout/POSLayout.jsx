import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import OrderSummary from "../common/OrderSummary";
import TopBar from "../common/TopBar";
import ProductGrid from "../common/ProductGrid";
import CategoryTabs from "../common/CategoryTabs";
import QuantityModal from "../common/QuantityModal";
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Quantity modal state
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null);
  
  // Store the currently displayed products for keyboard navigation
  const [displayedProducts, setDisplayedProducts] = useState([]);
  
  // Ref to track grid columns dynamically
  const [columns, setColumns] = useState(4);
  
  // Refs for DOM elements
  const searchInputRef = useRef(null);
  const categoryTabsRef = useRef(null);
  const productGridRef = useRef(null);

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

  // Update displayed products whenever products, searchTerm, or selectedCategory changes
  useEffect(() => {
    if (products.length === 0) {
      setDisplayedProducts([]);
      return;
    }
    
    let filtered = [...products];
    
    // Filter by search term
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(term) || 
        (product.barcode && product.barcode.toLowerCase().includes(term)) ||
        (product.desc && product.desc.toLowerCase().includes(term))
      );
    } 
    // Filter by category only if no search term
    else if (selectedCategory && selectedCategory !== "Popular" && selectedCategory !== "") {
      filtered = filtered.filter(product => {
        const productCategory = product.category?.toLowerCase() || "";
        const searchCategory = selectedCategory.toLowerCase();
        return productCategory === searchCategory;
      });
    }
    
    // Sort alphabetically
    const sorted = filtered.sort((a, b) => {
      const titleA = a.title || "";
      const titleB = b.title || "";
      return titleA.localeCompare(titleB);
    });
    
    setDisplayedProducts(sorted);
  }, [products, searchTerm, selectedCategory]);

  // Reset selected product index when displayed products change
  useEffect(() => {
    setSelectedProductIndex(0);
  }, [displayedProducts.length, selectedCategory, searchTerm]);

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
      console.log("Loading categories...");
      const response = await fetchCategories();
      console.log("Categories response:", response);
      
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response?.data) {
        categoriesData = [response.data];
      } else {
        categoriesData = [];
      }
      
      const categoryNames = categoriesData
        .map(cat => {
          return cat?.category_name || cat?.name || cat?.title || cat?.catName;
        })
        .filter(name => name && name !== "Unknown" && name !== "");
      
      console.log("Extracted category names:", categoryNames);
      
      if (categoryNames.length > 0) {
        setCategories(categoryNames);
        setSelectedCategory(categoryNames[0]);
        setSelectedCategoryIndex(0);
      } else {
        // Fallback categories if API returns empty
        const fallbackCategories = ["All Products", "Fast Food", "Beverages", "Desserts"];
        console.log("Using fallback categories:", fallbackCategories);
        setCategories(fallbackCategories);
        setSelectedCategory(fallbackCategories[0]);
        setSelectedCategoryIndex(0);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      const fallbackCategories = ["All Products", "Fast Food", "Beverages", "Desserts"];
      setCategories(fallbackCategories);
      setSelectedCategory(fallbackCategories[0]);
      setSelectedCategoryIndex(0);
    }
  };

  // Fetch products from API and format them for display
  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log("Loading products...");
      const response = await fetchProducts();
      console.log("Products response:", response);
      
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
      
      const formattedProducts = productsData.map((prod, index) => {
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
      });
      
      console.log("Formatted products count:", formattedProducts.length);
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

  // Open quantity modal
  const openQuantityModal = (product) => {
    console.log("Opening quantity modal for product:", product.title);
    setSelectedProductForQuantity(product);
    setIsQuantityModalOpen(true);
  };

  // Handle product selection with quantity
  const handleProductWithQuantity = (product, quantity) => {
    console.log(`Adding ${quantity} x ${product.title} to cart`);
    // Create a custom event or directly pass to OrderSummary
    // We'll use scannedBarcode with a special flag
    const productWithQuantity = {
      ...product,
      customQuantity: quantity
    };
    // Store in sessionStorage or use a ref to pass to OrderSummary
    sessionStorage.setItem('pendingProduct', JSON.stringify(productWithQuantity));
    setScannedBarcode(product.barcode);
    setIsQuantityModalOpen(false);
    setSelectedProductForQuantity(null);
  };

  const handleBarcodeScanned = (barcode) => {
    console.log("Barcode scanned:", barcode);
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      openQuantityModal(product);
    } else {
      setScannedBarcode(barcode);
    }
    setSearchTerm("");
  };

  const handleProductSelect = (barcode) => {
    console.log("Product selected:", barcode);
    const product = displayedProducts.find(p => p.barcode === barcode);
    if (product) {
      openQuantityModal(product);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      setActiveSection("products");
      setSelectedProductIndex(0);
    }
  };

  const handleEnterPress = (searchTermValue) => {
    if (!searchTermValue.trim()) return;
    const term = searchTermValue.toLowerCase().trim();
    const matchedProduct = products.find(product => 
      product.title.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term)) ||
      (product.desc && product.desc.toLowerCase().includes(term))
    );
    if (matchedProduct) {
      openQuantityModal(matchedProduct);
      setSearchTerm("");
    }
  };

  const handleBarcodeProcessed = () => {
    setScannedBarcode(null);
  };

  const handleCategorySelect = (category, index) => {
    console.log("Category selected:", category, index);
    setSearchTerm("");
    setSelectedCategory(category);
    setSelectedCategoryIndex(index);
    setSelectedProductIndex(0);
    setActiveSection("products");
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleCloseQuantityModal = () => {
    setIsQuantityModalOpen(false);
    setSelectedProductForQuantity(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    // Don't handle keyboard events if search input is focused or modal is open
    if (isSearchFocused || document.activeElement?.id === 'search-input' || isQuantityModalOpen) {
      if (e.key === 'Escape') {
        if (isQuantityModalOpen) {
          handleCloseQuantityModal();
        } else {
          searchInputRef.current?.blur();
          setIsSearchFocused(false);
          setActiveSection("categories");
        }
      }
      return;
    }

    // Tab key to switch between sections
    if (e.key === 'Tab') {
      e.preventDefault();
      if (activeSection === "categories") {
        if (displayedProducts.length > 0) {
          setActiveSection("products");
          setSelectedProductIndex(0);
        }
      } else if (activeSection === "products") {
        setActiveSection("categories");
      }
      return;
    }

    // Arrow navigation
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
      } else if (e.key === 'ArrowDown' && displayedProducts.length > 0) {
        e.preventDefault();
        setActiveSection("products");
        setSelectedProductIndex(0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayedProducts.length > 0) {
          setActiveSection("products");
          setSelectedProductIndex(0);
        }
      }
    } 
    else if (activeSection === "products") {
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
            lastRowIndex = totalProducts - 1;
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
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayedProducts[selectedProductIndex]) {
          const product = displayedProducts[selectedProductIndex];
          openQuantityModal(product);
        }
      } else if (e.key === 'ArrowUp' && selectedProductIndex === 0) {
        e.preventDefault();
        setActiveSection("categories");
      }
    }

    // Escape key to reset focus to categories
    if (e.key === 'Escape') {
      e.preventDefault();
      setActiveSection("categories");
      setSelectedProductIndex(0);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection, selectedCategoryIndex, selectedProductIndex, categories, displayedProducts, columns, isSearchFocused, isQuantityModalOpen]);

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <div className="h-full flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 pb-14 overflow-hidden">
            {/* Left Column - Products Section */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white">
              {/* Top bar with search */}
              <div className="px-4 pt-2 bg-white">
                <TopBar 
                  ref={searchInputRef}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onSearch={handleSearch}
                  onBarcodeScanned={handleBarcodeScanned}
                  onEnterPress={handleEnterPress}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
              </div>
              
              {/* Category tabs */}
              <div className="pt-2 px-5" ref={categoryTabsRef}>
                {categories.length > 0 ? (
                  <CategoryTabs 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    selectedCategoryIndex={selectedCategoryIndex}
                    onCategorySelect={handleCategorySelect}
                    activeSection={activeSection}
                  />
                ) : (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="px-5 py-2 rounded-full bg-gray-200 animate-pulse w-24 h-10"></div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product grid */}
              <div className="flex-1 min-h-0 overflow-hidden px-5 pb-3" ref={productGridRef}>
                <ProductGrid 
                  onProductSelect={handleProductSelect}
                  products={displayedProducts}
                  loading={loading}
                  activeSection={activeSection}
                  selectedProductIndex={selectedProductIndex}
                  columns={columns}
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

      {/* Quantity Modal */}
      <QuantityModal 
        isOpen={isQuantityModalOpen}
        product={selectedProductForQuantity}
        onConfirm={handleProductWithQuantity}
        onCancel={handleCloseQuantityModal}
      />
    </div>
  );
};

export default POSLayout;