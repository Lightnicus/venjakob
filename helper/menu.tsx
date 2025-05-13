'use client';

import { ReactNode } from 'react';
import { Tab } from '@/project_components/tabbed-interface-provider';
import Offers from '@/project_components/offers';
import SaleOpportunitiesTable from '@/project_components/sale-opportunities-table';
import saleChancesData from '@/data/sale-chances.json';
import OrderConfirmations, {
  OrderConfirmation,
} from '@/project_components/order-confirmations';
import orderConfirmationsData from '@/data/order-confirmations.json';
import StammdatenPlaceholder from '@/project_components/stammdaten-placeholder';
import EinstellungenPlaceholder from '@/project_components/einstellungen-placeholder';
import { SalesOpportunityDetail } from '@/project_components/sales-opportunity-detail';
import BlockListTable from '@/project_components/block-list-table';
import blockListData from '@/data/block-list.json';

export interface TabDefinition extends Omit<Tab, 'content'> {
  content: () => ReactNode; // Use a function to render content to avoid immediate rendering
}

export const tabMappings: Record<string, TabDefinition> = {
  '/angebote': {
    id: 'angebote',
    title: 'Angebote',
    content: () => (
      <>
        <h2 className="text-2xl font-bold">Angebote</h2>
        <Offers />
      </>
    ),
    closable: true,
  },
  '/verkaufschancen': {
    id: 'verkaufschancen',
    title: 'Verkaufschancen',
    content: () => (
      <>
        <h2 className="text-2xl font-bold">Verkaufschancen</h2>
        <SaleOpportunitiesTable data={saleChancesData} />
      </>
    ),
    closable: true,
  },
  '/auftragsbestaetigungen': {
    id: 'auftragsbestaetigungen',
    title: 'Auftragsbestätigungen',
    content: () => (
      <>
        <h2 className="text-2xl font-bold">Auftragsbestätigungen</h2>
        <OrderConfirmations
          data={orderConfirmationsData as OrderConfirmation[]}
        />
      </>
    ),
    closable: true,
  },
  '/stammdaten': {
    id: 'stammdaten',
    title: 'Stammdaten',
    content: () => <StammdatenPlaceholder />,
    closable: true,
  },
  '/einstellungen': {
    id: 'einstellungen',
    title: 'Einstellungen',
    content: () => <EinstellungenPlaceholder />,
    closable: true,
  },
  '/stammdaten/blockverwaltung': {
    id: 'stammdaten-blockverwaltung',
    title: 'Blockverwaltung',
    content: () => (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Blockverwaltung</h2>
        <BlockListTable data={blockListData} />
      </div>
    ),
    closable: true,
  },
  '/stammdaten/positionsverwaltung': {
    id: 'stammdaten-positionsverwaltung',
    title: 'Positionsverwaltung',
    content: () => (
      <div className="p-4"><h2 className="text-2xl font-bold mb-2">Positionsverwaltung</h2><p>Hier können Sie Positionen verwalten.</p></div>
    ),
    closable: true,
  },
};
