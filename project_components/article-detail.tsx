import { FC, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import QuillRichTextEditor, { QuillEditorRef } from './quill-rich-text-editor';
import { Trash2, Edit3, PlusCircle, Save } from 'lucide-react';
import ArticleProperties from './article-properties';
import { Button } from '@/components/ui/button';

interface LocalizedContent {
  ueberschrift: string;
  beschreibung: string;
}

interface Language {
  value: string;
  label: string;
}

type ArticleDetailProps = {
  articleId: string;
  initialData: Record<string, LocalizedContent>;
  availableLanguages: Language[];
  lastChangeInfo: string;
  onSaveChanges?: (updatedData: Record<string, LocalizedContent>) => void;
};

const ArticleDetail: FC<ArticleDetailProps> = ({
  articleId,
  initialData,
  availableLanguages,
  lastChangeInfo,
  onSaveChanges,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('beschreibungen');
  const [editedData, setEditedData] = useState<Record<string, LocalizedContent>>(() => JSON.parse(JSON.stringify(initialData)));
  const [currentLanguages, setCurrentLanguages] = useState<Language[]>(
    () => availableLanguages.filter(lang => initialData[lang.value])
  );
  const [selectedPreviewLanguage, setSelectedPreviewLanguage] = useState(() => currentLanguages[0]?.value || '');

  useEffect(() => {
    setEditedData(JSON.parse(JSON.stringify(initialData)));
    const activeLangs = availableLanguages.filter(lang => initialData[lang.value]);
    setCurrentLanguages(activeLangs);
    if (activeLangs.length > 0) {
        if (!activeLangs.find(l => l.value === selectedPreviewLanguage) || !selectedPreviewLanguage) {
            setSelectedPreviewLanguage(activeLangs[0].value);
        }
    } else {
        setSelectedPreviewLanguage('');
    }
  }, [initialData, availableLanguages]);

  const handleRichTextChange = (langValue: string, content: string) => {
    if (!isEditing) return;
    setEditedData(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { ueberschrift: '', beschreibung: '' }),
        beschreibung: content,
      },
    }));
  };

  const handleInputChange = (langValue: string, field: keyof Omit<LocalizedContent, 'beschreibung'>, value: string) => {
    if (!isEditing) return;
    setEditedData(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { ueberschrift: '', beschreibung: '' }),
        [field]: value,
      },
    }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setEditedData(JSON.parse(JSON.stringify(initialData)));
      const activeLangs = availableLanguages.filter(lang => initialData[lang.value]);
      setCurrentLanguages(activeLangs);
      if (activeLangs.length > 0) {
        setSelectedPreviewLanguage(activeLangs.find(l => l.value === selectedPreviewLanguage) ? selectedPreviewLanguage : activeLangs[0].value);
      } else {
        setSelectedPreviewLanguage('');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    if (onSaveChanges) {
      const dataToSave = currentLanguages.reduce<Record<string, LocalizedContent>>((acc, lang) => {
        if (editedData[lang.value]) {
          acc[lang.value] = editedData[lang.value];
        }
        return acc;
      }, {});
      onSaveChanges(dataToSave);
    }
    setIsEditing(false);
  };

  const handleRemoveLanguage = (langValueToRemove: string) => {
    if (!isEditing) return;
    setEditedData(prev => {
      const { [langValueToRemove]: _, ...remainingData } = prev;
      return remainingData;
    });
    const updatedCurrentLanguages = currentLanguages.filter(lang => lang.value !== langValueToRemove);
    setCurrentLanguages(updatedCurrentLanguages);
    if (selectedPreviewLanguage === langValueToRemove) {
      setSelectedPreviewLanguage(updatedCurrentLanguages[0]?.value || '');
    }
  };

  const handleAddLanguage = () => {
    if (!isEditing) return;
    const nextLang = availableLanguages.find(lang => !currentLanguages.some(cl => cl.value === lang.value));
    if (nextLang) {
      const newCurrentLanguages = [...currentLanguages, nextLang];
      setCurrentLanguages(newCurrentLanguages);
      setEditedData(prev => ({
        ...prev,
        [nextLang.value]: { ueberschrift: '', beschreibung: '' },
      }));
      if (!selectedPreviewLanguage && newCurrentLanguages.length === 1) {
        setSelectedPreviewLanguage(nextLang.value);
      }
    } else {
      alert("Keine weiteren Sprachen verfügbar oder alle Sprachen wurden bereits hinzugefügt.");
    }
  };

  const currentPreviewData = editedData[selectedPreviewLanguage] || initialData[selectedPreviewLanguage];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{articleId}</h2>
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleEdit}
          aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
        >
          {isEditing ? 'Abbrechen' : <><Edit3 size={14} className="inline-block"/> Bearbeiten</>}
        </Button>
        {isEditing && (
          <Button
            size="sm"
            onClick={handleSaveChanges}
            aria-label="Änderungen speichern"
          >
            <Save size={14} className="inline-block"/> Speichern
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 w-full flex flex-col">
        <TabsList className="shrink-0 bg-white p-0 border-b flex flex-wrap gap-0 justify-start rounded-none w-full">
          <TabsTrigger value="beschreibungen" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm" tabIndex={0}>
            Beschreibungen
          </TabsTrigger>
          <TabsTrigger value="eigenschaften" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm" tabIndex={0}>
            Eigenschaften
          </TabsTrigger>
          <TabsTrigger value="vorschau" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm" tabIndex={0}>
            Vorschau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beschreibungen" className="mt-4">
          {currentLanguages.map((lang) => (
            <div key={lang.value} className="mb-8 border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
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
              <div className="space-y-3">
                <div className="mb-2">
                  <Label htmlFor={`ueberschrift-${lang.value}`} className="block text-xs mb-1">Überschrift</Label>
                  <Input
                    id={`ueberschrift-${lang.value}`}
                    value={editedData[lang.value]?.ueberschrift || ''}
                    onChange={(e) => handleInputChange(lang.value, 'ueberschrift', e.target.value)}
                    readOnly={!isEditing}
                    className="w-full border rounded px-2 py-1 text-sm bg-white read-only:bg-gray-100 read-only:cursor-not-allowed shadow-sm"
                    tabIndex={isEditing ? 0 : -1}
                    aria-label={`Überschrift ${lang.label}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`beschreibung-${lang.value}`} className="block text-xs mb-1">Beschreibung</Label>
                  <QuillRichTextEditor
                    id={`beschreibung-${lang.value}`}
                    defaultValue={editedData[lang.value]?.beschreibung || ''}
                    onTextChange={(content) => handleRichTextChange(lang.value, content as unknown as string)} 
                    readOnly={!isEditing}
                    className="w-full border rounded text-sm bg-white read-only:bg-gray-100"
                    aria-label={`Beschreibung ${lang.label}`}
                  />
                </div>
              </div>
            </div>
          ))}
          {isEditing && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleAddLanguage}
              aria-label="Sprache hinzufügen"
            >
              <PlusCircle size={14} className="inline-block"/> Sprache hinzufügen
            </Button>
          )}
          {!isEditing && currentLanguages.length === 0 && (
             <div className="text-gray-500 text-center py-8">
                Für diesen Artikel sind keine Beschreibungen in einer Sprache vorhanden. Wechseln Sie in den Bearbeitungsmodus, um Sprachen hinzuzufügen.
            </div>
          )}
        </TabsContent>

        <TabsContent value="eigenschaften" className="mt-4">
          <ArticleProperties isEditing={isEditing} />
        </TabsContent>

        <TabsContent value="vorschau" className="mt-4">
          {currentLanguages.length > 0 ? (
            <>
              <div className="mb-4 max-w-xs">
                <Label htmlFor="preview-language-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Vorschau Sprache
                </Label>
                <Select value={selectedPreviewLanguage} onValueChange={setSelectedPreviewLanguage} disabled={currentLanguages.length === 0}>
                  <SelectTrigger id="preview-language-select" aria-label="Sprache für Vorschau auswählen" className="w-full" tabIndex={0}>
                    <SelectValue placeholder="Sprache wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentPreviewData ? (
                <div className="p-4 border rounded-md bg-gray-50 min-h-[200px]">
                  <h3 className="text-xl font-semibold mb-2 break-words">
                    {currentPreviewData.ueberschrift || "(Keine Überschrift)"}
                  </h3>
                  <div
                    className="prose max-w-none prose-sm sm:prose-base lg:prose-lg"
                    dangerouslySetInnerHTML={{ __html: currentPreviewData.beschreibung || "<em>(Keine Beschreibung)</em>" }}
                  />
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Für die ausgewählte Sprache sind keine Inhalte vorhanden oder die Sprache ist ungültig.
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Keine Sprachen für die Vorschau verfügbar. Bitte fügen Sie zuerst Beschreibungen in verschiedenen Sprachen hinzu oder wechseln Sie in den Bearbeitungsmodus.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500 mt-6 pt-4 border-t text-right">
        {lastChangeInfo}
      </div>
    </div>
  );
};

export default ArticleDetail; 