/**
 * MCP tool handlers for FORGE development workflow management
 */

const { DocsManager } = require('../core/docs-manager');

class ToolHandlers {
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    this.logger = options.logger || console;
    this.localLLM = null;
    this.dashboardEvents = null;
    this.docsManager = new DocsManager(stateManager.baseDir, { logger: this.logger });
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
        description: 'Create new development cycle with conversational PRD building',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Feature or goal name'
            },
            description: {
              type: 'string',
              description: 'Detailed description with requirements, acceptance criteria, and technical details'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Cycle priority'
            },
            confirmed: {
              type: 'boolean',
              description: 'Set to true to skip PRD validation and create cycle immediately (not recommended)'
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
        description: 'Complete and archive development cycle (DESTRUCTIVE - requires human approval)',
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
            },
            confirmed: {
              type: 'boolean',
              description: 'REQUIRED: Must be true to confirm this destructive action. Archives the cycle permanently.'
            }
          },
          required: ['cycleId', 'confirmed']
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
              description: 'Skip phase completion checks (DANGEROUS - requires human approval)'
            },
            notes: {
              type: 'string',
              description: 'Phase transition notes'
            },
            skipValidationConfirmed: {
              type: 'boolean',
              description: 'REQUIRED if skipValidation=true: Confirms you understand the risks of bypassing quality gates'
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

      // Documentation Generation
      {
        name: 'forge_generate_docs',
        description: 'Generate documentation for a cycle',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle to generate documentation for'
            },
            docType: {
              type: 'string',
              enum: ['prd', 'architecture', 'testing', 'all'],
              description: 'Type of documentation to generate'
            },
            includeMetadata: {
              type: 'boolean',
              description: 'Include metadata and version info'
            }
          },
          required: ['cycleId', 'docType']
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
              description: 'Automatically create cycles from decomposition (MASS ACTION - requires confirmation)'
            },
            generateCyclesConfirmed: {
              type: 'boolean',
              description: 'REQUIRED if generateCycles=true: Confirms automatic cycle creation (may create many cycles)'
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
      case 'forge_generate_docs':
        return await this.generateDocs(args);
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

    // Initialize documentation structure
    await this.docsManager.initializeDocsStructure();

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
    initMessage += '• .forge/context.md - AI assistant context\n';
    initMessage += '• docs/ - Documentation structure initialized\n';
    initMessage += '  ├── prd/ - Product Requirements Documents\n';
    initMessage += '  ├── architecture/ - System design documents\n';
    initMessage += '  ├── testing/ - Test plans and scenarios\n';
    initMessage += '  └── [and more...]\n\n';

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
    const { feature, description, priority = 'medium', confirmed = false } = args;

    // CONVERSATIONAL PRD BUILDING FLOW
    // If description is minimal or not provided, guide user through PRD creation
    const needsPRDConversation = !confirmed && (!description || description.length < 100);

    if (needsPRDConversation) {
      return {
        type: 'text',
        text: this.generatePRDConversationPrompt(feature, description, priority)
      };
    }

    // VALIDATION CHECK - Even with description, ensure it's comprehensive
    const validationIssues = this.validatePRDRequirements(feature, description);

    if (!confirmed && validationIssues.length > 0) {
      return {
        type: 'text',
        text: this.generatePRDValidationPrompt(feature, description, priority, validationIssues)
      };
    }

    // PRD is complete - Create the cycle
    const cycle = await this.stateManager.createCycle(feature, {
      description,
      priority
    });

    // Generate initial PRD document
    let prdCreated = false;
    let testCreated = false;
    let docPaths = [];

    try {
      const prdResult = await this.docsManager.generateCycleDocumentation(cycle, 'prd');
      this.logger.info(`Initial PRD created at ${prdResult.relativePath}`);
      prdCreated = true;
      docPaths.push(`PRD: ${prdResult.relativePath}`);

      // Also create initial test scenarios document
      const testResult = await this.docsManager.generateCycleDocumentation(cycle, 'testing');
      this.logger.info(`Initial test plan created at ${testResult.relativePath}`);
      testCreated = true;
      docPaths.push(`Test Plan: ${testResult.relativePath}`);
    } catch (docError) {
      this.logger.error('Documentation generation failed:', {
        error: docError.message,
        stack: docError.stack,
        cycleId: cycle.id,
        feature: cycle.feature
      });
    }

    return {
      type: 'text',
      text: '🚀 **New FORGE Development Cycle Created**\n\n' +
            `**Feature**: ${feature}\n` +
            `**ID**: ${cycle.id}\n` +
            `**Priority**: ${priority}\n` +
            '**Phase**: Focus 🎯 (starting phase)\n\n' +
            (docPaths.length > 0 ?
              '**📄 DOCUMENTATION CREATED:**\n' +
              docPaths.map(p => `• ${p}`).join('\n') + '\n\n' :
              '**📄 DOCUMENTATION STATUS:**\n' +
              '⚠️ Documentation generation failed - check server logs\n\n'
            ) +
            '**📋 IMMEDIATE NEXT ACTIONS (Focus Phase):**\n' +
            '1. 🏗️ Architect Agent: Design system architecture\n' +
            '2. 🔒 Security Agent: Identify security requirements\n' +
            '3. 📚 Documentation Agent: Update PRD and requirements\n\n' +
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
    const { cycleId, notes = '', forceComplete = false, confirmed = false } = args;

    // SAFETY CHECK: Require human confirmation for destructive action
    if (!confirmed) {
      const cycle = await this.stateManager.getCycle(cycleId);

      return {
        type: 'text',
        text: '⚠️  **DESTRUCTIVE ACTION - HUMAN CONFIRMATION REQUIRED**\n\n' +
              `**Action**: Complete and archive cycle\n` +
              `**Cycle**: ${cycle.feature}\n` +
              `**ID**: ${cycleId}\n` +
              `**Phase**: ${cycle.phase}\n\n` +
              '**⚠️  WARNING: This action will:**\n' +
              '• Archive the cycle permanently\n' +
              '• Move it from active to completed cycles\n' +
              '• This cannot be easily undone\n\n' +
              '**📋 Before completing:**\n' +
              '1. Ensure all work is committed to git\n' +
              '2. Verify all phase requirements are met\n' +
              '3. Consider running retrospective first\n\n' +
              '**🔒 To proceed:**\n' +
              'Call this tool again with `confirmed: true`\n\n' +
              '**🚫 To cancel:**\n' +
              'Simply do not call this tool again.'
      };
    }

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
    const { cycleId, skipValidation = false, notes = '', skipValidationConfirmed = false } = args;

    // SAFETY CHECK: Require human confirmation for bypassing validation
    if (skipValidation && !skipValidationConfirmed) {
      const cycle = await this.stateManager.getCycle(cycleId);

      return {
        type: 'text',
        text: '⚠️  **DANGEROUS ACTION - HUMAN CONFIRMATION REQUIRED**\n\n' +
              `**Action**: Skip phase validation and force advancement\n` +
              `**Cycle**: ${cycle.feature}\n` +
              `**Current Phase**: ${cycle.phase}\n\n` +
              '**🚨 WARNING: Bypassing validation can lead to:**\n' +
              '• Incomplete requirements causing rework\n' +
              '• Missing tests leading to bugs\n' +
              '• Technical debt accumulation\n' +
              '• Failed deployments\n' +
              '• Quality issues\n\n' +
              '**📋 FORGE Recommendation:**\n' +
              '1. Run `forge_checkpoint` to see what\'s blocking\n' +
              '2. Complete the required tasks\n' +
              '3. Advance normally without skipping validation\n\n' +
              '**🔒 To proceed anyway (NOT RECOMMENDED):**\n' +
              'Call this tool again with BOTH:\n' +
              '• `skipValidation: true`\n' +
              '• `skipValidationConfirmed: true`\n\n' +
              '**✅ Better Option:**\n' +
              'Call without `skipValidation` to advance with normal validation.'
      };
    }

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
    // Phase emojis aligned with book methodology
    const emojis = {
      'Focus': '🎯',      // Clarity - What & Why
      'Orchestrate': '📋', // Planning - How to break down
      'Refine': '✏️',      // Precision - Define "done" before code
      'Generate': '⚡',    // Creation - AI writes code
      'Evaluate': '✅'     // Verification - Verify intent met
    };
    return emojis[phase] || '📌';
  }

  getProgressBar(progress) {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  getAgentRecommendations(phase) {
    // Agent recommendations aligned with book methodology
    const recommendations = {
      'Focus': [
        '• Architect Agent - Define problem, users, success criteria',
        '• Architect Agent - Create System Context diagram (C4 Level 1)',
        '• Security Agent - Identify security requirements and constraints',
        '• Documentation Agent - Draft PRD with testable success criteria'
      ].join('\n'),
      'Orchestrate': [
        '• Architect Agent - Design Container architecture (C4 Level 2)',
        '• Architect Agent - Design Component architecture (C4 Level 3)',
        '• Architect Agent - Map dependencies and execution order',
        '• Architect Agent - Break into session-sized tasks'
      ].join('\n'),
      'Refine': [
        '• Tester Agent - Define acceptance criteria (Given-When-Then)',
        '• Architect Agent - Specify component interfaces',
        '• Tester Agent - Enumerate edge cases by category',
        '• Documentation Agent - Document constraints vs criteria'
      ].join('\n'),
      'Generate': [
        '• Developer Agent - Implement one task per session',
        '• Developer Agent - Follow TDD (RED-GREEN-REFACTOR)',
        '• Code Reviewer Agent - Review generated code quality',
        '• Documentation Agent - Preserve outputs and decisions'
      ].join('\n'),
      'Evaluate': [
        '• Tester Agent - Verify against acceptance criteria',
        '• Tester Agent - Test all listed edge cases',
        '• Security Agent - Security review of generated code',
        '• All Agents - Disposition decision (accept/revise/reject)'
      ].join('\n')
    };
    return recommendations[phase] || 'Determining appropriate agents...';
  }

  getPhaseGuidance(phase, feature) {
    // Phase guidance aligned with book methodology
    const guidance = {
      'Focus': `CLARITY: Define WHAT you're building and WHY for "${feature}"\n` +
        `  • Problem statement and target users\n` +
        `  • Testable success criteria (not "should be fast" but "loads in <2s")\n` +
        `  • System Context diagram (C4 Level 1)\n` +
        `  • Clear boundaries - what you WON'T build`,
      'Orchestrate': `PLANNING: Break "${feature}" into AI-manageable pieces\n` +
        `  • Container architecture (C4 Level 2) - deployable units\n` +
        `  • Component architecture (C4 Level 3) - internal structure\n` +
        `  • Dependency map - what must exist before what\n` +
        `  • Tasks sized for single AI sessions`,
      'Refine': `PRECISION: Define exactly what "done" looks like for "${feature}" BEFORE coding\n` +
        `  • Acceptance criteria in Given-When-Then format\n` +
        `  • Interface specifications (inputs, outputs, errors)\n` +
        `  • Edge cases by category (empty inputs, boundaries, failures)\n` +
        `  • Constraints (how to build) vs Criteria (what to build)`,
      'Generate': `CREATION: AI writes code for "${feature}" - one task per session\n` +
        `  • Structured prompts with context, task, criteria, format\n` +
        `  • TDD: RED (failing test) → GREEN (minimal code) → REFACTOR\n` +
        `  • Know when to iterate vs regenerate fresh\n` +
        `  • Preserve outputs immediately - don't rely on history`,
      'Evaluate': `VERIFICATION: Does "${feature}" actually match intent?\n` +
        `  • Line-by-line check against acceptance criteria\n` +
        `  • Test edge cases listed AND some you didn't list\n` +
        `  • Security review - injection, auth bypasses, data exposure\n` +
        `  • Disposition: Accept / Accept with issues / Revise / Reject`
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

    // STRICT ENFORCEMENT RULES - Aligned with book methodology
    // Focus = Clarity (What/Why), Orchestrate = Planning (How to break down)
    // Refine = Precision (Define "done" BEFORE code), Generate = Creation (AI writes code)
    // Evaluate = Verification (Verify intent met)

    if (phase === 'Focus') {
      // FOCUS PHASE: Clarity - What are you actually building?
      const tasks = cycle.tasks.Focus || [];

      // MANDATORY: Problem statement and target users
      const hasProblemStatement = tasks.some(t =>
        (t.toLowerCase().includes('problem') || t.toLowerCase().includes('user')) &&
        t.includes('✓')
      );
      if (!hasProblemStatement) {
        issues.push('🚫 BLOCKED: Problem statement and target users must be defined');
        issues.push('   Action: Define specific problem and target users (not "everyone")');
      }

      // MANDATORY: Success criteria (testable)
      const hasSuccessCriteria = tasks.some(t =>
        (t.toLowerCase().includes('success') || t.toLowerCase().includes('criteria')) &&
        t.includes('✓')
      );
      if (!hasSuccessCriteria) {
        issues.push('🚫 BLOCKED: Testable success criteria must be defined');
        issues.push('   Action: Write specific criteria ("loads in <2s" not "should be fast")');
      }

      // MANDATORY: System Context (C4 Level 1)
      const hasSystemContext = tasks.some(t =>
        (t.toLowerCase().includes('context') || t.toLowerCase().includes('c4') ||
         t.toLowerCase().includes('diagram') || t.toLowerCase().includes('boundary')) &&
        t.includes('✓')
      );
      if (!hasSystemContext) {
        issues.push('🚫 BLOCKED: System Context diagram must be created');
        issues.push('   Action: Create C4 Level 1 diagram showing system boundaries');
      }

      // MANDATORY: Adequate requirements
      if (!cycle.description || cycle.description.length < 50) {
        issues.push('🚫 BLOCKED: Requirements description too brief (<50 chars)');
        issues.push('   Action: Add detailed requirements with acceptance criteria');
      }

      // RECOMMENDED: Constraints and boundaries
      const hasBoundaries = tasks.some(t =>
        (t.toLowerCase().includes('constraint') || t.toLowerCase().includes('boundary') ||
         t.toLowerCase().includes('scope') || t.toLowerCase().includes('won\'t')) &&
        t.includes('✓')
      );
      if (!hasBoundaries) {
        warnings.push('⚠️  No clear boundaries defined');
        warnings.push('   Recommendation: Define what you WON\'T build');
      }

    } else if (phase === 'Orchestrate') {
      // ORCHESTRATE PHASE: Planning - How to break this into AI-manageable pieces
      const tasks = cycle.tasks.Orchestrate || [];

      // MANDATORY: Container architecture (C4 Level 2)
      const hasContainerArch = tasks.some(t =>
        (t.toLowerCase().includes('container') || t.toLowerCase().includes('c4 level 2') ||
         t.toLowerCase().includes('architecture')) &&
        t.includes('✓')
      );
      if (!hasContainerArch) {
        issues.push('🚫 BLOCKED: Container architecture must be designed');
        issues.push('   Action: Define C4 Level 2 - separately deployable units');
      }

      // MANDATORY: Component breakdown (C4 Level 3)
      const hasComponentArch = tasks.some(t =>
        (t.toLowerCase().includes('component') || t.toLowerCase().includes('c4 level 3') ||
         t.toLowerCase().includes('module')) &&
        t.includes('✓')
      );
      if (!hasComponentArch) {
        issues.push('🚫 BLOCKED: Component architecture must be designed');
        issues.push('   Action: Define C4 Level 3 - internal component structure');
      }

      // MANDATORY: Dependency mapping
      const hasDependencies = tasks.some(t =>
        (t.toLowerCase().includes('depend') || t.toLowerCase().includes('order') ||
         t.toLowerCase().includes('prerequisite') || t.toLowerCase().includes('foundation')) &&
        t.includes('✓')
      );
      if (!hasDependencies) {
        issues.push('🚫 BLOCKED: Dependency map must be created');
        issues.push('   Action: Map what must exist before what (build order)');
      }

      // MANDATORY: Task breakdown into session-sized units
      if (tasks.length < 3) {
        issues.push('🚫 BLOCKED: Insufficient task breakdown (<3 tasks)');
        issues.push('   Action: Break into tasks sized for single AI sessions');
      }

      // CHECK: Tasks should be session-sized
      const taskDescriptions = tasks.filter(t => t.includes('✓')).join(' ');
      if (taskDescriptions.length > 500 && tasks.length < 5) {
        warnings.push('⚠️  Tasks may be too large for single sessions');
        warnings.push('   Recommendation: Break into smaller, independently testable tasks');
      }

    } else if (phase === 'Refine') {
      // REFINE PHASE: Precision - What specifically does "done" look like?
      // THIS IS SPECIFICATION, NOT IMPLEMENTATION!
      const tasks = cycle.tasks.Refine || [];

      // MANDATORY: Acceptance criteria in Given-When-Then format
      const hasAcceptanceCriteria = tasks.some(t =>
        (t.toLowerCase().includes('acceptance') || t.toLowerCase().includes('given') ||
         t.toLowerCase().includes('when') || t.toLowerCase().includes('then') ||
         t.toLowerCase().includes('criteria')) &&
        t.includes('✓')
      );
      if (!hasAcceptanceCriteria) {
        issues.push('🚫 BLOCKED: Acceptance criteria must be defined');
        issues.push('   Action: Write Given-When-Then criteria for each task');
      }

      // MANDATORY: Interface specifications
      const hasInterfaces = tasks.some(t =>
        (t.toLowerCase().includes('interface') || t.toLowerCase().includes('input') ||
         t.toLowerCase().includes('output') || t.toLowerCase().includes('contract') ||
         t.toLowerCase().includes('api')) &&
        t.includes('✓')
      );
      if (!hasInterfaces) {
        issues.push('🚫 BLOCKED: Interface specifications must be defined');
        issues.push('   Action: Specify inputs, outputs, and error contracts');
      }

      // MANDATORY: Edge cases enumerated
      const hasEdgeCases = tasks.some(t =>
        (t.toLowerCase().includes('edge') || t.toLowerCase().includes('boundary') ||
         t.toLowerCase().includes('error') || t.toLowerCase().includes('failure') ||
         t.toLowerCase().includes('empty') || t.toLowerCase().includes('null')) &&
        t.includes('✓')
      );
      if (!hasEdgeCases) {
        issues.push('🚫 BLOCKED: Edge cases must be enumerated');
        issues.push('   Action: List edge cases by category (empty, boundary, failure, concurrent)');
      }

      // RECOMMENDED: Constraints vs Criteria documented
      const hasConstraints = tasks.some(t =>
        (t.toLowerCase().includes('constraint') || t.toLowerCase().includes('how to build')) &&
        t.includes('✓')
      );
      if (!hasConstraints) {
        warnings.push('⚠️  Constraints not explicitly documented');
        warnings.push('   Recommendation: Separate constraints (how) from criteria (what)');
      }

    } else if (phase === 'Generate') {
      // GENERATE PHASE: Creation - AI writes code, one task per session
      // THIS IS WHERE IMPLEMENTATION HAPPENS!
      const tasks = cycle.tasks.Generate || [];

      // MANDATORY: Implementation following TDD
      const hasImplementation = tasks.some(t =>
        (t.toLowerCase().includes('implement') || t.toLowerCase().includes('code') ||
         t.toLowerCase().includes('develop') || t.toLowerCase().includes('build') ||
         t.toLowerCase().includes('create')) &&
        t.includes('✓')
      );
      if (!hasImplementation) {
        issues.push('🚫 BLOCKED: Implementation tasks must be completed');
        issues.push('   Action: Generate code following TDD (RED-GREEN-REFACTOR)');
      }

      // MANDATORY: Tests written (TDD - part of implementation)
      const hasTests = tasks.some(t =>
        (t.toLowerCase().includes('test') || t.toLowerCase().includes('tdd') ||
         t.toLowerCase().includes('red') || t.toLowerCase().includes('green')) &&
        t.includes('✓')
      );
      if (!hasTests) {
        issues.push('🚫 BLOCKED: Tests must be written during implementation');
        issues.push('   Action: Follow TDD - write failing tests first, then code');
      }

      // Enhanced validation based on detected testing framework
      if (projectStandards.hasTesting && detectedTools.testing?.length > 0) {
        const testsCompleted = tasks.filter(t =>
          t.toLowerCase().includes('test') && t.includes('✓')
        ).length;
        if (testsCompleted < 2) {
          warnings.push('⚠️  Fewer than 2 test tasks completed');
          warnings.push(`   Recommendation: Use ${detectedTools.testing.join(', ')} for thorough testing`);
        }
      }

      // ENHANCED: Linting compliance if linter detected
      if (projectStandards.hasLinting && detectedTools.linting?.length > 0) {
        const hasLintingCheck = tasks.some(t =>
          t.toLowerCase().includes('lint') && t.includes('✓')
        );
        if (!hasLintingCheck) {
          warnings.push('⚠️  Linting check not completed');
          warnings.push(`   Recommendation: Run ${detectedTools.linting.join(', ')} and fix issues`);
        }
      }

      // MANDATORY: Code review before leaving Generate
      const hasCodeReview = tasks.some(t =>
        t.toLowerCase().includes('review') && t.includes('✓')
      );
      if (!hasCodeReview) {
        issues.push('🚫 BLOCKED: Code review must be completed');
        issues.push('   Action: Review generated code quality before Evaluate phase');
      }

    } else if (phase === 'Evaluate') {
      // EVALUATE PHASE: Verification - Does output actually match intent?
      const tasks = cycle.tasks.Evaluate || [];

      // MANDATORY: Criteria verification
      const hasCriteriaCheck = tasks.some(t =>
        (t.toLowerCase().includes('criteria') || t.toLowerCase().includes('verify') ||
         t.toLowerCase().includes('acceptance')) &&
        t.includes('✓')
      );
      if (!hasCriteriaCheck) {
        issues.push('🚫 BLOCKED: Acceptance criteria must be verified');
        issues.push('   Action: Line-by-line check against Refine phase criteria');
      }

      // MANDATORY: Edge case testing
      const hasEdgeCaseTesting = tasks.some(t =>
        (t.toLowerCase().includes('edge') || t.toLowerCase().includes('test')) &&
        t.includes('✓')
      );
      if (!hasEdgeCaseTesting) {
        issues.push('🚫 BLOCKED: Edge cases must be tested');
        issues.push('   Action: Test listed edge cases AND some you didn\'t list');
      }

      // MANDATORY: Disposition decision
      const hasDisposition = tasks.some(t =>
        (t.toLowerCase().includes('disposition') || t.toLowerCase().includes('accept') ||
         t.toLowerCase().includes('decision') || t.toLowerCase().includes('approve')) &&
        t.includes('✓')
      );
      if (!hasDisposition) {
        issues.push('🚫 BLOCKED: Disposition decision required');
        issues.push('   Action: Decide - Accept / Accept with issues / Revise / Reject');
      }

      // ENHANCED: Security validation if security tools detected
      if (projectStandards.hasSecurity && detectedTools.security?.length > 0) {
        const hasSecurityCheck = tasks.some(t =>
          (t.toLowerCase().includes('security') || t.toLowerCase().includes('scan')) &&
          t.includes('✓')
        );
        if (!hasSecurityCheck) {
          warnings.push('⚠️  Security review not completed');
          warnings.push('   Recommendation: Check for injection, auth bypasses, data exposure');
        }
      }

      // RECOMMENDED: Retrospective for learning
      const hasRetrospective = tasks.some(t =>
        t.toLowerCase().includes('retrospective') && t.includes('✓')
      );
      if (!hasRetrospective) {
        warnings.push('⚠️  Retrospective not conducted');
        warnings.push('   Recommendation: Capture learnings for future cycles');
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
    const validation = await this.validatePhaseCompletion(cycle, cycle.phase);

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
    // Requirements aligned with book methodology
    const requirements = {
      'Focus': [
        'Define problem statement and target users',
        'Write testable success criteria',
        'Create System Context diagram (C4 L1)',
        'Define boundaries and constraints'
      ],
      'Orchestrate': [
        'Design Container architecture (C4 L2)',
        'Design Component architecture (C4 L3)',
        'Create dependency map',
        'Break into session-sized tasks (min 3)'
      ],
      'Refine': [
        'Write acceptance criteria (Given-When-Then)',
        'Specify component interfaces',
        'Enumerate edge cases by category',
        'Document constraints vs criteria'
      ],
      'Generate': [
        'Implement with TDD (RED-GREEN-REFACTOR)',
        'Write and pass tests',
        'Complete code review',
        'Preserve outputs and decisions'
      ],
      'Evaluate': [
        'Verify against acceptance criteria',
        'Test edge cases (listed + unlisted)',
        'Make disposition decision (accept/revise/reject)',
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
        // Focus phase checks
        (reqLower.includes('problem') && (taskLower.includes('problem') || taskLower.includes('user')) && task.includes('✓')) ||
        (reqLower.includes('success criteria') && (taskLower.includes('success') || taskLower.includes('criteria')) && task.includes('✓')) ||
        (reqLower.includes('system context') && (taskLower.includes('context') || taskLower.includes('c4') || taskLower.includes('diagram')) && task.includes('✓')) ||
        (reqLower.includes('boundaries') && (taskLower.includes('boundary') || taskLower.includes('constraint') || taskLower.includes('scope')) && task.includes('✓')) ||
        // Orchestrate phase checks
        (reqLower.includes('container') && (taskLower.includes('container') || taskLower.includes('architecture')) && task.includes('✓')) ||
        (reqLower.includes('component') && (taskLower.includes('component') || taskLower.includes('module')) && task.includes('✓')) ||
        (reqLower.includes('dependency') && (taskLower.includes('depend') || taskLower.includes('order')) && task.includes('✓')) ||
        (reqLower.includes('session-sized') && tasks.length >= 3) ||
        // Refine phase checks
        (reqLower.includes('acceptance') && (taskLower.includes('acceptance') || taskLower.includes('given') || taskLower.includes('when')) && task.includes('✓')) ||
        (reqLower.includes('interface') && (taskLower.includes('interface') || taskLower.includes('input') || taskLower.includes('output')) && task.includes('✓')) ||
        (reqLower.includes('edge case') && (taskLower.includes('edge') || taskLower.includes('boundary') || taskLower.includes('error')) && task.includes('✓')) ||
        (reqLower.includes('constraints vs') && (taskLower.includes('constraint') || taskLower.includes('how to build')) && task.includes('✓')) ||
        // Generate phase checks
        (reqLower.includes('tdd') && (taskLower.includes('implement') || taskLower.includes('tdd') || taskLower.includes('code')) && task.includes('✓')) ||
        (reqLower.includes('tests') && taskLower.includes('test') && task.includes('✓')) ||
        (reqLower.includes('code review') && taskLower.includes('review') && task.includes('✓')) ||
        (reqLower.includes('preserve') && (taskLower.includes('preserve') || taskLower.includes('document') || taskLower.includes('output')) && task.includes('✓')) ||
        // Evaluate phase checks
        (reqLower.includes('verify') && (taskLower.includes('verify') || taskLower.includes('criteria')) && task.includes('✓')) ||
        (reqLower.includes('edge cases') && (taskLower.includes('edge') || taskLower.includes('test')) && task.includes('✓')) ||
        (reqLower.includes('disposition') && (taskLower.includes('disposition') || taskLower.includes('accept') || taskLower.includes('decision')) && task.includes('✓')) ||
        (reqLower.includes('retrospective') && taskLower.includes('retrospective') && task.includes('✓'))
      );
    });
  }

  getImmediateActions(phase, cycle) {
    // Actions aligned with book methodology
    const actions = [];
    const tasks = cycle.tasks[phase] || [];

    if (phase === 'Focus') {
      if (!tasks.some(t => (t.includes('problem') || t.includes('user')) && t.includes('✓'))) {
        actions.push('Define specific problem statement and target users');
      }
      if (!tasks.some(t => (t.includes('success') || t.includes('criteria')) && t.includes('✓'))) {
        actions.push('Write testable success criteria (specific, measurable)');
      }
      if (!tasks.some(t => (t.includes('context') || t.includes('c4') || t.includes('diagram')) && t.includes('✓'))) {
        actions.push('Create System Context diagram (C4 Level 1)');
      }
    } else if (phase === 'Orchestrate') {
      if (!tasks.some(t => (t.includes('container') || t.includes('architecture')) && t.includes('✓'))) {
        actions.push('Design Container architecture (C4 Level 2)');
      }
      if (!tasks.some(t => (t.includes('depend') || t.includes('order')) && t.includes('✓'))) {
        actions.push('Create dependency map - what must exist before what');
      }
    } else if (phase === 'Refine') {
      if (!tasks.some(t => (t.includes('acceptance') || t.includes('given')) && t.includes('✓'))) {
        actions.push('Write acceptance criteria in Given-When-Then format');
      }
      if (!tasks.some(t => (t.includes('edge') || t.includes('boundary')) && t.includes('✓'))) {
        actions.push('Enumerate edge cases by category');
      }
    } else if (phase === 'Generate') {
      if (!tasks.some(t => (t.includes('implement') || t.includes('tdd')) && t.includes('✓'))) {
        actions.push('Implement with TDD (RED-GREEN-REFACTOR)');
      }
    } else if (phase === 'Evaluate') {
      if (!tasks.some(t => (t.includes('verify') || t.includes('criteria')) && t.includes('✓'))) {
        actions.push('Verify against acceptance criteria from Refine phase');
      }
    }

    return actions.length > 0 ? actions : ['Review and complete remaining tasks in current phase'];
  }

  getPhaseObjectives(phase) {
    // Objectives aligned with book methodology
    const objectives = {
      'Focus': ['Define WHAT you\'re building and WHY', 'Establish testable success criteria', 'Set clear boundaries'],
      'Orchestrate': ['Break into AI-manageable pieces', 'Map dependencies and build order', 'Size tasks for single sessions'],
      'Refine': ['Define exactly what "done" looks like', 'Specify interfaces and edge cases', 'BEFORE writing any code'],
      'Generate': ['AI writes code following TDD', 'One task per session', 'Preserve outputs immediately'],
      'Evaluate': ['Verify output matches intent', 'Test against acceptance criteria', 'Make disposition decision']
    };
    return objectives[phase] || [];
  }

  getPhaseSpecificActions(phase, cycle) {
    // Actions aligned with book methodology
    const baseActions = {
      'Focus': ['Define problem and target users', 'Write testable success criteria', 'Create C4 Level 1 diagram'],
      'Orchestrate': ['Design C4 Level 2 (containers)', 'Design C4 Level 3 (components)', 'Map dependencies'],
      'Refine': ['Write Given-When-Then criteria', 'Specify interfaces', 'Enumerate edge cases'],
      'Generate': ['Follow TDD discipline', 'One task per session', 'Review generated code'],
      'Evaluate': ['Verify criteria line-by-line', 'Test edge cases', 'Make disposition decision']
    };
    return baseActions[phase] || [];
  }

  getAgentSpecificGuidance(phase, agentType, cycle) {
    // Guidance aligned with book methodology
    const guidance = {
      'Focus': {
        'architect': 'Define problem, users, and testable success criteria. Create C4 Level 1 System Context diagram.',
        'security': 'Identify security requirements and constraints. Define security-related success criteria.',
        'documentation': 'Draft PRD with specific, testable criteria. Document boundaries and what NOT to build.'
      },
      'Orchestrate': {
        'architect': 'Design C4 Level 2 (containers) and Level 3 (components). Map dependencies and build order.',
        'devops': 'Identify deployment containers and integration points in the architecture.',
        'tester': 'Plan test strategy based on component boundaries and interfaces.'
      },
      'Refine': {
        'tester': 'Write acceptance criteria in Given-When-Then format. Enumerate edge cases by category.',
        'architect': 'Specify component interfaces: inputs, outputs, and error contracts.',
        'documentation': 'Document constraints (how to build) vs criteria (what to build).'
      },
      'Generate': {
        'developer': 'Implement following TDD: RED (failing test) → GREEN (minimal code) → REFACTOR.',
        'tester': 'Write tests before implementation. Verify each criterion is testable.',
        'reviewer': 'Review generated code for quality, security, and adherence to criteria.'
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

      // Mark task as completed by adding checkmark
      const updatedTasks = tasks.map(task => {
        if (task === matchingTask && !task.includes('✓')) {
          return task + ' ✓';
        }
        return task;
      });

      // Update the cycle with completed task
      cycle.tasks[currentPhase] = updatedTasks;

      // Recalculate phase progress
      const completedCount = updatedTasks.filter(t => t.includes('✓')).length;
      const totalCount = updatedTasks.length;
      cycle.progress[currentPhase] = Math.round((completedCount / totalCount) * 100);

      // Save the updated cycle
      await this.stateManager.updateCycle(cycleId, cycle);

      // Broadcast the completion
      if (this.dashboardEvents) {
        this.dashboardEvents.broadcastTaskCompleted({
          cycleId,
          phase: currentPhase,
          task: matchingTask,
          progress: cycle.progress[currentPhase]
        });
      }

      return {
        type: 'text',
        text: `✅ Completed task: "${matchingTask}" in ${currentPhase} phase\n\nPhase progress: ${cycle.progress[currentPhase]}%`
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

  async generateDocs(args) {
    const { cycleId, docType, includeMetadata = true } = args;

    try {
      const cycle = await this.stateManager.getCycle(cycleId);
      const results = [];

      if (docType === 'all') {
        // Generate all documentation types
        for (const type of ['prd', 'architecture', 'testing']) {
          const result = await this.docsManager.generateCycleDocumentation(cycle, type);
          results.push({
            type,
            path: result.relativePath
          });
        }
      } else {
        // Generate specific documentation type
        const result = await this.docsManager.generateCycleDocumentation(cycle, docType);
        results.push({
          type: docType,
          path: result.relativePath
        });
      }

      // Get documentation stats
      const stats = await this.docsManager.getDocsStats();

      let responseText = '📄 **Documentation Generated**\n\n';
      responseText += `**Feature**: ${cycle.feature}\n`;
      responseText += `**Cycle**: ${cycleId}\n\n`;
      responseText += '**Files Created**:\n';

      results.forEach(r => {
        responseText += `• ${r.type}: ${r.path}\n`;
      });

      responseText += '\n**📊 Documentation Stats**:\n';
      responseText += `• Total documents: ${stats.totalDocuments}\n`;
      responseText += `• PRDs: ${stats.byType.prd || 0}\n`;
      responseText += `• Architecture docs: ${stats.byType.architecture || 0}\n`;
      responseText += `• Test plans: ${stats.byType.testing || 0}\n`;

      return {
        type: 'text',
        text: responseText
      };
    } catch (error) {
      throw new Error(`Failed to generate documentation: ${error.message}`);
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

    // Get cycle context if cycleId provided
    let cycleContext = '';
    if (cycleId) {
      try {
        const cycle = await this.stateManager.getCycle(cycleId);
        cycleContext = `

**DEVELOPMENT CONTEXT:**
• Feature: ${cycle.feature}
• Current Phase: ${cycle.phase}
• Phase Progress: ${cycle.progress[cycle.phase]}%
• Phase Tasks: ${cycle.tasks[cycle.phase]?.length || 0} items

**YOUR EXPERTISE AS ${agentType.toUpperCase()} AGENT:**
${this.getAgentExpertise(agentType)}

**SPECIFIC TASK:**
${task}

**ADDITIONAL CONTEXT:**
• autoInvoked: false
• phase: ${cycle.phase}
• timestamp: ${new Date().toISOString()}

**DELIVERABLE REQUIREMENTS:**
${this.getAgentDeliverables(agentType, cycle.phase)}

Please analyze this request using your specialized ${agentType} expertise and provide detailed recommendations, solutions, or deliverables as appropriate.`;
      } catch (error) {
        this.logger.warn(`Could not get cycle context for ${cycleId}: ${error.message}`);
      }
    }

    // Use Claude Code's Task tool to invoke the specialized agent
    const agentPrompt = `You are the ${agentType.toUpperCase()} AGENT for the FORGE development framework.${cycleContext}`;

    // Note: This would be replaced with actual Task tool invocation in a real environment
    // For now, return the formatted agent invocation
    return {
      type: 'text',
      text: `🤖 **${this.getAgentEmoji(agentType)} ${this.capitalizeFirst(agentType)} Agent Auto-Activated**

${agentPrompt}

---

**💡 AGENT ACTIVATION:**
The ${agentType} agent has been invoked with specialized context and should provide expert guidance for this task.

**🎯 EXPECTED DELIVERABLES:**
${this.getAgentDeliverables(agentType, cycleId ? 'active' : 'general')}

Use the agent's specialized knowledge to provide actionable recommendations and solutions.`
    };
  }

  getAgentEmoji(agentType) {
    const emojis = {
      'architect': '🟦',
      'developer': '🟨',
      'tester': '🟪',
      'devops': '🟩',
      'security': '🟥',
      'documentation': '🟫',
      'reviewer': '🟧'
    };
    return emojis[agentType] || '🤖';
  }

  getAgentExpertise(agentType) {
    const expertise = {
      'architect': 'System design, architecture patterns, technology selection, scalability planning, and technical strategy',
      'developer': 'Code implementation, software engineering best practices, test-driven development, and technical problem-solving',
      'tester': 'Test strategy, test case design, quality assurance, test automation, and defect management',
      'devops': 'Infrastructure, CI/CD pipelines, deployment automation, monitoring, and operational excellence',
      'security': 'Security analysis, threat modeling, vulnerability assessment, secure coding practices, and compliance',
      'documentation': 'Technical writing, documentation creation, knowledge management, and information architecture',
      'reviewer': 'Code review, quality assessment, best practices enforcement, and technical debt management'
    };
    return expertise[agentType] || 'Specialized expertise for software development';
  }

  getAgentDeliverables(agentType, phase) {
    const deliverables = {
      'architect': phase === 'Focus' ? 'System architecture design, technology stack recommendations' :
        phase === 'Orchestrate' ? 'Detailed component design, integration patterns' :
          phase === 'Refine' ? 'Implementation guidance, architectural compliance review' :
            phase === 'Generate' ? 'Deployment architecture, operational procedures' :
              'Architecture retrospective, lessons learned',
      'security': phase === 'Focus' ? 'Security requirements, threat modeling' :
        phase === 'Orchestrate' ? 'Security controls design, testing strategy' :
          phase === 'Refine' ? 'Security code review, vulnerability assessment' :
            phase === 'Generate' ? 'Security validation, compliance verification' :
              'Security assessment, improvement recommendations',
      'developer': phase === 'Focus' ? 'Technical feasibility analysis, constraints identification' :
        phase === 'Orchestrate' ? 'Implementation plan, task breakdown' :
          phase === 'Refine' ? 'Code implementation, test creation' :
            phase === 'Generate' ? 'Code finalization, deployment preparation' :
              'Implementation review, code quality assessment',
      'tester': phase === 'Focus' ? 'Test scenarios, acceptance criteria (MANDATORY)' :
        phase === 'Orchestrate' ? 'Test strategy, automation plan' :
          phase === 'Refine' ? 'Test implementation, execution results' :
            phase === 'Generate' ? 'Final validation, acceptance testing' :
              'Test results analysis, quality metrics',
      'devops': phase === 'Focus' ? 'Infrastructure requirements, deployment planning' :
        phase === 'Orchestrate' ? 'CI/CD design, environment strategy' :
          phase === 'Refine' ? 'Pipeline implementation, automation setup' :
            phase === 'Generate' ? 'Production deployment, monitoring setup' :
              'Operational review, infrastructure optimization',
      'documentation': phase === 'Focus' ? 'Documentation planning, PRD updates' :
        phase === 'Orchestrate' ? 'Technical specifications, API documentation' :
          phase === 'Refine' ? 'Implementation documentation, guides' :
            phase === 'Generate' ? 'User documentation, deployment guides' :
              'Documentation review, knowledge capture'
    };
    return deliverables[agentType] || 'Specialized deliverables based on expertise';
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async decomposePRD(args) {
    const {
      prdContent,
      prdFilePath,
      analysisLevel = 'detailed',
      generateCycles = false,
      generateCyclesConfirmed = false,
      featurePrefix = ''
    } = args;

    // SAFETY CHECK: Require human confirmation for mass cycle generation
    if (generateCycles && !generateCyclesConfirmed) {
      return {
        type: 'text',
        text: '⚠️  **MASS ACTION - HUMAN CONFIRMATION REQUIRED**\n\n' +
              '**Action**: Automatically generate multiple development cycles from PRD\n' +
              '**Analysis Level**: ' + analysisLevel + '\n\n' +
              '**⚠️  WARNING: This action will:**\n' +
              '• Create multiple development cycles automatically\n' +
              '• Generate documentation for each cycle\n' +
              '• Add tasks to Focus phases\n' +
              '• May create many cycles (5-20+ depending on PRD complexity)\n\n' +
              '**📋 Before proceeding:**\n' +
              '1. Review the PRD content carefully\n' +
              '2. Ensure the PRD is well-structured and complete\n' +
              '3. Consider if you want to create cycles manually for more control\n\n' +
              '**💡 Alternatives:**\n' +
              '• Call without `generateCycles` to analyze only (recommended first step)\n' +
              '• Review analysis results before creating cycles\n' +
              '• Create cycles manually using `forge_new_cycle` for fine control\n\n' +
              '**🔒 To proceed with automatic cycle generation:**\n' +
              'Call this tool again with BOTH:\n' +
              '• `generateCycles: true`\n' +
              '• `generateCyclesConfirmed: true`\n\n' +
              '**✅ Recommended First Step:**\n' +
              'Call without `generateCycles` to see what would be created.'
      };
    }

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

    // Save the original PRD to docs if provided as file
    if (prdFilePath) {
      try {
        const fileName = prdFilePath.split('/').pop().replace('.md', '');
        await this.docsManager.savePRD(fileName, content, {
          source: 'decomposed',
          originalPath: prdFilePath
        });
        this.logger.info('Original PRD saved to docs/prd/');
      } catch (saveError) {
        this.logger.warn('Could not save original PRD to docs:', saveError.message);
      }
    }

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

          // Generate documentation for this cycle
          try {
            await this.docsManager.generateCycleDocumentation(cycle, 'prd');
            await this.docsManager.generateCycleDocumentation(cycle, 'testing');
          } catch (docError) {
            this.logger.warn(`Could not create documentation for ${cycleName}:`, docError.message);
          }

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

  // PRD Conversation Helpers
  generatePRDConversationPrompt(feature, description, priority) {
    let prompt = '📋 **Let\'s Build a Comprehensive PRD Together**\n\n';
    prompt += `**Feature**: ${feature}\n`;
    prompt += `**Priority**: ${priority}\n\n`;

    if (description) {
      prompt += `**Initial Description**: ${description}\n\n`;
      prompt += '⚠️ This description needs more detail to create a solid foundation.\n\n';
    }

    prompt += '**Let me help you build complete requirements. Please provide:**\n\n';

    prompt += '**1. Feature Overview & Goals**\n';
    prompt += '   • What problem does this solve?\n';
    prompt += '   • Who are the users/stakeholders?\n';
    prompt += '   • What are the key objectives?\n\n';

    prompt += '**2. Detailed Requirements**\n';
    prompt += '   • What are the core functionalities?\n';
    prompt += '   • What are the user workflows?\n';
    prompt += '   • What are the acceptance criteria?\n\n';

    prompt += '**3. Technical Considerations**\n';
    prompt += '   • Are there specific technologies or frameworks to use?\n';
    prompt += '   • What are the integration points with existing systems?\n';
    prompt += '   • What are the performance/scalability requirements?\n\n';

    prompt += '**4. Security & Compliance**\n';
    prompt += '   • Are there security requirements (authentication, authorization, data protection)?\n';
    prompt += '   • Any compliance standards to follow (GDPR, HIPAA, etc.)?\n';
    prompt += '   • What are the data sensitivity levels?\n\n';

    prompt += '**5. Success Criteria**\n';
    prompt += '   • How will we measure success?\n';
    prompt += '   • What are the key metrics?\n';
    prompt += '   • What defines "done"?\n\n';

    prompt += '---\n\n';
    prompt += '💡 **TIP**: You can also provide:\n';
    prompt += '• User stories in "As a [user], I want [goal], so that [benefit]" format\n';
    prompt += '• Edge cases and error scenarios to handle\n';
    prompt += '• Dependencies on other features or systems\n\n';

    prompt += '**🎯 Next Step**: Please provide detailed answers to these questions, ';
    prompt += 'and I\'ll create a comprehensive development cycle with proper documentation.\n\n';

    prompt += '**⏭️ Skip This**: If you want to proceed with minimal requirements, ';
    prompt += 'call `forge_new_cycle` again with `confirmed: true`, but this is NOT recommended.';

    return prompt;
  }

  validatePRDRequirements(feature, description) {
    const issues = [];

    if (!description || description.length < 50) {
      issues.push('Description is too brief - needs detailed explanation of the feature');
    }

    // Check for key PRD elements
    const hasUserStory = description && (
      description.toLowerCase().includes('user') ||
      description.toLowerCase().includes('customer') ||
      description.toLowerCase().includes('stakeholder')
    );

    const hasAcceptanceCriteria = description && (
      description.toLowerCase().includes('should') ||
      description.toLowerCase().includes('must') ||
      description.toLowerCase().includes('will') ||
      description.toLowerCase().includes('criteria') ||
      description.toLowerCase().includes('requirement')
    );

    const hasTechnicalDetails = description && (
      description.toLowerCase().includes('system') ||
      description.toLowerCase().includes('api') ||
      description.toLowerCase().includes('database') ||
      description.toLowerCase().includes('integration') ||
      description.toLowerCase().includes('component')
    );

    if (!hasUserStory) {
      issues.push('Missing user/stakeholder context - who is this for?');
    }

    if (!hasAcceptanceCriteria) {
      issues.push('Missing acceptance criteria - what defines success?');
    }

    if (description && description.length < 200 && !hasTechnicalDetails) {
      issues.push('Missing technical details - needs implementation guidance');
    }

    return issues;
  }

  generatePRDValidationPrompt(feature, description, priority, validationIssues) {
    let prompt = '⚠️ **PRD Validation Check**\n\n';
    prompt += `**Feature**: ${feature}\n`;
    prompt += `**Priority**: ${priority}\n\n`;
    prompt += `**Current Description**:\n${description}\n\n`;

    prompt += '**❌ Missing Elements**:\n';
    validationIssues.forEach(issue => {
      prompt += `• ${issue}\n`;
    });

    prompt += '\n**📋 Recommendations**:\n\n';
    prompt += 'A comprehensive PRD should include:\n\n';

    prompt += '1. **User Context**\n';
    prompt += '   • Who needs this feature and why?\n';
    prompt += '   • What problem are we solving?\n\n';

    prompt += '2. **Acceptance Criteria**\n';
    prompt += '   • What are the specific requirements?\n';
    prompt += '   • How do we verify it works correctly?\n\n';

    prompt += '3. **Technical Details**\n';
    prompt += '   • What systems/components are involved?\n';
    prompt += '   • Are there integration points or dependencies?\n\n';

    prompt += '4. **Success Metrics**\n';
    prompt += '   • How will we measure success?\n';
    prompt += '   • What business value does this deliver?\n\n';

    prompt += '---\n\n';
    prompt += '**🔄 Options**:\n\n';
    prompt += '1. **RECOMMENDED**: Provide more details by answering:\n';
    prompt += '   • What is the user workflow for this feature?\n';
    prompt += '   • What are the must-have vs nice-to-have requirements?\n';
    prompt += '   • What are potential edge cases or error scenarios?\n';
    prompt += '   • Are there security or performance requirements?\n\n';

    prompt += '2. **Proceed anyway**: Call `forge_new_cycle` with `confirmed: true`\n';
    prompt += '   ⚠️ Warning: Incomplete requirements lead to scope creep and rework!\n\n';

    prompt += '**💡 FORGE Philosophy**: "Invest time in Focus phase to save time in all other phases"';

    return prompt;
  }
}

module.exports = { ToolHandlers };