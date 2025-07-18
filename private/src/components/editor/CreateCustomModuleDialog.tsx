import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomModule, ModulePort, Parameter } from '@/types/modules';
import { Plus, X, Code2, Database, Zap, Vote, Coins, Image, Wand2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateCustomModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateModule: (module: Omit<CustomModule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

const iconMap = {
  'Code2': Code2,
  'Database': Database,
  'Zap': Zap,
  'Vote': Vote,
  'Coins': Coins,
  'Image': Image,
};

const colorOptions = [
  { name: 'Blue', value: 'from-blue-500 to-indigo-500' },
  { name: 'Green', value: 'from-green-500 to-teal-500' },
  { name: 'Red', value: 'from-red-500 to-pink-500' },
  { name: 'Purple', value: 'from-purple-500 to-pink-500' },
  { name: 'Yellow', value: 'from-yellow-500 to-orange-500' },
  { name: 'Gray', value: 'from-gray-500 to-slate-500' },
];

export const CreateCustomModuleDialog = ({ isOpen, onClose, onCreateModule }: CreateCustomModuleDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Custom' as const,
    icon: 'Code2',
    color: 'from-blue-500 to-indigo-500',
    overview: '',
    usage: '',
    type: 'instruction'
  });

  const [inputs, setInputs] = useState<ModulePort[]>([]);
  const [outputs, setOutputs] = useState<ModulePort[]>([]);
  const [parameters, setParameters] = useState<(Parameter & { id: string })[]>([]);
  const [examples, setExamples] = useState<string[]>(['']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [showAiHelper, setShowAiHelper] = useState(false);

  const { toast } = useToast();

  const handleAiGenerate = async () => {
    if (!aiDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe what you want the module to do.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-module', {
        body: {
          description: aiDescription,
          moduleType: formData.type
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { moduleSpec } = response.data;
      
      // Update form with AI generated data
      setFormData(prev => ({
        ...prev,
        name: moduleSpec.name || prev.name,
        type: moduleSpec.type || prev.type,
        description: moduleSpec.description || aiDescription,
        color: getColorForType(moduleSpec.type || prev.type)
      }));

      // Update inputs and outputs
      if (moduleSpec.inputs) {
        setInputs(moduleSpec.inputs.map(input => ({
          ...input,
          id: input.id || crypto.randomUUID()
        })));
      }

      if (moduleSpec.outputs) {
        setOutputs(moduleSpec.outputs.map(output => ({
          ...output,
          id: output.id || crypto.randomUUID()
        })));
      }

      // Update parameters
      if (moduleSpec.parameters) {
        setParameters(moduleSpec.parameters.map(param => ({
          ...param,
          id: crypto.randomUUID()
        })));
      }

      setShowAiHelper(false);
      setAiDescription('');
      
      toast({
        title: "Module Generated!",
        description: "AI has created your module specification. Review and customize as needed.",
      });

    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate module. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const getColorForType = (type: string) => {
    const colors = {
      instruction: 'from-blue-500 to-blue-600',
      account: 'from-green-500 to-green-600',
      validator: 'from-purple-500 to-purple-600',
      processor: 'from-orange-500 to-orange-600'
    };
    return colors[type] || colors.instruction;
  };

  const handleAddPort = (type: 'input' | 'output') => {
    const newPort: ModulePort = {
      id: crypto.randomUUID(),
      name: '',
      type: 'data',
      required: true,
      description: ''
    };
    
    if (type === 'input') {
      setInputs(prev => [...prev, newPort]);
    } else {
      setOutputs(prev => [...prev, newPort]);
    }
  };

  const handleUpdatePort = (portId: string, updates: Partial<ModulePort>, type: 'input' | 'output') => {
    if (type === 'input') {
      setInputs(prev => prev.map(port => 
        port.id === portId ? { ...port, ...updates } : port
      ));
    } else {
      setOutputs(prev => prev.map(port => 
        port.id === portId ? { ...port, ...updates } : port
      ));
    }
  };

  const handleRemovePort = (portId: string, type: 'input' | 'output') => {
    if (type === 'input') {
      setInputs(prev => prev.filter(port => port.id !== portId));
    } else {
      setOutputs(prev => prev.filter(port => port.id !== portId));
    }
  };

  const handleAddParameter = () => {
    const newParameter = {
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      description: '',
      required: true
    };
    setParameters(prev => [...prev, newParameter]);
  };

  const handleUpdateParameter = (index: number, updates: Partial<Parameter>) => {
    setParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, ...updates } : param
    ));
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddExample = () => {
    setExamples(prev => [...prev, '']);
  };

  const handleUpdateExample = (index: number, value: string) => {
    setExamples(prev => prev.map((example, i) => 
      i === index ? value : example
    ));
  };

  const handleRemoveExample = (index: number) => {
    setExamples(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const module: Omit<CustomModule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      icon: formData.icon,
      color: formData.color,
      isBuiltIn: false,
      inputs,
      outputs,
      documentation: {
        overview: formData.overview,
        usage: formData.usage,
        parameters: parameters.map(({ id, ...param }) => param),
        examples: examples.filter(ex => ex.trim() !== ''),
      },
    };

    onCreateModule(module);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: 'Custom',
      icon: 'Code2',
      color: 'from-blue-500 to-indigo-500',
      overview: '',
      usage: '',
      type: 'instruction'
    });
    setInputs([]);
    setOutputs([]);
    setParameters([]);
    setExamples(['']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Module</DialogTitle>
          <DialogDescription>
            Design a custom module for your Solana program
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Helper Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">AI Helper</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAiHelper(!showAiHelper)}
              >
                {showAiHelper ? 'Hide' : 'Show'} AI Helper
              </Button>
            </div>
            
            {showAiHelper && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ai-description">Describe your module</Label>
                  <Textarea
                    id="ai-description"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="E.g., 'Create a token staking instruction that locks tokens for a specific duration and calculates rewards'"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Module with AI
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Module Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Token Transfer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Module Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instruction">Instruction</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="processor">Processor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this module does..."
                rows={3}
              />
            </div>
          </div>

          {/* Inputs Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Inputs</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inputs.map((input) => (
                <div key={input.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Input name"
                      value={input.name}
                      onChange={(e) => handleUpdatePort(input.id, { name: e.target.value }, 'input')}
                      className="flex-1 mr-2"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePort(input.id, 'input')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={input.type}
                    onValueChange={(value) => handleUpdatePort(input.id, { type: value as any }, 'input')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="instruction">Instruction</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Description"
                    value={input.description}
                    onChange={(e) => handleUpdatePort(input.id, { description: e.target.value }, 'input')}
                  />
                </div>
              ))}
              <Button size="sm" onClick={() => handleAddPort('input')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Input
              </Button>
            </div>
          </div>

          {/* Outputs Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Outputs</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {outputs.map((output) => (
                <div key={output.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Output name"
                      value={output.name}
                      onChange={(e) => handleUpdatePort(output.id, { name: e.target.value }, 'output')}
                      className="flex-1 mr-2"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePort(output.id, 'output')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={output.type}
                    onValueChange={(value) => handleUpdatePort(output.id, { type: value as any }, 'output')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="instruction">Instruction</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Description"
                    value={output.description}
                    onChange={(e) => handleUpdatePort(output.id, { description: e.target.value }, 'output')}
                  />
                </div>
              ))}
              <Button size="sm" onClick={() => handleAddPort('output')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Output
              </Button>
            </div>
          </div>

          {/* Parameters Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Parameters</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {parameters.map((param, index) => (
                <div key={param.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Parameter name"
                      value={param.name}
                      onChange={(e) => handleUpdateParameter(index, { name: e.target.value })}
                      className="flex-1 mr-2"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveParameter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Type"
                    value={param.type}
                    onChange={(e) => handleUpdateParameter(index, { type: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={param.description}
                    onChange={(e) => handleUpdateParameter(index, { description: e.target.value })}
                  />
                </div>
              ))}
              <Button size="sm" onClick={handleAddParameter}>
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>
          </div>

          {/* Examples Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Examples</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <Input
                    placeholder="Example"
                    value={example}
                    onChange={(e) => handleUpdateExample(index, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveExample(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" onClick={handleAddExample}>
                <Plus className="h-4 w-4 mr-1" />
                Add Example
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Module</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomModuleDialog;
