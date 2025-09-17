import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { AgentOrchestrator } from "./services/agents";
import { setupWebSocket } from "./services/websocket";
import JSZip from "jszip";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time updates
  setupWebSocket(httpServer);

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const { title, description, apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is required" });
      }

      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const project = await storage.createProject({ title, description });
      
      // Start agent workflow in background
      setTimeout(async () => {
        const orchestrator = new AgentOrchestrator(apiKey, project.id);
        await orchestrator.executeWorkflow();
      }, 1000);

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Get project logs
  app.get("/api/projects/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getProjectLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Download project as ZIP
  app.get("/api/projects/:id/download", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project || !project.fileStructure) {
        return res.status(404).json({ error: "Project not ready for download" });
      }

      const zip = new JSZip();
      const fileStructure = project.fileStructure as Record<string, string>;
      
      // Add all files to ZIP
      Object.entries(fileStructure).forEach(([filePath, content]) => {
        zip.file(filePath, content);
      });

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip"`,
        'Content-Length': zipBuffer.length,
      });
      
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate download" });
    }
  });

  return httpServer;
}
