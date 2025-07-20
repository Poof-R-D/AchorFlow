
import React from 'react';
import { ModuleTemplate } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Code, BookOpen, Link as LinkIcon } from 'lucide-react';

interface ModuleDocumentationProps {
  module: ModuleTemplate;
  onClose: () => void;
}

const ModuleDocumentation = ({ module, onClose }: ModuleDocumentationProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center text-white`}>
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{module.name}</h1>
            <p className="text-text-secondary">{module.description}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {module.category}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Documentation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">{module.documentation.overview}</p>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary mb-4">{module.documentation.usage}</p>
              
              {/* Parameters */}
              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Parameters</h4>
                {module.documentation.parameters.map((param, index) => (
                  <div key={index} className="bg-ui-accent rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono text-primary">{param.name}</code>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{param.type}</Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">{param.description}</p>
                    {param.defaultValue !== undefined && (
                      <p className="text-xs text-text-secondary mt-1">
                        Default: <code className="text-primary">{JSON.stringify(param.defaultValue)}</code>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          {module.examples && module.examples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {module.examples.map((example, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-text-primary mb-2">{example.title}</h4>
                    <p className="text-sm text-text-secondary mb-3">{example.description}</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-green-400">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">{example.explanation}</p>
                    {index < module.examples.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Code Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.documentation.examples.map((example, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-3">
                    <code className="text-sm text-green-400">{example}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inputs/Outputs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inputs & Outputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Inputs */}
              <div>
                <h4 className="font-medium text-text-primary mb-2">Inputs</h4>
                <div className="space-y-2">
                  {module.inputs.map((input) => (
                    <div key={input.id} className="bg-ui-accent rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{input.name}</span>
                        <Badge variant="outline" className="text-xs">{input.type}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary">{input.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs */}
              <div>
                <h4 className="font-medium text-text-primary mb-2">Outputs</h4>
                <div className="space-y-2">
                  {module.outputs.map((output) => (
                    <div key={output.id} className="bg-ui-accent rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{output.name}</span>
                        <Badge variant="outline" className="text-xs">{output.type}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary">{output.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Modules */}
          {module.documentation.relatedModules && module.documentation.relatedModules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Related Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module.documentation.relatedModules.map((moduleId, index) => (
                    <div key={index} className="flex items-center text-sm text-primary hover:underline cursor-pointer">
                      {moduleId}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleDocumentation;
