import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Factory, PillBottle, Bot } from "lucide-react"; // Example icons - Note: Bot is not used, PillBottle is not used
import { getModules } from "@/api/modulesApi";
import { useNavigate } from "react-router-dom";

interface Modules {
  module_id: number;
  module_name: string;
}

const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Modules[]>([]);
  const navigate = useNavigate();

  /**
   * Function to handle card clicks, save the selected branch ID, navigate, and reload.
   * @param moduleId - The ID of the selected branch/module (e.g., "1", "2", "3").
   */
  const handleModuleClick = (moduleId: string) => {
    // 💡 CHANGE 1: Store the selected module ID in sessionStorage
    sessionStorage.setItem("selectedBranchId", moduleId);
    
    // 💡 CHANGE 2: Clear any previous activeModule to reset to 'dashboard'
    // Optional: This ensures a new module/branch always starts on the dashboard tab.
    sessionStorage.removeItem("activeModule"); 

    // Navigate to the main dashboard page (client-side navigation)
    navigate("/");
    
    // ⭐️ CHANGE 3: Force a full page reload to reset the application state
    // and ensure the new branch ID is read by all components on mount.
    window.location.reload(); 
  };

  const loadModules = async () => {
    try {
      // NOTE: Using the fetched modules is currently commented out,
      // but the data structure and fetching logic are maintained.
      const res = await getModules();
      // setModules(res.data || res); 
    } catch (error) {
      console.error("Error loading modules", error);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 text-center px-4">
      {/* Logo */}
      <img
        src="logo.png" // Replace with your chicken logo path
        alt="Logo"
        className="w-20 mb-4"
      />

      {/* Welcome text */}
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-gray-500 mb-10">Please Select Your Branch</p>

      {/* Boxes */}
      <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8">
        {/* Feed Mill - Value "1" */}
        {/* <Card
          onClick={() => handleModuleClick("1")}
          className="cursor-pointer w-64 bg-gray-300 rounded-xl shadow-md flex flex-col items-center justify-between p-6 hover:shadow-lg transition-shadow hover:bg-gray-200"
        >
          <CardContent className="flex flex-col items-center">
            <div className="text-gray-700 text-3xl mb-4">
              <img
                src="feed_mill.png"
                alt="Feed Mill Icon"
                className="w-20 mb-4"
              />
            </div>
            <h2 className="text-lg font-medium">Feed Mill</h2>
          </CardContent>
        </Card> */}

        {/* Brokery - Value "2" */}

        {/* Medicine - Value "3" */}

      </div>
    </div>
  );
};

export default ModulesPage;