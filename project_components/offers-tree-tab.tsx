'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArboristTree } from './arborist-tree';
import { CustomNode, MyTreeNodeData, createCustomNodeWithDragState } from './custom-node';
import initialTreeData from '@/data/tree-data.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NodeApi, TreeApi } from 'react-arborist';

interface OffersTreeTabProps {
  offerId?: string;
  offerName?: string;
}

const OffersTreeTab: React.FC<OffersTreeTabProps> = ({
  offerId,
  offerName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
    undefined,
  );
  const [treeData, setTreeData] = useState<readonly MyTreeNodeData[]>(
    initialTreeData as readonly MyTreeNodeData[],
  );
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<string | null>(null);

  const treeRef = useRef<TreeApi<MyTreeNodeData>>(null);

  // Effect to potentially load specific tree data when offerId changes
  useEffect(() => {
    if (offerId) {
      // In a real app, you might load offer-specific tree data here
      // For now, we just use the initial data
  
    }
  }, [offerId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSelection = () => {
    setSelectedNodeId(undefined);
    setSelectedNodeInfo(null);
    if (treeRef.current) {
      treeRef.current.deselectAll();
    }
  };

  const handleNodeSelect = (nodes: NodeApi<MyTreeNodeData>[]) => {
    if (nodes.length > 0) {
      const selectedNode = nodes[0];
      setSelectedNodeId(selectedNode.id);

      // Display some information about the selected node
      setSelectedNodeInfo(
        `Ausgewählt: ${selectedNode.data.name} (ID: ${selectedNode.id})`,
      );

      // You could fetch additional data related to this node if needed
  
    } else {
      setSelectedNodeId(undefined);
      setSelectedNodeInfo(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {offerName ? `Baum für Angebot: ${offerName}` : 'Angebotsbaum'}
        </h2>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Baum durchsuchen..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow"
        />
        <Button onClick={handleClearSelection} variant="outline">
          Auswahl aufheben
        </Button>
      </div>

      <div
        className="border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800"
        style={{ height: 'calc(100vh - 220px)' }}
      >
        <ArboristTree<MyTreeNodeData>
          ref={treeRef}
          initialData={treeData}
          openByDefault={true}
          width="100%"
          height={600}
          indent={24}
          rowHeight={36}
          searchTerm={searchTerm}
          searchMatch={(node, term) =>
            node.data.name.toLowerCase().includes(term.toLowerCase())
          }
          selection={selectedNodeId}
          onSelect={handleNodeSelect}
        >
          {createCustomNodeWithDragState(false)}
        </ArboristTree>
      </div>

      <div className="text-sm text-gray-500">
        {offerId && <p>Angebots-ID: {offerId}</p>}
        {selectedNodeInfo && (
          <p className="mt-2 font-medium text-blue-600">{selectedNodeInfo}</p>
        )}
      </div>
    </div>
  );
};

export default OffersTreeTab;
