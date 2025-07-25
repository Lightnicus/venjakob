import React, { FC, useState, useEffect } from 'react';
import { Edit3, Save, Loader2, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PlateRichTextEditor, { plateValueToHtml } from '@/project_components/plate-rich-text-editor';
import { type Value } from 'platejs';
import ArticleProperties from '@/project_components/article-properties';
import EditLockButton from '@/project_components/edit-lock-button';
import { fetchArticleWithCalculations } from '@/lib/api/articles';
import type { ArticleWithCalculations } from '@/lib/db/articles';
import { useTabReload, useTabTitle } from './tabbed-interface-provider';
import { parseJsonContent } from '@/helper/plate-json-parser';

// Types
interface Language {
  id: string;
  value: string;
  label: string;
}

interface AllgemeineData {
  nr: string;
  einzelpreis: string;
  ueberschriftNichtDrucken: boolean;
}

interface ArticleDetailProps {
  articleId: string;
  languages: Language[];
  onSaveProperties?: (articleId: string, data: any) => Promise<void>;
  onSaveContent?: (articleId: string, content: any[]) => Promise<void>;
  onSaveCalculations?: (articleId: string, calculations: any[]) => Promise<void>;
}

// Helper component to handle async HTML conversion for preview
const PreviewContent: React.FC<{
  title: string;
  content: string;
  hideTitle: boolean;
}> = ({ title, content, hideTitle }) => {
  const [html, setHtml] = React.useState('');

  useEffect(() => {
    plateValueToHtml(parseJsonContent(content)).then(setHtml);
  }, [content]);

  return (
    <div className="p-4 border rounded-md bg-gray-50 min-h-[200px]">
      {!hideTitle && (
        <h3 className="text-xl font-semibold mb-2 break-words">
          {title || 'Artikel'}
        </h3>
      )}
      <div
        className="prose max-w-none prose-sm sm:prose-base lg:prose-lg"
        dangerouslySetInnerHTML={{
          __html: html || '<em>(Kein Inhalt)</em>',
        }}
      />
    </div>
  );
};

const ArticleDetail: FC<ArticleDetailProps> = ({
  articleId,
  languages,
  onSaveProperties,
  onSaveContent,
  onSaveCalculations,
}) => {
  const [article, setArticle] = useState<ArticleWithCalculations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('beschreibungen');
  
  // Add state for article properties
  const [editedAllgemeineData, setEditedAllgemeineData] = useState<AllgemeineData>({
    nr: '',
    einzelpreis: '0.00',
    ueberschriftNichtDrucken: false,
  });

  // Add state for calculation data
  const [editedKalkulationData, setEditedKalkulationData] = useState<Record<string, string>>({});
  
  // Content editing state
  const [editedArticleContents, setEditedArticleContents] = useState<
    Record<string, { title: string; content: string; languageId: string }>
  >({});

  const [currentLanguages, setCurrentLanguages] = useState<Language[]>([]);
  const [selectedPreviewLanguage, setSelectedPreviewLanguage] = useState('');
  const [selectedLanguageToAdd, setSelectedLanguageToAdd] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');

  // Set up reload functionality - no callback needed as this component loads its own data
  const { triggerReload } = useTabReload('articles', () => {});
  
  // Set up tab title functionality
  const { updateTitle } = useTabTitle(`article-detail-${articleId}`);

  // Load article data
  const loadArticleData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Fetch article data using the existing API function
      const articleData = await fetchArticleWithCalculations(articleId);
      
      if (!articleData) {
        throw new Error('Article not found');
      }
      setArticle(articleData);
      
      // Initialize properties state
      setEditedAllgemeineData({
        nr: articleData.number || '',
        einzelpreis: articleData.price || '0.00',
        ueberschriftNichtDrucken: articleData.hideTitle || false,
      });

      // Initialize calculation data
      const initialKalkulation: Record<string, string> = {};
      articleData.calculations.forEach(item => {
        initialKalkulation[item.id] = item.value || '0';
      });
      setEditedKalkulationData(initialKalkulation);

      // Initialize content state
      const initialContent: Record<string, { title: string; content: string; languageId: string }> = {};
      const contentLanguages: Language[] = [];
      
      if (articleData.content) {
        articleData.content.forEach(content => {
          const lang = languages.find(l => l.id === content.languageId);
          if (lang) {
            initialContent[lang.value] = {
              title: content.title,
              content: content.content,
              languageId: content.languageId,
            };
            if (!contentLanguages.find(cl => cl.id === lang.id)) {
              contentLanguages.push(lang);
            }
          }
        });
      }
      
      setEditedArticleContents(initialContent);
      setCurrentLanguages(contentLanguages);
      
      if (contentLanguages.length > 0) {
        setSelectedPreviewLanguage(contentLanguages[0].value);
      } else {
        setSelectedPreviewLanguage('');
      }

      setSelectedLanguageToAdd('');
      
      // Set initial display title
      const defaultLanguage = languages.find(lang => (lang as any).default === true);
      let initialTitle = 'Artikel'; // fallback
      if (defaultLanguage && articleData.content) {
        const defaultContent = articleData.content.find(content => content.languageId === defaultLanguage.id);
        if (defaultContent?.title) {
          initialTitle = defaultContent.title;
        }
      }
      setDisplayTitle(initialTitle);
      
    } catch (error) {
      console.error('Error loading article:', error);
      setLoadError('Fehler beim Laden des Artikels');
    } finally {
      setIsLoading(false);
    }
  };

  // Load article data when articleId changes
  useEffect(() => {
    if (articleId) {
      loadArticleData();
    }
  }, [articleId]);

  const handleRichTextChange = (langValue: string, content: Value) => {
    if (!isEditing) return;
    setEditedArticleContents(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { title: '', content: '', languageId: '' }),
        content: JSON.stringify(content),
      },
    }));
  };

  const handleInputChange = (langValue: string, field: 'title', value: string) => {
    if (!isEditing) return;
    setEditedArticleContents(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { title: '', content: '', languageId: '' }),
        [field]: value,
      },
    }));
  };

  // Add handlers for property changes
  const handleAllgemeineChange = (field: keyof AllgemeineData, value: string | boolean) => {
    if (!isEditing) return;
    setEditedAllgemeineData(prev => ({ ...prev, [field]: value }));
  };

  const handleKalkulationChange = (itemId: string, value: string) => {
    if (!isEditing) return;
    setEditedKalkulationData(prev => ({ ...prev, [itemId]: value }));
  };

  const handleToggleEdit = () => {
    if (isEditing && article) {
      // Reset to original data
      setEditedAllgemeineData({
        nr: article.number || '',
        einzelpreis: article.price || '0.00',
        ueberschriftNichtDrucken: article.hideTitle || false,
      });

      // Reset calculation data to original values
      const resetKalkulation: Record<string, string> = {};
      article.calculations.forEach(item => {
        resetKalkulation[item.id] = item.value || '0';
      });
      setEditedKalkulationData(resetKalkulation);

      const initial: Record<string, { title: string; content: string; languageId: string }> = {};
      const contentLanguages: Language[] = [];
      
      // Reset from existing article content
      if (article.content) {
        article.content.forEach(content => {
          const lang = languages.find(l => l.id === content.languageId);
          if (lang) {
            initial[lang.value] = {
              title: content.title,
              content: content.content,
              languageId: content.languageId,
            };
            if (!contentLanguages.find(cl => cl.id === lang.id)) {
              contentLanguages.push(lang);
            }
          }
        });
      }
      
      setEditedArticleContents(initial);
      setCurrentLanguages(contentLanguages);
      
      if (contentLanguages.length > 0) {
        setSelectedPreviewLanguage(
          contentLanguages.find(l => l.value === selectedPreviewLanguage)
            ? selectedPreviewLanguage
            : contentLanguages[0].value
        );
      } else {
        setSelectedPreviewLanguage('');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (isSaving || !article) return;

    setIsSaving(true);
    try {
      // Save properties if handler provided
      if (onSaveProperties) {
        const articleData = {
          number: editedAllgemeineData.nr,
          price: editedAllgemeineData.einzelpreis,
          hideTitle: editedAllgemeineData.ueberschriftNichtDrucken,
        };
        await onSaveProperties(article.id, articleData);
        
        // Update local article state immediately to reflect changes in UI
        setArticle(prev => prev ? ({
          ...prev,
          number: articleData.number,
          price: articleData.price,
          hideTitle: articleData.hideTitle,
          updatedAt: new Date().toISOString()
        }) : null);
      }

      // Save calculation items if handler provided
      if (onSaveCalculations) {
        const calculationsToSave = article.calculations.map(item => ({
          name: item.name,
          type: item.type,
          value: editedKalkulationData[item.id] || item.value,
          articleId: article.id,
          order: item.order,
        }));
        
        await onSaveCalculations(article.id, calculationsToSave);
        
        // Update local article state with new calculation values
        setArticle(prev => prev ? ({
          ...prev,
          calculations: prev.calculations.map(item => ({
            ...item,
            value: editedKalkulationData[item.id] || item.value,
            updatedAt: new Date().toISOString()
          })),
          updatedAt: new Date().toISOString()
        }) : null);
      }

      // Save content if handler provided
      if (onSaveContent) {
        const contentToSave = await Promise.all(
          currentLanguages.map(async lang => ({
            articleId: article.id,
            blockId: null,
            title: editedArticleContents[lang.value]?.title || '',
            content: editedArticleContents[lang.value]?.content || '',
            languageId: lang.id,
          }))
        );
        await onSaveContent(article.id, contentToSave);
      }

      setIsEditing(false);
      toast.success('Artikel gespeichert');
      
      // Update tab title and header with new title from default language using edited content
      const defaultLanguage = languages.find(lang => (lang as any).default === true);
      let newTitle = 'Artikel'; // fallback
      if (defaultLanguage && editedArticleContents[defaultLanguage.value]?.title) {
        newTitle = editedArticleContents[defaultLanguage.value].title;
      }
      setDisplayTitle(newTitle);
      updateTitle(`Artikel: ${newTitle}`);
      
      // Trigger reload for other tabs (like ArticleManagement)
      triggerReload();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLanguage = (langValueToRemove: string) => {
    if (!isEditing) return;
    setEditedArticleContents(prev => {
      const { [langValueToRemove]: _, ...remainingData } = prev;
      return remainingData;
    });
    const updatedCurrentLanguages = currentLanguages.filter(
      lang => lang.value !== langValueToRemove,
    );
    setCurrentLanguages(updatedCurrentLanguages);
    if (selectedPreviewLanguage === langValueToRemove) {
      setSelectedPreviewLanguage(updatedCurrentLanguages[0]?.value || '');
    }
  };

  const handleAddLanguage = () => {
    if (!isEditing || !selectedLanguageToAdd) return;
    
    // Find the selected language
    const langToAdd = languages.find(lang => lang.value === selectedLanguageToAdd);
    
    if (langToAdd && !currentLanguages.some(cl => cl.value === langToAdd.value)) {
      const newCurrentLanguages = [...currentLanguages, langToAdd];
      setCurrentLanguages(newCurrentLanguages);
      setEditedArticleContents(prev => ({
        ...prev,
        [langToAdd.value]: { title: '', content: '', languageId: langToAdd.id },
      }));
      if (!selectedPreviewLanguage && newCurrentLanguages.length === 1) {
        setSelectedPreviewLanguage(langToAdd.value);
      }
      // Reset the dropdown selection
      setSelectedLanguageToAdd('');
    } else {
      toast.error('Die ausgewählte Sprache ist bereits hinzugefügt oder ungültig.');
    }
  };

  // Get available languages for the dropdown
  const availableLanguages = languages.filter(
    lang => !currentLanguages.some(cl => cl.value === lang.value)
  );

  const currentPreviewData = editedArticleContents[selectedPreviewLanguage];

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin mr-2" />
          <span>Artikel wird geladen...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !article) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">{loadError || 'Artikel nicht gefunden'}</div>
          <Button onClick={loadArticleData} variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{displayTitle}</h2>
      <div className="mb-4">
        <EditLockButton
          resourceType="articles"
          resourceId={articleId}
          isEditing={isEditing}
          isSaving={isSaving}
          onToggleEdit={handleToggleEdit}
          onSave={handleSaveChanges}
          onRefreshData={loadArticleData}
          initialUpdatedAt={article?.updatedAt}
        />
      </div>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mb-6 w-full flex flex-col"
      >
        <TabsList className="shrink-0 bg-white p-0 border-b flex flex-wrap gap-0 justify-start rounded-none w-full">
          <TabsTrigger
            value="beschreibungen"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Beschreibungen
          </TabsTrigger>
          <TabsTrigger
            value="eigenschaften"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Eigenschaften
          </TabsTrigger>
          <TabsTrigger
            value="vorschau"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Vorschau
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="beschreibungen" className="mt-4">
          {currentLanguages.map(lang => (
            <Card key={lang.value} className="mb-8">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">{lang.label}</div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleRemoveLanguage(lang.value)}
                      aria-label={`${lang.label} Beschreibung löschen`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="mb-2">
                    <label
                      className="block text-xs mb-1"
                      htmlFor={`title-${lang.value}`}
                    >
                      Titel
                    </label>
                    <input
                      id={`title-${lang.value}`}
                      className="w-full border rounded px-2 py-1 text-sm bg-white read-only:bg-gray-100 read-only:cursor-not-allowed shadow-sm"
                      value={editedArticleContents[lang.value]?.title || ''}
                      onChange={e =>
                        handleInputChange(lang.value, 'title', e.target.value)
                      }
                      readOnly={!isEditing}
                      tabIndex={isEditing ? 0 : -1}
                      aria-label={`Titel ${lang.label}`}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs mb-1"
                      htmlFor={`content-${lang.value}`}
                    >
                      Inhalt
                    </label>
                    <PlateRichTextEditor
                      key={`${lang.value}-${article.id}`}
                      id={`content-${lang.value}`}
                      className="w-full text-sm"
                      value={editedArticleContents[lang.value]?.content || ''}
                      onValueChange={(content: Value) =>
                        handleRichTextChange(lang.value, content)
                      }
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {isEditing && availableLanguages.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={selectedLanguageToAdd} onValueChange={setSelectedLanguageToAdd}>
                <SelectTrigger className="w-48" aria-label="Sprache zum Hinzufügen auswählen">
                  <SelectValue placeholder="Sprache auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLanguage}
                disabled={!selectedLanguageToAdd}
                aria-label="Ausgewählte Sprache hinzufügen"
              >
                <PlusCircle size={14} className="inline-block" /> Sprache hinzufügen
              </Button>
            </div>
          )}
          {!isEditing && currentLanguages.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              Keine Sprachen verfügbar. Wechseln Sie in den Bearbeitungsmodus,
              um Sprachen hinzuzufügen.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="eigenschaften" className="mt-4">
          <ArticleProperties 
            article={article}
            calculationItems={article.calculations}
            isEditing={isEditing} 
            editedAllgemeineData={editedAllgemeineData}
            editedKalkulationData={editedKalkulationData}
            onAllgemeineChange={handleAllgemeineChange}
            onKalkulationChange={handleKalkulationChange}
          />
        </TabsContent>
        
        <TabsContent value="vorschau" className="mt-4">
          {currentLanguages.length > 0 ? (
            <>
              <div className="mb-4 max-w-xs">
                <Label
                  htmlFor="preview-language-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Vorschau Sprache
                </Label>
                <Select
                  value={selectedPreviewLanguage}
                  onValueChange={setSelectedPreviewLanguage}
                  disabled={currentLanguages.length === 0}
                >
                  <SelectTrigger
                    id="preview-language-select"
                    aria-label="Sprache für Vorschau auswählen"
                    className="w-full"
                    tabIndex={0}
                  >
                    <SelectValue placeholder="Sprache wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentLanguages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentPreviewData ? (
                <PreviewContent 
                  title={currentPreviewData.title}
                  content={currentPreviewData.content}
                  hideTitle={article.hideTitle}
                />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Für die ausgewählte Sprache sind keine Inhalte vorhanden oder
                  die Sprache ist ungültig.
                </div>
              )}
            </>
          ) : (
            // Fallback to article properties preview when no content languages
            <div className="p-4 border rounded-md bg-gray-50 min-h-[200px]">
              {!article.hideTitle && (
                <h3 className="text-xl font-semibold mb-2 break-words">
                  Artikel
                </h3>
              )}
              <div className="space-y-4">
                <div>
                  <strong>Artikel Nr.:</strong> {article.number}
                </div>
                <div>
                  <strong>Preis:</strong> € {article.price}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500 mt-6 pt-4 border-t text-right">
        Zuletzt geändert am{' '}
        {article.lastChangedBy ? (
          <>
            {new Date(article.lastChangedBy.timestamp).toLocaleString('de-DE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {' von '}
            {article.lastChangedBy.name || article.lastChangedBy.email}
            {article.lastChangedBy.changeType === 'content' && ' (Inhalt)'}
            {article.lastChangedBy.changeType === 'article' && ' (Eigenschaften)'}
          </>
        ) : (
          new Date(article.updatedAt).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        )}
      </div>
    </div>
  );
};

export default ArticleDetail; 