import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { FC, useState } from 'react';
import languages from '@/data/languages.json';

interface ChooseOfferLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbbrechen?: () => void;
  onZurueck?: () => void;
  onErstellen?: () => void;
}

type Language = {
  value: string;
  label: string;
};

const ChooseOfferLanguageDialog: FC<ChooseOfferLanguageDialogProps> = ({ open, onOpenChange, onAbbrechen, onZurueck, onErstellen }) => {
  const [language, setLanguage] = useState(languages[0]?.value || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Sprache für Angebot wählen">
        <DialogHeader>
          <DialogTitle>Sprache für Angebot</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-base flex flex-col gap-4">
          <span>In welcher Sprache soll das Angebot erstellt werden?</span>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-64" aria-label="Sprache wählen">
              {languages.find(l => l.value === language)?.label || ''}
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang: Language) => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button type="button" variant="outline" aria-label="Abbrechen" onClick={onAbbrechen || (() => onOpenChange(false))}>
              Abbrechen
            </Button>
            <Button type="button" variant="outline" aria-label="Zurück" onClick={onZurueck || (() => onOpenChange(false))}>
              Zurück
            </Button>
            <Button type="button" aria-label="Erstellen" onClick={onErstellen || (() => onOpenChange(false))}>
              Erstellen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseOfferLanguageDialog; 