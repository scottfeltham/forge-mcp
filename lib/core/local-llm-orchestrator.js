/**
 * Local LLM orchestration for FORGE MCP Server
 * Manages task delegation to local Ollama models for efficiency
 */

const { Ollama } = require('ollama');

class LocalLLMOrchestrator {
  constructor(options = {}) {
    this.config = {
      enabled: options.enabled !== false,
      host: options.host || 'http://localhost:11434',
      model: options.model || 'llama2',
      fallbackModel: options.fallbackModel || 'codellama',
      trivialTaskThreshold: options.trivialTaskThreshold || 0.7,
      autoDelegate: options.autoDelegate !== false,
      maxRetries: 2
    };

    this.ollama = new Ollama({ host: this.config.host });
    this.logger = options.logger || console;
    this.connectionStatus = 'disconnected';
    this.availableModels = [];
  }

  async initialize() {
    if (!this.config.enabled) {
      this.logger.debug('Local LLM orchestration disabled');
      return false;
    }

    try {
      // Test connection and get available models
      this.availableModels = await this.ollama.list();
      this.connectionStatus = 'connected';

      this.logger.info('Local LLM orchestrator initialized', {
        host: this.config.host,
        models: this.availableModels.models?.length || 0
      });

      // Ensure preferred model is available
      await this.ensureModelAvailable(this.config.model);

      return true;
    } catch (error) {
      this.logger.warn('Failed to initialize local LLM orchestrator:', error.message);
      this.connectionStatus = 'failed';
      return false;
    }
  }

  async ensureModelAvailable(modelName) {
    const modelExists = this.availableModels.models?.some(m => m.name === modelName);

    if (!modelExists) {
      this.logger.info(`Pulling model ${modelName}...`);
      try {
        await this.ollama.pull({ model: modelName });
        this.logger.info(`Model ${modelName} pulled successfully`);
        // Refresh model list
        this.availableModels = await this.ollama.list();
      } catch (error) {
        this.logger.warn(`Failed to pull model ${modelName}:`, error.message);
        throw error;
      }
    }
  }

  // Task classification system
  classifyTask(taskType, taskDescription, context = {}) {
    const trivialTasks = {
      // Document generation tasks
      'generate_prd_template': 0.9,
      'generate_task_breakdown': 0.8,
      'generate_test_scenarios': 0.7,
      'format_documentation': 0.9,

      // PRD analysis tasks
      'decompose_prd': 0.8,
      'extract_features': 0.8,
      'analyze_requirements': 0.7,
      'prioritize_tasks': 0.6,
      'identify_dependencies': 0.7,

      // Code analysis tasks
      'analyze_code_structure': 0.6,
      'suggest_variable_names': 0.8,
      'generate_comments': 0.8,

      // Planning tasks
      'create_task_list': 0.7,
      'estimate_effort': 0.6,
      'suggest_dependencies': 0.6,

      // Validation tasks
      'validate_requirements': 0.5,
      'check_completeness': 0.7,
      'format_output': 0.9
    };

    let score = trivialTasks[taskType] || 0.3;

    // Adjust score based on context complexity
    if (context.complexity === 'high') score *= 0.7;
    if (context.requiresExpertise) score *= 0.5;
    if (context.criticalPath) score *= 0.6;

    return {
      isTrivial: score >= this.config.trivialTaskThreshold,
      confidence: score,
      reasoning: this.getClassificationReasoning(taskType, score)
    };
  }

  getClassificationReasoning(taskType, score) {
    if (score >= 0.8) return 'Highly routine task, safe for local processing';
    if (score >= 0.7) return 'Routine task with low complexity';
    if (score >= 0.5) return 'Moderate complexity, may benefit from local processing';
    return 'Complex task requiring human/expert oversight';
  }

