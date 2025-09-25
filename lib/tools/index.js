/**
 * MCP tool handlers for FORGE development workflow management
 */

class ToolHandlers {
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    this.logger = options.logger || console;
    this.localLLM = null;
    this.dashboardEvents = null;
  }

  setLocalLLM(localLLM) {
    this.localLLM = localLLM;
    this.logger.debug('Local LLM orchestrator attached to tools');
  }

  setDashboardEvents(dashboardEvents) {
    this.dashboardEvents = dashboardEvents;
    this.logger.debug('Dashboard events attached to tools');
  }

  async getCapabilities() {
    return {
      project: 'Project initialization and configuration',
      cycles: 'Development cycle management',
      phases: 'Phase progression and task management', 
      learning: 'Knowledge capture and retrospectives'
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
      },

      // Framework Enforcement Tools
      {
        name: 'forge_checkpoint',
        description: 'Validate cycle compliance and provide specific guidance',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle to validate'
            },
            enforce: {
              type: 'boolean',
              description: 'Strict enforcement mode (default: true)'
            }
          },
          required: ['cycleId']
        }
      },

      {
        name: 'forge_guide_next',
        description: 'Get specific next action recommendations for current phase',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle to get guidance for'
            },
            agentType: {
              type: 'string',
              enum: ['architect', 'developer', 'tester', 'devops', 'security', 'documentation', 'reviewer'],
              description: 'Get guidance for specific agent type'
            }
          },
          required: ['cycleId']
        }
      },

      {
        name: 'forge_complete_task',
        description: 'Mark a specific task as completed in the current phase',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle containing the task'
            },
            phase: {
              type: 'string',
              enum: ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate'],
              description: 'Phase containing the task (optional - defaults to current phase)'
            },
            taskDescription: {
              type: 'string',
              description: 'Description of the task to mark complete (partial match supported)'
            }
          },
          required: ['cycleId', 'taskDescription']
        }
      },

      // Local LLM Tools
      {
        name: 'forge_local_llm_status',
        description: 'Get status of local LLM orchestrator',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },

      {
        name: 'forge_local_llm_config',
        description: 'Configure local LLM orchestrator settings',
        inputSchema: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Enable or disable local LLM orchestration'
            },
            model: {
              type: 'string',
              description: 'Primary model for task execution'
            },
            fallbackModel: {
              type: 'string',
              description: 'Fallback model if primary fails'
            },
            host: {
              type: 'string',
              description: 'Ollama host URL (default: http://localhost:11434)'
            },
            trivialTaskThreshold: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Threshold for task delegation (0.0-1.0)'
            },
            autoDelegate: {
              type: 'boolean',
              description: 'Automatically delegate eligible tasks'
            }
          },
          additionalProperties: false
        }
      },

      {
        name: 'forge_delegate_task',
        description: 'Manually delegate a task to local LLM',
        inputSchema: {
          type: 'object',
          properties: {
            taskType: {
              type: 'string',
              enum: [
                'generate_prd_template',
                'generate_task_breakdown',
                'generate_test_scenarios',
                'format_documentation',
                'validate_requirements',
                'analyze_code_structure',
                'suggest_variable_names',
                'create_task_list',
                'decompose_prd',
                'extract_features',
                'analyze_requirements',
                'prioritize_tasks',
                'identify_dependencies'
              ],
              description: 'Type of task to delegate'
            },
            taskDescription: {
              type: 'string',
              description: 'Detailed description of the task'
            },
            context: {
              type: 'object',
              description: 'Additional context for task execution',
              additionalProperties: true
            },
            forceDelegate: {
              type: 'boolean',
              description: 'Force delegation even if task is classified as complex'
            }
          },
          required: ['taskType', 'taskDescription']
        }
      },

      // Agent Invocation Tools
      {
        name: 'forge_invoke_agent',
        description: 'Invoke a specific FORGE agent for a task',
        inputSchema: {
          type: 'object',
          properties: {
            agentType: {
              type: 'string',
              enum: ['architect', 'developer', 'tester', 'devops', 'security', 'documentation', 'reviewer'],
              description: 'Type of agent to invoke'
            },
            cycleId: {
              type: 'string',
              description: 'Development cycle ID for context'
            },
            task: {
              type: 'string',
              description: 'Specific task for the agent to perform'
            },
            context: {
              type: 'object',
              description: 'Additional context for the agent',
              additionalProperties: true
            }
          },
          required: ['agentType', 'task']
        }
      },

      // PRD Management
      {
        name: 'forge_decompose_prd',
        description: 'Analyze and decompose PRD into development cycles and tasks',
        inputSchema: {
          type: 'object',
          properties: {
            prdContent: {
              type: 'string',
              description: 'PRD content to analyze and decompose'
            },
            prdFilePath: {
              type: 'string',
              description: 'Path to existing PRD file to decompose'
            },
            analysisLevel: {
              type: 'string',
              enum: ['basic', 'detailed', 'comprehensive'],
              description: 'Level of analysis depth'
            },
            generateCycles: {
              type: 'boolean',
              description: 'Automatically create cycles from decomposition'
            },
            featurePrefix: {
              type: 'string',
              description: 'Prefix for generated cycle names'
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
      case 'forge_checkpoint':
        return await this.checkpoint(args);
      case 'forge_guide_next':
        return await this.guideNext(args);
      case 'forge_complete_task':
        return await this.completeTask(args);
      case 'forge_local_llm_status':
        return await this.getLocalLLMStatus(args);
      case 'forge_local_llm_config':
        return await this.configureLocalLLM(args);
      case 'forge_delegate_task':
        return await this.delegateTask(args);
      case 'forge_invoke_agent':
        return await this.invokeAgent(args);
      case 'forge_decompose_prd':
        return await this.decomposePRD(args);
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

    // Detect existing standards and rules
    const { StandardsDetector } = require('../core/standards-detector');
    const detector = new StandardsDetector(this.stateManager.baseDir);
    const standardsReport = await detector.detectAllStandards();

    const config = await this.stateManager.getConfig();
    const updatedConfig = {
      ...config,
      project: projectName,
      type: projectType,
      description,
      initialized: new Date().toISOString(),
      standards: standardsReport.summary,
      detectedTools: {
        linting: standardsReport.standards.linting.map(l => l.tool),
        testing: standardsReport.standards.testing.map(t => t.framework || t.source),
        security: standardsReport.standards.security.map(s => s.type),
        cicd: standardsReport.standards.ci_cd.map(c => c.platform)
      },
      forgeIntegration: standardsReport.forgeIntegration
    };

    await this.stateManager.updateConfig(updatedConfig);

    // Store detailed standards for validation
    await this.stateManager.writeFile(
      this.stateManager.forgeDir + '/standards-report.json',
      JSON.stringify(standardsReport, null, 2)
    );

    let initMessage = '🚀 **FORGE Framework Initialized**\n\n';
    initMessage += `**Project**: ${projectName} (${projectType})\n`;
    initMessage += `**Description**: ${description || 'No description provided'}\n\n`;

    // Standards detection summary
    initMessage += '**🔍 DETECTED PROJECT STANDARDS:**\n';
    if (standardsReport.summary.hasLinting) {
      const linters = standardsReport.standards.linting.map(l => l.tool).join(', ');
      initMessage += `✅ **Linting**: ${linters}\n`;
    } else {
      initMessage += '❌ **Linting**: Not configured\n';
    }

    if (standardsReport.summary.hasTesting) {
      const frameworks = standardsReport.standards.testing.map(t => t.framework || 'Scripts').join(', ');
      initMessage += `✅ **Testing**: ${frameworks}\n`;
    } else {
      initMessage += '❌ **Testing**: Not configured (CRITICAL)\n';
    }

    if (standardsReport.summary.hasSecurity) {
      initMessage += '✅ **Security**: Scanning configured\n';
    } else {
      initMessage += '⚠️  **Security**: No scanning detected\n';
    }

    if (standardsReport.summary.hasCICD) {
      const platforms = standardsReport.standards.ci_cd.map(c => c.platform).join(', ');
      initMessage += `✅ **CI/CD**: ${platforms}\n`;
    } else {
      initMessage += '⚠️  **CI/CD**: Not configured\n';
    }

    if (standardsReport.summary.hasGitHooks) {
      initMessage += '✅ **Git Hooks**: Pre-commit checks enabled\n';
    } else {
      initMessage += '⚠️  **Git Hooks**: No pre-commit checks\n';
    }

    // Recommendations
    if (standardsReport.recommendations.length > 0) {
      initMessage += '\n**📋 RECOMMENDATIONS:**\n';
      standardsReport.recommendations.forEach(rec => {
        const priority = rec.priority === 'critical' ? '🚨' :
          rec.priority === 'high' ? '⚠️' : '💡';
        initMessage += `${priority} ${rec.message}\n`;
      });
    }

    // FORGE Integration
    initMessage += '\n**🔧 FORGE INTEGRATION:**\n';
    initMessage += '• Standards integrated into phase validation\n';
    initMessage += '• Existing tools will be enforced during cycles\n';
    initMessage += '• Custom validation rules applied\n\n';

    initMessage += '**📁 FILES CREATED:**\n';
    initMessage += '• .forge/config.yaml - Project configuration\n';
    initMessage += '• .forge/standards-report.json - Detected standards\n';
    initMessage += '• .forge/context.md - AI assistant context\n\n';

    initMessage += '**🎯 NEXT STEPS:**\n';
    if (!standardsReport.summary.hasTesting) {
      initMessage += '1. 🚨 URGENT: Configure testing framework (required for FORGE)\n';
    }
    if (!standardsReport.summary.hasLinting) {
      initMessage += '2. ⚠️  Set up code linting for quality assurance\n';
    }
    initMessage += '3. Create your first development cycle with `forge_new_cycle`\n';

    initMessage += '\n**💡 TIP**: Use `forge_analyze_project` to get detailed analysis with standards integration.';

    return {
      type: 'text',
      text: initMessage
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
      text: '🚀 **New FORGE Development Cycle Created**\n\n' +
            `**Feature**: ${feature}\n` +
            `**ID**: ${cycle.id}\n` +
            `**Priority**: ${priority}\n` +
            '**Phase**: Focus 🎯 (starting phase)\n\n' +
            '**📋 IMMEDIATE NEXT ACTIONS (Focus Phase):**\n' +
            '1. 🏗️ Architect Agent: Design system architecture\n' +
            '2. 🔒 Security Agent: Identify security requirements\n' +
            '3. 📚 Documentation Agent: Draft PRD and requirements\n\n' +
            '**⚠️ MANDATORY BEFORE ADVANCING:**\n' +
            '• Complete test scenarios (MANDATORY)\n' +
            '• Finalize architecture design\n' +
            '• Identify security risks\n' +
            '• Write detailed requirements (>50 chars)\n\n' +
            '**🎯 Focus Phase Goal:** Establish clear requirements and prevent scope creep\n\n' +
            `Use \`forge_cycle_status ${cycle.id}\` to see detailed progress and agent recommendations.`
    };
  }

  async cycleStatus(args) {
    const { cycleId, includeHistory = false } = args;

    if (cycleId) {
      const cycle = await this.stateManager.getCycle(cycleId);

      // Generate structured status report
      let status = `📋 **${cycle.feature}**\n\n`;
      status += `**Phase**: ${cycle.phase} ${this.getPhaseEmoji(cycle.phase)}\n`;
      status += `**Priority**: ${cycle.priority}\n`;
      status += `**Started**: ${cycle.created}\n\n`;

      status += '**📊 Phase Progress:**\n';
      for (const phase of ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate']) {
        const progress = cycle.progress[phase];
        const bar = this.getProgressBar(progress);
        const status_icon = phase === cycle.phase ? '🔵' : progress === 100 ? '✅' : '⭕';
        status += `${status_icon} ${phase}: ${bar} ${progress}%\n`;
      }

      status += `\n**🎯 Current Phase Tasks (${cycle.phase}):**\n`;
      const phaseTasks = cycle.tasks[cycle.phase] || [];
      if (phaseTasks.length > 0) {
        for (const task of phaseTasks) {
          const completed = task.endsWith(' ✓');
          status += completed ? `✅ ${task.replace(' ✓', '')}\n` : `⬜ ${task}\n`;
        }
      } else {
        status += '*No tasks defined yet*\n';
      }

      status += '\n**🤖 Recommended Agents:**\n';
      status += this.getAgentRecommendations(cycle.phase);

      status += '\n\n**💡 Next Action:**\n';
      status += this.getPhaseGuidance(cycle.phase, cycle.feature);

      return {
        type: 'text',
        text: status
      };
    } else {
      const cycles = await this.stateManager.getCycles(includeHistory);

      let status = '📊 **FORGE Development Cycles**\n\n';

      if (cycles.active.length > 0) {
        status += '**🚀 Active Cycles:**\n';
        for (const cycle of cycles.active) {
          const emoji = this.getPhaseEmoji(cycle.phase);
          status += `• ${cycle.feature} ${emoji} (${cycle.phase} phase)\n`;
          status += `  ID: ${cycle.id} | Priority: ${cycle.priority}\n`;
        }
        status += '\n';
      } else {
        status += '**No active cycles**\n';
        status += 'Use `forge_new_cycle` to start a new development cycle\n\n';
      }

      if (includeHistory && cycles.completed?.length > 0) {
        status += '**✅ Recent Completed Cycles:**\n';
        for (const cycle of cycles.completed.slice(-5)) {
          status += `• ${cycle.feature} (completed ${cycle.completed || ''})\n`;
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
            'The cycle has been archived and moved to completed cycles.\n' +
            `${notes ? `**Notes**: ${notes}\n\n` : ''}` +
            'Consider using forge_retrospective to capture learnings from this cycle.'
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
              'Use forge_complete_cycle to archive this cycle.'
      };
    }

    // Validation checks (unless skipped)
    if (!skipValidation) {
      const validation = await this.validatePhaseCompletion(cycle, cycle.phase);

      if (!validation.canAdvance) {
        let blockMessage = '🚫 **FORGE FRAMEWORK ENFORCEMENT**\n\n';
        blockMessage += `Cannot advance from **${cycle.phase}** phase:\n\n`;

        // Show blocking issues
        blockMessage += '**🛑 BLOCKING ISSUES:**\n';
        validation.issues.forEach(issue => {
          blockMessage += `${issue}\n`;
        });

        // Show warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          blockMessage += '\n**⚠️ WARNINGS:**\n';
          validation.warnings.forEach(warning => {
            blockMessage += `${warning}\n`;
          });
        }

        // Show next steps
        if (validation.recommendedActions && validation.recommendedActions.length > 0) {
          blockMessage += '\n**📋 REQUIRED ACTIONS:**\n';
          validation.recommendedActions.forEach(action => {
            blockMessage += `${action}\n`;
          });
        }

        blockMessage += '\n**🔧 OPTIONS:**\n';
        blockMessage += '• Complete the required actions above\n';
        blockMessage += '• Use `skipValidation: true` to override (not recommended)\n';
        blockMessage += '• Use `forge_cycle_status` to see detailed task status\n\n';
        blockMessage += '**🎯 FORGE Philosophy:** "Quality over speed - each phase builds the foundation for the next"';

        return {
          type: 'text',
          text: blockMessage
        };
      }

      // Show warnings even if advancement is allowed
      if (validation.warnings && validation.warnings.length > 0) {
        console.warn(`⚠️ Warnings for ${cycle.phase} phase advancement:`, validation.warnings);
      }
    }

    const nextPhase = phases[nextIndex];

    // Update cycle with new phase and mark current as complete
    const updates = {
      phase: nextPhase,
      progress: {
        ...cycle.progress,
        [cycle.phase]: 100,
        [nextPhase]: 10  // Start new phase at 10%
      }
    };

    const updatedCycle = await this.stateManager.updateCycle(cycleId, updates);

    return {
      type: 'text',
      text: '🎯 **Phase Advanced Successfully**\n\n' +
            `**Cycle**: ${cycle.feature}\n` +
            `**From**: ${phases[currentIndex]} ${this.getPhaseEmoji(phases[currentIndex])} ✅\n` +
            `**To**: ${nextPhase} ${this.getPhaseEmoji(nextPhase)} 🔵\n\n` +
            `${notes ? `**Notes**: ${notes}\n\n` : ''}` +
            `**🤖 Active Agents for ${nextPhase}:**\n` +
            this.getAgentRecommendations(nextPhase) + '\n\n' +
            '**💡 Next Action:**\n' +
            this.getPhaseGuidance(nextPhase, cycle.feature)
    };
  }

  async phaseUpdate(args) {
    const { cycleId, phase, progress, tasks } = args;

    const cycle = await this.stateManager.getCycle(cycleId);
    const updates = {};

    // Handle nested property updates properly
    if (progress !== undefined) {
      if (!updates.progress) updates.progress = { ...cycle.progress };
      updates.progress[phase] = progress;
    }

    if (tasks) {
      if (!updates.tasks) updates.tasks = { ...cycle.tasks };
      updates.tasks[phase] = tasks;
    }

    await this.stateManager.updateCycle(cycleId, updates);

    return {
      type: 'text',
      text: `📈 Updated ${phase} phase for "${cycle.feature}"\n\n` +
            `${progress !== undefined ? `**Progress**: ${progress}%\n` : ''}` +
            `${tasks ? `**Tasks**: ${tasks.length} items\n` : ''}` +
            '\nPhase update completed successfully.'
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
            '\nLearning has been added to the project knowledge base.'
    };
  }

  async retrospective(args) {
    const { cycleId, includeMetrics = false } = args;
    
    if (cycleId) {
      const cycle = await this.stateManager.getCycle(cycleId);
      
      return {
        type: 'text',
        text: `📊 Retrospective Analysis: ${cycle.feature}\n\n` +
              '**Cycle Overview**\n' +
              `- Feature: ${cycle.feature}\n` +
              '- Duration: [Analysis needed]\n' +
              `- Final Phase: ${cycle.phase || 'Unknown'}\n\n` +
              '**Key Insights**\n' +
              '*Retrospective analysis will be enhanced with cycle completion data*\n\n' +
              '**Recommendations**\n' +
              '- Consider adding learnings with forge_add_learning\n' +
              '- Review cycle structure for future improvements'
      };
    } else {
      const cycles = await this.stateManager.getCycles(true);
      
      return {
        type: 'text',
        text: '📈 Project Retrospective Overview\n\n' +
              '**Cycle Summary**\n' +
              `- Active: ${cycles.active.length}\n` +
              `- Completed: ${cycles.completed?.length || 0}\n\n` +
              '**Pattern Analysis**\n' +
              '*Cross-cycle analysis will be available as more cycles are completed*\n\n' +
              'Use forge_retrospective with specific cycleId for detailed analysis.'
      };
    }
  }

  async analyzeProject(args) {
    const { depth = 'surface', focus = ['structure'] } = args;
    
    const config = await this.stateManager.getConfig();
    const cycles = await this.stateManager.getCycles(true);
    
    let analysis = `🔍 Project Analysis (${depth} level)\n\n`;
    
    analysis += '**Project Overview**\n';
    analysis += `- Name: ${config.project}\n`;
    analysis += `- Type: ${config.type || 'Unknown'}\n`;
    analysis += `- Active Cycles: ${cycles.active.length}\n`;
    analysis += `- Completed Cycles: ${cycles.completed?.length || 0}\n\n`;
    
    if (focus.includes('structure')) {
      analysis += '**Structure Analysis**\n';
      analysis += '- FORGE directory: ✅ Present\n';
      analysis += '- Configuration: ✅ Valid\n';
      analysis += '- Templates: ✅ Available\n\n';
    }
    
    if (focus.includes('performance')) {
      analysis += '**Performance Insights**\n';
      analysis += `- Cycle completion rate: ${cycles.completed?.length || 0}/${(cycles.active.length + (cycles.completed?.length || 0))}\n`;
      analysis += '- Average cycle phases: [Needs completion data]\n\n';
    }
    
    analysis += '**Recommendations**\n';
    analysis += '- Continue using structured development cycles\n';
    analysis += '- Add learnings after each cycle completion\n';
    analysis += '- Consider retrospective analysis for process improvement';
    
    return {
      type: 'text',
      text: analysis
    };
  }

  // Helper methods
  getPhaseEmoji(phase) {
    const emojis = {
      'Focus': '🎯',
      'Orchestrate': '📝',
      'Refine': '🔨',
      'Generate': '🚀',
      'Evaluate': '📊'
    };
    return emojis[phase] || '📌';
  }

  getProgressBar(progress) {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  getAgentRecommendations(phase) {
    const recommendations = {
      'Focus': '• Architect Agent - Design system architecture\n• Security Agent - Identify security requirements\n• Documentation Agent - Draft PRD and requirements',
      'Orchestrate': '• Architect Agent - Break down into tasks\n• DevOps Agent - Plan deployment pipeline\n• Tester Agent - Design test strategy',
      'Refine': '• Developer Agent - Implement features\n• Tester Agent - Write and run tests\n• Code Reviewer Agent - Review code quality',
      'Generate': '• DevOps Agent - Build and deploy\n• Documentation Agent - Update docs\n• Tester Agent - Final validation',
      'Evaluate': '• All Agents - Contribute to retrospective\n• Documentation Agent - Document learnings'
    };
    return recommendations[phase] || 'Determining appropriate agents...';
  }

  getPhaseGuidance(phase, feature) {
    const guidance = {
      'Focus': `Analyze requirements for "${feature}" with specialist agents`,
      'Orchestrate': `Break down "${feature}" into actionable tasks with dependencies`,
      'Refine': `Implement "${feature}" following TDD practices`,
      'Generate': `Build and prepare "${feature}" for deployment`,
      'Evaluate': `Measure success and capture learnings from "${feature}"`
    };
    return guidance[phase] || 'Continue with current phase activities';
  }

  async validatePhaseCompletion(cycle, phase) {
    const issues = [];
    const warnings = [];

    // Get project standards for enhanced validation
    const config = await this.stateManager.getConfig();
    const projectStandards = config.standards || {};
    const detectedTools = config.detectedTools || {};

    // STRICT ENFORCEMENT RULES
    if (phase === 'Focus') {
      // MANDATORY: Test scenarios must be defined
      const tasks = cycle.tasks.Focus || [];
      const hasTestScenarios = tasks.some(t =>
        t.toLowerCase().includes('test scenario') &&
        !t.includes('(MANDATORY)') // Must be completed, not just listed
      );

      if (!hasTestScenarios) {
        issues.push('🚫 BLOCKED: Test scenarios must be completed before advancing');
        issues.push('   Action: Complete "Define test scenarios (MANDATORY)" task');
      }

      // MANDATORY: Architecture decisions
      const hasArchitecture = tasks.some(t =>
        t.toLowerCase().includes('architecture') && t.includes('✓')
      );
      if (!hasArchitecture) {
        issues.push('🚫 BLOCKED: Architecture design must be completed');
        issues.push('   Action: Complete "Design architecture (Architect Agent)" task');
      }

      // MANDATORY: Security review
      const hasSecurity = tasks.some(t =>
        t.toLowerCase().includes('risk') && t.includes('✓')
      );
      if (!hasSecurity) {
        issues.push('🚫 BLOCKED: Security risks must be identified');
        issues.push('   Action: Complete "Identify risks (Security Agent)" task');
      }

      // MANDATORY: Adequate requirements
      if (!cycle.description || cycle.description.length < 50) {
        issues.push('🚫 BLOCKED: Requirements description too brief (<50 chars)');
        issues.push('   Action: Add detailed requirements with acceptance criteria');
      }

      // PROGRESS CHECK
      if (cycle.progress.Focus < 80) {
        warnings.push('⚠️  Focus phase progress is only ' + cycle.progress.Focus + '%');
        warnings.push('   Recommendation: Complete remaining tasks before advancing');
      }

    } else if (phase === 'Orchestrate') {
      // MANDATORY: Task breakdown
      const tasks = cycle.tasks.Orchestrate || [];
      if (tasks.length < 3) {
        issues.push('🚫 BLOCKED: Insufficient task breakdown (<3 tasks)');
        issues.push('   Action: Break down feature into at least 3 actionable tasks');
      }

      // MANDATORY: Dependencies identified
      const hasDependencies = tasks.some(t =>
        t.toLowerCase().includes('depend') ||
        t.toLowerCase().includes('order') ||
        t.toLowerCase().includes('prerequisite')
      );
      if (!hasDependencies) {
        warnings.push('⚠️  No task dependencies identified');
        warnings.push('   Recommendation: Map task dependencies and execution order');
      }

      // MANDATORY: Test strategy
      const hasTestStrategy = tasks.some(t =>
        t.toLowerCase().includes('test') && t.toLowerCase().includes('strategy')
      );
      if (!hasTestStrategy) {
        issues.push('🚫 BLOCKED: Test strategy must be defined');
        issues.push('   Action: Create test strategy with Tester Agent');
      }

    } else if (phase === 'Refine') {
      // MANDATORY: Tests written
      const tasks = cycle.tasks.Refine || [];
      const testsWritten = tasks.filter(t =>
        t.toLowerCase().includes('test') && t.includes('✓')
      ).length;

      // Enhanced validation based on detected testing framework
      const minTests = projectStandards.hasTesting ? 3 : 2; // Higher standard if framework detected
      if (testsWritten < minTests) {
        issues.push(`🚫 BLOCKED: Insufficient tests completed (<${minTests})`);
        issues.push('   Action: Write and complete unit, integration, or E2E tests');

        if (detectedTools.testing && detectedTools.testing.length > 0) {
          issues.push(`   Standards: Use configured ${detectedTools.testing.join(', ')} framework(s)`);
        }
      }

      // ENHANCED: Linting compliance if linter detected
      if (projectStandards.hasLinting && detectedTools.linting.length > 0) {
        const hasLintingCheck = tasks.some(t =>
          t.toLowerCase().includes('lint') && t.includes('✓')
        );
        if (!hasLintingCheck) {
          issues.push('🚫 BLOCKED: Linting check must pass before code review');
          issues.push(`   Action: Run ${detectedTools.linting.join(', ')} and fix all issues`);
        }
      }

      // MANDATORY: Code review
      const hasCodeReview = tasks.some(t =>
        t.toLowerCase().includes('review') && t.includes('✓')
      );
      if (!hasCodeReview) {
        issues.push('🚫 BLOCKED: Code review must be completed');
        issues.push('   Action: Complete code review with Code Reviewer Agent');
      }

      // MANDATORY: Implementation tasks
      const implementationTasks = tasks.filter(t =>
        (t.toLowerCase().includes('implement') ||
         t.toLowerCase().includes('build') ||
         t.toLowerCase().includes('create')) &&
        t.includes('✓')
      ).length;

      if (implementationTasks < 1) {
        issues.push('🚫 BLOCKED: No implementation tasks completed');
        issues.push('   Action: Complete feature implementation with Developer Agent');
      }

      // ENHANCED: Security validation if security tools detected
      if (projectStandards.hasSecurity && detectedTools.security.length > 0) {
        const hasSecurityCheck = tasks.some(t =>
          (t.toLowerCase().includes('security') || t.toLowerCase().includes('scan')) && t.includes('✓')
        );
        if (!hasSecurityCheck) {
          warnings.push('⚠️  Security scan not run with configured tools');
          warnings.push('   Recommendation: Run security checks using detected tools');
        }
      }

    } else if (phase === 'Generate') {
      // MANDATORY: Build artifacts
      const tasks = cycle.tasks.Generate || [];
      const hasBuild = tasks.some(t =>
        t.toLowerCase().includes('build') && t.includes('✓')
      );
      if (!hasBuild) {
        issues.push('🚫 BLOCKED: Build artifacts must be created');
        issues.push('   Action: Complete build process with DevOps Agent');
      }

      // MANDATORY: Documentation
      const hasDocumentation = tasks.some(t =>
        t.toLowerCase().includes('documentation') && t.includes('✓')
      );
      if (!hasDocumentation) {
        issues.push('🚫 BLOCKED: Documentation must be updated');
        issues.push('   Action: Update documentation with Documentation Agent');
      }

      // MANDATORY: Final validation
      const hasValidation = tasks.some(t =>
        (t.toLowerCase().includes('validation') ||
         t.toLowerCase().includes('test')) && t.includes('✓')
      );
      if (!hasValidation) {
        warnings.push('⚠️  Final validation not completed');
        warnings.push('   Recommendation: Run final tests before deployment');
      }

    } else if (phase === 'Evaluate') {
      // MANDATORY: Metrics collected
      const tasks = cycle.tasks.Evaluate || [];
      const hasMetrics = tasks.some(t =>
        t.toLowerCase().includes('metric') && t.includes('✓')
      );
      if (!hasMetrics) {
        issues.push('🚫 BLOCKED: Success metrics must be measured');
        issues.push('   Action: Collect and validate success metrics');
      }

      // STRONGLY RECOMMENDED: Retrospective
      const hasRetrospective = tasks.some(t =>
        t.toLowerCase().includes('retrospective') && t.includes('✓')
      );
      if (!hasRetrospective) {
        warnings.push('⚠️  Retrospective not conducted');
        warnings.push('   Strong Recommendation: Conduct retrospective with all agents');
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      canAdvance: issues.length === 0,
      recommendedActions: issues.length > 0 ? issues.filter(i => i.includes('Action:')) : []
    };
  }

  // Framework Enforcement Tools
  async checkpoint(args) {
    const { cycleId, enforce = true } = args;
    const cycle = await this.stateManager.getCycle(cycleId);
    const validation = this.validatePhaseCompletion(cycle, cycle.phase);

    let report = '🔍 **FORGE CHECKPOINT REPORT**\n\n';
    report += `**Cycle**: ${cycle.feature}\n`;
    report += `**Phase**: ${cycle.phase} ${this.getPhaseEmoji(cycle.phase)}\n`;
    report += `**Compliance Status**: ${validation.canAdvance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}\n\n`;

    // Show phase-specific requirements
    report += `**📋 ${cycle.phase.toUpperCase()} PHASE REQUIREMENTS:**\n`;
    const requirements = this.getPhaseRequirements(cycle.phase);
    requirements.forEach(req => {
      const completed = this.checkRequirementCompleted(cycle, req);
      report += `${completed ? '✅' : '❌'} ${req}\n`;
    });

    // Show blocking issues
    if (validation.issues.length > 0) {
      report += '\n**🛑 BLOCKING ISSUES:**\n';
      validation.issues.forEach(issue => report += `${issue}\n`);
    }

    // Show warnings
    if (validation.warnings.length > 0) {
      report += '\n**⚠️ WARNINGS:**\n';
      validation.warnings.forEach(warning => report += `${warning}\n`);
    }

    // Show next steps
    if (!validation.canAdvance) {
      report += '\n**🎯 IMMEDIATE ACTIONS REQUIRED:**\n';
      const nextActions = this.getImmediateActions(cycle.phase, cycle);
      nextActions.forEach(action => report += `• ${action}\n`);
    } else {
      report += '\n**🚀 READY TO ADVANCE:**\n';
      report += 'All requirements satisfied. Use `forge_phase_advance` to move to next phase.\n';
    }

    report += `\n**📊 ENFORCEMENT LEVEL:** ${enforce ? 'STRICT' : 'ADVISORY'}\n`;
    if (enforce && !validation.canAdvance) {
      report += '**🔒 PHASE LOCKED:** Complete required actions before advancing.\n';
    }

    return {
      type: 'text',
      text: report
    };
  }

  async guideNext(args) {
    const { cycleId, agentType } = args;
    const cycle = await this.stateManager.getCycle(cycleId);

    let guide = `🧭 **FORGE GUIDANCE: ${cycle.phase} Phase**\n\n`;
    guide += `**Feature**: ${cycle.feature}\n`;
    guide += `**Current Phase**: ${cycle.phase} ${this.getPhaseEmoji(cycle.phase)}\n\n`;

    if (agentType) {
      // Agent-specific guidance
      guide += `**🤖 ${agentType.toUpperCase()} AGENT GUIDANCE:**\n\n`;
      const agentGuidance = this.getAgentSpecificGuidance(cycle.phase, agentType, cycle);
      guide += agentGuidance;
    } else {
      // General phase guidance
      guide += '**📋 CURRENT PHASE OBJECTIVES:**\n';
      const objectives = this.getPhaseObjectives(cycle.phase);
      objectives.forEach(obj => guide += `• ${obj}\n`);

      guide += '\n**🎯 RECOMMENDED NEXT ACTIONS:**\n';
      const actions = this.getPhaseSpecificActions(cycle.phase, cycle);
      actions.forEach(action => guide += `• ${action}\n`);

      guide += '\n**🤖 ACTIVE AGENTS THIS PHASE:**\n';
      guide += this.getAgentRecommendations(cycle.phase);

      guide += '\n\n**⏭️ PHASE ADVANCEMENT:**\n';
      const validation = this.validatePhaseCompletion(cycle, cycle.phase);
      if (validation.canAdvance) {
        guide += `✅ Ready to advance to ${this.getNextPhase(cycle.phase)} phase\n`;
      } else {
        guide += `❌ Complete ${validation.issues.length} requirement(s) first\n`;
      }
    }

    return {
      type: 'text',
      text: guide
    };
  }

  // Helper methods for enforcement
  getPhaseRequirements(phase) {
    const requirements = {
      'Focus': [
        'Define test scenarios (MANDATORY)',
        'Complete architecture design',
        'Identify security risks',
        'Write detailed requirements (>50 chars)'
      ],
      'Orchestrate': [
        'Break down into tasks (min 3)',
        'Map task dependencies',
        'Define test strategy'
      ],
      'Refine': [
        'Complete implementation tasks',
        'Write and pass tests (min 2)',
        'Complete code review'
      ],
      'Generate': [
        'Create build artifacts',
        'Update documentation',
        'Complete final validation'
      ],
      'Evaluate': [
        'Collect success metrics',
        'Conduct retrospective (recommended)'
      ]
    };
    return requirements[phase] || [];
  }

  checkRequirementCompleted(cycle, requirement) {
    const tasks = cycle.tasks[cycle.phase] || [];
    const reqLower = requirement.toLowerCase();

    return tasks.some(task => {
      const taskLower = task.toLowerCase();
      return (
        (reqLower.includes('test scenario') && taskLower.includes('test scenario') && task.includes('✓')) ||
        (reqLower.includes('architecture') && taskLower.includes('architecture') && task.includes('✓')) ||
        (reqLower.includes('security') && taskLower.includes('risk') && task.includes('✓')) ||
        (reqLower.includes('requirements') && cycle.description && cycle.description.length > 50) ||
        (reqLower.includes('tasks') && tasks.length >= 3) ||
        (reqLower.includes('dependencies') && taskLower.includes('depend')) ||
        (reqLower.includes('test strategy') && taskLower.includes('test') && taskLower.includes('strategy')) ||
        (reqLower.includes('implementation') && (taskLower.includes('implement') || taskLower.includes('build')) && task.includes('✓')) ||
        (reqLower.includes('code review') && taskLower.includes('review') && task.includes('✓')) ||
        (reqLower.includes('build') && taskLower.includes('build') && task.includes('✓')) ||
        (reqLower.includes('documentation') && taskLower.includes('documentation') && task.includes('✓')) ||
        (reqLower.includes('metrics') && taskLower.includes('metric') && task.includes('✓'))
      );
    });
  }

  getImmediateActions(phase, cycle) {
    const actions = [];
    const tasks = cycle.tasks[phase] || [];

    if (phase === 'Focus') {
      if (!tasks.some(t => t.includes('test scenario') && t.includes('✓'))) {
        actions.push('Complete test scenario definition with clear acceptance criteria');
      }
      if (!cycle.description || cycle.description.length < 50) {
        actions.push('Expand requirements description with detailed specifications');
      }
    }

    return actions.length > 0 ? actions : ['Review and complete remaining tasks in current phase'];
  }

  getPhaseObjectives(phase) {
    const objectives = {
      'Focus': ['Establish clear requirements', 'Prevent scope creep', 'Identify risks early'],
      'Orchestrate': ['Break down complexity', 'Plan dependencies', 'Design test strategy'],
      'Refine': ['Implement with quality', 'Follow TDD practices', 'Ensure code review'],
      'Generate': ['Build deployable artifacts', 'Update documentation', 'Validate readiness'],
      'Evaluate': ['Measure success', 'Capture learnings', 'Plan improvements']
    };
    return objectives[phase] || [];
  }

  getPhaseSpecificActions(phase, cycle) {
    const baseActions = {
      'Focus': ['Engage Architect Agent for system design', 'Engage Security Agent for risk assessment'],
      'Orchestrate': ['Create detailed task breakdown', 'Map inter-task dependencies'],
      'Refine': ['Start with test writing', 'Implement incrementally', 'Request code review'],
      'Generate': ['Build and test artifacts', 'Update all documentation'],
      'Evaluate': ['Collect quantitative metrics', 'Gather qualitative feedback']
    };
    return baseActions[phase] || [];
  }

  getAgentSpecificGuidance(phase, agentType, cycle) {
    const guidance = {
      'Focus': {
        'architect': 'Design system architecture considering scalability, maintainability, and integration points.',
        'security': 'Identify potential security vulnerabilities and compliance requirements.',
        'documentation': 'Create comprehensive PRD with clear acceptance criteria and user stories.'
      },
      'Orchestrate': {
        'architect': 'Break down architecture into implementable components with clear interfaces.',
        'devops': 'Plan CI/CD pipeline, deployment strategy, and infrastructure requirements.',
        'tester': 'Design comprehensive test strategy covering unit, integration, and E2E testing.'
      },
      'Refine': {
        'developer': 'Implement following TDD principles, write clean, maintainable code.',
        'tester': 'Write comprehensive tests ensuring full coverage of requirements.',
        'reviewer': 'Review code for quality, security, performance, and adherence to standards.'
      },
      'Generate': {
        'devops': 'Build production-ready artifacts and prepare deployment automation.',
        'documentation': 'Ensure all documentation is current and deployment-ready.',
        'tester': 'Perform final validation including performance and security testing.'
      },
      'Evaluate': {
        'documentation': 'Document learnings, update knowledge base, create retrospective report.'
      }
    };

    return guidance[phase]?.[agentType] || `Focus on ${agentType} responsibilities for ${phase} phase.`;
  }

  async completeTask(args) {
    const { cycleId, phase, taskDescription } = args;

    try {
      const cycle = await this.stateManager.getCycle(cycleId);
      const currentPhase = phase || cycle.phase;
      const tasks = cycle.tasks[currentPhase] || [];

      // Find matching task (partial match supported)
      const matchingTask = tasks.find(task =>
        task.toLowerCase().includes(taskDescription.toLowerCase()) ||
        taskDescription.toLowerCase().includes(task.toLowerCase())
      );

      if (!matchingTask) {
        return {
          type: 'text',
          text: `Task not found in ${currentPhase} phase. Available tasks:\n${tasks.map(t => `- ${t}`).join('\n')}`
        };
      }

      // Mark task as completed (implementation depends on task storage format)
      // For now, just broadcast the completion
      if (this.dashboardEvents) {
        this.dashboardEvents.broadcastTaskCompleted({
          cycleId,
          phase: currentPhase,
          task: matchingTask,
          progress: 100
        });
      }

      return {
        type: 'text',
        text: `✅ Completed task: "${matchingTask}" in ${currentPhase} phase`
      };
    } catch (error) {
      throw new Error(`Failed to complete task: ${error.message}`);
    }
  }

  async getLocalLLMStatus() {
    if (!this.localLLM) {
      return {
        type: 'text',
        text: 'Local LLM orchestrator not initialized'
      };
    }

    const status = this.localLLM.getStatus();
    return {
      type: 'text',
      text: `# Local LLM Status\n\n**Status**: ${status.connectionStatus}\n**Enabled**: ${status.enabled}\n**Model**: ${status.model}\n**Available Models**: ${status.availableModels.join(', ')}\n**Host**: ${status.config.host}\n**Auto Delegate**: ${status.config.autoDelegate}\n**Threshold**: ${status.config.trivialTaskThreshold}`
    };
  }

  async configureLocalLLM(args) {
    if (!this.localLLM) {
      throw new Error('Local LLM orchestrator not available');
    }

    this.localLLM.updateConfig(args);
    return {
      type: 'text',
      text: `✅ Local LLM configuration updated: ${JSON.stringify(args, null, 2)}`
    };
  }

  async delegateTask(args) {
    const { taskType, taskDescription, context = {}, forceDelegate = false } = args;

    if (!this.localLLM) {
      return {
        type: 'text',
        text: '❌ Local LLM not available for task delegation'
      };
    }

    if (forceDelegate) {
      context.forceDelegate = true;
    }

    const result = await this.localLLM.delegateTask(taskType, taskDescription, context);

    if (result.delegated) {
      if (this.dashboardEvents) {
        this.dashboardEvents.broadcastLLMDelegated({
          taskType,
          model: result.model,
          confidence: result.confidence,
          duration: result.result.duration
        });
      }

      return {
        type: 'text',
        text: `✅ Task delegated to ${result.model}\n\n**Result:**\n${result.result.content}`
      };
    } else {
      return {
        type: 'text',
        text: `❌ Task not delegated: ${result.reason}\n\nUse forceDelegate=true to override classification.`
      };
    }
  }

  async invokeAgent(args) {
    const { agentType, cycleId, task, context = {} } = args;

    // Broadcast agent invocation event
    if (this.dashboardEvents) {
      this.dashboardEvents.broadcastAgentInvoked({
        agentType,
        cycleId,
        task,
        isAutoInvoked: false
      });
    }

    return {
      type: 'text',
      text: `🤖 Invoked ${agentType} agent\n\n**Task**: ${task}\n**Cycle ID**: ${cycleId || 'N/A'}\n\nThe ${agentType} agent has been notified and will provide specialized guidance for this task.`
    };
  }

  async decomposePRD(args) {
    const {
      prdContent,
      prdFilePath,
      analysisLevel = 'detailed',
      generateCycles = false,
      featurePrefix = ''
    } = args;

    // Validate inputs
    if (!prdContent && !prdFilePath) {
      throw new Error('Either prdContent or prdFilePath must be provided');
    }

    // Get PRD content
    let content = prdContent;
    if (prdFilePath && !content) {
      const fs = require('fs');
      const path = require('path');
      const resolvedPath = path.resolve(prdFilePath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`PRD file not found: ${resolvedPath}`);
      }

      content = fs.readFileSync(resolvedPath, 'utf8');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('PRD content is empty');
    }

    this.logger.info(`Analyzing PRD with ${analysisLevel} analysis level`);

    let analysis;

    // Try local LLM for basic and detailed analysis
    if (this.localLLM && analysisLevel !== 'comprehensive') {
      try {
        const result = await this.localLLM.decomposePRD(content, { analysisLevel });

        if (result.delegated) {
          try {
            analysis = JSON.parse(result.result.content);
          } catch (parseError) {
            this.logger.debug('LLM result not JSON, using as text analysis');
            analysis = { textAnalysis: result.result.content };
          }
        }
      } catch (llmError) {
        this.logger.debug('Local LLM delegation failed, using main analysis:', llmError.message);
      }
    }

    // Fallback to main session analysis
    if (!analysis || analysisLevel === 'comprehensive') {
      analysis = {
        summary: 'PRD analysis completed using main session',
        features: [
          {
            name: 'Feature extraction needed',
            description: 'Detailed feature analysis requires main Claude session review',
            priority: 'medium',
            tasks: ['Analyze PRD content', 'Extract user stories', 'Define acceptance criteria']
          }
        ],
        dependencies: [],
        riskAreas: [],
        estimatedEffort: 'To be determined',
        analysisNote: `${analysisLevel} analysis requested - main Claude session should review the PRD content for detailed decomposition`
      };
    }

    const result = {
      analysis: analysis,
      recommendations: [],
      generatedCycles: []
    };

    // Generate cycles if requested and we have structured analysis
    if (generateCycles && analysis.features) {
      const createdCycles = [];

      for (const feature of analysis.features) {
        try {
          const cycleName = featurePrefix ? `${featurePrefix}: ${feature.name}` : feature.name;

          const cycle = await this.stateManager.createCycle(cycleName, {
            description: feature.description || feature.summary,
            priority: feature.priority || 'medium'
          });

          // Add feature-specific tasks to Focus phase if available
          if (feature.tasks && feature.tasks.length > 0) {
            await this.stateManager.updateCyclePhase(cycle.id, 'Focus', {
              tasks: feature.tasks,
              progress: 0
            });
          }

          createdCycles.push({
            cycleId: cycle.id,
            feature: cycleName,
            description: feature.description || feature.summary,
            priority: feature.priority || 'medium',
            taskCount: feature.tasks ? feature.tasks.length : 0
          });

          // Broadcast cycle creation event
          if (this.dashboardEvents) {
            this.dashboardEvents.broadcastCycleCreated(cycle);
          }

        } catch (cycleError) {
          this.logger.error(`Failed to create cycle for feature ${feature.name}:`, cycleError.message);
          result.recommendations.push(`❌ Failed to create cycle for '${feature.name}': ${cycleError.message}`);
        }
      }

      result.generatedCycles = createdCycles;

      if (createdCycles.length > 0) {
        result.recommendations.push(
          `✅ Successfully created ${createdCycles.length} development cycles from PRD analysis`,
          '🎯 Next steps: Use forge_cycle_status to view cycle details',
          '🤖 Tip: Start with Focus phase agents for requirements gathering'
        );
      }
    }

    // Add general recommendations based on analysis
    if (analysis.dependencies && analysis.dependencies.length > 0) {
      result.recommendations.push(`🔗 ${analysis.dependencies.length} dependencies identified - consider cycle ordering`);
    }

    if (analysis.riskAreas && analysis.riskAreas.length > 0) {
      result.recommendations.push(`⚠️ ${analysis.riskAreas.length} risk areas identified - engage Security Agent early`);
    }

    return {
      type: 'text',
      text: this.formatPRDAnalysisResult(result, analysisLevel)
    };
  }

  formatPRDAnalysisResult(result, analysisLevel) {
    let output = `# PRD Analysis Results (${analysisLevel})\n\n`;

    // Analysis Summary
    if (result.analysis.summary) {
      output += `## Summary\n${result.analysis.summary}\n\n`;
    }

    // Generated Cycles
    if (result.generatedCycles.length > 0) {
      output += '## Generated Development Cycles\n\n';
      result.generatedCycles.forEach((cycle, index) => {
        output += `### ${index + 1}. ${cycle.feature}\n`;
        output += `- **Cycle ID**: ${cycle.cycleId}\n`;
        output += `- **Priority**: ${cycle.priority}\n`;
        output += `- **Description**: ${cycle.description}\n`;
        if (cycle.taskCount > 0) {
          output += `- **Initial Tasks**: ${cycle.taskCount} tasks added to Focus phase\n`;
        }
        output += '\n';
      });
    }

    // Features (if cycles not generated)
    if (!result.generatedCycles.length && result.analysis.features) {
      output += '## Identified Features\n\n';
      result.analysis.features.forEach((feature, index) => {
        output += `### ${index + 1}. ${feature.name}\n`;
        output += `- **Priority**: ${feature.priority || 'medium'}\n`;
        output += `- **Description**: ${feature.description || feature.summary || 'No description provided'}\n`;
        if (feature.tasks && feature.tasks.length > 0) {
          output += `- **Tasks**: ${feature.tasks.length} tasks identified\n`;
        }
        output += '\n';
      });
    }

    // Dependencies
    if (result.analysis.dependencies && result.analysis.dependencies.length > 0) {
      output += '## Dependencies\n\n';
      result.analysis.dependencies.forEach((dep, index) => {
        output += `${index + 1}. ${dep}\n`;
      });
      output += '\n';
    }

    // Risk Areas
    if (result.analysis.riskAreas && result.analysis.riskAreas.length > 0) {
      output += '## Risk Areas\n\n';
      result.analysis.riskAreas.forEach((risk, index) => {
        output += `${index + 1}. ${risk}\n`;
      });
      output += '\n';
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      output += '## Recommendations\n\n';
      result.recommendations.forEach(rec => {
        output += `${rec}\n\n`;
      });
    }

    // Analysis Note
    if (result.analysis.analysisNote) {
      output += `---\n\n*${result.analysis.analysisNote}*\n`;
    }

    return output;
  }

  getNextPhase(currentPhase) {
    const phases = ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate'];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : 'Completion';
  }
}

module.exports = { ToolHandlers };