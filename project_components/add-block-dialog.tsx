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
import type { Block, BlockContent } from '@/lib/db/schema';

export type BlockWithContent = Block & {
  content?: BlockContent;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (block: BlockWithContent) => void;
  blocks: BlockWithContent[];
};

const AddBlockDialog: React.FC<Props> = ({ open, onClose, onAdd, blocks }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    blocks[0]?.id ?? null,
  );

  const filteredBlocks = useMemo(
    () =>
      blocks.filter(
        b =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          (b.content?.title && b.content.title.toLowerCase().includes(search.toLowerCase())),
      ),
    [search, blocks],
  );

  const selectedBlock = useMemo(
    () => blocks.find(b => b.id === selectedId) || null,
    [selectedId, blocks],
  );

  const columns = useMemo<ColumnDef<BlockWithContent>[]>(
    () => [
      {
        id: 'select',
        header: () => <span className="sr-only">Auswählen</span>,
        cell: ({ row }) => (
          <RadioGroup
            value={selectedId?.toString() || ''}
            onValueChange={value => setSelectedId(value)}
          >
            <RadioGroupItem
              value={row.original.id}
              id={`radio-${row.original.id}`}
              checked={selectedId === row.original.id}
              aria-label={`Block ${row.original.name} auswählen`}
            />
          </RadioGroup>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Bezeichnung',
      },
      {
        accessorKey: 'content.title',
        header: 'Überschrift',
        cell: ({ row }) => row.original.content?.title || '-',
      },
      {
        accessorKey: 'updatedAt',
        header: 'letzte Änderung',
        cell: ({ row }) => 
          row.original.updatedAt 
            ? new Date(row.original.updatedAt).toLocaleDateString('de-DE')
            : '-',
      },
      {
        accessorKey: 'standard',
        header: 'Standard',
        cell: ({ row }) => row.original.standard ? 'Ja' : 'Nein',
      },
      {
        accessorKey: 'mandatory',
        header: 'Pflicht',
        cell: ({ row }) => row.original.mandatory ? 'Ja' : 'Nein',
      },
    ],
    [selectedId],
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:w-[80vw] lg:max-w-none max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Block hinzufügen</DialogTitle>
          <DialogDescription>
            Wählen Sie einen Block aus der Liste aus und fügen Sie ihn hinzu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <FilterableTable
              data={filteredBlocks}
              columns={columns}
              getRowClassName={row =>
                selectedId === row.original.id
                  ? 'cursor-pointer'
                  : 'bg-white text-black hover:bg-gray-100 cursor-pointer'
              }
              globalFilterColumnIds={['name', 'content.title']}
              onRowClick={row => setSelectedId(row.original.id)}
              tableClassName="min-w-full border border-gray-300 text-sm"
              cellClassName="px-3 py-2 border-b border-gray-200"
              headerClassName="px-3 py-2 font-bold text-left border-b border-gray-300 bg-gray-100"
            />
          </div>
          
          {/* Add Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => selectedBlock && onAdd(selectedBlock)}
              disabled={!selectedBlock}
              aria-label="Block hinzufügen"
            >
              + Hinzufügen
            </Button>
          </div>
          
          {/* Vorschau */}
          <div className="border border-gray-300 rounded p-4 bg-white">
            <div className="font-bold mb-2">Vorschau</div>
            <div className="relative h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
              {selectedBlock ? (
                <div className="space-y-2">
                  {selectedBlock.content?.title && !selectedBlock.hideTitle && (
                    <h3 className="font-bold text-lg">{selectedBlock.content.title}</h3>
                  )}
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {selectedBlock.content?.content || 'Kein Inhalt verfügbar'}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockDialog;
