import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Database, 
  Zap, 
  Coins, 
  Image, 
  Users, 
  Code, 
  Clock,
  Info 
} from 'lucide-react';

const ConnectionTypesPanel = () => {
  const connectionTypes = [
    {
      type: 'data',
      name: 'Data Flow',
      description: 'Transfers data between modules',
      color: 'bg-blue-500',
      icon: Database,
      examples: ['Account data', 'Transaction params', 'User input']
    },
    {
      type: 'instruction',
      name: 'Instruction Flow',
      description: 'Sequential execution of instructions',
      color: 'bg-purple-500',
      icon: Zap,
      examples: ['Program logic', 'Smart contract calls', 'State changes']
    },
    {
      type: 'token',
      name: 'Token Flow',
      description: 'Token transfers and operations',
      color: 'bg-yellow-500',
      icon: Coins,
      examples: ['SPL tokens', 'Mint operations', 'Token burns']
    },
    {
      type: 'account',
      name: 'Account Flow',
      description: 'Account creation and management',
      color: 'bg-green-500',
      icon: Users,
      examples: ['PDA accounts', 'User accounts', 'System accounts']
    },
    {
      type: 'nft',
      name: 'NFT Flow',
      description: 'NFT creation and metadata',
      color: 'bg-pink-500',
      icon: Image,
      examples: ['Metaplex NFTs', 'Collection items', 'Metadata updates']
    },
    {
      type: 'flow',
      name: 'Control Flow',
      description: 'Program execution control',
      color: 'bg-orange-500',
      icon: ArrowRight,
      examples: ['Start/end points', 'Conditional logic', 'Loop controls']
    }
  ];

  const compatibilityRules = [
    {
      from: 'data',
      to: ['instruction', 'account'],
      description: 'Data can feed into instructions and account operations'
    },
    {
      from: 'instruction',
      to: ['data', 'token', 'nft'],
      description: 'Instructions can output data, tokens, or NFTs'
    },
    {
      from: 'token',
      to: ['instruction', 'account'],
      description: 'Tokens can be used in instructions or account operations'
    },
    {
      from: 'account',
      to: ['instruction', 'data'],
      description: 'Accounts provide data and enable instructions'
    },
    {
      from: 'flow',
      to: ['instruction', 'data', 'account'],
      description: 'Control flow can trigger any operation type'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-ui-base border-ui-accent">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Connection Types Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary text-sm">
            Understanding connection types helps you build more efficient Solana programs. 
            Each type represents a different kind of data or control flow.
          </p>
          
          <div className="grid gap-3">
            {connectionTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div key={type.type} className="p-3 bg-ui-accent rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-text-primary font-medium text-sm">{type.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {type.type}
                        </Badge>
                      </div>
                      <p className="text-text-secondary text-xs mb-2">{type.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {type.examples.map((example, idx) => (
                          <span key={idx} className="text-xs bg-ui-base px-2 py-1 rounded text-text-secondary">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-ui-base border-ui-accent">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Compatibility Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-text-secondary text-sm">
            These rules determine which connection types can be linked together:
          </p>
          
          <div className="space-y-3">
            {compatibilityRules.map((rule, idx) => (
              <div key={idx} className="p-3 bg-ui-accent rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {rule.from}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-text-secondary" />
                  <div className="flex space-x-1">
                    {rule.to.map((toType) => (
                      <Badge key={toType} variant="secondary" className="text-xs">
                        {toType}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-text-secondary text-xs">{rule.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pro Tip</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs">
              When connecting modules, the AI Assistant can automatically suggest the best connection types 
              and help optimize your program flow for better performance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionTypesPanel;
