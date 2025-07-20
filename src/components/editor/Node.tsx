import React, { useState, useRef } from 'react';
import { CanvasNode } from '@/types/editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Grip, Settings, Circle, Code } from 'lucide-react';
import ModuleConfigPanel from './ModuleConfigPanel';

interface NodeProps {
  node: CanvasNode;
  isSelected: boolean;
  onNameChange: (nodeId: string, newName: string) => void;
  onPositionChange: (nodeId: string, x: number, y: number) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<CanvasNode>) => void;
  onStartConnection: (nodeId: string, portId: string, portType: 'input' | 'output', position: { x: number; y: number }) => void;
  onCompleteConnection: (nodeId: string, portId: string) => boolean;
  onCancelConnection: () => void;
  connectionState: {
    isConnecting: boolean;
    sourceNode: string | null;
    sourcePort: string | null;
    sourcePortType: 'input' | 'output' | null;
  };
  validateConnection: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => boolean;
  connections: any[];
}

export const Node = ({ 
  node, 
  isSelected,
  onNameChange, 
  onPositionChange, 
  onDelete,
  onUpdate,
  onStartConnection,
  onCompleteConnection,
  onCancelConnection,
  connectionState = {
    isConnecting: false,
    sourceNode: null,
    sourcePort: null,
    sourcePortType: null
  },
  validateConnection,
  connections = []
}: NodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the node body, not ports or buttons
    const target = e.target as HTMLElement;
    if (target.closest('.port') || target.closest('button') || target.closest('input')) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, e.clientX - dragStart.x);
    const newY = Math.max(0, e.clientY - dragStart.y);
    
    onPositionChange(node.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handlePortMouseDown = (portId: string, portType: 'input' | 'output', e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Port clicked:', { nodeId: node.id, portId, portType, connectionState });
    
    if (connectionState && connectionState.isConnecting) {
      // Try to complete connection
      console.log('Attempting to complete connection');
      const success = onCompleteConnection(node.id, portId);
      if (!success) {
        console.log('Connection failed, canceling');
        onCancelConnection();
      }
    } else {
      // Start new connection
      console.log('Starting new connection');
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      onStartConnection(node.id, portId, portType, position);
    }
  };

  const getNodeGradient = () => {
    return node.color || (node.type === 'instruction' 
      ? 'from-blue-500 to-blue-600' 
      : 'from-green-500 to-green-600');
  };

  const getPortColor = (portId: string, portType: 'input' | 'output') => {
    if (connectionState && connectionState.isConnecting) {
      // Highlight source port with pulsing animation
      if (connectionState.sourceNode === node.id && connectionState.sourcePort === portId) {
        return 'bg-yellow-400 border-yellow-300 ring-4 ring-yellow-200 animate-pulse shadow-lg scale-125 transition-all duration-200';
      }
      
      // Check if this port can accept the connection
      if (connectionState.sourceNode && connectionState.sourcePort && connectionState.sourcePortType !== portType) {
        const canConnect = connectionState.sourcePortType === 'output' 
          ? validateConnection(connectionState.sourceNode, connectionState.sourcePort, node.id, portId)
          : validateConnection(node.id, portId, connectionState.sourceNode, connectionState.sourcePort);
        
        if (canConnect) {
          return 'bg-green-400 border-green-300 hover:bg-green-500 ring-3 ring-green-200 animate-pulse shadow-md scale-110 cursor-pointer transition-all duration-200';
        } else {
          return 'bg-red-400 border-red-300 opacity-50 cursor-not-allowed scale-90 transition-all duration-200';
        }
      }
      
      // Dim non-compatible port types during connection
      if (connectionState.sourcePortType && connectionState.sourcePortType === portType) {
        return portType === 'input' 
          ? 'bg-orange-300 border-orange-200 opacity-60 scale-90 transition-all duration-200' 
          : 'bg-blue-300 border-blue-200 opacity-60 scale-90 transition-all duration-200';
      }
    }
    
    // Default port colors with enhanced styling
    return portType === 'input' 
      ? 'bg-orange-400 border-orange-300 hover:bg-orange-500 hover:scale-110 transition-all duration-200 shadow-sm' 
      : 'bg-blue-400 border-blue-300 hover:bg-blue-500 hover:scale-110 transition-all duration-200 shadow-sm';
  };

  const getPortTooltip = (port: any, portType: 'input' | 'output') => {
    if (connectionState && connectionState.isConnecting) {
      if (connectionState.sourceNode === node.id && connectionState.sourcePort === port.id) {
        return 'Source port - drag to connect';
      }
      
      if (connectionState.sourceNode && connectionState.sourcePort && connectionState.sourcePortType !== portType) {
        const canConnect = connectionState.sourcePortType === 'output' 
          ? validateConnection(connectionState.sourceNode, connectionState.sourcePort, node.id, port.id)
          : validateConnection(node.id, port.id, connectionState.sourceNode, connectionState.sourcePort);
        
        if (canConnect) {
          return `Click to connect to ${port.name} (${port.type})`;
        } else {
          return `Cannot connect - incompatible types`;
        }
      }
    }
    
    return `${port.name} (${port.type}) - ${portType === 'input' ? 'receives' : 'sends'} data`;
  };

  const isConfigured = node.code && node.code !== '';
  const connectedCount = connections.filter(
    conn => conn.sourceNodeId === node.id || conn.targetNodeId === node.id
  ).length;

  return (
    <>
      <div
        ref={nodeRef}
        className={`absolute select-none cursor-move ${isDragging ? 'z-50' : 'z-10'} ${
          isSelected ? 'ring-2 ring-blue-400' : ''
        } ${connectionState.isConnecting ? 'transition-all duration-300' : ''}`}
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          minHeight: node.height,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={`w-full h-full bg-gradient-to-br ${getNodeGradient()} rounded-lg border-2 ${
          isSelected ? 'border-blue-400' : 'border-white/20'
        } shadow-lg backdrop-blur-sm relative ${
          connectionState.isConnecting ? 'shadow-xl transform-gpu' : ''
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <Grip className="h-4 w-4 text-white/70" />
              <span className="text-white text-sm font-medium truncate max-w-[120px]">
                {node.name}
              </span>
              {isConfigured && (
                <div title="Configured">
                  <Code className="h-3 w-3 text-green-300" />
                </div>
              )}
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfigPanel(true);
                }}
                title="Configure Module"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            {isEditing ? (
              <form onSubmit={handleNameSubmit} className="mb-2">
                <Input
                  value={node.name}
                  onChange={(e) => onNameChange(node.id, e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="text-black text-sm h-7"
                  autoFocus
                />
              </form>
            ) : (
              <div
                className="text-white text-sm font-medium cursor-pointer mb-2 hover:text-white/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                {node.name}
              </div>
            )}
            
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span className="capitalize">{node.type}</span>
              {connectedCount > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  {connectedCount} connection{connectedCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {showSettings && (
              <div className="bg-black/30 rounded p-2 text-white text-xs mt-2">
                <div>Type: {node.type}</div>
                <div>Inputs: {node.inputs.length}</div>
                <div>Outputs: {node.outputs.length}</div>
                <div>Connections: {connectedCount}</div>
                {node.aiGenerated && <div className="text-blue-300">AI Generated</div>}
                {isConfigured && <div className="text-green-300">Configured</div>}
              </div>
            )}
          </div>

          {/* Enhanced Input Ports */}
          {node.inputs.length > 0 && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col space-y-2">
              {node.inputs.map((port, index) => (
                <div key={port.id} className="relative group">
                  <div
                    className={`port w-4 h-4 rounded-full border-2 cursor-pointer transition-all duration-200 ${getPortColor(port.id, 'input')}`}
                    title={getPortTooltip(port, 'input')}
                    onMouseDown={(e) => handlePortMouseDown(port.id, 'input', e)}
                  >
                    <div className="w-2 h-2 text-white" style={{ margin: '1px' }}>
                      <Circle className="w-2 h-2" />
                    </div>
                  </div>
                  
                  {/* Port label that appears on hover or during connection */}
                  <div className={`absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity duration-200 ${
                    connectionState.isConnecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {port.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Output Ports */}
          {node.outputs.length > 0 && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 flex flex-col space-y-2">
              {node.outputs.map((port, index) => (
                <div key={port.id} className="relative group">
                  <div
                    className={`port w-4 h-4 rounded-full border-2 cursor-pointer transition-all duration-200 ${getPortColor(port.id, 'output')}`}
                    title={getPortTooltip(port, 'output')}
                    onMouseDown={(e) => handlePortMouseDown(port.id, 'output', e)}
                  >
                    <div className="w-2 h-2 text-white fill-current" style={{ margin: '1px' }}>
                      <Circle className="w-2 h-2 fill-current" />
                    </div>
                  </div>
                  
                  {/* Port label that appears on hover or during connection */}
                  <div className={`absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity duration-200 ${
                    connectionState.isConnecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {port.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Module Configuration Panel */}
      {showConfigPanel && (
        <ModuleConfigPanel
          node={node}
          connections={connections}
          onUpdate={onUpdate}
          onClose={() => setShowConfigPanel(false)}
        />
      )}
    </>
  );
};
