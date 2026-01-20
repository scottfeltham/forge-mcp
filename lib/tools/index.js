/**
 * FORGE MCP Tool Handlers
 * Implements all FORGE tools as MCP operations
 */

class ToolHandlers {
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    this.logger = options.logger || console;

    // Define all available tools
    this.tools = {
      forge_init: {
        name: 'forge_init',
        description: 'Initialize FORGE in a project directory. Creates .forge/ structure with config, context, and learnings files.',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: {
              type: 'string',
              description: 'Project name (default: directory name)'
            }
          }
        }
      },

      // Alias for backward compatibility
      forge_init_project: {
        name: 'forge_init_project',
        description: 'Initialize FORGE in a project directory. Creates .forge/ structure with config, context, and learnings files.',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: {
              type: 'string',
              description: 'Project name (default: directory name)'
            },
            projectType: {
              type: 'string',
              description: 'Project type (e.g., web, cli, library)'
            }
          }
        }
      },

      forge_new_cycle: {
        name: 'forge_new_cycle',
        description: 'Create a new development cycle. IMPORTANT: Before calling this tool, assess if requirements are clear. If vague, ask clarifying questions (see prompts/prd-conversation.md). Always summarize your understanding and confirm with the user before creating the cycle.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Cycle name/description'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Cycle priority (default: medium)'
            }
          },
          required: ['name']
        }
      },

      forge_list_cycles: {
        name: 'forge_list_cycles',
        description: 'List all active and completed development cycles.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },

      forge_status: {
        name: 'forge_status',
        description: 'Get detailed status of all active cycles including phase progress and completion percentages.',
        inputSchema: {
          type: 'object',
          properties: {
            detailed: {
              type: 'boolean',
              description: 'Show item-level details'
            }
          }
        }
      },

      forge_validate: {
        name: 'forge_validate',
        description: 'Validate current phase requirements. Returns incomplete items and whether advancement is possible.',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle ID (default: most recent active)'
            }
          }
        }
      },

      forge_advance_phase: {
        name: 'forge_advance_phase',
        description: 'Advance to the next phase. IMPORTANT: During Focus, Orchestrate, and Refine phases, assess clarity first. If requirements are vague, ask clarifying questions. Always summarize your understanding and confirm with the user before advancing. Validates requirements unless force=true.',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle ID (default: most recent active)'
            },
            force: {
              type: 'boolean',
              description: 'Force advance without validation'
            }
          }
        }
      },

      forge_complete_task: {
        name: 'forge_complete_task',
        description: 'Mark a task as complete by checking its checkbox. Supports partial text matching.',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Task description (partial match supported)'
            },
            cycleId: {
              type: 'string',
              description: 'Cycle ID (default: most recent active)'
            }
          },
          required: ['description']
        }
      },

      forge_add_task: {
        name: 'forge_add_task',
        description: 'Add a new task to the current phase.',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Task description'
            },
            cycleId: {
              type: 'string',
              description: 'Cycle ID (default: most recent active)'
            }
          },
          required: ['description']
        }
      },

      forge_complete_cycle: {
        name: 'forge_complete_cycle',
        description: 'Complete and archive a cycle. Only works when cycle is in Evaluate phase.',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle ID to complete'
            }
          },
          required: ['cycleId']
        }
      },

      forge_add_learning: {
        name: 'forge_add_learning',
        description: 'Add a learning to the knowledge base. Categories: pattern, anti-pattern, decision, tool.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['pattern', 'anti-pattern', 'decision', 'tool'],
              description: 'Learning category'
            },
            title: {
              type: 'string',
              description: 'Learning title'
            },
            description: {
              type: 'string',
              description: 'Learning description'
            },
            context: {
              type: 'string',
              description: 'Additional context'
            }
          },
          required: ['category', 'title', 'description']
        }
      },

      forge_retro: {
        name: 'forge_retro',
        description: 'Start a retrospective for a cycle. Creates template in learnings.md.',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle ID (default: most recent)'
            }
          }
        }
      },

      forge_get_cycle: {
        name: 'forge_get_cycle',
        description: 'Get the full content of a specific cycle.',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: {
              type: 'string',
              description: 'Cycle ID'
            }
          },
          required: ['cycleId']
        }
      },

      forge_invoke_agent: {
        name: 'forge_invoke_agent',
        description: 'Invoke a specialized FORGE agent for expert guidance. Agents: architect, developer, tester, security, devops, documentation, reviewer, integration-coordinator.',
        inputSchema: {
          type: 'object',
          properties: {
            agent: {
              type: 'string',
              enum: ['architect', 'developer', 'tester', 'security', 'devops', 'documentation', 'reviewer', 'integration-coordinator'],
              description: 'Agent type to invoke'
            },
            cycleId: {
              type: 'string',
              description: 'Cycle ID for context'
            },
            task: {
              type: 'string',
              description: 'Task description for the agent'
            }
          },
          required: ['agent', 'task']
        }
      }
    };
  }

  async getCapabilities() {
    return Object.keys(this.tools);
  }

  async listTools() {
    return Object.values(this.tools);
  }

  async callTool(name, args = {}) {
    this.logger.debug(`Calling tool: ${name}`, args);

    switch (name) {
    case 'forge_init':
    case 'forge_init_project':
      return this.handleInit(args);

    case 'forge_new_cycle':
      return this.handleNewCycle(args);

    case 'forge_list_cycles':
      return this.handleListCycles();

    case 'forge_status':
      return this.handleStatus(args);

    case 'forge_validate':
      return this.handleValidate(args);

    case 'forge_advance_phase':
      return this.handleAdvancePhase(args);

    case 'forge_complete_task':
      return this.handleCompleteTask(args);

    case 'forge_add_task':
      return this.handleAddTask(args);

    case 'forge_complete_cycle':
      return this.handleCompleteCycle(args);

    case 'forge_add_learning':
      return this.handleAddLearning(args);

    case 'forge_retro':
      return this.handleRetro(args);

    case 'forge_get_cycle':
      return this.handleGetCycle(args);

    case 'forge_invoke_agent':
      return this.handleInvokeAgent(args);

    default:
      return this.errorResponse(`Unknown tool: ${name}`);
    }
  }

  // Tool handlers

  handleInit(args) {
    const result = this.stateManager.initProject(args.projectName);
    return this.formatResponse(result);
  }

  handleNewCycle(args) {
    if (!args.name) {
      return this.errorResponse('name is required');
    }
    const result = this.stateManager.newCycle(args.name, args.priority || 'medium');
    return this.formatResponse(result);
  }

  handleListCycles() {
    const result = this.stateManager.listCycles();
    return this.formatResponse({ success: true, ...result });
  }

  handleStatus(args) {
    const result = this.stateManager.getStatus();

    if (!result.success) {
      return this.formatResponse(result);
    }

    // Format status for display
    const output = [];
    output.push('FORGE Status');
    output.push('='.repeat(50));

    for (const cycle of result.cycles) {
      output.push(`\nCycle: ${cycle.cycleId}`);
      output.push(`Active Phase: ${cycle.activePhase}`);
      output.push('');

      for (const phaseName of ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate']) {
        const phase = cycle.phases[phaseName];
        let indicator;
        if (phase.state === 'Complete') {
          indicator = '[x]';
        } else if (phase.state === 'Active') {
          indicator = '[>]';
        } else {
          indicator = '[ ]';
        }

        const progress = phase.totalItems > 0
          ? `${phase.completedItems}/${phase.totalItems}`
          : '-';

        output.push(`  ${indicator} ${phase.name}: ${progress}`);

        if (args.detailed && phase.items.length > 0) {
          for (const item of phase.items) {
            const check = item.completed ? 'x' : ' ';
            output.push(`      [${check}] ${item.text}`);
          }
        }
      }
    }

    return this.formatResponse({
      success: true,
      text: output.join('\n'),
      cycles: result.cycles
    });
  }

  handleValidate(args) {
    const result = this.stateManager.validatePhase(args.cycleId);
    return this.formatResponse(result);
  }

  handleAdvancePhase(args) {
    const result = this.stateManager.advancePhase(args.cycleId, args.force || false);
    return this.formatResponse(result);
  }

  handleCompleteTask(args) {
    if (!args.description) {
      return this.errorResponse('description is required');
    }
    const result = this.stateManager.completeTask(args.description, args.cycleId);
    return this.formatResponse(result);
  }

  handleAddTask(args) {
    if (!args.description) {
      return this.errorResponse('description is required');
    }
    const result = this.stateManager.addTask(args.description, args.cycleId);
    return this.formatResponse(result);
  }

  handleCompleteCycle(args) {
    if (!args.cycleId) {
      return this.errorResponse('cycleId is required');
    }
    const result = this.stateManager.completeCycle(args.cycleId);
    return this.formatResponse(result);
  }

  handleAddLearning(args) {
    if (!args.category || !args.title || !args.description) {
      return this.errorResponse('category, title, and description are required');
    }
    const result = this.stateManager.addLearning(
      args.category,
      args.title,
      args.description,
      args.context || ''
    );
    return this.formatResponse(result);
  }

  handleRetro(args) {
    const result = this.stateManager.runRetrospective(args.cycleId);
    return this.formatResponse(result);
  }

  handleGetCycle(args) {
    if (!args.cycleId) {
      return this.errorResponse('cycleId is required');
    }
    const result = this.stateManager.getCycle(args.cycleId);
    return this.formatResponse(result);
  }

  handleInvokeAgent(args) {
    if (!args.agent || !args.task) {
      return this.errorResponse('agent and task are required');
    }

    // Get agent definition from templates
    const agentPath = require('path').join(
      this.stateManager.baseDir,
      '.claude_code',
      'agents',
      `${args.agent}.md`
    );

    const fs = require('fs');
    if (!fs.existsSync(agentPath)) {
      return this.errorResponse(`Agent not found: ${args.agent}`);
    }

    const agentDef = fs.readFileSync(agentPath, 'utf8');

    // Get cycle context if provided
    let cycleContext = '';
    if (args.cycleId) {
      const cycle = this.stateManager.getCycle(args.cycleId);
      if (cycle.success) {
        cycleContext = `\n\n## Current Cycle Context\n\n${cycle.content}`;
      }
    }

    // Phase-based guidance
    const phaseGuidance = {
      Focus: {
        recommended: ['architect', 'security', 'documentation'],
        focus: 'Problem definition, success criteria, C4 L1 system context'
      },
      Orchestrate: {
        recommended: ['architect'],
        focus: 'C4 L2-L3 architecture, dependency mapping, task breakdown'
      },
      Refine: {
        recommended: ['tester', 'architect'],
        focus: 'Acceptance criteria, interfaces, edge cases - NO CODE'
      },
      Generate: {
        recommended: ['developer', 'reviewer'],
        focus: 'TDD implementation, code review'
      },
      Evaluate: {
        recommended: ['tester', 'security'],
        focus: 'Verification, edge case testing, security review'
      }
    };

    return this.formatResponse({
      success: true,
      agent: args.agent,
      task: args.task,
      agentDefinition: agentDef,
      cycleContext,
      phaseGuidance,
      message: `Invoking ${args.agent} agent for: ${args.task}`
    });
  }

  // Helper methods

  formatResponse(result) {
    if (result.success === false) {
      return {
        type: 'text',
        text: JSON.stringify(result, null, 2),
        isError: true
      };
    }

    // If there's formatted text, use it
    if (result.text) {
      return {
        type: 'text',
        text: result.text
      };
    }

    return {
      type: 'text',
      text: JSON.stringify(result, null, 2)
    };
  }

  errorResponse(message) {
    return {
      type: 'text',
      text: JSON.stringify({ success: false, message }, null, 2),
      isError: true
    };
  }
}

module.exports = { ToolHandlers };
