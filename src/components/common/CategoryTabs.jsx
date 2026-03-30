import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryTabs = ({ categories = [], selectedCategory, onCategorySelect }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 10);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setTimeout(checkScrollButtons, 100);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [categories.length, windowWidth]);

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

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const getButtonSizeClass = () => {
    if (isTablet) return "w-7 h-7";
    if (isDesktop) return "w-8 h-8";
    return "w-6 h-6";
  };

  const buttonSizeClass = getButtonSizeClass();

  if (categories.length === 0) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <h2 className="font-semibold font-sans mb-2 text-sm text-gray-600">
          Choose Category
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-5 py-2 rounded-full bg-gray-200 animate-pulse w-24 h-10"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* <h2 className="font-semibold font-sans mb-3 text-sm text-gray-600">
        Choose Category
      </h2> */}

      <div className="relative">
        {/* Left scroll button */}
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
            <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
          </>
        )}

        {/* Right scroll button */}
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
            <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
          </>
        )}

        {/* Scrollable categories container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
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
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all transform hover:scale-105 active:scale-95 shadow-sm ${
                cat === selectedCategory
                  ? "bg-blue-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile swipe hint */}
      {isMobile && categories.length > 0 && (
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full inline-block">
            ← Swipe to scroll →
          </span>
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;