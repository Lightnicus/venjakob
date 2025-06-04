import { useState, ChangeEvent, KeyboardEvent } from 'react';
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
import { useTabbedInterface } from './tabbed-interface-provider';
import ArticleDetail from './article-detail';
import articlesData from '@/data/articles-list-tables.json'; // Import article data
import allSystemLanguages from '@/data/languages.json'; // Import all available languages
import { FilterableTable, DateFilterConfig } from './filterable-table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'; // Import DeleteConfirmationDialog

// Define types based on the JSON structure
interface LocalizedContentDetail {
  ueberschrift: string;
  beschreibung: string;
}

interface ArticleEntry {
  nr: string;
  title: string;
  languageKeys: string[];
  date: string;
  lastChangedBy: string;
  localizedContent: Partial<Record<string, LocalizedContentDetail>>;
}

interface LanguageOption {
  value: string;
  label: string;
}

// Props for ArticleListTable - data will now come from the imported JSON
// type Props = {
//   data: ArticleEntry[]; // This prop might no longer be needed if data is directly imported and used
// };

const icons = {
  edit: Pencil,
  copy: Copy,
  delete: Trash2,
};

export const ArticleListTable = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [articleToDelete, setArticleToDelete] = useState<ArticleEntry | null>(
    null,
  ); // State for article to delete
  const [articles, setArticles] = useState<ArticleEntry[]>(
    articlesData as ArticleEntry[],
  ); // State for articles

  // Cast imported JSON to our defined types
  // const typedArticlesData: ArticleEntry[] = articlesData as ArticleEntry[]; // We'll use the 'articles' state now
  const typedAllSystemLanguages: LanguageOption[] =
    allSystemLanguages as LanguageOption[];

  const getLanguageLabels = (languageKeys: string[]): string => {
    return languageKeys
      .map(
        key =>
          typedAllSystemLanguages.find(lang => lang.value === key)?.label ||
          key,
      )
      .join(', ');
  };

  const handleCopyBlock = (article: ArticleEntry) => {
    console.log('Kopiere Block:', article.title);
    toast('Artikel wurde kopiert');
  };

  const handleInitiateDelete = (article: ArticleEntry) => {
    setArticleToDelete(article);
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    setArticles(prevArticles =>
      prevArticles.filter(a => a.nr !== articleToDelete.nr),
    );
    toast.success(`Artikel "${articleToDelete.nr}" wurde gelöscht`);
    setArticleToDelete(null);
  };

  const handleOpenArticleDetailTab = (article: ArticleEntry) => {
    setSelected(article.nr);
    const tabId = `article-detail-${article.nr}`;

    const lastChangeInfo = `Zuletzt geändert am ${article.date} von ${article.lastChangedBy}`;

    const articleSpecificInitialData: Record<string, LocalizedContentDetail> =
      {};
    article.languageKeys.forEach(key => {
      if (article.localizedContent[key]) {
        articleSpecificInitialData[key] = article.localizedContent[key];
      }
    });

    openNewTab({
      id: tabId,
      title: `Artikel ${article.nr}`,
      content: (
        <ArticleDetail
          articleId={article.nr}
          initialData={articleSpecificInitialData}
          availableLanguages={typedAllSystemLanguages}
          lastChangeInfo={lastChangeInfo}
          onSaveChanges={updatedData => {
            console.log(`Änderungen für ${article.nr} speichern:`, updatedData);
            // Backend/state update logic
          }}
        />
      ),
      closable: true,
    });
  };

  const columns: ColumnDef<ArticleEntry, any>[] = [
    {
      accessorKey: 'nr',
      header: 'Nr.',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline hover:text-blue-900 font-medium cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            handleOpenArticleDetailTab(row.original);
          }}
          onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleOpenArticleDetailTab(row.original);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Artikel ${row.original.nr} öffnen`}
        >
          {row.original.nr}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'title',
      header: 'Überschrift',
      cell: ({ row }) => row.original.title,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'languageKeys',
      header: 'Sprachen',
      cell: ({ row }) => getLanguageLabels(row.original.languageKeys),
      enableSorting: false,
      enableColumnFilter: false, // No simple text filter for this
      meta: {
        headerClassName: 'w-40', // Apply original width
      },
    },
    {
      accessorKey: 'date',
      header: 'Datum', // FilterableTable's DateFilterHeader will use this
      cell: ({ row }) => row.original.date,
      enableSorting: true,
      // Column filtering is handled by dateFilterColumns prop
      meta: {
        headerClassName: 'w-32', // Apply original width
      },
    },
    {
      id: 'actions',
      header: 'Aktion',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label={`Bearbeiten Artikel ${row.original.nr}`}
            onClick={e => {
              e.stopPropagation();
              handleOpenArticleDetailTab(row.original);
            }}
          >
            <icons.edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label={`Kopieren Artikel ${row.original.nr}`}
            onClick={e => {
              e.stopPropagation();
              handleCopyBlock(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleCopyBlock(row.original);
              }
            }}
          >
            <icons.copy size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
            aria-label={`Löschen Artikel ${row.original.nr}`}
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
          >
            <icons.delete size={16} />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        headerClassName: 'w-32', // Apply original width
      },
    },
  ];

  const dateFilterConfigForDatum: DateFilterConfig = {
    dateFieldPath: 'date',
  };

  const getRowClassName = (row: Row<ArticleEntry>) => {
    let className = `cursor-pointer hover:bg-blue-100`;
    if (selected === row.original.nr) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  if (articles.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer flex items-center gap-1"
            tabIndex={0}
            aria-label="Artikel hinzufügen"
          >
            + Artikel hinzufügen
          </Button>
        </div>
        <div className="rounded-md border p-4 text-center">
          <p className="py-8">Keine Artikel vorhanden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer flex items-center gap-1"
          tabIndex={0}
          aria-label="Artikel hinzufügen"
        >
          + Artikel hinzufügen
        </Button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <FilterableTable
          data={articles}
          columns={columns}
          onRowClick={row => handleOpenArticleDetailTab(row.original)}
          getRowClassName={getRowClassName}
          dateFilterColumns={{ date: dateFilterConfigForDatum }} // 'date' is accessorKey
          defaultSorting={[{ id: 'nr', desc: false }]} // Default sort by Nr Asc
          tableClassName="w-full"
          filterPlaceholder="Filtern..."
          globalFilterColumnIds={['nr', 'languageKeys', 'title']}
        />
      </div>
      <DeleteConfirmationDialog
        open={!!articleToDelete}
        onOpenChange={open => !open && setArticleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Artikel löschen"
        description={`Möchten Sie den Artikel "${articleToDelete?.nr || ''}" (${articleToDelete?.title || ''}) wirklich löschen?`}
      />
    </div>
  );
};

export default ArticleListTable;
