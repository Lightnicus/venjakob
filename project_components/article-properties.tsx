"use client";

import { FC, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Define types for the data structures
interface AllgemeineData {
  nr: string;
  einzelpreis: string;
  ueberschriftNichtDrucken: boolean;
}

interface KalkulationData {
  materialEK: string; // Use string to allow empty input, parse to number on save/submit
  projektierung: string;
  mKonstruktion: string;
  eKonstruktion: string;
  automatisierung: string;
  eFertigung: string;
  vorfertigung: string;
  montage: string;
}

interface ArticlePropertiesProps {
  isEditing: boolean;
  // In a real scenario, you'd pass initial data and handlers
  // initialAllgemeineData?: AllgemeineData;
  // initialKalkulationData?: KalkulationData;
  // onDataChange?: (data: { allgemeine: AllgemeineData; kalkulation: KalkulationData }) => void;
}

// Default data (can be replaced by props later)
const defaultAllgemeineData: AllgemeineData = {
  nr: 'TB-20-11100',
  einzelpreis: '5.000 €',
  ueberschriftNichtDrucken: false,
};

const defaultKalkulationData: KalkulationData = {
  materialEK: '5200',
  projektierung: '10',
  mKonstruktion: '2',
  eKonstruktion: '6',
  automatisierung: '18',
  eFertigung: '8',
  vorfertigung: '16',
  montage: '16',
};

const ArticleProperties: FC<ArticlePropertiesProps> = ({
  isEditing,
  // initialAllgemeineData = defaultAllgemeineData, // Example of using props
  // initialKalkulationData = defaultKalkulationData, // Example of using props
}) => {
  const [allgemeineData, setAllgemeineData] = useState<AllgemeineData>(defaultAllgemeineData);
  const [kalkulationData, setKalkulationData] = useState<KalkulationData>(defaultKalkulationData);

  // Effect to reset data if isEditing changes (e.g., when cancelling an edit)
  // This is a simple reset; a more robust solution might involve a data fetching/caching strategy.
  useEffect(() => {
    if (!isEditing) {
      setAllgemeineData(defaultAllgemeineData);
      setKalkulationData(defaultKalkulationData);
    }
    // Add dependencies for initialAllgemeineData, initialKalkulationData if they are used from props
  }, [isEditing]);


  const handleAllgemeineInputChange = (field: keyof Omit<AllgemeineData, 'ueberschriftNichtDrucken'>, value: string) => {
    if (!isEditing) return;
    setAllgemeineData(prev => ({ ...prev, [field]: value }));
  };

  const handleUeberschriftNichtDruckenChange = (checked: boolean | 'indeterminate') => {
    if (!isEditing) return;
    // The Checkbox component from shadcn might return 'indeterminate' or boolean.
    // We are expecting boolean here.
    if (typeof checked === 'boolean') {
      setAllgemeineData(prev => ({ ...prev, ueberschriftNichtDrucken: checked }));
    }
  };
  
  const handleKalkulationInputChange = (field: keyof KalkulationData, value: string) => {
    if (!isEditing) return;
    // Basic validation: allow only numbers or empty string for numeric fields
    if (/^\d*$/.test(value) || value === '') {
      setKalkulationData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getInputStyles = (isEditable: boolean) => 
    isEditable 
      ? "bg-white border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      : "bg-gray-100 border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 cursor-not-allowed";

  const labelStyles = "text-sm font-medium text-gray-700 md:col-span-1";
  const gridRowStyles = "grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 items-center";

  return (
    <div className="space-y-10 p-1">
      {/* Allgemein Section */}
      <div className="border border-gray-300 rounded-md relative pt-8 pb-6 px-6">
        <h3 className="absolute -top-3 left-4 text-lg font-semibold text-gray-700 bg-white px-2">
          Allgemein
        </h3>
        <div className="space-y-4">
            <div className={gridRowStyles}>
              <Label htmlFor="nr" className={labelStyles}>
                Nr.
              </Label>
              <Input
                id="nr"
                type="text"
                value={allgemeineData.nr}
                readOnly={!isEditing}
                onChange={(e) => handleAllgemeineInputChange('nr', e.target.value)}
                className={`${getInputStyles(isEditing)} md:col-span-2`}
                aria-label="Artikelnummer"
              />
            </div>

            <div className={gridRowStyles}>
              <Label htmlFor="einzelpreis" className={labelStyles}>
                Einzelpreis
              </Label>
              <Input
                id="einzelpreis"
                type="text"
                value={allgemeineData.einzelpreis}
                readOnly={!isEditing}
                onChange={(e) => handleAllgemeineInputChange('einzelpreis', e.target.value)}
                className={`${getInputStyles(isEditing)} md:col-span-2`}
                aria-label="Einzelpreis"
              />
            </div>

            <div className={gridRowStyles}>
              <Label htmlFor="ueberschriftNichtDrucken" className={`${labelStyles} self-center`}>
                Überschrift nicht drucken
              </Label>
              <div className="md:col-span-2 flex items-center pt-1">
                <Checkbox
                  id="ueberschriftNichtDrucken"
                  checked={allgemeineData.ueberschriftNichtDrucken}
                  disabled={!isEditing}
                  onCheckedChange={handleUeberschriftNichtDruckenChange}
                  className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-labelledby="ueberschriftNichtDruckenLabel"
                />
                 <span id="ueberschriftNichtDruckenLabel" className="sr-only">Überschrift nicht drucken</span>
              </div>
            </div>
        </div>
      </div>

      {/* Kalkulation Section */}
      <div className="border border-gray-300 rounded-md relative pt-8 pb-6 px-6">
        <h3 className="absolute -top-3 left-4 text-lg font-semibold text-gray-700 bg-white px-2">
          Kalkulation
        </h3>
        <div className="space-y-4">
            {(Object.keys(kalkulationData) as Array<keyof KalkulationData>).map((key) => {
              let labelText = '';
              let ariaLabelText = '';
              switch (key) {
                case 'materialEK': labelText = 'Material EK (€)'; ariaLabelText = 'Material Einkaufspreis in Euro'; break;
                case 'projektierung': labelText = 'Projektierung (h)'; ariaLabelText = 'Projektierungsstunden'; break;
                case 'mKonstruktion': labelText = 'm. Konstruktion (h)'; ariaLabelText = 'Mechanische Konstruktionsstunden'; break;
                case 'eKonstruktion': labelText = 'e. Konstruktion (h)'; ariaLabelText = 'Elektrische Konstruktionsstunden'; break;
                case 'automatisierung': labelText = 'Automatisierung (h)'; ariaLabelText = 'Automatisierungsstunden'; break;
                case 'eFertigung': labelText = 'e. Fertigung (h)'; ariaLabelText = 'Elektrische Fertigungsstunden'; break;
                case 'vorfertigung': labelText = 'Vorfertigung (h)'; ariaLabelText = 'Vorfertigungsstunden'; break;
                case 'montage': labelText = 'Montage (h)'; ariaLabelText = 'Montagestunden'; break;
              }
              return (
                <div className={gridRowStyles} key={key}>
                  <Label htmlFor={key} className={labelStyles}>
                    {labelText}
                  </Label>
                  <Input
                    id={key}
                    type="text" // Use text to allow empty string, manage as number with handleKalkulationInputChange
                    value={kalkulationData[key]}
                    readOnly={!isEditing}
                    onChange={(e) => handleKalkulationInputChange(key, e.target.value)}
                    className={`${getInputStyles(isEditing)} md:col-span-2`}
                    aria-label={ariaLabelText}
                    inputMode="numeric" // Hint for mobile keyboards
                    pattern="[0-9]*"    // Basic pattern for numbers
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ArticleProperties; 