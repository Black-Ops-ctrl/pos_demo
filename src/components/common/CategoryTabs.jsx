import React from "react";

const categories = [
  "Popular",
  "Ice Cream",
  "Rice Bowl",
  "Coffee",
  "Snack",
  "Dessert",
  "Salad",
];

const CategoryTabs = () => {
  return (
    <div className="w-full max-w-full overflow-hidden mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
      <h2 className="font-semibold font-sans mb-1.5 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 xl:mb-4 text-[10px] xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-md">
        Choose Category
      </h2>

      <div className="flex gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 xl:gap-4 overflow-x-auto pb-1 xs:pb-1.5 sm:pb-2 md:pb-2.5 lg:pb-3 xl:pb-0 scrollbar-hide">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`px-2 xs:px-2.5 sm:px-3 md:px-3.5 lg:px-4 xl:px-5 py-1 xs:py-1 sm:py-1.5 md:py-1.5 lg:py-2 xl:py-2 rounded-full text-[9px] xs:text-[10px] sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              cat === "Rice Bowl"
                ? "bg-redColor text-primary"
                : "bg-greyColorOne text-greyColor hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;