
import React from 'react';
import { CanvasNode, Connection } from '@/types/editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProgramFlowAnalyzer } from '@/utils/connectionValidation';
import { AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react';

interface ProgramFlowPanelProps {
  nodes: CanvasNode[];
  connections: Connection[];
}

const ProgramFlowPanel = ({ nodes, connections }: ProgramFlowPanelProps) => {
  const analysis = ProgramFlowAnalyzer.analyzeFlow(nodes, connections);
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-text-primary">Program Flow</h3>
      </div>

      {/* Flow Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Flow Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Total Modules</span>
            <Badge variant="outline">{nodes.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Connections</span>
            <Badge variant="outline">{connections.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Isolated Modules</span>
            <Badge variant={analysis.isolatedNodes.length > 0 ? "destructive" : "default"}>
              {analysis.isolatedNodes.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Execution Order */}
      {analysis.executionOrder.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Execution Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.executionOrder.map((nodeId, index) => {
                const node = nodeMap.get(nodeId);
                if (!node) return null;
                
                return (
                  <div key={nodeId} className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary">{node.name}</div>
                      <div className="text-xs text-text-secondary capitalize">{node.type}</div>
                    </div>
                    {index < analysis.executionOrder.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-text-secondary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings and Errors */}
      {analysis.cycles.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Circular Dependencies Detected</div>
            <div className="text-sm mt-1">
              {analysis.cycles.length} cycle(s) found in program flow. This may cause infinite loops.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {analysis.isolatedNodes.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Isolated Modules</div>
            <div className="text-sm mt-1">
              {analysis.isolatedNodes.length} module(s) are not connected to the program flow.
            </div>
            <div className="mt-2 space-y-1">
              {analysis.isolatedNodes.map(nodeId => {
                const node = nodeMap.get(nodeId);
                return node ? (
                  <div key={nodeId} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {node.name}
                  </div>
                ) : null;
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Connection Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              connections.reduce((acc, conn) => {
                const sourceNode = nodeMap.get(conn.sourceNodeId);
                const sourcePort = sourceNode?.outputs.find(p => p.id === conn.sourcePortId);
                const type = sourcePort?.type || 'unknown';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'data' ? 'bg-blue-500' :
                    type === 'control' ? 'bg-orange-500' :
                    type === 'event' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm capitalize">{type}</span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
            Validate All Connections
          </button>
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
            Auto-arrange Modules
          </button>
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
            Export Flow Diagram
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramFlowPanel;
