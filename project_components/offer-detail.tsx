import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InteractiveSplitPanel from './interactive-split-panel';
import OfferProperties, { OfferPropertiesProps } from './offer-properties';
import offerPropertiesData from '../data/offer-properties.json';
import PdfPreview from './pdf-preview';
import OfferVersionsTable from './offer-versions-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EnterOrderConfirmationNumberDialog from './enter-order-confirmation-number-dialog';
import { useTabbedInterface } from './tabbed-interface-provider';
import { toast } from "sonner";

type OfferDetailProps = { 
  title: string;
  variantId?: string;
  language?: string;
};

const OfferDetail: React.FC<OfferDetailProps> = ({ title, variantId, language }) => {
  const [tab, setTab] = useState('bloecke');
  const [dropdownValue, setDropdownValue] = useState('Kalkulation');
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const { openNewTab } = useTabbedInterface();
  
  // You can use variantId and language here to fetch specific offer data if needed
  
  const handleOrderConfirmationClick = () => {
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmationNumber = (confirmationNumber: string) => {
    console.log('Auftragsbestätigungsnummer:', confirmationNumber);
    // Hier kann die weitere Logik implementiert werden
  };
  
  const handleCreateVariant = () => {
    const newVariantId = variantId ? `${variantId}-neu` : 'V1';
    openNewTab({
      id: `angebot-variante-${Date.now()}`,
      title: `${title} (${newVariantId})`,
      content: <OfferDetail title={title} variantId={newVariantId} language={language} />,
      closable: true
    });
  };

  const handlePublishClick = () => {
    toast("Angebot wurde veröffentlicht.");
  };
  
  const handleEditClick = () => {
    toast("Bearbeiten Button wurde geklickt. Nicht sicher wofür der genutzt wird?");
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" tabIndex={0} aria-label="Angebotstitel">{title}</h2>
        {variantId && <p className="text-sm text-gray-500 mb-2">Varianten-ID: {variantId}</p>}
        {language && <p className="text-sm text-gray-500 mb-2">Sprache: {language}</p>}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1" tabIndex={0} aria-label="Bearbeiten" onClick={handleEditClick}>Bearbeiten</Button>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            tabIndex={0} 
            aria-label="Auftragsbestätigung"
            onClick={handleOrderConfirmationClick}
          >
            Auftragsbestätigung
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
              <SelectItem value="Kalkulation öffnen">Kalkulation öffnen</SelectItem>
              <SelectItem value="Kalkulation aktualisieren">Kalkulation aktualisieren</SelectItem>
              <SelectItem value="Kalkulation neu erstellen">Kalkulation neu erstellen</SelectItem>
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
      <Tabs value={tab} onValueChange={setTab} className="w-full h-full flex flex-col">
        <TabsList className="shrink-0 bg-white dark:bg-gray-800 p-0 border-b flex flex-wrap gap-2 justify-start rounded-none w-full">
          <TabsTrigger value="bloecke" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Blöcke</TabsTrigger>
          <TabsTrigger value="eigenschaften" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Eigenschaften</TabsTrigger>
          <TabsTrigger value="vorschau" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Vorschau</TabsTrigger>
          <TabsTrigger value="versionen" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Versionen</TabsTrigger>
        </TabsList>
        <TabsContent value="bloecke" className="flex-1 overflow-auto">
          <InteractiveSplitPanel />
        </TabsContent>
        <TabsContent value="eigenschaften" className="flex-1 overflow-auto flex items-center justify-center">
          <OfferProperties {...(offerPropertiesData as OfferPropertiesProps)} />
        </TabsContent>
        <TabsContent value="vorschau" className="flex-1 overflow-auto flex items-center justify-center">
          <PdfPreview file="/dummy.pdf" />
        </TabsContent>
        <TabsContent value="versionen" className="flex-1 overflow-auto flex items-center justify-center">
          <OfferVersionsTable />
        </TabsContent>
      </Tabs>
      <div className="mt-2 text-xs text-gray-500 text-left">Zuletzt geändert am 01.05.2024 von Max Mustermann</div>
      
      <EnterOrderConfirmationNumberDialog 
        isOpen={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
        onConfirm={handleConfirmationNumber}
      />
    </div>
  );
};

export default OfferDetail; 