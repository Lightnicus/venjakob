import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ShowNavigation from '../project_components/show-navigation';
import { TabbedInterfaceProvider } from '@/project_components/tabbed-interface-provider';
import { LoadingProvider } from '@/project_components/loading-provider';
import { GlobalLoadingIndicator } from '@/project_components/global-loading-indicator';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <TabbedInterfaceProvider initialTabs={[]}>
            <ShowNavigation />
            <GlobalLoadingIndicator />
            <Toaster 
              position="bottom-right"
              richColors
              expand={true}
              visibleToasts={5}
              closeButton
            />
            {children}
          </TabbedInterfaceProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
