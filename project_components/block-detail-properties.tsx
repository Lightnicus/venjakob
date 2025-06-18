import { FC, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { Block } from '@/lib/db/schema';

type BlockDetailPropertiesProps = {
  block: Block;
  onSave?: (blockId: string, blockData: Partial<Block>) => void;
  isEditing: boolean;
  editedProperties?: Partial<Block>;
  onPropertyChange?: (field: keyof Block, value: string | number | boolean) => void;
};

export interface BlockDetailPropertiesRef {
  getEditedData: () => Partial<Block>;
}

const BlockDetailProperties = forwardRef<BlockDetailPropertiesRef, BlockDetailPropertiesProps>(({ 
  block, 
  onSave, 
  isEditing,
  editedProperties,
  onPropertyChange
}, ref) => {
  // Use local state only if no external state is provided
  const [localEditedBlock, setLocalEditedBlock] = useState<Partial<Block>>({
    name: block.name,
    standard: block.standard,
    mandatory: block.mandatory,
    position: block.position,
    hideTitle: block.hideTitle,
    pageBreakAbove: block.pageBreakAbove,
  });

  // Use external state if provided, otherwise use local state
  const editedBlock = editedProperties || localEditedBlock;

  useImperativeHandle(ref, () => ({
    getEditedData: () => editedBlock,
  }));

  useEffect(() => {
    // Only update local state if no external state is provided
    if (!editedProperties) {
      setLocalEditedBlock({
        name: block.name,
        standard: block.standard,
        mandatory: block.mandatory,
        position: block.position,
        hideTitle: block.hideTitle,
        pageBreakAbove: block.pageBreakAbove,
      });
    }
  }, [block, editedProperties]);

  const handleSave = () => {
    if (onSave) {
      onSave(block.id, editedBlock);
    }
  };

  const handleInputChange = (field: keyof typeof editedBlock, value: string | number | boolean) => {
    if (!isEditing) return;
    
    let finalValue: string | number | boolean | null = value;
    
    // Special handling for the standard checkbox
    if (field === 'standard') {
      if (!value) {
        // If standard is being unchecked, set position to null
        if (onPropertyChange) {
          onPropertyChange('position', null as any);
        } else {
          setLocalEditedBlock(prev => ({ ...prev, position: null }));
        }
      } else {
        // If standard is being checked and position is null, set a default position
        const currentPosition = editedProperties?.position || localEditedBlock.position;
        if (currentPosition === null || currentPosition === undefined) {
          const defaultPosition = 1; // You might want to calculate the next available position
          if (onPropertyChange) {
            onPropertyChange('position', defaultPosition);
          } else {
            setLocalEditedBlock(prev => ({ ...prev, position: defaultPosition }));
          }
        }
      }
    }
    
    // Use external handler if provided, otherwise use local state
    if (onPropertyChange) {
      onPropertyChange(field, finalValue);
    } else {
      setLocalEditedBlock(prev => ({ ...prev, [field]: finalValue }));
    }
  };

  return (
    <div className="p-4 border rounded-md bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Eigenschaften</h3>
      </div>
      <div className="space-y-6">
        {/* Bezeichnung */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="bezeichnung" className="w-48 text-sm text-gray-700 shrink-0">
            Bezeichnung
          </Label>
          <Input 
            id="bezeichnung" 
            type="text" 
            value={editedBlock.name || ''} 
            onChange={(e) => handleInputChange('name', e.target.value)}
            readOnly={!isEditing}
            className="flex-1 text-sm read-only:bg-gray-100 read-only:cursor-not-allowed" 
          />
        </div>

        {/* Standard */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="standard" className="w-48 text-sm text-gray-700 shrink-0">
            Standard
          </Label>
          <Checkbox 
            id="standard" 
            checked={editedBlock.standard || false}
            onCheckedChange={(checked) => handleInputChange('standard', checked as boolean)}
            disabled={!isEditing}
          />
        </div>

        {/* Verpflichtend */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="verpflichtend" className="w-48 text-sm text-gray-700 shrink-0">
            Verpflichtend
          </Label>
          <Checkbox 
            id="verpflichtend" 
            checked={editedBlock.mandatory || false}
            onCheckedChange={(checked) => handleInputChange('mandatory', checked as boolean)}
            disabled={!isEditing}
          />
        </div>

        {/* Position */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="position" className="w-48 text-sm text-gray-700 shrink-0">
            Position
          </Label>
          <Input 
            id="position" 
            type="number" 
            value={editedBlock.position || ''} 
            onChange={(e) => handleInputChange('position', parseInt(e.target.value) || 0)}
            readOnly={!isEditing}
            disabled={!isEditing || !editedBlock.standard}
            className="w-20 text-sm read-only:bg-gray-100 read-only:cursor-not-allowed disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
        </div>

        {/* Überschrift nicht drucken */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="ueberschrift-nicht-drucken" className="w-48 text-sm text-gray-700 shrink-0">
            Überschrift nicht drucken
          </Label>
          <Checkbox 
            id="ueberschrift-nicht-drucken" 
            checked={editedBlock.hideTitle || false}
            onCheckedChange={(checked) => handleInputChange('hideTitle', checked as boolean)}
            disabled={!isEditing}
          />
        </div>

        {/* Seitenumbruch oberhalb */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="seitenumbruch-oberhalb" className="w-48 text-sm text-gray-700 shrink-0">
            Seitenumbruch oberhalb
          </Label>
          <Checkbox 
            id="seitenumbruch-oberhalb" 
            checked={editedBlock.pageBreakAbove || false}
            onCheckedChange={(checked) => handleInputChange('pageBreakAbove', checked as boolean)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
});

BlockDetailProperties.displayName = 'BlockDetailProperties';

export default BlockDetailProperties; 