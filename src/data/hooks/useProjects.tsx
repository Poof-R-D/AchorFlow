
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: 'token' | 'nft' | 'governance' | 'custom';
  status: 'draft' | 'deployed' | 'error';
  network: 'devnet' | 'mainnet';
  project_data?: any;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  type: 'token' | 'nft' | 'governance' | 'custom';
  network?: 'devnet' | 'mainnet';
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  type?: 'token' | 'nft' | 'governance' | 'custom';
  status?: 'draft' | 'deployed' | 'error';
  network?: 'devnet' | 'mainnet';
  project_data?: any;
}

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          user_id: user.id,
          network: projectData.network || 'devnet',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project created successfully!",
        description: "Your new project is ready to build.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateProjectData) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project updated successfully!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Duplicate project mutation
  const duplicateProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('User not authenticated');

      // First, get the original project
      const { data: originalProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // Create a copy with a new name
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: `${originalProject.name} (Copy)`,
          description: originalProject.description,
          type: originalProject.type,
          network: originalProject.network,
          project_data: originalProject.project_data,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project duplicated successfully!",
        description: "A copy of your project has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to duplicate project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Archive project mutation
  const archiveProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ is_archived: true })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project archived successfully!",
        description: "The project has been moved to your archive.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to archive project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project deleted successfully!",
        description: "The project has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    duplicateProject: duplicateProjectMutation.mutate,
    archiveProject: archiveProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDuplicating: duplicateProjectMutation.isPending,
    isArchiving: archiveProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};
