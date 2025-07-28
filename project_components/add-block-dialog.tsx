import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { parseJsonContent } from '@/helper/plate-json-parser';
import { plateValueToHtml } from '@/helper/plate-serialization';
import { formatGermanDate } from '@/helper/date-formatter';
import { createQuotePosition } from '@/lib/api/quotes';
import { toast } from 'sonner';

export type BlockWithContent = Block & {
  content?: BlockContent;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (block: BlockWithContent) => void;
  blocks: BlockWithContent[];
  versionId?: string;
  selectedNodeId?: string | null;
  onPositionCreated?: (newPositionId: string) => void;
};

const AddBlockDialog: React.FC<Props> = ({ 
  open, 
  onClose, 
  onAdd, 
  blocks, 
  versionId, 
  selectedNodeId,
  onPositionCreated 
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    blocks[0]?.id ?? null,
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

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

  // Function to update preview HTML with current block content
  const updatePreviewHtml = useCallback(async () => {
    if (!selectedBlock?.content?.content) {
      setPreviewHtml("<em>(Kein Inhalt verfügbar)</em>");
      return;
    }

    try {
      // Parse the JSON string back to PlateJS value
      const plateValue = parseJsonContent(selectedBlock.content.content);
      // Convert to HTML
      const html = await plateValueToHtml(plateValue);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error converting block content to HTML for preview:', error);
      setPreviewHtml("<em>(Fehler beim Laden der Vorschau)</em>");
    }
  }, [selectedBlock]);

  // Update preview when selected block changes
  useEffect(() => {
    updatePreviewHtml();
  }, [selectedBlock, updatePreviewHtml]);

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
            ? formatGermanDate(row.original.updatedAt)
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

  const handleAddBlock = useCallback(async () => {
    if (!selectedBlock || !versionId) {
      toast.error('Block oder Version nicht verfügbar');
      return;
    }

    setIsAdding(true);
    try {
      console.log('Adding block with:', {
        versionId,
        blockId: selectedBlock.id,
        selectedNodeId
      });

      // Pass the selectedNodeId directly to the API
      // The server-side logic will handle the validation and positioning
      const newPosition = await createQuotePosition(versionId, selectedBlock.id, selectedNodeId);
      
      toast.success('Block erfolgreich hinzugefügt');
      onClose();
      
      // Call the callback to notify parent component
      if (onPositionCreated) {
        onPositionCreated(newPosition.id);
      }
    } catch (error) {
      console.error('Error adding block:', error);
      toast.error('Fehler beim Hinzufügen des Blocks');
    } finally {
      setIsAdding(false);
    }
  }, [selectedBlock, versionId, selectedNodeId, onClose, onPositionCreated]);

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
              onClick={handleAddBlock}
              disabled={!selectedBlock || isAdding}
              aria-label="Block hinzufügen"
            >
              {isAdding ? 'Hinzufügen...' : '+ Hinzufügen'}
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
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                <div className="text-gray-500 italic">Kein Block ausgewählt</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockDialog;
