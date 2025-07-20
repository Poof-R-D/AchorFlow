import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { CanvasNode, Connection } from '@/types/editor';
import { Node } from './Node';
import { Edge } from './Edge';
import StartNode from './StartNode';
import { ModuleItem } from './ModuleItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CodePreview from './CodePreview';
import { generateAnchorCode } from '@/utils/codeGeneration';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Copy, Download, Code2, Database, Layers, Zap, Settings, Bell, HelpCircle, Wand2, Play } from 'lucide-react';
import TestRunner from '@/components/testing/TestRunner';
import DeploymentPanel from '@/components/deployment/DeploymentPanel';
import TransactionMonitor from '@/components/monitoring/TransactionMonitor';
import ModuleLibrary from './ModuleLibrary';
import ProgramFlowPanel from './ProgramFlowPanel';
import SettingsPanel from './SettingsPanel';
import HelpPanel from './HelpPanel';
import AIAssistantPanel from './AIAssistantPanel';
import ConnectionTypesPanel from './ConnectionTypesPanel';
import { ModuleTemplate } from '@/types/modules';

interface CanvasProps {
  onGenerate: () => void;
  onTest: () => void;
  projectId?: string | null;
}

const Canvas = ({ onGenerate, onTest, projectId }: CanvasProps) => {
  const {
    nodes,
    connections,
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
    clearCanvas,
  } = useEditorState();
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });
  const [codePreviewOpen, setCodePreviewOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [activeTab, setActiveTab] = useState<'design' | 'test' | 'deploy' | 'monitor'>('design');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleAddStartNode = () => {
    const hasStartNode = nodes.some(node => node.type === 'start');
    if (hasStartNode) {
      toast({
        title: "Start node already exists",
        description: "Only one start node is allowed per program.",
        variant: "destructive"
      });
      return;
    }

    const newNode: CanvasNode = {
      id: crypto.randomUUID(),
      type: 'start',
      name: 'Program Start',
      x: 50,
      y: 150,
      width: 220,
      height: 140,
      color: 'from-green-500 to-emerald-500',
      inputs: [],
      outputs: [{ id: crypto.randomUUID(), name: 'start', type: 'flow' }],
    };
    addNode(newNode);
    
    toast({
      title: "Start node added",
      description: "Program entry point has been added to the canvas.",
    });
  };

  const handleAddModuleFromTemplate = (type: string, template?: ModuleTemplate) => {
    const newNode: CanvasNode = {
      id: crypto.randomUUID(),
      type: type,
      name: template ? template.name : (type === 'instruction' ? 'New Instruction' : 'New Account'),
      x: Math.random() * 200 + 300, // Start modules to the right of start node
      y: Math.random() * 200 + 100,
      width: 200,
      height: 120,
      color: template ? template.color : (type === 'instruction' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'),
      inputs: template ? template.inputs.map(input => ({
        id: crypto.randomUUID(),
        name: input.name,
        type: input.type
      })) : (type === 'instruction' ? [{ id: crypto.randomUUID(), name: 'input', type: 'data' }] : []),
      outputs: template ? template.outputs.map(output => ({
        id: crypto.randomUUID(),
        name: output.name,
        type: output.type
      })) : (type === 'instruction' ? [{ id: crypto.randomUUID(), name: 'output', type: 'data' }] : []),
    };
    addNode(newNode);
    
    toast({
      title: "Module added",
      description: `${template ? template.name : type} has been added to the canvas.`,
    });
  };

  const handleAICreateModule = (moduleData: any) => {
    const newNode: CanvasNode = {
      id: crypto.randomUUID(),
      type: moduleData.type,
      name: moduleData.name,
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
      width: 200,
      height: 120,
      color: moduleData.color,
      inputs: moduleData.inputs || [],
      outputs: moduleData.outputs || [],
      aiGenerated: true,
      description: moduleData.description,
      code: moduleData.code
    };
    
    addNode(newNode);
    
    toast({
      title: "AI Module Created!",
      description: `${moduleData.name} has been created and added to your canvas.`,
    });
  };

  const handleAIExplainProgram = (explanation: string) => {
    toast({
      title: "Program Analysis Complete",
      description: "Check the AI Assistant panel for detailed explanation.",
      duration: 5000,
    });
  };

  const handleNodeNameChange = (nodeId: string, newName: string) => {
    updateNode(nodeId, { name: newName });
  };

  const handleNodePositionChange = (nodeId: string, x: number, y: number) => {
    updateNode(nodeId, { x, y });
  };

  const handleStartConnection = (nodeId: string, portId: string, portType: 'input' | 'output', position: { x: number; y: number }) => {
    console.log('Canvas: Starting connection', { nodeId, portId, portType, position });
    startConnection(nodeId, portId, portType, position);
  };

  const handleCompleteConnection = (nodeId: string, portId: string) => {
    console.log('Canvas: Completing connection', { nodeId, portId, connectionState });
    const success = completeConnection(nodeId, portId);
    if (success) {
      toast({
        title: "Connection created",
        description: "Modules connected successfully.",
      });
    } else {
      toast({
        title: "Invalid connection",
        description: "Cannot connect these ports.",
        variant: "destructive"
      });
    }
    return success;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (connectionState.isConnecting) {
        console.log('Canvas: Canceling connection due to canvas click');
        cancelConnection();
      } else {
        setIsPanning(true);
        setPanStart({ x: pan.x, y: pan.y });
        setMouseStart({ x: e.clientX, y: e.clientY });
        setSelectedConnection(null);
      }
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;
      setPan({ 
        x: panStart.x + dx, 
        y: panStart.y + dy 
      });
    } else if (connectionState.isConnecting && connectionState.tempConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        updateTempConnection({ 
          x: (e.clientX - rect.left - pan.x) / zoom, 
          y: (e.clientY - rect.top - pan.y) / zoom 
        });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(2, zoom * scaleFactor));
    setZoom(newZoom);
  }, [zoom]);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('module-type');
    if (type && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - canvasRect.left - pan.x) / zoom;
      const y = (e.clientY - canvasRect.top - pan.y) / zoom;

      const newNode: CanvasNode = {
        id: crypto.randomUUID(),
        type: type,
        name: type === 'instruction' ? 'New Instruction' : 'New Account',
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 200,
        height: 120,
        color: type === 'instruction' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600',
        inputs: type === 'instruction' ? [{ id: crypto.randomUUID(), name: 'input', type: 'data' }] : [],
        outputs: type === 'instruction' ? [{ id: crypto.randomUUID(), name: 'output', type: 'data' }] : [],
      };
      addNode(newNode);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGenerateCode = () => {
    try {
      if (nodes.length === 0) {
        toast({
          title: "No nodes to generate",
          description: "Add some instruction or account nodes to generate code.",
          variant: "destructive"
        });
        return;
      }

      const generated = generateAnchorCode(nodes, connections);
      setGeneratedCode(generated);
      setCodePreviewOpen(true);
      onGenerate();
      
      toast({
        title: "Code generated successfully",
        description: "Your Anchor program code has been generated.",
      });
    } catch (error) {
      console.error('Code generation error:', error);
      toast({
        title: "Code generation failed",
        description: "There was an error generating your code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getInstructionNames = () => {
    return nodes
      .filter(node => node.type !== 'account')
      .map(node => node.name.toLowerCase().replace(/\s+/g, '_'));
  };

  return (
    <div className="flex h-screen bg-ui-base">
      {/* Left Sidebar - Module Library */}
      {activeTab === 'design' && (
        <div className="w-80 border-r border-ui-accent bg-ui-base flex flex-col">
          <ModuleLibrary onAddModule={handleAddModuleFromTemplate} />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-ui-accent bg-ui-base flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-text-primary">Visual Editor</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'design' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('design')}
              >
                Design
              </Button>
              <Button
                variant={activeTab === 'test' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('test')}
              >
                Test
              </Button>
              <Button
                variant={activeTab === 'deploy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('deploy')}
              >
                Deploy
              </Button>
              <Button
                variant={activeTab === 'monitor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('monitor')}
              >
                Monitor
              </Button>
            </div>
          </div>

          {/* Enhanced Connection Status Indicator */}
          {connectionState.isConnecting && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg border-2 border-blue-400 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                <span className="font-medium">Connecting Modules...</span>
                <div className="text-sm opacity-90">
                  Click target port or press <kbd className="bg-white/20 px-1 rounded">ESC</kbd> to cancel
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant={showAIAssistant ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="border-ui-accent relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              ✨ AI Assistant
              {nodes.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse"></span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="border-ui-accent"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="border-ui-accent"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-ui-accent relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {activeTab === 'design' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStartNode}
                  className="border-ui-accent text-green-500 hover:bg-green-500/10"
                  disabled={nodes.some(node => node.type === 'start')}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Add Start Node
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCode}
                  className="border-ui-accent"
                  disabled={nodes.length === 0}
                >
                  <Code2 className="h-4 w-4 mr-1" />
                  Generate Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="border-ui-accent"
                  disabled={nodes.length === 0}
                >
                  Clear Canvas
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Area with Right Sidebar for Flow Analysis */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Canvas */}
          <div className="flex-1 relative min-w-0">
            {/* Design Tab - Canvas */}
            {activeTab === 'design' && (
              <div className="w-full h-full relative overflow-hidden">
                {/* Canvas Container with dark theme */}
                <div
                  ref={canvasRef}
                  className="absolute inset-0 bg-ui-base"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onWheel={handleWheel}
                  onDrop={handleCanvasDrop}
                  onDragOver={handleCanvasDragOver}
                >
                  {/* Dark grid background */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: '0 0',
                    }}
                  >
                    <svg className="w-full h-full" style={{ minWidth: '5000px', minHeight: '5000px' }}>
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#343331" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Canvas content with proper transform */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: '0 0',
                      minWidth: '5000px',
                      minHeight: '5000px',
                    }}
                  >
                    {/* SVG for connections - positioned to cover entire canvas */}
                    <svg 
                      className="absolute inset-0 pointer-events-none w-full h-full" 
                      style={{ 
                        zIndex: 5,
                        minWidth: '5000px',
                        minHeight: '5000px',
                      }}
                    >
                      <defs>
                        {/* Enhanced arrow markers with better colors for dark theme */}
                        <marker
                          id="arrowhead"
                          markerWidth="12"
                          markerHeight="8"
                          refX="11"
                          refY="4"
                          orient="auto"
                          fill="#60A5FA"
                        >
                          <polygon points="0 0, 12 4, 0 8" />
                        </marker>
                        <marker
                          id="arrowhead-temp"
                          markerWidth="12"
                          markerHeight="8"
                          refX="11"
                          refY="4"
                          orient="auto"
                          fill="#FBBF24"
                        >
                          <polygon points="0 0, 12 4, 0 8" />
                        </marker>
                        
                        {/* Glow filter for connection lines */}
                        <filter id="connectionGlow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Render existing connections */}
                      {connections.map((connection) => {
                        const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
                        const targetNode = nodes.find(n => n.id === connection.targetNodeId);
                        
                        if (!sourceNode || !targetNode) return null;
                        
                        return (
                          <Edge
                            key={connection.id}
                            connection={connection}
                            sourceNode={sourceNode}
                            targetNode={targetNode}
                            isSelected={selectedConnection === connection.id}
                            onSelect={() => setSelectedConnection(connection.id)}
                            onDelete={deleteConnection}
                          />
                        );
                      })}

                      {/* Enhanced temporary connection with glow effect */}
                      {connectionState.isConnecting && connectionState.tempConnection && (
                        <g>
                          {/* Glow background */}
                          <line
                            x1={connectionState.tempConnection.startX}
                            y1={connectionState.tempConnection.startY}
                            x2={connectionState.tempConnection.endX}
                            y2={connectionState.tempConnection.endY}
                            stroke="#FBBF24"
                            strokeWidth="8"
                            opacity="0.3"
                            className="pointer-events-none"
                          />
                          {/* Main line */}
                          <line
                            x1={connectionState.tempConnection.startX}
                            y1={connectionState.tempConnection.startY}
                            x2={connectionState.tempConnection.endX}
                            y2={connectionState.tempConnection.endY}
                            stroke="#FBBF24"
                            strokeWidth="3"
                            strokeDasharray="8,4"
                            className="pointer-events-none animate-pulse"
                            markerEnd="url(#arrowhead-temp)"
                            filter="url(#connectionGlow)"
                          />
                          {/* Animated dots along the line */}
                          <circle
                            cx={connectionState.tempConnection.startX}
                            cy={connectionState.tempConnection.startY}
                            r="4"
                            fill="#FBBF24"
                            className="animate-ping"
                          />
                        </g>
                      )}
                    </svg>

                    {/* Connection overlay for better visual feedback with dark theme */}
                    {connectionState.isConnecting && (
                      <div className="absolute inset-0 bg-black/20 pointer-events-none z-20 backdrop-blur-[0.5px]">
                        <div className="absolute top-4 left-4 bg-ui-accent/90 text-text-primary px-4 py-2 rounded-lg shadow-lg border border-ui-accent">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">
                              Drag to connect • 
                              <span className="text-blue-400 ml-1">
                                {connectionState.sourcePortType === 'output' ? 'Find an input port' : 'Find an output port'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Render nodes */}
                    {nodes.map((node) => (
                      node.type === 'start' ? (
                        <StartNode
                          key={node.id}
                          node={node}
                          onNameChange={handleNodeNameChange}
                          onPositionChange={handleNodePositionChange}
                          onDelete={deleteNode}
                          onUpdate={updateNode}
                        />
                      ) : (
                        <Node
                          key={node.id}
                          node={node}
                          isSelected={false}
                          onNameChange={handleNodeNameChange}
                          onPositionChange={handleNodePositionChange}
                          onDelete={deleteNode}
                          onUpdate={updateNode}
                          onStartConnection={handleStartConnection}
                          onCompleteConnection={handleCompleteConnection}
                          onCancelConnection={cancelConnection}
                          connectionState={connectionState}
                          validateConnection={validateConnection}
                          connections={connections}
                        />
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content */}
            {activeTab === 'test' && (
              <div className="p-6 h-full overflow-y-auto">
                <TestRunner
                  instructions={getInstructionNames()}
                  network="devnet"
                  onTestComplete={(results) => {
                    console.log('Test results:', results);
                  }}
                />
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="p-6 h-full overflow-y-auto">
                <DeploymentPanel
                  programCode={generatedCode?.lib || ''}
                />
              </div>
            )}

            {activeTab === 'monitor' && (
              <div className="p-6 h-full overflow-y-auto">
                <TransactionMonitor />
              </div>
            )}
          </div>

          {/* Right Sidebar - Program Flow Analysis & Connection Guide */}
          {activeTab === 'design' && (
            <div className="w-80 border-l border-ui-accent bg-ui-base p-4 overflow-y-auto flex-shrink-0">
              {nodes.length > 0 ? (
                <ProgramFlowPanel nodes={nodes} connections={connections} />
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <Play className="h-12 w-12 text-text-secondary opacity-50 mx-auto mb-3" />
                    <h3 className="text-text-primary font-medium mb-2">Get Started</h3>
                    <p className="text-text-secondary text-sm mb-4">
                      Add a start node to begin building your Solana program
                    </p>
                    <Button
                      onClick={handleAddStartNode}
                      className="btn-primary"
                      disabled={nodes.some(node => node.type === 'start')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Add Start Node
                    </Button>
                  </div>
                  <ConnectionTypesPanel />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Help Panel */}
      <HelpPanel 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />

      {/* AI Assistant Panel - Enhanced */}
      <AIAssistantPanel 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)}
        onCreateModule={handleAICreateModule}
        onExplainProgram={handleAIExplainProgram}
        nodes={nodes}
        connections={connections}
      />

      <CodePreview
        nodes={nodes}
        connections={connections}
        isOpen={codePreviewOpen}
        onClose={() => setCodePreviewOpen(false)}
      />
    </div>
  );
};

export default Canvas;
