
import React from 'react';
import { Connection, CanvasNode } from '@/types/editor';

interface ConnectionComponentProps {
  connection: Connection;
  nodes: CanvasNode[];
  onDelete: () => void;
  zoom: number;
}

const ConnectionComponent = ({ connection, nodes, onDelete, zoom }: ConnectionComponentProps) => {
  const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
  const targetNode = nodes.find(n => n.id === connection.targetNodeId);

  if (!sourceNode || !targetNode) return null;

  const sourcePort = sourceNode.outputs.find(p => p.id === connection.sourcePortId);
  const targetPort = targetNode.inputs.find(p => p.id === connection.targetPortId);

  if (!sourcePort || !targetPort) return null;

  // Calculate port positions
  const sourceX = sourceNode.x + sourceNode.width - 10;
  const sourceY = sourceNode.y + sourceNode.height / 2;
  const targetX = targetNode.x + 10;
  const targetY = targetNode.y + targetNode.height / 2;

  // Create curved path
  const midX = (sourceX + targetX) / 2;
  const pathD = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke="#4A90E2"
        strokeWidth={2 * zoom}
        className="cursor-pointer hover:stroke-red-400"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
      {/* Connection delete button */}
      <circle
        cx={(sourceX + targetX) / 2}
        cy={(sourceY + targetY) / 2}
        r={8 * zoom}
        fill="#ff4444"
        className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
      <text
        x={(sourceX + targetX) / 2}
        y={(sourceY + targetY) / 2 + 2}
        fill="white"
        fontSize={10 * zoom}
        textAnchor="middle"
        className="cursor-pointer pointer-events-none"
      >
        ×
      </text>
    </g>
  );
};

export default ConnectionComponent;
