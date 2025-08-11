import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, Phone, MapPin, User2 } from 'lucide-react';

export type OfferPropertiesProps = {
  kunde: {
    id: string;
    name: string;
    adresse: string;
    telefon: string;
    casLink: string;
  };
  empfaenger: {
    anrede: string;
    name: string;
    nachname: string;
    telefon: string;
    email: string;
  };
  preis: {
    showUnitPrices: boolean;
    calcTotal: boolean;
    total: number;
    discount: number;
    discountPercent: boolean;
    discountValue: number;
    autoTotal?: number;
    calculationStale?: boolean;
  };
  bemerkung: string;
  onChange?: (data: OfferPropertiesProps) => void;
  isEditing?: boolean;
};

const OfferProperties: React.FC<OfferPropertiesProps> = ({
  kunde,
  empfaenger,
  preis,
  bemerkung,
  onChange,
  isEditing = false,
}) => {
  const updatePreis = (partial: Partial<OfferPropertiesProps['preis']>) => {
    onChange?.({
      kunde,
      empfaenger,
      preis: { ...preis, ...partial },
      bemerkung,
    });
  };

  const updateBemerkung = (next: string) => {
    onChange?.({
      kunde,
      empfaenger,
      preis,
      bemerkung: next,
    });
  };

  const handleShowUnitPrices = () => {
    const next = !preis.showUnitPrices;
    updatePreis({ showUnitPrices: next, calcTotal: next ? true : preis.calcTotal });
  };

  const handleCalcTotal = () => {
    if (preis.showUnitPrices) return; // disabled when unit prices are shown
    updatePreis({ calcTotal: !preis.calcTotal });
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;
    updatePreis({ total: value });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;
    updatePreis({ discount: value });
  };

  const handleDiscountType = () => updatePreis({ discountPercent: !preis.discountPercent });

  const handleDiscountValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;
    updatePreis({ discountValue: value });
  };

  const handleRemark = (e: React.ChangeEvent<HTMLTextAreaElement>) => updateBemerkung(e.target.value);

  const displayedTotal = preis.calcTotal ? (preis.autoTotal || 0) : preis.total;
  const calcDiscount = () => (preis.discountPercent ? displayedTotal * (preis.discountValue / 100) : preis.discount);
  const totalWithDiscount = Math.max(0, displayedTotal - calcDiscount());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Kunde */}
      <section className="border rounded p-4 flex flex-col gap-3" aria-label="Kunde">
        <div className="text-lg font-bold border-b pb-1 mb-2">Kunde</div>
        <div className="flex items-center gap-2 font-semibold"><User2 className="w-5 h-5" />{kunde.id} - {kunde.name}</div>
        <div className="flex items-center gap-2"><MapPin className="w-5 h-5" />{kunde.adresse}</div>
        <div className="flex items-center gap-2"><Phone className="w-5 h-5" />Tel.: {kunde.telefon}</div>
        <div className="flex items-center gap-2"><Globe className="w-5 h-5" /><a href={kunde.casLink} className="underline text-blue-700" tabIndex={0} aria-label="CAS-Link">CAS-Link</a></div>
      </section>
      {/* Angebotsempfänger */}
      <section className="border rounded p-4 flex flex-col gap-3" aria-label="Angebotsempfänger">
        <div className="text-lg font-bold border-b pb-1 mb-2">Angebotsempfänger</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold">Anrede</div><div>{empfaenger.anrede}</div>
          <div className="font-semibold">Name</div><div>{empfaenger.name}</div>
          <div className="font-semibold">Nachname</div><div>{empfaenger.nachname}</div>
          <div className="font-semibold">Telefon</div><div>{empfaenger.telefon}</div>
          <div className="font-semibold">E-Mail</div><div>{empfaenger.email}</div>
        </div>
      </section>
      {/* Preis */}
      <section className="border rounded p-4 flex flex-col gap-3" aria-label="Preis">
        <div className="text-lg font-bold border-b pb-1 mb-2">Preis</div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="einzelpreise" checked={preis.showUnitPrices} onCheckedChange={handleShowUnitPrices} tabIndex={0} aria-label="Einzelpreise anzeigen" disabled={!isEditing} />
          <Label htmlFor="einzelpreise">Einzelpreise anzeigen</Label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="gesamtpreis-kalkulieren" checked={preis.calcTotal} onCheckedChange={handleCalcTotal} tabIndex={0} aria-label="Gesamtpreis kalkulieren" disabled={preis.showUnitPrices || !isEditing} />
          <Label htmlFor="gesamtpreis-kalkulieren">Gesamtpreis kalkulieren</Label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="gesamtpreis" className="w-32">Gesamtpreis</Label>
          <Input id="gesamtpreis" type="number" value={displayedTotal} onChange={handleTotalChange} tabIndex={0} aria-label="Gesamtpreis" className={preis.calcTotal ? 'w-40 bg-gray-200' : 'w-40'} min={0} disabled={preis.calcTotal || !isEditing} />
          <span>€</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Label className="w-32">Rabatt</Label>
          <Input
            type="number"
            value={preis.discount}
            onChange={handleDiscountChange}
            tabIndex={0}
            aria-label="Rabatt Betrag"
            className={(!isEditing || preis.discountPercent) ? 'w-24 bg-gray-200' : 'w-24'}
            min={0}
            disabled={!isEditing || preis.discountPercent}
          />
          <span>Betrag</span>
          <Switch
            checked={preis.discountPercent}
            onCheckedChange={handleDiscountType}
            tabIndex={0}
            aria-label="Rabatt in Prozent umschalten"
            disabled={!isEditing}
          />
          <span className={preis.discountPercent ? 'text-black' : 'text-gray-400'}>Prozent</span>
          <Input
            type="number"
            value={preis.discountValue}
            onChange={handleDiscountValue}
            disabled={!preis.discountPercent || !isEditing}
            tabIndex={0}
            aria-label="Rabatt Prozent"
            className={preis.discountPercent && isEditing ? 'w-16' : 'w-16 bg-gray-200'}
            min={0}
            max={100}
          />
          <span>%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Label className="w-32">Gesamtpreis inkl. Rabatt</Label>
          <div className="w-40 px-3 py-2 text-right font-medium">{totalWithDiscount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        </div>
      </section>
      {/* Bemerkung */}
      <section className="border rounded p-4 flex flex-col gap-3" aria-label="Bemerkung">
        <div className="text-lg font-bold border-b pb-1 mb-2">Bemerkung</div>
        <Textarea value={bemerkung} onChange={handleRemark} className="min-h-[120px] resize-y" tabIndex={0} aria-label="Bemerkung" />
      </section>
    </div>
  );
};

export default OfferProperties; 