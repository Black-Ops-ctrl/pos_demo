import React from "react";
// TabItems component renders a tab navigation interface with content display
// Takes tabs array, active tab index, and function to update active tab
const TabItems = ({ tabs, activeTab, setActiveTab }) => {
  // Return null if no tabs provided to prevent rendering empty component
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="max-w-full mx-auto mt-10 px-6">
      {/* Tab navigation bar - horizontally scrollable on mobile */}
      <div className="flex flex-wrap space-x-2 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              relative px-6 py-2 text-base rounded-full transition-all duration-200 whitespace-nowrap 
              ${
                // Active tab uses gradient background, inactive uses gray background
                activeTab === index
                  ? "bg-gradient-to-r from-purple-500 to-indigo-400 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {tab.label}
            {/* Underline indicator for active tab */}
            {activeTab === index && (
              <span className="absolute -bottom-2 w-full left-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-400"></span>
            )}
          </button>
        ))}
      </div>
      {/* Content area for the active tab */}
      <div className="mt-6 p-6 bg-white shadow border border-gray-200 rounded-lg">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};
export default TabItems;