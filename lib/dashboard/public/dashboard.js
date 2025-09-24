/**
 * FORGE Dashboard Client-side JavaScript
 */

class ForgeDashboard {
  constructor() {
    this.eventSource = null;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.currentReconnectDelay = this.reconnectDelay;

    this.data = {
      status: null,
      cycles: { active: [], completed: [] },
      agents: { agents: [] },
      config: null
    };

    this.init();
  }

  init() {
    console.log('🚀 Initializing FORGE Dashboard');

    this.setupEventListeners();
    this.connectEventSource();
    this.loadInitialData();

    // Set up auto-refresh
    setInterval(() => this.refreshData(), 30000);
  }

  setupEventListeners() {
    // Create cycle form
    const createCycleForm = document.getElementById('create-cycle-form');
    if (createCycleForm) {
      createCycleForm.addEventListener('submit', (e) => this.handleCreateCycle(e));
    }

    // Invoke agent form
    const invokeAgentForm = document.getElementById('invoke-agent-form');
    if (invokeAgentForm) {
      invokeAgentForm.addEventListener('submit', (e) => this.handleInvokeAgent(e));
    }

    // Modal close on background click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  connectEventSource() {
    try {
      this.eventSource = new EventSource('/mcp');

      this.eventSource.onopen = () => {
        console.log('✅ Connected to FORGE MCP Server');
        this.updateConnectionStatus(true);
        this.currentReconnectDelay = this.reconnectDelay;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      this.eventSource.onerror = () => {
        console.warn('❌ Connection lost, attempting to reconnect...');
        this.updateConnectionStatus(false);
        this.eventSource.close();
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('Error connecting to event source:', error);
      this.updateConnectionStatus(false);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    setTimeout(() => {
      this.connectEventSource();
      this.currentReconnectDelay = Math.min(
        this.currentReconnectDelay * 2,
        this.maxReconnectDelay
      );
    }, this.currentReconnectDelay);
  }

  handleEvent(data) {
    if (data.type === 'dashboard-event') {
      this.handleDashboardEvent(data.data);
    } else if (data.type === 'connected') {
      this.addActivity('System', 'Connected to FORGE MCP Server');
    }
  }

  handleDashboardEvent(event) {
    console.log('📡 Dashboard event:', event.type, event.data);

    switch (event.type) {
    case 'cycle-created':
      this.addActivity('Cycle', `New cycle created: ${event.data.feature}`);
      this.refreshCycles();
      break;

    case 'phase-advanced':
      this.addActivity('Phase', `${event.data.cycleId}: ${event.data.fromPhase} → ${event.data.toPhase}`);
      this.refreshCycles();
      break;

    case 'agent-invoked': {
      const invokeType = event.data.isAutoInvoked ? 'Auto-invoked' : 'Manually invoked';
      this.addActivity('Agent', `${invokeType} ${event.data.agentType} agent`);
      this.refreshAgents();
      break;
    }

    case 'task-completed':
      this.addActivity('Task', `Completed: ${event.data.task}`);
      this.refreshCycles();
      break;

    case 'llm-delegated':
      this.addActivity('LLM', `Delegated ${event.data.taskType} to ${event.data.model}`);
      break;

    case 'test-event':
      this.addActivity('Test', event.data.message);
      break;
    }
  }

  async loadInitialData() {
    this.showLoading(true);

    try {
      await Promise.all([
        this.refreshStatus(),
        this.refreshCycles(),
        this.refreshAgents(),
        this.refreshConfig()
      ]);

      this.addActivity('System', 'Dashboard data loaded');
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.addActivity('Error', 'Failed to load dashboard data');
    } finally {
      this.showLoading(false);
    }
  }

  async refreshData() {
    try {
      await Promise.all([
        this.refreshStatus(),
        this.refreshCycles(),
        this.refreshAgents()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  async refreshStatus() {
    try {
      const response = await fetch('/api/status');
      this.data.status = await response.json();
      this.updateStatusDisplay();
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }

  async refreshCycles() {
    try {
      const response = await fetch('/api/cycles');
      this.data.cycles = await response.json();
      this.updateCyclesDisplay();
      this.updateCycleOptions();
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  }

  async refreshAgents() {
    try {
      const response = await fetch('/api/agents');
      this.data.agents = await response.json();
      this.updateAgentsDisplay();
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }

  async refreshConfig() {
    try {
      const response = await fetch('/api/config');
      this.data.config = await response.json();
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  }

  updateConnectionStatus(connected) {
    const indicator = document.getElementById('connection-status');
    if (indicator) {
      indicator.className = `status-indicator ${connected ? '' : 'disconnected'}`;
    }
  }

  updateStatusDisplay() {
    const status = this.data.status;
    if (!status) return;

    // Uptime
    const uptimeEl = document.getElementById('uptime');
    if (uptimeEl) {
      const hours = Math.floor(status.uptime / 3600);
      const minutes = Math.floor((status.uptime % 3600) / 60);
      uptimeEl.textContent = `${hours}h ${minutes}m`;
    }

    // Memory
    const memoryEl = document.getElementById('memory');
    if (memoryEl) {
      const memMB = Math.round(status.memory.heapUsed / 1024 / 1024);
      memoryEl.textContent = `${memMB}MB`;
    }

    // Local LLM Status
    const llmStatusEl = document.getElementById('llm-status');
    if (llmStatusEl) {
      if (status.localLLM && status.localLLM.connectionStatus === 'connected') {
        llmStatusEl.textContent = '✅ Connected';
        llmStatusEl.style.color = 'var(--success-color)';
      } else {
        llmStatusEl.textContent = '❌ Offline';
        llmStatusEl.style.color = 'var(--danger-color)';
      }
    }
  }

  updateCyclesDisplay() {
    const cyclesGrid = document.getElementById('cycles-grid');
    if (!cyclesGrid) return;

    const cycles = this.data.cycles;
    const allCycles = [...cycles.active, ...cycles.completed];

    if (allCycles.length === 0) {
      cyclesGrid.innerHTML = '<div class="loading">No development cycles found</div>';
      return;
    }

    cyclesGrid.innerHTML = allCycles.map(cycle => this.createCycleCard(cycle)).join('');
  }

  createCycleCard(cycle) {
    const isActive = cycle.phase !== 'Completed';
    const phaseProgress = cycle.progress || {};
    const currentProgress = phaseProgress[cycle.phase] || 0;

    return `
      <div class="cycle-card ${isActive ? 'active' : 'completed'}">
        <div class="cycle-header">
          <div class="cycle-title">${cycle.feature}</div>
          <div class="cycle-phase">${cycle.phase}</div>
        </div>
        <div class="cycle-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${currentProgress}%"></div>
          </div>
          <small>${currentProgress}% complete</small>
        </div>
        <div class="cycle-actions">
          ${isActive ? `
            <button onclick="dashboard.advancePhase('${cycle.id}')">Advance</button>
            <button onclick="dashboard.showInvokeAgentModal('${cycle.id}')">Invoke Agent</button>
          ` : `
            <button onclick="dashboard.viewCycle('${cycle.id}')">View</button>
          `}
        </div>
      </div>
    `;
  }

  updateAgentsDisplay() {
    const agentsGrid = document.getElementById('agents-grid');
    if (!agentsGrid) return;

    const agents = this.data.agents.agents || [];

    agentsGrid.innerHTML = agents.map(agent => `
      <div class="agent-card ${agent.status}" onclick="dashboard.showInvokeAgentModal('', '${agent.type}')">
        <div class="agent-emoji">${agent.emoji}</div>
        <div class="agent-name">${agent.type}</div>
        <div class="agent-status">${agent.status}</div>
      </div>
    `).join('');
  }

  updateCycleOptions() {
    const cycleSelect = document.getElementById('agent-cycle');
    if (!cycleSelect) return;

    const activeCycles = this.data.cycles.active || [];

    cycleSelect.innerHTML = '<option value="">Select a cycle...</option>' +
      activeCycles.map(cycle =>
        `<option value="${cycle.id}">${cycle.feature}</option>`
      ).join('');
  }

  addActivity(type, message) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;

    const timestamp = new Date().toLocaleTimeString();
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <span class="timestamp">${timestamp}</span>
      <span class="message"><strong>${type}:</strong> ${message}</span>
    `;

    activityList.insertBefore(activityItem, activityList.firstChild);

    // Keep only last 50 items
    while (activityList.children.length > 50) {
      activityList.removeChild(activityList.lastChild);
    }
  }

  async handleCreateCycle(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const cycleData = {
      feature: formData.get('feature'),
      description: formData.get('description'),
      priority: formData.get('priority')
    };

    try {
      this.showLoading(true);

      const response = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cycleData)
      });

      if (response.ok) {
        this.addActivity('Success', `Created cycle: ${cycleData.feature}`);
        hideCreateCycleModal();
        event.target.reset();
        await this.refreshCycles();
      } else {
        throw new Error('Failed to create cycle');
      }
    } catch (error) {
      console.error('Error creating cycle:', error);
      this.addActivity('Error', 'Failed to create cycle');
    } finally {
      this.showLoading(false);
    }
  }

  async handleInvokeAgent(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const agentData = {
      agentType: formData.get('agentType'),
      cycleId: formData.get('cycleId'),
      task: formData.get('task')
    };

    try {
      this.showLoading(true);

      const response = await fetch('/api/agents/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      if (response.ok) {
        this.addActivity('Success', `Invoked ${agentData.agentType} agent`);
        hideInvokeAgentModal();
        event.target.reset();
        await this.refreshAgents();
      } else {
        throw new Error('Failed to invoke agent');
      }
    } catch (error) {
      console.error('Error invoking agent:', error);
      this.addActivity('Error', 'Failed to invoke agent');
    } finally {
      this.showLoading(false);
    }
  }

  async advancePhase(cycleId) {
    try {
      this.showLoading(true);

      // This would need the advance phase API endpoint
      this.addActivity('Info', `Phase advancement for ${cycleId} (feature not implemented)`);
    } catch (error) {
      console.error('Error advancing phase:', error);
      this.addActivity('Error', 'Failed to advance phase');
    } finally {
      this.showLoading(false);
    }
  }

  showInvokeAgentModal(cycleId = '', agentType = '') {
    const modal = document.getElementById('invoke-agent-modal');
    const cycleSelect = document.getElementById('agent-cycle');
    const agentTypeSelect = document.getElementById('agent-type');

    if (cycleId && cycleSelect) {
      cycleSelect.value = cycleId;
    }

    if (agentType && agentTypeSelect) {
      agentTypeSelect.value = agentType;
    }

    if (modal) {
      modal.classList.add('active');
    }
  }

  viewCycle(cycleId) {
    this.addActivity('Info', `Viewing cycle ${cycleId} (feature not implemented)`);
  }

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }
}

// Global functions for HTML onclick handlers
function showCreateCycleModal() {
  const modal = document.getElementById('create-cycle-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

function hideCreateCycleModal() {
  const modal = document.getElementById('create-cycle-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function hideInvokeAgentModal() {
  const modal = document.getElementById('invoke-agent-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new ForgeDashboard();
});