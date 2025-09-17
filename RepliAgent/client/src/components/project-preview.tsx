import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Project } from "@shared/schema";

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const hasGeneratedCode = project.frontendCode || project.backendCode;

  return (
    <Card data-testid="card-project-preview">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-eye text-primary"></i>
            <h2 className="text-lg font-semibold" data-testid="text-preview-title">Project Preview</h2>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={!hasGeneratedCode}
            data-testid="button-fullscreen"
          >
            <i className="fas fa-expand-arrows-alt mr-2"></i>
            Full Screen
          </Button>
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <div className="bg-background rounded border border-border aspect-video flex items-center justify-center">
            {hasGeneratedCode ? (
              <div className="text-center space-y-2">
                <i className="fas fa-globe text-4xl text-primary"></i>
                <p className="text-foreground font-medium" data-testid="text-preview-ready">
                  {project.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-preview-subtitle">
                  Preview will be available once deployment is ready
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <i className="fas fa-code text-4xl text-muted-foreground"></i>
                <p className="text-muted-foreground" data-testid="text-preview-waiting">
                  Live preview will appear here
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-preview-status">
                  {project.status === "pending" ? "Generation starting..." : "Generation in progress..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
