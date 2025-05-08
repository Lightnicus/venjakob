import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Edit, FileText, Copy, Trash } from 'lucide-react';
import Link from 'next/link';

export type OrderConfirmation = {
  abNumber: string;
  opportunity: string;
  customerNumber: string;
  customer: string;
  location: string;
  gb: string;
  amount: string;
  version: string;
  responsible: string;
  modifiedBy: string;
  modifiedOn: string;
};

type Props = {
  data: OrderConfirmation[];
};

const OrderConfirmations = ({ data }: Props) => (
  <div className="overflow-x-auto">
    <Table className="w-full border">
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="border p-2">AB-Nr.</TableHead>
          <TableHead className="border p-2">Verkaufschance</TableHead>
          <TableHead className="border p-2">KdNr</TableHead>
          <TableHead className="border p-2">Kunde</TableHead>
          <TableHead className="border p-2">Ort</TableHead>
          <TableHead className="border p-2">GB</TableHead>
          <TableHead className="border p-2">Betrag</TableHead>
          <TableHead className="border p-2">Version</TableHead>
          <TableHead className="border p-2">Verantwortlich VC</TableHead>
          <TableHead className="border p-2">Geändert von</TableHead>
          <TableHead className="border p-2">Geändert am</TableHead>
          <TableHead className="border p-2">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={idx}>
            <TableCell className="border p-2 text-blue-600 hover:underline">
              <Link href="#" tabIndex={0} aria-label={`Details zu AB ${row.abNumber}`}>{row.abNumber}</Link>
            </TableCell>
            <TableCell className="border p-2 text-blue-600 hover:underline">
              <Link href="#" tabIndex={0} aria-label={`Verkaufschance ${row.opportunity}`}>{row.opportunity}</Link>
            </TableCell>
            <TableCell className="border p-2">{row.customerNumber}</TableCell>
            <TableCell className="border p-2 text-blue-600 hover:underline">
              <Link href="#" tabIndex={0} aria-label={`Kunde ${row.customer}`}>{row.customer}</Link>
            </TableCell>
            <TableCell className="border p-2">{row.location}</TableCell>
            <TableCell className="border p-2">{row.gb}</TableCell>
            <TableCell className="border p-2">{row.amount}</TableCell>
            <TableCell className="border p-2">{row.version}</TableCell>
            <TableCell className="border p-2">{row.responsible}</TableCell>
            <TableCell className="border p-2">{row.modifiedBy}</TableCell>
            <TableCell className="border p-2">{row.modifiedOn}</TableCell>
            <TableCell className="border p-2">
              <div className="flex gap-2">
                <button aria-label="Bearbeiten" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
                  <Edit className="h-4 w-4" />
                </button>
                <button aria-label="Anzeigen" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
                  <FileText className="h-4 w-4" />
                </button>
                <button aria-label="Kopieren" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
                  <Copy className="h-4 w-4" />
                </button>
                <button aria-label="Löschen" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
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

export default OrderConfirmations; 