"use client";

import React from 'react';
import ArboristTreeDemo from '../demo/arborist-tree-demo';

interface SplitPanelLayoutProps {
  rightPanelContent?: React.ReactNode;
}

const SplitPanelLayout: React.FC<SplitPanelLayoutProps> = ({
  rightPanelContent
}) => {
  return (
    <div className="flex h-full w-full border rounded-md overflow-hidden">
      {/* Left Panel - 1/3 width */}
      <div className="w-1/3 border-r bg-white dark:bg-gray-800 overflow-auto">
        <ArboristTreeDemo />
      </div>

      {/* Right Panel - 2/3 width */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
        {rightPanelContent || (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="mb-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
              <h2 className="text-xl font-medium mb-4">Rechtes Panel</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Wählen Sie einen Eintrag aus dem Baum auf der linken Seite, um Details anzuzeigen.
              </p>
              <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mt-4">
                <p className="text-gray-500 dark:text-gray-400">Platzhalter für Inhalte</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPanelLayout; 