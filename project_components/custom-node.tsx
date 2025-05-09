import React from 'react';
import { NodeRendererProps, NodeApi } from 'react-arborist';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react'; // Using lucide-react for icons

// Define a type for your tree data items if not already globally defined
// This should match the structure in your tree-data.json
export interface MyTreeNodeData {
  id: string;
  name: string;
  children?: MyTreeNodeData[];
}

// Extend NodeApi with your specific data type for better type safety in the renderer
interface MyCustomNodeApi extends NodeApi<MyTreeNodeData> {}
interface CustomNodeRendererProps extends NodeRendererProps<MyTreeNodeData> {
  node: MyCustomNodeApi; // Override node with more specific type
}

export const CustomNode: React.FC<CustomNodeRendererProps> = ({
  node,
  style,
  dragHandle,
  tree,
}) => {
  const isInternal = node.isInternal;
  const isLeaf = node.isLeaf;

  const handleToggle = () => {
    if (isInternal) {
      node.toggle();
    }
  };

  // Accessibility: Allow expand/collapse with Enter/Space
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
        node.isSelected ? 'bg-blue-100 dark:bg-blue-800' : ''
      } ${
        node.isEditing ? 'outline outline-blue-500' : ''
      }`}
      onClick={handleToggle} // Toggle on click for internal nodes
      onKeyDown={handleKeyDown} // Accessibility for keyboard toggle
      tabIndex={0} // Make it focusable
      aria-label={node.data.name}
      aria-expanded={isInternal ? node.isOpen : undefined}
      role="treeitem"
    >
      <span className="mr-1">
        {isInternal ? (
          node.isOpen ? (
            <ChevronDown size={16} className="text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500" />
          )
        ) : (
          <FileText size={16} className="text-gray-500" /> // Icon for leaf nodes
        )}
      </span>
      {isInternal && <Folder size={16} className="mr-1 text-yellow-500" />}{' '}
      {/* Folder icon for internal nodes */}
      <span className={node.isEditing ? 'opacity-50' : ''}>
        {node.data.name}
      </span>
      {/* Basic edit state indication (actual input is handled by react-arborist) */}
      {node.isEditing && (
        <span className="ml-2 text-xs text-blue-600">(Bearbeitung...)</span>
      )}
    </div>
  );
}; 