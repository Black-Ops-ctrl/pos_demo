import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Factory, PillBottle, Bot } from "lucide-react"; // Example icons
import { getModules } from "@/api/modulesApi";
import logo from "src\\assets\\logo.png";
import { useNavigate } from "react-router-dom";

interface Modules {
  module_id: number;
  module_name: string;
}

const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Modules[]>([]);
  const navigate = useNavigate();

  /**
   * Function to handle card clicks, save the selected branch ID, and navigate.
   * @param moduleId - The ID of the selected branch/module (e.g., "1", "2", "3").
   */
  const handleModuleClick = (moduleId: string) => {
    // 💡 CHANGE 1: Store the selected module ID in sessionStorage for global access
    sessionStorage.setItem("selectedBranchId", moduleId);

    // Navigate to the main dashboard page
    navigate("/");
  };

  const loadModules = async () => {
    try {
      // NOTE: Using the fetched modules is currently commented out,
      // but the data structure and fetching logic are maintained.
      const res = await getModules();
      // setModules(res.data || res); 
      // For demonstration, we'll keep the static cards, but if dynamic is needed:
      // const fetchedModules: Modules[] = res.data || res;
      // setModules(fetchedModules); 
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
        <Card
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
        </Card>

        {/* Brokery - Value "2" */}
        <Card
          onClick={() => handleModuleClick("2")}
          className="cursor-pointer w-64 bg-gray-300 rounded-xl shadow-md flex flex-col items-center justify-between p-6 hover:shadow-lg transition-shadow hover:bg-gray-200"
        >
          <CardContent className="flex flex-col items-center">
            <div className="text-gray-700 text-3xl mb-4">
              <img
                src="brokery.png"
                alt="Brokery Icon"
                className="w-20 mb-4"
              />
            </div>
            <h2 className="text-lg font-medium">Brokery</h2>
          </CardContent>
        </Card>

        {/* Medicine - Value "3" */}
        <Card
          onClick={() => handleModuleClick("3")}
          className="cursor-pointer w-64 bg-gray-300 rounded-xl shadow-md flex flex-col items-center justify-between p-6 hover:shadow-lg transition-shadow hover:bg-gray-200"
        >
          <CardContent className="flex flex-col items-center">
            <div className="text-gray-700 text-3xl mb-4">
              <img
                src="medicon.png"
                alt="Medicine Icon"
                className="w-20 mb-4"
              />
            </div>
            <h2 className="text-lg font-medium">Medicine</h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModulesPage;