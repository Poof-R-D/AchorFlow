import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasNode, Connection, EditorState, EditorHistoryEntry } from '@/types/editor';

const MAX_HISTORY = 50;

export const useEditorState = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    nodes: [],
    connections: [],
    selectedNode: null,
    history: [],
    historyIndex: -1,
  });

  // Connection state for drag-to-connect
  const [connectionState, setConnectionState] = useState<{
    isConnecting: boolean;
    sourceNode: string | null;
    sourcePort: string | null;
    sourcePortType: 'input' | 'output' | null;
    tempConnection: { startX: number; startY: number; endX: number; endY: number } | null;
  }>({
    isConnecting: false,
    sourceNode: null,
    sourcePort: null,
    sourcePortType: null,
    tempConnection: null,
  });

  // Handle keyboard events for connection cancellation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectionState.isConnecting) {
        console.log('Canceling connection via ESC key');
        cancelConnection();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [connectionState.isConnecting]);

  const saveToHistory = useCallback((action: string, nodes: CanvasNode[], connections: Connection[]) => {
    const entry: EditorHistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
      timestamp: Date.now(),
      action,
    };

    setEditorState(prev => {
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry];
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const validateConnection = useCallback((sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => {
    const sourceNode = editorState.nodes.find(n => n.id === sourceNodeId);
    const targetNode = editorState.nodes.find(n => n.id === targetNodeId);
    
    if (!sourceNode || !targetNode || sourceNodeId === targetNodeId) {
      console.log('Invalid nodes or same node connection');
      return false;
    }

    const sourcePort = sourceNode.outputs.find(p => p.id === sourcePortId);
    const targetPort = targetNode.inputs.find(p => p.id === targetPortId);
    
    if (!sourcePort || !targetPort) {
      console.log('Ports not found');
      return false;
    }

    // More permissive type checking - allow 'any' type to connect to anything
    // and allow common Solana types to connect
    const compatibleTypes = ['any', 'data', 'control', 'event'];
    if (sourcePort.type !== targetPort.type && 
        !compatibleTypes.includes(sourcePort.type) && 
        !compatibleTypes.includes(targetPort.type)) {
      console.log('Incompatible types:', sourcePort.type, targetPort.type);
      return false;
    }

    const existingConnection = editorState.connections.find(
      conn => conn.sourceNodeId === sourceNodeId && 
              conn.targetNodeId === targetNodeId &&
              conn.sourcePortId === sourcePortId &&
              conn.targetPortId === targetPortId
    );

    if (existingConnection) {
      console.log('Connection already exists');
      return false;
    }

    return true;
  }, [editorState.nodes, editorState.connections]);

  const addNode = useCallback((node: CanvasNode) => {
    setEditorState(prev => {
      const newNodes = [...prev.nodes, node];
      saveToHistory('Add Node', newNodes, prev.connections);
      return {
        ...prev,
        nodes: newNodes,
      };
    });
  }, [saveToHistory]);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNode>) => {
    setEditorState(prev => {
      const newNodes = prev.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      );
      saveToHistory('Update Node', newNodes, prev.connections);
      return {
        ...prev,
        nodes: newNodes,
      };
    });
  }, [saveToHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    setEditorState(prev => {
      const newNodes = prev.nodes.filter(node => node.id !== nodeId);
      const newConnections = prev.connections.filter(
        conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      );
      saveToHistory('Delete Node', newNodes, newConnections);
      return {
        ...prev,
        nodes: newNodes,
        connections: newConnections,
        selectedNode: prev.selectedNode === nodeId ? null : prev.selectedNode,
      };
    });
  }, [saveToHistory]);

  const addConnection = useCallback((connection: Connection) => {
    if (!validateConnection(connection.sourceNodeId, connection.sourcePortId, connection.targetNodeId, connection.targetPortId)) {
      return false;
    }

    setEditorState(prev => {
      const newConnections = [...prev.connections, connection];
      saveToHistory('Add Connection', prev.nodes, newConnections);
      return {
        ...prev,
        connections: newConnections,
      };
    });
    return true;
  }, [saveToHistory, validateConnection]);

  const deleteConnection = useCallback((connectionId: string) => {
    setEditorState(prev => {
      const newConnections = prev.connections.filter(conn => conn.id !== connectionId);
      saveToHistory('Delete Connection', prev.nodes, newConnections);
      return {
        ...prev,
        connections: newConnections,
      };
    });
  }, [saveToHistory]);

  const selectNode = useCallback((nodeId: string | null) => {
    setEditorState(prev => ({ ...prev, selectedNode: nodeId }));
  }, []);

  // Connection drag methods
  const startConnection = useCallback((nodeId: string, portId: string, portType: 'input' | 'output', position: { x: number; y: number }) => {
    console.log('Starting connection:', { nodeId, portId, portType, position });
    
    // Find the node and calculate accurate port position
    const node = editorState.nodes.find(n => n.id === nodeId);
    if (!node) return;

    let startX, startY;
    const portSpacing = 35;
    const nodeHeaderHeight = 50;
    const portOffset = 15;

    if (portType === 'output') {
      const portIndex = node.outputs.findIndex(p => p.id === portId);
      startX = node.x + node.width; // Right edge of node
      startY = node.y + nodeHeaderHeight + (portIndex * portSpacing) + portOffset;
    } else {
      const portIndex = node.inputs.findIndex(p => p.id === portId);
      startX = node.x; // Left edge of node
      startY = node.y + nodeHeaderHeight + (portIndex * portSpacing) + portOffset;
    }

    setConnectionState({
      isConnecting: true,
      sourceNode: nodeId,
      sourcePort: portId,
      sourcePortType: portType,
      tempConnection: {
        startX,
        startY,
        endX: startX,
        endY: startY,
      },
    });
  }, [editorState.nodes]);

  const updateTempConnection = useCallback((position: { x: number; y: number }) => {
    setConnectionState(prev => ({
      ...prev,
      tempConnection: prev.tempConnection ? {
        ...prev.tempConnection,
        endX: position.x,
        endY: position.y,
      } : null,
    }));
  }, []);

  const completeConnection = useCallback((targetNodeId: string, targetPortId: string) => {
    console.log('Completing connection:', { targetNodeId, targetPortId, connectionState });
    
    if (!connectionState.isConnecting || !connectionState.sourceNode || !connectionState.sourcePort) {
      console.log('No active connection to complete');
      return false;
    }

    let sourceNodeId, sourcePortId, finalTargetNodeId, finalTargetPortId;

    if (connectionState.sourcePortType === 'output') {
      sourceNodeId = connectionState.sourceNode;
      sourcePortId = connectionState.sourcePort;
      finalTargetNodeId = targetNodeId;
      finalTargetPortId = targetPortId;
    } else {
      sourceNodeId = targetNodeId;
      sourcePortId = targetPortId;
      finalTargetNodeId = connectionState.sourceNode;
      finalTargetPortId = connectionState.sourcePort;
    }

    const connection: Connection = {
      id: crypto.randomUUID(),
      sourceNodeId,
      targetNodeId: finalTargetNodeId,
      sourcePortId,
      targetPortId: finalTargetPortId,
    };

    const success = addConnection(connection);
    
    setConnectionState({
      isConnecting: false,
      sourceNode: null,
      sourcePort: null,
      sourcePortType: null,
      tempConnection: null,
    });

    return success;
  }, [connectionState, addConnection]);

  const cancelConnection = useCallback(() => {
    console.log('Canceling connection');
    setConnectionState({
      isConnecting: false,
      sourceNode: null,
      sourcePort: null,
      sourcePortType: null,
      tempConnection: null,
    });
  }, []);

  const undo = useCallback(() => {
    setEditorState(prev => {
      if (prev.historyIndex > 0) {
        const prevEntry = prev.history[prev.historyIndex - 1];
        return {
          ...prev,
          nodes: prevEntry.nodes,
          connections: prevEntry.connections,
          historyIndex: prev.historyIndex - 1,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setEditorState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const nextEntry = prev.history[prev.historyIndex + 1];
        return {
          ...prev,
          nodes: nextEntry.nodes,
          connections: nextEntry.connections,
          historyIndex: prev.historyIndex + 1,
        };
      }
      return prev;
    });
  }, []);

  const clearCanvas = useCallback(() => {
    setEditorState(prev => {
      saveToHistory('Clear Canvas', [], []);
      return {
        ...prev,
        nodes: [],
        connections: [],
        selectedNode: null,
      };
    });
    setConnectionState({
      isConnecting: false,
      sourceNode: null,
      sourcePort: null,
      sourcePortType: null,
      tempConnection: null,
    });
  }, [saveToHistory]);

  return {
    ...editorState,
    connectionState,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    startConnection,
    updateTempConnection,
    completeConnection,
    cancelConnection,
    validateConnection,
    undo,
    redo,
    clearCanvas,
    canUndo: editorState.historyIndex > 0,
    canRedo: editorState.historyIndex < editorState.history.length - 1,
  };
};
