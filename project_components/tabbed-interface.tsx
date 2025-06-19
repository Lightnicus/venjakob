'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import { tabMappings, hasTabPermissions } from '@/helper/menu';
import { useUser } from './use-user';
import { useEffect } from 'react';

export function TabbedInterface() {
  const { openTabs, activeTabId, setActiveTab, closeTab } =
    useTabbedInterface();
  const { hasPermission, loading: userLoading } = useUser();

  // Filter tabs based on permissions
  const getAccessibleTabs = () => {
    if (userLoading) return openTabs; // Show all tabs while loading to avoid flicker
    
    return openTabs.filter(tab => {
      // Find the corresponding tab definition by ID
      const tabDefinition = Object.values(tabMappings).find(def => def.id === tab.id);
      
      if (!tabDefinition) {
        // If no tab definition found, allow the tab (might be a dynamic tab)
        return true;
      }
      
      return hasTabPermissions(tabDefinition, hasPermission);
    });
  };

  // Close tabs that user no longer has permission to access
  useEffect(() => {
    if (!userLoading) {
      const accessibleTabs = getAccessibleTabs();
      const accessibleTabIds = accessibleTabs.map(tab => tab.id);
      
      // Close tabs that are no longer accessible
      openTabs.forEach(tab => {
        if (!accessibleTabIds.includes(tab.id)) {
          closeTab(tab.id);
        }
      });
    }
  }, [userLoading, hasPermission, openTabs, closeTab]);

  const accessibleTabs = getAccessibleTabs();

  return (
    <div className="w-full">
      {accessibleTabs.length > 0 ? (
        <div className="w-full border rounded">
          <div className="flex-1 overflow-x-auto border-b last:border-b-0">
            <Tabs
              value={activeTabId || ''} // Ensure value is not null
              onValueChange={newTabId => {
                if (newTabId) setActiveTab(newTabId);
              }}
              className="w-full"
            >
              <TabsList className="h-auto bg-white p-0 rounded-tl-none">
                {accessibleTabs.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
                    aria-label={`Tab ${tab.title}`}
                  >
                    {tab.title}
                    {(tab.closable === undefined || tab.closable === true) && (
                      <div
                        className="cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          closeTab(tab.id);
                        }}
                      >
                        <X
                          className="ml-2 h-4 w-4 cursor-pointer hover:text-red-500"
                          tabIndex={0}
                          role="button"
                          aria-label={`Schließe Tab ${tab.title}`}
                        />
                      </div>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {accessibleTabs.map(tab => (
                <TabsContent 
                  key={tab.id} 
                  value={tab.id} 
                  className="m-0 p-4"
                  forceMount={true}
                  style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
                >
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 border rounded">
          Wählen Sie eine Ansicht aus dem Hauptmenü oben, um einen Tab zu
          öffnen.
        </div>
      )}
    </div>
  );
}
