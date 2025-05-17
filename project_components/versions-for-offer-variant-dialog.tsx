'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { FileText, Copy, Trash } from 'lucide-react';

type OfferVersion = {
  id: string;
  version: string;
  erstelltAm: string;
  geaendertAm: string;
  betrag: string;
};

// Dummy data for versions
const dummyVersions: OfferVersion[] = [
  {
    id: '1',
    version: '1',
    erstelltAm: '01.06.2023, 14:30',
    geaendertAm: '01.06.2023, 15:45',
    betrag: '12.500,00 €',
  },
  {
    id: '2',
    version: '2',
    erstelltAm: '03.06.2023, 09:15',
    geaendertAm: '03.06.2023, 10:30',
    betrag: '13.200,00 €',
  },
  {
    id: '3',
    version: '3',
    erstelltAm: '10.06.2023, 11:20',
    geaendertAm: '10.06.2023, 13:10',
    betrag: '13.500,00 €',
  },
];

type VersionsForOfferVariantProps = {
  offerNumber?: string;
  variantIdentifier?: string;
};

export function VersionsForOfferVariantDialog({
  offerNumber = 'ANG-2023-0001',
  variantIdentifier = 'A',
}: VersionsForOfferVariantProps) {
  const [versions, setVersions] = useState<OfferVersion[]>(dummyVersions);

  return (
    <ManagedDialog
      title={`Versionen für Angebot ${offerNumber} - Variante ${variantIdentifier}`}
      showBackButton={false}
      showCloseButton={true}
      className="max-w-[90%] min-w-[80%]"
    >
      <div className="overflow-auto">
        <Table className="w-full border">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="border p-2 text-left">Version</TableHead>
              <TableHead className="border p-2 text-left">erstellt am</TableHead>
              <TableHead className="border p-2 text-left">geändert am</TableHead>
              <TableHead className="border p-2 text-left">Betrag</TableHead>
              <TableHead className="border p-2 text-left">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="border p-2">{version.version}</TableCell>
                <TableCell className="border p-2">{version.erstelltAm}</TableCell>
                <TableCell className="border p-2">{version.geaendertAm}</TableCell>
                <TableCell className="border p-2">{version.betrag}</TableCell>
                <TableCell className="border p-2">
                  <div className="flex items-center gap-1">
                    <button 
                      className="rounded p-1 hover:bg-gray-100"
                      aria-label="Ansehen"
                      tabIndex={0}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button 
                      className="rounded p-1 hover:bg-gray-100"
                      aria-label="Kopieren"
                      tabIndex={0}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button 
                      className="rounded p-1 hover:bg-gray-100"
                      aria-label="Löschen"
                      tabIndex={0}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ManagedDialog>
  );
} 