import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer;
const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ noServer: true });
  
  server.on('upgrade', (request, socket, head) => {
    if (request.url?.startsWith('/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // Do not destroy other upgrade requests - let Vite handle them
  });

  wss.on('connection', (ws: WebSocket) => {
    let projectId: string | null = null;

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'subscribe' && message.projectId) {
          projectId = message.projectId;
          
          if (projectId && !clients.has(projectId)) {
            clients.set(projectId, new Set());
          }
          if (projectId) {
            clients.get(projectId)?.add(ws);
          
            ws.send(JSON.stringify({
              type: 'subscribed',
              projectId,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (projectId && clients.has(projectId)) {
        clients.get(projectId)!.delete(ws);
        if (clients.get(projectId)!.size === 0) {
          clients.delete(projectId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

export function broadcastMessage(message: any) {
  if (!message.projectId || !clients.has(message.projectId)) {
    return;
  }

  const projectClients = clients.get(message.projectId)!;
  const messageStr = JSON.stringify(message);
  
  projectClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}
