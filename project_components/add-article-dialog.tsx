import React, { useState, useMemo } from 'react';
import { FilterableTable } from './filterable-table';
import type { ColumnDef } from '@tanstack/react-table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type Article = {
  id: number;
  nummer: string;
  ueberschrift: string;
  aenderung: string;
  vorschau: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (article: Article) => void;
  articles: Article[];
};

const AddArticleDialog: React.FC<Props> = ({
  open,
  onClose,
  onAdd,
  articles,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(
    articles[0]?.id ?? null,
  );

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        a =>
          a.nummer.toLowerCase().includes(search.toLowerCase()) ||
          a.ueberschrift.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, articles],
  );

  const selectedArticle = useMemo(
    () => articles.find(a => a.id === selectedId) || null,
    [selectedId, articles],
  );

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        id: 'select',
        header: () => <span className="sr-only">Auswählen</span>,
        cell: ({ row }) => (
          <RadioGroup
            value={selectedId?.toString() || ''}
            onValueChange={value => setSelectedId(Number(value))}
          >
            <RadioGroupItem
              value={row.original.id.toString()}
              id={`radio-${row.original.id}`}
              checked={selectedId === row.original.id}
              aria-label={`Artikel ${row.original.nummer} auswählen`}
            />
          </RadioGroup>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'nummer',
        header: 'Nr.',
        cell: ({ row }) => (
          <span className="underline text-blue-700">{row.original.nummer}</span>
        ),
      },
      {
        accessorKey: 'ueberschrift',
        header: 'Überschrift',
      },
      {
        accessorKey: 'aenderung',
        header: 'letzte Änderung',
      },
    ],
    [selectedId],
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:w-[80vw] lg:max-w-none max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Artikel hinzufügen</DialogTitle>
          <DialogDescription>
            Wählen Sie einen Artikel aus der Liste aus und fügen Sie ihn hinzu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <FilterableTable
              data={filteredArticles}
              columns={columns}
              getRowClassName={row =>
                selectedId === row.original.id
                  ? 'cursor-pointer'
                  : 'bg-white text-black hover:bg-gray-100 cursor-pointer'
              }
              globalFilterColumnIds={['ueberschrift', 'nummer']}
              onRowClick={row => setSelectedId(row.original.id)}
              tableClassName="min-w-full border border-gray-300 text-sm"
              cellClassName="px-3 py-2 border-b border-gray-200"
              headerClassName="px-3 py-2 font-bold text-left border-b border-gray-300 bg-gray-100"
            />
          </div>
          
          {/* Add Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => selectedArticle && onAdd(selectedArticle)}
              disabled={!selectedArticle}
              aria-label="Artikel hinzufügen"
            >
              + Hinzufügen
            </Button>
          </div>
          
          {/* Vorschau */}
          <div className="border border-gray-300 rounded p-4 bg-white">
            <div className="font-bold mb-2">Vorschau</div>
            <div className="relative h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 mb-2">
              {selectedArticle ? (
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {selectedArticle.vorschau}
                </pre>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleDialog;
