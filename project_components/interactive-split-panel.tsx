"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArboristTree } from './arborist-tree';
import { CustomNode, MyTreeNodeData } from './custom-node';
import initialTreeData from '@/data/tree-data.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NodeApi, TreeApi } from 'react-arborist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Delta } from 'quill';
import OfferPositionText from './offer-position-text';

const InteractiveSplitPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [treeData, setTreeData] = useState<readonly MyTreeNodeData[]>(initialTreeData);
  const [selectedNode, setSelectedNode] = useState<NodeApi<MyTreeNodeData> | null>(null);
  const [formDescriptionHtml, setFormDescriptionHtml] = useState<string | null>(null);
  
  const treeRef = useRef<TreeApi<MyTreeNodeData>>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSelection = () => {
    setSelectedNodeId(undefined);
    setSelectedNode(null);
    setFormDescriptionHtml(null);
    if (treeRef.current) {
      treeRef.current.deselectAll();
    }
  };

  const handleNodeSelect = (nodes: NodeApi<MyTreeNodeData>[]) => {
    if (nodes.length > 0) {
      const node = nodes[0];
      setSelectedNodeId(node.id);
      setSelectedNode(node);
      setFormDescriptionHtml(null);
      console.log(`Node selected: ${node.data.name}`);
    } else {
      setSelectedNodeId(undefined);
      setSelectedNode(null);
      setFormDescriptionHtml(null);
    }
  };

  useEffect(() => {
    if (selectedNode) {
      setFormDescriptionHtml(null);
    } else {
      setFormDescriptionHtml(null);
    }
  }, [selectedNode]);

  // Render form content
  const renderFormContent = () => {
    return (
      <OfferPositionText
        selectedNode={selectedNode}
        formDescriptionHtml={formDescriptionHtml}
        onDescriptionChange={setFormDescriptionHtml} 
      />
    );
  };

  // Right panel content based on selected node
  const renderRightPanel = () => {
    if (!selectedNode) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-medium mb-4">Knotendetails</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Wählen Sie einen Eintrag aus dem Baum auf der linken Seite, um Details anzuzeigen.
            </p>
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mt-4">
              <p className="text-gray-500 dark:text-gray-400">Keine Auswahl</p>
            </div>
          </div>
        </div>
      );
    }
    return renderFormContent();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 gap-2">
        <div className="flex gap-2">
          <Button tabIndex={0} aria-label="Block hinzufügen" onClick={() => {}}>
            Block hinzufügen
          </Button>
          <Button tabIndex={0} aria-label="Artikel hinzufügen" onClick={() => {}}>
            Artikel hinzufügen
          </Button>
          <Button tabIndex={0} aria-label="Element löschen" onClick={() => {}}>
            Element löschen
          </Button>
        </div>
        <div className="text-right font-semibold text-lg text-gray-800 dark:text-gray-100 select-none" aria-label="Gesamtpreis nach Rabatt">
          Gesamtpreis nach Rabatt: <span className="text-green-600 dark:text-green-400">95.000&nbsp;€</span>
        </div>
      </div>
      <div className="flex h-full w-full border rounded-md overflow-hidden">
        {/* Left Panel - Tree View */}
        <div className="w-1/3 border-r flex flex-col bg-white dark:bg-gray-800 p-4">
          <div className="p-3 border-b">
            <Input
              type="text"
              placeholder="Baum durchsuchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-auto">
            <ArboristTree<MyTreeNodeData>
              ref={treeRef}
              initialData={treeData}
              openByDefault={false}
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
              {CustomNode}
            </ArboristTree>
          </div>
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-700">
            <Button 
              onClick={handleClearSelection} 
              variant="outline" 
              className="w-full"
              disabled={!selectedNode}
            >
              Auswahl aufheben
            </Button>
          </div>
        </div>

        {/* Right Panel - Node Details */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto flex flex-col">
          <div className="flex-1 overflow-auto">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSplitPanel; 