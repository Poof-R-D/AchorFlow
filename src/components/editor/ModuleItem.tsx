
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ModuleItemProps {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  onAdd: (type: string) => void;
}

export const ModuleItem = ({ type, label, icon: Icon, description, onAdd }: ModuleItemProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('module-type', type);
  };

  return (
    <div
      className="p-3 border border-ui-accent rounded-lg cursor-grab hover:bg-ui-accent/10 transition-colors"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <p className="text-xs text-text-secondary mb-2">{description}</p>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs"
        onClick={() => onAdd(type)}
      >
        Add to Canvas
      </Button>
    </div>
  );
};
