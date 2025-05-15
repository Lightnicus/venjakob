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
import { useTabbedInterface } from './tabbed-interface-provider';
import ArticleDetail from './article-detail';
import articlesData from '@/data/articles-list-tables.json'; // Import article data
import allSystemLanguages from '@/data/languages.json'; // Import all available languages

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
  localizedContent: Record<string, LocalizedContentDetail>;
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

export const ArticleListTable = (/*{ data }: Props*/) => { // data prop removed, using imported articlesData
  const [searchNr, setSearchNr] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();

  // Cast imported JSON to our defined types
  const typedArticlesData: ArticleEntry[] = articlesData as ArticleEntry[];
  const typedAllSystemLanguages: LanguageOption[] = allSystemLanguages as LanguageOption[];

  const handleSearchNr = (e: ChangeEvent<HTMLInputElement>) => setSearchNr(e.target.value);
  const handleSearchTitle = (e: ChangeEvent<HTMLInputElement>) => setSearchTitle(e.target.value);

  const filteredArticles = typedArticlesData.filter(
    (a) =>
      a.nr.toLowerCase().includes(searchNr.toLowerCase()) &&
      a.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  const getLanguageLabels = (languageKeys: string[]): string => {
    return languageKeys
      .map(key => typedAllSystemLanguages.find(lang => lang.value === key)?.label || key)
      .join(', ');
  };

  const handleOpenArticleDetailTab = (article: ArticleEntry) => {
    setSelected(article.nr);
    const tabId = `article-detail-${article.nr}`;
    
    const lastChangeInfo = `Zuletzt geändert am ${article.date} von ${article.lastChangedBy}`;

    // Prepare the initialData for ArticleDetail by filtering based on article.languageKeys
    // to only pass content for languages actually present in the article.
    const articleSpecificInitialData: Record<string, LocalizedContentDetail> = {};
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
          initialData={articleSpecificInitialData} // Pass the article's specific localized content
          availableLanguages={typedAllSystemLanguages} // Pass all system languages for the dropdowns
          lastChangeInfo={lastChangeInfo}
          onSaveChanges={(updatedData) => {
            console.log(`Änderungen für ${article.nr} speichern:`, updatedData);
            // Here you would typically update your backend or global state
            // For now, just logging. To reflect changes in UI immediately without backend,
            // you might need to update the state within ArticleListTable or a higher-level state manager.
          }}
        />
      ),
      closable: true,
    });
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, article: ArticleEntry) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenArticleDetailTab(article);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <button
          className="border rounded px-3 py-1 bg-white hover:bg-gray-100 text-sm font-medium"
          tabIndex={0}
          aria-label="Artikel hinzufügen"
          // onClick for this button would likely also use openNewTab to open a blank ArticleDetail or a creation form
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
                  placeholder="Nr. suchen"
                  value={searchNr}
                  onChange={handleSearchNr}
                  aria-label="Suche Artikelnummer"
                />
              </TableHead>
              <TableHead>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="Überschrift suchen"
                  value={searchTitle}
                  onChange={handleSearchTitle}
                  aria-label="Suche Überschrift"
                />
              </TableHead>
              <TableHead className="w-40">Sprachen</TableHead>
              <TableHead className="w-32">Datum</TableHead>
              <TableHead className="w-32">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length ? (
              filteredArticles.map((article, i) => (
                <TableRow
                  key={article.nr}
                  tabIndex={0}
                  aria-label={`Artikel ${article.nr} ${article.title}`}
                  onClick={() => handleOpenArticleDetailTab(article)}
                  onKeyDown={(e) => handleRowKeyDown(e, article)}
                  className={
                    `cursor-pointer ${selected === article.nr ? 'bg-blue-200' : i % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-blue-100`
                  }
                  data-state={selected === article.nr ? 'selected' : undefined}
                >
                  <TableCell 
                    className="text-blue-700 underline hover:text-blue-900 font-medium"
                  >
                    {article.nr}
                  </TableCell>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{getLanguageLabels(article.languageKeys)}</TableCell>
                  <TableCell>{article.date}</TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      tabIndex={0}
                      aria-label={`Bearbeiten Artikel ${article.nr}`}
                      className="hover:text-blue-600 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenArticleDetailTab(article);
                      }}
                    >
                      <icons.edit size={16} />
                    </button>
                    <button
                      tabIndex={0}
                      aria-label={`Kopieren Artikel ${article.nr}`}
                      className="hover:text-blue-600 p-1"
                      onClick={(e) => e.stopPropagation()} 
                    >
                      <icons.copy size={16} />
                    </button>
                    <button
                      tabIndex={0}
                      aria-label={`Löschen Artikel ${article.nr}`}
                      className="hover:text-red-600 p-1"
                       onClick={(e) => e.stopPropagation()} 
                    >
                      <icons.delete size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Keine Ergebnisse für die aktuelle Suche.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArticleListTable; 