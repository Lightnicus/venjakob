import { useState, useEffect } from 'react';
import BlockListTable from './block-list-table';
import type { Language } from '@/lib/db/schema';
import { toast } from 'sonner';
import {
  fetchBlockList,
  fetchLanguages,
  saveBlockContentAPI,
  saveBlockPropertiesAPI,
  deleteBlockAPI,
  createNewBlock,
  copyBlockAPI,
} from '@/lib/api/blocks';
import type { BlockWithContent } from '@/lib/db/blocks';
import { useTabReload } from './tabbed-interface-provider';

type BlockListItem = {
  id: string;
  name: string;
  standard: boolean;
  mandatory: boolean;
  position: number;
  firstContentTitle: string | null;
  languages: string;
  lastModified: string;
};

const BlockManagement = () => {
  const [blocks, setBlocks] = useState<BlockListItem[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [blocksData, languagesData] = await Promise.all([
        fetchBlockList(),
        fetchLanguages()
      ]);
      setBlocks(blocksData);
      setLanguages(languagesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Set up reload functionality for blocks
  useTabReload('blocks', loadData);

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBlockChanges = async (blockId: string, blockContents: Parameters<typeof saveBlockContentAPI>[1]) => {
    try {
      await saveBlockContentAPI(blockId, blockContents);
      // Don't show toast when called from BlockDetail - it handles its own success message
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error saving block changes:', error);
      toast.error('Fehler beim Speichern der Block-Inhalte');
    }
  };

  const handleSaveBlockProperties = async (blockId: string, blockData: Parameters<typeof saveBlockPropertiesAPI>[1], reloadData: boolean = true) => {
    try {
      await saveBlockPropertiesAPI(blockId, blockData);
      // Only show toast for direct property saves (reloadData=true), not from BlockDetail
      if (reloadData) {
        toast.success('Block-Eigenschaften gespeichert');
        await loadData();
      }
    } catch (error) {
      console.error('Error saving block properties:', error);
      toast.error('Fehler beim Speichern der Block-Eigenschaften');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlockAPI(blockId);
      toast.success('Block gelöscht');
      // Remove from local state immediately
      setBlocks(prev => prev.filter(block => block.id !== blockId));
    } catch (error) {
      console.error('Error deleting block:', error);
      toast.error('Fehler beim Löschen des Blocks');
    }
  };

  const handleCreateBlock = async (): Promise<BlockListItem> => {
    try {
      const newBlock = await createNewBlock();
      toast.success('Neuer Block erstellt');
      
      // Convert to BlockListItem format
      const blockListItem: BlockListItem = {
        id: newBlock.id,
        name: newBlock.name,
        standard: newBlock.standard,
        mandatory: newBlock.mandatory,
        position: newBlock.position,
        firstContentTitle: null,
        languages: 'Keine Sprachen',
        lastModified: 'Nie'
      };
      
      setBlocks(prev => [...prev, blockListItem]);
      return blockListItem;
    } catch (error) {
      console.error('Error creating block:', error);
      toast.error('Fehler beim Erstellen des Blocks');
      throw error;
    }
  };

  const handleCopyBlock = async (originalBlock: BlockListItem): Promise<BlockListItem> => {
    try {
      const copiedBlock = await copyBlockAPI(originalBlock);
      toast.success(`Block "${originalBlock.name}" wurde kopiert`);
      
      // Convert to BlockListItem format
      const blockListItem: BlockListItem = {
        id: copiedBlock.id,
        name: copiedBlock.name,
        standard: copiedBlock.standard,
        mandatory: copiedBlock.mandatory,
        position: copiedBlock.position,
        firstContentTitle: copiedBlock.blockContents?.[0]?.title || null,
        languages: copiedBlock.blockContents?.length > 0 ? 'Kopiert' : 'Keine Sprachen',
        lastModified: new Date().toISOString()
      };
      
      setBlocks(prev => [...prev, blockListItem]);
      return blockListItem;
    } catch (error) {
      console.error('Error copying block:', error);
      toast.error('Fehler beim Kopieren des Blocks');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Blockverwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Blockverwaltung</h2>
      <BlockListTable 
        data={blocks}
        languages={languages}
        onSaveBlockChanges={handleSaveBlockChanges}
        onSaveBlockProperties={handleSaveBlockProperties}
        onDeleteBlock={handleDeleteBlock}
        onCreateBlock={handleCreateBlock}
        onCopyBlock={handleCopyBlock}
      />
    </div>
  );
};

export default BlockManagement; 