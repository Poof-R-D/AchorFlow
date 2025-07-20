
import { CanvasNode, Connection, Port } from '@/types/editor';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FlowAnalysis {
  executionOrder: string[];
  dependencies: Record<string, string[]>;
  cycles: string[][];
  isolatedNodes: string[];
}

export class ConnectionValidator {
  static validateConnection(
    sourceNode: CanvasNode, 
    sourcePort: Port, 
    targetNode: CanvasNode, 
    targetPort: Port,
    existingConnections: Connection[]
  ): ValidationResult {
    // Same node connection
    if (sourceNode.id === targetNode.id) {
      return { isValid: false, error: "Cannot connect node to itself" };
    }

    // Type compatibility
    if (!this.areTypesCompatible(sourcePort.type, targetPort.type)) {
      return { isValid: false, error: `Incompatible types: ${sourcePort.type} -> ${targetPort.type}` };
    }

    // Check for existing connection
    const existingConnection = existingConnections.find(
      conn => conn.sourceNodeId === sourceNode.id && 
              conn.targetNodeId === targetNode.id &&
              conn.sourcePortId === sourcePort.id &&
              conn.targetPortId === targetPort.id
    );

    if (existingConnection) {
      return { isValid: false, error: "Connection already exists" };
    }

    // Check for multiple inputs to same port
    const existingInputConnection = existingConnections.find(
      conn => conn.targetNodeId === targetNode.id && conn.targetPortId === targetPort.id
    );

    if (existingInputConnection) {
      return { isValid: false, error: "Port already has an input connection" };
    }

    return { isValid: true };
  }

  private static areTypesCompatible(sourceType: string, targetType: string): boolean {
    // Any type is compatible with everything
    if (sourceType === 'any' || targetType === 'any') return true;
    
    // Direct type match
    if (sourceType === targetType) return true;
    
    // Type conversion rules
    const compatibilityMap: Record<string, string[]> = {
      'number': ['string', 'boolean'],
      'string': ['number'],
      'data': ['any'],
      'control': ['event'],
      'event': ['control'],
    };

    return compatibilityMap[sourceType]?.includes(targetType) || false;
  }
}

export class ProgramFlowAnalyzer {
  static analyzeFlow(nodes: CanvasNode[], connections: Connection[]): FlowAnalysis {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const dependencies: Record<string, string[]> = {};
    
    // Build dependency graph
    nodes.forEach(node => {
      dependencies[node.id] = [];
    });

    connections.forEach(connection => {
      if (dependencies[connection.targetNodeId]) {
        dependencies[connection.targetNodeId].push(connection.sourceNodeId);
      }
    });

    // Find execution order using topological sort
    const executionOrder = this.topologicalSort(nodes.map(n => n.id), dependencies);
    
    // Detect cycles
    const cycles = this.detectCycles(nodes.map(n => n.id), dependencies);
    
    // Find isolated nodes
    const isolatedNodes = this.findIsolatedNodes(nodes, connections);

    return {
      executionOrder,
      dependencies,
      cycles,
      isolatedNodes
    };
  }

  private static topologicalSort(nodeIds: string[], dependencies: Record<string, string[]>): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (nodeId: string) => {
      if (visiting.has(nodeId)) return; // Cycle detected
      if (visited.has(nodeId)) return;

      visiting.add(nodeId);
      
      dependencies[nodeId].forEach(dep => visit(dep));
      
      visiting.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    nodeIds.forEach(nodeId => visit(nodeId));
    
    return result;
  }

  private static detectCycles(nodeIds: string[], dependencies: Record<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (nodeId: string, path: string[]) => {
      if (visiting.has(nodeId)) {
        // Found cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart));
        return;
      }
      
      if (visited.has(nodeId)) return;

      visiting.add(nodeId);
      path.push(nodeId);
      
      dependencies[nodeId].forEach(dep => visit(dep, [...path]));
      
      visiting.delete(nodeId);
      visited.add(nodeId);
    };

    nodeIds.forEach(nodeId => visit(nodeId, []));
    
    return cycles;
  }

  private static findIsolatedNodes(nodes: CanvasNode[], connections: Connection[]): string[] {
    const connectedNodes = new Set<string>();
    
    connections.forEach(connection => {
      connectedNodes.add(connection.sourceNodeId);
      connectedNodes.add(connection.targetNodeId);
    });

    return nodes
      .filter(node => !connectedNodes.has(node.id))
      .map(node => node.id);
  }
}
