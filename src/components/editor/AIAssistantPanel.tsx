import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Send, Lightbulb, Code, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateModule?: (moduleData: any) => void;
  onExplainProgram?: (explanation: string) => void;
  nodes: any[];
  connections: any[];
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  moduleData?: any;
}

const AIAssistantPanel = ({ isOpen, onClose, onCreateModule, onExplainProgram, nodes, connections }: AIAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant for building Solana programs. I can help you create custom modules, explain your program structure, and guide you through development. What would you like to build?",
      timestamp: new Date(),
      suggestions: [
        "Create a token transfer instruction",
        "Explain my current program flow",
        "Build a staking rewards module",
        "Add account validation logic"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customModulePrompt, setCustomModulePrompt] = useState('');
  const [showModuleCreator, setShowModuleCreator] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const callOpenAI = async (prompt: string, context?: string) => {
    try {
      const response = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: prompt,
          context: context || `Current program has ${nodes.length} modules and ${connections.length} connections.`,
          programData: { nodes, connections }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.response;
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await callOpenAI(currentInput);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: generateContextualSuggestions(currentInput, aiResponse)
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Check if this was a program explanation request
      if (currentInput.toLowerCase().includes('explain') && onExplainProgram) {
        onExplainProgram(aiResponse);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please make sure your OpenAI API key is configured correctly.",
        timestamp: new Date(),
        suggestions: ["Check API configuration", "Try again", "Use offline mode"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Connection Error",
        description: "Unable to connect to AI service. Check your API key configuration.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleCreateCustomModule = async () => {
    if (!customModulePrompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-module', {
        body: {
          description: customModulePrompt,
          moduleType: 'instruction'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { moduleSpec } = response.data;
      
      // Parse AI response to extract module data
      const moduleData = {
        type: moduleSpec.type || 'instruction',
        name: moduleSpec.name || `AI Generated Module`,
        description: moduleSpec.description || customModulePrompt,
        color: getModuleColor(moduleSpec.type || 'instruction'),
        inputs: moduleSpec.inputs || generateDefaultPorts('input', moduleSpec.type || 'instruction'),
        outputs: moduleSpec.outputs || generateDefaultPorts('output', moduleSpec.type || 'instruction'),
        aiGenerated: true,
        prompt: customModulePrompt,
        code: moduleSpec.code,
        parameters: moduleSpec.parameters || []
      };
      
      if (onCreateModule && moduleData) {
        onCreateModule(moduleData);
        toast({
          title: "Module Created!",
          description: `AI has created a ${moduleData.name} module for you.`,
        });
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `I've created a "${moduleSpec.name}" module for you! ${moduleSpec.description}\n\n${moduleSpec.documentation || ''}`,
        timestamp: new Date(),
        moduleData: moduleData
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCustomModulePrompt('');
      setShowModuleCreator(false);

    } catch (error) {
      toast({
        title: "Module Creation Failed",
        description: "Unable to create module. Please try again.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const parseModuleFromAI = (aiResponse: string, originalPrompt: string) => {
    // Simple parsing - in production, this would be more sophisticated
    const moduleTypes = ['instruction', 'account', 'validator', 'processor'];
    const detectedType = moduleTypes.find(type => 
      aiResponse.toLowerCase().includes(type) || originalPrompt.toLowerCase().includes(type)
    ) || 'instruction';

    return {
      type: detectedType,
      name: extractModuleName(originalPrompt) || `AI Generated ${detectedType}`,
      description: originalPrompt,
      color: getModuleColor(detectedType),
      inputs: generateDefaultPorts('input', detectedType),
      outputs: generateDefaultPorts('output', detectedType),
      aiGenerated: true,
      prompt: originalPrompt,
      code: extractCodeFromResponse(aiResponse)
    };
  };

  const extractModuleName = (prompt: string) => {
    const words = prompt.split(' ').filter(word => word.length > 2);
    return words.slice(0, 3).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getModuleColor = (type: string) => {
    const colors = {
      instruction: 'from-blue-500 to-blue-600',
      account: 'from-green-500 to-green-600',
      validator: 'from-purple-500 to-purple-600',
      processor: 'from-orange-500 to-orange-600'
    };
    return colors[type] || colors.instruction;
  };

  const generateDefaultPorts = (portType: 'input' | 'output', moduleType: string) => {
    if (portType === 'input') {
      return [
        { id: crypto.randomUUID(), name: 'data', type: 'data' },
        { id: crypto.randomUUID(), name: 'accounts', type: 'accounts' }
      ];
    } else {
      return [
        { id: crypto.randomUUID(), name: 'result', type: 'data' },
        { id: crypto.randomUUID(), name: 'updated_accounts', type: 'accounts' }
      ];
    }
  };

  const extractCodeFromResponse = (response: string) => {
    const codeMatch = response.match(/```rust\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : null;
  };

  const generateContextualSuggestions = (input: string, response: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('create') || lowerInput.includes('module')) {
      return [
        "Add validation to this module",
        "Create a related account structure",
        "Generate tests for this module"
      ];
    }
    
    if (lowerInput.includes('explain')) {
      return [
        "How can I optimize this?",
        "Add error handling",
        "Create deployment guide"
      ];
    }
    
    return [
      "Create a custom module",
      "Explain program architecture",
      "Add security checks"
    ];
  };

  const explainCurrentProgram = async () => {
    const prompt = `Analyze this Solana program structure and provide a clear explanation:
    
    Modules: ${nodes.map(n => `${n.name} (${n.type})`).join(', ')}
    Connections: ${connections.length} connections between modules
    
    Please explain:
    1. What this program does
    2. The flow of data/control
    3. Potential issues or improvements
    4. Missing components`;

    setInputMessage(prompt);
    handleSendMessage();
  };

  const quickActions = [
    {
      icon: Lightbulb,
      title: "Explain Program Flow",
      description: "Get an AI explanation of your current program",
      action: explainCurrentProgram
    },
    {
      icon: Code,
      title: "Create Custom Module",
      description: "Describe a module and I'll create it",
      action: () => setShowModuleCreator(true)
    },
    {
      icon: Sparkles,
      title: "Optimize Code",
      description: "Get suggestions to improve your program",
      action: () => setInputMessage("How can I optimize my current Solana program for better performance and security?")
    }
  ];

  return (
    <div className="absolute top-16 right-4 w-96 bg-ui-base border border-ui-accent rounded-lg shadow-lg z-50 h-[600px] flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Quick Actions */}
          <div className="space-y-2 flex-shrink-0">
            <h3 className="text-sm font-medium">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto p-3"
                  onClick={action.action}
                >
                  <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-xs">{action.title}</div>
                    <div className="text-xs text-text-secondary">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Module Creator */}
          {showModuleCreator && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <h4 className="text-sm font-medium">Create Custom Module</h4>
              <Textarea
                placeholder="Describe what you want this module to do... (e.g., 'Create a token staking instruction that locks tokens for a specific period')"
                value={customModulePrompt}
                onChange={(e) => setCustomModulePrompt(e.target.value)}
                className="text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCustomModule} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  Create Module
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowModuleCreator(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          {message.type === 'assistant' && (
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        </div>
                        
                        {message.moduleData && (
                          <div className="mt-2 p-2 bg-white/20 rounded border">
                            <div className="text-xs font-medium">Generated Module:</div>
                            <div className="text-xs">{message.moduleData.name}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-1 justify-start">
                        {message.suggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-50 text-xs"
                            onClick={() => setInputMessage(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your program..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantPanel;
