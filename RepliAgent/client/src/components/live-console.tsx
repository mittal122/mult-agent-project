import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@shared/schema";

interface LogEntry {
  timestamp: string;
  agentName: string;
  message: string;
  level: string;
}

interface LiveConsoleProps {
  project: Project | null;
}

export function LiveConsole({ project }: LiveConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      setIsActive(true);
      // Add initial connection log
      setLogs([{
        timestamp: new Date().toLocaleTimeString(),
        agentName: "System",
        message: "✅ Project started, agents initializing...",
        level: "info"
      }]);
    }
  }, [project]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Listen for WebSocket messages to add real-time logs
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "log" && data.projectId === project?.id) {
          const newLog: LogEntry = {
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
            agentName: data.agentName,
            message: data.message,
            level: data.level
          };
          setLogs(prev => [...prev, newLog]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    // This would be connected to the actual WebSocket in a real implementation
    // For now, we'll simulate some logs
    if (project && isActive) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          agentName: "Requirement Agent",
          message: "🔄 Analyzing project requirements...",
          level: "info"
        }]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [project, isActive]);

  const getLogIcon = (level: string, message: string) => {
    if (message.includes("✅")) return "text-chart-2";
    if (message.includes("🔄")) return "text-primary animate-pulse";
    if (message.includes("❌")) return "text-destructive";
    if (message.includes("⚠️")) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <Card data-testid="card-live-console">
      <div className="flex items-center space-x-2 px-6 py-4 border-b border-border">
        <i className="fas fa-terminal text-primary"></i>
        <h3 className="font-semibold text-sm" data-testid="text-console-title">Live Console</h3>
        <div className="ml-auto flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-chart-2 animate-pulse' : 'bg-muted'}`} data-testid="status-console"></div>
          <span className="text-xs text-muted-foreground" data-testid="text-console-status">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <div 
          ref={scrollRef}
          className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2 max-h-64 overflow-y-auto"
          data-testid="console-output"
        >
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <i className="fas fa-terminal text-2xl mb-2"></i>
              <p data-testid="text-no-logs">Console output will appear here</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={getLogIcon(log.level, log.message)}
                data-testid={`log-entry-${index}`}
              >
                <span className="text-muted-foreground" data-testid={`log-timestamp-${index}`}>
                  [{log.timestamp}]
                </span>{" "}
                <span data-testid={`log-message-${index}`}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
