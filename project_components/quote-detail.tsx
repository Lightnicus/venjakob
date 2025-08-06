import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InteractiveSplitPanel from '@/project_components/interactive-split-panel';
import OfferProperties from '@/project_components/offer-properties';
import PdfPreview from '@/project_components/pdf-preview';
import OfferVersionsTable from '@/project_components/offer-versions-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTabbedInterface, useTabReload } from '@/project_components/tabbed-interface-provider';
import { toast } from 'sonner';
import { Edit3, Save, RotateCcw, Loader2 } from 'lucide-react';
import type { MyTreeNodeData } from '@/project_components/custom-node';
import { fetchCompleteQuoteData, saveQuotePositions, copyQuoteVariantAPI } from '@/lib/api/quotes';
import type { QuotePositionWithDetails } from '@/lib/db/quotes';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { formatGermanDate } from '@/helper/date-formatter';
import EditLockButton from '@/project_components/edit-lock-button';
import { LoadingIndicator } from './loading-indicator';

type QuoteDetailProps = {
  title: string;
  quoteId?: string;
  variantId?: string;
  versionId?: string;
  language?: string;
};

const QuoteDetail: React.FC<QuoteDetailProps> = ({
  title,
  quoteId,
  variantId,
  versionId,
  language,
}) => {
  // UI State
  const [tab, setTab] = useState('bloecke');
  const [dropdownValue, setDropdownValue] = useState('Kalkulation');
  const [isEditing, setIsEditing] = useState(false);

  // Data State
  const [treeData, setTreeData] = useState<MyTreeNodeData[]>([]);
  const [offerPropsData, setOfferPropsData] = useState<any>(null);

  // Loading States
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingIds, setLoadingIds] = useState(false);
  const [loadingDisplayData, setLoadingDisplayData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopyingVariant, setIsCopyingVariant] = useState(false);

  // Resolved IDs
  const [resolvedVariantId, setResolvedVariantId] = useState<string | undefined>(variantId);
  const [resolvedVersionId, setResolvedVersionId] = useState<string | undefined>(versionId);

  // Display Data
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [variantNumber, setVariantNumber] = useState<string>('');
  const [versionNumber, setVersionNumber] = useState<string>('');

  // Variant Configuration
  const [variantLanguageId, setVariantLanguageId] = useState<string | undefined>(undefined);

  // Metadata
  const [lastChangedInfo, setLastChangedInfo] = useState<{
    userName: string | null;
    timestamp: string | null;
  } | null>(null);

  const { openNewTab } = useTabbedInterface();
  
  // Set up reload functionality for quotes - triggers reload in other tabs (like QuotesManagement)
  const { triggerReload } = useTabReload('quotes', () => {});

  // Move change tracking to this level
  const {
    hasUnsavedChanges,
    getChangesForSave,
    clearAllChanges,
    hasPositionChanges,
    addChange,
    removeChange,
    getPositionChanges,
  } = useUnsavedChanges();

  // Transform quote positions into tree data format
  const transformPositionsToTreeData = (
    positions: QuotePositionWithDetails[],
  ): MyTreeNodeData[] => {
    // Create a map of position ID to position node
    const positionMap = new Map<string, MyTreeNodeData>();
    
    // First pass: create all nodes
    positions.forEach(position => {
      positionMap.set(position.id, {
        id: position.id,
        name: position.title || position.description || 'Unnamed Position',
        type: position.articleId ? ('article' as const) : ('textblock' as const),
        description: position.description || '',
        title: position.title || '',
        children: []
      });
    });
    
    // Second pass: build the tree structure
    const rootNodes: MyTreeNodeData[] = [];
    
    positions.forEach(position => {
      const node = positionMap.get(position.id);
      if (!node) return;
      
      if (position.quotePositionParentId) {
        // This is a child node
        const parentNode = positionMap.get(position.quotePositionParentId);
        if (parentNode) {
          if (!parentNode.children) {
            parentNode.children = [];
          }
          parentNode.children.push(node);
        }
      } else {
        // This is a root node
        rootNodes.push(node);
      }
    });
    
    return rootNodes;
  };

  // Fetch all quote data in one consolidated call
  const fetchAllData = useCallback(async () => {
    if (!quoteId) return;

    try {
      setLoadingIds(true);
      setLoadingDisplayData(true);
      setLoadingPositions(true);
      
      // Fetch all data in one consolidated API call
      const completeData = await fetchCompleteQuoteData(quoteId, variantId, versionId);
      
      // Update resolved IDs
      setResolvedVariantId(completeData.resolvedVariantId || undefined);
      setResolvedVersionId(completeData.resolvedVersionId || undefined);
      
      // Update display data
      if (completeData.quote) {
        setQuoteNumber(completeData.quote.quoteNumber || '');
      }
      
      if (completeData.variant) {
        setVariantNumber(completeData.variant.variantNumber?.toString() || '');
        setVariantLanguageId(completeData.variant.languageId);
      }
      
      if (completeData.version) {
        setVersionNumber(completeData.version.versionNumber?.toString() || '');
      }
      
      // Set last changed information from version data
      if (completeData.version?.modifiedByUserName && completeData.version?.updatedAt) {
        setLastChangedInfo({
          userName: completeData.version.modifiedByUserName,
          timestamp: completeData.version.updatedAt,
        });
      } else {
        setLastChangedInfo(null);
      }
      
      // Update positions tree data
      if (completeData.positions) {
        const transformedData = transformPositionsToTreeData(completeData.positions);
        setTreeData(transformedData);
      } else {
        setTreeData([]);
      }
      
      // Set offer properties data
      if (completeData.offerPropsData) {
        setOfferPropsData(completeData.offerPropsData);
      }
      
    } catch (error) {
      console.error('Error fetching complete quote data:', error);
      toast.error('Fehler beim Laden der Angebotsdaten');
      setTreeData([]);
    } finally {
      setLoadingIds(false);
      setLoadingDisplayData(false);
      setLoadingPositions(false);
    }
  }, [quoteId, variantId, versionId]);



  const formatLastChangedText = () => {
    if (!lastChangedInfo) return null;
    
    const { userName, timestamp } = lastChangedInfo;
    const userNameDisplay = userName || 'Unbekannt';
    
    if (!timestamp) {
      return `Zuletzt geändert von ${userNameDisplay}`;
    }
    
    const formattedDate = formatGermanDate(timestamp);
    return `Zuletzt geändert am ${formattedDate} von ${userNameDisplay}`;
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Focused data refresh function for EditLockButton
  const loadQuoteVersionData = useCallback(async () => {
    if (!quoteId || !resolvedVersionId) return;
    
    try {
      const completeData = await fetchCompleteQuoteData(quoteId, variantId, resolvedVersionId);
      
      // Update only version-specific data
      if (completeData.version) {
        setVersionNumber(completeData.version.versionNumber || '');
      }
      
      // Update positions tree data
      if (completeData.positions) {
        const transformedData = transformPositionsToTreeData(completeData.positions);
        setTreeData(transformedData);
      }
      
      // Update last changed info
      if (completeData.version?.modifiedByUserName && completeData.version?.updatedAt) {
        setLastChangedInfo({
          userName: completeData.version.modifiedByUserName,
          timestamp: completeData.version.updatedAt,
        });
      }
      
    } catch (error) {
      console.error('Error refreshing quote version data:', error);
      throw error; // Let EditLockButton handle the error
    }
  }, [quoteId, resolvedVersionId, variantId]);

  const handleCreateVariant = async () => {
    if (!resolvedVariantId) {
      toast.error('Keine Variante zum Kopieren verfügbar.');
      return;
    }

    setIsCopyingVariant(true);
    try {
      const copiedVariant = await copyQuoteVariantAPI(resolvedVariantId);
      
      // Trigger reload for other tabs (like QuotesManagement) since we created a new variant
      triggerReload();
      
      // Open new tab with copied variant
      openNewTab({
        id: `variant-${copiedVariant.id}`,
        title: `${title} - Variante ${copiedVariant.variantNumber}`,
        content: <QuoteDetail title={title} quoteId={quoteId} variantId={copiedVariant.id} />,
        closable: true
      });

      toast.success(`Variante "${title} - ${copiedVariant.variantNumber}" wurde kopiert`);
    } catch (error) {
      console.error('Error copying variant:', error);
      toast.error('Fehler beim Kopieren der Variante');
    } finally {
      setIsCopyingVariant(false);
    }
  };

  const handlePublishClick = () => {
    toast('Angebot wurde veröffentlicht.');
  };

  const handleEditClick = async () => {
    if (isEditing) {
      // Save logic here
      if (hasUnsavedChanges) {
        await handleSaveChanges();
      } else {
        toast('Keine Änderungen zum Speichern vorhanden.');
      }
    } else {
      toast('Bearbeitungsmodus aktiviert.');
    }
    setIsEditing(!isEditing);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCancelClick = () => {
    // Clear all unsaved changes
    clearAllChanges();
    // Switch back to view mode
    setIsEditing(false);
    toast('Änderungen verworfen. Bearbeitungsmodus beendet.');
  };

  const handleSaveChanges = async () => {
    if (!resolvedVersionId) {
      toast.error('Keine Version für das Speichern verfügbar.');
      return;
    }

    setIsSaving(true);
    try {
      // Get changes from the interactive split panel
      const changesToSave = getChangesForSave();
      
      if (changesToSave.length === 0) {
        toast('Keine Änderungen zum Speichern vorhanden.');
        return;
      }

      await saveQuotePositions(resolvedVersionId, changesToSave);
      toast.success('Änderungen wurden erfolgreich gespeichert.');
      
      // Trigger reload for other tabs (like QuotesManagement)
      triggerReload();
      
      // Update tree data with saved values
      setTreeData(prevData => {
        const updateNode = (nodes: MyTreeNodeData[]): MyTreeNodeData[] => {
          return nodes.map(node => {
            const change = changesToSave.find(c => c.id === node.id);
            if (change) {
              return {
                ...node,
                title: change.title || node.title,
                description: change.description || node.description,
              };
            }
            if (node.children) {
              return {
                ...node,
                children: updateNode(node.children),
              };
            }
            return node;
          });
        };
        return updateNode([...prevData]);
      });
      
      clearAllChanges();
      
    } catch (error: any) {
      console.error('Error saving changes:', error);
      
      // Handle edit lock errors
      if (error.response?.data?.type === 'EDIT_LOCK_ERROR') {
        toast.error(`Fehler beim Speichern: ${error.response.data.error}`);
        // Exit edit mode if lock was lost
        setIsEditing(false);
        return;
      }
      
      toast.error('Fehler beim Speichern der Änderungen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <h2
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
          tabIndex={0}
          aria-label="Angebots-Titel"
        >
          {loadingIds || loadingDisplayData ? (
            'Lade Angebotsdaten...'
          ) : quoteNumber && variantNumber && versionNumber ? (
            `${quoteNumber}-${variantNumber}-${versionNumber}`
          ) : (
            'Angebot'
          )}
        </h2>
        {language && (
          <p className="text-sm text-gray-500 mb-2">Sprache: {language}</p>
        )}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {resolvedVersionId && (
            <EditLockButton
              resourceType="quote-versions"
              resourceId={resolvedVersionId}
              isEditing={isEditing}
              isSaving={isSaving}
              onToggleEdit={handleToggleEdit}
              onSave={handleSaveChanges}
              onRefreshData={loadQuoteVersionData}
              initialUpdatedAt={lastChangedInfo?.timestamp || undefined}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            tabIndex={0}
            aria-label="Veröffentlichen"
            onClick={handlePublishClick}
          >
            Veröffentlichen
          </Button>
          <Select value={dropdownValue} onValueChange={setDropdownValue}>
            <SelectTrigger
              className="h-9 px-4 py-2 text-sm w-[200px]"
              aria-label="Kalkulation Aktionen"
              tabIndex={0}
            >
              <SelectValue placeholder="Kalkulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kalkulation">Kalkulation</SelectItem>
              <SelectItem value="Kalkulation öffnen">
                Kalkulation öffnen
              </SelectItem>
              <SelectItem value="Kalkulation aktualisieren">
                Kalkulation aktualisieren
              </SelectItem>
              <SelectItem value="Kalkulation neu erstellen">
                Kalkulation neu erstellen
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            tabIndex={0}
            aria-label="Variante erstellen"
            onClick={handleCreateVariant}
            disabled={isCopyingVariant}
          >
            {isCopyingVariant ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Kopiere Variante...
              </>
            ) : (
              'Variante erstellen'
            )}
          </Button>
        </div>
      </div>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="shrink-0 bg-white dark:bg-gray-800 p-0 border-b flex flex-wrap gap-2 justify-start rounded-none w-full">
          <TabsTrigger
            value="bloecke"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
          >
            Blöcke
          </TabsTrigger>
          <TabsTrigger
            value="eigenschaften"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
          >
            Eigenschaften
          </TabsTrigger>
          <TabsTrigger
            value="vorschau"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
          >
            Vorschau
          </TabsTrigger>
          <TabsTrigger
            value="versionen"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
          >
            Versionen
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bloecke" className="flex-1 overflow-auto">
          {loadingPositions || loadingIds || loadingDisplayData ? (
            <div className="flex items-center justify-center h-full">
              <LoadingIndicator text="Lade Angebotspositionen..." variant="centered" />
            </div>
          ) : !variantLanguageId ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Keine Sprache für diese Variante definiert.</p>
            </div>
          ) : (
            <InteractiveSplitPanel 
              initialTreeData={treeData} 
              isEditing={isEditing} 
              versionId={resolvedVersionId}
              onTreeDataChange={setTreeData}
              addChange={addChange}
              removeChange={removeChange}
              hasPositionChanges={hasPositionChanges}
              getPositionChanges={getPositionChanges}
              onRefreshRequested={() => {
                // Trigger a re-fetch of the data
                if (quoteId) {
                  fetchAllData();
                }
              }}
              languageId={variantLanguageId}
            />
          )}
        </TabsContent>
        <TabsContent
          value="eigenschaften"
          className="flex-1 overflow-auto flex items-center justify-center"
        >
          {offerPropsData ? (
            <OfferProperties {...offerPropsData} />
          ) : (
            <LoadingIndicator text="Lade Angebotseigenschaften..." variant="centered" />
          )}
        </TabsContent>
        <TabsContent
          value="vorschau"
          className="flex-1 overflow-auto flex items-center justify-center"
        >
          <PdfPreview file="/dummy.pdf" />
        </TabsContent>
        <TabsContent
          value="versionen"
          className="flex-1 overflow-auto flex items-center justify-center"
        >
          <OfferVersionsTable />
        </TabsContent>
      </Tabs>
      {formatLastChangedText() && (
        <div className="mt-2 text-xs text-gray-500 text-left">
          {formatLastChangedText()}
        </div>
      )}
    </div>
  );
};

export default QuoteDetail;
