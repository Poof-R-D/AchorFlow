
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateProjectData } from '@/hooks/useProjects';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (data: CreateProjectData) => void;
  isCreating: boolean;
}

const CreateProjectDialog = ({ open, onOpenChange, onCreateProject, isCreating }: CreateProjectDialogProps) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    type: 'token',
    network: 'devnet',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreateProject(formData);
    setFormData({ name: '', description: '', type: 'token', network: 'devnet' });
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', type: 'token', network: 'devnet' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-ui-base border-ui-accent">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Create New Project</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Start building your Solana program with our visual editor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-text-primary">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name..."
              className="bg-ui-base border-ui-accent text-text-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              className="bg-ui-base border-ui-accent text-text-primary"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-text-primary">Project Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-ui-base border-ui-accent text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-ui-base border-ui-accent">
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network" className="text-text-primary">Network</Label>
              <Select value={formData.network} onValueChange={(value: any) => setFormData({ ...formData, network: value })}>
                <SelectTrigger className="bg-ui-base border-ui-accent text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-ui-base border-ui-accent">
                  <SelectItem value="devnet">Devnet</SelectItem>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-ui-accent text-text-secondary hover:bg-ui-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || isCreating}
              className="btn-primary"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
