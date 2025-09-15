/**
 * Core MCP server implementation for FORGE
 */

const { ForgeStateManager } = require('./state-manager');
const { ResourceHandlers } = require('../resources');
const { ToolHandlers } = require('../tools');

class MCPServer {
  constructor(options = {}) {
    this.options = options;
    this.logger = options.logger || console;
    this.stateManager = new ForgeStateManager(options.baseDir);
    this.resources = new ResourceHandlers(this.stateManager, { logger: this.logger });
    this.tools = new ToolHandlers(this.stateManager, { logger: this.logger });
    this.capabilities = {
      resources: {},
      tools: {},
      prompts: {}
    };
  }

  async initialize() {
    this.logger.debug('Initializing MCP server');
    
    // Initialize state manager
    await this.stateManager.initialize();
    
    // Register resources
    this.capabilities.resources = await this.resources.getCapabilities();
    
    // Register tools
    this.capabilities.tools = await this.tools.getCapabilities();
    
    this.logger.debug('MCP server initialized with capabilities:', {
      resources: Object.keys(this.capabilities.resources).length,
      tools: Object.keys(this.capabilities.tools).length
    });
  }

  async handleRequest(request) {
    try {
      this.logger.debug('Handling MCP request:', request.method);
      
      switch (request.method) {
      case 'initialize':
        return this.handleInitialize(request);
        
      case 'resources/list':
        return this.handleResourcesList(request);
          
      case 'resources/read':
        return this.handleResourcesRead(request);
          
      case 'tools/list':
        return this.handleToolsList(request);
          
      case 'tools/call':
        return this.handleToolsCall(request);
          
      case 'ping':
        return this.handlePing(request);
          
      default:
        throw new Error(`Unknown method: ${request.method}`);
      }
    } catch (error) {
      this.logger.error('Error handling request:', error.message);
      throw error;
    }
  }

  async handleInitialize(request) {
    const { protocolVersion, capabilities, clientInfo } = request.params;
    
    this.logger.info('Client initializing:', clientInfo);
    this.logger.debug('Protocol version:', protocolVersion);
    
    return {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: {
          subscribe: true,
          listChanged: true
        },
        tools: {
          listChanged: false
        }
      },
      serverInfo: {
        name: 'forge-mcp-server',
        version: '2.0.0',
        description: 'FORGE MCP Server - AI-native development framework'
      }
    };
  }

  async handleResourcesList(request) {
    this.logger.debug('Listing resources');
    return {
      resources: await this.resources.listResources()
    };
  }

  async handleResourcesRead(request) {
    const { uri } = request.params;
    this.logger.debug('Reading resource:', uri);
    return {
      contents: [await this.resources.readResource(uri)]
    };
  }

  async handleToolsList(request) {
    this.logger.debug('Listing tools');
    return {
      tools: await this.tools.listTools()
    };
  }

  async handleToolsCall(request) {
    const { name, arguments: args } = request.params;
    this.logger.debug('Calling tool:', name);
    return {
      content: [await this.tools.callTool(name, args)]
    };
  }

  async handlePing(request) {
    return { pong: true };
  }
}

async function createMCPServer(options = {}) {
  const server = new MCPServer(options);
  await server.initialize();
  return server;
}

module.exports = { MCPServer, createMCPServer };