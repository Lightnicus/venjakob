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
  const [contentType, setContentType] = useState<'details' | 'text' | 'chart' | 'form'>('details');
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
      setContentType('details');
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

  // Render chart content
  const renderChartContent = () => {
    return (
      <div className="p-6 h-full">
        <h2 className="text-xl font-medium mb-6">
          {selectedNode ? `Diagramm für: ${selectedNode.data.name}` : 'Diagramm Ansicht'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md h-[400px] flex items-center justify-center">
          <div className="w-full h-[300px] bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-md relative">
            <div className="absolute bottom-0 left-0 w-1/4 h-[60%] bg-blue-500 rounded-t-md ml-[10%]"></div>
            <div className="absolute bottom-0 left-[30%] w-1/4 h-[40%] bg-green-500 rounded-t-md ml-[5%]"></div>
            <div className="absolute bottom-0 left-[60%] w-1/4 h-[80%] bg-purple-500 rounded-t-md ml-[0%]"></div>
            <div className="absolute top-5 left-0 w-full text-center text-gray-700 dark:text-gray-200 font-medium">
              {selectedNode ? `Daten für ${selectedNode.data.name}` : 'Beispiel-Diagramm'}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  // Render text content
  const renderTextContent = () => {
    return (
      <div className="p-6 h-full">
        <h2 className="text-xl font-medium mb-6">
          {selectedNode ? `Informationen zu: ${selectedNode.data.name}` : 'Text Ansicht'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-medium mb-3">
            {selectedNode ? selectedNode.data.name : 'Kein Knoten ausgewählt'}
          </h3>
          <p className="mb-4">
            {selectedNode 
              ? `Dies ist die Textansicht für den Knoten "${selectedNode.data.name}". Hier können detaillierte Informationen über den Knoten angezeigt werden.`
              : 'Wählen Sie einen Knoten aus dem Baum, um Informationen anzuzeigen.'}
          </p>
          {selectedNode && (
            <>
              <p className="mb-4">
                Dieser Knoten befindet sich auf Ebene {selectedNode.level} und ist vom Typ {selectedNode.isInternal ? 'Ordner' : 'Datei'}.
                {selectedNode.isInternal && ` Er enthält ${selectedNode.children?.length || 0} Unterelemente.`}
              </p>
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <pre className="text-sm">
                  {`{
  "id": "${selectedNode.id}",
  "name": "${selectedNode.data.name}",
  "type": "${selectedNode.isInternal ? 'folder' : 'file'}",
  "metadata": {
    "level": ${selectedNode.level},
    "index": ${selectedNode.rowIndex},
    "isOpen": ${selectedNode.isOpen || false}
  }
}`}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Right panel content based on selected node and content type
  const renderRightPanel = () => {
    // If no node is selected, show a placeholder
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

    // Default details view content (moved here to be wrapped in TabsContent)
    const renderDetailsContent = () => {
      const isFolder = selectedNode.isInternal;
      return (
        <div className="p-6 h-full">
          <Card>
            <CardHeader>
              <CardTitle>
                {isFolder ? '📁' : '📄'} {selectedNode.data.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID</h3>
                  <p>{selectedNode.id}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Typ</h3>
                  <p>{isFolder ? 'Ordner' : 'Datei'}</p>
                </div>
                
                {isFolder && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Unterelemente</h3>
                    <p>{selectedNode.isOpen ? 'Geöffnet' : 'Geschlossen'}</p>
                    <p className="mt-1">
                      {selectedNode.children 
                        ? `${selectedNode.children.length} Unterelemente` 
                        : 'Keine Unterelemente'}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p>Level: {selectedNode.level}</p>
                  <p>Index: {selectedNode.rowIndex}</p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      if (isFolder && selectedNode.toggle) {
                        selectedNode.toggle();
                      }
                    }}
                    disabled={!isFolder}
                  >
                    {isFolder 
                      ? selectedNode.isOpen ? 'Ordner schließen' : 'Ordner öffnen' 
                      : 'Kein Ordner'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };
    
    // Show different content based on the selected content type using Tabs
    return (
      <Tabs value={contentType} onValueChange={(value) => setContentType(value as 'details' | 'text' | 'chart' | 'form')} className="w-full h-full flex flex-col">
        <TabsList className="shrink-0 bg-white dark:bg-gray-800 p-0 border-b flex flex-wrap gap-2 justify-start rounded-none w-full">
          <TabsTrigger value="details" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100">
            Details
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-xs sm:text-sm">
            Text
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-xs sm:text-sm">
            Diagramm
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-xs sm:text-sm">
            Formular
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="flex-1 overflow-auto">
          {renderDetailsContent()}
        </TabsContent>
        <TabsContent value="text" className="flex-1 overflow-auto">
          {renderTextContent()}
        </TabsContent>
        <TabsContent value="chart" className="flex-1 overflow-auto">
          {renderChartContent()}
        </TabsContent>
        <TabsContent value="form" className="flex-1 overflow-auto">
          {renderFormContent()}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="flex h-full w-full border rounded-md overflow-hidden">
      {/* Left Panel - Tree View */}
      <div className="w-1/3 border-r flex flex-col bg-white dark:bg-gray-800">
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
  );
};

export default InteractiveSplitPanel; 