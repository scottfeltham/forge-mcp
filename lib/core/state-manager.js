/**
 * FORGE state management optimized for MCP server
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const chokidar = require('chokidar');

class ForgeStateManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.forgeDir = path.join(baseDir, '.forge');
    this.cache = new Map();
    this.watchers = new Set();
    this.subscribers = new Set();
  }

  async initialize() {
    // Ensure .forge directory exists
    await this.ensureForgeDirectory();
    
    // Setup file watchers
    await this.setupWatchers();
  }

  async ensureForgeDirectory() {
    try {
      await fs.access(this.forgeDir);
    } catch {
      // Create .forge directory structure
      await fs.mkdir(this.forgeDir, { recursive: true });
      await fs.mkdir(path.join(this.forgeDir, 'cycles'), { recursive: true });
      await fs.mkdir(path.join(this.forgeDir, 'cycles', 'active'), { recursive: true });
      await fs.mkdir(path.join(this.forgeDir, 'cycles', 'completed'), { recursive: true });
      await fs.mkdir(path.join(this.forgeDir, 'templates'), { recursive: true });
      
      // Create default config
      const defaultConfig = {
        project: path.basename(this.baseDir),
        version: '2.0.0',
        created: new Date().toISOString(),
        phases: ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate']
      };
      
      await this.writeFile(
        path.join(this.forgeDir, 'config.yaml'),
        yaml.dump(defaultConfig)
      );
      
      // Create empty learnings file
      await this.writeFile(
        path.join(this.forgeDir, 'learnings.md'),
        '# Project Learnings\n\n*Knowledge base will grow as you work on cycles.*\n'
      );
      
      // Create context file
      const contextContent = `# Project Context for AI

## Project Overview
- **Name**: ${defaultConfig.project}
- **Type**: [To be determined through analysis]
- **Created**: ${new Date().toLocaleDateString()}

## Development Approach
This project uses FORGE development cycles to structure work:
1. **Focus** 🎯 - Requirements and planning
2. **Orchestrate** 📝 - Task breakdown
3. **Refine** 🔨 - Implementation 
4. **Generate** 🚀 - Build and deploy
5. **Evaluate** 📊 - Measure and learn

## AI Instructions
- Use structured development cycles for all features
- Capture learnings after each cycle completion
- Focus on test-driven development in Refine phase
- Always evaluate success metrics in final phase
`;
      
      await this.writeFile(
        path.join(this.forgeDir, 'context.md'),
        contextContent
      );
    }
  }

  async setupWatchers() {
    const watcher = chokidar.watch(this.forgeDir, {
      ignored: /[\/\\]\./,
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
      this.invalidateCache(filePath);
      this.notifySubscribers('file-changed', filePath);
    });

    watcher.on('add', (filePath) => {
      this.notifySubscribers('file-added', filePath);  
    });

    watcher.on('unlink', (filePath) => {
      this.invalidateCache(filePath);
      this.notifySubscribers('file-deleted', filePath);
    });

    this.watchers.add(watcher);
  }

  // Cycle Management
  async createCycle(feature, options = {}) {
    const id = this.generateCycleId(feature);
    const cycleData = {
      id,
      feature,
      description: options.description || '',
      priority: options.priority || 'medium',
      phase: 'Focus',
      progress: { Focus: 0, Orchestrate: 0, Refine: 0, Generate: 0, Evaluate: 0 },
      created: new Date().toISOString(),
      tasks: {
        Focus: [],
        Orchestrate: [],
        Refine: [],
        Generate: [],
        Evaluate: []
      }
    };

    const filePath = path.join(this.forgeDir, 'cycles', 'active', `${id}.md`);
    const content = this.formatCycleFile(cycleData);
    
    await this.writeFile(filePath, content);
    this.invalidateCache();
    
    return cycleData;
  }

  async getCycles(includeCompleted = false) {
    const activePath = path.join(this.forgeDir, 'cycles', 'active');
    const active = await this.loadCyclesFromDirectory(activePath);
    
    if (!includeCompleted) {
      return { active };
    }
    
    const completedPath = path.join(this.forgeDir, 'cycles', 'completed');
    const completed = await this.loadCyclesFromDirectory(completedPath);
    
    return { active, completed };
  }

  async getCycle(cycleId) {
    // Check active cycles first
    const activePath = path.join(this.forgeDir, 'cycles', 'active', `${cycleId}.md`);
    try {
      const content = await this.readFile(activePath);
      return this.parseCycleFile(content, cycleId);
    } catch {
      // Check completed cycles
      const completedPath = path.join(this.forgeDir, 'cycles', 'completed', `${cycleId}.md`);
      try {
        const content = await this.readFile(completedPath);
        return this.parseCycleFile(content, cycleId);
      } catch {
        throw new Error(`Cycle not found: ${cycleId}`);
      }
    }
  }

  async updateCycle(cycleId, updates) {
    const cycle = await this.getCycle(cycleId);
    const updatedCycle = { ...cycle, ...updates };
    
    const filePath = path.join(this.forgeDir, 'cycles', 'active', `${cycleId}.md`);
    const content = this.formatCycleFile(updatedCycle);
    
    await this.writeFile(filePath, content);
    this.invalidateCache();
    
    return updatedCycle;
  }

  async completeCycle(cycleId, notes = '') {
    const activePath = path.join(this.forgeDir, 'cycles', 'active', `${cycleId}.md`);
    const completedPath = path.join(this.forgeDir, 'cycles', 'completed', `${cycleId}.md`);
    
    // Move file from active to completed
    const content = await this.readFile(activePath);
    const cycle = this.parseCycleFile(content, cycleId);
    
    cycle.completed = new Date().toISOString();
    cycle.notes = notes;
    
    const updatedContent = this.formatCycleFile(cycle);
    await this.writeFile(completedPath, updatedContent);
    await fs.unlink(activePath);
    
    this.invalidateCache();
    return cycle;
  }

  // Learning System
  async addLearning(category, title, description, context) {
    const learningsPath = path.join(this.forgeDir, 'learnings.md');
    let content = await this.readFile(learningsPath);
    
    const learning = {
      id: Date.now().toString(),
      category,
      title,
      description,
      context,
      created: new Date().toISOString()
    };

    const learningEntry = `
## ${title}

**Category**: ${category}  
**Added**: ${new Date().toLocaleDateString()}

${description}

${context ? `**Context**: ${context}` : ''}

---
`;

    content += learningEntry;
    await this.writeFile(learningsPath, content);
    
    return learning;
  }

  async getLearnings() {
    const learningsPath = path.join(this.forgeDir, 'learnings.md');
    return await this.readFile(learningsPath);
  }

  // Configuration
  async getConfig() {
    const configPath = path.join(this.forgeDir, 'config.yaml');
    const content = await this.readFile(configPath);
    return yaml.load(content);
  }

  async updateConfig(updates) {
    const config = await this.getConfig();
    const updatedConfig = { ...config, ...updates };
    
    const configPath = path.join(this.forgeDir, 'config.yaml');
    await this.writeFile(configPath, yaml.dump(updatedConfig));
    
    return updatedConfig;
  }

  // Context Management
  async getContext() {
    const contextPath = path.join(this.forgeDir, 'context.md');
    return await this.readFile(contextPath);
  }

  async updateContext(content) {
    const contextPath = path.join(this.forgeDir, 'context.md');
    await this.writeFile(contextPath, content);
  }

  // Utility Methods
  generateCycleId(feature) {
    return feature
      .toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  formatCycleFile(cycle) {
    return `# ${cycle.feature}

**ID**: ${cycle.id}  
**Priority**: ${cycle.priority}  
**Phase**: ${cycle.phase}  
**Created**: ${new Date(cycle.created).toLocaleDateString()}

## Description
${cycle.description || '*No description provided*'}

## Progress
- Focus: ${cycle.progress.Focus}%
- Orchestrate: ${cycle.progress.Orchestrate}%  
- Refine: ${cycle.progress.Refine}%
- Generate: ${cycle.progress.Generate}%
- Evaluate: ${cycle.progress.Evaluate}%

## Current Phase: ${cycle.phase}

### Tasks
${(cycle.tasks[cycle.phase] || []).map(task => `- [ ] ${task}`).join('\n') || '*No tasks defined yet*'}

${cycle.completed ? `\n## Completion\n**Completed**: ${new Date(cycle.completed).toLocaleDateString()}\n${cycle.notes ? `**Notes**: ${cycle.notes}` : ''}` : ''}
`;
  }

  parseCycleFile(content, id) {
    // Basic parsing - can be enhanced later
    const lines = content.split('\n');
    const feature = lines[0].replace('# ', '');
    
    return {
      id,
      feature,
      content
    };
  }

  async loadCyclesFromDirectory(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      const cycles = [];
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const cycleId = file.replace('.md', '');
          const content = await this.readFile(path.join(dirPath, file));
          cycles.push(this.parseCycleFile(content, cycleId));
        }
      }
      
      return cycles;
    } catch {
      return [];
    }
  }

  // File Operations
  async readFile(filePath) {
    const cacheKey = path.relative(this.baseDir, filePath);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  async writeFile(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    
    const cacheKey = path.relative(this.baseDir, filePath);
    this.cache.set(cacheKey, content);
  }

  invalidateCache(filePath = null) {
    if (filePath) {
      const cacheKey = path.relative(this.baseDir, filePath);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  // Subscription Management
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(event, data) {
    for (const callback of this.subscribers) {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    }
  }

  async cleanup() {
    for (const watcher of this.watchers) {
      await watcher.close();
    }
    this.watchers.clear();
    this.subscribers.clear();
    this.cache.clear();
  }
}

module.exports = { ForgeStateManager };