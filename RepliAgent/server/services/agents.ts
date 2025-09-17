import { GoogleGenAI } from "@google/genai";
import type { Project, AgentLog } from "@shared/schema";
import { storage } from "../storage";
import { broadcastMessage } from "./websocket.js";

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class AgentOrchestrator {
  private ai: GoogleGenAI;
  private projectId: string;

  constructor(apiKey: string, projectId: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.projectId = projectId;
  }

  private async logMessage(agentName: string, message: string, level: string = "info") {
    try {
      await storage.createLog({
        projectId: this.projectId,
        agentName,
        message,
        level,
      });
      
      broadcastMessage({
        type: "log",
        projectId: this.projectId,
        agentName,
        message,
        level,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log message:", error);
    }
  }

  private async updateProgress(agentName: string, status: string, progress: number) {
    try {
      const project = await storage.getProject(this.projectId);
      if (!project) return;

      const updatedProgress = {
        ...project.progress,
        [agentName]: { status, progress },
      };

      await storage.updateProject(this.projectId, { progress: updatedProgress });
      
      broadcastMessage({
        type: "progress",
        projectId: this.projectId,
        agentName,
        status,
        progress,
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  }

  async runRequirementAgent(description: string): Promise<AgentResult> {
    const agentName = "Requirement Agent";
    
    try {
      await this.logMessage(agentName, "Starting project analysis...");
      await this.updateProgress(agentName, "in-progress", 0);

      const systemPrompt = `You are a requirements analysis expert. 
      Analyze the project description and generate a structured project plan.
      Return JSON with this exact structure:
      {
        "projectType": "string",
        "pages": ["array of page names"],
        "features": ["array of feature descriptions"],
        "stylingPreferences": "string",
        "backendRequired": boolean,
        "databaseRequired": boolean,
        "authentication": boolean,
        "paymentIntegration": boolean,
        "apis": ["array of external APIs needed"]
      }`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              projectType: { type: "string" },
              pages: { type: "array", items: { type: "string" } },
              features: { type: "array", items: { type: "string" } },
              stylingPreferences: { type: "string" },
              backendRequired: { type: "boolean" },
              databaseRequired: { type: "boolean" },
              authentication: { type: "boolean" },
              paymentIntegration: { type: "boolean" },
              apis: { type: "array", items: { type: "string" } },
            },
            required: ["projectType", "pages", "features", "stylingPreferences", "backendRequired"],
          },
        },
        contents: description,
      });

      let requirements;
      try {
        requirements = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error('Failed to parse requirements response:', parseError);
        requirements = {};
      }
      
      await storage.updateProject(this.projectId, { requirements });
      await this.logMessage(agentName, "Project structure defined successfully");
      await this.updateProgress(agentName, "completed", 100);

      return { success: true, data: requirements };
    } catch (error) {
      await this.logMessage(agentName, `Error: ${error}`, "error");
      await this.updateProgress(agentName, "failed", 0);
      return { success: false, error: String(error) };
    }
  }

  async runFrontendAgent(requirements: any): Promise<AgentResult> {
    const agentName = "Frontend Agent";
    
    try {
      await this.logMessage(agentName, "Generating React components...");
      await this.updateProgress(agentName, "in-progress", 0);

      const systemPrompt = `You are a React frontend developer expert.
      Generate complete React components with TypeScript and Tailwind CSS based on the requirements.
      Create modular, clean, and responsive components.
      Return JSON with this structure:
      {
        "components": {
          "ComponentName.tsx": "component code as string"
        },
        "pages": {
          "PageName.tsx": "page code as string"
        },
        "styles": {
          "additional.css": "any additional CSS needed"
        }
      }`;

      const prompt = `Generate React frontend for: ${JSON.stringify(requirements)}
      
      Requirements:
      - Use TypeScript
      - Use Tailwind CSS for styling
      - Create responsive, modern design
      - Include proper error handling
      - Use React hooks appropriately
      - Make components reusable and modular`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      let frontendCode;
      try {
        frontendCode = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error('Failed to parse frontend code response:', parseError);
        frontendCode = {};
      }
      
      await storage.updateProject(this.projectId, { frontendCode });
      await this.logMessage(agentName, "Frontend components generated successfully");
      await this.updateProgress(agentName, "completed", 100);

      return { success: true, data: frontendCode };
    } catch (error) {
      await this.logMessage(agentName, `Error: ${error}`, "error");
      await this.updateProgress(agentName, "failed", 0);
      return { success: false, error: String(error) };
    }
  }

  async runBackendAgent(requirements: any): Promise<AgentResult> {
    const agentName = "Backend Agent";
    
    try {
      if (!requirements.backendRequired) {
        await this.logMessage(agentName, "Backend not required for this project");
        await this.updateProgress(agentName, "completed", 100);
        return { success: true, data: null };
      }

      await this.logMessage(agentName, "Generating Node.js backend...");
      await this.updateProgress(agentName, "in-progress", 0);

      const systemPrompt = `You are a Node.js backend developer expert.
      Generate complete Express.js backend with TypeScript based on requirements.
      Include proper error handling, validation, and security practices.
      Return JSON with this structure:
      {
        "routes": {
          "routes/routeName.ts": "route code as string"
        },
        "models": {
          "models/ModelName.ts": "model code as string"
        },
        "middleware": {
          "middleware/name.ts": "middleware code as string"
        },
        "utils": {
          "utils/name.ts": "utility code as string"
        }
      }`;

      const prompt = `Generate Node.js backend for: ${JSON.stringify(requirements)}
      
      Requirements:
      - Use Express.js with TypeScript
      - Include proper validation with Zod
      - Add authentication if required
      - Create database models if needed
      - Include error handling middleware
      - Follow RESTful API design`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      let backendCode;
      try {
        backendCode = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error('Failed to parse backend code response:', parseError);
        backendCode = {};
      }
      
      await storage.updateProject(this.projectId, { backendCode });
      await this.logMessage(agentName, "Backend API generated successfully");
      await this.updateProgress(agentName, "completed", 100);

      return { success: true, data: backendCode };
    } catch (error) {
      await this.logMessage(agentName, `Error: ${error}`, "error");
      await this.updateProgress(agentName, "failed", 0);
      return { success: false, error: String(error) };
    }
  }

  async runValidatorAgent(frontendCode: any, backendCode: any): Promise<AgentResult> {
    const agentName = "Validator Agent";
    
    try {
      await this.logMessage(agentName, "Validating generated code...");
      await this.updateProgress(agentName, "in-progress", 0);

      const systemPrompt = `You are a code quality and validation expert.
      Review the generated frontend and backend code for:
      - Syntax errors
      - Missing imports
      - Type errors
      - Security issues
      - Best practices
      - Performance issues
      
      Return JSON with this structure:
      {
        "isValid": boolean,
        "errors": ["array of error descriptions"],
        "warnings": ["array of warning descriptions"],
        "fixes": {
          "frontend": {
            "ComponentName.tsx": "fixed code if needed"
          },
          "backend": {
            "fileName.ts": "fixed code if needed"
          }
        }
      }`;

      const prompt = `Validate this code:
      
      Frontend: ${JSON.stringify(frontendCode)}
      Backend: ${JSON.stringify(backendCode)}
      
      Check for errors and provide fixes if needed.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      let validation;
      try {
        validation = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error('Failed to parse validation response:', parseError);
        validation = { isValid: false, errors: ['Failed to parse validation response'], warnings: [], fixes: {} };
      }
      
      if (validation.fixes && Object.keys(validation.fixes).length > 0) {
        // Apply fixes if any
        const updatedProject: any = {};
        if (validation.fixes.frontend) {
          updatedProject.frontendCode = { ...frontendCode, ...validation.fixes.frontend };
        }
        if (validation.fixes.backend) {
          updatedProject.backendCode = { ...backendCode, ...validation.fixes.backend };
        }
        
        if (Object.keys(updatedProject).length > 0) {
          await storage.updateProject(this.projectId, updatedProject);
          await this.logMessage(agentName, "Applied code fixes");
        }
      }

      await this.logMessage(agentName, `Validation completed. Found ${validation.errors?.length || 0} errors`);
      await this.updateProgress(agentName, "completed", 100);

      return { success: true, data: validation };
    } catch (error) {
      await this.logMessage(agentName, `Error: ${error}`, "error");
      await this.updateProgress(agentName, "failed", 0);
      return { success: false, error: String(error) };
    }
  }

  async runDeploymentAgent(project: Project): Promise<AgentResult> {
    const agentName = "Deployment Agent";
    
    try {
      await this.logMessage(agentName, "Packaging project for deployment...");
      await this.updateProgress(agentName, "in-progress", 0);

      const systemPrompt = `You are a deployment and project structure expert.
      Generate a complete project structure with all necessary configuration files.
      Return JSON with this structure:
      {
        "structure": {
          "package.json": "package.json content",
          "README.md": "README content",
          "src/components/ComponentName.tsx": "component code",
          "src/pages/PageName.tsx": "page code",
          "server/routes/routeName.ts": "route code",
          ".env.example": "environment variables example",
          "tailwind.config.js": "tailwind config",
          "tsconfig.json": "typescript config",
          "vite.config.ts": "vite config"
        },
        "deploymentInstructions": "string with deployment steps"
      }`;

      const prompt = `Package this project for deployment:
      
      Requirements: ${JSON.stringify(project.requirements)}
      Frontend: ${JSON.stringify(project.frontendCode)}
      Backend: ${JSON.stringify(project.backendCode)}
      
      Create a complete, deployable project structure.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      let packagedProject;
      try {
        packagedProject = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error('Failed to parse deployment package response:', parseError);
        packagedProject = { structure: {}, deploymentInstructions: 'Failed to parse deployment package' };
      }
      
      await storage.updateProject(this.projectId, { 
        fileStructure: packagedProject.structure,
        status: "completed" 
      });
      
      await this.logMessage(agentName, "Project packaged successfully");
      await this.updateProgress(agentName, "completed", 100);

      return { success: true, data: packagedProject };
    } catch (error) {
      await this.logMessage(agentName, `Error: ${error}`, "error");
      await this.updateProgress(agentName, "failed", 0);
      return { success: false, error: String(error) };
    }
  }

  async executeWorkflow(): Promise<void> {
    try {
      const project = await storage.getProject(this.projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Step 1: Requirements Analysis
      const requirementsResult = await this.runRequirementAgent(project.description);
      if (!requirementsResult.success) {
        throw new Error(`Requirements analysis failed: ${requirementsResult.error}`);
      }

      // Step 2: Frontend Generation
      const frontendResult = await this.runFrontendAgent(requirementsResult.data);
      if (!frontendResult.success) {
        throw new Error(`Frontend generation failed: ${frontendResult.error}`);
      }

      // Step 3: Backend Generation (if needed)
      const backendResult = await this.runBackendAgent(requirementsResult.data);
      if (!backendResult.success) {
        throw new Error(`Backend generation failed: ${backendResult.error}`);
      }

      // Step 4: Code Validation
      const validationResult = await this.runValidatorAgent(
        frontendResult.data,
        backendResult.data
      );
      if (!validationResult.success) {
        throw new Error(`Code validation failed: ${validationResult.error}`);
      }

      // Step 5: Deployment Packaging
      const updatedProject = await storage.getProject(this.projectId);
      if (updatedProject) {
        const deploymentResult = await this.runDeploymentAgent(updatedProject);
        if (!deploymentResult.success) {
          throw new Error(`Deployment packaging failed: ${deploymentResult.error}`);
        }
      }

      broadcastMessage({
        type: "completed",
        projectId: this.projectId,
        message: "Project generation completed successfully!",
      });

    } catch (error) {
      await storage.updateProject(this.projectId, { status: "failed" });
      broadcastMessage({
        type: "error",
        projectId: this.projectId,
        message: String(error),
      });
    }
  }
}
