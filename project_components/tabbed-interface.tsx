'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OffersTable } from '@/project_components/offers-table';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import SaleOpportunities from './sale-opportunities';
import saleChancesData from '../data/sale-chances.json';
import {
  SalesOpportunityDetail,
  SalesOpportunityDetailData,
} from './sales-opportunity-detail';
import salesOpportunityDetailData from '../data/sales-opportunity-detail.json';
import NewOfferFromExistingDialog from './new-offer-from-existing-dialog';
import OrderConfirmations, { OrderConfirmation } from './order-confirmations';
import orderConfirmationsData from '../data/order-confirmations.json';

export function TabbedInterface() {
  const [activeTab, setActiveTab] = useState('angebote');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogCancel = () => setDialogOpen(false);
  const handleDialogNo = () => setDialogOpen(false);
  const handleDialogYes = () => setDialogOpen(false);

  return (
    <div className="w-full border rounded">
      <div className="flex border-b">
        <div className="flex-1 overflow-x-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="h-auto bg-white p-0">
              <TabsTrigger
                value="angebote"
                className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
              >
                Angebote
                <X className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="verkaufschancen"
                className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
              >
                Verkaufschancen
                <X className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="verkaufschance-muster"
                className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
              >
                Verkaufschance Musterm...
                <X className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="abs"
                className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100"
              >
                Auftragsbestätigungen
                <X className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="angebote" className="m-0 p-0">
              <div className="p-4">
                <h2 className="mb-4 text-2xl font-bold">Angebote</h2>
                <div className="mb-4 flex items-center gap-2">
                  <Button
                    className="flex items-center gap-1"
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogOpen(true)}
                  >
                    Erstellen
                  </Button>
                  <Select defaultValue="Offen">
                    <SelectTrigger
                      className="h-8 w-[140px] rounded border px-2 py-1 text-sm"
                      aria-label="Status wählen"
                    >
                      Status
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Offen">Offen</SelectItem>
                      <SelectItem value="Geschlossen">Geschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <OffersTable />
                <NewOfferFromExistingDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  onCancel={handleDialogCancel}
                  onNo={handleDialogNo}
                  onYes={handleDialogYes}
                />
              </div>
            </TabsContent>

            <TabsContent value="verkaufschancen" className="m-0 p-0">
              <div className="p-4">
                <h2 className="text-2xl font-bold">Verkaufschancen</h2>
                <SaleOpportunities data={saleChancesData} />
              </div>
            </TabsContent>

            <TabsContent value="verkaufschance-muster" className="m-0 p-0">
              <div className="p-4">
                <h2 className="text-2xl font-bold">
                  Verkaufschance Mustermann
                </h2>
                <SalesOpportunityDetail
                  data={
                    salesOpportunityDetailData as SalesOpportunityDetailData
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="abs" className="m-0 p-0">
              <div className="p-4">
                <h2 className="text-2xl font-bold">Auftragsbestätigungen</h2>
                <OrderConfirmations data={orderConfirmationsData as OrderConfirmation[]} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
