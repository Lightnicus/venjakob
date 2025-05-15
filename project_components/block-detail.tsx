import { FC, useState } from 'react';
import QuillRichTextEditor from './quill-rich-text-editor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BlockDetailProperties from './block-detail-properties';

type BlockDetailProps = {
  data: Record<string, {
    ueberschrift: string;
    beschreibung: string;
    geaendertAm: string;
    autor: string;
  }>;
  languages: { value: string; label: string }[];
};

const BlockDetail: FC<BlockDetailProps> = ({ data, languages }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState('beschreibungen');

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Anschreiben</h2>
      <div className="flex gap-2 mb-4">
        <button
          className="border rounded px-3 py-1 text-sm bg-gray-100"
          tabIndex={0}
          aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
          onClick={() => setIsEditing(e => !e)}
        >
          {isEditing ? 'Abbrechen' : '✏️ Bearbeiten'}
        </button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mb-6 w-full flex flex-col">
        <TabsList className="shrink-0 bg-white p-0 border-b flex flex-wrap gap-2 justify-start rounded-none w-full">
          <TabsTrigger value="beschreibungen" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Beschreibungen</TabsTrigger>
          <TabsTrigger value="eigenschaften" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Eigenschaften</TabsTrigger>
          <TabsTrigger value="vorschau" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">Vorschau</TabsTrigger>
        </TabsList>
        <TabsContent value="beschreibungen">
          {languages.map(lang => (
            <div key={lang.value} className="mb-8 border rounded p-4 bg-gray-50">
              <div className="font-semibold mb-2">{lang.label}</div>
              <div className="mb-2">
                <label className="block text-xs mb-1" htmlFor={`ueberschrift-${lang.value}`}>Überschrift</label>
                <input
                  id={`ueberschrift-${lang.value}`}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={data[lang.value]?.ueberschrift || ''}
                  readOnly={!isEditing}
                  tabIndex={0}
                  aria-label={`Überschrift ${lang.label}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" htmlFor={`beschreibung-${lang.value}`}>Beschreibung</label>
                <QuillRichTextEditor
                  id={`beschreibung-${lang.value}`}
                  className="w-full border rounded text-sm bg-white"
                  defaultValue={data[lang.value]?.beschreibung || ''}
                  readOnly={!isEditing}
                  aria-label={`Beschreibung ${lang.label}`}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Zuletzt geändert am {data[lang.value]?.geaendertAm} von {data[lang.value]?.autor}
              </div>
            </div>
          ))}
          <button className="border rounded px-3 py-1 text-sm mt-2" tabIndex={0} aria-label="Sprache hinzufügen">+ Sprache hinzufügen</button>
        </TabsContent>
        <TabsContent value="eigenschaften">
          <BlockDetailProperties />
        </TabsContent>
        <TabsContent value="vorschau">
          <div className="text-gray-500 text-center py-8">Vorschau-Tab (Platzhalter)</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockDetail; 