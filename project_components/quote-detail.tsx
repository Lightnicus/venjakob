import React, { useState, useEffect } from 'react';
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
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import { toast } from 'sonner';
import { Edit3, Save } from 'lucide-react';
import type { MyTreeNodeData } from '@/project_components/custom-node';
import { 
  fetchQuotePositionsByVersion, 
  fetchLatestVariantForQuote, 
  fetchLatestVersionForVariant,
  fetchQuoteWithDetails,
  fetchVariantById,
  fetchVersionById
} from '@/lib/api/quotes';
import type { QuotePositionWithDetails } from '@/lib/db/quotes';

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
  const [tab, setTab] = useState('bloecke');
  const [dropdownValue, setDropdownValue] = useState('Kalkulation');
  const [isEditing, setIsEditing] = useState(false);
  const [treeData, setTreeData] = useState<MyTreeNodeData[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [resolvedVariantId, setResolvedVariantId] = useState<string | undefined>(variantId);
  const [resolvedVersionId, setResolvedVersionId] = useState<string | undefined>(versionId);
  const [loadingIds, setLoadingIds] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [variantNumber, setVariantNumber] = useState<string>('');
  const [versionNumber, setVersionNumber] = useState<string>('');
  const [loadingDisplayData, setLoadingDisplayData] = useState(false);
  const [offerPropsData, setOfferPropsData] = useState<any>(null);
  const { openNewTab } = useTabbedInterface();

  // Transform quote positions into tree data format
  const transformPositionsToTreeData = (
    positions: QuotePositionWithDetails[],
  ): MyTreeNodeData[] => {
    const treeData = positions.map(
      (position): MyTreeNodeData => ({
        id: position.id,
        name: position.title || position.description || 'Unnamed Position',
        type: position.articleId
          ? ('article' as const)
          : ('textblock' as const), // article for articles, textblock for blocks
      }),
    );
    return treeData;
  };

  // Resolve missing variantId and versionId
  useEffect(() => {
    const resolveIds = async () => {
      if (!quoteId) return;

      try {
        setLoadingIds(true);
        let currentVariantId = variantId;
        let currentVersionId = versionId;

        // If no variantId and no versionId, fetch latest variant and its latest version
        if (!variantId && !versionId) {
          const latestVariant = await fetchLatestVariantForQuote(quoteId);
          if (latestVariant) {
            currentVariantId = latestVariant.id;
            const latestVersion = await fetchLatestVersionForVariant(latestVariant.id);
            if (latestVersion) {
              currentVersionId = latestVersion.id;
            }
          }
        }
        // If variantId is provided but no versionId, fetch latest version for that variant
        else if (variantId && !versionId) {
          const latestVersion = await fetchLatestVersionForVariant(variantId);
          if (latestVersion) {
            currentVersionId = latestVersion.id;
          }
        }

        setResolvedVariantId(currentVariantId);
        setResolvedVersionId(currentVersionId);
      } catch (error) {
        console.error('Error resolving variant/version IDs:', error);
        toast.error('Fehler beim Laden der Varianten-/Versionsdaten');
      } finally {
        setLoadingIds(false);
      }
    };

    resolveIds();
  }, [quoteId, variantId, versionId]);

  // Fetch display data when resolved IDs change
  useEffect(() => {
    const fetchDisplayData = async () => {
      if (!quoteId || !resolvedVariantId || !resolvedVersionId) return;

      try {
        setLoadingDisplayData(true);
        
        // Fetch quote data with details, variant data, and version data in parallel
        const [quoteData, variantData, versionData] = await Promise.all([
          fetchQuoteWithDetails(quoteId),
          fetchVariantById(resolvedVariantId),
          fetchVersionById(resolvedVersionId)
        ]);

        if (quoteData) {
          setQuoteNumber(quoteData.quoteNumber || '');
        }
        
        if (variantData) {
          setVariantNumber(variantData.variantNumber?.toString() || '');
        }
        
        // Map database data to OfferProperties format when we have both quote and variant data
        if (quoteData && variantData) {
          const mappedOfferProps = {
            kunde: {
              id: quoteData.salesOpportunity?.client?.foreignId || '',
              name: quoteData.salesOpportunity?.client?.name || '',
              adresse: quoteData.salesOpportunity?.client?.address || '',
              telefon: quoteData.salesOpportunity?.client?.phone || '',
              casLink: quoteData.salesOpportunity?.client?.casLink || ''
            },
            empfaenger: {
              anrede: quoteData.salesOpportunity?.contactPerson?.salutation || '',
              name: quoteData.salesOpportunity?.contactPerson?.firstName || '',
              nachname: quoteData.salesOpportunity?.contactPerson?.name || '',
              telefon: quoteData.salesOpportunity?.contactPerson?.phone || '',
              email: quoteData.salesOpportunity?.contactPerson?.email || ''
            },
            preis: {
              showUnitPrices: false,
              calcTotal: false,
              total: 0,
              discount: 0,
              discountPercent: false,
              discountValue: 0
            },
            bemerkung: variantData.variantDescriptor || ''
          };
          setOfferPropsData(mappedOfferProps);
        }
        
        if (versionData) {
          setVersionNumber(versionData.versionNumber || '');
        }
      } catch (error) {
        console.error('Error fetching display data:', error);
        toast.error('Fehler beim Laden der Anzeige-Daten');
      } finally {
        setLoadingDisplayData(false);
      }
    };

    fetchDisplayData();
  }, [quoteId, resolvedVariantId, resolvedVersionId]);

  // Load quote positions when resolvedVersionId changes
  useEffect(() => {
    const loadPositions = async () => {
      if (!resolvedVersionId) {
        console.log(
          'QuoteDetail: No resolvedVersionId available, setting empty tree data',
        );
        setTreeData([]);
        return;
      }

      try {
        setLoadingPositions(true);
        const positions = await fetchQuotePositionsByVersion(resolvedVersionId);
        const transformedData = transformPositionsToTreeData(positions);
        setTreeData(transformedData);
      } catch (error) {
        console.error('Error loading quote positions:', error);
        toast.error('Fehler beim Laden der Angebotspositionen');
        setTreeData([]);
      } finally {
        setLoadingPositions(false);
      }
    };

    loadPositions();
  }, [resolvedVersionId]);

  const handleCreateVariant = () => {
    const newVariantId = resolvedVariantId ? `${resolvedVariantId}-neu` : 'V1';
    openNewTab({
      id: `angebot-variante-${Date.now()}`,
      title: `${title} (${newVariantId})`,
      content: (
        <QuoteDetail
          title={title}
          quoteId={quoteId}
          variantId={newVariantId}
          versionId={resolvedVersionId}
          language={language}
        />
      ),
      closable: true,
    });
  };

  const handlePublishClick = () => {
    toast('Angebot wurde veröffentlicht.');
  };

  const handleEditClick = () => {
    if (isEditing) {
      // Save logic here
      toast('Änderungen wurden gespeichert.');
    } else {
      toast('Bearbeitungsmodus aktiviert.');
    }
    setIsEditing(!isEditing);
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
            `Angebot ${quoteNumber}-${variantNumber} v${versionNumber}`
          ) : (
            title
          )}
        </h2>
        {language && (
          <p className="text-sm text-gray-500 mb-2">Sprache: {language}</p>
        )}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            className={`flex items-center gap-1 ${isEditing ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
            tabIndex={0}
            aria-label={isEditing ? 'Speichern' : 'Bearbeiten'}
            onClick={handleEditClick}
          >
            {isEditing ? (
              <>
                <Save size={14} className="inline-block" /> Speichern
              </>
            ) : (
              <>
                <Edit3 size={14} className="inline-block" /> Bearbeiten
              </>
            )}
          </Button>
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
          >
            Variante erstellen
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
              <p className="text-gray-500">Lade Angebotspositionen...</p>
            </div>
          ) : (
            <InteractiveSplitPanel initialTreeData={treeData} />
          )}
        </TabsContent>
        <TabsContent
          value="eigenschaften"
          className="flex-1 overflow-auto flex items-center justify-center"
        >
          {offerPropsData ? (
            <OfferProperties {...offerPropsData} />
          ) : (
            <div className="text-gray-500">Lade Angebotseigenschaften...</div>
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
      <div className="mt-2 text-xs text-gray-500 text-left">
        Zuletzt geändert am 01.05.2024 von Max Mustermann
      </div>
    </div>
  );
};

export default QuoteDetail;
