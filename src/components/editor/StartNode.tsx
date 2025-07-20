import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Settings, Trash2, Edit2, Check, X } from 'lucide-react';
import { CanvasNode } from '@/types/editor';

interface StartNodeProps {
  node: CanvasNode;
  onNameChange: (nodeId: string, newName: string) => void;
  onPositionChange: (nodeId: string, x: number, y: number) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<CanvasNode>) => void;
}

const StartNode = ({ 
  node, 
  onNameChange, 
  onPositionChange, 
  onDelete, 
  onUpdate 
}: StartNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showConfig, setShowConfig] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onPositionChange(node.id, Math.max(0, newX), Math.max(0, newY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleNameSubmit = () => {
    if (editName.trim()) {
      onNameChange(node.id, editName.trim());
    } else {
      setEditName(node.name);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditName(node.name);
    setIsEditingName(false);
  };

  return (
    <div
      className="absolute select-none z-10"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Start Node Container */}
      <div className="relative w-full h-full">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-20 blur-lg"></div>
        
        {/* Main Node */}
        <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl border-2 border-green-400 shadow-lg hover:shadow-green-500/25 transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-green-400/30">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-white" />
              {isEditingName ? (
                <div className="flex items-center space-x-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSubmit();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                    className="h-6 px-2 text-sm bg-white/20 border-white/30 text-white placeholder-white/60"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNameSubmit}
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNameCancel}
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <h3
                  className="text-white font-medium text-sm cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
                  onClick={() => setIsEditingName(true)}
                >
                  {node.name}
                </h3>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfig(!showConfig)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(node.id)}
                className="h-6 w-6 p-0 text-white hover:bg-red-500/30"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Play className="h-6 w-6 text-white" />
              </div>
              <p className="text-white text-sm opacity-90">
                Program Entry Point
              </p>
              <p className="text-white/70 text-xs mt-1">
                Connect your modules here
              </p>
            </div>
          </div>

          {/* Output Port */}
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <div
              className="w-4 h-4 bg-white border-2 border-green-400 rounded-full cursor-pointer hover:bg-green-100 transition-colors shadow-lg"
              title="Connect to first module"
            />
          </div>

          {/* Pulse Animation */}
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-ping opacity-30" />
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-ui-base border border-ui-accent rounded-lg shadow-lg p-4 z-20">
            <h4 className="text-text-primary font-medium mb-3">Start Node Configuration</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-text-secondary">Program Name</label>
                <Input
                  value={node.name}
                  onChange={(e) => onUpdate(node.id, { name: e.target.value })}
                  className="mt-1 bg-ui-base border-ui-accent text-text-primary"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary">Description</label>
                <Input
                  value={node.description || ''}
                  onChange={(e) => onUpdate(node.id, { description: e.target.value })}
                  placeholder="Describe your program..."
                  className="mt-1 bg-ui-base border-ui-accent text-text-primary"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfig(false)}
                  className="border-ui-accent"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartNode;
