
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from 'lucide-react';
import ProjectCard from './ProjectCard';
import CreateProjectDialog from '../projects/CreateProjectDialog';
import { useProjects } from '@/hooks/useProjects';

interface DashboardProps {
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
}

const Dashboard = ({ onCreateProject, onOpenProject }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    projects,
    isLoading,
    createProject,
    updateProject,
    duplicateProject,
    archiveProject,
    isCreating,
    isDuplicating,
    isArchiving
  } = useProjects();

  const handleCreateProject = () => {
    setShowCreateDialog(true);
  };

  const handleProjectCreated = () => {
    onCreateProject();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatLastModified = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-text-primary">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Projects</h1>
            <p className="text-text-secondary">Build and deploy Solana programs visually</p>
          </div>
          <Button 
            onClick={handleCreateProject}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-ui-base border-ui-accent text-text-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-ui-base border-ui-accent text-text-primary">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-ui-base border-ui-accent">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-ui-base border-ui-accent text-text-primary">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-ui-base border-ui-accent">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="token">Token</SelectItem>
              <SelectItem value="nft">NFT</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  lastModified: formatLastModified(project.updated_at)
                }}
                onOpen={onOpenProject}
                onSettings={(id) => console.log('Settings:', id)}
                onDuplicate={(id) => {
                  duplicateProject(id);
                }}
                onArchive={(id) => {
                  archiveProject(id);
                }}
                isDuplicating={isDuplicating}
                isArchiving={isArchiving}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-ui-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-12 w-12 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-text-secondary mb-6">
              {projects.length === 0 
                ? 'Create your first Solana program to get started' 
                : 'Try adjusting your search or filters'
              }
            </p>
            <Button 
              onClick={handleCreateProject}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={(data) => {
          createProject(data);
          handleProjectCreated();
        }}
        isCreating={isCreating}
      />
    </div>
  );
};

export default Dashboard;
