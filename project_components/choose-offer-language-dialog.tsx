import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from '@/project_components/dialog-manager';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import OfferDetail from '@/project_components/offer-detail';

type Language = {
  value: string;
  label: string;
};

const languages: Language[] = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'Englisch' },
  { value: 'fr', label: 'Französisch' },
];

type ChooseOfferLanguageDialogProps = {
  onErstellen?: () => void;
};

const ChooseOfferLanguageDialog: FC<ChooseOfferLanguageDialogProps> = ({ onErstellen }) => {
  const [language, setLanguage] = useState(languages[0]?.value || '');
  const { openNewTab } = useTabbedInterface();
  const { closeDialog } = useDialogManager();

  const handleErstellen = () => {
    // Call the original onErstellen callback if provided
    if (onErstellen) {
      onErstellen();
    }
    
    // Get the selected language label
    const selectedLanguage = languages.find(l => l.value === language);
    const languageLabel = selectedLanguage?.label || 'Deutsch';
    
    // Open a new tab with OfferDetail
    const tabId = `offer-${Date.now()}`;
    openNewTab({
      id: tabId,
      title: `Neues Angebot (${languageLabel})`,
      content: <OfferDetail 
        title={`Neues Angebot in ${languageLabel}`} 
        language={languageLabel} 
      />,
      closable: true
    });
    
    // Close the dialog
    closeDialog();
  };

  const footer = (
    <Button 
      type="button" 
      aria-label="Erstellen" 
      onClick={handleErstellen}
    >
      Erstellen
    </Button>
  );

  return (
    <ManagedDialog
      title="Sprache für Angebot"
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
    >
      <div className="flex flex-col gap-4">
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
    </ManagedDialog>
  );
};

export default ChooseOfferLanguageDialog; 