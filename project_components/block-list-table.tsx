import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import { formatGermanDate } from '@/helper/date-formatter';
import BlockDetail from './block-detail';
import { FilterableTable } from './filterable-table';
import IconButton from './icon-button';
import InlineRowCheckbox from './inline-row-checkbox';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import type { Block, BlockContent, Language } from '@/lib/db/schema';



type BlockListItem = {
  id: string;
  name: string;
  standard: boolean;
  mandatory: boolean;
  position: number | null;
  firstContentTitle: string | null;
  languages: string;
  lastModified: string;
};

interface BlockListTableProps {
  data: BlockListItem[];
  languages: Language[];
  onSaveBlockChanges?: (blockId: string, blockContents: any[]) => Promise<void>;
  onSaveBlockProperties?: (blockId: string, blockData: any, reloadData?: boolean) => Promise<void>;
  onDeleteBlock?: (blockId: string) => Promise<void>;
  onCreateBlock?: () => Promise<BlockListItem>;
  onCopyBlock?: (block: BlockListItem) => Promise<BlockListItem>;
}

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
  const [blockToDelete, setBlockToDelete] = useState<BlockListItem | null>(null);
  const [tableData, setTableData] = useState<BlockListItem[]>(data);
  const [showStandardOnly, setShowStandardOnly] = useState<boolean>(false);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Filter data based on showStandardOnly checkbox
  const filteredData = showStandardOnly 
    ? tableData.filter(block => block.standard) 
    : tableData;

  const handleOptimisticUpdate = (blockId: string, updates: Partial<BlockListItem>) => {
    setTableData(prevData =>
      prevData.map(block =>
        block.id === blockId
          ? { ...block, ...updates }
          : block
      )
    );
    
    if (onSaveBlockProperties) {
      onSaveBlockProperties(blockId, updates, false);
    }
  };

  const handleStandardChange = (blockId: string, checked: boolean) => {
    const block = tableData.find(b => b.id === blockId);
    if (!block) return;

    let updates: Partial<BlockListItem> = { standard: checked };

    if (!checked) {
      // If standard is being unchecked, set position to null
      updates.position = null;
    } else {
      // If standard is being checked and position is null, set a default position
      if (block.position === null || block.position === undefined) {
        const maxPosition = Math.max(...tableData.map(b => b.position || 0), 0);
        updates.position = maxPosition + 1;
      }
    }

    handleOptimisticUpdate(blockId, updates);
  };

  const handleDragSortEnd = (reorderedData: BlockListItem[]) => {
    // Update local state with reordered data
    setTableData(prevData => {
      const updatedData = [...prevData];
      reorderedData.forEach(reorderedItem => {
        const index = updatedData.findIndex(item => item.id === reorderedItem.id);
        if (index !== -1) {
          updatedData[index] = reorderedItem;
        }
      });
      return updatedData;
    });

    // Save updated positions to the backend in parallel
    if (onSaveBlockProperties) {
      const savePromises = reorderedData.map(item => 
        onSaveBlockProperties(item.id, { position: item.position }, false)
      );
      
      Promise.allSettled(savePromises).then(results => {
        const failed = results.filter(result => result.status === 'rejected');
        if (failed.length > 0) {
          console.error('Some position updates failed:', failed);
          toast.error(`${failed.length} Position${failed.length > 1 ? 'en' : ''} konnte${failed.length > 1 ? 'n' : ''} nicht gespeichert werden`);
        }
      });
    }
  };

  const getLanguagesForBlock = (block: BlockListItem): string => {
    return block.languages;
  };

  const getLastModified = (block: BlockListItem): string => {
    if (block.lastModified === 'Nie') return 'Nie';
    return formatGermanDate(block.lastModified);
  };

  const handleOpenBlockDetail = (block: BlockListItem) => {
    // Create wrapper functions to match BlockDetail's expected signatures
    const handleSaveChanges = onSaveBlockChanges
      ? async (blockId: string, blockContents: any[]) => {
          onSaveBlockChanges(blockId, blockContents);
        }
      : undefined;

    const handleSaveProperties = onSaveBlockProperties
      ? async (blockId: string, blockData: any) => {
          onSaveBlockProperties(blockId, blockData, false);
        }
      : undefined;

    openNewTab({
      id: `block-detail-${block.id}`,
      title: `Block: ${block.name}`,
      content: (
        <BlockDetail 
          blockId={block.id}
          languages={languages}
          onSaveChanges={handleSaveChanges}
          onSaveBlockProperties={handleSaveProperties}
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

      // Create wrapper functions to match BlockDetail's expected signatures
      const handleSaveChanges = onSaveBlockChanges
        ? async (blockId: string, blockContents: any[]) => {
            onSaveBlockChanges(blockId, blockContents);
          }
        : undefined;

      const handleSaveProperties = onSaveBlockProperties
        ? async (blockId: string, blockData: any) => {
            onSaveBlockProperties(blockId, blockData, false);
          }
        : undefined;

      const newBlockId = `block-detail-${newBlock.id}`;
      openNewTab({
        id: newBlockId,
        title: 'Neuer Block',
        content: (
          <BlockDetail 
            blockId={newBlock.id}
            languages={languages}
            onSaveChanges={handleSaveChanges}
            onSaveBlockProperties={handleSaveProperties}
          />
        ),
        closable: true,
      });
    } catch (error) {
      toast.error('Fehler beim Erstellen des Blocks');
    }
  };

  const handleCopyBlock = async (block: BlockListItem) => {
    if (!onCopyBlock) {
      toast.error('Block-Kopierung nicht verfügbar');
      return;
    }

    try {
      const copiedBlock = await onCopyBlock(block);
      
      // Update the table data with the new copied block
      setTableData(prevData => [...prevData, copiedBlock]);
      
      toast.success(`Block "${block.name}" wurde kopiert`);
      
      // Create wrapper functions to match BlockDetail's expected signatures
      const handleSaveChanges = onSaveBlockChanges
        ? async (blockId: string, blockContents: any[]) => {
            onSaveBlockChanges(blockId, blockContents);
          }
        : undefined;

      const handleSaveProperties = onSaveBlockProperties
        ? async (blockId: string, blockData: any) => {
            onSaveBlockProperties(blockId, blockData, false);
          }
        : undefined;
      
      // Optionally open the copied block in a new tab
      const copiedBlockId = `block-detail-${copiedBlock.id}`;
      openNewTab({
        id: copiedBlockId,
        title: `Block: ${copiedBlock.name}`,
        content: (
          <BlockDetail 
            blockId={copiedBlock.id}
            languages={languages}
            onSaveChanges={handleSaveChanges}
            onSaveBlockProperties={handleSaveProperties}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Fehler beim Kopieren des Blocks:', error);
      toast.error('Fehler beim Kopieren des Blocks');
    }
  };

  const handleInitiateDelete = (block: BlockListItem) => {
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

  const columns: ColumnDef<BlockListItem>[] = [
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
      cell: ({ row }) => row.original.firstContentTitle || '-',
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
        <InlineRowCheckbox
          checked={row.original.standard}
          onClick={async (checked) => {
            handleStandardChange(row.original.id, checked);
          }}
          aria-label="Standard"
          disabled={!onSaveBlockProperties}
        />
      ),
    },
    {
      accessorKey: 'mandatory',
      header: 'Pflicht',
      cell: ({ row }) => (
        <InlineRowCheckbox
          checked={row.original.mandatory}
          onClick={async (checked) => {
            handleOptimisticUpdate(row.original.id, { mandatory: checked });
          }}
          aria-label="Pflicht"
          disabled={!onSaveBlockProperties}
        />
      ),
    },
    {
      accessorKey: 'position',
      header: 'Position',
      cell: ({ row }) => row.original.position ?? '-',
    },
    {
      id: 'aktionen',
      header: 'Aktion',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <IconButton
            icon={<Pencil size={16} />}
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
          />
          <IconButton
            icon={<Copy size={16} />}
            aria-label="Kopieren"
            disabled={!onCopyBlock}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleCopyBlock(row.original);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                await handleCopyBlock(row.original);
              }
            }}
            onMouseDown={e => {
              e.stopPropagation();
            }}
          />
          <IconButton
            icon={<Trash2 size={16} />}
            aria-label="Löschen"
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
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
          />
        </div>
      ),
    },
  ];

  const getRowClassName = (row: Row<BlockListItem>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = (row: Row<BlockListItem>) => {
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
      <div className="overflow-x-auto">
        <div className="mb-4 flex items-center gap-4 justify-end">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="standard-filter" 
              checked={showStandardOnly}
              onCheckedChange={(checked) => setShowStandardOnly(checked as boolean)}
            />
            <Label htmlFor="standard-filter" className="text-sm font-medium">
              Standard Blöcke
            </Label>
          </div>
        </div>
        
        <FilterableTable
          data={filteredData}
          columns={columns}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          globalFilterColumnIds={['name', 'title']}
          filterPlaceholder="Filtern..."
          enableDragSort={showStandardOnly}
          sortField="position"
          onDragSortEnd={handleDragSortEnd}
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
