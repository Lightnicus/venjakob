import { useState, useEffect } from 'react';
import BlockListTable from './block-list-table';
import type { Language } from '@/lib/db/schema';
import { toast } from 'sonner';
import {
  fetchBlocksWithContent,
  fetchLanguages,
  saveBlockContentAPI,
  saveBlockPropertiesAPI,
  deleteBlockAPI,
  createNewBlock,
  copyBlockAPI,
} from '@/lib/api/blocks';
import type { BlockWithContent } from '@/lib/db/blocks';

const BlockManagement = () => {
  const [blocks, setBlocks] = useState<BlockWithContent[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [blocksData, languagesData] = await Promise.all([
        fetchBlocksWithContent(),
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

  const handleSaveBlockChanges = async (blockId: string, blockContents: Parameters<typeof saveBlockContentAPI>[1]) => {
    try {
      await saveBlockContentAPI(blockId, blockContents);
      toast.success('Block-Inhalte gespeichert');
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error saving block changes:', error);
      toast.error('Fehler beim Speichern der Block-Inhalte');
    }
  };

  const handleSaveBlockProperties = async (blockId: string, blockData: Parameters<typeof saveBlockPropertiesAPI>[1]) => {
    try {
      await saveBlockPropertiesAPI(blockId, blockData);
      toast.success('Block-Eigenschaften gespeichert');
      // Reload data to reflect changes
      await loadData();
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

  const handleCreateBlock = async (): Promise<BlockWithContent> => {
    try {
      const newBlock = await createNewBlock();
      toast.success('Neuer Block erstellt');
      // Add to local state immediately
      setBlocks(prev => [...prev, newBlock]);
      return newBlock;
    } catch (error) {
      console.error('Error creating block:', error);
      toast.error('Fehler beim Erstellen des Blocks');
      throw error;
    }
  };

  const handleCopyBlock = async (originalBlock: BlockWithContent): Promise<BlockWithContent> => {
    try {
      const copiedBlock = await copyBlockAPI(originalBlock);
      toast.success(`Block "${originalBlock.name}" wurde kopiert`);
      // Add to local state immediately
      setBlocks(prev => [...prev, copiedBlock]);
      return copiedBlock;
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