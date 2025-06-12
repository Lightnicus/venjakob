"use client";

import { FC, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { ArticleWithCalculations } from '@/lib/db/articles';
import type { ArticleCalculationItem } from '@/lib/db/schema';

// Define types for the data structures
interface AllgemeineData {
  name: string;
  nr: string;
  einzelpreis: string;
  ueberschriftNichtDrucken: boolean;
}

interface ArticlePropertiesProps {
  article: ArticleWithCalculations;
  calculationItems: ArticleCalculationItem[];
  isEditing: boolean;
  onDataChange?: (data: { allgemeine: AllgemeineData; kalkulation: Record<string, string> }) => void;
}

const ArticleProperties: FC<ArticlePropertiesProps> = ({
  article,
  calculationItems,
  isEditing,
  onDataChange,
}) => {
  const [allgemeineData, setAllgemeineData] = useState<AllgemeineData>(() => ({
    name: article.name || '',
    nr: article.number || '',
    einzelpreis: article.price || '0.00',
    ueberschriftNichtDrucken: article.hideTitle || false,
  }));

  // Initialize kalkulation data from calculationItems
  const [kalkulationData, setKalkulationData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    calculationItems.forEach(item => {
      initial[item.id] = item.value || '0';
    });
    return initial;
  });

  // Effect to reset data when article changes or when cancelling edit
  useEffect(() => {
    setAllgemeineData({
      name: article.name || '',
      nr: article.number || '',
      einzelpreis: article.price || '0.00',
      ueberschriftNichtDrucken: article.hideTitle || false,
    });
    
    // Reset kalkulation data to original values
    const resetKalkulation: Record<string, string> = {};
    calculationItems.forEach(item => {
      resetKalkulation[item.id] = item.value || '0';
    });
    setKalkulationData(resetKalkulation);
  }, [article, calculationItems, isEditing]);

  // Effect to notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ allgemeine: allgemeineData, kalkulation: kalkulationData });
    }
  }, [allgemeineData, kalkulationData]);

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

  const handleKalkulationInputChange = (itemId: string, value: string) => {
    if (!isEditing) return;
    // Basic validation: allow only numbers and decimal points for numeric fields
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setKalkulationData(prev => ({ ...prev, [itemId]: value }));
    }
  };

  const getInputStyles = (isEditable: boolean) => 
    isEditable 
      ? "bg-white border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      : "bg-gray-100 border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 cursor-not-allowed";

  const labelStyles = "text-sm font-medium text-gray-700 md:col-span-1";
  const gridRowStyles = "grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 items-center";

  // Sort calculation items by order (if available) or by name
  const sortedCalculationItems = [...calculationItems].sort((a, b) => {
    if (a.order !== null && b.order !== null) {
      return a.order - b.order;
    }
    if (a.order !== null && b.order === null) return -1;
    if (a.order === null && b.order !== null) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-10 p-1">
      {/* Allgemein Section */}
      <div className="border border-gray-300 rounded-md relative pt-8 pb-6 px-6">
        <h3 className="absolute -top-3 left-4 text-lg font-semibold text-gray-700 bg-white px-2">
          Allgemein
        </h3>
        <div className="space-y-4">
            <div className={gridRowStyles}>
              <Label htmlFor="name" className={labelStyles}>
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={allgemeineData.name}
                readOnly={!isEditing}
                onChange={(e) => handleAllgemeineInputChange('name', e.target.value)}
                className={`${getInputStyles(isEditing)} md:col-span-2`}
                aria-label="Artikelname"
              />
            </div>

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
          {sortedCalculationItems.length > 0 ? (
            sortedCalculationItems.map((item) => (
              <div className={gridRowStyles} key={item.id}>
                <Label htmlFor={item.id} className={labelStyles}>
                  {item.name} {item.type === 'time' ? '(h)' : '(€)'}
                </Label>
                <Input
                  id={item.id}
                  type="text"
                  value={kalkulationData[item.id] || ''}
                  readOnly={!isEditing}
                  onChange={(e) => handleKalkulationInputChange(item.id, e.target.value)}
                  className={`${getInputStyles(isEditing)} md:col-span-2`}
                  aria-label={`${item.name} ${item.type === 'time' ? 'in Stunden' : 'in Euro'}`}
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                />
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              Keine Kalkulationsposten verfügbar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleProperties; 