import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@shared/schema";

interface AgentProgressProps {
  project: Project | null;
}

const agents = [
  {
    name: "Requirement Agent",
    icon: "fas fa-list-alt",
    description: "Parse prompt into structured project plan",
    color: "chart-2"
  },
  {
    name: "Frontend Agent",
    icon: "fas fa-palette",
    description: "Generate React components and pages",
    color: "primary"
  },
  {
    name: "Backend Agent",
    icon: "fas fa-server",
    description: "Generate Node.js APIs and database",
    color: "chart-3"
  },
  {
    name: "Validator Agent",
    icon: "fas fa-check-double",
    description: "Check code quality and fix errors",
    color: "chart-4"
  },
  {
    name: "Deployment Agent",
    icon: "fas fa-rocket",
    description: "Package and prepare for deployment",
    color: "chart-5"
  }
];

export function AgentProgress({ project }: AgentProgressProps) {
  const getAgentStatus = (agentName: string) => {
    if (!project?.progress) return { status: "pending", progress: 0 };
    
    const agentProgress = project.progress[agentName];
    return agentProgress || { status: "pending", progress: 0 };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string, color: string) => {
    switch (status) {
      case "completed": return "bg-chart-2";
      case "in-progress": return `bg-${color}`;
      case "failed": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string, icon: string) => {
    switch (status) {
      case "completed": return "fas fa-check";
      case "in-progress": return "fas fa-cog fa-spin";
      case "failed": return "fas fa-times";
      default: return "fas fa-clock";
    }
  };

  return (
    <Card data-testid="card-agent-progress">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-6">
          <i className="fas fa-tasks text-primary"></i>
          <h2 className="text-lg font-semibold" data-testid="text-agent-progress-title">Agent Progress</h2>
        </div>
        
        <div className="space-y-4">
          {agents.map((agent, index) => {
            const { status, progress } = getAgentStatus(agent.name);
            
            return (
              <div key={agent.name} className="flex items-center space-x-4" data-testid={`agent-${index}`}>
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 ${getStatusColor(status, agent.color)} rounded-full flex items-center justify-center ${status === "in-progress" ? "animate-pulse" : ""}`}>
                    <i className={`${getStatusIcon(status, agent.icon)} text-white text-sm`}></i>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-sm" data-testid={`text-agent-name-${index}`}>{agent.name}</h3>
                    <Badge variant={getStatusBadgeVariant(status)} data-testid={`badge-agent-status-${index}`}>
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid={`text-agent-description-${index}`}>
                    {agent.description}
                  </p>
                  <div className="mt-2">
                    <Progress 
                      value={progress} 
                      className="h-1.5"
                      data-testid={`progress-agent-${index}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
