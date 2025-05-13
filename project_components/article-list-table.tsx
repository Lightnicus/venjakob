import { useState, ChangeEvent, KeyboardEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Copy, Trash2 } from 'lucide-react';

type Article = {
  nr: string;
  title: string;
  languages: string;
  date: string;
};

type Props = {
  data: Article[];
};

const icons = {
  edit: Pencil,
  copy: Copy,
  delete: Trash2,
};

export const ArticleListTable = ({ data }: Props) => {
  const [searchNr, setSearchNr] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const handleSearchNr = (e: ChangeEvent<HTMLInputElement>) => setSearchNr(e.target.value);
  const handleSearchTitle = (e: ChangeEvent<HTMLInputElement>) => setSearchTitle(e.target.value);

  const filtered = data.filter(
    (a) =>
      a.nr.toLowerCase().includes(searchNr.toLowerCase()) &&
      a.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  const handleRowClick = (nr: string) => setSelected(nr);
  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, nr: string) => {
    if (e.key === 'Enter' || e.key === ' ') setSelected(nr);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <button
          className="border rounded px-3 py-1 bg-white hover:bg-gray-100 text-sm font-medium"
          tabIndex={0}
          aria-label="Artikel hinzufügen"
        >
          + Artikel hinzufügen
        </button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="search"
                  value={searchNr}
                  onChange={handleSearchNr}
                  aria-label="Suche Nr."
                />
              </TableHead>
              <TableHead>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="search"
                  value={searchTitle}
                  onChange={handleSearchTitle}
                  aria-label="Suche Überschrift"
                />
              </TableHead>
              <TableHead className="w-32">Sprachen</TableHead>
              <TableHead className="w-32">Datum</TableHead>
              <TableHead className="w-32">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length ? (
              filtered.map((a, i) => (
                <TableRow
                  key={a.nr}
                  tabIndex={0}
                  aria-label={`Artikel ${a.nr}`}
                  onClick={() => handleRowClick(a.nr)}
                  onKeyDown={(e) => handleRowKeyDown(e, a.nr)}
                  className={
                    `cursor-pointer ${selected === a.nr ? 'bg-blue-200' : i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`
                  }
                  data-state={selected === a.nr ? 'selected' : undefined}
                >
                  <TableCell className="text-blue-700 underline hover:text-blue-900">{a.nr}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.languages}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      tabIndex={0}
                      aria-label="Bearbeiten"
                      className="hover:text-blue-600"
                    >
                      <icons.edit size={16} />
                    </button>
                    <button
                      tabIndex={0}
                      aria-label="Kopieren"
                      className="hover:text-blue-600"
                    >
                      <icons.copy size={16} />
                    </button>
                    <button
                      tabIndex={0}
                      aria-label="Löschen"
                      className="hover:text-red-600"
                    >
                      <icons.delete size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Keine Ergebnisse.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArticleListTable; 