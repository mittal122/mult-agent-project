# RepliAgent

A multi-agent AI system that generates websites and applications from natural language prompts. Specialized agents work together, and their progress streams live to the UI over WebSocket.

## Agents

- **Requirement Agent:** turns a prompt into a structured project specification
- **Frontend Agent:** generates React components and frontend code
- **Backend Agent:** creates Node.js APIs and database integrations when needed

## Stack

React, TypeScript, Tailwind CSS, Radix UI, Express, WebSocket and the Google Gemini API.

## Run

The app is in `RepliAgent/`. It needs a `GEMINI_API_KEY` environment variable.

```sh
cd RepliAgent
npm install
npm run dev
```

The `dev` script uses Unix-style environment syntax, so on Windows run it from Git Bash or WSL.
