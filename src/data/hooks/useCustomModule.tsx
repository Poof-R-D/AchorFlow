
import { useState, useEffect } from 'react';
import { CustomModule } from '@/types/modules';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useCustomModules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customModules, setCustomModules] = useState<CustomModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load custom modules from localStorage (in a real app, this would be from a database)
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`custom-modules-${user.id}`);
      if (saved) {
        try {
          setCustomModules(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading custom modules:', error);
        }
      }
    }
  }, [user]);

  // Save custom modules to localStorage
  const saveModules = (modules: CustomModule[]) => {
    if (user) {
      localStorage.setItem(`custom-modules-${user.id}`, JSON.stringify(modules));
      setCustomModules(modules);
    }
  };

  const createModule = async (moduleData: Omit<CustomModule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create custom modules.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newModule: CustomModule = {
        ...moduleData,
        id: crypto.randomUUID(),
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedModules = [...customModules, newModule];
      saveModules(updatedModules);

      toast({
        title: "Module created successfully!",
        description: `${newModule.name} has been added to your custom modules.`,
      });

      return newModule;
    } catch (error) {
      toast({
        title: "Failed to create module",
        description: "There was an error creating your custom module.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateModule = async (id: string, updates: Partial<CustomModule>) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const updatedModules = customModules.map(module =>
        module.id === id
          ? { ...module, ...updates, updatedAt: new Date().toISOString() }
          : module
      );

      saveModules(updatedModules);

      toast({
        title: "Module updated successfully!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to update module",
        description: "There was an error updating your module.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteModule = async (id: string) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const updatedModules = customModules.filter(module => module.id !== id);
      saveModules(updatedModules);

      toast({
        title: "Module deleted successfully!",
        description: "The custom module has been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete module",
        description: "There was an error deleting your module.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customModules,
    isLoading,
    createModule,
    updateModule,
    deleteModule,
  };
};
