'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Copy, Trash } from 'lucide-react';
import { useState } from 'react';

type OfferVersion = {
  id: string;
  version: string;
  erstelltAm: string;
  geaendertAm: string;
  betrag: string;
};

const dummyVersions: OfferVersion[] = [
  {
    id: '1',
    version: 'V1',
    erstelltAm: '01.05.2024',
    geaendertAm: '02.05.2024',
    betrag: '12.500,00 €',
  },
  {
    id: '2',
    version: 'V2',
    erstelltAm: '03.05.2024',
    geaendertAm: '04.05.2024',
    betrag: '13.750,00 €',
  },
  {
    id: '3',
    version: 'V3',
    erstelltAm: '05.05.2024',
    geaendertAm: '06.05.2024',
    betrag: '15.000,00 €',
  },
];

interface VersionsForOfferVariantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerNumber?: string;
  variantIdentifier?: string;
  onClose?: () => void;
}

export function VersionsForOfferVariantDialog({
  open,
  onOpenChange,
  offerNumber = 'ANG-2023-0001',
  variantIdentifier = 'A',
  onClose,
}: VersionsForOfferVariantProps) {
  const [versions, setVersions] = useState<OfferVersion[]>(dummyVersions);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] min-w-[80%]">
        <DialogHeader>
          <DialogTitle>
            Versionen für Angebot {offerNumber} - Variante {variantIdentifier}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-auto my-4">
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

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            aria-label="Schließen"
            tabIndex={0}
          >
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 