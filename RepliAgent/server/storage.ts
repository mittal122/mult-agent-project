import { type Project, type InsertProject, type AgentLog, type InsertLog } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  createLog(log: InsertLog): Promise<AgentLog>;
  getProjectLogs(projectId: string): Promise<AgentLog[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private logs: Map<string, AgentLog>;

  constructor() {
    this.projects = new Map();
    this.logs = new Map();
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      requirements: null,
      frontendCode: null,
      backendCode: null,
      fileStructure: null,
      status: "pending",
      progress: {},
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async createLog(insertLog: InsertLog): Promise<AgentLog> {
    const id = randomUUID();
    const log: AgentLog = {
      ...insertLog,
      id,
      projectId: insertLog.projectId || null,
      level: insertLog.level || "info",
      timestamp: new Date(),
    };
    this.logs.set(id, log);
    return log;
  }

  async getProjectLogs(projectId: string): Promise<AgentLog[]> {
    return Array.from(this.logs.values()).filter(log => log.projectId === projectId);
  }
}

export const storage = new MemStorage();
