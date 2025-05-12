import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InteractiveSplitPanel from './interactive-split-panel';
import OfferProperties, { OfferPropertiesProps } from './offer-properties';
import offerPropertiesData from '../data/offer-properties.json';
import PdfPreview from './pdf-preview';
import OfferVersionsTable from './offer-versions-table';

type OfferDetailProps = { title: string };

const OfferDetail: React.FC<OfferDetailProps> = ({ title }) => {
  const [tab, setTab] = useState('bloecke');
  const [dropdownValue, setDropdownValue] = useState('Kalkulation öffnen');
  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" tabIndex={0} aria-label="Angebotstitel">{title}</h2>
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-100 font-medium focus:outline-none" tabIndex={0} aria-label="Bearbeiten">Bearbeiten</button>
          <button className="px-4 py-2 bg-blue-200 dark:bg-blue-700 rounded text-blue-800 dark:text-blue-100 font-medium focus:outline-none" tabIndex={0} aria-label="Veröffentlichen">Veröffentlichen</button>
          <button className="px-4 py-2 bg-green-200 dark:bg-green-700 rounded text-green-800 dark:text-green-100 font-medium focus:outline-none" tabIndex={0} aria-label="Auftragsbestätigung">Auftragsbestätigung</button>
          <select
            className="px-4 py-2 rounded border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
            value={dropdownValue}
            onChange={e => setDropdownValue(e.target.value)}
            aria-label="Kalkulation Aktionen"
            tabIndex={0}
          >
            <option>Kalkulation öffnen</option>
            <option>Kalkulation aktualisieren</option>
            <option>Kalkulation neu erstellen</option>
          </select>
          <button className="px-4 py-2 bg-purple-200 dark:bg-purple-700 rounded text-purple-800 dark:text-purple-100 font-medium focus:outline-none" tabIndex={0} aria-label="Variante erstellen">Variante erstellen</button>
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
    </div>
  );
};

export default OfferDetail; 