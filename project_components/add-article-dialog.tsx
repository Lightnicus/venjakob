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
import { fetchArticlesByLanguage } from '@/lib/api/articles';
import { createQuotePositionForArticle } from '@/lib/api/quotes';
import { toast } from 'sonner';
import { parseJsonContent } from '@/helper/plate-json-parser';
import { plateValueToHtml } from '@/helper/plate-serialization';

export type Article = {
  id: string;
  number: string;
  title: string;
  price: string | null;
  hideTitle: boolean;
  updatedAt: string;
  content: string | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd?: (article: Article) => void;
  languageId?: string;
  versionId?: string;
  selectedNodeId?: string | null;
  onPositionCreated?: (positionId: string) => void;
}

const AddArticleDialog: React.FC<Props> = ({
  open,
  onClose,
  onAdd,
  languageId,
  versionId,
  selectedNodeId,
  onPositionCreated,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // Load articles when dialog opens and languageId is available
  useEffect(() => {
    if (open && languageId) {
      setIsLoading(true);
      fetchArticlesByLanguage(languageId)
        .then((fetchedArticles) => {
          setArticles(fetchedArticles);
          if (fetchedArticles.length > 0 && !selectedId) {
            setSelectedId(fetchedArticles[0].id);
          }
        })
        .catch((error) => {
          console.error('Error fetching articles:', error);
          toast.error('Fehler beim Laden der Artikel');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, languageId]);

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        a =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.number.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, articles],
  );

  const selectedArticle = useMemo(
    () => articles.find(a => a.id === selectedId) || null,
    [selectedId, articles],
  );

  // Function to update preview HTML with current article content
  const updatePreviewHtml = useCallback(async () => {
    if (!selectedArticle?.content) {
      setPreviewHtml("<em>(Kein Inhalt verfügbar)</em>");
      return;
    }

    try {
      // Parse the JSON string back to PlateJS value
      const plateValue = parseJsonContent(selectedArticle.content);
      // Convert to HTML
      const html = await plateValueToHtml(plateValue);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error converting article content to HTML for preview:', error);
      setPreviewHtml("<em>(Fehler beim Laden der Vorschau)</em>");
    }
  }, [selectedArticle]);

  // Update preview when selected article changes
  useEffect(() => {
    updatePreviewHtml();
  }, [selectedArticle, updatePreviewHtml]);

  const handleAddArticle = useCallback(async () => {
    if (!selectedArticle || !versionId) {
      toast.error('Artikel oder Version nicht verfügbar');
      return;
    }

    setIsAdding(true);
    try {
      console.log('Adding article with:', {
        versionId,
        articleId: selectedArticle.id,
        selectedNodeId
      });

      // Pass the selectedNodeId directly to the API
      // The server-side logic will handle the validation and positioning
      const newPosition = await createQuotePositionForArticle(versionId, selectedArticle.id, selectedNodeId);
      
      toast.success('Artikel erfolgreich hinzugefügt');
      onClose();
      
      // Call the callback to notify parent component
      if (onPositionCreated) {
        onPositionCreated(newPosition.id);
      }
    } catch (error) {
      console.error('Error adding article:', error);
      toast.error('Fehler beim Hinzufügen des Artikels');
    } finally {
      setIsAdding(false);
    }
  }, [selectedArticle, versionId, selectedNodeId, onClose, onPositionCreated]);

  const columns = useMemo<ColumnDef<Article>[]>(
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
              aria-label={`Artikel ${row.original.title} auswählen`}
            />
          </RadioGroup>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'number',
        header: 'Nummer',
      },
      {
        accessorKey: 'title',
        header: 'Titel',
      },
      {
        accessorKey: 'price',
        header: 'Preis',
        cell: ({ row }) => 
          row.original.price 
            ? `€${parseFloat(row.original.price).toFixed(2)}`
            : '-',
      },
      {
        accessorKey: 'updatedAt',
        header: 'letzte Änderung',
        cell: ({ row }) => 
          row.original.updatedAt 
            ? new Date(row.original.updatedAt).toLocaleDateString('de-DE')
            : '-',
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
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Lade Artikel...</div>
              </div>
            ) : (
              <FilterableTable
                data={filteredArticles}
                columns={columns}
                getRowClassName={row =>
                  selectedId === row.original.id
                    ? 'cursor-pointer'
                    : 'bg-white text-black hover:bg-gray-100 cursor-pointer'
                }
                globalFilterColumnIds={['title', 'number']}
                onRowClick={row => setSelectedId(row.original.id)}
                tableClassName="min-w-full border border-gray-300 text-sm"
                cellClassName="px-3 py-2 border-b border-gray-200"
                headerClassName="px-3 py-2 font-bold text-left border-b border-gray-300 bg-gray-100"
              />
            )}
          </div>
          
          {/* Add Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleAddArticle}
              disabled={!selectedArticle || isAdding}
              aria-label="Artikel hinzufügen"
            >
              {isAdding ? 'Hinzufügen...' : '+ Hinzufügen'}
            </Button>
          </div>
          
          {/* Vorschau */}
          <div className="border border-gray-300 rounded p-4 bg-white">
            <div className="font-bold mb-2">Vorschau</div>
            <div className="relative h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 mb-2">
              {selectedArticle ? (
                <div className="space-y-2">
                  {selectedArticle.title && !selectedArticle.hideTitle && (
                    <h3 className="font-bold text-lg">{selectedArticle.title}</h3>
                  )}
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                <div className="text-gray-500 italic">Kein Artikel ausgewählt</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleDialog;
