import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import BlockDetail from './block-detail';
import { FilterableTable } from './filterable-table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import type { Block, BlockContent, Language } from '@/lib/db/schema';

type BlockWithContent = Block & {
  blockContents: BlockContent[];
  languageCount?: number;
  lastModified?: Date;
};

type BlockListTableProps = {
  data: BlockWithContent[];
  languages: Language[];
  onSaveBlockChanges?: (blockId: string, blockContents: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onSaveBlockProperties?: (blockId: string, blockData: Partial<Block>) => void;
  onDeleteBlock?: (blockId: string) => void;
  onCreateBlock?: () => Promise<BlockWithContent>;
  onCopyBlock?: (originalBlock: BlockWithContent) => Promise<BlockWithContent>;
};

const BlockListTable: FC<BlockListTableProps> = ({ 
  data, 
  languages,
  onSaveBlockChanges,
  onSaveBlockProperties,
  onDeleteBlock,
  onCreateBlock,
  onCopyBlock
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [blockToDelete, setBlockToDelete] = useState<BlockWithContent | null>(null);
  const [tableData, setTableData] = useState<BlockWithContent[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const getLanguagesForBlock = (block: BlockWithContent): string => {
    const blockLanguages = block.blockContents.map(bc => {
      const lang = languages.find(l => l.id === bc.languageId);
      return lang?.label || 'Unknown';
    });
    return blockLanguages.join(', ') || 'Keine Sprachen';
  };

  const getLastModified = (block: BlockWithContent): string => {
    if (block.blockContents.length === 0) return 'Nie';
    const latestUpdate = block.blockContents.reduce((latest, current) => 
      new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
    );
    return new Date(latestUpdate.updatedAt).toLocaleDateString('de-DE');
  };

  const handleOpenBlockDetail = (block: BlockWithContent) => {
    openNewTab({
      id: `block-detail-${block.id}`,
      title: `Block: ${block.name}`,
      content: (
        <BlockDetail 
          block={block} 
          languages={languages}
          onSaveChanges={onSaveBlockChanges}
          onSaveBlockProperties={onSaveBlockProperties}
        />
      ),
      closable: true,
    });
  };

  const handleAddNewBlock = async () => {
    if (!onCreateBlock) {
      toast.error('Block-Erstellung nicht verfügbar');
      return;
    }
    
    try {
      const newBlock = await onCreateBlock();
      const newBlockId = `block-detail-${newBlock.id}`;
      openNewTab({
        id: newBlockId,
        title: 'Neuer Block',
        content: (
          <BlockDetail 
            block={newBlock} 
            languages={languages}
            onSaveChanges={onSaveBlockChanges}
            onSaveBlockProperties={onSaveBlockProperties}
          />
        ),
        closable: true,
      });
    } catch (error) {
      toast.error('Fehler beim Erstellen des Blocks');
    }
  };

  const handleCopyBlock = async (block: BlockWithContent) => {
    if (!onCopyBlock) {
      toast.error('Block-Kopierung nicht verfügbar');
      return;
    }

    try {
      const copiedBlock = await onCopyBlock(block);
      
      // Update the table data with the new copied block
      setTableData(prevData => [...prevData, copiedBlock]);
      
      toast.success(`Block "${block.name}" wurde kopiert`);
      
      // Optionally open the copied block in a new tab
      const copiedBlockId = `block-detail-${copiedBlock.id}`;
      openNewTab({
        id: copiedBlockId,
        title: `Block: ${copiedBlock.name}`,
        content: (
          <BlockDetail 
            block={copiedBlock} 
            languages={languages}
            onSaveChanges={onSaveBlockChanges}
            onSaveBlockProperties={onSaveBlockProperties}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Fehler beim Kopieren des Blocks:', error);
      toast.error('Fehler beim Kopieren des Blocks');
    }
  };

  const handleInitiateDelete = (block: BlockWithContent) => {
    setBlockToDelete(block);
  };

  const handleConfirmDelete = () => {
    if (!blockToDelete) return;
    
    if (onDeleteBlock) {
      onDeleteBlock(blockToDelete.id);
    }
    
    setTableData(prevData =>
      prevData.filter(b => b.id !== blockToDelete.id)
    );
    toast.success('Block wurde gelöscht');
    setBlockToDelete(null);
  };

  const columns: ColumnDef<BlockWithContent>[] = [
    {
      accessorKey: 'name',
      header: 'Bezeichnung',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-medium"
          onClick={e => {
            e.stopPropagation();
            handleOpenBlockDetail(row.original);
          }}
          tabIndex={0}
          aria-label={`Block ${row.original.name} öffnen`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              handleOpenBlockDetail(row.original);
            }
          }}
        >
          {row.original.name}
        </span>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'title',
      header: 'Titel',
      cell: ({ row }) => {
        const firstContent = row.original.blockContents[0];
        return firstContent?.title || '-';
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'languages',
      header: 'Sprachen',
      cell: ({ row }) => getLanguagesForBlock(row.original),
    },
    {
      accessorKey: 'lastModified',
      header: 'zuletzt geändert am',
      cell: ({ row }) => getLastModified(row.original),
    },
    {
      accessorKey: 'standard',
      header: 'Standard',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.standard}
          readOnly
          tabIndex={-1}
          aria-label="Standard"
        />
      ),
    },
    {
      accessorKey: 'mandatory',
      header: 'Pflicht',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.mandatory}
          readOnly
          tabIndex={-1}
          aria-label="Pflicht"
        />
      ),
    },
    {
      accessorKey: 'position',
      header: 'Position',
    },
    {
      id: 'aktionen',
      header: 'Aktion',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Bearbeiten"
            onClick={e => {
              e.stopPropagation();
              handleOpenBlockDetail(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleOpenBlockDetail(row.original);
              }
            }}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Kopieren"
            disabled={!onCopyBlock}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyBlock(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleCopyBlock(row.original);
              }
            }}
            onMouseDown={e => {
              e.stopPropagation();
            }}
          >
            <Copy size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
            aria-label="Löschen"
            onClick={e => {
              e.stopPropagation();
              handleInitiateDelete(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleInitiateDelete(row.original);
              }
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const getRowClassName = (row: Row<BlockWithContent>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = (row: Row<BlockWithContent>) => {
    setSelectedRow(row.id);
    handleOpenBlockDetail(row.original);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          aria-label="Block hinzufügen"
          tabIndex={0}
          onClick={handleAddNewBlock}
          disabled={!onCreateBlock}
        >
          + Block hinzufügen
        </Button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <FilterableTable
          data={tableData}
          columns={columns}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          globalFilterColumnIds={['name', 'title']}
          filterPlaceholder="Filtern..."
        />
      </div>
      <DeleteConfirmationDialog
        open={!!blockToDelete}
        onOpenChange={open => !open && setBlockToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Block löschen"
        description={`Möchten Sie den Block "${blockToDelete?.name || ''}" wirklich löschen?`}
      />
    </div>
  );
};

export default BlockListTable;
