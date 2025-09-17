import { useState } from "react";
import { ProjectInput } from "@/components/project-input";
import { AgentProgress } from "@/components/agent-progress";
import { OutputTabs } from "@/components/output-tabs";
import { LiveConsole } from "@/components/live-console";
import { ProjectPreview } from "@/components/project-preview";
import { FileStructure } from "@/components/file-structure";
import { DownloadSection } from "@/components/download-section";
import { useWebSocket } from "@/lib/websocket";
import type { Project } from "@shared/schema";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  useWebSocket(currentProject?.id);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    setIsConnected(key.length > 20);
  };

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm" data-testid="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-primary-foreground text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="text-title">
                  AI Website Builder
                </h1>
                <p className="text-xs text-muted-foreground" data-testid="text-subtitle">
                  Multi-Agent Development System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-powered-by">
                Powered by Gemini AI
              </span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-chart-2' : 'bg-destructive'}`} data-testid="status-connection"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input & Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <ProjectInput 
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
              isConnected={isConnected}
              onProjectCreated={handleProjectCreated}
              data-testid="section-project-input"
            />
          </div>

          {/* Right Column: Progress & Results */}
          <div className="lg:col-span-2 space-y-6">
            <AgentProgress project={currentProject} data-testid="section-agent-progress" />
            <OutputTabs project={currentProject} data-testid="section-output-tabs" />
            <LiveConsole project={currentProject} data-testid="section-live-console" />
          </div>
        </div>

        {/* Bottom Section: Preview & Download */}
        {currentProject && (
          <div className="mt-8 space-y-6">
            <ProjectPreview project={currentProject} data-testid="section-project-preview" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileStructure project={currentProject} data-testid="section-file-structure" />
              <DownloadSection project={currentProject} data-testid="section-download" />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12" data-testid="footer-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground" data-testid="text-copyright">
              © 2024 AI Website Builder. Built for Replit developers.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-documentation">
                Documentation
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-support">
                Support
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
