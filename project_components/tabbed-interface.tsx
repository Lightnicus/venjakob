'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import { Button } from '@/components/ui/button';
export function TabbedInterface() {
  const { openTabs, activeTabId, setActiveTab, closeTab } =
    useTabbedInterface();

  return (
    <div className="w-full">
      {openTabs.length > 0 ? (
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
                {openTabs.map(tab => (
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

              {openTabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="m-0 p-4">
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
