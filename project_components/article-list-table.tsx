import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import ArticleDetail from './article-detail';
import { FilterableTable } from './filterable-table';
import IconButton from './icon-button';
import InlineRowCheckbox from './inline-row-checkbox';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import type { Language } from '@/lib/db/schema';
import type { ArticleWithCalculations } from '@/lib/db/articles';


type ArticleWithCalculationCount = ArticleWithCalculations & {
  calculationCount?: number;
};

type ArticleListItem = {
  id: string;
  number: string;
  name: string;
  description: string | null;
  price: string | null;
  hideTitle: boolean;
  updatedAt: string;
  calculationCount: number;
};

interface ArticleListTableProps {
  data: ArticleListItem[];
  languages: Language[];
  onSaveArticleProperties?: (articleId: string, data: any, reloadData?: boolean) => Promise<void>;
  onSaveArticleContent?: (articleId: string, content: any[]) => Promise<void>;
  onSaveArticleCalculations?: (articleId: string, calculations: any[]) => Promise<void>;
  onDeleteArticle?: (articleId: string) => Promise<void>;
  onCreateArticle?: () => Promise<ArticleListItem>;
  onCopyArticle?: (article: ArticleListItem) => Promise<ArticleListItem>;
}

const ArticleListTable: FC<ArticleListTableProps> = ({ 
  data, 
  languages,
  onSaveArticleProperties,
  onSaveArticleContent,
  onSaveArticleCalculations,
  onDeleteArticle,
  onCreateArticle,
  onCopyArticle
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [articleToDelete, setArticleToDelete] = useState<ArticleListItem | null>(null);
  const [tableData, setTableData] = useState<ArticleListItem[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleOptimisticUpdate = (articleId: string, updates: Partial<ArticleListItem>) => {
    setTableData(prevData =>
      prevData.map(article =>
        article.id === articleId
          ? { ...article, ...updates }
          : article
      )
    );
    
    if (onSaveArticleProperties) {
      onSaveArticleProperties(articleId, updates, false);
    }
  };

  const getCalculationCount = (article: ArticleListItem): number => {
    return article.calculationCount;
  };

  const getLastModified = (article: ArticleListItem): string => {
    return new Date(article.updatedAt).toLocaleDateString('de-DE');
  };

  const handleOpenArticleDetail = async (article: ArticleListItem) => {
    // Create wrapper functions to match ArticleDetail's expected signatures
    const handleSaveProperties = onSaveArticleProperties 
      ? async (articleId: string, data: any) => {
          onSaveArticleProperties(articleId, data, false);
        }
      : undefined;

    const handleSaveContent = onSaveArticleContent
      ? async (articleId: string, content: any[]) => {
          onSaveArticleContent(articleId, content);
        }
      : undefined;

    const handleSaveCalculations = onSaveArticleCalculations
      ? async (articleId: string, calculations: any[]) => {
          onSaveArticleCalculations(articleId, calculations);
        }
      : undefined;

    openNewTab({
      id: `article-detail-${article.id}`,
      title: `Artikel: ${article.name}`,
      content: (
        <ArticleDetail 
          articleId={article.id}
          languages={languages}
          onSaveProperties={handleSaveProperties}
          onSaveContent={handleSaveContent}
          onSaveCalculations={handleSaveCalculations}
        />
      ),
      closable: true,
    });
  };

  const handleAddNewArticle = async () => {
    if (!onCreateArticle) {
      toast.error('Artikel-Erstellung nicht verfügbar');
      return;
    }
    
    try {
      const newArticle = await onCreateArticle();

      // Create wrapper functions to match ArticleDetail's expected signatures
      const handleSaveProperties = onSaveArticleProperties 
        ? async (articleId: string, data: any) => {
            onSaveArticleProperties(articleId, data, false);
          }
        : undefined;

      const handleSaveContent = onSaveArticleContent
        ? async (articleId: string, content: any[]) => {
            onSaveArticleContent(articleId, content);
          }
        : undefined;

      const handleSaveCalculations = onSaveArticleCalculations
        ? async (articleId: string, calculations: any[]) => {
            onSaveArticleCalculations(articleId, calculations);
          }
        : undefined;

      const newArticleId = `article-detail-${newArticle.id}`;
      openNewTab({
        id: newArticleId,
        title: 'Neuer Artikel',
        content: (
          <ArticleDetail 
            articleId={newArticle.id}
            languages={languages}
            onSaveProperties={handleSaveProperties}
            onSaveContent={handleSaveContent}
            onSaveCalculations={handleSaveCalculations}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Error creating/loading article:', error);
      toast.error('Fehler beim Erstellen des Artikels');
    }
  };

  const handleCopyArticle = async (article: ArticleListItem) => {
    if (!onCopyArticle) {
      toast.error('Artikel-Kopierung nicht verfügbar');
      return;
    }

    try {
      const copiedArticle = await onCopyArticle(article);
      
      // Update the table data with the new copied article
      setTableData(prevData => [...prevData, copiedArticle]);
      
      toast.success(`Artikel "${article.name}" wurde kopiert`);
      
      // Create wrapper functions to match ArticleDetail's expected signatures
      const handleSaveProperties = onSaveArticleProperties 
        ? async (articleId: string, data: any) => {
            onSaveArticleProperties(articleId, data, false);
          }
        : undefined;

      const handleSaveContent = onSaveArticleContent
        ? async (articleId: string, content: any[]) => {
            onSaveArticleContent(articleId, content);
          }
        : undefined;

      const handleSaveCalculations = onSaveArticleCalculations
        ? async (articleId: string, calculations: any[]) => {
            onSaveArticleCalculations(articleId, calculations);
          }
        : undefined;
      
      // Optionally open the copied article in a new tab
      const copiedArticleId = `article-detail-${copiedArticle.id}`;
      openNewTab({
        id: copiedArticleId,
        title: `Artikel: ${copiedArticle.name}`,
        content: (
          <ArticleDetail 
            articleId={copiedArticle.id}
            languages={languages}
            onSaveProperties={handleSaveProperties}
            onSaveContent={handleSaveContent}
            onSaveCalculations={handleSaveCalculations}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Fehler beim Kopieren des Artikels:', error);
      toast.error('Fehler beim Kopieren des Artikels');
    }
  };

  const handleInitiateDelete = (article: ArticleListItem) => {
    setArticleToDelete(article);
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    
    if (onDeleteArticle) {
      onDeleteArticle(articleToDelete.id);
    }
    
    setTableData(prevData =>
      prevData.filter(a => a.id !== articleToDelete.id)
    );
    setArticleToDelete(null);
  };

  const columns: ColumnDef<ArticleListItem>[] = [
    {
      accessorKey: 'number',
      header: 'Nr.',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-medium"
          onClick={async (e) => {
            e.stopPropagation();
            await handleOpenArticleDetail(row.original);
          }}
          tabIndex={0}
          aria-label={`Artikel ${row.original.number} öffnen`}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              await handleOpenArticleDetail(row.original);
            }
          }}
        >
          {row.original.number}
        </span>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => row.original.name,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'description',
      header: 'Beschreibung',
      cell: ({ row }) => row.original.description || '-',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'price',
      header: 'Preis',
      cell: ({ row }) => `€ ${row.original.price}`,
    },
    {
      accessorKey: 'calculationCount',
      header: 'Kalkulationen',
      cell: ({ row }) => getCalculationCount(row.original),
    },
    {
      accessorKey: 'lastModified',
      header: 'zuletzt geändert am',
      cell: ({ row }) => getLastModified(row.original),
    },
    {
      accessorKey: 'hideTitle',
      header: 'Titel ausblenden',
      cell: ({ row }) => (
        <InlineRowCheckbox
          checked={row.original.hideTitle}
          onClick={async (checked) => {
            handleOptimisticUpdate(row.original.id, { hideTitle: checked });
          }}
          aria-label="Titel ausblenden"
          disabled={!onSaveArticleProperties}
        />
      ),
    },
    {
      id: 'aktionen',
      header: 'Aktion',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <IconButton
            icon={<Pencil size={16} />}
            aria-label="Bearbeiten"
            onClick={async (e) => {
              e.stopPropagation();
              await handleOpenArticleDetail(row.original);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                await handleOpenArticleDetail(row.original);
              }
            }}
          />
          <IconButton
            icon={<Copy size={16} />}
            aria-label="Kopieren"
            disabled={!onCopyArticle}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleCopyArticle(row.original);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                await handleCopyArticle(row.original);
              }
            }}
            onMouseDown={e => {
              e.stopPropagation();
            }}
          />
          <IconButton
            icon={<Trash2 size={16} />}
            aria-label="Löschen"
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={e => {
              e.stopPropagation();
              handleInitiateDelete(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleInitiateDelete(row.original);
              }
            }}
          />
        </div>
      ),
    },
  ];

  const getRowClassName = (row: Row<ArticleListItem>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = async (row: Row<ArticleListItem>) => {
    setSelectedRow(row.id);
    await handleOpenArticleDetail(row.original);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          aria-label="Artikel hinzufügen"
          tabIndex={0}
          onClick={handleAddNewArticle}
          disabled={!onCreateArticle}
        >
          + Artikel hinzufügen
        </Button>
      </div>
      <div className="overflow-x-auto">
        <FilterableTable
          data={tableData}
          columns={columns}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          globalFilterColumnIds={['number', 'name', 'description']}
          filterPlaceholder="Filtern..."
        />
      </div>
      <DeleteConfirmationDialog
        open={!!articleToDelete}
        onOpenChange={open => !open && setArticleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Artikel löschen"
        description={`Möchten Sie den Artikel "${articleToDelete?.name || ''}" wirklich löschen?`}
      />
    </div>
  );
};

export default ArticleListTable;
