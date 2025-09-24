/**
 * Dashboard request handler for FORGE MCP Server
 */

const path = require('path');
const fs = require('fs').promises;

class DashboardHandler {
  constructor(server, options = {}) {
    this.server = server;
    this.logger = options.logger || console;
    this.stateManager = server.stateManager;
    this.publicDir = path.join(__dirname, 'public');
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Dashboard root
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
      return await this.serveDashboard(req, res);
    }

    // API endpoints
    if (url.pathname.startsWith('/api/')) {
      return await this.handleApiRequest(req, res, url);
    }

    // Static assets
    if (url.pathname.startsWith('/dashboard/')) {
      return await this.serveStatic(req, res, url.pathname.replace('/dashboard', ''));
    }

    return false;
  }

  async serveDashboard(req, res) {
    try {
      const indexPath = path.join(this.publicDir, 'index.html');
      const content = await fs.readFile(indexPath, 'utf8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return true;
    } catch (error) {
      this.logger.error('Error serving dashboard:', error.message);
      res.writeHead(404);
      res.end('Dashboard not found');
      return true;
    }
  }

  async serveStatic(req, res, filepath) {
    try {
      // Security: prevent directory traversal
      const normalizedPath = path.normalize(filepath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.join(this.publicDir, normalizedPath);

      // Ensure the path is within publicDir
      if (!fullPath.startsWith(this.publicDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return true;
      }

      const content = await fs.readFile(fullPath);

      // Set content type based on extension
      const ext = path.extname(fullPath);
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      this.logger.error('Error serving static file:', error.message);
      res.writeHead(500);
      res.end('Internal server error');
      return true;
    }
  }

  async handleApiRequest(req, res, url) {
    const path = url.pathname;
    const method = req.method;

    // Set CORS headers for API
    res.setHeader('Content-Type', 'application/json');

    let result;

    try {
      // GET endpoints
      if (path === '/api/status' && method === 'GET') {
        result = await this.getSystemStatus();
      } else if (path === '/api/cycles' && method === 'GET') {
        result = await this.getCycles();
      } else if (path === '/api/agents' && method === 'GET') {
        result = await this.getAgents();
      } else if (path === '/api/config' && method === 'GET') {
        result = await this.getConfig();
      }
      // POST endpoints
      else if (path === '/api/cycles' && method === 'POST') {
        const body = await this.parseRequestBody(req);
        result = await this.createCycle(body);
      } else if (path === '/api/agents/invoke' && method === 'POST') {
        const body = await this.parseRequestBody(req);
        result = await this.invokeAgent(body);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
        return true;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result));
      return true;

    } catch (error) {
      this.logger.error('API error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
      return true;
    }
  }

  async parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error('Invalid JSON body'));
        }
      });
    });
  }

  async getSystemStatus() {
    const status = {
      server: 'running',
      version: '2.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    // Add local LLM status if available
    if (this.server.tools && this.server.tools.localLLM) {
      status.localLLM = {
        enabled: this.server.tools.localLLM.config.enabled,
        connectionStatus: this.server.tools.localLLM.connectionStatus,
        model: this.server.tools.localLLM.config.model
      };
    }

    return status;
  }

  async getCycles() {
    try {
      const cycles = await this.stateManager.listCycles();

      return {
        active: cycles.filter(c => c.phase !== 'Completed'),
        completed: cycles.filter(c => c.phase === 'Completed'),
        total: cycles.length
      };
    } catch (error) {
      this.logger.error('Error fetching cycles:', error.message);
      return { active: [], completed: [], total: 0 };
    }
  }

  async getAgents() {
    const agents = [
      { type: 'architect', emoji: '🏗️', status: 'available' },
      { type: 'developer', emoji: '🔨', status: 'available' },
      { type: 'tester', emoji: '🧪', status: 'available' },
      { type: 'devops', emoji: '🚀', status: 'available' },
      { type: 'security', emoji: '🔐', status: 'available' },
      { type: 'documentation', emoji: '📚', status: 'available' },
      { type: 'reviewer', emoji: '📝', status: 'available' },
      { type: 'project-analyzer', emoji: '🔍', status: 'available' }
    ];

    return { agents, timestamp: new Date().toISOString() };
  }

  async getConfig() {
    try {
      const context = await this.stateManager.getContext();
      return {
        project: context.project || {},
        forge: context.forge || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { project: {}, forge: {}, timestamp: new Date().toISOString() };
    }
  }

  async createCycle(data) {
    try {
      const cycle = await this.stateManager.createCycle(data.feature, {
        description: data.description,
        priority: data.priority
      });

      // Broadcast cycle creation event
      if (this.server.dashboardEvents) {
        this.server.dashboardEvents.broadcastCycleCreated(cycle);
      }

      return { success: true, cycle };
    } catch (error) {
      throw new Error(`Failed to create cycle: ${error.message}`);
    }
  }

  async invokeAgent(data) {
    try {
      // This would integrate with the agent invocation system
      const result = {
        agentType: data.agentType,
        cycleId: data.cycleId,
        task: data.task,
        status: 'invoked',
        timestamp: new Date().toISOString()
      };

      // Broadcast agent invocation event
      if (this.server.dashboardEvents) {
        this.server.dashboardEvents.broadcastAgentInvoked({
          ...data,
          isAutoInvoked: false
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to invoke agent: ${error.message}`);
    }
  }
}

module.exports = { DashboardHandler };