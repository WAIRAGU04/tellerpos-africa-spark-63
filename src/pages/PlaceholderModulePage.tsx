
import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLocation } from 'react-router-dom';

const PlaceholderModulePage = () => {
  const location = useLocation();
  const moduleName = location.pathname.split('/').pop() || 'module';
  const formattedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white dark:bg-tellerpos-dark-accent rounded-lg p-10 shadow">
          <h1 className="text-4xl font-bold mb-6 text-tellerpos">{formattedModuleName} Module</h1>
          <div className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            <span className="inline-block px-4 py-2 bg-tellerpos/10 text-tellerpos rounded-md font-bold text-2xl">
              Coming Soon
            </span>
          </div>
          <p className="mb-6 text-gray-500 dark:text-gray-400 max-w-2xl">
            We're currently working on bringing you the best {formattedModuleName.toLowerCase()} management experience. 
            This module will be available in the next update.
          </p>
          <div className="w-24 h-1 bg-tellerpos rounded-full"></div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlaceholderModulePage;
