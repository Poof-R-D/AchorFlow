import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, BookOpen, Settings } from 'lucide-react';
import { builtInModules } from '@/data/moduleTemplates';
import { useCustomModules } from '@/hooks/useCustomModules';
import { ModuleTemplate } from '@/types/modules';
import ModuleDocumentation from './ModuleDocumentation';
import CreateCustomModuleDialog from './CreateCustomModuleDialog';
import * as Icons from 'lucide-react';

interface ModuleLibraryProps {
  onAddModule: (moduleType: string, template?: ModuleTemplate) => void;
}

const ModuleLibrary = ({ onAddModule }: ModuleLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedModule, setSelectedModule] = useState<ModuleTemplate | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { customModules, createModule, isLoading } = useCustomModules();

  // Combine built-in and custom modules
  const allModules = [...builtInModules, ...customModules];
  
  const categories = ['All', ...Array.from(new Set(allModules.map(m => m.category)))];
  
  const filteredModules = allModules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || module.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, module: ModuleTemplate) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: module.isBuiltIn ? 'built-in' : 'custom',
      moduleId: module.id,
      template: module
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddToCanvas = (module: ModuleTemplate) => {
    // Convert module template to canvas node type
    const nodeType = module.category.toLowerCase() === 'core' ? 'instruction' : 
                    module.category.toLowerCase() === 'token' || module.category.toLowerCase() === 'nft' ? 'account' :
                    'instruction';
    
    onAddModule(nodeType, module);
  };

  const handleShowDocumentation = (module: ModuleTemplate) => {
    setSelectedModule(module);
    setShowDocumentation(true);
  };

  const getModuleIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Icons.Code2 className="h-5 w-5" />;
  };

  return (
    <div className="w-80 bg-ui-base border-r border-ui-accent p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Module Library</h2>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-ui-accent border-ui-accent text-text-primary"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedCategory === category
                  ? 'bg-text-primary text-ui-base border-text-primary'
                  : 'border-ui-accent text-text-secondary hover:text-text-primary hover:border-text-secondary'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {filteredModules.map((module) => (
          <Card
            key={module.id}
            className="bg-ui-accent border-ui-accent hover:border-text-primary/50 cursor-grab active:cursor-grabbing transition-all duration-200"
            draggable
            onDragStart={(e) => handleDragStart(e, module)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center text-white`}>
                  {getModuleIcon(module.icon)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium text-text-primary">
                    {module.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs border-ui-accent text-text-secondary">
                      {module.category}
                    </Badge>
                    {!module.isBuiltIn && (
                      <Badge variant="outline" className="text-xs border-primary text-primary">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => handleShowDocumentation(module)}
                  >
                    <BookOpen className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs text-text-secondary mb-3">
                {module.description}
              </CardDescription>
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => handleAddToCanvas(module)}
              >
                Add to Canvas
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-ui-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="h-8 w-8 text-text-secondary" />
          </div>
          <p className="text-text-secondary text-sm">No modules found</p>
        </div>
      )}

      {/* Documentation Dialog */}
      <Dialog open={showDocumentation} onOpenChange={setShowDocumentation}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedModule && (
            <ModuleDocumentation
              module={selectedModule}
              onClose={() => setShowDocumentation(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Custom Module Dialog */}
      <CreateCustomModuleDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateModule={createModule}
      />
    </div>
  );
};

export default ModuleLibrary;
