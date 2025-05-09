import React, { ElementType, ForwardedRef, forwardRef } from 'react';
import {
  Tree as ReactArboristTree,
  NodeApi,
  NodeRendererProps,
  RowRendererProps,
  DragPreviewProps,
  CursorProps,
  CreateHandler,
  MoveHandler,
  RenameHandler,
  DeleteHandler,
  TreeApi,
  // Assuming ListOnScrollProps might be specific and not directly exported or standard
  // react-arborist docs mention onScroll?: (props: ListOnScrollProps) => void;
} from 'react-arborist';

// For NodeBoolFunc, disableEdit/disableDrag. (node: NodeApi<TData>) => boolean is common.
type NodeBoolFunc<TData> = (node: NodeApi<TData>) => boolean;

// For disableDrop
type DisableDropFuncArgs<TData> = {
  parentNode: NodeApi<TData>;
  dragNodes: NodeApi<TData>[];
  index: number;
};
type DisableDropFunc<TData> = (args: DisableDropFuncArgs<TData>) => boolean;

// For searchMatch
type SearchMatchFunc<TData> = (node: NodeApi<TData>, searchTerm: string) => boolean;

// Using a placeholder for ListOnScrollProps.
// The actual type from react-arborist should be used if known/exported.
interface CustomListOnScrollProps {
  scrollDirection: 'forward' | 'backward';
  scrollOffset: number;
  scrollUpdateWasRequested: boolean;
  clientHeight: number;
  scrollHeight: number;
  scrollWidth: number;
}

// For disableEdit and disableDrag, the callback likely receives the data item TData.
type ItemBoolFunc<TData> = (dataItem: TData) => boolean;

export interface ArboristTreeProps<TData> {
  data?: readonly TData[];
  initialData?: readonly TData[];
  onCreate?: CreateHandler<TData>;
  onMove?: MoveHandler<TData>;
  onRename?: RenameHandler<TData>;
  onDelete?: DeleteHandler<TData>;
  children?: ElementType<NodeRendererProps<TData>>;
  renderRow?: ElementType<RowRendererProps<TData>>;
  renderDragPreview?: ElementType<DragPreviewProps>;
  renderCursor?: ElementType<CursorProps>;
  renderContainer?: ElementType<any>;
  rowHeight?: number;
  overscanCount?: number;
  width?: number | string;
  height?: number;
  indent?: number;
  paddingTop?: number;
  paddingBottom?: number;
  padding?: number;
  childrenAccessor?: string | ((d: TData) => TData[] | null);
  idAccessor?: string | ((d: TData) => string);
  openByDefault?: boolean;
  selectionFollowsFocus?: boolean;
  disableMultiSelection?: boolean;
  disableEdit?: string | boolean | ItemBoolFunc<TData>;
  disableDrag?: string | boolean | ItemBoolFunc<TData>;
  disableDrop?: string | boolean | DisableDropFunc<TData>;
  onActivate?: (node: NodeApi<TData>) => void;
  onSelect?: (nodes: NodeApi<TData>[]) => void;
  onScroll?: (props: CustomListOnScrollProps) => void;
  onToggle?: (id: string) => void;
  onFocus?: (node: NodeApi<TData>) => void;
  selection?: string;
  initialOpenState?: Record<string, boolean>; // OpenMap
  searchTerm?: string;
  searchMatch?: SearchMatchFunc<TData>;
  className?: string;
  rowClassName?: string;
  dndRootElement?: globalThis.Node | null;
  onClick?: React.MouseEventHandler;
  onContextMenu?: React.MouseEventHandler;
  // dndManager?: DragDropManager; // Removed for now to simplify dnd-core dependency issue
}

const ArboristTreeComponent = <TData extends {}>( // Generic constraint TData can be basic {} or more specific if needed
  props: ArboristTreeProps<TData>,
  ref: ForwardedRef<TreeApi<TData> | null | undefined> // Adjusted ref type
) => {
  return <ReactArboristTree<TData> {...props} ref={ref} />;
};

export const ArboristTree = forwardRef(ArboristTreeComponent) as <TData extends {}>( // Generic constraint TData
  props: ArboristTreeProps<TData> & { ref?: ForwardedRef<TreeApi<TData> | null | undefined> } // Adjusted ref type
) => ReturnType<typeof ArboristTreeComponent>;

// Note: The 'ref' type to access TreeApi instance should ideally be `TreeApi<T>`.
// If `TreeApi` is not directly exportable from 'react-arborist', using `any` or `unknown` is a fallback.
// Check 'react-arborist' exports for `TreeApi` type for better type safety on the ref. 