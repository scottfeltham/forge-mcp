/**
 * FORGE MCP Resource Handlers
 * Exposes FORGE state as MCP resources
 */

const fs = require('fs');
const path = require('path');

class ResourceHandlers {
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    this.logger = options.logger || console;
    this.baseDir = stateManager.baseDir;
  }

  async getCapabilities() {
    return {
      subscribe: true,
      listChanged: true
    };
  }

  async listResources() {
    const resources = [];

    // Static resources
    resources.push({
      uri: 'forge://config',
      name: 'FORGE Configuration',
      description: 'Project configuration (config.yaml)',
      mimeType: 'application/x-yaml'
    });

    resources.push({
      uri: 'forge://context',
      name: 'Project Context',
      description: 'AI assistant context document',
      mimeType: 'text/markdown'
    });

    resources.push({
      uri: 'forge://learnings',
      name: 'Knowledge Base',
      description: 'Accumulated learnings and retrospectives',
      mimeType: 'text/markdown'
    });

    // Cookbook phase guides
    const phases = ['focus', 'orchestrate', 'refine', 'generate', 'evaluate'];
    for (const phase of phases) {
      resources.push({
        uri: `forge://cookbook/${phase}`,
        name: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Guide`,
        description: `Guidance for the ${phase} phase`,
        mimeType: 'text/markdown'
      });
    }

    // Prompts
    resources.push({
      uri: 'forge://prompts/prd-conversation',
      name: 'PRD Conversation Guide',
      description: 'Questions for building Product Requirements Document',
      mimeType: 'text/markdown'
    });

    resources.push({
      uri: 'forge://prompts/retrospective',
      name: 'Retrospective Guide',
      description: 'Retrospective prompts and template',
      mimeType: 'text/markdown'
    });

    // Active cycles
    const cycles = this.stateManager.listCycles();
    for (const cycle of cycles.active) {
      resources.push({
        uri: `forge://cycles/${cycle.id}`,
        name: `Cycle: ${cycle.id}`,
        description: `Active cycle in ${cycle.phase} phase`,
        mimeType: 'text/markdown'
      });
    }

    // Templates
    const templatesDir = path.join(this.baseDir, 'templates');
    if (fs.existsSync(templatesDir)) {
      const templates = fs.readdirSync(templatesDir)
        .filter(f => f.endsWith('.md'));

      for (const template of templates) {
        const name = path.basename(template, '.md');
        resources.push({
          uri: `forge://templates/${name}`,
          name: `Template: ${name}`,
          description: `${name} template`,
          mimeType: 'text/markdown'
        });
      }
    }

    // Agents
    const agentsDir = path.join(this.baseDir, '.claude_code', 'agents');
    if (fs.existsSync(agentsDir)) {
      const agents = fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.md'));

      for (const agent of agents) {
        const name = path.basename(agent, '.md');
        resources.push({
          uri: `forge://agents/${name}`,
          name: `Agent: ${name}`,
          description: `${name} agent definition`,
          mimeType: 'text/markdown'
        });
      }
    }

    return resources;
  }

  async readResource(uri) {
    this.logger.debug(`Reading resource: ${uri}`);

    // Parse URI
    const parsed = this.parseUri(uri);
    if (!parsed) {
      throw new Error(`Invalid URI: ${uri}`);
    }

    const { category, item } = parsed;

    switch (category) {
    case 'config':
      return this.readConfig();

    case 'context':
      return this.readContext();

    case 'learnings':
      return this.readLearnings();

    case 'cookbook':
      return this.readCookbook(item);

    case 'prompts':
      return this.readPrompt(item);

    case 'cycles':
      return this.readCycle(item);

    case 'templates':
      return this.readTemplate(item);

    case 'agents':
      return this.readAgent(item);

    default:
      throw new Error(`Unknown resource category: ${category}`);
    }
  }

  parseUri(uri) {
    // forge://category/item or forge://category
    const match = uri.match(/^forge:\/\/([^/]+)(?:\/(.+))?$/);
    if (!match) {
      return null;
    }
    return {
      category: match[1],
      item: match[2] || null
    };
  }

  readConfig() {
    const config = this.stateManager.getConfig();
    if (!config) {
      return {
        uri: 'forge://config',
        mimeType: 'text/plain',
        text: 'FORGE not initialized. Use forge_init tool first.'
      };
    }

    const yaml = require('js-yaml');
    return {
      uri: 'forge://config',
      mimeType: 'application/x-yaml',
      text: yaml.dump(config)
    };
  }

  readContext() {
    const context = this.stateManager.getContext();
    if (!context) {
      return {
        uri: 'forge://context',
        mimeType: 'text/plain',
        text: 'FORGE not initialized. Use forge_init tool first.'
      };
    }

    return {
      uri: 'forge://context',
      mimeType: 'text/markdown',
      text: context
    };
  }

  readLearnings() {
    const learnings = this.stateManager.getLearnings();
    if (!learnings) {
      return {
        uri: 'forge://learnings',
        mimeType: 'text/plain',
        text: 'FORGE not initialized. Use forge_init tool first.'
      };
    }

    return {
      uri: 'forge://learnings',
      mimeType: 'text/markdown',
      text: learnings
    };
  }

  readCookbook(phase) {
    const cookbookDir = path.join(this.baseDir, 'cookbook', 'phases');
    const phasePath = path.join(cookbookDir, `${phase}.md`);

    if (!fs.existsSync(phasePath)) {
      throw new Error(`Cookbook not found: ${phase}`);
    }

    return {
      uri: `forge://cookbook/${phase}`,
      mimeType: 'text/markdown',
      text: fs.readFileSync(phasePath, 'utf8')
    };
  }

  readPrompt(name) {
    const promptsDir = path.join(this.baseDir, 'prompts');
    const promptPath = path.join(promptsDir, `${name}.md`);

    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt not found: ${name}`);
    }

    return {
      uri: `forge://prompts/${name}`,
      mimeType: 'text/markdown',
      text: fs.readFileSync(promptPath, 'utf8')
    };
  }

  readCycle(cycleId) {
    const result = this.stateManager.getCycle(cycleId);
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      uri: `forge://cycles/${cycleId}`,
      mimeType: 'text/markdown',
      text: result.content
    };
  }

  readTemplate(name) {
    const templatesDir = path.join(this.baseDir, 'templates');
    const templatePath = path.join(templatesDir, `${name}.md`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${name}`);
    }

    return {
      uri: `forge://templates/${name}`,
      mimeType: 'text/markdown',
      text: fs.readFileSync(templatePath, 'utf8')
    };
  }

  readAgent(name) {
    const agentsDir = path.join(this.baseDir, '.claude_code', 'agents');
    const agentPath = path.join(agentsDir, `${name}.md`);

    if (!fs.existsSync(agentPath)) {
      throw new Error(`Agent not found: ${name}`);
    }

    return {
      uri: `forge://agents/${name}`,
      mimeType: 'text/markdown',
      text: fs.readFileSync(agentPath, 'utf8')
    };
  }
}

module.exports = { ResourceHandlers };
