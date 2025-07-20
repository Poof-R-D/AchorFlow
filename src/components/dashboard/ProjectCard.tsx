
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Settings, Copy, Archive, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'deployed' | 'error';
  type: 'token' | 'nft' | 'governance' | 'custom';
  lastModified: string;
  network: 'devnet' | 'mainnet';
}

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onSettings: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
  onArchive: (projectId: string) => void;
  isDuplicating?: boolean;
  isArchiving?: boolean;
}

const ProjectCard = ({ 
  project, 
  onOpen, 
  onSettings, 
  onDuplicate, 
  onArchive,
  isDuplicating = false,
  isArchiving = false
}: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'token': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'nft': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'governance': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'mainnet': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="card-custom border-ui-accent hover:border-text-primary/20 transition-all duration-300 group hover-glow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-semibold text-text-primary group-hover:text-text-primary transition-colors duration-150">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="text-text-secondary text-base line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-ui-accent"
                disabled={isDuplicating || isArchiving}
              >
                {(isDuplicating || isArchiving) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-ui-base border-ui-accent">
              <DropdownMenuItem 
                onClick={() => onSettings(project.id)} 
                className="text-text-secondary hover:text-text-primary hover:bg-ui-accent"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDuplicate(project.id)} 
                className="text-text-secondary hover:text-text-primary hover:bg-ui-accent"
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4 mr-3" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onArchive(project.id)} 
                className="text-text-secondary hover:text-text-primary hover:bg-ui-accent"
                disabled={isArchiving}
              >
                <Archive className="h-4 w-4 mr-3" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getStatusColor(project.status)} text-sm px-3 py-1 capitalize`}>
              {project.status}
            </Badge>
            <Badge className={`${getTypeColor(project.type)} text-sm px-3 py-1 capitalize`}>
              {project.type}
            </Badge>
            <Badge className={`${getNetworkColor(project.network)} text-sm px-3 py-1 capitalize`}>
              {project.network}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Modified {project.lastModified}
          </span>
          <Button 
            onClick={() => onOpen(project.id)}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Open</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
