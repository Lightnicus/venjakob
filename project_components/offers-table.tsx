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
import { Calendar, Copy, Edit, FileText, Search, Trash, Check, Square } from 'lucide-react';
import offersData from '@/data/offers.json';

type Offer = {
  id: string;
  checked: boolean;
  offerNumber: string;
  offer: string;
  vcStatus: string;
  customerNumber: string;
  recipient: string;
  location: string;
  gb: string;
  amount: string;
  version: string;
  published: boolean;
  responsible: string;
  modifiedBy: string;
  modifiedOn: string;
};

export interface OffersTableProps {
  reducedMode?: boolean;
}

export function OffersTable({ reducedMode = false }: OffersTableProps) {
  const [offers, setOffers] = useState<Offer[]>(offersData);

  const toggleCheckbox = (id: string) => {
    setOffers(
      offers.map(offer => {
        if (offer.id === id) {
          return { ...offer, checked: !offer.checked };
        }
        return offer;
      }),
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full border">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Angebote-Nr.
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-10 border p-2 text-center">Angen.</TableHead>
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Angebot
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            {!reducedMode && (
              <TableHead className="border p-2 text-left">
                <div className="flex items-center gap-1">
                  VC-Status
                  <Search className="h-4 w-4" />
                </div>
              </TableHead>
            )}
            {!reducedMode && (
              <TableHead className="border p-2 text-left">
                <div className="flex items-center gap-1">
                  KdNr
                  <Search className="h-4 w-4" />
                </div>
              </TableHead>
            )}
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Kunde
                <Search className="h-4 w-4" />
              </div>
            </TableHead>
            {!reducedMode && (
              <TableHead className="border p-2 text-left">
                <div className="flex items-center gap-1">
                  Ort
                  <Search className="h-4 w-4" />
                </div>
              </TableHead>
            )}
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
            {!reducedMode && (
              <TableHead className="border p-2 text-left">
                <div className="flex items-center gap-1">
                  Version
                  <Search className="h-4 w-4" />
                </div>
              </TableHead>
            )}
            {!reducedMode && (
              <TableHead className="w-10 border p-2 text-center">
                <Checkbox />
              </TableHead>
            )}
            <TableHead className="border p-2 text-left">
              <div className="flex items-center gap-1">
                Verantwortlich VC
                <div className="relative inline-block">
                  <select className="h-6 w-full appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm">
                    <option>Max Mustermann</option>
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
            {!reducedMode && (
              <TableHead className="border p-2 text-left">
                <div className="flex items-center gap-1">
                  Geändert von
                  <div className="relative inline-block">
                    <select className="h-6 w-full appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm">
                      <option>Max Mustermann</option>
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
            )}
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
            {!reducedMode && (
              <TableHead className="border p-2 text-left">Aktionen</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map(offer => (
            <TableRow
              key={offer.id}
              className={offer.checked ? 'bg-blue-50' : ''}
            >
              <TableCell className="border p-2 text-blue-600 hover:underline">
                {offer.offerNumber}
              </TableCell>
              <TableCell className="border p-2 text-center">
                {offer.id === '3' ? (
                  <Check className="h-5 w-5 text-green-600" aria-label="Ausgewählt" tabIndex={0} />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" aria-label="Nicht ausgewählt" tabIndex={0} />
                )}
              </TableCell>
              <TableCell className="border p-2 text-blue-600 hover:underline">
                {offer.offer}
              </TableCell>
              {!reducedMode && (
                <TableCell className="border p-2">{offer.vcStatus}</TableCell>
              )}
              {!reducedMode && (
                <TableCell className="border p-2">
                  {offer.customerNumber}
                </TableCell>
              )}
              <TableCell className="border p-2 text-blue-600 hover:underline">
                {offer.recipient}
              </TableCell>
              {!reducedMode && (
                <TableCell className="border p-2">{offer.location}</TableCell>
              )}
              <TableCell className="border p-2">{offer.gb}</TableCell>
              <TableCell className="border p-2">{offer.amount}</TableCell>
              {!reducedMode && (
                <TableCell className="border p-2">{offer.version}</TableCell>
              )}
              {!reducedMode && (
                <TableCell className="border p-2 text-center">
                  <Checkbox checked={offer.published} />
                </TableCell>
              )}
              <TableCell className="border p-2">{offer.responsible}</TableCell>
              {!reducedMode && (
                <TableCell className="border p-2">{offer.modifiedBy}</TableCell>
              )}
              <TableCell className="border p-2">{offer.modifiedOn}</TableCell>
              {!reducedMode && (
                <TableCell className="border p-2">
                  <div className="flex items-center gap-1">
                    <button className="rounded p-1 hover:bg-gray-100">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 hover:bg-gray-100">
                      <FileText className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 hover:bg-gray-100">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 hover:bg-gray-100">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
