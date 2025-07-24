"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback, useImperativeHandle } from 'react';
import { ArboristTree } from './arborist-tree';
import { MyTreeNodeData, createCustomNodeWithDragState } from './custom-node';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NodeApi, TreeApi, MoveHandler } from 'react-arborist';
import OfferPositionText from './offer-position-text';
import { Calculator } from 'lucide-react';
import OfferPositionArticle from './offer-position-article';
import AddBlockDialog from './add-block-dialog';
import type { BlockWithContent as DialogBlockWithContent } from './add-block-dialog';
import AddArticleDialog from './add-article-dialog';
import type { Article } from './add-article-dialog';
import type { Language } from '@/lib/db/schema';
import { fetchBlocksWithContent, fetchLanguages } from '@/lib/api/blocks';
import type { BlockWithContent } from '@/lib/db/blocks';
import { toast } from 'sonner';


interface InteractiveSplitPanelProps {
  initialTreeData?: MyTreeNodeData[];
  isEditing?: boolean;
  versionId?: string;
  onTreeDataChange?: (newTreeData: MyTreeNodeData[]) => void;
  hasUnsavedChanges?: boolean;
  addChange?: (positionId: string, field: string, oldValue: any, newValue: any) => void;
  removeChange?: (positionId: string, field?: string) => void;
  hasPositionChanges?: (positionId: string) => boolean;
  getPositionChanges?: (positionId: string) => { [field: string]: { oldValue: any; newValue: any } };
  onRefreshRequested?: () => void;
  languageId?: string;
}

