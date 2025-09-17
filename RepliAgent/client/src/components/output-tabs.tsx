import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@shared/schema";

interface OutputTabsProps {
  project: Project | null;
}

export function OutputTabs({ project }: OutputTabsProps) {
  if (!project) {
    return (
      <Card data-testid="card-output-tabs-empty">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <i className="fas fa-code text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground" data-testid="text-no-project">
              Start a project to see agent outputs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-output-tabs">
      <Tabs defaultValue="requirements" className="w-full">
        <div className="border-b border-border">
          <TabsList className="h-auto p-0 bg-transparent">
            <div className="flex space-x-8 px-6 py-3">
              <TabsTrigger value="requirements" className="border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-requirements">
                Requirements
              </TabsTrigger>
              <TabsTrigger value="frontend" className="border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-frontend">
                Frontend Code
              </TabsTrigger>
              <TabsTrigger value="backend" className="border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-backend">
                Backend API
              </TabsTrigger>
              <TabsTrigger value="structure" className="border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-structure">
                File Structure
              </TabsTrigger>
            </div>
          </TabsList>
        </div>
        
        <CardContent className="p-6">
          <TabsContent value="requirements" data-testid="content-requirements">
            {project.requirements ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-list-alt text-chart-2"></i>
                  <h3 className="font-semibold text-sm" data-testid="text-analysis-complete">Project Analysis Complete</h3>
                </div>
                
                <div className="bg-accent rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2" data-testid="text-project-type-title">📊 Project Type</h4>
                    <p className="text-sm text-accent-foreground" data-testid="text-project-type">
                      {project.requirements.projectType || "Not specified"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2" data-testid="text-pages-title">📄 Required Pages</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.requirements.pages?.map((page: string, index: number) => (
                        <Badge key={index} variant="outline" data-testid={`badge-page-${index}`}>
                          {page}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">No pages defined</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2" data-testid="text-features-title">⚙️ Required Features</h4>
                    <ul className="text-sm text-accent-foreground space-y-1">
                      {project.requirements.features?.map((feature: string, index: number) => (
                        <li key={index} data-testid={`text-feature-${index}`}>• {feature}</li>
                      )) || <li className="text-muted-foreground">No features defined</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2" data-testid="text-styling-title">🎨 Styling Preferences</h4>
                    <p className="text-sm text-accent-foreground" data-testid="text-styling-preferences">
                      {project.requirements.stylingPreferences || "No styling preferences specified"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground" data-testid="text-analyzing">Analyzing requirements...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="frontend" data-testid="content-frontend">
            {project.frontendCode ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-palette text-primary"></i>
                  <h3 className="font-semibold text-sm" data-testid="text-frontend-complete">Frontend Code Generated</h3>
                </div>
                
                <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap" data-testid="text-frontend-code">
                    {JSON.stringify(project.frontendCode, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground" data-testid="text-generating-frontend">Generating frontend code...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="backend" data-testid="content-backend">
            {project.backendCode ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-server text-chart-3"></i>
                  <h3 className="font-semibold text-sm" data-testid="text-backend-complete">Backend API Generated</h3>
                </div>
                
                <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap" data-testid="text-backend-code">
                    {JSON.stringify(project.backendCode, null, 2)}
                  </pre>
                </div>
              </div>
            ) : project.requirements?.backendRequired === false ? (
              <div className="text-center py-8">
                <i className="fas fa-info-circle text-2xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground" data-testid="text-backend-not-required">Backend not required for this project</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground" data-testid="text-generating-backend">Generating backend code...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="structure" data-testid="content-structure">
            {project.fileStructure ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-folder-tree text-chart-4"></i>
                  <h3 className="font-semibold text-sm" data-testid="text-structure-complete">Project Structure Ready</h3>
                </div>
                
                <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                  <div className="space-y-1">
                    {Object.keys(project.fileStructure as Record<string, string>).map((filePath, index) => (
                      <div key={index} className="flex items-center space-x-2" data-testid={`file-${index}`}>
                        <i className={`fas ${filePath.includes('.') ? 'fa-file-code' : 'fa-folder'} text-chart-1`}></i>
                        <span>{filePath}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground" data-testid="text-generating-structure">Generating project structure...</p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
