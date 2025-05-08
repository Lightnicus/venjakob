import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Edit, FileText, Copy, Trash, Check, X as XIcon } from 'lucide-react';

export type SalesOpportunityOffer = {
  offerNumber: string;
  accepted: boolean;
  amount: string;
  version: string;
  published: boolean;
  modifiedBy: string;
  modifiedOn: string;
};

type Props = {
  data: SalesOpportunityOffer[];
};

const SalesOpportunityOffers = ({ data }: Props) => (
  <div className="overflow-x-auto">
    <Table className="w-full border">
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="border p-2">Angebots-Nr.</TableHead>
          <TableHead className="border p-2">Angen.</TableHead>
          <TableHead className="border p-2">Betrag</TableHead>
          <TableHead className="border p-2">Version</TableHead>
          <TableHead className="border p-2">Veröffentlicht</TableHead>
          <TableHead className="border p-2">Geändert von</TableHead>
          <TableHead className="border p-2">Geändert am</TableHead>
          <TableHead className="border p-2">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={idx}>
            <TableCell className="border p-2">{row.offerNumber}</TableCell>
            <TableCell className="border p-2 text-center">
              {row.accepted ? (
                <Check className="h-5 w-5 text-green-600" aria-label="Angenommen" tabIndex={0} />
              ) : (
                <XIcon className="h-5 w-5 text-gray-400" aria-label="Nicht angenommen" tabIndex={0} />
              )}
            </TableCell>
            <TableCell className="border p-2">{row.amount}</TableCell>
            <TableCell className="border p-2">{row.version}</TableCell>
            <TableCell className="border p-2 text-center">
              {row.published ? (
                <Check className="h-5 w-5 text-green-600" aria-label="Veröffentlicht" tabIndex={0} />
              ) : (
                <XIcon className="h-5 w-5 text-gray-400" aria-label="Nicht veröffentlicht" tabIndex={0} />
              )}
            </TableCell>
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

export default SalesOpportunityOffers; 