import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { SolanaTestRunner, TestResult } from '@/utils/solanaUtils';
import { useToast } from '@/hooks/use-toast';

interface TestRunnerProps {
  instructions: string[];
  network: 'devnet' | 'mainnet';
  onTestComplete?: (results: TestResult[]) => void;
}

const TestRunner = ({ instructions, network, onTestComplete }: TestRunnerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      const testRunner = new SolanaTestRunner(network);
      const testResults: TestResult[] = [];

      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        const result = await testRunner.runTests([instruction], "");
        
        testResults.push(...result);
        setResults([...testResults]);
        setProgress(((i + 1) / instructions.length) * 100);
      }

      const successCount = testResults.filter(r => r.success).length;
      const failCount = testResults.filter(r => !r.success).length;

      toast({
        title: "Tests completed",
        description: `${successCount} passed, ${failCount} failed`,
        variant: successCount === testResults.length ? "default" : "destructive"
      });

      onTestComplete?.(testResults);
    } catch (error) {
      toast({
        title: "Test execution failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Test Runner</span>
            <Badge variant="outline">{network}</Badge>
          </CardTitle>
          <Button
            onClick={runTests}
            disabled={isRunning || instructions.length === 0}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.success)}
                    <span className="text-sm font-mono">{result.instruction}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{result.duration}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {instructions.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No instructions to test. Add some modules to your canvas first.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestRunner;
