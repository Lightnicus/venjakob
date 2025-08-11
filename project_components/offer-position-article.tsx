import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { fetchPositionCalculationItems } from '@/lib/api/quotes'
import PlateRichTextEditor from "./plate-rich-text-editor"
import { type Value } from 'platejs'
import { plateValueToHtml } from '@/helper/plate-serialization';
import { parseJsonContent } from '@/helper/plate-json-parser';
import { Circle } from 'lucide-react';

type OfferPositionArticleProps = {
  selectedNode?: any
  isEditing: boolean
  positionId?: string;
  hasPositionChanges?: (positionId: string) => boolean;
  addChange?: (positionId: string, field: string, oldValue: any, newValue: any) => void;
  removeChange?: (positionId: string, field?: string) => void;
  getPositionChanges?: (positionId: string) => { [field: string]: { oldValue: any; newValue: any } };
}

const OfferPositionArticle: React.FC<OfferPositionArticleProps> = React.memo(({ 
  selectedNode, 
  isEditing,
  positionId,
  hasPositionChanges,
  addChange,
  removeChange,
  getPositionChanges
}) => {
  const [title, setTitle] = useState(selectedNode?.data?.title || "")
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [quantity, setQuantity] = useState<string>(selectedNode?.data?.quantity || '1')
  const [unitPriceDisplay, setUnitPriceDisplay] = useState<string>(() => {
    const p = selectedNode?.data?.unitPrice as string | undefined;
    if (!p) return '';
    return (p ?? '').toString().replace('.', ',');
  })
  const [isOptionChecked, setIsOptionChecked] = useState<boolean>(Boolean(selectedNode?.data?.isOption))
  const [pageBreakAboveChecked, setPageBreakAboveChecked] = useState<boolean>(Boolean(selectedNode?.data?.pageBreakAbove))
  const [originalTitle, setOriginalTitle] = useState(selectedNode?.data?.title || "")
  const [currentTab, setCurrentTab] = useState<string>("eingabe")
  const [calcItems, setCalcItems] = useState<Array<{ id: string; name: string; type: string; value: string; order: number | null; originalValue?: string | null; editingValue?: string }>>([])
  const [note, setNote] = useState<string>(selectedNode?.data?.calculationNote || '')

  // Update state when selectedNode changes; prefer unsaved note if available
  React.useEffect(() => {
    if (selectedNode) {
      const newTitle = selectedNode.data.title || "";
      setTitle(newTitle);
      setOriginalTitle(newTitle);
      const unsaved = positionId && getPositionChanges ? getPositionChanges(positionId) : undefined;
      const noteChange = unsaved && unsaved['calculationNote'];
      setNote((noteChange?.newValue as string) ?? (selectedNode.data.calculationNote || ''));
      const quantityChange = unsaved && unsaved['quantity'];
      setQuantity((quantityChange?.newValue as string) ?? (selectedNode.data.quantity || '1'));
      const unitPriceChange = unsaved && (unsaved['unitPrice'] as any);
      const baseUnitPrice: string = (unitPriceChange?.newValue as string) ?? (selectedNode.data.unitPrice ?? '');
      setUnitPriceDisplay(baseUnitPrice ? baseUnitPrice.toString().replace('.', ',') : '');
      const isOptionChange = unsaved && (unsaved['isOption'] as any);
      setIsOptionChecked((isOptionChange?.newValue as boolean) ?? Boolean(selectedNode.data.isOption));
      const pbChange = unsaved && (unsaved['pageBreakAbove'] as any);
      setPageBreakAboveChecked((pbChange?.newValue as boolean) ?? Boolean(selectedNode.data.pageBreakAbove));
    }
  }, [selectedNode, positionId, getPositionChanges])

  // Get current value considering unsaved changes
  const getCurrentTitle = useCallback(() => {
    if (positionId && hasPositionChanges && hasPositionChanges(positionId)) {
      // Check if we have unsaved changes for this position
      const positionChanges = getPositionChanges?.(positionId);
      if (positionChanges?.title) {
        return positionChanges.title.newValue;
      }
    }
    return title;
  }, [positionId, hasPositionChanges, getPositionChanges, title]);

  const getCurrentDescription = useCallback(() => {
    if (positionId && hasPositionChanges && hasPositionChanges(positionId)) {
      // Check if we have unsaved changes for this position
      const positionChanges = getPositionChanges?.(positionId);
      if (positionChanges?.description) {
        return positionChanges.description.newValue;
      }
    }
    return selectedNode?.data?.description || "";
  }, [positionId, hasPositionChanges, getPositionChanges, selectedNode]);

  // Function to update preview HTML with current data
  const updatePreviewHtml = useCallback(async () => {
    const currentDescription = getCurrentDescription();
    
    if (!currentDescription) {
      setPreviewHtml("<em>(Keine Beschreibung)</em>");
      return;
    }

    try {
      // Parse the JSON string back to PlateJS value
      const plateValue = parseJsonContent(currentDescription);
      // Convert to HTML
      const html = await plateValueToHtml(plateValue);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error converting to HTML for preview:', error);
      setPreviewHtml("<em>(Fehler beim Laden der Beschreibung)</em>");
    }
  }, [getCurrentDescription]);

  // Convert PlateJS value to HTML for preview when selectedNode changes
  useEffect(() => {
    updatePreviewHtml();
  }, [selectedNode?.data?.description, updatePreviewHtml]);

  // Update preview when switching to preview tab
  useEffect(() => {
    if (currentTab === "vorschau") {
      updatePreviewHtml();
    }
  }, [currentTab, updatePreviewHtml]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Track changes if positionId and change tracking functions are available
    if (positionId && addChange && removeChange) {
      if (newTitle !== originalTitle) {
        addChange(positionId, 'title', originalTitle, newTitle);
      } else {
        removeChange(positionId, 'title');
      }
    }
  }, [positionId, addChange, removeChange, originalTitle])

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // allow empty while typing
    if (!/^\d*$/.test(raw)) return;
    setQuantity(raw);
    if (positionId && addChange && removeChange) {
      const oldQ = selectedNode?.data?.quantity || '1';
      if (raw !== oldQ) {
        addChange(positionId, 'quantity', oldQ, raw);
      } else {
        removeChange(positionId, 'quantity');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  const handleUnitPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!isValidGermanInput(raw)) return;
    setUnitPriceDisplay(raw);
  }, [])

  const handleUnitPriceBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    const normalized = clampTwoDecimals(parseGermanDecimal(raw));
    const fallbackOld = (selectedNode?.data?.unitPrice ?? '') as string;
    if (normalized === '') {
      setUnitPriceDisplay(fallbackOld ? fallbackOld.toString().replace('.', ',') : '');
      return;
    }
    if (positionId && addChange && removeChange) {
      const oldUnit = (selectedNode?.data?.unitPrice ?? '') as string;
      if (normalized !== oldUnit) {
        addChange(positionId, 'unitPrice', oldUnit, normalized);
      } else {
        removeChange(positionId, 'unitPrice');
      }
    }
    setUnitPriceDisplay(normalized.replace('.', ','));
  }, [positionId, addChange, removeChange, selectedNode])

  const handleIsOptionChange = useCallback((checked: boolean | string) => {
    const next = Boolean(checked === 'indeterminate' ? false : checked);
    setIsOptionChecked(next);
    if (positionId && addChange && removeChange) {
      const oldVal = Boolean(selectedNode?.data?.isOption);
      if (next !== oldVal) {
        addChange(positionId, 'isOption', oldVal, next);
      } else {
        removeChange(positionId, 'isOption');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  const handlePageBreakAboveChange = useCallback((checked: boolean | string) => {
    const next = Boolean(checked === 'indeterminate' ? false : checked);
    setPageBreakAboveChecked(next);
    if (positionId && addChange && removeChange) {
      const oldVal = Boolean(selectedNode?.data?.pageBreakAbove);
      if (next !== oldVal) {
        addChange(positionId, 'pageBreakAbove', oldVal, next);
      } else {
        removeChange(positionId, 'pageBreakAbove');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  const handleDescriptionChange = useCallback((content: Value) => {
    if (selectedNode && positionId && addChange && removeChange) {
      const newDescription = JSON.stringify(content);
      const oldDescription = selectedNode.data.description || '';
      
      if (newDescription !== oldDescription) {
        addChange(positionId, 'description', oldDescription, newDescription);
      } else {
        removeChange(positionId, 'description');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  // Load calculation items when positionId changes or when switching to kalkulation tab
  useEffect(() => {
    const load = async () => {
      if (!positionId) return;
      try {
        const items = await fetchPositionCalculationItems(positionId);
        const toGerman = (v: string) => (v ?? '').toString().replace('.', ',');
        // Merge unsaved changes
        const unsaved = getPositionChanges ? getPositionChanges(positionId) : undefined;
        const merged = items.map(it => {
          const changeKey = `calcItem:${it.id}`;
          const newVal = unsaved && unsaved[changeKey]?.newValue as string | undefined;
          const canonical = newVal ?? it.value;
          return { ...it, value: canonical, originalValue: it.originalValue, editingValue: toGerman(canonical) };
        });
        setCalcItems(merged);
      } catch (e) {
        console.error('Error loading calculation items', e);
      }
    };
    if (currentTab === 'kalkulation') {
      load();
    }
  }, [positionId, currentTab, getPositionChanges])

  const formatUnit = useCallback((type: string) => {
    if (type === 'time') return 'h';
    if (type === 'cost') return '€';
    return '';
  }, [])

  const registerCalcChange = useCallback((id: string, newValue: string, oldValue: string) => {
    if (positionId && addChange && removeChange) {
      const key = `calcItem:${id}`;
      if (newValue !== oldValue) {
        addChange(positionId, key, oldValue, newValue);
      } else {
        removeChange(positionId, key);
      }
    }
  }, [positionId, addChange, removeChange]);

  const parseGermanDecimal = (input: string) => input.replace(',', '.');
  const clampTwoDecimals = (value: string) => {
    if (value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return '';
    return num.toFixed(2);
  };

  const isValidGermanInput = (raw: string) => {
    // Allow digits with optional single comma or dot and up to 2 decimals
    return /^\d*(?:[\.,]\d{0,2})?$/.test(raw);
  };

  const handleCalcValueChange = useCallback((id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!isValidGermanInput(raw)) return;
    setCalcItems(prev => prev.map(it => it.id === id ? { ...it, editingValue: raw } : it));
  }, [])

  const handleCalcValueBlur = useCallback((id: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setCalcItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const oldCanonical = it.value;
      const normalized = clampTwoDecimals(parseGermanDecimal(raw));
      // If empty or invalid, fall back to old value
      if (normalized === '') {
        return { ...it, editingValue: it.editingValue ?? '' };
      }
      // Update canonical and editing value, and register change
      registerCalcChange(id, normalized, oldCanonical);
      const germanDisplay = normalized.replace('.', ',');
      return { ...it, value: normalized, editingValue: germanDisplay };
    }));
  }, [registerCalcChange])

  // No local save; central Save in QuoteDetail handles persistence

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    if (positionId && addChange && removeChange) {
      const oldNote = selectedNode?.data?.calculationNote || '';
      if (newNote !== oldNote) {
        addChange(positionId, 'calculationNote', oldNote, newNote);
      } else {
        removeChange(positionId, 'calculationNote');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  // Check if this position has unsaved changes
  const hasChanges = positionId && hasPositionChanges ? hasPositionChanges(positionId) : false;

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(() => (
    <form className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="input-ueberschrift" className="text-sm font-medium">
          Überschrift
        </label>
        <Input
          id="input-ueberschrift"
          type="text"
          placeholder="Überschrift eingeben"
          value={getCurrentTitle()}
          onChange={handleTitleChange}
          className="w-full"
          aria-label="Überschrift"
          disabled={!isEditing}
        />
      </div>
      <fieldset className="border rounded p-4">
        <legend className="px-1 text-sm text-gray-700">Preis</legend>
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1 w-28">
            <label htmlFor="input-anzahl" className="text-sm font-medium">Anzahl</label>
            <Input
              id="input-anzahl"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Anzahl eingeben"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full"
              aria-label="Anzahl"
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-1 min-w-64">
            <label htmlFor="input-einzelpreis" className="text-sm font-medium">Einzelpreis</label>
            <Input
              id="input-einzelpreis"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[\.,]?[0-9]{0,2}"
              value={unitPriceDisplay}
              onChange={handleUnitPriceChange}
              onBlur={handleUnitPriceBlur}
              className="w-full"
              aria-label="Einzelpreis"
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              id="checkbox-ist-option"
              type="checkbox"
              className="size-4 rounded border"
              checked={isOptionChecked}
              onChange={(e) => handleIsOptionChange(e.target.checked)}
              disabled={!isEditing}
              aria-label="Ist Option"
            />
            <label htmlFor="checkbox-ist-option" className="text-sm">Ist Option</label>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              id="checkbox-page-break-above"
              type="checkbox"
              className="size-4 rounded border"
              checked={pageBreakAboveChecked}
              onChange={(e) => handlePageBreakAboveChange(e.target.checked)}
              disabled={!isEditing}
              aria-label="Seitenumbruch oberhalb"
            />
            <label htmlFor="checkbox-page-break-above" className="text-sm">Seitenumbruch oberhalb</label>
          </div>
        </div>
      </fieldset>
      <div className="space-y-2">
        <label htmlFor="editor-beschreibung" className="text-sm font-medium">
          Beschreibung
        </label>
        <PlateRichTextEditor
          id="editor-beschreibung"
          value={getCurrentDescription() || ''}
          onValueChange={handleDescriptionChange}
          placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
          className="min-h-[200px]"
          readOnly={!isEditing}
        />
      </div>
    </form>
  ), [quantity, unitPriceDisplay, isOptionChecked, pageBreakAboveChecked, handleQuantityChange, handleUnitPriceChange, handleUnitPriceBlur, handleIsOptionChange, handlePageBreakAboveChange, getCurrentTitle, handleTitleChange, getCurrentDescription, handleDescriptionChange, isEditing])

  // Kalkulation content (live data)
  const kalkulationContent = useMemo(() => (
    <div className="pt-2 w-full max-w-5xl border rounded p-6 bg-white mx-auto mt-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-0">
          {calcItems.map(item => (
            <div key={item.id} className="grid grid-cols-[minmax(200px,auto)_160px] gap-4 items-start mb-4">
              <label className="flex flex-col gap-1 text-sm font-medium" htmlFor={`ci-${item.id}`}>
                {item.name} ({formatUnit(item.type)})
                {item.originalValue != null && (
                  <span className="text-xs text-gray-500">Original: {(item.originalValue ?? '').toString().replace('.', ',')} {formatUnit(item.type)}</span>
                )}
                <Input
                  id={`ci-${item.id}`}
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[\.,]?[0-9]{0,2}"
                  value={item.editingValue ?? ''}
                  onChange={handleCalcValueChange(item.id)}
                  onBlur={handleCalcValueBlur(item.id)}
                  className="w-full"
                  aria-label={item.name}
                  tabIndex={0}
                  disabled={!isEditing}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 h-full">
          <label htmlFor="bemerkung" className="text-sm font-medium">Bemerkung</label>
          <Textarea
            id="bemerkung"
            value={note}
            onChange={handleNoteChange}
            className="min-h-[180px] resize-y h-full"
            aria-label="Bemerkung"
            tabIndex={0}
            disabled={!isEditing}
          />
        </div>
      </div>
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setCalcItems(prev => prev.map(it => {
              const orig = (it.originalValue ?? it.value) as string;
              const german = (orig ?? '').toString().replace('.', ',');
              // register change back to original
              registerCalcChange(it.id, orig, it.value);
              return { ...it, value: orig, editingValue: german };
            }));
          }}
          disabled={!isEditing}
          aria-label="Zurücksetzen"
        >
          Zurücksetzen
        </Button>
      </div>
    </div>
  ), [calcItems, note, handleCalcValueChange, handleNoteChange, isEditing, formatUnit])

  // Memoize the preview content
  const previewContent = useMemo(() => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{getCurrentTitle() || "(Keine Überschrift)"}</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  ), [getCurrentTitle, previewHtml])

  return (
    <div className="p-6 h-full">
      {isEditing ? (
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="eingabe">Eingabe</TabsTrigger>
            <TabsTrigger value="kalkulation">Kalkulation</TabsTrigger>
            <TabsTrigger value="vorschau">Vorschau</TabsTrigger>
          </TabsList>
          <TabsContent value="eingabe" className="mt-6">
            {formContent}
          </TabsContent>
          <TabsContent value="kalkulation" className="mt-6">
            {kalkulationContent}
          </TabsContent>
          <TabsContent value="vorschau" className="mt-6">
            {previewContent}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-6">
          {previewContent}
        </div>
      )}
    </div>
  )
})

OfferPositionArticle.displayName = 'OfferPositionArticle'

export default OfferPositionArticle 