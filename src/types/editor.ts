
export interface Port {
  id: string;
  name: string;
  type: string;
}

export interface CanvasNode {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon?: React.ReactElement;
  inputs: Port[];
  outputs: Port[];
  aiGenerated?: boolean;
  description?: string;
  code?: string;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortId: string;
  targetPortId: string;
}

export interface EditorState {
  nodes: CanvasNode[];
  connections: Connection[];
  selectedNode: string | null;
  history: EditorHistoryEntry[];
  historyIndex: number;
}

export interface EditorHistoryEntry {
  nodes: CanvasNode[];
  connections: Connection[];
  timestamp: number;
  action: string;
}

export interface DragState {
  isDragging: boolean;
  draggedNode: string | null;
  offset: { x: number; y: number };
}
