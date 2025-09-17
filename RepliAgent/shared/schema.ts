import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements"),
  frontendCode: jsonb("frontend_code"),
  backendCode: jsonb("backend_code"),
  fileStructure: jsonb("file_structure"),
  status: text("status").notNull().default("pending"),
  progress: jsonb("progress").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentLogs = pgTable("agent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  agentName: text("agent_name").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  level: text("level").notNull().default("info"),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
});

export const insertLogSchema = createInsertSchema(agentLogs).pick({
  projectId: true,
  agentName: true,
  message: true,
  level: true,
});

// Define types for JSONB fields
export type ProjectRequirements = {
  projectType?: string;
  pages?: string[];
  features?: string[];
  stylingPreferences?: string;
  backendRequired?: boolean;
};

export type AgentProgress = {
  [agentName: string]: {
    status: string;
    progress: number;
  };
};

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect & {
  requirements?: ProjectRequirements | null;
  progress?: AgentProgress | null;
};
export type InsertLog = z.infer<typeof insertLogSchema>;
export type AgentLog = typeof agentLogs.$inferSelect;

export const AgentStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress", 
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const AgentNames = {
  REQUIREMENT: "Requirement Agent",
  FRONTEND: "Frontend Agent", 
  BACKEND: "Backend Agent",
  VALIDATOR: "Validator Agent",
  DEPLOYMENT: "Deployment Agent",
} as const;
