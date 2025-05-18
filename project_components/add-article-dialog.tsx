import React, { useState, useMemo } from 'react';
import { FilterableTable } from './filterable-table';
import type { ColumnDef } from '@tanstack/react-table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
      role="dialog"
      aria-modal="true"
      aria-label="Artikel hinzufügen Dialog"
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Schließen"
          tabIndex={0}
          className="cursor-pointer absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
        >
          ×
        </button>
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4">Artikel hinzufügen</h2>
        {/* Table */}
        <div className="overflow-x-auto mb-4">
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
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center px-4 py-2 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 focus:outline-none"
            onClick={() => selectedArticle && onAdd(selectedArticle)}
            aria-label="Artikel hinzufügen"
            tabIndex={0}
            disabled={!selectedArticle}
          >
            + Hinzufügen
          </button>
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
    </div>
  );
};

export default AddArticleDialog;
