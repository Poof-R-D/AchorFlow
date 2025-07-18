
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { ProgramDeployer } from '@/utils/solanaUtils';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  signature: string;
  status: 'confirmed' | 'finalized' | 'failed' | 'pending';
  timestamp: number;
}

const TransactionMonitor = () => {
  const [signature, setSignature] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const addTransaction = async () => {
    if (!signature.trim()) {
      toast({
        title: "Invalid signature",
        description: "Please enter a valid transaction signature.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction: Transaction = {
      signature: signature.trim(),
      status: 'pending',
      timestamp: Date.now(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setSignature('');
    
    // Start monitoring this transaction
    monitorTransaction(newTransaction.signature);
  };

  const monitorTransaction = async (txSignature: string) => {
    setIsMonitoring(true);
    
    try {
      const deployer = new ProgramDeployer();
      const status = await deployer.monitorTransaction(txSignature);
      
      setTransactions(prev => 
        prev.map(tx => 
          tx.signature === txSignature 
            ? { ...tx, status }
            : tx
        )
      );

      if (status === 'confirmed' || status === 'finalized') {
        toast({
          title: "Transaction confirmed",
          description: `Transaction ${txSignature.slice(0, 8)}... is ${status}`,
        });
      } else if (status === 'failed') {
        toast({
          title: "Transaction failed",
          description: `Transaction ${txSignature.slice(0, 8)}... has failed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Monitoring error",
        description: error instanceof Error ? error.message : "Failed to monitor transaction",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  const refreshAllTransactions = async () => {
    setIsMonitoring(true);
    
    const pendingTransactions = transactions.filter(tx => 
      tx.status === 'pending' || tx.status === 'confirmed'
    );

    for (const tx of pendingTransactions) {
      await monitorTransaction(tx.signature);
    }
    
    setIsMonitoring(false);
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'finalized':
        return 'bg-green-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const openInExplorer = (signature: string) => {
    const url = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Transaction Monitor</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllTransactions}
            disabled={isMonitoring}
          >
            <RefreshCw className={`h-4 w-4 ${isMonitoring ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter transaction signature..."
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTransaction()}
          />
          <Button onClick={addTransaction} disabled={!signature.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <h4 className="font-medium">Monitored Transactions</h4>
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(tx.status)}`} />
                  <div>
                    <code className="text-sm font-mono">
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </code>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {tx.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInExplorer(tx.signature)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No transactions being monitored.</p>
            <p className="text-sm">Add a transaction signature to start monitoring.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionMonitor;
