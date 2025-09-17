import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface DownloadSectionProps {
  project: Project;
}

export function DownloadSection({ project }: DownloadSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const isComplete = project.status === "completed";
  const hasFileStructure = !!project.fileStructure;
  
  const getCompletionPercentage = () => {
    if (!project.progress) return 0;
    
    const agents = ["Requirement Agent", "Frontend Agent", "Backend Agent", "Validator Agent", "Deployment Agent"];
    const completedAgents = agents.filter(agent => 
      project.progress![agent]?.status === "completed"
    ).length;
    
    return Math.round((completedAgents / agents.length) * 100);
  };

  const getCompletedAgentCount = () => {
    if (!project.progress) return 0;
    
    const agents = ["Requirement Agent", "Frontend Agent", "Backend Agent", "Validator Agent", "Deployment Agent"];
    return agents.filter(agent => 
      project.progress![agent]?.status === "completed"
    ).length;
  };

  const handleDownload = async () => {
    if (!isComplete || !hasFileStructure) {
      toast({
        title: "Download Not Ready",
        description: "Please wait for all agents to complete their tasks.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const response = await fetch(`/api/projects/${project.id}/download`);
      
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Your project is being downloaded as a ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const completionPercentage = getCompletionPercentage();
  const completedAgents = getCompletedAgentCount();

  return (
    <Card data-testid="card-download-section">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-download text-primary"></i>
          <h3 className="text-lg font-semibold" data-testid="text-download-title">Download Options</h3>
        </div>
        
        <div className="space-y-4">
          {/* Generation Status */}
          <div className="bg-accent rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <i className="fas fa-info-circle text-primary"></i>
              <span className="font-medium text-sm" data-testid="text-generation-status">Generation Status</span>
            </div>
            <p className="text-sm text-accent-foreground mb-3" data-testid="text-status-description">
              {isComplete ? 
                "Project generation completed! Your website is ready for download." :
                "AI agents are generating your project. Download will be available once all agents complete their tasks."
              }
            </p>
            <Progress value={completionPercentage} className="mb-2" data-testid="progress-generation" />
            <p className="text-xs text-muted-foreground" data-testid="text-completion-stats">
              {completedAgents} of 5 agents completed ({completionPercentage}%)
            </p>
          </div>
          
          {/* Download Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleDownload}
              disabled={!isComplete || !hasFileStructure || isDownloading}
              className="w-full"
              size="lg"
              data-testid="button-download-zip"
            >
              {isDownloading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Downloading...
                </>
              ) : (
                <>
                  <i className="fas fa-file-archive mr-2"></i>
                  Download Full Project (.zip)
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              disabled={!isComplete}
              className="w-full"
              data-testid="button-deploy-github"
            >
              <i className="fab fa-github mr-2"></i>
              Deploy to GitHub
            </Button>
            
            <Button
              variant="outline"
              disabled={!isComplete}
              className="w-full"
              data-testid="button-deploy-vercel"
            >
              <i className="fas fa-cloud mr-2"></i>
              Deploy to Vercel
            </Button>
          </div>
          
          {/* Estimated Completion */}
          {!isComplete && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-sm mb-2" data-testid="text-estimated-completion">Estimated Completion</h4>
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock text-muted-foreground"></i>
                <span className="text-sm text-muted-foreground" data-testid="text-time-remaining">
                  ~{Math.max(1, 5 - completedAgents)}-{Math.max(2, 7 - completedAgents)} minutes remaining
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
