
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Eye, Edit3 } from 'lucide-react';
import { CanvasNode, Connection } from '@/types/editor';
import { generateAnchorCode, GeneratedCode } from '@/utils/codeGeneration';
import { useToast } from '@/hooks/use-toast';

interface CodePreviewProps {
  nodes: CanvasNode[];
  connections: Connection[];
  isOpen: boolean;
  onClose: () => void;
}

const CodePreview = ({ nodes, connections, isOpen, onClose }: CodePreviewProps) => {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [editableCode, setEditableCode] = useState<GeneratedCode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && nodes.length > 0) {
      const code = generateAnchorCode(nodes, connections);
      setGeneratedCode(code);
      setEditableCode(code);
    }
  }, [nodes, connections, isOpen]);

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadProject = () => {
    if (!editableCode) return;

    const files = [
      { name: 'src/lib.rs', content: editableCode.lib },
      { name: 'tests/test.ts', content: editableCode.tests },
      { name: 'Cargo.toml', content: editableCode.cargoToml },
      { name: 'Anchor.toml', content: editableCode.anchorToml },
      ...editableCode.instructions.map((instruction, index) => ({
        name: `src/instructions/instruction_${index + 1}.rs`,
        content: instruction
      }))
    ];

    // Create and download zip-like structure as text files
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\//g, '_');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Project downloaded",
      description: "All project files have been downloaded to your computer.",
    });
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing && generatedCode) {
      // Reset to original generated code when exiting edit mode
      setEditableCode(generatedCode);
    }
  };

  if (!isOpen || !editableCode) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ui-base border border-ui-accent rounded-lg w-[90vw] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ui-accent">
          <h2 className="text-lg font-semibold text-text-primary">Generated Anchor Code</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEditMode}
              className="border-ui-accent"
            >
              {isEditing ? <Eye className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadProject}
              className="border-ui-accent"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <Tabs defaultValue="lib" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="lib">lib.rs</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="cargo">Cargo.toml</TabsTrigger>
              <TabsTrigger value="anchor">Anchor.toml</TabsTrigger>
            </TabsList>

            <TabsContent value="lib" className="flex-1 mt-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">src/lib.rs</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(editableCode.lib)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editableCode.lib}
                    onChange={(e) => setEditableCode(prev => prev ? { ...prev, lib: e.target.value } : null)}
                    className="flex-1 font-mono text-sm resize-none"
                  />
                ) : (
                  <pre className="flex-1 bg-ui-accent p-3 rounded border overflow-auto text-sm font-mono text-text-primary whitespace-pre-wrap">
                    {editableCode.lib}
                  </pre>
                )}
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="flex-1 mt-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">Instructions</h3>
                </div>
                <div className="flex-1 overflow-auto space-y-4">
                  {editableCode.instructions.map((instruction, index) => (
                    <div key={index} className="border border-ui-accent rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-primary">instruction_{index + 1}.rs</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(instruction)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={instruction}
                          onChange={(e) => {
                            const newInstructions = [...editableCode.instructions];
                            newInstructions[index] = e.target.value;
                            setEditableCode(prev => prev ? { ...prev, instructions: newInstructions } : null);
                          }}
                          className="font-mono text-sm resize-none h-32"
                        />
                      ) : (
                        <pre className="bg-ui-accent p-2 rounded text-sm font-mono text-text-primary whitespace-pre-wrap">
                          {instruction}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="flex-1 mt-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">tests/test.ts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(editableCode.tests)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editableCode.tests}
                    onChange={(e) => setEditableCode(prev => prev ? { ...prev, tests: e.target.value } : null)}
                    className="flex-1 font-mono text-sm resize-none"
                  />
                ) : (
                  <pre className="flex-1 bg-ui-accent p-3 rounded border overflow-auto text-sm font-mono text-text-primary whitespace-pre-wrap">
                    {editableCode.tests}
                  </pre>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cargo" className="flex-1 mt-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">Cargo.toml</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(editableCode.cargoToml)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editableCode.cargoToml}
                    onChange={(e) => setEditableCode(prev => prev ? { ...prev, cargoToml: e.target.value } : null)}
                    className="flex-1 font-mono text-sm resize-none"
                  />
                ) : (
                  <pre className="flex-1 bg-ui-accent p-3 rounded border overflow-auto text-sm font-mono text-text-primary whitespace-pre-wrap">
                    {editableCode.cargoToml}
                  </pre>
                )}
              </div>
            </TabsContent>

            <TabsContent value="anchor" className="flex-1 mt-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">Anchor.toml</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(editableCode.anchorToml)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editableCode.anchorToml}
                    onChange={(e) => setEditableCode(prev => prev ? { ...prev, anchorToml: e.target.value } : null)}
                    className="flex-1 font-mono text-sm resize-none"
                  />
                ) : (
                  <pre className="flex-1 bg-ui-accent p-3 rounded border overflow-auto text-sm font-mono text-text-primary whitespace-pre-wrap">
                    {editableCode.anchorToml}
                  </pre>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CodePreview;
