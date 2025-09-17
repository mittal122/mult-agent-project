# Overview

This is a multi-agent AI system that generates complete websites or applications from natural language prompts. The system uses multiple specialized agents working together to convert user requirements into production-ready code. Built as a full-stack application with React frontend and Express backend, it leverages Google's Gemini AI API to power intelligent code generation through a collaborative agent workflow.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript, using modern development patterns:
- **Component Library**: Radix UI primitives with custom styling via Tailwind CSS
- **State Management**: React Query for server state and local React state for UI interactions
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live agent progress updates
- **UI Components**: Comprehensive component system using shadcn/ui patterns
- **Build System**: Vite for development and production builds

## Backend Architecture
The server implements a REST API with WebSocket support:
- **Framework**: Express.js with TypeScript
- **Agent Orchestration**: Centralized agent workflow management system
- **Storage Layer**: Pluggable storage interface with in-memory implementation
- **Real-time Communication**: WebSocket server for broadcasting agent progress
- **API Integration**: Google Gemini AI client for natural language processing

## Multi-Agent System Design
The core architecture revolves around specialized AI agents:
- **Requirement Agent**: Parses natural language prompts into structured project specifications
- **Frontend Agent**: Generates React components and complete frontend applications
- **Backend Agent**: Creates Node.js APIs and database integrations when needed
- **Validator Agent**: Reviews generated code for errors and implements fixes
- **Deployment Agent**: Packages projects for production deployment

Each agent operates independently but shares context through the orchestrator, enabling collaborative code generation.

## Data Storage Strategy
- **Projects**: Stores project metadata, generated requirements, frontend/backend code, and file structures
- **Agent Logs**: Tracks agent activities and progress for real-time user feedback
- **Schema**: Drizzle ORM with PostgreSQL schema definitions for production scalability
- **Development Storage**: In-memory storage for rapid development and testing

## File Generation System
The system generates complete project structures:
- **Frontend Files**: React components, pages, utilities, and configuration
- **Backend Files**: API routes, database models, and server configuration
- **Project Configuration**: Package.json, build scripts, and deployment configurations
- **Documentation**: README files and setup instructions

# External Dependencies

## AI Services
- **Google Gemini API**: Primary AI service for natural language understanding and code generation
- **User-Provided API Keys**: System requires users to provide their own Gemini API keys for all model interactions

## Database Services
- **Neon Database**: PostgreSQL hosting service for production data persistence
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries

## Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time agent progress updates

## Development Tools
- **Replit Integration**: Custom plugins for Replit development environment
- **Vite Plugins**: Development tooling including error overlays and dev banners

## UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility and interaction patterns
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent UI iconography

## File Processing
- **JSZip**: Client-side ZIP file generation for project downloads
- **File System Operations**: Server-side file structure management and code generation