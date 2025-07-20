import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState({
    displayName: '',
    email: '',
    theme: 'dark',
    language: 'en',
    notifications: {
      deployments: true,
      errors: true,
      updates: true,
    },
    privacy: {
      analytics: true,
      publicProfile: false,
    },
    editor: {
      gridSnap: true,
      autoSave: true,
      codeGeneration: 'typescript',
    }
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Here you would save settings to backend/localStorage
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-ui-base border-ui-accent max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-text-primary" />
              <h3 className="text-lg font-medium text-text-primary">Profile</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-text-primary">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  placeholder="Your display name"
                  className="bg-ui-base border-ui-accent text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-primary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-ui-base border-ui-accent text-text-primary"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-ui-accent" />

          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-text-primary" />
              <h3 className="text-lg font-medium text-text-primary">Appearance</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-text-primary">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                  <SelectTrigger className="bg-ui-base border-ui-accent text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-ui-base border-ui-accent">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-text-primary">Language</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                  <SelectTrigger className="bg-ui-base border-ui-accent text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-ui-base border-ui-accent">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="bg-ui-accent" />

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-text-primary" />
              <h3 className="text-lg font-medium text-text-primary">Notifications</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Deployment Notifications</Label>
                  <p className="text-sm text-text-secondary">Get notified when programs are deployed</p>
                </div>
                <Switch
                  checked={settings.notifications.deployments}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, deployments: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Error Notifications</Label>
                  <p className="text-sm text-text-secondary">Get notified about compilation errors</p>
                </div>
                <Switch
                  checked={settings.notifications.errors}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, errors: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Product Updates</Label>
                  <p className="text-sm text-text-secondary">Get notified about new features</p>
                </div>
                <Switch
                  checked={settings.notifications.updates}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, updates: checked }
                  })}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-ui-accent" />

          {/* Editor Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-text-primary" />
              <h3 className="text-lg font-medium text-text-primary">Editor</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Grid Snap</Label>
                  <p className="text-sm text-text-secondary">Snap nodes to grid when moving</p>
                </div>
                <Switch
                  checked={settings.editor.gridSnap}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    editor: { ...settings.editor, gridSnap: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Auto Save</Label>
                  <p className="text-sm text-text-secondary">Automatically save changes</p>
                </div>
                <Switch
                  checked={settings.editor.autoSave}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    editor: { ...settings.editor, autoSave: checked }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-primary">Code Generation</Label>
                <Select 
                  value={settings.editor.codeGeneration} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    editor: { ...settings.editor, codeGeneration: value }
                  })}
                >
                  <SelectTrigger className="bg-ui-base border-ui-accent text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-ui-base border-ui-accent">
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="bg-ui-accent" />

          {/* Privacy Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-text-primary" />
              <h3 className="text-lg font-medium text-text-primary">Privacy</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Analytics</Label>
                  <p className="text-sm text-text-secondary">Help improve the product with usage data</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, analytics: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary">Public Profile</Label>
                  <p className="text-sm text-text-secondary">Make your projects publicly visible</p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, publicProfile: checked }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-ui-accent text-text-secondary hover:bg-ui-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
