
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Play, 
  Lightbulb, 
  BookOpen, 
  Video, 
  MessageSquare,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!isOpen) return null;

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const tutorialSteps = [
    {
      id: 1,
      title: "Add Your First Module",
      description: "Drag an instruction module from the left sidebar to the canvas",
      action: "Try it now"
    },
    {
      id: 2,
      title: "Connect Modules",
      description: "Click and drag from output ports to input ports to create program flow",
      action: "Practice connecting"
    },
    {
      id: 3,
      title: "Configure Module Properties",
      description: "Click on a module to configure its parameters and behavior",
      action: "Explore settings"
    },
    {
      id: 4,
      title: "Generate Code",
      description: "Click 'Generate Code' to see your visual program as Anchor code",
      action: "Generate now"
    }
  ];

  return (
    <div className="absolute top-16 right-4 w-96 bg-ui-base border border-ui-accent rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Guidance
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tutorial" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tutorial" className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Quick Start Tutorial</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Learn the basics of creating Solana programs visually
                </p>
                
                <div className="space-y-3">
                  {tutorialSteps.map((step) => (
                    <div 
                      key={step.id}
                      className={`p-3 border rounded-lg ${
                        completedSteps.includes(step.id) 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-ui-accent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {completedSteps.includes(step.id) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <h4 className="font-medium text-sm">{step.title}</h4>
                          </div>
                          <p className="text-xs text-text-secondary mb-2">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {!completedSteps.includes(step.id) && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => markStepComplete(step.id)}
                        >
                          {step.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guide" className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">User Guide</h3>
                
                <div className="space-y-4">
                  <div className="p-3 border border-ui-accent rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Understanding Modules
                    </h4>
                    <p className="text-xs text-text-secondary mb-2">
                      Modules are the building blocks of your Solana program:
                    </p>
                    <ul className="text-xs text-text-secondary space-y-1 ml-4">
                      <li>• <Badge variant="secondary" className="text-xs">Instructions</Badge> define program actions</li>
                      <li>• <Badge variant="outline" className="text-xs">Accounts</Badge> store program data</li>
                      <li>• <Badge variant="default" className="text-xs">Connections</Badge> show data flow</li>
                    </ul>
                  </div>

                  <div className="p-3 border border-ui-accent rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Program Flow
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Your visual canvas represents the execution flow of your Solana program. 
                      Connected modules show how data moves through your application.
                    </p>
                  </div>

                  <div className="p-3 border border-ui-accent rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Best Practices
                    </h4>
                    <ul className="text-xs text-text-secondary space-y-1">
                      <li>• Start with account structures</li>
                      <li>• Add instructions that modify accounts</li>
                      <li>• Connect modules to show relationships</li>
                      <li>• Test frequently during development</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="support" className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Support & Resources</h3>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video Tutorials
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Documentation
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Join Community Discord
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-800 mb-1">Need Help?</h4>
                  <p className="text-xs text-blue-600">
                    If you're stuck, try the AI Assistant or reach out to our community for support.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPanel;
