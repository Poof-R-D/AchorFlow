import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.7,
    maxTokens: 1000,
    autoExplain: true,
    suggestOptimizations: true
  });
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const { toast } = useToast();

  if (!isOpen) return null;

  const testApiConnection = async () => {
    try {
      const response = await supabase.functions.invoke('test-ai-connection');
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.success) {
        setApiKeyStatus('valid');
        toast({
          title: "API Connection Successful",
          description: "Your OpenAI API key is working correctly.",
        });
      } else {
        setApiKeyStatus('invalid');
        toast({
          title: "API Connection Failed",
          description: response.data.error || "Please check your OpenAI API key configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setApiKeyStatus('invalid');
      toast({
        title: "Connection Error",
        description: "Unable to test API connection.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="absolute top-16 right-4 w-96 bg-ui-base border border-ui-accent rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Project Settings</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Configuration */}
          <div>
            <h3 className="font-medium mb-3">Project Configuration</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="My Solana Program" />
              </div>
              <div>
                <Label htmlFor="program-version">Program Version</Label>
                <Input id="program-version" placeholder="0.1.0" />
              </div>
              <div>
                <Label>Network</Label>
                <Select defaultValue="devnet">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devnet">Devnet</SelectItem>
                    <SelectItem value="testnet">Testnet</SelectItem>
                    <SelectItem value="mainnet">Mainnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Assistant Configuration */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Assistant
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
                <Switch 
                  id="ai-enabled" 
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              
              {aiSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select 
                      value={aiSettings.model} 
                      onValueChange={(value) => setAiSettings(prev => ({ ...prev, model: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (Recommended)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-explain">Auto-explain program changes</Label>
                    <Switch 
                      id="auto-explain" 
                      checked={aiSettings.autoExplain}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, autoExplain: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="suggest-optimizations">Suggest optimizations</Label>
                    <Switch 
                      id="suggest-optimizations" 
                      checked={aiSettings.suggestOptimizations}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, suggestOptimizations: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>API Connection Status</Label>
                      {apiKeyStatus === 'valid' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {apiKeyStatus === 'invalid' && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {apiKeyStatus === 'unknown' && (
                        <Badge variant="outline">
                          Not tested
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={testApiConnection} className="w-full">
                      Test AI Connection
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Code Generation Settings */}
          <div>
            <h3 className="font-medium mb-3">Code Generation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-tests">Include Tests</Label>
                <Switch id="include-tests" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="add-comments">Add Comments</Label>
                <Switch id="add-comments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="optimize-code">Optimize Code</Label>
                <Switch id="optimize-code" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-enhance-code">AI-Enhanced Code Generation</Label>
                <Switch id="ai-enhance-code" defaultChecked={aiSettings.enabled} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Visual Settings */}
          <div>
            <h3 className="font-medium mb-3">Visual Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid">Show Grid</Label>
                <Switch id="show-grid" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-arrange">Auto-arrange Modules</Label>
                <Switch id="auto-arrange" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-ai-suggestions">Show AI Suggestions</Label>
                <Switch id="show-ai-suggestions" defaultChecked />
              </div>
              <div>
                <Label>Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Custom Instructions */}
          <div>
            <h3 className="font-medium mb-3">Custom AI Instructions</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="custom-prompt">AI Assistant Behavior</Label>
                <Textarea
                  id="custom-prompt"
                  className="w-full p-2 border border-ui-accent rounded text-sm"
                  rows={4}
                  placeholder="Tell the AI how you prefer it to help you... (e.g., 'Always prioritize security and gas optimization', 'Focus on beginner-friendly explanations', etc.)"
                />
              </div>
              <div>
                <Label htmlFor="coding-style">Preferred Coding Style</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Anchor</SelectItem>
                    <SelectItem value="verbose">Verbose with Comments</SelectItem>
                    <SelectItem value="minimal">Minimal & Clean</SelectItem>
                    <SelectItem value="security-focused">Security-Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
