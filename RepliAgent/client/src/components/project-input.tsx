import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface ProjectInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isConnected: boolean;
  onProjectCreated: (project: Project) => void;
}

const templates = {
  "Landing Page": "Create a modern landing page for a SaaS product with hero section, features, pricing, and contact form. Include email signup and testimonials.",
  "Blog": "Build a personal blog website with article listing, individual post pages, categories, search functionality, and comment system.",
  "E-commerce": "Create an e-commerce store for selling electronics with product catalog, shopping cart, user authentication, payment integration, and admin panel.",
  "Dashboard": "Build an analytics dashboard with charts, data tables, user management, real-time updates, and responsive design for business metrics."
};

export function ProjectInput({ apiKey, onApiKeyChange, isConnected, onProjectCreated }: ProjectInputProps) {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleTemplateClick = (templateName: string) => {
    setDescription(templates[templateName as keyof typeof templates] || "");
    setTitle(templateName);
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please provide your Gemini API key to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description Required", 
        description: "Please describe your website or application.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/projects", {
        title: title || "AI Generated Website",
        description: description.trim(),
        apiKey: apiKey.trim(),
      });

      const project = await response.json();
      onProjectCreated(project);
      
      toast({
        title: "Project Started",
        description: "AI agents are now generating your website!",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to start project generation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <Card data-testid="card-api-config">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <i className="fas fa-key text-primary"></i>
            <h2 className="text-lg font-semibold" data-testid="text-api-config-title">API Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key" data-testid="label-api-key">Gemini API Key *</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="mt-2"
                data-testid="input-api-key"
              />
              <p className="text-xs text-muted-foreground mt-1" data-testid="text-api-key-note">
                Required for all AI model calls. Never stored or shared.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-chart-2' : 'bg-destructive'}`}
                data-testid="status-api-connection"
              ></div>
              <span className="text-xs text-muted-foreground" data-testid="text-connection-status">
                {isConnected ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Prompt Section */}
      <Card data-testid="card-project-description">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <i className="fas fa-lightbulb text-primary"></i>
            <h2 className="text-lg font-semibold" data-testid="text-project-description-title">Project Description</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-title" data-testid="label-project-title">Project Title</Label>
              <Input
                id="project-title"
                placeholder="e.g., My Awesome Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
                data-testid="input-project-title"
              />
            </div>
            
            <div>
              <Label htmlFor="project-prompt" data-testid="label-project-description">Describe your website/app *</Label>
              <Textarea
                id="project-prompt"
                rows={6}
                placeholder="Example: Create a modern e-commerce website for selling books. Include user authentication, shopping cart, payment integration, and admin panel for managing inventory..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 resize-none"
                maxLength={2000}
                data-testid="textarea-project-description"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground" data-testid="text-description-note">
                  Be specific about features, styling, and functionality
                </p>
                <span className="text-xs text-muted-foreground" data-testid="text-character-count">
                  {description.length}/2000
                </span>
              </div>
            </div>
            
            {/* Quick Templates */}
            <div>
              <p className="text-sm font-medium mb-2" data-testid="text-templates-title">Quick Templates</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(templates).map((template) => (
                  <Button
                    key={template}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateClick(template)}
                    className="text-xs"
                    data-testid={`button-template-${template.toLowerCase().replace(' ', '-')}`}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !isConnected || !description.trim()}
        className="w-full"
        size="lg"
        data-testid="button-generate"
      >
        {isGenerating ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Generating...
          </>
        ) : (
          <>
            <i className="fas fa-magic mr-2"></i>
            Generate Website
          </>
        )}
      </Button>

      {/* Token Usage */}
      <Card data-testid="card-token-usage">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" data-testid="text-token-usage">Token Usage</span>
            <span className="text-xs text-muted-foreground" data-testid="text-free-tier">Free Tier</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }} data-testid="progress-token-usage"></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-token-stats">
            2,300 / 10,000 tokens used this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
