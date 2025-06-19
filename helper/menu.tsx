'use client';

import { ReactNode } from 'react';
import { Tab } from '@/project_components/tabbed-interface-provider';
import Offers from '@/project_components/offers';
import SalesOpportunitiesTable from '@/project_components/sale-opportunities-table';
import saleChancesData from '@/data/sale-chances.json';
import OrderConfirmations, {
  OrderConfirmation,
} from '@/project_components/order-confirmations';
import orderConfirmationsData from '@/data/order-confirmations.json';
import StammdatenPlaceholder from '@/project_components/stammdaten-placeholder';
import EinstellungenPlaceholder from '@/project_components/einstellungen-placeholder';
import { SalesOpportunityDetail } from '@/project_components/sales-opportunity-detail';
import BlockManagement from '@/project_components/block-management';
import ArticleManagement from '@/project_components/article-management';
import RoleManagement from '@/project_components/role-management';
import PermissionManagement from '@/project_components/permission-management';
import UserManagement from '@/project_components/user-management';

export interface TabDefinition extends Omit<Tab, 'content'> {
  content: () => ReactNode; // Use a function to render content to avoid immediate rendering
  requiredPermissions?: string | string[]; // Permission(s) required to access this tab
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
    requiredPermissions: 'angebote',
  },
  '/verkaufschancen': {
    id: 'verkaufschancen',
    title: 'Verkaufschancen',
    content: () => (
      <>
        <h2 className="text-2xl font-bold">Verkaufschancen</h2>
        <SalesOpportunitiesTable
          data={saleChancesData}
          showSelectionRadio={false}
        />
      </>
    ),
    closable: true,
    requiredPermissions: 'angebote',
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
    requiredPermissions: 'angebote',
  },
  '/stammdaten': {
    id: 'stammdaten',
    title: 'Stammdaten',
    content: () => <StammdatenPlaceholder />,
    closable: true,
    requiredPermissions: ['artikel', 'blocks'], // Show if user has any of the child permissions
  },
  '/einstellungen': {
    id: 'einstellungen',
    title: 'Einstellungen',
    content: () => <EinstellungenPlaceholder />,
    closable: true,
    requiredPermissions: 'admin', // Show if user has admin permissions
  },
  '/stammdaten/blockverwaltung': {
    id: 'stammdaten-blockverwaltung',
    title: 'Blockverwaltung',
    content: () => <BlockManagement />,
    closable: true,
    requiredPermissions: 'blocks',
  },
  // '/stammdaten/positionsverwaltung': {
  //   id: 'stammdaten-positionsverwaltung',
  //   title: 'Positionsverwaltung',
  //   content: () => (
  //     <div className="p-4"><h2 className="text-2xl font-bold mb-2">Positionsverwaltung</h2><p>Hier können Sie Positionen verwalten.</p></div>
  //   ),
  //   closable: true,
  // },
  '/stammdaten/artikelverwaltung': {
    id: 'artikelverwaltung',
    title: 'Artikelverwaltung',
    content: () => <ArticleManagement />,
    closable: true,
    requiredPermissions: 'artikel',
  },
  '/einstellungen/rollenverwaltung': {
    id: 'einstellungen-rollenverwaltung',
    title: 'Rollenverwaltung',
    content: () => <RoleManagement />,
    closable: true,
    requiredPermissions: 'admin',
  },
  '/einstellungen/berechtigungsverwaltung': {
    id: 'einstellungen-berechtigungsverwaltung',
    title: 'Berechtigungsverwaltung',
    content: () => <PermissionManagement />,
    closable: true,
    requiredPermissions: 'admin',
  },
  '/einstellungen/benutzerverwaltung': {
    id: 'einstellungen-benutzerverwaltung',
    title: 'Benutzerverwaltung',
    content: () => <UserManagement />,
    closable: true,
    requiredPermissions: 'admin',
  },
};

// Helper function to check if user has required permissions for a tab
export const hasTabPermissions = (
  tabDefinition: TabDefinition,
  hasPermission: (permissionName?: string, resource?: string) => boolean
): boolean => {
  if (!tabDefinition.requiredPermissions) {
    return true; // No permissions required
  }

  const permissions = Array.isArray(tabDefinition.requiredPermissions)
    ? tabDefinition.requiredPermissions
    : [tabDefinition.requiredPermissions];

  // For arrays of permissions (like stammdaten), user needs at least one
  return permissions.some(permission => hasPermission(undefined, permission));
};
