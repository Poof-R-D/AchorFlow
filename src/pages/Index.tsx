import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Canvas from '@/components/editor/Canvas';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ModuleTemplate } from '@/types/modules';

const Index = () => {
  const { user, loading, signIn, signUp, signInAnonymously, signOut, signInWithProvider, signInWithWallet } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    console.log('Signup attempt:', { email, password, name });
    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created successfully!",
        description: "Welcome to AnchorFlow. Check your email to confirm your account.",
      });
    }
  };

  const handleAnonymousLogin = async () => {
    console.log('Anonymous login attempt');
    const { error } = await signInAnonymously();
    
    if (error) {
      toast({
        title: "Anonymous login failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome to AnchorFlow!",
        description: "You're now using the app as a guest.",
      });
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    console.log('OAuth login:', provider);
    const { error } = await signInWithProvider(provider);
    
    if (error) {
      toast({
        title: "OAuth login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleWalletLogin = async () => {
    console.log('Wallet login attempt');
    const { error } = await signInWithWallet();
    
    if (error) {
      toast({
        title: "Wallet authentication",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView('dashboard');
    toast({
      title: "Logged out successfully",
      description: "Come back soon!",
    });
  };

  const handleCreateProject = () => {
    setCurrentView('editor');
    setCurrentProjectId(null); // New project
    toast({
      title: "Project created!",
      description: "Start building with the visual editor.",
    });
  };

  const handleOpenProject = (projectId: string) => {
    console.log('Opening project:', projectId);
    setCurrentProjectId(projectId);
    setCurrentView('editor');
    toast({
      title: "Project opened",
      description: "Continue building your Solana program.",
    });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentProjectId(null);
  };

  const handleGenerate = () => {
    toast({
      title: "Code generated!",
      description: "Your Anchor Rust code is ready for review.",
    });
  };

  const handleTest = () => {
    toast({
      title: "Running tests...",
      description: "Testing your program on Devnet.",
    });
  };

  const handleAddModule = (moduleType: string, template?: ModuleTemplate) => {
    console.log('Adding module to canvas:', { moduleType, template });
    toast({
      title: "Module added",
      description: `${template?.name || moduleType} has been added to the canvas.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <LoginForm 
          onLogin={handleLogin}
          onSignup={handleSignup}
          onAnonymousLogin={handleAnonymousLogin}
          onOAuthLogin={handleOAuthLogin}
          onWalletLogin={handleWalletLogin}
        />
        <Footer />
      </div>
    );
  }

  const userName = user.is_anonymous 
    ? 'Guest User' 
    : user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header 
        user={{ name: userName, email: user.email || 'guest@anonymous.com' }}
        onLogin={() => {}}
        onLogout={handleLogout}
        showBackButton={currentView === 'editor'}
        onBack={currentView === 'editor' ? handleBackToDashboard : undefined}
      />
      
      <div className="flex-1 flex flex-col">
        {currentView === 'dashboard' && (
          <div className="flex-1">
            <Dashboard 
              onCreateProject={handleCreateProject}
              onOpenProject={handleOpenProject}
            />
          </div>
        )}
        
        {currentView === 'editor' && (
          <div className="flex-1 h-[calc(100vh-89px)]">
            <Canvas 
              onGenerate={handleGenerate} 
              onTest={handleTest}
              projectId={currentProjectId}
            />
          </div>
        )}
        
        {/* Footer only shows in dashboard to prevent UI overlap */}
        {currentView === 'dashboard' && <Footer />}
      </div>
    </div>
  );
};

export default Index;
