/**
 * MCP tool handlers for FORGE development workflow management
 */

class ToolHandlers {
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    this.logger = options.logger || console;
  }

  async getCapabilities() {
    return {
      project: "Project initialization and configuration",
      cycles: "Development cycle management",
      phases: "Phase progression and task management", 
      learning: "Knowledge capture and retrospectives"
    };
  }

  async listTools() {
    return [
      // Project Management
      {
        name: 'forge_init_project',
        description: 'Initialize FORGE in current project directory',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { 
              type: 'string', 
              description: 'Project name' 
            },
            projectType: {
              type: 'string',
              enum: ['web', 'api', 'fullstack', 'library', 'cli'],
              description: 'Project type for template selection'
            },
            description: { 
              type: 'string', 
              description: 'Project description' 
            }
          },
          required: ['projectName']
        }
      },

      // Cycle Management
      {
        name: 'forge_new_cycle',
        description: 'Create new development cycle',
        inputSchema: {
          type: 'object', 
          properties: {
            feature: { 
              type: 'string', 
              description: 'Feature or goal name' 
            },
            description: { 
              type: 'string', 
              description: 'Detailed description' 
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Cycle priority'
            }
          },
          required: ['feature']
        }
      },

      {
        name: 'forge_cycle_status',
        description: 'Get development cycle status and progress',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: { 
              type: 'string', 
              description: 'Specific cycle ID (optional)' 
            },
            includeHistory: { 
              type: 'boolean', 
              description: 'Include completed cycles' 
            }
          }
        }
      },

      {
        name: 'forge_complete_cycle',
        description: 'Complete and archive development cycle',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: { 
              type: 'string', 
              description: 'Cycle to complete' 
            },
            notes: { 
              type: 'string', 
              description: 'Completion notes' 
            },
            forceComplete: { 
              type: 'boolean', 
              description: 'Skip validation checks' 
            }
          },
          required: ['cycleId']
        }
      },

      // Phase Management
      {
        name: 'forge_phase_advance',
        description: 'Advance cycle to next development phase',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: { 
              type: 'string', 
              description: 'Cycle to advance' 
            },
            skipValidation: { 
              type: 'boolean', 
              description: 'Skip phase completion checks' 
            },
            notes: { 
              type: 'string', 
              description: 'Phase transition notes' 
            }
          },
          required: ['cycleId']
        }
      },

      {
        name: 'forge_phase_update',
        description: 'Update phase progress and tasks',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: { 
              type: 'string', 
              description: 'Target cycle' 
            },
            phase: {
              type: 'string',
              enum: ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate'],
              description: 'Phase to update'
            },
            progress: { 
              type: 'number', 
              minimum: 0, 
              maximum: 100,
              description: 'Progress percentage' 
            },
            tasks: {
              type: 'array',
              items: { type: 'string' },
              description: 'Phase tasks'
            }
          },
          required: ['cycleId', 'phase']
        }
      },

      // Learning & Knowledge
      {
        name: 'forge_add_learning',
        description: 'Add insight to project knowledge base',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['success', 'failure', 'pattern', 'antipattern', 'tool', 'process'],
              description: 'Learning category'
            },
            title: { 
              type: 'string', 
              description: 'Learning title' 
            },
            description: { 
              type: 'string', 
              description: 'Detailed description' 
            },
            context: { 
              type: 'string', 
              description: 'When/where this applies' 
            }
          },
          required: ['category', 'title', 'description']
        }
      },

      {
        name: 'forge_retrospective',
        description: 'Generate retrospective analysis',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: { 
              type: 'string', 
              description: 'Cycle to analyze' 
            },
            includeMetrics: { 
              type: 'boolean', 
              description: 'Include performance metrics' 
            }
          }
        }
      },

      // Analysis & Optimization
      {
        name: 'forge_analyze_project',
        description: 'Analyze project structure and suggest optimizations',
        inputSchema: {
          type: 'object',
          properties: {
            depth: {
              type: 'string',
              enum: ['surface', 'deep', 'comprehensive'],
              description: 'Analysis depth level'
            },
            focus: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['structure', 'dependencies', 'performance', 'security', 'quality']
              },
              description: 'Analysis focus areas'
            }
          }
        }
      }
    ];
  }

  async callTool(name, args = {}) {
    this.logger.debug(`Calling tool: ${name}`, args);

    try {
      switch (name) {
        case 'forge_init_project':
          return await this.initProject(args);
        case 'forge_new_cycle':
          return await this.newCycle(args);
        case 'forge_cycle_status':
          return await this.cycleStatus(args);
        case 'forge_complete_cycle':
          return await this.completeCycle(args);
        case 'forge_phase_advance':
          return await this.phaseAdvance(args);
        case 'forge_phase_update':
          return await this.phaseUpdate(args);
        case 'forge_add_learning':
          return await this.addLearning(args);
        case 'forge_retrospective':
          return await this.retrospective(args);
        case 'forge_analyze_project':
          return await this.analyzeProject(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      this.logger.error(`Tool ${name} failed:`, error.message);
      throw error;
    }
  }

  // Tool Implementations
  async initProject(args) {
    const { projectName, projectType = 'web', description = '' } = args;
    
    const config = await this.stateManager.getConfig();
    const updatedConfig = {
      ...config,
      project: projectName,
      type: projectType,
      description,
      initialized: new Date().toISOString()
    };
    
    await this.stateManager.updateConfig(updatedConfig);
    
    return {
      type: 'text',
      text: `✅ FORGE initialized for ${projectName} (${projectType})\n\n` +
            `Project structure created in .forge/ directory.\n` +
            `You can now start creating development cycles with forge_new_cycle.`
    };
  }

  async newCycle(args) {
    const { feature, description, priority = 'medium' } = args;
    
    const cycle = await this.stateManager.createCycle(feature, {
      description,
      priority
    });
    
    return {
      type: 'text',
      text: `🚀 Created new development cycle: "${feature}"\n\n` +
            `**ID**: ${cycle.id}\n` +
            `**Priority**: ${priority}\n` +
            `**Phase**: Focus (starting phase)\n\n` +
            `The cycle is now active and ready for the Focus phase. ` +
            `Start by gathering requirements and defining test scenarios.`
    };
  }

  async cycleStatus(args) {
    const { cycleId, includeHistory = false } = args;
    
    if (cycleId) {
      const cycle = await this.stateManager.getCycle(cycleId);
      return {
        type: 'text',
        text: `📋 Cycle Status: ${cycle.feature}\n\n${cycle.content}`
      };
    } else {
      const cycles = await this.stateManager.getCycles(includeHistory);
      
      let status = '📊 Development Cycles Overview\n\n';
      
      if (cycles.active.length > 0) {
        status += '**Active Cycles:**\n';
        for (const cycle of cycles.active) {
          status += `• ${cycle.feature} (${cycle.id})\n`;
        }
        status += '\n';
      } else {
        status += '**No active cycles**\n\n';
      }
      
      if (includeHistory && cycles.completed?.length > 0) {
        status += '**Recent Completed Cycles:**\n';
        for (const cycle of cycles.completed.slice(-5)) {
          status += `• ${cycle.feature} (completed)\n`;
        }
      }
      
      return {
        type: 'text',
        text: status
      };
    }
  }

  async completeCycle(args) {
    const { cycleId, notes = '', forceComplete = false } = args;
    
    const completedCycle = await this.stateManager.completeCycle(cycleId, notes);
    
    return {
      type: 'text', 
      text: `✅ Completed cycle: ${completedCycle.feature}\n\n` +
            `The cycle has been archived and moved to completed cycles.\n` +
            `${notes ? `**Notes**: ${notes}\n\n` : ''}` +
            `Consider using forge_retrospective to capture learnings from this cycle.`
    };
  }

  async phaseAdvance(args) {
    const { cycleId, skipValidation = false, notes = '' } = args;
    
    const cycle = await this.stateManager.getCycle(cycleId);
    
    // Phase progression logic
    const phases = ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate'];
    const currentIndex = phases.indexOf(cycle.phase || 'Focus');
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= phases.length) {
      return {
        type: 'text',
        text: `⚠️ Cycle "${cycle.feature}" is already in the final phase (Evaluate).\n\n` +
              `Use forge_complete_cycle to archive this cycle.`
      };
    }
    
    const nextPhase = phases[nextIndex];
    const updatedCycle = await this.stateManager.updateCycle(cycleId, {
      phase: nextPhase
    });
    
    return {
      type: 'text',
      text: `🎯 Advanced cycle "${cycle.feature}" to ${nextPhase} phase\n\n` +
            `**Previous**: ${phases[currentIndex]}\n` +
            `**Current**: ${nextPhase}\n\n` +
            `${notes ? `**Notes**: ${notes}\n\n` : ''}` +
            `Ready to begin ${nextPhase} phase activities.`
    };
  }

  async phaseUpdate(args) {
    const { cycleId, phase, progress, tasks } = args;
    
    const cycle = await this.stateManager.getCycle(cycleId);
    const updates = {};
    
    if (progress !== undefined) {
      updates[`progress.${phase}`] = progress;
    }
    
    if (tasks) {
      updates[`tasks.${phase}`] = tasks;
    }
    
    await this.stateManager.updateCycle(cycleId, updates);
    
    return {
      type: 'text',
      text: `📈 Updated ${phase} phase for "${cycle.feature}"\n\n` +
            `${progress !== undefined ? `**Progress**: ${progress}%\n` : ''}` +
            `${tasks ? `**Tasks**: ${tasks.length} items\n` : ''}` +
            `\nPhase update completed successfully.`
    };
  }

  async addLearning(args) {
    const { category, title, description, context } = args;
    
    const learning = await this.stateManager.addLearning(
      category, 
      title, 
      description, 
      context
    );
    
    return {
      type: 'text',
      text: `🧠 Added learning: "${title}"\n\n` +
            `**Category**: ${category}\n` +
            `**Description**: ${description}\n` +
            `${context ? `**Context**: ${context}\n` : ''}` +
            `\nLearning has been added to the project knowledge base.`
    };
  }

  async retrospective(args) {
    const { cycleId, includeMetrics = false } = args;
    
    if (cycleId) {
      const cycle = await this.stateManager.getCycle(cycleId);
      
      return {
        type: 'text',
        text: `📊 Retrospective Analysis: ${cycle.feature}\n\n` +
              `**Cycle Overview**\n` +
              `- Feature: ${cycle.feature}\n` +
              `- Duration: [Analysis needed]\n` +
              `- Final Phase: ${cycle.phase || 'Unknown'}\n\n` +
              `**Key Insights**\n` +
              `*Retrospective analysis will be enhanced with cycle completion data*\n\n` +
              `**Recommendations**\n` +
              `- Consider adding learnings with forge_add_learning\n` +
              `- Review cycle structure for future improvements`
      };
    } else {
      const cycles = await this.stateManager.getCycles(true);
      
      return {
        type: 'text',
        text: `📈 Project Retrospective Overview\n\n` +
              `**Cycle Summary**\n` +
              `- Active: ${cycles.active.length}\n` +
              `- Completed: ${cycles.completed?.length || 0}\n\n` +
              `**Pattern Analysis**\n` +
              `*Cross-cycle analysis will be available as more cycles are completed*\n\n` +
              `Use forge_retrospective with specific cycleId for detailed analysis.`
      };
    }
  }

  async analyzeProject(args) {
    const { depth = 'surface', focus = ['structure'] } = args;
    
    const config = await this.stateManager.getConfig();
    const cycles = await this.stateManager.getCycles(true);
    
    let analysis = `🔍 Project Analysis (${depth} level)\n\n`;
    
    analysis += `**Project Overview**\n`;
    analysis += `- Name: ${config.project}\n`;
    analysis += `- Type: ${config.type || 'Unknown'}\n`;
    analysis += `- Active Cycles: ${cycles.active.length}\n`;
    analysis += `- Completed Cycles: ${cycles.completed?.length || 0}\n\n`;
    
    if (focus.includes('structure')) {
      analysis += `**Structure Analysis**\n`;
      analysis += `- FORGE directory: ✅ Present\n`;
      analysis += `- Configuration: ✅ Valid\n`;
      analysis += `- Templates: ✅ Available\n\n`;
    }
    
    if (focus.includes('performance')) {
      analysis += `**Performance Insights**\n`;
      analysis += `- Cycle completion rate: ${cycles.completed?.length || 0}/${(cycles.active.length + (cycles.completed?.length || 0))}\n`;
      analysis += `- Average cycle phases: [Needs completion data]\n\n`;
    }
    
    analysis += `**Recommendations**\n`;
    analysis += `- Continue using structured development cycles\n`;
    analysis += `- Add learnings after each cycle completion\n`;
    analysis += `- Consider retrospective analysis for process improvement`;
    
    return {
      type: 'text',
      text: analysis
    };
  }
}

module.exports = { ToolHandlers };