'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Check, Edit, FileText, Search, Square, Trash } from 'lucide-react';
import offerVariantsData from '@/data/offer-variants.json';

type OfferVariant = {
  id: string;
  checked: boolean;
  offerNumber: string;
  accepted: boolean;
  salesOpportunity: string;
  customer: string;
  language: string;
  gb: string;
  amount: string;
  version: string;
  published: boolean;
  createdBy: string;
  modifiedOn: string;
};

export function OfferVariantsTable() {
  const [offerVariants, setOfferVariants] = useState<OfferVariant[]>(offerVariantsData);

  const toggleCheckbox = (id: string) => {
    setOfferVariants(
      offerVariants.map(variant => {
        if (variant.id === id) {
          return { ...variant, checked: !variant.checked };
        }
        return variant;
      }),
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full border">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="border p-2 text-center w-10">
              <Checkbox />
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Angebots-Nr.
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-10 border p-2 text-center">Angen.</TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Verkaufschance
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Kunde
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Sprache
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                GB
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Betrag
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Version
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="border p-2 text-center">Veröffentlicht</TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Erstellt von
                <div className="relative inline-block">
                  <select className="h-6 w-full appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm">
                    <option>Alle</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Geändert am
                <div className="flex items-center gap-1">
                  <span>/</span>
                  <span>/</span>
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </TableHead>
            <TableHead className="border p-2 text-left">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offerVariants.map(variant => (
            <TableRow
              key={variant.id}
              className={variant.checked ? 'bg-blue-50' : ''}
            >
              <TableCell className="border p-2 text-center">
                <Checkbox 
                  checked={variant.checked}
                  onCheckedChange={() => toggleCheckbox(variant.id)}
                  aria-label="Auswählen"
                />
              </TableCell>
              <TableCell className="border p-2 text-blue-600 hover:underline">
                {variant.offerNumber}
              </TableCell>
              <TableCell className="border p-2 text-center">
                {variant.accepted ? (
                  <Check className="h-5 w-5 text-green-600" aria-label="Angenommen" tabIndex={0} />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" aria-label="Nicht angenommen" tabIndex={0} />
                )}
              </TableCell>
              <TableCell className="border p-2">{variant.salesOpportunity}</TableCell>
              <TableCell className="border p-2 text-blue-600 hover:underline">
                {variant.customer}
              </TableCell>
              <TableCell className="border p-2">{variant.language}</TableCell>
              <TableCell className="border p-2">{variant.gb}</TableCell>
              <TableCell className="border p-2">{variant.amount}</TableCell>
              <TableCell className="border p-2">{variant.version}</TableCell>
              <TableCell className="border p-2 text-center">
                <Checkbox 
                  checked={variant.published}
                  disabled
                  aria-label={variant.published ? "Veröffentlicht" : "Nicht veröffentlicht"}
                />
              </TableCell>
              <TableCell className="border p-2">{variant.createdBy}</TableCell>
              <TableCell className="border p-2">{variant.modifiedOn}</TableCell>
              <TableCell className="border p-2">
                <div className="flex items-center gap-1">
                  <button className="rounded p-1 hover:bg-gray-100" aria-label="Bearbeiten" tabIndex={0}>
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1 hover:bg-gray-100" aria-label="Details anzeigen" tabIndex={0}>
                    <FileText className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1 hover:bg-gray-100" aria-label="Löschen" tabIndex={0}>
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 