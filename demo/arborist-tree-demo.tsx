"use client"; // Required for useState, useEffect, and event handlers

import React, { useState, useRef } from 'react';
import { ArboristTree, ArboristTreeProps } from '../project_components/arborist-tree';
import { CustomNode, MyTreeNodeData, createCustomNodeWithDragState } from '../project_components/custom-node';
import initialTreeData from '@/data/tree-data.json'; // Using Next.js alias for /data
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TreeApi } from 'react-arborist';

const ArboristTreeDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [treeData, setTreeData] = useState<readonly MyTreeNodeData[]>(initialTreeData as readonly MyTreeNodeData[]);
  
  // Ref for accessing TreeApi methods
  const treeRef = useRef<TreeApi<MyTreeNodeData>>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSetSelection = () => {
    // Example: Select node "c2" (Zufällig)
    setSelectedNodeId("c2"); 
  };

  const handleClearSelection = () => {
    setSelectedNodeId(undefined);
    if (treeRef.current) {
      treeRef.current.deselectAll();
    }
  };
  
  const handleFocusRandomNode = () => {
    if (treeRef.current && treeData.length > 0) {
      const allNodes = treeRef.current.visibleNodes;
      if (allNodes.length > 0) {
        const randomIndex = Math.floor(Math.random() * allNodes.length);
        const randomNodeId = allNodes[randomIndex].id;
        if (randomNodeId) {
           // Adjusted focus option based on linter feedback
           treeRef.current.focus(randomNodeId, { scroll: true }); 
           setSelectedNodeId(randomNodeId);
        }
      }
    }
  };

  // Example of handling data modifications (for controlled tree)
  // For this demo, we'll keep it simple with initialData, but these are how you'd handle it:
  const handleCreate: ArboristTreeProps<MyTreeNodeData>['onCreate'] = ({ parentId, index, type }) => {
    const newNodeName = window.prompt("Geben Sie den Namen des neuen Knotens ein:") || "Neuer Knoten";
    const newNode: MyTreeNodeData = { 
      id: String(Math.random().toString(36).substring(2, 9)), 
      name: newNodeName,
      children: type === 'internal' ? [] : undefined,
    };
    // Here you would update your state (e.g., treeData)
    // This is a simplified example; a real implementation needs to traverse and update the data structure.
    alert(`Erstellen: Eltern-ID: ${parentId}, Index: ${index}, Typ: ${type}, Neuer Knoten: ${JSON.stringify(newNode)}`);
    // setTreeData(prevData => updateTreeDataWithNewNode(prevData, parentId, index, newNode));
    return newNode; // Required for react-arborist to update its internal state if using initialData with handlers
  };

  const handleRename: ArboristTreeProps<MyTreeNodeData>['onRename'] = ({ id, name, node }) => {
    alert(`Umbenennen: ID: ${id}, Neuer Name: ${name}`);
    // Here you would update your state
    // setTreeData(prevData => updateTreeDataWithRenamedNode(prevData, id, name));
    node.data.name = name; // Mutate directly for demo if it's reflected by react-arborist
  };

  const handleDelete: ArboristTreeProps<MyTreeNodeData>['onDelete'] = ({ ids }) => {
    alert(`Löschen: IDs: ${ids.join(', ')}`);
    // Here you would update your state
    // setTreeData(prevData => removeNodesFromTreeData(prevData, ids));
  };


  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-center">React Arborist Demo</h1>
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Baum durchsuchen..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleSetSelection}>Wähle &quot;Zufällig&quot; aus</Button>
        <Button onClick={handleClearSelection} variant="outline">Auswahl aufheben</Button>
        <Button onClick={handleFocusRandomNode} variant="outline">Zufälligen Knoten fokussieren</Button>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden h-[600px] bg-white dark:bg-gray-800">
        <ArboristTree<MyTreeNodeData>
          ref={treeRef}
          initialData={treeData} // Using initialData for uncontrolled state with internal modifications
          // For a fully controlled tree, use `data={treeData}` and implement all handlers to update `treeData`
          // onCreate={handleCreate} // Enable if you want to try create (prompts user)
          // onRename={handleRename} // Enable for rename
          // onDelete={handleDelete} // Enable for delete (default key: Backspace/Delete)
          openByDefault={false}
          width="100%" // Dynamic width
          height={600}    // Fixed height for the container
          indent={24}
          rowHeight={36}
          searchTerm={searchTerm}
          searchMatch={(node, term) =>
            node.data.name.toLowerCase().includes(term.toLowerCase())
          }
          selection={selectedNodeId} // Controlled selection
          onSelect={(nodes) => {
            // If you want to update selectedNodeId when user selects manually
            if (nodes.length > 0) {
              setSelectedNodeId(nodes[0].id);
            } else {
              setSelectedNodeId(undefined);
            }
          }}
          onActivate={(node) => console.log('Knoten aktiviert:', node)}
          // For the custom node renderer:
        >
          {createCustomNodeWithDragState(false)}
        </ArboristTree>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Hinweis: Drag & Drop, Umbenennen (Doppelklick oder Enter) und Löschen (Entf/Rücktaste) sind Standardfunktionen.
        Für eine vollständig kontrollierte Datenverwaltung müssten die Handler `onCreate`, `onMove`, `onRename`, `onDelete` implementiert werden, um den `treeData`-Status zu aktualisieren.
      </p>
    </div>
  );
};

export default ArboristTreeDemo; 