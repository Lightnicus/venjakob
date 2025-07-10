import { FC, useState, useEffect, useRef } from 'react';
import QuillRichTextEditor from './quill-rich-text-editor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BlockDetailProperties, {
  BlockDetailPropertiesRef,
} from './block-detail-properties';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Edit3, Save, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Block, BlockContent, Language } from '@/lib/db/schema';
import { fetchBlockWithContent } from '@/lib/api/blocks';
import { useTabReload, useTabTitle } from './tabbed-interface-provider';
import EditLockButton from './edit-lock-button';

type BlockWithContent = Block & {
  blockContents: BlockContent[];
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
    changeType: 'block' | 'content';
  } | null;
};

type BlockDetailProps = {
  blockId: string;
  languages: Language[];
  onSaveChanges?: (
    blockId: string,
    blockContents: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[],
  ) => Promise<void>;
  onSaveBlockProperties?: (
    blockId: string,
    blockData: Partial<Block>,
  ) => Promise<void>;
};

const BlockDetail: FC<BlockDetailProps> = ({
  blockId,
  languages,
  onSaveChanges,
  onSaveBlockProperties,
}) => {
  const [block, setBlock] = useState<BlockWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('beschreibungen');
  const propertiesRef = useRef<BlockDetailPropertiesRef>(null);

  // Add state for block properties
  const [editedBlockProperties, setEditedBlockProperties] = useState<
    Partial<Block>
  >({});

  const [editedBlockContents, setEditedBlockContents] = useState<
    Record<
      string,
      {
        title: string;
        content: string;
        languageId: string;
      }
    >
  >({});

  const [currentLanguages, setCurrentLanguages] = useState<Language[]>([]);

  const [selectedPreviewLanguage, setSelectedPreviewLanguage] = useState('');
  const [selectedLanguageToAdd, setSelectedLanguageToAdd] = useState('');

  // Set up reload functionality - no callback needed as this component loads its own data
  const { triggerReload } = useTabReload('blocks', () => {});

  // Set up tab title functionality
  const { updateTitle } = useTabTitle(`block-detail-${blockId}`);

  // Load block data
  const loadBlockData = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Fetch block data using the existing API function
      const blockData = await fetchBlockWithContent(blockId);
      // console.log('Block in block detail', blockData);

      if (!blockData) {
        throw new Error('Block not found');
      }

      setBlock(blockData);

      // Initialize block properties state
      setEditedBlockProperties({
        name: blockData.name,
        standard: blockData.standard,
        mandatory: blockData.mandatory,
        position: blockData.position,
        hideTitle: blockData.hideTitle,
        pageBreakAbove: blockData.pageBreakAbove,
      });

      // Initialize content state
      const initial: Record<
        string,
        { title: string; content: string; languageId: string }
      > = {};
      blockData.blockContents.forEach((bc: BlockContent) => {
        const lang = languages.find(l => l.id === bc.languageId);
        if (lang) {
          initial[lang.value] = {
            title: bc.title,
            content: bc.content,
            languageId: bc.languageId,
          };
        }
      });
      setEditedBlockContents(initial);

      const activeLangs = languages.filter(lang =>
        blockData.blockContents.some(
          (bc: BlockContent) => bc.languageId === lang.id,
        ),
      );
      setCurrentLanguages(activeLangs);

      if (activeLangs.length > 0) {
        setSelectedPreviewLanguage(activeLangs[0].value);
      } else {
        setSelectedPreviewLanguage('');
      }

      setSelectedLanguageToAdd('');
    } catch (error) {
      console.error('Error loading block:', error);
      setLoadError('Fehler beim Laden des Blocks');
    } finally {
      setIsLoading(false);
    }
  };

  // Load block data when blockId changes
  useEffect(() => {
    if (blockId) {
      loadBlockData();
    }
  }, [blockId]);

  const handleRichTextChange = (langValue: string, content: string) => {
    if (!isEditing) return;
    setEditedBlockContents(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { title: '', content: '', languageId: '' }),
        content,
      },
    }));
  };

  const handleInputChange = (
    langValue: string,
    field: 'title',
    value: string,
  ) => {
    if (!isEditing) return;
    setEditedBlockContents(prev => ({
      ...prev,
      [langValue]: {
        ...(prev[langValue] || { title: '', content: '', languageId: '' }),
        [field]: value,
      },
    }));
  };

  // Add handler for block property changes
  const handleBlockPropertyChange = (
    field: keyof typeof editedBlockProperties,
    value: string | number | boolean,
  ) => {
    if (!isEditing) return;
    setEditedBlockProperties(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleEdit = () => {
    if (isEditing && block) {
      // Reset to original data
      setEditedBlockProperties({
        name: block.name,
        standard: block.standard,
        mandatory: block.mandatory,
        position: block.position,
        hideTitle: block.hideTitle,
        pageBreakAbove: block.pageBreakAbove,
      });

      const initial: Record<
        string,
        { title: string; content: string; languageId: string }
      > = {};
      block.blockContents.forEach(bc => {
        const lang = languages.find(l => l.id === bc.languageId);
        if (lang) {
          initial[lang.value] = {
            title: bc.title,
            content: bc.content,
            languageId: bc.languageId,
          };
        }
      });
      setEditedBlockContents(initial);

      const activeLangs = languages.filter(lang =>
        block.blockContents.some(bc => bc.languageId === lang.id),
      );
      setCurrentLanguages(activeLangs);

      if (activeLangs.length > 0) {
        setSelectedPreviewLanguage(
          activeLangs.find(l => l.value === selectedPreviewLanguage)
            ? selectedPreviewLanguage
            : activeLangs[0].value,
        );
      } else {
        setSelectedPreviewLanguage('');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (isSaving || !block) return; // Prevent multiple saves

    setIsSaving(true);
    try {
      // Save content
      if (onSaveChanges) {
        const blockContentsToSave = currentLanguages.map(lang => ({
          blockId: block.id,
          articleId: null,
          title: editedBlockContents[lang.value]?.title || '',
          content: editedBlockContents[lang.value]?.content || '',
          languageId: lang.id,
        }));
        await onSaveChanges(block.id, blockContentsToSave);
      }

      // Save properties - use local state instead of ref
      if (onSaveBlockProperties) {
        await onSaveBlockProperties(block.id, editedBlockProperties);
      }

      setIsEditing(false);
      toast.success('Block gespeichert');

      // Update tab title if block name changed
      if (
        editedBlockProperties.name &&
        editedBlockProperties.name !== block.name
      ) {
        updateTitle(`Block: ${editedBlockProperties.name}`);
      }

      // Trigger reload for other tabs (like BlockManagement)
      triggerReload();
    } catch (error) {
      console.error('Error saving block:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLanguage = (langValueToRemove: string) => {
    if (!isEditing) return;
    setEditedBlockContents(prev => {
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
    const langToAdd = languages.find(
      lang => lang.value === selectedLanguageToAdd,
    );

    if (
      langToAdd &&
      !currentLanguages.some(cl => cl.value === langToAdd.value)
    ) {
      const newCurrentLanguages = [...currentLanguages, langToAdd];
      setCurrentLanguages(newCurrentLanguages);
      setEditedBlockContents(prev => ({
        ...prev,
        [langToAdd.value]: { title: '', content: '', languageId: langToAdd.id },
      }));
      if (!selectedPreviewLanguage && newCurrentLanguages.length === 1) {
        setSelectedPreviewLanguage(langToAdd.value);
      }
      // Reset the dropdown selection
      setSelectedLanguageToAdd('');
    } else {
      toast.error(
        'Die ausgewählte Sprache ist bereits hinzugefügt oder ungültig.',
      );
    }
  };

  // Get available languages for the dropdown
  const availableLanguages = languages.filter(
    lang => !currentLanguages.some(cl => cl.value === lang.value),
  );

  const currentPreviewData = editedBlockContents[selectedPreviewLanguage];
  const getOriginalBlockContent = (langValue: string) => {
    if (!block) return null;
    const lang = languages.find(l => l.value === langValue);
    return lang
      ? block.blockContents.find(bc => bc.languageId === lang.id)
      : null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin mr-2" />
          <span>Block wird geladen...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !block) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">
            {loadError || 'Block nicht gefunden'}
          </div>
          <Button onClick={loadBlockData} variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{block.name}</h2>
      <div className="mb-4">
        <EditLockButton
          resourceType="blocks"
          resourceId={blockId}
          isEditing={isEditing}
          isSaving={isSaving}
          onToggleEdit={handleToggleEdit}
          onSave={handleSaveChanges}
          onRefreshData={loadBlockData}
          initialUpdatedAt={block?.updatedAt}
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
          {currentLanguages.map(lang => {
            const originalContent = getOriginalBlockContent(lang.value);
            return (
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
                        value={editedBlockContents[lang.value]?.title || ''}
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
                      {(() => {
                        const contentValue =
                          editedBlockContents[lang.value]?.content || '';
                        return (
                          <QuillRichTextEditor
                            key={`${lang.value}-${block.id}`}
                            id={`content-${lang.value}`}
                            className="w-full border rounded text-sm bg-white read-only:bg-gray-100"
                            defaultValue={contentValue}
                            onTextChange={content =>
                              handleRichTextChange(
                                lang.value,
                                content as unknown as string,
                              )
                            }
                            readOnly={!isEditing}
                            aria-label={`Inhalt ${lang.label}`}
                          />
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {isEditing && availableLanguages.length > 0 && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedLanguageToAdd}
                onValueChange={setSelectedLanguageToAdd}
              >
                <SelectTrigger
                  className="w-48"
                  aria-label="Sprache zum Hinzufügen auswählen"
                >
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
                <PlusCircle size={14} className="inline-block" /> Sprache
                hinzufügen
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
          <BlockDetailProperties
            block={block}
            onSave={onSaveBlockProperties}
            isEditing={isEditing}
            editedProperties={editedBlockProperties}
            onPropertyChange={handleBlockPropertyChange}
            ref={propertiesRef}
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
                  {!block.hideTitle && (
                    <h3 className="text-xl font-semibold mb-2 break-words">
                      {currentPreviewData.title || '(Kein Titel)'}
                    </h3>
                  )}
                  <div
                    className="prose max-w-none prose-sm sm:prose-base lg:prose-lg"
                    dangerouslySetInnerHTML={{
                      __html:
                        currentPreviewData.content || '<em>(Kein Inhalt)</em>',
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
            <div className="text-gray-500 text-center py-8">
              Keine Sprachen für die Vorschau verfügbar. Bitte fügen Sie zuerst
              Beschreibungen in verschiedenen Sprachen hinzu oder wechseln Sie
              in den Bearbeitungsmodus.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500 mt-6 pt-4 border-t text-right">
        Zuletzt geändert am{' '}
        {block.lastChangedBy ? (
          <>
            {new Date(block.lastChangedBy.timestamp).toLocaleString('de-DE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' von '}
            {block.lastChangedBy.name || block.lastChangedBy.email}
            {block.lastChangedBy.changeType === 'content' && ' (Inhalt)'}
            {block.lastChangedBy.changeType === 'block' && ' (Eigenschaften)'}
          </>
        ) : (
          new Date(block.updatedAt).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        )}
      </div>
    </div>
  );
};

export default BlockDetail;
