import React from 'react';
import { NodeRendererProps, NodeApi } from 'react-arborist';
import { ChevronRight, ChevronDown, FileText, FileStack, Folder, GripVertical, Circle } from 'lucide-react';

// Define a type for your tree data items if not already globally defined
// This should match the structure in your tree-data.json
export interface MyTreeNodeData {
  id: string;
  name: string;
  type?: 'textblock' | 'article';
  description?: string;
  title?: string;
  calculationNote?: string;
  quantity?: string;
  unitPrice?: string | null;
  isOption?: boolean;
  pageBreakAbove?: boolean;
  children?: MyTreeNodeData[];
}

// Extend NodeApi with your specific data type for better type safety in the renderer
interface MyCustomNodeApi extends NodeApi<MyTreeNodeData> {}
interface CustomNodeRendererProps extends NodeRendererProps<MyTreeNodeData> {
  node: MyCustomNodeApi; // Override node with more specific type
  isDragEnabled?: boolean; // Optional prop to indicate if dragging is enabled
  hasPositionChanges?: (positionId: string) => boolean; // Function to check if position has changes
}

export const CustomNode: React.FC<CustomNodeRendererProps> = ({
  node,
  style,
  dragHandle,
  tree,
  isDragEnabled = false,
  hasPositionChanges,
}) => {
  const isInternal = node.isInternal;
  const isLeaf = node.isLeaf;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
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

  // Icon logic for leaf nodes
  const renderLeafIcon = () => {
    if (node.data.type === 'article') return <FileStack size={16} className="text-gray-500" />;
    return <FileText size={16} className="text-gray-500" />;
  };

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isDragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        node.isSelected ? 'bg-blue-100 dark:bg-blue-800' : ''
      } ${
        node.isEditing ? 'outline outline-blue-500' : ''
      }`}
      onClick={handleToggle} // Toggle on click for internal nodes
      onKeyDown={handleKeyDown} // Accessibility for keyboard toggle
      tabIndex={0} // Make it focusable
      aria-label={node.data.name}
      aria-expanded={hasChildren ? node.isOpen : undefined}
      role="treeitem"
    >
      {/* Drag handle grip - only show when drag is enabled */}
      {isDragEnabled && (
        <GripVertical 
          size={14} 
          className="text-gray-400 mr-1 flex-shrink-0 hover:text-gray-600 transition-colors" 
          aria-label="Drag handle"
        />
      )}
      
      <span className="mr-1">
        {hasChildren ? (
          node.isOpen ? (
            <ChevronDown size={16} className="text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500" />
          )
        ) : (
          renderLeafIcon()
        )}
      </span>
      {hasChildren && <Folder size={16} className="mr-1 text-yellow-500" />}{' '}
      {/* Folder icon for nodes with children */}
      <span className={node.isEditing ? 'opacity-50' : ''}>
        {node.data.name}
      </span>
      {/* Change indicator - show orange dot if position has unsaved changes */}
      {hasPositionChanges && hasPositionChanges(node.id) && (
        <Circle className="w-3 h-3 text-orange-500 fill-current ml-2" />
      )}
      {/* Basic edit state indication (actual input is handled by react-arborist) */}
      {node.isEditing && (
        <span className="ml-2 text-xs text-blue-600">(Bearbeitung...)</span>
      )}
    </div>
  );
};

// Higher-order component to create a CustomNode with drag state
export const createCustomNodeWithDragState = (isDragEnabled: boolean, hasPositionChanges?: (positionId: string) => boolean) => {
  const CustomNodeWithDragState = (props: NodeRendererProps<MyTreeNodeData>) => (
    <CustomNode {...props} isDragEnabled={isDragEnabled} hasPositionChanges={hasPositionChanges} />
  );
  
  CustomNodeWithDragState.displayName = `CustomNodeWithDragState(${isDragEnabled})`;
  
  return CustomNodeWithDragState;
}; 