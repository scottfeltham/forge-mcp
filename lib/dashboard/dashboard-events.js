/**
 * Dashboard event management for real-time updates
 */

class DashboardEvents {
  constructor(transport, stateManager, options = {}) {
    this.transport = transport;
    this.stateManager = stateManager;
    this.logger = options.logger || console;
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  initialize() {
    // Subscribe to state manager events
    this.stateManager.subscribe((event, data) => {
      this.handleStateEvent(event, data);
    });

    this.logger.debug('Dashboard events initialized');
  }

  handleStateEvent(event, data) {
    const dashboardEvent = this.createDashboardEvent(event, data);
    if (dashboardEvent) {
      this.broadcastEvent(dashboardEvent);
      this.addToHistory(dashboardEvent);
    }
  }

  createDashboardEvent(event, data) {
    const timestamp = new Date().toISOString();

    switch (event) {
    case 'file-changed': {
      if (data.includes('.yaml')) {
        return {
          type: 'config-updated',
          data: { filePath: data, timestamp }
        };
      }
      break;
    }

    case 'file-added': {
      if (data.includes('cycles/active/')) {
        return {
          type: 'cycle-created',
          data: { filePath: data, timestamp }
        };
      }
      break;
    }

    case 'file-deleted': {
      if (data.includes('cycles/active/')) {
        return {
          type: 'cycle-archived',
          data: { filePath: data, timestamp }
        };
      }
      break;
    }

    default:
      return null;
    }

    return null;
  }

  // Public methods for broadcasting specific events
  broadcastCycleCreated(cycleData) {
    this.broadcastEvent({
      type: 'cycle-created',
      data: {
        cycleId: cycleData.id,
        feature: cycleData.feature,
        phase: cycleData.phase,
        priority: cycleData.priority,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastPhaseAdvanced(cycleId, fromPhase, toPhase, autoAgents = '') {
    this.broadcastEvent({
      type: 'phase-advanced',
      data: {
        cycleId,
        fromPhase,
        toPhase,
        autoAgents,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastAgentInvoked(agentData) {
    this.broadcastEvent({
      type: 'agent-invoked',
      data: {
        agentType: agentData.agentType,
        cycleId: agentData.cycleId,
        task: agentData.task,
        isAutoInvoked: agentData.isAutoInvoked || false,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastTaskCompleted(taskData) {
    this.broadcastEvent({
      type: 'task-completed',
      data: {
        cycleId: taskData.cycleId,
        phase: taskData.phase,
        task: taskData.task,
        progress: taskData.progress,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastLLMDelegated(delegationData) {
    this.broadcastEvent({
      type: 'llm-delegated',
      data: {
        taskType: delegationData.taskType,
        model: delegationData.model,
        confidence: delegationData.confidence,
        duration: delegationData.duration,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastSystemStatus(statusData) {
    this.broadcastEvent({
      type: 'system-status',
      data: {
        ...statusData,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastEvent(event) {
    try {
      // Broadcast to all connected SSE clients
      if (this.transport && this.transport.broadcast) {
        this.transport.broadcast({
          type: 'dashboard-event',
          data: event
        });
      }

      this.logger.debug('Dashboard event broadcast:', event.type);
    } catch (error) {
      this.logger.error('Error broadcasting dashboard event:', error.message);
    }
  }

  addToHistory(event) {
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }
  }

  getEventHistory(limit = 20) {
    return this.eventHistory.slice(0, limit);
  }

  getEventStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentEvents = this.eventHistory.filter(event => {
      const eventTime = new Date(event.data.timestamp).getTime();
      return (now - eventTime) < oneHour;
    });

    const dailyEvents = this.eventHistory.filter(event => {
      const eventTime = new Date(event.data.timestamp).getTime();
      return (now - eventTime) < oneDay;
    });

    const eventTypes = {};
    recentEvents.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });

    return {
      recentCount: recentEvents.length,
      dailyCount: dailyEvents.length,
      totalCount: this.eventHistory.length,
      eventTypes,
      timestamp: new Date().toISOString()
    };
  }

  // Test event for dashboard development
  broadcastTestEvent() {
    this.broadcastEvent({
      type: 'test-event',
      data: {
        message: 'Dashboard connection test',
        timestamp: new Date().toISOString()
      }
    });
  }
}

module.exports = { DashboardEvents };