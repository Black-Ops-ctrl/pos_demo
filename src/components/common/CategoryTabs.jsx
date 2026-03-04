import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// CategoryTabs component for horizontal scrolling category navigation with responsive design
const CategoryTabs = ({ categories = [], selectedCategory, onCategorySelect }) => {
  // Reference to the scrollable container element
  const scrollContainerRef = useRef(null);
  // State for controlling scroll button visibility
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  // Track window width for responsive behavior
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  // Function to check if scroll buttons should be visible based on scroll position
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 10);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  // Effect to handle window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setTimeout(checkScrollButtons, 100);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Effect to add scroll event listener and update buttons when categories or window size changes
  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [categories.length, windowWidth]);
  // Function to scroll the container left or right
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      const targetScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: Math.max(0, Math.min(targetScroll, container.scrollWidth - container.clientWidth)),
        behavior: 'smooth'
      });
    }
  };
  // Responsive breakpoint detection
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  // Get button size based on screen size
  const getButtonSizeClass = () => {
    if (isTablet) return "w-7 h-7";
    if (isDesktop) return "w-8 h-8";
    return "w-6 h-6";
  };
  // Get container padding based on screen size
  const getContainerPaddingClass = () => {
    if (isMobile) return "px-2";
    return "px-8";
  };
  const buttonSizeClass = getButtonSizeClass();
  const containerPaddingClass = getContainerPaddingClass();
  // Show loading skeleton if no categories
  if (categories.length === 0) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <h2 className="font-semibold font-sans mb-1.5 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 xl:mb-4 text-[10px] xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-md">
          Choose Category
        </h2>
        <div className="flex gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 xl:gap-4 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-2 rounded-full bg-gray-200 animate-pulse w-20 h-8"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <h2 className="font-semibold font-sans mb-1.5 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 xl:mb-4 text-[10px] xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-md">
        Choose Category
      </h2>

      <div className="relative">
        {/* Left scroll button - hidden on mobile */}
        {!isMobile && showLeftButton && (
          <>
            <button
              onClick={() => scroll('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center ${buttonSizeClass} bg-white rounded-full shadow-md hover:bg-gray-50 transition-all border border-gray-200`}
              aria-label="Scroll left"
              style={{ marginLeft: '-12px' }}
            >
              <ChevronLeft className={isDesktop ? "w-4 h-4" : "w-3.5 h-3.5"} />
            </button>
            <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none"></div>
          </>
        )}

        {/* Right scroll button - hidden on mobile */}
        {!isMobile && showRightButton && (
          <>
            <button
              onClick={() => scroll('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center ${buttonSizeClass} bg-white rounded-full shadow-md hover:bg-gray-50 transition-all border border-gray-200`}
              aria-label="Scroll right"
              style={{ marginRight: '-12px' }}
            >
              <ChevronRight className={isDesktop ? "w-4 h-4" : "w-3.5 h-3.5"} />
            </button>
            <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none"></div>
          </>
        )}

        {/* Scrollable categories container */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 xl:gap-4 overflow-x-auto pb-1 xs:pb-1.5 sm:pb-2 md:pb-2.5 lg:pb-3 xl:pb-0 scrollbar-hide scroll-smooth ${containerPaddingClass}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {categories.map((cat, index) => (
            <button
              key={`${cat}-${index}`}
              onClick={() => onCategorySelect(cat)}
              className={`px-2 xs:px-2.5 sm:px-3 md:px-3.5 lg:px-4 xl:px-5 py-1 xs:py-1 sm:py-1.5 md:py-1.5 lg:py-2 xl:py-2 rounded-full text-[9px] xs:text-[10px] sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all transform hover:scale-105 active:scale-95 ${
                cat === selectedCategory
                  ? "bg-redColor text-primary shadow-md"
                  : "bg-greyColorOne text-greyColor hover:bg-gray-200 hover:shadow"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gradient fade effects at edges when scroll buttons are visible */}
        {!isMobile && showLeftButton && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent pointer-events-none z-10"></div>
        )}
        {!isMobile && showRightButton && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none z-10"></div>
        )}
      </div>

      {/* Mobile swipe hint */}
      {isMobile && categories.length > 0 && (
        <div className="text-center mt-2">
          <span className="text-[10px] xs:text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full inline-block">
            ← Swipe to scroll →
          </span>
        </div>
      )}
    </div>
  );
};
export default CategoryTabs;