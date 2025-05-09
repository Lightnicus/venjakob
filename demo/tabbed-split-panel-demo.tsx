"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTabbedInterface } from '../project_components/tabbed-interface-provider';
import InteractiveSplitPanel from '../project_components/interactive-split-panel';
import SplitPanelLayout from '../project_components/split-panel-layout';
import OffersTreeTab from '../project_components/offers-tree-tab';

const TabbedSplitPanelDemo: React.FC = () => {
  const { openNewTab } = useTabbedInterface();

  const handleOpenBasicSplitPanel = () => {
    openNewTab({
      id: 'basic-split-panel',
      title: 'Einfache Split-Ansicht',
      content: <SplitPanelLayout />,
      closable: true,
    });
  };

  const handleOpenInteractiveSplitPanel = () => {
    openNewTab({
      id: 'interactive-split-panel',
      title: 'Interaktive Split-Ansicht',
      content: <InteractiveSplitPanel />,
      closable: true,
    });
  };

  const handleOpenCustomTreeTab = () => {
    openNewTab({
      id: 'custom-tree-tab',
      title: 'Benutzerdefinierter Baum',
      content: (
        <OffersTreeTab 
          offerId="demo-1" 
          offerName="Beispielangebot" 
        />
      ),
      closable: true,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Split Panel in Tabs</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Dieses Beispiel zeigt, wie Sie verschiedene Split-Panel-Komponenten in einer 
          Tab-Schnittstelle verwenden können. Klicken Sie auf die Schaltflächen unten,
          um verschiedene Arten von Split-Panels in neuen Tabs zu öffnen.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button onClick={handleOpenBasicSplitPanel}>
          Einfache Split-Ansicht öffnen
        </Button>
        
        <Button onClick={handleOpenInteractiveSplitPanel} variant="secondary">
          Interaktive Split-Ansicht öffnen
        </Button>
        
        <Button onClick={handleOpenCustomTreeTab} variant="outline">
          Benutzerdefinierte Baum-Ansicht öffnen
        </Button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Hinweis</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Dieses Demo zeigt, wie verschiedene Split-Panel-Varianten mit dem TabbedInterfaceProvider integriert werden können.
          In einer realen Anwendung könnten Sie diese Komponenten beispielsweise verwenden, um Daten-Explorer 
          oder hierarchische Inhaltsansichten zu implementieren.
        </p>
      </div>
    </div>
  );
};

export default TabbedSplitPanelDemo; 