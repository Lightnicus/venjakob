import { FC, useState, ChangeEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Copy, Trash2 } from 'lucide-react';

type Block = {
  bezeichnung: string;
  ueberschrift: string;
  sprachen: string;
  geaendertAm: string;
  standard: boolean;
  position: number;
};

type BlockListTableProps = {
  data: Block[];
};

const BlockListTable: FC<BlockListTableProps> = ({ data }) => {
  const [searchBezeichnung, setSearchBezeichnung] = useState('');
  const [searchUeberschrift, setSearchUeberschrift] = useState('');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const handleSearchBezeichnung = (e: ChangeEvent<HTMLInputElement>) => setSearchBezeichnung(e.target.value);
  const handleSearchUeberschrift = (e: ChangeEvent<HTMLInputElement>) => setSearchUeberschrift(e.target.value);

  const filtered = data.filter(
    b =>
      b.bezeichnung.toLowerCase().includes(searchBezeichnung.toLowerCase()) &&
      b.ueberschrift.toLowerCase().includes(searchUeberschrift.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded shadow p-4">
      <div className="flex items-center gap-2 mb-2">
        <Button aria-label="Block hinzufügen" tabIndex={0} className="h-8 px-3 text-sm">+ Block hinzufügen</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">
                <input
                  type="text"
                  value={searchBezeichnung}
                  onChange={handleSearchBezeichnung}
                  placeholder="search"
                  aria-label="Bezeichnung suchen"
                  tabIndex={0}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </TableHead>
              <TableHead className="min-w-[180px]">
                <input
                  type="text"
                  value={searchUeberschrift}
                  onChange={handleSearchUeberschrift}
                  placeholder="search"
                  aria-label="Überschrift suchen"
                  tabIndex={0}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </TableHead>
              <TableHead>Sprachen</TableHead>
              <TableHead>zuletzt geändert am</TableHead>
              <TableHead>Standard</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((block, idx) => (
              <TableRow
                key={block.bezeichnung + block.position}
                className={
                  `${idx % 2 ? 'bg-gray-50' : 'bg-white'} ` +
                  (selectedRow === idx ? ' !bg-blue-100' : '')
                }
                tabIndex={0}
                aria-label={`Block ${block.bezeichnung}`}
                onClick={() => setSelectedRow(idx)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedRow(idx);
                }}
              >
                <TableCell className="text-blue-700 underline cursor-pointer">{block.bezeichnung}</TableCell>
                <TableCell>{block.ueberschrift}</TableCell>
                <TableCell>{block.sprachen}</TableCell>
                <TableCell>{block.geaendertAm}</TableCell>
                <TableCell>
                  <input type="checkbox" checked={block.standard} readOnly aria-label="Standard" tabIndex={-1} />
                </TableCell>
                <TableCell>{block.position}</TableCell>
                <TableCell className="flex gap-2">
                  <button aria-label="Bearbeiten" tabIndex={0} className="hover:text-blue-600"><Pencil size={16} /></button>
                  <button aria-label="Kopieren" tabIndex={0} className="hover:text-blue-600"><Copy size={16} /></button>
                  <button aria-label="Löschen" tabIndex={0} className="hover:text-red-600"><Trash2 size={16} /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BlockListTable; 