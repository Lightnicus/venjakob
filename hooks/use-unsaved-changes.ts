import { useState, useCallback, useMemo } from 'react';

export interface UnsavedChange {
  id: string;
  type: 'title' | 'description' | 'quantity' | 'unitPrice' | 'totalPrice' | 'articleCost';
  oldValue: any;
  newValue: any;
}

export interface PositionChanges {
  [positionId: string]: {
    [field: string]: {
      oldValue: any;
      newValue: any;
    };
  };
}

export const useUnsavedChanges = () => {
  const [changes, setChanges] = useState<PositionChanges>({});

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(changes).length > 0;
  }, [changes]);

  const getPositionChanges = useCallback((positionId: string) => {
    return changes[positionId] || {};
  }, [changes]);

  const hasPositionChanges = useCallback((positionId: string) => {
    return positionId in changes && Object.keys(changes[positionId]).length > 0;
  }, [changes]);

  const addChange = useCallback((
    positionId: string, 
    field: string, 
    oldValue: any, 
    newValue: any
  ) => {
    setChanges(prev => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        [field]: { oldValue, newValue }
      }
    }));
  }, []);

  const removeChange = useCallback((positionId: string, field?: string) => {
    setChanges(prev => {
      const newChanges = { ...prev };
      if (field) {
        // Remove specific field change
        if (newChanges[positionId]) {
          const { [field]: removed, ...remaining } = newChanges[positionId];
          if (Object.keys(remaining).length === 0) {
            delete newChanges[positionId];
          } else {
            newChanges[positionId] = remaining;
          }
        }
      } else {
        // Remove all changes for this position
        delete newChanges[positionId];
      }
      return newChanges;
    });
  }, []);

  const clearAllChanges = useCallback(() => {
    setChanges({});
  }, []);

  const getChangesForSave = useCallback(() => {
    const saveData: Array<{
      id: string;
      [field: string]: any;
    }> = [];

    Object.entries(changes).forEach(([positionId, fieldChanges]) => {
      const positionData: any = { id: positionId };
      
      Object.entries(fieldChanges).forEach(([field, { newValue }]) => {
        positionData[field] = newValue;
      });
      
      saveData.push(positionData);
    });

    return saveData;
  }, [changes]);

  return {
    changes,
    hasUnsavedChanges,
    getPositionChanges,
    hasPositionChanges,
    addChange,
    removeChange,
    clearAllChanges,
    getChangesForSave,
  };
}; 