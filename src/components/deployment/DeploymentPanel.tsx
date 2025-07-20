
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, Globe, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { ProgramDeployer, DeploymentResult } from '@/utils/solanaUtils';
import { useToast } from '@/hooks/use-toast';

interface DeploymentPanelProps {
  programCode: string;
}

const DeploymentPanel = ({ programCode }: DeploymentPanelProps) => {
  const [network, setNetwork] = useState<'devnet' | 'mainnet'>('devnet');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const deployProgram = async () => {
    if (!programCode.trim()) {
      toast({
        title: "No code to deploy",
        description: "Generate some code first before deploying.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      const deployer = new ProgramDeployer(network);
      const result = await deployer.deployProgram(programCode, network);
      
      setDeploymentResult(result);

      if (result.success) {
        toast({
          title: "Deployment successful!",
          description: `Program deployed to ${network} with ID: ${result.programId.slice(0, 8)}...`,
        });
      } else {
        toast({
          title: "Deployment failed",
          description: result.error || "Unknown deployment error",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Deployment error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="h-5 w-5" />
          <span>Program Deployment</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Network</label>
          <Select value={network} onValueChange={(value: 'devnet' | 'mainnet') => setNetwork(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="devnet">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Devnet (Testing)</span>
                </div>
              </SelectItem>
              <SelectItem value="mainnet">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Mainnet (Production)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={deployProgram}
            disabled={isDeploying || !programCode.trim()}
            className="flex-1"
          >
            {isDeploying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            {isDeploying ? 'Deploying...' : 'Deploy Program'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowCode(!showCode)}
            disabled={!programCode.trim()}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {showCode && programCode.trim() && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Code Preview</label>
            <Textarea
              value={programCode}
              readOnly
              className="font-mono text-xs h-40 resize-none"
            />
          </div>
        )}

        {deploymentResult && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              {deploymentResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {deploymentResult.success ? 'Deployment Successful' : 'Deployment Failed'}
              </span>
              <Badge variant={deploymentResult.success ? 'default' : 'destructive'}>
                {deploymentResult.network}
              </Badge>
            </div>

            {deploymentResult.success && (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Program ID:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 p-2 bg-background rounded text-xs">
                      {deploymentResult.programId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://solscan.io/account/${deploymentResult.programId}${network === 'devnet' ? '?cluster=devnet' : ''}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View on Solscan</span>
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Transaction:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 p-2 bg-background rounded text-xs">
                      {deploymentResult.signature}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://solscan.io/tx/${deploymentResult.signature}${network === 'devnet' ? '?cluster=devnet' : ''}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View TX</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!deploymentResult.success && deploymentResult.error && (
              <div className="text-sm text-red-600">
                <span className="font-medium">Error:</span> {deploymentResult.error}
              </div>
            )}
          </div>
        )}

        {!programCode.trim() && (
          <div className="text-center text-muted-foreground py-8">
            <Rocket className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Generate code from your canvas modules to enable deployment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeploymentPanel;
