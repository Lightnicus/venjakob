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
import Offers from './offers';

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

            <TabsContent value="angebote" className="m-0 p-4">
              <h2 className="text-2xl font-bold">Angebote</h2>
              <Offers />
            </TabsContent>

            <TabsContent value="verkaufschancen" className="m-0 p-4">
              <h2 className="text-2xl font-bold">Verkaufschancen</h2>
              <SaleOpportunities data={saleChancesData} />
            </TabsContent>

            <TabsContent value="verkaufschance-muster" className="m-0 p-4">
              <SalesOpportunityDetail
                    data={
                      salesOpportunityDetailData as SalesOpportunityDetailData
                    }
                  />
            </TabsContent>

            <TabsContent value="abs" className="m-0 p-4">
              <h2 className="text-2xl font-bold">Auftragsbestätigungen</h2>
              <OrderConfirmations data={orderConfirmationsData as OrderConfirmation[]} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
