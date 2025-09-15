/**
 * Standard I/O transport for MCP protocol
 */

class StdioTransport {
  constructor(server, options = {}) {
    this.server = server;
    this.logger = options.logger || console;
    this.messageBuffer = '';
  }

  async start() {
    this.logger.debug('Starting stdio transport');
    
    // Setup stdin/stdout for MCP communication
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      this.handleIncomingData(chunk);
    });

    process.stdin.on('end', () => {
      this.logger.debug('Stdin ended');
      process.exit(0);
    });

    // Prevent stdout buffering issues
    process.stdout.setEncoding('utf8');
    
    this.logger.debug('Stdio transport ready');
  }

  handleIncomingData(chunk) {
    this.messageBuffer += chunk;
    
    // Process complete messages (separated by newlines)
    const lines = this.messageBuffer.split('\n');
    this.messageBuffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        this.processMessage(line.trim());
      }
    }
  }

  async processMessage(messageText) {
    let message = null;
    try {
      message = JSON.parse(messageText);
      this.logger.debug('Received message:', message.method);
      
      const response = await this.server.handleRequest(message);
      
      const responseMessage = {
        jsonrpc: '2.0',
        id: message.id,
        result: response
      };
      
      this.sendMessage(responseMessage);
      
    } catch (error) {
      this.logger.error('Error processing message:', error.message);
      
      // Send error response
      const errorResponse = {
        jsonrpc: '2.0',
        id: (message && message.id) || null,
        error: {
          code: -32603,
          message: error.message,
          data: error.details || {}
        }
      };
      
      this.sendMessage(errorResponse);
    }
  }

  sendMessage(message) {
    const messageText = JSON.stringify(message);
    this.logger.debug('Sending message:', message.result?.constructor?.name || message.error?.message);
    process.stdout.write(messageText + '\n');
  }
}

module.exports = { StdioTransport };