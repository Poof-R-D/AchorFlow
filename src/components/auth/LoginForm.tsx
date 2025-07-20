
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Mail, Wallet, UserX } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
  onOAuthLogin: (provider: 'github' | 'google') => void;
  onAnonymousLogin: () => void;
  onWalletLogin: () => void;
}

const LoginForm = ({ onLogin, onSignup, onOAuthLogin, onAnonymousLogin, onWalletLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(email, password, name);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-ui-base border-ui-accent">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-text-primary">
            Welcome to AnchorFlow
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Build Solana programs visually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary: Create Account */}
          <Tabs defaultValue="signup" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-ui-accent">
              <TabsTrigger value="signup" className="data-[state=active]:bg-text-primary data-[state=active]:text-ui-base">Sign Up</TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-text-primary data-[state=active]:text-ui-base">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-ui-accent border-ui-accent text-text-primary placeholder:text-text-secondary"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-ui-accent border-ui-accent text-text-primary placeholder:text-text-secondary"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-ui-accent border-ui-accent text-text-primary placeholder:text-text-secondary"
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-primary text-lg py-4 rounded-lg font-semibold">
                  Create Account
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-ui-accent border-ui-accent text-text-primary placeholder:text-text-secondary"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-ui-accent border-ui-accent text-text-primary placeholder:text-text-secondary"
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-primary">
                  Sign In
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-ui-accent" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-ui-base px-2 text-text-secondary">Or continue with</span>
            </div>
          </div>
          
          {/* GitHub OAuth */}
          <Button
            variant="outline"
            onClick={() => onOAuthLogin('github')}
            className="w-full border-ui-accent hover:bg-ui-accent text-text-primary"
          >
            <Github className="h-4 w-4 mr-2" />
            Continue with GitHub
          </Button>

          {/* Guest access moved to bottom and made less prominent */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onAnonymousLogin}
              className="text-text-secondary hover:text-text-primary text-sm"
            >
              <UserX className="h-4 w-4 mr-2" />
              Continue as Guest
            </Button>
            <p className="text-text-secondary text-xs mt-1">
              Limited features available. Connect wallet after login for full access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
