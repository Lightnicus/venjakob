import type { FC } from 'react';

const PortalPage: FC = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
    <h1 className="text-3xl font-bold mb-4" tabIndex={0} aria-label="Portal">Portal</h1>
    <p className="text-lg text-gray-700" tabIndex={0} aria-label="Willkommen im Portal">
      Willkommen im Portal! Hier finden Sie alle wichtigen Informationen auf einen Blick.
    </p>
  </main>
);

export default PortalPage; 