const InteractiveSplitPanel: React.FC<InteractiveSplitPanelProps> = ({ 
  initialTreeData = [],
  isEditing = false,
  versionId,
  onTreeDataChange,
  hasUnsavedChanges = false,
  addChange,
  removeChange,
  hasPositionChanges,
  getPositionChanges,
  onRefreshRequested,
  languageId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [treeData, setTreeData] = useState<readonly MyTreeNodeData[]>(initialTreeData);
  const [selectedNode, setSelectedNode] = useState<NodeApi<MyTreeNodeData> | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string | undefined>(undefined);
  const [showAddBlockDialog, setShowAddBlockDialog] = useState(false);
  const [blocks, setBlocks] = useState<BlockWithContent[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false);
  
  const treeRef = useRef<TreeApi<MyTreeNodeData>>(null);
  


  // Update tree data when initialTreeData prop changes
  useEffect(() => {
    setTreeData(initialTreeData);
  }, [initialTreeData]);

  // Memoized helper functions to prevent recreation on every render
  const findNodeById = useCallback((nodes: readonly MyTreeNodeData[], id: string): MyTreeNodeData | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);



  // Load blocks and languages function
  const loadData = useCallback(async () => {
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
  }, []);

  // Load blocks and languages on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Convert database blocks to dialog format
  const dialogBlocks = useMemo(() => {
    return blocks.map((block): DialogBlockWithContent => ({
      ...block,
      content: block.blockContents?.[0] // Use first content or undefined
    }));
  }, [blocks]);

  const getNodeDepth = useCallback((nodes: readonly MyTreeNodeData[], targetId: string, currentDepth: number = 1): number => {
    for (const node of nodes) {
      if (node.id === targetId) return currentDepth;
      if (node.children) {
        const depth = getNodeDepth(node.children, targetId, currentDepth + 1);
        if (depth > 0) return depth;
      }
    }
    return 0;
  }, []);

  // Optimized deep clone function
  const deepClone = useCallback((obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }, []);

  // Handle drag and drop reordering
  const handleMove: MoveHandler<MyTreeNodeData> = useCallback(async ({ dragIds, parentId, index }) => {
    if (!versionId || !isEditing) return;
    
    try {
      // Business rule validation before the move
      for (const dragId of dragIds) {
        const dragNode = findNodeById(treeData, dragId);
        if (!dragNode) continue;
        
        // Check if dragging into an article (articles can't have children)
        if (parentId) {
          const parentNode = findNodeById(treeData, parentId);
          if (parentNode?.type === 'article') {
            throw new Error('Artikel können keine Kinder haben');
          }
        }
        
        // Check nesting depth (max 4 levels)
        const newDepth = parentId ? getNodeDepth(treeData, parentId) + 1 : 1;
        if (newDepth > 4) {
          throw new Error('Maximale Verschachtelungstiefe von 4 Ebenen überschritten');
        }
      }
      
      // Apply the move operation to update treeData (controlled mode)
      const newTreeData = deepClone(treeData) as MyTreeNodeData[];
      
      // Helper function to remove nodes from their current locations
      const removeNodesFromTree = (nodes: MyTreeNodeData[], idsToRemove: string[]): MyTreeNodeData[] => {
        return nodes.filter(node => {
          if (idsToRemove.includes(node.id)) {
            return false;
          }
          if (node.children) {
            node.children = removeNodesFromTree(node.children, idsToRemove);
          }
          return true;
        });
      };
      
      // Helper function to find nodes by IDs
      const findNodesByIds = (nodes: MyTreeNodeData[], ids: string[]): MyTreeNodeData[] => {
        const foundNodes: MyTreeNodeData[] = [];
        const findInNodes = (nodeList: MyTreeNodeData[]) => {
          nodeList.forEach(node => {
            if (ids.includes(node.id)) {
              foundNodes.push(deepClone(node));
            }
            if (node.children) {
              findInNodes(node.children);
            }
          });
        };
        findInNodes(nodes);
        return foundNodes;
      };
      
      // Helper function to find a node by ID and add children to it
      const addChildrenToNode = (nodes: MyTreeNodeData[], targetId: string, childrenToAdd: MyTreeNodeData[], insertIndex: number) => {
        nodes.forEach(node => {
          if (node.id === targetId) {
            if (!node.children) {
              node.children = [];
            }
            node.children.splice(insertIndex, 0, ...childrenToAdd);
          } else if (node.children) {
            addChildrenToNode(node.children, targetId, childrenToAdd, insertIndex);
          }
        });
      };
      
      // Find the nodes being moved
      const draggedNodes = findNodesByIds(newTreeData, dragIds);
      
      // Remove dragged nodes from their current locations
      const treeWithoutDraggedNodes = removeNodesFromTree(newTreeData, dragIds);
      
      // Add dragged nodes to their new location
      if (parentId) {
        // Moving to a parent node
        addChildrenToNode(treeWithoutDraggedNodes, parentId, draggedNodes, index);
      } else {
        // Moving to root level
        treeWithoutDraggedNodes.splice(index, 0, ...draggedNodes);
      }
      
      // Update the tree data state immediately (controlled mode)
      setTreeData(treeWithoutDraggedNodes);
      onTreeDataChange?.(treeWithoutDraggedNodes);
      
      // Update positions in the database (background operation)
      const positionUpdates: Array<{
        id: string;
        positionNumber: number;
        quotePositionParentId: string | null;
      }> = [];
      
      // Helper function to collect all nodes with their new positions
      const collectPositions = (nodes: readonly MyTreeNodeData[], parentId: string | null = null, startIndex: number = 1) => {
        nodes.forEach((node, index) => {
          positionUpdates.push({
            id: node.id,
            positionNumber: startIndex + index,
            quotePositionParentId: parentId,
          });
          
          // Recursively collect child positions
          if (node.children && node.children.length > 0) {
            collectPositions(node.children, node.id, 1);
          }
        });
      };
      
      // Collect all positions after the move
      collectPositions(treeWithoutDraggedNodes);
      
      // Update positions in the database (async)
      try {
        const response = await fetch(`/api/quotes/versions/${versionId}/positions/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ positions: positionUpdates }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update positions');
        }
      } catch (error) {
        console.error('Error updating positions in database:', error);
        toast.error('Fehler beim Aktualisieren der Positionen in der Datenbank');
        // Note: We don't revert the UI change here as the user sees immediate feedback
        // In a production app, you might want to implement retry logic or show a retry button
      }
      
    } catch (error) {
      console.error('Error during drag and drop:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Verschieben');
      // Prevent the move by throwing an error
      throw error;
    }
  }, [versionId, isEditing, treeData, findNodeById, getNodeDepth, deepClone, onTreeDataChange]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(undefined);
    setSelectedNode(null);
    setSelectedNodeType(undefined);
    // setFormDescriptionHtml(undefined); // This line is removed
    if (treeRef.current) {
      treeRef.current.deselectAll();
    }
  }, []);

  const handleNodeSelect = useCallback((nodes: NodeApi<MyTreeNodeData>[]) => {
    if (nodes.length > 0) {
      const node = nodes[0];
      setSelectedNodeId(node.id);
      setSelectedNode(node);
      setSelectedNodeType(node.data.type);
      // Load the node's description content
      // setFormDescriptionHtml(node.data.description || ''); // This line is removed
    } else {
      setSelectedNodeId(undefined);
      setSelectedNode(null);
      setSelectedNodeType(undefined);
      // setFormDescriptionHtml(undefined); // This line is removed
    }
  }, []);

  // Memoized form content renderer to prevent unnecessary re-renders
  const renderFormContent = useCallback(() => {
    // Get current node data from treeData instead of using selectedNode
    const currentNodeData = selectedNodeId ? findNodeById(treeData, selectedNodeId) : null;
    
    // Create updated selectedNode with fresh data
    const updatedSelectedNode = currentNodeData && selectedNode ? {
      ...selectedNode,
      data: currentNodeData
    } as NodeApi<MyTreeNodeData> : selectedNode;
    
    if (selectedNodeType === 'article') {
      return (
        <OfferPositionArticle
          key={`article-${selectedNodeId}`} // Add key to force re-mount when node changes
          selectedNode={updatedSelectedNode}
          isEditing={isEditing}
          positionId={selectedNodeId}
          hasPositionChanges={hasPositionChanges}
          addChange={addChange}
          removeChange={removeChange}
          getPositionChanges={getPositionChanges}
        />
      );
    }
    if (selectedNodeType === 'textblock') {
      return (
        <OfferPositionText
          key={`textblock-${selectedNodeId}`} // Add key to force re-mount when node changes
          selectedNode={updatedSelectedNode}
          isEditing={isEditing}
          positionId={selectedNodeId}
          hasPositionChanges={hasPositionChanges}
          addChange={addChange}
          removeChange={removeChange}
          getPositionChanges={getPositionChanges}
        />
      );
    }
    return null;
  }, [selectedNodeType, selectedNodeId, selectedNode, treeData, findNodeById, isEditing, hasPositionChanges, addChange, removeChange, getPositionChanges]);

  // Memoized right panel content
  const renderRightPanel = useCallback(() => {
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
  }, [selectedNode, renderFormContent]);

  // AddBlockDialog handlers
  const handleOpenAddBlock = useCallback(() => {
    console.log('Opening AddBlockDialog with selectedNodeId:', selectedNodeId);
    setShowAddBlockDialog(true);
  }, [selectedNodeId]);
  const handleCloseAddBlock = useCallback(() => setShowAddBlockDialog(false), []);
  const handleAddBlock = useCallback((block: DialogBlockWithContent) => {
    setShowAddBlockDialog(false);
    // handle block addition logic here
  }, []);

  // Handle position creation from AddBlockDialog
  const handlePositionCreated = useCallback(async (newPositionId: string) => {
    try {
      // Request parent to refresh data
      if (onRefreshRequested) {
        onRefreshRequested();
      }
      
      // Select the newly created position
      setSelectedNodeId(newPositionId);
      
      // Show success message
      toast.success('Block erfolgreich hinzugefügt und ausgewählt');
    } catch (error) {
      console.error('Error handling position creation:', error);
      toast.error('Fehler beim Aktualisieren der Daten');
    }
  }, [onRefreshRequested]);

  // AddArticleDialog handlers
  const handleOpenAddArticle = useCallback(() => setShowAddArticleDialog(true), []);
  const handleCloseAddArticle = useCallback(() => setShowAddArticleDialog(false), []);
  const handleAddArticle = useCallback((article: Article) => {
    setShowAddArticleDialog(false);
    // TODO: Implement article addition logic similar to block addition
    console.log('Adding article:', article);
    toast.info('Artikel-Hinzufügen-Funktion wird implementiert');
  }, []);

  // Memoized custom node renderer
  const customNodeRenderer = useMemo(() => createCustomNodeWithDragState(isEditing, hasPositionChanges), [isEditing, hasPositionChanges]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 gap-2">
        <div className="flex gap-2">
          {isEditing && (
            <>
              <Button tabIndex={0} aria-label="Block hinzufügen" onClick={handleOpenAddBlock}>
                Block hinzufügen
              </Button>
              <Button tabIndex={0} aria-label="Artikel hinzufügen" onClick={handleOpenAddArticle}>
                Artikel hinzufügen
              </Button>
              <Button tabIndex={0} aria-label="Element löschen" onClick={() => {}}>
                Element löschen
              </Button>
            </>
          )}
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
              data={treeData}
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
              onMove={handleMove}
              disableDrag={!isEditing}
              disableDrop={!isEditing}
            >
              {customNodeRenderer}
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
        versionId={versionId}
        selectedNodeId={selectedNodeId}
        onPositionCreated={handlePositionCreated}
      />
      <AddArticleDialog
        open={showAddArticleDialog}
        onClose={handleCloseAddArticle}
        onAdd={handleAddArticle}
        languageId={languageId}
        versionId={versionId}
        selectedNodeId={selectedNodeId}
        onPositionCreated={handlePositionCreated}
      />
    </div>
  );
};

export default InteractiveSplitPanel; 