  // Main orchestration method
  async delegateTask(taskType, taskDescription, context = {}) {
    if (!this.config.enabled || this.connectionStatus !== 'connected') {
      return { delegated: false, reason: 'Local LLM not available' };
    }

    const classification = this.classifyTask(taskType, taskDescription, context);

    if (!classification.isTrivial) {
      return {
        delegated: false,
        reason: classification.reasoning,
        confidence: classification.confidence
      };
    }

    try {
      const result = await this.executeLocalTask(taskType, taskDescription, context);

      return {
        delegated: true,
        result: result,
        model: this.config.model,
        confidence: classification.confidence
      };
    } catch (error) {
      this.logger.warn(`Local LLM task execution failed: ${error.message}`);
      return {
        delegated: false,
        reason: `Execution failed: ${error.message}`
      };
    }
  }

  async executeLocalTask(taskType, taskDescription, context = {}) {
    const prompt = this.generateTaskPrompt(taskType, taskDescription, context);

    let attempts = 0;
    let lastError;

    while (attempts < this.config.maxRetries) {
      try {
        const modelToUse = attempts === 0 ? this.config.model : this.config.fallbackModel;

        const response = await this.ollama.generate({
          model: modelToUse,
          prompt: prompt,
          options: {
            temperature: 0.3, // Lower temperature for consistent output
            top_p: 0.9,
            max_tokens: 2000
          }
        });

        return {
          content: response.response,
          model: modelToUse,
          tokens: response.eval_count || 0,
          duration: response.total_duration || 0
        };
      } catch (error) {
        lastError = error;
        attempts++;
        this.logger.warn(`Local LLM attempt ${attempts} failed:`, error.message);
      }
    }

    throw lastError;
  }

  generateTaskPrompt(taskType, taskDescription, context = {}) {
    const basePrompt = `Task: ${taskType}\nDescription: ${taskDescription}\n`;

    let prompt = basePrompt;

    // Add context-specific instructions
    switch (taskType) {
    case 'decompose_prd':
      prompt += '\nAnalyze the following PRD and extract features, dependencies, and risks. Return structured data that can be used to create development cycles.\n\nFormat the response as JSON with features, dependencies, and risk areas.\n';
      break;

    case 'generate_task_breakdown':
      prompt += '\nBreak down this requirement into specific, actionable tasks. Consider implementation steps, testing needs, and dependencies.\n\nProvide a clear list of tasks with priorities.\n';
      break;

    case 'extract_features':
      prompt += '\nExtract discrete features from the requirements. Each feature should be independently implementable.\n\nList features with descriptions and priorities.\n';
      break;

    default:
      prompt += `\nProvide a helpful, structured response for this ${taskType} task.\n`;
    }

    if (context.analysisLevel) {
      prompt += `\nAnalysis Level: ${context.analysisLevel}\n`;
    }

    return prompt;
  }

  // Utility methods for specific task types
  async generatePRDTemplate(context = {}) {
    return await this.delegateTask(
      'generate_prd_template',
      'Generate a comprehensive PRD template suitable for FORGE development cycles',
      context
    );
  }

  async decomposePRD(prdContent, options = {}) {
    return await this.delegateTask(
      'decompose_prd',
      `Analyze and decompose PRD into features and tasks: ${prdContent.substring(0, 200)}...`,
      {
        analysisLevel: options.analysisLevel || 'detailed',
        extractFeatures: true,
        identifyDependencies: true,
        suggestPriority: true,
        prdContent: prdContent
      }
    );
  }

  async generateTaskBreakdown(requirements, context = {}) {
    return await this.delegateTask(
      'generate_task_breakdown',
      requirements,
      context
    );
  }

  // Status and configuration
  getStatus() {
    return {
      enabled: this.config.enabled,
      connectionStatus: this.connectionStatus,
      model: this.config.model,
      fallbackModel: this.config.fallbackModel,
      availableModels: this.availableModels.models?.map(m => m.name) || [],
      config: {
        host: this.config.host,
        trivialTaskThreshold: this.config.trivialTaskThreshold,
        autoDelegate: this.config.autoDelegate
      }
    };
  }

  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    this.logger.debug('Local LLM config updated', newConfig);
  }
}

module.exports = { LocalLLMOrchestrator };