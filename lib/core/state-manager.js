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
      ignored: /[/\\]\./,
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
    let content;
    try {
      content = await this.readFile(learningsPath);
    } catch (error) {
      // Create learnings file if it doesn't exist
      content = '# Project Learnings\n\n*Knowledge base will grow as you work on cycles.*\n';
      await this.writeFile(learningsPath, content);
    }
    
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
    const phaseStatus = (phase) => {
      if (cycle.phase === phase) return '[Active]';
      if (cycle.progress[phase] === 100) return '[Completed]';
      return '[Pending]';
    };

    const formatTasks = (phase, tasks) => {
      if (!tasks || tasks.length === 0) {
        return phase === 'Focus' ?
          `- [ ] Gather requirements
- [ ] Define test scenarios (MANDATORY)
- [ ] Create/Update PRD in docs/prd/
- [ ] Design architecture (Architect Agent)
- [ ] Identify risks (Security Agent)` :
          '*Tasks to be defined*';
      }
      return tasks.map(task => {
        const isCompleted = task.endsWith(' ✓');
        const taskText = isCompleted ? task.replace(' ✓', '') : task;
        return isCompleted ? `- [x] ${taskText}` : `- [ ] ${taskText}`;
      }).join('\n');
    };

    return `# Feature: ${cycle.feature}

**Started**: ${new Date(cycle.created).toLocaleDateString()}
**Status**: ${cycle.phase} Phase
**Priority**: ${cycle.priority}

## 📋 Progress

### Phase 1: Focus 🎯 ${phaseStatus('Focus')}
**Lead Agents**: Architect, Security, Documentation
${formatTasks('Focus', cycle.tasks.Focus)}

### Phase 2: Orchestrate 📝 ${phaseStatus('Orchestrate')}
**Lead Agents**: Architect, DevOps, Tester
${formatTasks('Orchestrate', cycle.tasks.Orchestrate)}

### Phase 3: Refine 🔨 ${phaseStatus('Refine')}
**Lead Agents**: Developer, Tester, Code Reviewer
${formatTasks('Refine', cycle.tasks.Refine)}

### Phase 4: Generate 🚀 ${phaseStatus('Generate')}
**Lead Agents**: DevOps, Documentation, Tester
${formatTasks('Generate', cycle.tasks.Generate)}

### Phase 5: Evaluate 📊 ${phaseStatus('Evaluate')}
**All Agents Contribute**
${formatTasks('Evaluate', cycle.tasks.Evaluate)}

## 📝 Notes

### Requirements
${cycle.description || '*AI assistant will help fill this section*'}

### Test Scenarios [MANDATORY - Must be completed in Focus phase]
*Link to test scenarios: [Not yet created]*
<!-- Test scenarios MUST be defined before any code is written -->

### Architecture Decisions
*To be determined during Focus phase*

### Tasks
*Created during Orchestrate phase*

## 📊 Evaluation Results

### Success Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| *Define during Focus* | - | - | - |

### What Worked Well
*To be filled during Evaluate phase*

### What Didn't Work
*To be filled during Evaluate phase*

### Key Learnings
*To be filled during Evaluate phase*

## 🤖 Agent Assignments

### Active Agents This Phase
${this.getAgentRecommendations(cycle.phase)}

### Next Action
${this.getPhaseGuidance(cycle.phase, cycle.feature)}

${cycle.completed ? `\n## Completion\n**Completed**: ${new Date(cycle.completed).toLocaleDateString()}\n${cycle.notes ? `**Notes**: ${cycle.notes}` : ''}` : ''}
`;
  }

  getAgentRecommendations(phase) {
    const recommendations = {
      'Focus': '- **Architect Agent**: Design system architecture\n- **Security Agent**: Identify security requirements\n- **Documentation Agent**: Draft PRD and requirements',
      'Orchestrate': '- **Architect Agent**: Break down into tasks\n- **DevOps Agent**: Plan deployment pipeline\n- **Tester Agent**: Design test strategy',
      'Refine': '- **Developer Agent**: Implement features\n- **Tester Agent**: Write and run tests\n- **Code Reviewer Agent**: Review code quality',
      'Generate': '- **DevOps Agent**: Build and deploy\n- **Documentation Agent**: Update docs\n- **Tester Agent**: Final validation',
      'Evaluate': '- **All Agents**: Contribute to retrospective\n- **Documentation Agent**: Document learnings'
    };
    return recommendations[phase] || '*Determining appropriate agents...*';
  }

  getPhaseGuidance(phase, feature) {
    const guidance = {
      'Focus': `Ask AI assistant to analyze requirements for "${feature}" with Architect, Security, and Documentation agents`,
      'Orchestrate': `Request task breakdown and dependency planning for "${feature}" implementation`,
      'Refine': `Begin implementation of "${feature}" with Developer agent, ensuring tests are written first`,
      'Generate': `Prepare "${feature}" for deployment with DevOps agent and update documentation`,
      'Evaluate': `Conduct retrospective analysis of "${feature}" cycle with all specialist agents`
    };
    return guidance[phase] || 'Continue with current phase activities';
  }

  parseCycleFile(content, id) {
    const lines = content.split('\n');
    const feature = lines[0].replace(/^#\s*/, '').replace(/^Feature:\s*/, '');

    // Parse metadata
    const metadata = {};
    const progressData = { Focus: 0, Orchestrate: 0, Refine: 0, Generate: 0, Evaluate: 0 };
    const tasks = { Focus: [], Orchestrate: [], Refine: [], Generate: [], Evaluate: [] };

    let currentPhase = null;
    let inProgressSection = false;
    let inTaskSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Parse metadata
      if (line.startsWith('**Started**:')) {
        metadata.created = line.replace('**Started**:', '').trim();
      } else if (line.startsWith('**Status**:')) {
        metadata.phase = line.replace('**Status**:', '').replace('Phase', '').trim();
      } else if (line.startsWith('**Priority**:')) {
        metadata.priority = line.replace('**Priority**:', '').trim();
      }

      // Parse phase sections
      if (line.match(/^###\s*Phase\s*\d+:\s*(\w+)/)) {
        const phaseMatch = line.match(/^###\s*Phase\s*\d+:\s*(\w+)/);
        currentPhase = phaseMatch[1];
        inTaskSection = false;
      }

      // Parse tasks within phases
      if (currentPhase && line.startsWith('- [ ]')) {
        const task = line.replace('- [ ]', '').trim();
        if (!tasks[currentPhase]) tasks[currentPhase] = [];
        tasks[currentPhase].push(task);
      } else if (currentPhase && line.startsWith('- [x]')) {
        const task = line.replace('- [x]', '').trim();
        if (!tasks[currentPhase]) tasks[currentPhase] = [];
        tasks[currentPhase].push(task + ' ✓');
      }

      // Parse progress indicators
      if (line.includes('[Active]')) {
        const phaseMatch = line.match(/(\w+)\s*[🎯📝🔨🚀📊]?\s*\[Active\]/);
        if (phaseMatch) {
          metadata.phase = phaseMatch[1];
          progressData[phaseMatch[1]] = 50; // Active phase gets 50% by default
        }
      } else if (line.includes('[Completed]')) {
        const phaseMatch = line.match(/(\w+)\s*[🎯📝🔨🚀📊]?\s*\[Completed\]/);
        if (phaseMatch) {
          progressData[phaseMatch[1]] = 100;
        }
      }
    }

    // Parse completion date if cycle is completed
    let completed = null;
    const completedMatch = content.match(/\*\*Completed\*\*:\s*([^\n]+)/);
    if (completedMatch) {
      completed = completedMatch[1].trim();
    }

    // Extract description
    let description = '';
    const descMatch = content.match(/### Requirements\n([^#]*?)(?=\n#|$)/s);
    if (descMatch) {
      description = descMatch[1].replace(/\*[^*]*\*/g, '').trim();
    }

    return {
      id,
      feature,
      description: description || '',
      priority: metadata.priority || 'medium',
      phase: metadata.phase || 'Focus',
      created: metadata.created || new Date().toISOString(),
      completed,
      progress: progressData,
      tasks,
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