import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import BlockDetail from './block-detail';
import blockDetailData from '@/data/block-detail.json';
import languages from '@/data/languages.json';
import { FilterableTable } from './filterable-table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

type Block = {
  bezeichnung: string;
  ueberschrift: string;
  sprachen: string;
  geaendertAm: string;
  standard: boolean;
  position: number;
};

type BlockListTableProps = {
  data: Block[];
};

const BlockListTable: FC<BlockListTableProps> = ({ data }) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [blockToDelete, setBlockToDelete] = useState<Block | null>(null);
  const [tableData, setTableData] = useState<Block[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleOpenBlockDetail = (block: Block) => {
    openNewTab({
      id: `block-detail-${block.bezeichnung}`,
      title: `Block: ${block.bezeichnung}`,
      content: (
        <BlockDetail data={blockDetailData} languages={languages as any} />
      ),
      closable: true,
    });
  };

  const handleAddNewBlock = () => {
    const newBlockId = `new-block-${Date.now()}`;
    openNewTab({
      id: newBlockId,
      title: 'Neuer Block',
      content: <BlockDetail data={{}} languages={languages as any} />,
      closable: true,
    });
  };

  const handleCopyBlock = (block: Block) => {
    console.log('Kopiere Block:', block.bezeichnung);
    toast('Block wurde kopiert');
  };

  const handleInitiateDelete = (block: Block) => {
    setBlockToDelete(block);
  };

  const handleConfirmDelete = () => {
    if (!blockToDelete) return;
    setTableData(prevData =>
      prevData.filter(
        b =>
          b.bezeichnung !== blockToDelete.bezeichnung ||
          b.position !== blockToDelete.position,
      ),
    );
    toast.success('Block wurde gelöscht');
    setBlockToDelete(null);
  };

  const columns: ColumnDef<Block>[] = [
    {
      accessorKey: 'bezeichnung',
      header: 'Bezeichnung',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-medium"
          onClick={e => {
            e.stopPropagation();
            handleOpenBlockDetail(row.original);
          }}
          tabIndex={0}
          aria-label={`Block ${row.original.bezeichnung} öffnen`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              handleOpenBlockDetail(row.original);
            }
          }}
        >
          {row.original.bezeichnung}
        </span>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'ueberschrift',
      header: 'Überschrift',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'sprachen',
      header: 'Sprachen',
    },
    {
      accessorKey: 'geaendertAm',
      header: 'zuletzt geändert am',
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
            onClick={e => {
              e.stopPropagation();
              handleCopyBlock(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleCopyBlock(row.original);
              }
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

  const getRowClassName = (row: Row<Block>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = (row: Row<Block>) => {
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
          globalFilterColumnIds={['ueberschrift', 'sprachen', 'bezeichnung']}
          filterPlaceholder="Filtern..."
        />
      </div>
      <DeleteConfirmationDialog
        open={!!blockToDelete}
        onOpenChange={open => !open && setBlockToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Block löschen"
        description={`Möchten Sie den Block "${blockToDelete?.bezeichnung || ''}" wirklich löschen?`}
      />
    </div>
  );
};

export default BlockListTable;
