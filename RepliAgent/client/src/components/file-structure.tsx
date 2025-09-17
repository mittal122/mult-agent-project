import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@shared/schema";

interface FileStructureProps {
  project: Project;
}

export function FileStructure({ project }: FileStructureProps) {
  const fileStructure = project.fileStructure as Record<string, string> | null;
  
  const getFileIcon = (path: string) => {
    if (path.includes('.')) {
      const ext = path.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'tsx':
        case 'jsx':
        case 'ts':
        case 'js':
          return 'fas fa-file-code text-chart-1';
        case 'json':
          return 'fas fa-file-code text-chart-3';
        case 'css':
          return 'fas fa-file-code text-chart-5';
        case 'md':
          return 'fas fa-file-alt text-chart-2';
        default:
          return 'fas fa-file text-muted-foreground';
      }
    }
    return 'fas fa-folder text-chart-3';
  };

  const getFileStatus = (path: string) => {
    if (!project.progress) return "⏳";
    
    // Determine status based on which agent would generate this file
    if (path.includes('component') || path.includes('page') || path.includes('src/')) {
      const frontendStatus = project.progress["Frontend Agent"]?.status;
      return frontendStatus === "completed" ? "✅" : frontendStatus === "in-progress" ? "🔄" : "⏳";
    }
    
    if (path.includes('server/') || path.includes('api/') || path.includes('route')) {
      const backendStatus = project.progress["Backend Agent"]?.status;
      return backendStatus === "completed" ? "✅" : backendStatus === "in-progress" ? "🔄" : "⏳";
    }
    
    if (path.includes('package.json') || path.includes('README') || path.includes('config')) {
      const deploymentStatus = project.progress["Deployment Agent"]?.status;
      return deploymentStatus === "completed" ? "✅" : deploymentStatus === "in-progress" ? "🔄" : "⏳";
    }
    
    return "⏳";
  };

  const renderFileTree = (files: Record<string, string>) => {
    const sortedPaths = Object.keys(files).sort();
    
    return (
      <div className="space-y-1">
        {sortedPaths.map((path, index) => {
          const depth = path.split('/').length - 1;
          const filename = path.split('/').pop() || path;
          const status = getFileStatus(path);
          
          return (
            <div 
              key={index} 
              className="flex items-center space-x-2"
              style={{ marginLeft: `${depth * 16}px` }}
              data-testid={`file-item-${index}`}
            >
              <i className={getFileIcon(path)}></i>
              <span className="text-sm" data-testid={`file-name-${index}`}>{filename}</span>
              <span className="text-xs" data-testid={`file-status-${index}`}>{status}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card data-testid="card-file-structure">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-folder-tree text-primary"></i>
          <h3 className="text-lg font-semibold" data-testid="text-file-structure-title">Project Structure</h3>
        </div>
        
        <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-80 overflow-y-auto">
          {fileStructure ? (
            renderFileTree(fileStructure)
          ) : (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <i className="fas fa-folder text-chart-3"></i>
                <span data-testid="text-project-folder">{project.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}/</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-folder text-chart-3"></i>
                  <span data-testid="text-frontend-folder">frontend/</span>
                </div>
                <div className="ml-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-folder text-chart-3"></i>
                    <span>src/</span>
                  </div>
                  <div className="ml-8 space-y-1">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-folder text-chart-3"></i>
                      <span>components/</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-folder text-chart-3"></i>
                      <span>pages/</span>
                    </div>
                  </div>
                </div>
                {project.requirements?.backendRequired && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-folder text-chart-3"></i>
                    <span className="text-muted-foreground">backend/ ⏳</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {!fileStructure && (
          <p className="text-xs text-muted-foreground mt-2" data-testid="text-structure-note">
            Detailed structure will appear once generation is complete
          </p>
        )}
      </CardContent>
    </Card>
  );
}
