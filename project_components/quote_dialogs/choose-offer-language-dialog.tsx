import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from './dialog-manager';
import { fetchLanguages } from '@/lib/api/blocks';
import type { Language } from '@/lib/db/schema';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type ChooseOfferLanguageDialogProps = {
  onErstellen?: (languageId: string) => void;
};

const ChooseOfferLanguageDialog: FC<ChooseOfferLanguageDialogProps> = ({ onErstellen }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const { closeDialog } = useDialogManager();

  // Load languages from database
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoading(true);
        const languagesData = await fetchLanguages();
        setLanguages(languagesData);
        
        // Set default language if available
        const defaultLanguage = languagesData.find(l => l.default);
        if (defaultLanguage) {
          setLanguage(defaultLanguage.value);
        } else if (languagesData.length > 0) {
          setLanguage(languagesData[0].value);
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        toast.error('Fehler beim Laden der Sprachen');
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const handleErstellen = () => {
    if (!language) {
      toast.error('Bitte wählen Sie eine Sprache aus');
      return;
    }

    // Get the selected language
    const selectedLanguage = languages.find(l => l.value === language);
    if (!selectedLanguage) {
      toast.error('Ausgewählte Sprache nicht gefunden');
      return;
    }

    // Call the original onErstellen callback if provided with language ID
    if (onErstellen) {
      onErstellen(selectedLanguage.id);
    }
    
    // Close the dialog - tab opening will be handled by QuotesManagement
    closeDialog();
  };

  const footer = (
    <Button 
      type="button" 
      aria-label="Erstellen" 
      onClick={handleErstellen}
      disabled={loading || !language}
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
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span>Sprachen werden geladen...</span>
          </div>
        ) : languages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Keine Sprachen verfügbar
          </div>
        ) : (
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-64" aria-label="Sprache wählen">
              {languages.find(l => l.value === language)?.label || 'Sprache wählen'}
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang: Language) => (
                <SelectItem key={lang.id} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </ManagedDialog>
  );
};

export default ChooseOfferLanguageDialog; 