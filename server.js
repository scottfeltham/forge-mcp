#!/usr/bin/env node
/**
 * FORGE MCP Server - Pure MCP implementation of the FORGE development framework
 * Created by Scott Feltham - https://github.com/scottfeltham/forge-mcp-server
 */

const { program } = require('commander');
const { createMCPServer } = require('./lib/core/mcp-server');
const { StdioTransport } = require('./lib/transport/stdio');
const { SSETransport } = require('./lib/transport/sse');

// Command line interface
program
  .name('forge-mcp-server')
  .description('FORGE MCP Server - AI-native development framework')
  .version('2.0.0')
  .option('--stdio', 'Use stdio transport (default)', true)
  .option('--sse <port>', 'Use SSE transport on specified port')
  .option('--debug', 'Enable debug logging')
  .option('--base-dir <path>', 'Base directory for .forge projects', process.cwd())
  .parse();

const options = program.opts();

// Setup logging
const logger = {
  debug: (msg, data) => options.debug && console.error(`[DEBUG] ${msg}`, data || ''),
  info: (msg, data) => console.error(`[INFO] ${msg}`, data || ''),
  warn: (msg, data) => console.error(`[WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
};

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully'); 
  process.exit(0);
});

async function main() {
  try {
    logger.info(`Starting FORGE MCP Server v${program.version()}`);
    logger.debug('Options:', options);

    // Create MCP server instance
    const server = await createMCPServer({
      baseDir: options.baseDir,
      debug: options.debug,
      logger
    });

    // Setup transport layer
    if (options.sse) {
      const port = parseInt(options.sse);
      logger.info(`Starting SSE transport on port ${port}`);
      const transport = new SSETransport(server, port, { logger });
      await transport.start();
    } else {
      logger.debug('Starting stdio transport');
      const transport = new StdioTransport(server, { logger });
      await transport.start();
    }

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    if (options.debug) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Start the server
main();