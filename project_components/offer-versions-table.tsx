import React from 'react';

type Version = {
  version: string;
  erstelltAm: string;
  geaendertVon: string;
  betrag: string;
};

const versionen: Version[] = [
  { version: '1.0', erstelltAm: '13.10.2023', geaendertVon: 'Max Mustermann', betrag: '20.000 €' },
  { version: '2.0', erstelltAm: '01.11.2023', geaendertVon: 'Max Mustermann', betrag: '25.000 €' },
];

const icons = [
  {
    label: 'Kopieren',
    svg: (
      <svg width="18" height="18" fill="none" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="2.5" y="2.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity=".5"/></svg>
    ),
  },
  {
    label: 'Ansehen',
    svg: (
      <svg width="18" height="18" fill="none" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 5C5 5 2 10 2 10s3 5 8 5 8-5 8-5-3-5-8-5Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
  },
  {
    label: 'PDF herunterladen',
    svg: (
      <svg width="18" height="18" fill="none" viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><text x="10" y="14" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="Arial">PDF</text></svg>
    ),
  },
];

const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, onClick: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
};

const OfferVersionsTable: React.FC = () => (
  <div className="w-full overflow-x-auto">
    <table className="min-w-full border border-gray-300 text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-3 py-2 text-left font-semibold">Version</th>
          <th className="px-3 py-2 text-left font-semibold">erstellt am</th>
          <th className="px-3 py-2 text-left font-semibold">geändert von</th>
          <th className="px-3 py-2 text-right font-semibold">Betrag</th>
          <th className="px-3 py-2 text-center font-semibold">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {versionen.map((v, i) => (
          <tr key={v.version} className={i % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
            <td className="px-3 py-2">{v.version}</td>
            <td className="px-3 py-2">{v.erstelltAm}</td>
            <td className="px-3 py-2">{v.geaendertVon}</td>
            <td className="px-3 py-2 text-right">{v.betrag}</td>
            <td className="px-3 py-2 text-center">
              <div className="flex items-center gap-2 justify-center">
                {icons.map((icon, idx) => (
                  <button
                    key={icon.label}
                    className="p-1 rounded hover:bg-gray-300 focus:bg-gray-300 focus:outline-none"
                    tabIndex={0}
                    aria-label={icon.label}
                    onClick={() => {}}
                    onKeyDown={e => handleKeyDown(e, () => {})}
                    type="button"
                  >
                    {icon.svg}
                  </button>
                ))}
              </div>
            </td>
          </tr>
        ))}
        {/* Leere Zeilen für das Layout wie im Screenshot */}
        <tr className="bg-white h-8"><td colSpan={5}></td></tr>
        <tr className="bg-gray-100 h-8"><td colSpan={5}></td></tr>
      </tbody>
    </table>
  </div>
);

export default OfferVersionsTable; 