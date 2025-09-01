/**
 * MCP resource handlers for FORGE templates, state, and context
 */

const fs = require('fs').promises;
const path = require('path');

class ResourceHandlers {
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    this.logger = options.logger || console;
    this.templateDir = path.join(__dirname, '../../templates');
  }

  async getCapabilities() {
    return {
      templates: "FORGE development templates and agent definitions",
      cycles: "Development cycle state and history", 
      context: "Project configuration and AI context"
    };
  }

  async listResources() {
    const resources = [];

    // Template resources
    resources.push(...await this.getTemplateResources());
    
    // Cycle resources
    resources.push(...await this.getCycleResources());
    
    // Context resources
    resources.push(...await this.getContextResources());

    return resources;
  }

  async readResource(uri) {
    this.logger.debug('Reading resource:', uri);

    if (uri.startsWith('forge://templates/')) {
      return await this.readTemplateResource(uri);
    } else if (uri.startsWith('forge://cycles/')) {
      return await this.readCycleResource(uri);
    } else if (uri.startsWith('forge://context/')) {
      return await this.readContextResource(uri);
    } else {
      throw new Error(`Unknown resource URI: ${uri}`);
    }
  }

  // Template Resources
  async getTemplateResources() {
    const resources = [];
    
    try {
      const templates = await this.scanTemplateDirectory();
      
      for (const template of templates) {
        resources.push({
          uri: `forge://templates/${template.path}`,
          name: template.name,
          description: template.description,
          mimeType: "text/markdown"
        });
      }
    } catch (error) {
      this.logger.warn('Failed to scan templates:', error.message);
    }

    return resources;
  }

  async scanTemplateDirectory() {
    const templates = [];
    
    // Core templates
    templates.push({
      path: 'cycle',
      name: 'Development Cycle Template',
      description: '5-phase development cycle with progress tracking'
    });
    
    templates.push({
      path: 'init-prompt',
      name: 'Project Initialization Template', 
      description: 'AI-driven project analysis and setup'
    });

    // Agent templates
    const agentTemplates = [
      'project-analyzer',
      'architect', 
      'developer',
      'tester',
      'devops',
      'reviewer'
    ];

    for (const agent of agentTemplates) {
      templates.push({
        path: `agents/${agent}`,
        name: `${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
        description: `Specialized ${agent} agent for development tasks`
      });
    }

    return templates;
  }

  async readTemplateResource(uri) {
    const templatePath = uri.replace('forge://templates/', '');
    
    // Try to read from templates directory
    const filePath = path.join(this.templateDir, `${templatePath}.md`);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return {
        uri,
        mimeType: "text/markdown",
        text: content
      };
    } catch (error) {
      // Return placeholder content for now
      return {
        uri,
        mimeType: "text/markdown", 
        text: `# ${templatePath.charAt(0).toUpperCase() + templatePath.slice(1)} Template\n\n*Template content will be available soon*`
      };
    }
  }

  // Cycle Resources
  async getCycleResources() {
    return [
      {
        uri: 'forge://cycles/active',
        name: 'Active Development Cycles',
        description: 'Currently running development cycles',
        mimeType: 'application/json'
      },
      {
        uri: 'forge://cycles/history',
        name: 'Completed Cycles', 
        description: 'Archive of completed development cycles',
        mimeType: 'application/json'
      }
    ];
  }

  async readCycleResource(uri) {
    if (uri === 'forge://cycles/active') {
      const { active } = await this.stateManager.getCycles(false);
      return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(active, null, 2)
      };
    } else if (uri === 'forge://cycles/history') {
      const { completed } = await this.stateManager.getCycles(true);
      return {
        uri,
        mimeType: 'application/json', 
        text: JSON.stringify(completed || [], null, 2)
      };
    } else {
      throw new Error(`Unknown cycle resource: ${uri}`);
    }
  }

  // Context Resources  
  async getContextResources() {
    return [
      {
        uri: 'forge://context/project',
        name: 'Project Configuration',
        description: 'Current project settings and preferences',
        mimeType: 'application/json'
      },
      {
        uri: 'forge://context/learnings',
        name: 'Project Knowledge Base',
        description: 'Accumulated project learnings and insights', 
        mimeType: 'text/markdown'
      },
      {
        uri: 'forge://context/ai-instructions',
        name: 'AI Assistant Context',
        description: 'Context and instructions for AI assistants',
        mimeType: 'text/markdown'
      }
    ];
  }

  async readContextResource(uri) {
    if (uri === 'forge://context/project') {
      const config = await this.stateManager.getConfig();
      return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(config, null, 2)
      };
    } else if (uri === 'forge://context/learnings') {
      const learnings = await this.stateManager.getLearnings();
      return {
        uri,
        mimeType: 'text/markdown',
        text: learnings
      };
    } else if (uri === 'forge://context/ai-instructions') {
      const context = await this.stateManager.getContext();
      return {
        uri,
        mimeType: 'text/markdown',
        text: context
      };
    } else {
      throw new Error(`Unknown context resource: ${uri}`);
    }
  }
}

module.exports = { ResourceHandlers };