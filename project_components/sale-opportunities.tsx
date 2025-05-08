import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import Link from 'next/link';
import { Eye, Copy } from 'lucide-react';
import { SalesOpportunityDetail, SalesOpportunityDetailData } from './sales-opportunity-detail';
import salesOpportunityDetailData from '@/data/sales-opportunity-detail.json';
import { useTabbedInterface } from './tabbed-interface-provider';

export type SaleChance = {
  titel: string;
  kunde: string;
  verantwortlicher: string;
  status: string;
  gb: string;
  volumen: string;
  liefertermin: string;
  geaendertAm: string;
  angebote: number;
};

type SaleChancesProps = {
  data: SaleChance[];
};

const SaleOpportunities = ({ data }: SaleChancesProps) => {
  const { openNewTab } = useTabbedInterface();

  const handleTitelClick = (titel: string, e: React.MouseEvent) => {
    console.log(`Titel wurde geklickt: ${titel}`);
    e.preventDefault();
    openNewTab({
      id: 'verkaufschance-details',
      title: 'Verkaufschance Details',
      content: <SalesOpportunityDetail data={
        salesOpportunityDetailData as SalesOpportunityDetailData
      } />,
      closable: true,
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full border">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="border p-2">Titel</TableHead>
            <TableHead className="border p-2">Kunde</TableHead>
            <TableHead className="border p-2">Verantwortlicher</TableHead>
            <TableHead className="border p-2">Status</TableHead>
            <TableHead className="border p-2">GB</TableHead>
            <TableHead className="border p-2">Volumen</TableHead>
            <TableHead className="border p-2">Liefertermin</TableHead>
            <TableHead className="border p-2">Geändert am</TableHead>
            <TableHead className="border p-2">Angebote</TableHead>
            <TableHead className="border p-2">Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="border p-2 text-blue-600 hover:underline">
                <Link
                  href="#"
                  tabIndex={0}
                  aria-label={`Details zu ${row.titel}`}
                  onClick={(e) => handleTitelClick(row.titel, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTitelClick(row.titel, e as any);
                    }
                  }}
                >
                  {row.titel}
                </Link>
              </TableCell>
              <TableCell className="border p-2 text-blue-600 hover:underline">
                <Link href="#" tabIndex={0} aria-label={`Kunde ${row.kunde}`}>
                  {row.kunde}
                </Link>
              </TableCell>
              <TableCell className="border p-2">{row.verantwortlicher}</TableCell>
              <TableCell className="border p-2">{row.status}</TableCell>
              <TableCell className="border p-2">{row.gb}</TableCell>
              <TableCell className="border p-2">{row.volumen}</TableCell>
              <TableCell className="border p-2">{row.liefertermin}</TableCell>
              <TableCell className="border p-2">{row.geaendertAm}</TableCell>
              <TableCell className="border p-2 text-center">
                {row.angebote}
              </TableCell>
              <TableCell className="border p-2">
                <div className="flex gap-2">
                  <button
                    aria-label="Anzeigen"
                    tabIndex={0}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Kopieren"
                    tabIndex={0}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SaleOpportunities;
