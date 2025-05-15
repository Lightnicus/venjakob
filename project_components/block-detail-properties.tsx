import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type BlockDetailPropertiesProps = {
  // Define props if needed, e.g., for initial values or event handlers
  // For now, we'll keep it simple and assume uncontrolled or default values
};

const BlockDetailProperties: FC<BlockDetailPropertiesProps> = () => {
  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-6">Eigenschaften</h3>
      <div className="space-y-6">
        {/* Bezeichnung */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="bezeichnung" className="w-48 text-sm text-gray-700 shrink-0">
            Bezeichnung
          </Label>
          <Input id="bezeichnung" type="text" defaultValue="allgemeines Anschreiben" className="flex-1 text-sm" />
        </div>

        {/* Standard */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="standard" className="w-48 text-sm text-gray-700 shrink-0">
            Standard
          </Label>
          <Checkbox id="standard" defaultChecked />
        </div>

        {/* Verpflichtend */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="verpflichtend" className="w-48 text-sm text-gray-700 shrink-0">
            Verpflichtend
          </Label>
          <Checkbox id="verpflichtend" />
        </div>

        {/* Position */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="position" className="w-48 text-sm text-gray-700 shrink-0">
            Position
          </Label>
          <Input id="position" type="number" defaultValue={1} className="w-20 text-sm" />
        </div>

        {/* Überschrift nicht drucken */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="ueberschrift-nicht-drucken" className="w-48 text-sm text-gray-700 shrink-0">
            Überschrift nicht drucken
          </Label>
          <Checkbox id="ueberschrift-nicht-drucken" />
        </div>

        {/* Seitenumbruch oberhalb */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="seitenumbruch-oberhalb" className="w-48 text-sm text-gray-700 shrink-0">
            Seitenumbruch oberhalb
          </Label>
          <Checkbox id="seitenumbruch-oberhalb" />
        </div>
      </div>
    </div>
  );
};

export default BlockDetailProperties; 