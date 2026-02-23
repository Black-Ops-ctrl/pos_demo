import React from "react";
import { Home, ShoppingCart, Settings, Grid } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="
      /* Base styles */
      bg-white shadow-lg
      
      /* Mobile (default) - horizontal top bar */
      w-full h-auto
      flex flex-row items-center justify-between
      py-1 px-2
      rounded-t-xl
      
      /* Small screens */
      sm:py-1.5 sm:px-3
      
      /* Medium screens */
      md:py-1.5 md:px-4
      
      /* Large screens - vertical sidebar with reduced width */
      lg:flex-col lg:w-14 lg:h-full
      lg:justify-start lg:py-3 lg:px-0
      lg:rounded-l-2xl lg:rounded-t-none
      
      /* Extra large screens - even more reduced */
      xl:w-16 xl:py-4
      
      /* 2XL screens */
      2xl:w-20 2xl:py-5
    ">
      {/* Logo - slightly smaller */}
      <div className="
        text-red-500 font-bold
        text-base sm:text-lg md:text-xl
        lg:mb-4 lg:text-lg
        xl:mb-5 xl:text-xl
        2xl:mb-6 2xl:text-2xl
      ">
        ◎
      </div>
      
      {/* Navigation Icons Container */}
      <div className="
        flex flex-row items-center gap-2
        sm:gap-3 md:gap-4
        lg:flex-col lg:gap-3 lg:flex-1
        xl:gap-4
        2xl:gap-5
      ">
        <Home className="
          text-gray-400 hover:text-red-500 cursor-pointer transition-colors
          w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4
          lg:w-4 lg:h-4
          xl:w-5 xl:h-5
          2xl:w-5 2xl:h-5
        " />
        
        <Grid className="
          text-gray-400 hover:text-red-500 cursor-pointer transition-colors
          w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4
          lg:w-4 lg:h-4
          xl:w-5 xl:h-5
          2xl:w-5 2xl:h-5
        " />
        
        <ShoppingCart className="
          text-gray-400 hover:text-red-500 cursor-pointer transition-colors
          w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4
          lg:w-4 lg:h-4
          xl:w-5 xl:h-5
          2xl:w-5 2xl:h-5
        " />
        
        <Settings className="
          text-gray-400 hover:text-red-500 cursor-pointer transition-colors
          w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4
          lg:w-4 lg:h-4 lg:mt-auto
          xl:w-5 xl:h-5
          2xl:w-5 2xl:h-5
        " />
      </div>
    </div>
  );
};

export default Sidebar;