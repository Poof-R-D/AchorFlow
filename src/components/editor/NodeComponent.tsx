
import React, { useState } from 'react';
import { CanvasNode } from '@/types/editor';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodeComponentProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<CanvasNode>) => void;
  onStartConnection: (nodeId: string, portId: string, type: 'input' | 'output') => void;
  zoom: number;
}

const NodeComponent = ({ 
  node, 
  isSelected, 
  onSelect, 
  onDelete, 
  onUpdate,
  onStartConnection,
  zoom 
}: NodeComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showConfig, setShowConfig] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.x * zoom,
      y: e.clientY - node.y * zoom,
    });
    onSelect();
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = (e.clientX - dragStart.x) / zoom;
    const newY = (e.clientY - dragStart.y) / zoom;
    
    onUpdate({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePortMouseDown = (portId: string, type: 'input' | 'output', e: React.MouseEvent) => {
    e.stopPropagation();
    onStartConnection(node.id, portId, type);
  };

  return (
    <div
      className={`absolute cursor-pointer select-none ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={`w-full h-full bg-gradient-to-br ${node.color} rounded-lg border border-white/20 shadow-lg flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 flex items-center justify-center">
              {React.isValidElement(node.icon) ? node.icon : null}
            </div>
            <span className="text-white text-sm font-medium">{node.name}</span>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfig(!showConfig);
              }}
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Ports */}
        <div className="flex-1 flex">
          {/* Input ports */}
          <div className="flex flex-col justify-center space-y-1 p-1">
            {node.inputs.map((port) => (
              <div
                key={port.id}
                className="w-3 h-3 bg-white rounded-full border-2 border-gray-400 cursor-pointer hover:bg-blue-200"
                onMouseDown={(e) => handlePortMouseDown(port.id, 'input', e)}
                title={port.name}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center">
            {showConfig && (
              <div className="bg-black/50 text-white text-xs p-2 rounded">
                Config
              </div>
            )}
          </div>

          {/* Output ports */}
          <div className="flex flex-col justify-center space-y-1 p-1">
            {node.outputs.map((port) => (
              <div
                key={port.id}
                className="w-3 h-3 bg-white rounded-full border-2 border-gray-400 cursor-pointer hover:bg-green-200"
                onMouseDown={(e) => handlePortMouseDown(port.id, 'output', e)}
                title={port.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeComponent;
