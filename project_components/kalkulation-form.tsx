import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const defaultValues = {
  material: 5200,
  projektierung: 2,
  mKonstruktion: 10,
  eKonstruktion: 6,
  automatisierung: 18,
  eFertigung: 8,
  vorfertigung: 16,
  montage: 16,
  bemerkung: '',
};

const standardwerte = {
  material: '5200 €',
  projektierung: '10 h',
  mKonstruktion: '2 h',
  eKonstruktion: '6 h',
  automatisierung: '18 h',
  eFertigung: '8 h',
  vorfertigung: '16 h',
  montage: '16 h',
};

type KalkulationState = typeof defaultValues;

const labels = [
  { key: 'material', label: 'Material EK (€)' },
  { key: 'projektierung', label: 'Projektierung (h)' },
  { key: 'mKonstruktion', label: 'm. Konstruktion (h)' },
  { key: 'eKonstruktion', label: 'e. Konstruktion (h)' },
  { key: 'automatisierung', label: 'Automatisierung (h)' },
  { key: 'eFertigung', label: 'e. Fertigung (h)' },
  { key: 'vorfertigung', label: 'Vorfertigung (h)' },
  { key: 'montage', label: 'Montage (h)' },
];

const KalkulationForm = () => {
  const [values, setValues] = useState<KalkulationState>(defaultValues);

  const handleChange =
    (key: keyof KalkulationState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues(v => ({
        ...v,
        [key]: key === 'bemerkung' ? e.target.value : Number(e.target.value),
      }));
    };

  const handleReset = () => setValues(defaultValues);

  return (
    <form className="w-full max-w-5xl border rounded p-6 bg-white mx-auto mt-4">
      <div className="text-2xl font-bold mb-6">TB-10-11100</div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: Labels, Inputs & Standardwerte */}
        <div className="space-y-0">
          {labels.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-[minmax(200px,auto)_120px] gap-4 items-center mb-4">
              <label
                className="flex flex-col gap-1 text-sm font-medium"
                htmlFor={key}
              >
                {label}
                <Input
                  id={key}
                  type="number"
                  value={values[key as keyof KalkulationState] as number}
                  onChange={handleChange(key as keyof KalkulationState)}
                  className="w-full"
                  aria-label={label}
                  tabIndex={0}
                  min={0}
                />
              </label>
              <div className="text-left text-sm text-gray-700 pt-6">
                {standardwerte[key as keyof typeof standardwerte]}
              </div>
            </div>
          ))}
        </div>
        {/* Right: Bemerkung */}
        <div className="flex flex-col gap-2 h-full">
          <label htmlFor="bemerkung" className="text-sm font-medium">
            Bemerkung
          </label>
          <Textarea
            id="bemerkung"
            value={values.bemerkung}
            onChange={handleChange('bemerkung')}
            className="min-h-[180px] resize-y h-full"
            aria-label="Bemerkung"
            tabIndex={0}
          />
        </div>
      </div>
      <div className="mt-8 flex">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          aria-label="Kalkulationsdaten zurücksetzen"
          tabIndex={0}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Kalkulationsdaten zurücksetzen
        </Button>
      </div>
    </form>
  );
};

export default KalkulationForm;
