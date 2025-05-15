import React, { useState, useMemo } from 'react';

export type Block = {
  id: number;
  bezeichnung: string;
  ueberschrift: string;
  aenderung: string;
  vorschau: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (block: Block) => void;
  blocks: Block[];
};

const AddBlockDialog: React.FC<Props> = ({ open, onClose, onAdd, blocks }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(blocks[0]?.id ?? null);

  const filteredBlocks = useMemo(
    () =>
      blocks.filter(
        (b) =>
          b.bezeichnung.toLowerCase().includes(search.toLowerCase()) ||
          b.ueberschrift.toLowerCase().includes(search.toLowerCase())
      ),
    [search, blocks]
  );

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedId) || null,
    [selectedId, blocks]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
      role="dialog"
      aria-modal="true"
      aria-label="Block hinzufügen Dialog"
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
        <h2 className="text-2xl font-semibold mb-4">Block hinzufügen</h2>
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
                <th className="px-3 py-2 font-bold text-left border-b border-gray-300">Bezeichnung</th>
                <th className="px-3 py-2 font-bold text-left border-b border-gray-300">Überschrift</th>
                <th className="px-3 py-2 font-bold text-left border-b border-gray-300">letzte Änderung</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlocks.map((b) => (
                <tr
                  key={b.id}
                  tabIndex={0}
                  aria-label={`Block ${b.bezeichnung} auswählen`}
                  className={
                    (selectedId === b.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-black hover:bg-gray-100') +
                    ' cursor-pointer border-b border-gray-200 focus:outline-none'
                  }
                  onClick={() => setSelectedId(b.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedId(b.id);
                  }}
                >
                  <td className="px-3 py-2">{b.bezeichnung}</td>
                  <td className="px-3 py-2">{b.ueberschrift}</td>
                  <td className="px-3 py-2">{b.aenderung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add Button */}
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center px-4 py-2 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 focus:outline-none"
            onClick={() => selectedBlock && onAdd(selectedBlock)}
            aria-label="Block hinzufügen"
            tabIndex={0}
            disabled={!selectedBlock}
          >
            + Hinzufügen
          </button>
        </div>
        {/* Vorschau */}
        <div className="border border-gray-300 rounded p-4 bg-white">
          <div className="font-bold mb-2">Vorschau</div>
          <div className="relative h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
            {selectedBlock ? (
              <pre className="whitespace-pre-wrap text-sm font-sans">{selectedBlock.vorschau}</pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlockDialog; 