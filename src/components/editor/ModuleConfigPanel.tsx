
import React, { useState, useEffect } from 'react';
import { CanvasNode } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Code, Database, Link } from 'lucide-react';

interface ModuleConfigPanelProps {
  node: CanvasNode;
  onUpdate: (nodeId: string, updates: Partial<CanvasNode>) => void;
  onClose: () => void;
  connections: any[];
}

interface ModuleConfig {
  parameters: Record<string, any>;
  accounts: Record<string, any>;
  constraints: string[];
  customCode: string;
}

const ModuleConfigPanel = ({ node, onUpdate, onClose, connections }: ModuleConfigPanelProps) => {
  const [config, setConfig] = useState<ModuleConfig>({
    parameters: {},
    accounts: {},
    constraints: [],
    customCode: ''
  });

  const [activeTab, setActiveTab] = useState('parameters');

  useEffect(() => {
    // Load existing configuration from node
    if (node.code) {
      try {
        const existingConfig = JSON.parse(node.code);
        setConfig(existingConfig);
      } catch (error) {
        console.log('No existing config found, using defaults');
      }
    }
  }, [node]);

  const handleSave = () => {
    onUpdate(node.id, {
      code: JSON.stringify(config),
      description: `Configured ${node.type} module`
    });
    onClose();
  };

  const handleParameterChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value }
    }));
  };

  const handleAccountChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      accounts: { ...prev.accounts, [key]: value }
    }));
  };

  const addConstraint = () => {
    const newConstraint = prompt('Enter constraint:');
    if (newConstraint) {
      setConfig(prev => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint]
      }));
    }
  };

  const removeConstraint = (index: number) => {
    setConfig(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const getModuleSpecificConfig = () => {
    switch (node.type.toLowerCase()) {
      case 'token':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                value={config.parameters.tokenName || ''}
                onChange={(e) => handleParameterChange('tokenName', e.target.value)}
                placeholder="My Token"
              />
            </div>
            <div>
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input
                id="tokenSymbol"
                value={config.parameters.tokenSymbol || ''}
                onChange={(e) => handleParameterChange('tokenSymbol', e.target.value)}
                placeholder="MTK"
              />
            </div>
            <div>
              <Label htmlFor="decimals">Decimals</Label>
              <Select
                value={config.parameters.decimals?.toString() || '9'}
                onValueChange={(value) => handleParameterChange('decimals', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="initialSupply">Initial Supply</Label>
              <Input
                id="initialSupply"
                type="number"
                value={config.parameters.initialSupply || ''}
                onChange={(e) => handleParameterChange('initialSupply', e.target.value)}
                placeholder="1000000"
              />
            </div>
          </div>
        );
      
      case 'nft':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="collectionName">Collection Name</Label>
              <Input
                id="collectionName"
                value={config.parameters.collectionName || ''}
                onChange={(e) => handleParameterChange('collectionName', e.target.value)}
                placeholder="My NFT Collection"
              />
            </div>
            <div>
              <Label htmlFor="maxSupply">Max Supply</Label>
              <Input
                id="maxSupply"
                type="number"
                value={config.parameters.maxSupply || ''}
                onChange={(e) => handleParameterChange('maxSupply', e.target.value)}
                placeholder="10000"
              />
            </div>
            <div>
              <Label htmlFor="royalty">Royalty (%)</Label>
              <Input
                id="royalty"
                type="number"
                value={config.parameters.royalty || ''}
                onChange={(e) => handleParameterChange('royalty', e.target.value)}
                placeholder="5"
                min="0"
                max="100"
              />
            </div>
          </div>
        );
      
      case 'defi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="poolType">Pool Type</Label>
              <Select
                value={config.parameters.poolType || ''}
                onValueChange={(value) => handleParameterChange('poolType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pool type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquidity">Liquidity Pool</SelectItem>
                  <SelectItem value="staking">Staking Pool</SelectItem>
                  <SelectItem value="lending">Lending Pool</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feeRate">Fee Rate (%)</Label>
              <Input
                id="feeRate"
                type="number"
                value={config.parameters.feeRate || ''}
                onChange={(e) => handleParameterChange('feeRate', e.target.value)}
                placeholder="0.3"
                step="0.1"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customParam">Custom Parameter</Label>
              <Input
                id="customParam"
                value={config.parameters.customParam || ''}
                onChange={(e) => handleParameterChange('customParam', e.target.value)}
                placeholder="Enter custom parameter"
              />
            </div>
          </div>
        );
    }
  };

  const connectedNodes = connections.filter(
    conn => conn.sourceNodeId === node.id || conn.targetNodeId === node.id
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[600px] max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {node.name}
            <Badge variant="outline">{node.type}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="parameters" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4" />
                <h3 className="font-medium">Module Parameters</h3>
              </div>
              {getModuleSpecificConfig()}
            </TabsContent>
            
            <TabsContent value="accounts" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-4 w-4" />
                <h3 className="font-medium">Account Configuration</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="authorityType">Authority Type</Label>
                  <Select
                    value={config.accounts.authorityType || 'signer'}
                    onValueChange={(value) => handleAccountChange('authorityType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signer">Signer</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="pda">PDA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    value={config.accounts.accountType || 'mutable'}
                    onValueChange={(value) => handleAccountChange('accountType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mutable">Mutable</SelectItem>
                      <SelectItem value="readonly">Read-only</SelectItem>
                      <SelectItem value="init">Initialize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="constraints" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Link className="h-4 w-4" />
                <h3 className="font-medium">Constraints & Validation</h3>
              </div>
              <div className="space-y-2">
                {config.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {constraint}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeConstraint(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <Button onClick={addConstraint} variant="outline" size="sm">
                  Add Constraint
                </Button>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Connected Modules ({connectedNodes.length})</h4>
                {connectedNodes.length > 0 ? (
                  <div className="space-y-1">
                    {connectedNodes.map((conn, index) => (
                      <Badge key={index} variant="outline">
                        Connection {index + 1}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No connections found</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-4 w-4" />
                <h3 className="font-medium">Custom Code</h3>
              </div>
              <div>
                <Label htmlFor="customCode">Custom Rust Code</Label>
                <Textarea
                  id="customCode"
                  value={config.customCode}
                  onChange={(e) => setConfig(prev => ({ ...prev, customCode: e.target.value }))}
                  placeholder="// Add custom Rust code here..."
                  className="font-mono text-sm"
                  rows={10}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleConfigPanel;
