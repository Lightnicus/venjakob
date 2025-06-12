'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

// Define the shape of a tab
export interface Tab {
  id: string;
  title: string;
  content: ReactNode; // The component/content to render for this tab
  closable?: boolean; // Optional: defaults to true if not specified
  reloadKey?: string; // Optional: key to identify which tabs should reload when this changes
}

// Define reload signals
export interface ReloadSignal {
  key: string;
  timestamp: number;
}

// Define the shape of the context
interface TabbedInterfaceContextType {
  openTabs: Tab[];
  activeTabId: string | null;
  openNewTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, newTitle: string) => void;
  triggerReload: (reloadKey: string) => void;
  getReloadSignal: (reloadKey: string) => ReloadSignal | undefined;
}

// Create the context with a default undefined value
const TabbedInterfaceContext = createContext<TabbedInterfaceContextType | undefined>(undefined);

// Define the props for the provider
interface TabbedInterfaceProviderProps {
  children: ReactNode;
  initialTabs?: Tab[]; // Optional initial set of tabs
  defaultActiveTabId?: string; // Optional default active tab
}

export const TabbedInterfaceProvider: React.FC<TabbedInterfaceProviderProps> = ({
  children,
  initialTabs = [],
  defaultActiveTabId,
}) => {
  const [openTabs, setOpenTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabIdState] = useState<string | null>(() => {
    if (defaultActiveTabId && initialTabs.some(t => t.id === defaultActiveTabId)) {
      return defaultActiveTabId;
    }
    return initialTabs.length > 0 ? initialTabs[0].id : null;
  });
  const [reloadSignals, setReloadSignals] = useState<Map<string, ReloadSignal>>(new Map());

  const openNewTab = useCallback((tab: Tab) => {
    setOpenTabs(prevTabs => {
      if (prevTabs.find(t => t.id === tab.id)) {
        // If tab already exists, just make it active
        setActiveTabIdState(tab.id);
        return prevTabs;
      }
      return [...prevTabs, tab];
    });
    setActiveTabIdState(tab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prevTabs => {
      const tabToCloseIndex = prevTabs.findIndex(t => t.id === tabId);
      if (tabToCloseIndex === -1) return prevTabs; // Tab not found

      const tabToClose = prevTabs[tabToCloseIndex];
      if (tabToClose && tabToClose.closable === false) {
        return prevTabs; // Do not close if explicitly not closable
      }

      const newTabs = prevTabs.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        if (newTabs.length > 0) {
          // Determine the new active tab:
          // 1. If there was a tab at the same index (because the one before it was closed), activate it.
          // 2. Otherwise, activate the new last tab (which was the one to the left of the closed tab).
          const newActiveTab = newTabs[tabToCloseIndex] || newTabs[Math.max(0, tabToCloseIndex - 1)];
          setActiveTabIdState(newActiveTab ? newActiveTab.id : null);
        } else {
          setActiveTabIdState(null);
        }
      }
      return newTabs;
    });
  }, [activeTabId]);

  const setActiveTab = useCallback((tabId: string) => {
    if (openTabs.some(t => t.id === tabId)) {
      setActiveTabIdState(tabId);
    }
  }, [openTabs]);

  const updateTabTitle = useCallback((tabId: string, newTitle: string) => {
    setOpenTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId ? { ...tab, title: newTitle } : tab
      )
    );
  }, []);

  const triggerReload = useCallback((reloadKey: string) => {
    const signal: ReloadSignal = {
      key: reloadKey,
      timestamp: Date.now()
    };
    setReloadSignals(prev => new Map(prev.set(reloadKey, signal)));
  }, []);

  const getReloadSignal = useCallback((reloadKey: string) => {
    return reloadSignals.get(reloadKey);
  }, [reloadSignals]);

  const contextValue = useMemo(() => ({
    openTabs,
    activeTabId,
    openNewTab,
    closeTab,
    setActiveTab,
    updateTabTitle,
    triggerReload,
    getReloadSignal,
  }), [openTabs, activeTabId, openNewTab, closeTab, setActiveTab, updateTabTitle, triggerReload, getReloadSignal]);

  return (
    <TabbedInterfaceContext.Provider value={contextValue}>
      {children}
    </TabbedInterfaceContext.Provider>
  );
};

// Custom hook to use the tab context
export const useTabbedInterface = (): TabbedInterfaceContextType => {
  const context = useContext(TabbedInterfaceContext);
  if (context === undefined) {
    throw new Error('useTabbedInterface must be used within a TabbedInterfaceProvider');
  }
  return context;
};

// Custom hook for components to handle reload signals
export const useTabReload = (reloadKey: string, onReload: () => void) => {
  const { getReloadSignal, triggerReload } = useTabbedInterface();
  const [lastReloadTime, setLastReloadTime] = useState<number>(0);

  // Check for reload signals
  useEffect(() => {
    const signal = getReloadSignal(reloadKey);
    if (signal && signal.timestamp > lastReloadTime) {
      setLastReloadTime(signal.timestamp);
      onReload();
    }
  }, [getReloadSignal, reloadKey, lastReloadTime, onReload]);

  // Return function to trigger reload for other tabs
  return {
    triggerReload: () => triggerReload(reloadKey)
  };
};

// Custom hook for components to update their tab title
export const useTabTitle = (tabId: string) => {
  const { updateTabTitle } = useTabbedInterface();
  
  return {
    updateTitle: (newTitle: string) => updateTabTitle(tabId, newTitle)
  };
}; 