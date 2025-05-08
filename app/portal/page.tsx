import type { FC } from 'react';
import { TabbedInterface } from '@/project_components/tabbed-interface';

const PortalPage: FC = () => (
  <main className="flex min-h-screen flex-col items-start justify-start bg-gray-50 p-4">
    <TabbedInterface />
  </main>
);

export default PortalPage;
