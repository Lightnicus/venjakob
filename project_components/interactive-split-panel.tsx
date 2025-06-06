"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArboristTree } from './arborist-tree';
import { CustomNode, MyTreeNodeData } from './custom-node';
import initialTreeDataRaw from '@/data/tree-data.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NodeApi, TreeApi } from 'react-arborist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Delta } from 'quill';
import OfferPositionText from './offer-position-text';
import { Calculator } from 'lucide-react';
import OfferPositionArticle from './offer-position-article';
import AddBlockDialog from './add-block-dialog';
import type { BlockWithContent as DialogBlockWithContent } from './add-block-dialog';
import AddArticleDialog, { Article } from './add-article-dialog';
import articlesData from '@/data/articles.json';
import type { Language } from '@/lib/db/schema';
import { fetchBlocksWithContent, fetchLanguages } from '@/lib/api/blocks';
import type { BlockWithContent } from '@/lib/db/blocks';

const initialTreeData: MyTreeNodeData[] = initialTreeDataRaw as MyTreeNodeData[];

const InteractiveSplitPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [treeData, setTreeData] = useState<readonly MyTreeNodeData[]>(initialTreeData);
  const [selectedNode, setSelectedNode] = useState<NodeApi<MyTreeNodeData> | null>(null);
  const [formDescriptionHtml, setFormDescriptionHtml] = useState<string | undefined>(undefined);
  const [selectedNodeType, setSelectedNodeType] = useState<string | undefined>(undefined);
  const [showAddBlockDialog, setShowAddBlockDialog] = useState(false);
  const [blocks, setBlocks] = useState<BlockWithContent[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false);
  
  const treeRef = useRef<TreeApi<MyTreeNodeData>>(null);

  // Load blocks and languages on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [blocksData, languagesData] = await Promise.all([
          fetchBlocksWithContent(),
          fetchLanguages()
        ]);
        setBlocks(blocksData);
        setLanguages(languagesData);
      } catch (error) {
        console.error('Error loading blocks and languages:', error);
      }
    };
    
    loadData();
  }, []);

  // Convert database blocks to dialog format
  const dialogBlocks = useMemo(() => {
    return blocks.map((block): DialogBlockWithContent => ({
      ...block,
      content: block.blockContents?.[0] // Use first content or undefined
    }));
  }, [blocks]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSelection = () => {
    setSelectedNodeId(undefined);
    setSelectedNode(null);
    setSelectedNodeType(undefined);
    setFormDescriptionHtml(undefined);
    if (treeRef.current) {
      treeRef.current.deselectAll();
    }
  };

  const handleNodeSelect = (nodes: NodeApi<MyTreeNodeData>[]) => {
    if (nodes.length > 0) {
      const node = nodes[0];
      setSelectedNodeId(node.id);
      setSelectedNode(node);
      setSelectedNodeType(node.data.type);
      setFormDescriptionHtml(undefined);
      console.log(`Node selected: ${node.data.name}`);
    } else {
      setSelectedNodeId(undefined);
      setSelectedNode(null);
      setSelectedNodeType(undefined);
      setFormDescriptionHtml(undefined);
    }
  };

  useEffect(() => {
    if (selectedNode) {
      setFormDescriptionHtml(undefined);
    } else {
      setFormDescriptionHtml(undefined);
    }
  }, [selectedNode]);

  // Render form content
  const renderFormContent = () => {
    const htmlValue = formDescriptionHtml;
    const handleHtmlChange = (html: string | undefined) => setFormDescriptionHtml(html);
    if (selectedNodeType === 'article') {
      return (
        <OfferPositionArticle
          selectedNode={selectedNode}
          formDescriptionHtml={htmlValue}
          onDescriptionChange={handleHtmlChange}
        />
      );
    }
    if (selectedNodeType === 'textblock') {
      return (
        <OfferPositionText
          selectedNode={selectedNode}
          formDescriptionHtml={htmlValue}
          onDescriptionChange={handleHtmlChange}
        />
      );
    }
    return null;
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

  // AddBlockDialog handlers
  const handleOpenAddBlock = () => setShowAddBlockDialog(true);
  const handleCloseAddBlock = () => setShowAddBlockDialog(false);
  const handleAddBlock = (block: DialogBlockWithContent) => {
    setShowAddBlockDialog(false);
    // handle block addition logic here
  };

  // AddArticleDialog handlers
  const handleOpenAddArticle = () => setShowAddArticleDialog(true);
  const handleCloseAddArticle = () => setShowAddArticleDialog(false);
  const handleAddArticle = (article: Article) => {
    setShowAddArticleDialog(false);
    // handle article addition logic here
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 gap-2">
        <div className="flex gap-2">
          <Button tabIndex={0} aria-label="Block hinzufügen" onClick={handleOpenAddBlock}>
            Block hinzufügen
          </Button>
          <Button tabIndex={0} aria-label="Artikel hinzufügen" onClick={handleOpenAddArticle}>
            Artikel hinzufügen
          </Button>
          <Button tabIndex={0} aria-label="Element löschen" onClick={() => {}}>
            Element löschen
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right font-semibold text-lg text-gray-800 dark:text-gray-100 select-none" aria-label="Gesamtpreis nach Rabatt">
            Gesamtpreis nach Rabatt: <span className="text-green-600 dark:text-green-400">95.000&nbsp;€</span>
          </div>
          <a
            href="#"
            tabIndex={0}
            aria-label="Kalkulation öffnen"
            className="ml-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Calculator className="w-5 h-5 inline" />
          </a>
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
      <AddBlockDialog
        open={showAddBlockDialog}
        onClose={handleCloseAddBlock}
        onAdd={handleAddBlock}
        blocks={dialogBlocks}
      />
      <AddArticleDialog
        open={showAddArticleDialog}
        onClose={handleCloseAddArticle}
        onAdd={handleAddArticle}
        articles={articlesData as Article[]}
      />
    </div>
  );
};

export default InteractiveSplitPanel; 
