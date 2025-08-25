'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FilterableTable } from './filterable-table';
import type { ColumnDef } from '@tanstack/react-table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createQuotePosition } from '@/lib/api/quotes';
import { fetchBlocksWithContentByLanguage } from '@/lib/api/blocks';
import { formatGermanDate } from '@/helper/date-formatter';
import { parseJsonContent } from '@/helper/plate-json-parser';
import { plateValueToHtml } from '@/helper/plate-serialization';
import { LoadingIndicator } from './loading-indicator';
import LoadingButton from './loading-button';
import type { BlockWithContent } from '@/lib/db/blocks';

export type DialogBlockWithContent = BlockWithContent & {
  content?: {
    title: string;
    content: string;
  } | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  versionId?: string;
  selectedNodeId?: string | null;
  onPositionCreated?: (positionId: string) => void;
  languageId: string;
};

const AddBlockDialog: React.FC<Props> = ({ 
  open, 
  onClose, 
  versionId, 
  selectedNodeId,
  onPositionCreated,
  languageId
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Load blocks when dialog opens and languageId is available
  useEffect(() => {
    if (open && languageId) {
      setIsLoading(true);
      fetchBlocksWithContentByLanguage(languageId)
        .then((fetchedBlocks) => {
          setBlocks(fetchedBlocks);
          if (fetchedBlocks.length > 0 && !selectedId) {
            setSelectedId(fetchedBlocks[0].id);
          }
        })
        .catch((error) => {
          console.error('Error fetching blocks:', error);
          toast.error('Fehler beim Laden der Blöcke');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, languageId]);

  const filteredBlocks = useMemo(
    () =>
      blocks.filter(
        b =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          (b.blockContents?.[0]?.title && b.blockContents[0].title.toLowerCase().includes(search.toLowerCase())),
      ),
    [search, blocks],
  );

  const selectedBlock = useMemo(
    () => blocks.find(b => b.id === selectedId) || null,
    [selectedId, blocks],
  );

  // Function to update preview HTML with current block content
  const updatePreviewHtml = useCallback(async () => {
    if (!selectedBlock?.blockContents?.[0]?.content) {
      setPreviewHtml("<em>(Kein Inhalt verfügbar)</em>");
      return;
    }

    try {
      // Parse the JSON string back to PlateJS value
      const plateValue = parseJsonContent(selectedBlock.blockContents[0].content);
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
        accessorKey: 'blockContents.title',
        header: 'Überschrift',
        cell: ({ row }) => row.original.blockContents?.[0]?.title || '-',
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
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingIndicator text="Blöcke werden geladen..." variant="centered" />
              </div>
            ) : (
              <FilterableTable
                data={filteredBlocks}
                columns={columns}
                getRowClassName={row =>
                  selectedId === row.original.id
                    ? 'cursor-pointer'
                    : 'bg-white text-black hover:bg-gray-100 cursor-pointer'
                }
                globalFilterColumnIds={['name', 'blockContents.title']}
                onRowClick={row => setSelectedId(row.original.id)}
                tableClassName="min-w-full border border-gray-300 text-sm"
                cellClassName="px-3 py-2 border-b border-gray-200"
                headerClassName="px-3 py-2 font-bold text-left border-b border-gray-300 bg-gray-100"
              />
            )}
          </div>
          
          {/* Add Button */}
          <div className="flex justify-end">
            <LoadingButton
              onClick={handleAddBlock}
              disabled={!selectedBlock}
              loading={isAdding}
              loadingText="Hinzufügen..."
              aria-label="Block hinzufügen"
            >
              Hinzufügen
            </LoadingButton>
          </div>
          
          {/* Vorschau */}
          <div className="border border-gray-300 rounded p-4 bg-white">
            <div className="font-bold mb-2">Vorschau</div>
            <div className="relative h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 mb-2">
              {selectedBlock ? (
                <div className="space-y-2">
                  {selectedBlock.blockContents?.[0]?.title && !selectedBlock.hideTitle && (
                    <h3 className="font-bold text-lg">{selectedBlock.blockContents[0].title}</h3>
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
