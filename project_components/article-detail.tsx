import { FC, useState, useEffect } from 'react';
import { Edit3, Save, Loader2, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import QuillRichTextEditor from '@/project_components/quill-rich-text-editor';
import ArticleProperties from '@/project_components/article-properties';
import { fetchArticleWithCalculations } from '@/lib/api/articles';
import type { ArticleWithCalculations } from '@/lib/db/articles';
import { useTabReload, useTabTitle } from './tabbed-interface-provider';

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
      let initialTitle = articleData.name; // fallback
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

  const handleRichTextChange = (langValue: string, content: string) => {
    if (!isEditing) return;
    setEditedArticleContents(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { title: '', content: '', languageId: '' }),
        content,
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
          updatedAt: new Date()
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
            updatedAt: new Date()
          })),
          updatedAt: new Date()
        }) : null);
      }

      // Save content if handler provided
      if (onSaveContent) {
        const contentToSave = currentLanguages.map(lang => ({
          articleId: article.id,
          blockId: null,
          title: editedArticleContents[lang.value]?.title || '',
          content: editedArticleContents[lang.value]?.content || '',
          languageId: lang.id,
        }));
        await onSaveContent(article.id, contentToSave);
      }

      setIsEditing(false);
      toast.success('Artikel gespeichert');
      
      // Update tab title and header with new title from default language using edited content
      const defaultLanguage = languages.find(lang => (lang as any).default === true);
      let newTitle = article.name; // fallback
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
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleEdit}
          aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
        >
          {isEditing ? (
            'Abbrechen'
          ) : (
            <>
              <Edit3 size={14} className="inline-block" /> Bearbeiten
            </>
          )}
        </Button>
        {isEditing && (
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSaving}
            aria-label="Änderungen speichern"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="inline-block animate-spin mr-1" />
                Speichern...
              </>
            ) : (
              <>
                <Save size={14} className="inline-block mr-1" />
                Speichern
              </>
            )}
          </Button>
        )}
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
                    <QuillRichTextEditor
                      key={`${lang.value}-${article.id}`}
                      id={`content-${lang.value}`}
                      className="w-full border rounded text-sm bg-white read-only:bg-gray-100"
                      defaultValue={editedArticleContents[lang.value]?.content || ''}
                      onTextChange={content =>
                        handleRichTextChange(lang.value, content as unknown as string)
                      }
                      readOnly={!isEditing}
                      aria-label={`Inhalt ${lang.label}`}
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
                <div className="p-4 border rounded-md bg-gray-50 min-h-[200px]">
                  {!article.hideTitle && (
                    <h3 className="text-xl font-semibold mb-2 break-words">
                      {currentPreviewData.title || article.name}
                    </h3>
                  )}
                  <div
                    className="prose max-w-none prose-sm sm:prose-base lg:prose-lg"
                    dangerouslySetInnerHTML={{
                      __html: currentPreviewData.content || '<em>(Kein Inhalt)</em>',
                    }}
                  />
                </div>
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
                  {article.name}
                </h3>
              )}
              <div className="space-y-4">
                <div>
                  <strong>Artikel Nr.:</strong> {article.number}
                </div>
                <div>
                  <strong>Preis:</strong> € {article.price}
                </div>
                {article.description && (
                  <div>
                    <strong>Beschreibung:</strong>
                    <p className="mt-1">{article.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500 mt-6 pt-4 border-t text-right">
        Zuletzt geändert am {new Date(article.updatedAt).toLocaleDateString('de-DE')}
      </div>
    </div>
  );
};

export default ArticleDetail; 