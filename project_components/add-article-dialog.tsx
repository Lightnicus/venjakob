import React, { useState, useMemo } from 'react';

export type Article = {
  id: number;
  nummer: string;
  ueberschrift: string;
  aenderung: string;
  vorschau: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (article: Article) => void;
  articles: Article[];
};

const AddArticleDialog: React.FC<Props> = ({ open, onClose, onAdd, articles }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(articles[0]?.id ?? null);

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        (a) =>
          a.nummer.toLowerCase().includes(search.toLowerCase()) ||
          a.ueberschrift.toLowerCase().includes(search.toLowerCase())
      ),
    [search, articles]
  );

  const selectedArticle = useMemo(
    () => articles.find((a) => a.id === selectedId) || null,
    [selectedId, articles]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
      role="dialog"
      aria-modal="true"
      aria-label="Artikel hinzufügen Dialog"
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Schließen"
          tabIndex={0}
          className="cursor-pointer absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
        >
          ×
        </button>
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4">Artikel hinzufügen</h2>
        {/* Search */}
        <div className="flex items-center mb-2">
          <span className="material-icons text-gray-400 mr-2">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search"
            aria-label="Suche"
            tabIndex={0}
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring"
          />
        </div>
        {/* Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 font-bold text-left border-b border-gray-300">Nr.</th>
                <th className="px-3 py-2 font-bold text-left border-b border-gray-300">Überschrift</th>
                <th className="px-3 py-2 font-bold text-left border-b border-gray-300">letzte Änderung</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((a) => (
                <tr
                  key={a.id}
                  tabIndex={0}
                  aria-label={`Artikel ${a.nummer} auswählen`}
                  className={
                    (selectedId === a.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-black hover:bg-gray-100') +
                    ' cursor-pointer border-b border-gray-200 focus:outline-none'
                  }
                  onClick={() => setSelectedId(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedId(a.id);
                  }}
                >
                  <td className="px-3 py-2 underline text-blue-700">{a.nummer}</td>
                  <td className="px-3 py-2">{a.ueberschrift}</td>
                  <td className="px-3 py-2">{a.aenderung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add Button */}
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center px-4 py-2 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 focus:outline-none"
            onClick={() => selectedArticle && onAdd(selectedArticle)}
            aria-label="Artikel hinzufügen"
            tabIndex={0}
            disabled={!selectedArticle}
          >
            + Hinzufügen
          </button>
        </div>
        {/* Vorschau */}
        <div className="border border-gray-300 rounded p-4 bg-white">
          <div className="font-bold mb-2">Vorschau</div>
          <div className="relative h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 mb-2">
            {selectedArticle ? (
              <pre className="whitespace-pre-wrap text-sm font-sans">{selectedArticle.vorschau}</pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddArticleDialog; 