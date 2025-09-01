/**
 * Server-Sent Events transport for MCP protocol (future standard)
 */

const http = require('http');

class SSETransport {
  constructor(server, port, options = {}) {
    this.server = server;
    this.port = port;
    this.logger = options.logger || console;
    this.httpServer = null;
    this.clients = new Set();
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.httpServer.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info(`SSE transport listening on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  async handleRequest(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/mcp' && req.method === 'GET') {
      // Setup SSE connection
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const client = { req, res, id: Date.now() };
      this.clients.add(client);

      // Send initial connection event
      this.sendToClient(client, {
        type: 'connected',
        data: { message: 'Connected to FORGE MCP Server' }
      });

      req.on('close', () => {
        this.clients.delete(client);
        this.logger.debug('SSE client disconnected');
      });

    } else if (req.url === '/mcp' && req.method === 'POST') {
      // Handle MCP requests
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          const response = await this.server.handleRequest(message);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: message.id,
            result: response
          }));

        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: message?.id || null,
            error: {
              code: -32603,
              message: error.message
            }
          }));
        }
      });

    } else if (req.url === '/health') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        version: '2.0.0',
        uptime: process.uptime(),
        clients: this.clients.size,
        memory: process.memoryUsage()
      }));

    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }

  sendToClient(client, event) {
    try {
      client.res.write(`event: ${event.type}\n`);
      client.res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    } catch (error) {
      this.logger.error('Error sending to SSE client:', error.message);
      this.clients.delete(client);
    }
  }

  broadcast(event) {
    for (const client of this.clients) {
      this.sendToClient(client, event);
    }
  }

  async stop() {
    if (this.httpServer) {
      return new Promise((resolve) => {
        this.httpServer.close(resolve);
      });
    }
  }
}

module.exports = { SSETransport };