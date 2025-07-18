
import React from 'react';
import { Connection, CanvasNode } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EdgeProps {
  connection: Connection;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  onDelete: (connectionId: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const Edge = ({ connection, sourceNode, targetNode, onDelete, isSelected = false, onSelect }: EdgeProps) => {
  // Calculate port positions more accurately
  const sourcePort = sourceNode.outputs.find(p => p.id === connection.sourcePortId);
  const targetPort = targetNode.inputs.find(p => p.id === connection.targetPortId);
  
  if (!sourcePort || !targetPort) {
    console.log('Edge: Missing ports', { sourcePort, targetPort });
    return null;
  }

  // Calculate source position (from the actual output port on the right side)
  const sourcePortIndex = sourceNode.outputs.findIndex(p => p.id === connection.sourcePortId);
  const portSpacing = 35; // Match the spacing used in Node component
  const nodeHeaderHeight = 50; // Header height before ports start
  const portOffset = 15; // Center of port circle
  
  const sourceX = sourceNode.x + sourceNode.width; // Right edge of source node
  const sourceY = sourceNode.y + nodeHeaderHeight + (sourcePortIndex * portSpacing) + portOffset;

  // Calculate target position (to the actual input port on the left side)  
  const targetPortIndex = targetNode.inputs.findIndex(p => p.id === connection.targetPortId);
  const targetX = targetNode.x; // Left edge of target node
  const targetY = targetNode.y + nodeHeaderHeight + (targetPortIndex * portSpacing) + portOffset;

  // Create smooth curved path for better visual appeal
  const controlDistance = Math.max(80, Math.abs(targetX - sourceX) * 0.4);
  const pathD = `M ${sourceX} ${sourceY} C ${sourceX + controlDistance} ${sourceY}, ${targetX - controlDistance} ${targetY}, ${targetX} ${targetY}`;

  // Calculate midpoint for delete button and labels
  const midPointX = (sourceX + targetX) / 2;
  const midPointY = (sourceY + targetY) / 2;

  // Get connection color based on type - enhanced for dark theme
  const getConnectionColor = () => {
    const type = sourcePort?.type || 'data';
    switch (type) {
      case 'data': return isSelected ? '#93C5FD' : '#60A5FA';
      case 'control': return isSelected ? '#FCD34D' : '#F59E0B';
      case 'event': return isSelected ? '#6EE7B7' : '#10B981';
      case 'account': return isSelected ? '#C4B5FD' : '#8B5CF6';
      case 'token': return isSelected ? '#FDBA74' : '#F97316';
      default: return isSelected ? '#9CA3AF' : '#6B7280';
    }
  };

  const connectionColor = getConnectionColor();

  return (
    <g className="connection-edge">
      {/* Connection glow effect when selected */}
      {isSelected && (
        <path
          d={pathD}
          fill="none"
          stroke={connectionColor}
          strokeWidth="8"
          opacity="0.2"
          className="pointer-events-none"
        />
      )}

      {/* Main connection path */}
      <path
        d={pathD}
        fill="none"
        stroke={connectionColor}
        strokeWidth={isSelected ? "4" : "3"}
        className="transition-all duration-200"
        style={{ 
          filter: isSelected ? `drop-shadow(0 0 8px ${connectionColor}80)` : 'none'
        }}
        markerEnd="url(#arrowhead)"
      />
      
      {/* Connection hover/click area (invisible but larger for easier interaction) */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect();
        }}
      />

      {/* Connection type label */}
      {isSelected && (
        <g transform={`translate(${midPointX}, ${midPointY - 25})`}>
          <rect
            x="-30"
            y="-10"
            width="60"
            height="20"
            rx="10"
            fill="rgba(15, 23, 42, 0.9)"
            stroke={connectionColor}
            strokeWidth="1"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="11"
            className="pointer-events-none font-medium"
          >
            {sourcePort.type}
          </text>
        </g>
      )}
      
      {/* Delete button - only show when selected */}
      {isSelected && (
        <foreignObject
          x={midPointX - 12}
          y={midPointY + 15}
          width="24"
          height="24"
        >
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(connection.id);
            }}
            title="Delete connection"
          >
            <X className="h-3 w-3" />
          </Button>
        </foreignObject>
      )}

      {/* Connection endpoint indicators */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r="4"
        fill={connectionColor}
        stroke="#0F172A"
        strokeWidth="2"
        className="pointer-events-none"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r="4"
        fill={connectionColor}
        stroke="#0F172A"
        strokeWidth="2"
        className="pointer-events-none"
      />
    </g>
  );
};
