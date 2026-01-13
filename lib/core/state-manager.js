/**
 * FORGE State Manager - File-based state persistence
 * Ported from forge-skill Python implementation
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const PHASES = ['Focus', 'Orchestrate', 'Refine', 'Generate', 'Evaluate'];

const CYCLE_TEMPLATE = `# Cycle: {name}

**Created**: {created}
**Priority**: {priority}
**Status**: Active

## Overview

<!-- Describe what this cycle aims to accomplish -->

---

<!-- FORGE_PHASE:Focus:Active -->
## Phase 1: Focus

**Purpose**: Define what you're building and why.

### Required Outputs
- [ ] Problem statement and target users defined
- [ ] Testable success criteria written
- [ ] System Context diagram (C4 L1) created
- [ ] Clear boundaries on what you WON'T build

### Notes

<!-- Document Focus phase work here -->

---

<!-- FORGE_PHASE:Orchestrate:Pending -->
## Phase 2: Orchestrate

**Purpose**: Break the work into session-sized pieces.

### Required Outputs
- [ ] Container architecture (C4 L2) designed
- [ ] Component architecture (C4 L3) designed
- [ ] Dependency map created
- [ ] Tasks sized for single AI sessions

### Tasks

<!-- List tasks here -->

---

<!-- FORGE_PHASE:Refine:Pending -->
## Phase 3: Refine

**Purpose**: Define exactly what "done" looks like.

### Required Outputs
- [ ] Acceptance criteria in Given-When-Then format
- [ ] Interface specifications documented
- [ ] Edge cases enumerated by category
- [ ] Constraints vs criteria documented

**CRITICAL**: No code in this phase - specifications only.

### Specifications

<!-- Document specifications here -->

---

<!-- FORGE_PHASE:Generate:Pending -->
## Phase 4: Generate

**Purpose**: AI writes code following TDD.

### Process
- [ ] RED: Write failing tests
- [ ] GREEN: Minimal code to pass
- [ ] REFACTOR: Improve while green

### Implementation Notes

<!-- Document implementation progress here -->

---

<!-- FORGE_PHASE:Evaluate:Pending -->
## Phase 5: Evaluate

**Purpose**: Verify output matches intent.

### Checklist
- [ ] Criteria verified line-by-line
- [ ] Edge cases tested
- [ ] Security review completed
- [ ] Integration tested

### Disposition

<!-- Accept / Accept with issues / Revise / Reject -->

---

## Learnings

<!-- Capture learnings during and after the cycle -->
`;

const CONTEXT_TEMPLATE = `# {projectName} - FORGE Context

## Project Overview

<!-- Describe the project purpose and scope -->

## Architecture Decisions

<!-- Document key architectural choices -->

## Vocabulary

<!-- Define project-specific terms -->

## Conventions

<!-- Document coding standards and patterns -->
`;

const LEARNINGS_TEMPLATE = `# FORGE Learnings

Accumulated knowledge from development cycles.

## Patterns

<!-- Successful approaches to reuse -->

## Anti-Patterns

<!-- Approaches to avoid -->

## Decisions

<!-- Key decisions and their rationale -->

## Tools

<!-- Useful tools and techniques -->
`;

class ForgeStateManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.forgeDir = path.join(baseDir, '.forge');
    this.cyclesDir = path.join(this.forgeDir, 'cycles');
    this.activeDir = path.join(this.cyclesDir, 'active');
    this.completedDir = path.join(this.cyclesDir, 'completed');
  }

  async initialize() {
    // Initialize FORGE directory structure
    if (!fs.existsSync(this.forgeDir)) {
      const name = path.basename(this.baseDir);

      // Create directory structure
      fs.mkdirSync(this.activeDir, { recursive: true });
      fs.mkdirSync(this.completedDir, { recursive: true });

      // Create config.yaml
      const config = {
        project: name,
        version: '2.0.0',
        created: new Date().toISOString(),
        phases: PHASES
      };
      fs.writeFileSync(
        path.join(this.forgeDir, 'config.yaml'),
        yaml.dump(config, { flowLevel: -1, sortKeys: false })
      );

      // Create context.md
      const context = CONTEXT_TEMPLATE.replace('{projectName}', name);
      fs.writeFileSync(path.join(this.forgeDir, 'context.md'), context);

      // Create learnings.md
      fs.writeFileSync(path.join(this.forgeDir, 'learnings.md'), LEARNINGS_TEMPLATE);

      return { initialized: true, existing: false };
    }
    return { initialized: true, existing: true };
  }

  isInitialized() {
    return fs.existsSync(this.forgeDir);
  }

  /**
   * Cleanup method for tests
   */
  async cleanup() {
    // No-op for now - cleanup is handled by test harness
    return;
  }

  /**
   * Initialize FORGE in the project directory (sync version)
   */
  initProject(projectName = null) {
    if (this.isInitialized()) {
      return { success: false, message: 'FORGE already initialized' };
    }

    const name = projectName || path.basename(this.baseDir);

    // Create directory structure
    fs.mkdirSync(this.activeDir, { recursive: true });
    fs.mkdirSync(this.completedDir, { recursive: true });

    // Create config.yaml
    const config = {
      project: name,
      version: '2.0.0',
      created: new Date().toISOString(),
      phases: PHASES
    };
    fs.writeFileSync(
      path.join(this.forgeDir, 'config.yaml'),
      yaml.dump(config, { flowLevel: -1, sortKeys: false })
    );

    // Create context.md
    const context = CONTEXT_TEMPLATE.replace('{projectName}', name);
    fs.writeFileSync(path.join(this.forgeDir, 'context.md'), context);

    // Create learnings.md
    fs.writeFileSync(path.join(this.forgeDir, 'learnings.md'), LEARNINGS_TEMPLATE);

    return {
      success: true,
      message: `FORGE initialized at ${this.forgeDir}`,
      files: ['config.yaml', 'context.md', 'learnings.md', 'cycles/']
    };
  }

  /**
   * Get project configuration
   */
  getConfig() {
    const configPath = path.join(this.forgeDir, 'config.yaml');
    if (!fs.existsSync(configPath)) {
      return null;
    }
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Get context document
   */
  getContext() {
    const contextPath = path.join(this.forgeDir, 'context.md');
    if (!fs.existsSync(contextPath)) {
      return null;
    }
    return fs.readFileSync(contextPath, 'utf8');
  }

  /**
   * Get learnings document
   */
  getLearnings() {
    const learningsPath = path.join(this.forgeDir, 'learnings.md');
    if (!fs.existsSync(learningsPath)) {
      return null;
    }
    return fs.readFileSync(learningsPath, 'utf8');
  }

  /**
   * Slugify a name for filename use
   */
  slugify(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Create a new development cycle (async version for tests)
   */
  async createCycle(featureName, options = {}) {
    const priority = options.priority || 'medium';
    const result = this.newCycle(featureName, priority);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      id: featureName,
      feature: featureName,
      priority: priority,
      cycleId: result.cycleId,
      path: result.path
    };
  }

  /**
   * Get all cycles (async version for tests)
   */
  async getCycles() {
    return this.listCycles();
  }

  /**
   * Create a new development cycle (sync version)
   */
  newCycle(name, priority = 'medium') {
    if (!this.isInitialized()) {
      return { success: false, message: 'FORGE not initialized' };
    }

    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const slug = this.slugify(name);
    const cycleId = `${datePrefix}-${slug}`;
    const filename = `${cycleId}.md`;
    const cyclePath = path.join(this.activeDir, filename);

    if (fs.existsSync(cyclePath)) {
      return { success: false, message: `Cycle already exists: ${cycleId}` };
    }

    const content = CYCLE_TEMPLATE
      .replace('{name}', name)
      .replace('{created}', now.toISOString())
      .replace('{priority}', priority);

    fs.writeFileSync(cyclePath, content);

    return {
      success: true,
      cycleId,
      path: cyclePath,
      message: `Created cycle: ${cycleId}`,
      nextSteps: [
        'Define problem statement and target users',
        'Write testable success criteria',
        'Create C4 L1 System Context diagram',
        'Set clear boundaries'
      ]
    };
  }

  /**
   * List all cycles
   */
  listCycles() {
    const result = { active: [], completed: [] };

    if (fs.existsSync(this.activeDir)) {
      const files = fs.readdirSync(this.activeDir)
        .filter(f => f.endsWith('.md'))
        .sort();

      for (const file of files) {
        const cyclePath = path.join(this.activeDir, file);
        const content = fs.readFileSync(cyclePath, 'utf8');
        const activePhase = this.getActivePhase(content);
        result.active.push({
          id: path.basename(file, '.md'),
          phase: activePhase,
          path: cyclePath
        });
      }
    }

    if (fs.existsSync(this.completedDir)) {
      const files = fs.readdirSync(this.completedDir)
        .filter(f => f.endsWith('.md'))
        .sort();

      for (const file of files) {
        result.completed.push({
          id: path.basename(file, '.md'),
          path: path.join(this.completedDir, file)
        });
      }
    }

    return result;
  }

  /**
   * Get the active phase from cycle content
   */
  getActivePhase(content) {
    const match = content.match(/<!-- FORGE_PHASE:(\w+):Active -->/);
    return match ? match[1] : 'Unknown';
  }

  /**
   * Parse a cycle file and extract status
   */
  parseCycle(cyclePath) {
    const content = fs.readFileSync(cyclePath, 'utf8');
    const cycleId = path.basename(cyclePath, '.md');

    const phases = {};
    let activePhase = null;

    for (const phaseName of PHASES) {
      // Find phase marker
      const markerPattern = new RegExp(`<!-- FORGE_PHASE:${phaseName}:(\\w+) -->`);
      const markerMatch = content.match(markerPattern);

      let state = 'Pending';
      if (markerMatch) {
        state = markerMatch[1];
        if (state === 'Active') {
          activePhase = phaseName;
        }
      }

      // Find phase section and extract checkboxes
      const sectionPattern = new RegExp(
        `## Phase \\d+: ${phaseName}[\\s\\S]*?(?=## Phase \\d+:|---\\s*$|$)`
      );
      const sectionMatch = content.match(sectionPattern);

      const items = [];
      if (sectionMatch) {
        const section = sectionMatch[0];
        const checkboxPattern = /- \[([ xX])\] (.+?)(?:\n|$)/g;
        let match;
        while ((match = checkboxPattern.exec(section)) !== null) {
          const completed = match[1].toLowerCase() === 'x';
          const text = match[2].trim();
          items.push({ completed, text });
        }
      }

      const totalItems = items.length;
      const completedItems = items.filter(i => i.completed).length;

      phases[phaseName] = {
        name: phaseName,
        state,
        totalItems,
        completedItems,
        items,
        progress: totalItems > 0 ? (completedItems / totalItems) * 100 : 0
      };
    }

    return {
      cycleId,
      path: cyclePath,
      activePhase: activePhase || 'Focus',
      phases
    };
  }

  /**
   * Get the most recent active cycle
   */
  getActiveCycle() {
    if (!fs.existsSync(this.activeDir)) {
      return null;
    }

    const files = fs.readdirSync(this.activeDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return null;
    }

    return path.join(this.activeDir, files[0]);
  }

  /**
   * Validate current phase requirements
   */
  validatePhase(cycleId = null) {
    let cyclePath;
    if (cycleId) {
      cyclePath = path.join(this.activeDir, `${cycleId}.md`);
      if (!fs.existsSync(cyclePath)) {
        // Try partial match
        const files = fs.readdirSync(this.activeDir)
          .filter(f => f.includes(cycleId));
        if (files.length > 0) {
          cyclePath = path.join(this.activeDir, files[0]);
        } else {
          return { success: false, message: `Cycle not found: ${cycleId}` };
        }
      }
    } else {
      cyclePath = this.getActiveCycle();
      if (!cyclePath) {
        return { success: false, message: 'No active cycle found' };
      }
    }

    const cycle = this.parseCycle(cyclePath);
    const phase = cycle.phases[cycle.activePhase];

    const incomplete = phase.items
      .filter(item => !item.completed)
      .map(item => item.text);

    const canAdvance = incomplete.length === 0;

    let nextPhase = null;
    if (cycle.activePhase !== 'Evaluate') {
      const currentIdx = PHASES.indexOf(cycle.activePhase);
      nextPhase = PHASES[currentIdx + 1];
    }

    return {
      success: true,
      cycleId: cycle.cycleId,
      currentPhase: cycle.activePhase,
      canAdvance,
      incomplete,
      nextPhase
    };
  }

  /**
   * Get status of all active cycles
   */
  getStatus() {
    if (!this.isInitialized()) {
      return { success: false, message: 'FORGE not initialized' };
    }

    const cycles = [];
    if (fs.existsSync(this.activeDir)) {
      const files = fs.readdirSync(this.activeDir)
        .filter(f => f.endsWith('.md'))
        .sort();

      for (const file of files) {
        const cyclePath = path.join(this.activeDir, file);
        cycles.push(this.parseCycle(cyclePath));
      }
    }

    return { success: true, cycles };
  }

  /**
   * Advance to the next phase
   */
  advancePhase(cycleId = null, force = false) {
    let cyclePath;
    if (cycleId) {
      cyclePath = path.join(this.activeDir, `${cycleId}.md`);
      if (!fs.existsSync(cyclePath)) {
        const files = fs.readdirSync(this.activeDir)
          .filter(f => f.includes(cycleId));
        if (files.length > 0) {
          cyclePath = path.join(this.activeDir, files[0]);
        } else {
          return { success: false, message: `Cycle not found: ${cycleId}` };
        }
      }
    } else {
      cyclePath = this.getActiveCycle();
      if (!cyclePath) {
        return { success: false, message: 'No active cycle found' };
      }
    }

    let content = fs.readFileSync(cyclePath, 'utf8');
    const currentPhase = this.getActivePhase(content);

    if (currentPhase === 'Evaluate') {
      return {
        success: false,
        message: 'Already at final phase (Evaluate). Complete the cycle instead.'
      };
    }

    // Validate if not forcing
    if (!force) {
      const validation = this.validatePhase();
      if (!validation.canAdvance) {
        return {
          success: false,
          message: `Cannot advance: ${validation.incomplete.length} incomplete items`,
          incomplete: validation.incomplete
        };
      }
    }

    const currentIdx = PHASES.indexOf(currentPhase);
    const nextPhase = PHASES[currentIdx + 1];

    // Update phase markers
    content = content.replace(
      new RegExp(`(<!-- FORGE_PHASE:${currentPhase}:)\\w+(-->)`),
      '$1Complete$2'
    );
    content = content.replace(
      new RegExp(`(<!-- FORGE_PHASE:${nextPhase}:)\\w+(-->)`),
      '$1Active$2'
    );

    fs.writeFileSync(cyclePath, content);

    const guidance = {
      Orchestrate: [
        'Design Container architecture (C4 L2)',
        'Design Component architecture (C4 L3)',
        'Create dependency map',
        'Break into session-sized tasks'
      ],
      Refine: [
        'Write Given-When-Then acceptance criteria',
        'Document interface specifications',
        'Enumerate edge cases by category',
        'Remember: NO CODE in this phase'
      ],
      Generate: [
        'Follow TDD: RED -> GREEN -> REFACTOR',
        'One task per session',
        'Write failing tests first',
        'Minimum 80% coverage'
      ],
      Evaluate: [
        'Verify against acceptance criteria',
        'Test edge cases',
        'Complete security review',
        'Make disposition decision'
      ]
    };

    return {
      success: true,
      previousPhase: currentPhase,
      currentPhase: nextPhase,
      message: `Advanced: ${currentPhase} -> ${nextPhase}`,
      guidance: guidance[nextPhase] || []
    };
  }

  /**
   * Complete a task in the current phase
   */
  completeTask(description, cycleId = null) {
    let cyclePath;
    if (cycleId) {
      cyclePath = path.join(this.activeDir, `${cycleId}.md`);
      if (!fs.existsSync(cyclePath)) {
        const files = fs.readdirSync(this.activeDir)
          .filter(f => f.includes(cycleId));
        if (files.length > 0) {
          cyclePath = path.join(this.activeDir, files[0]);
        } else {
          return { success: false, message: `Cycle not found: ${cycleId}` };
        }
      }
    } else {
      cyclePath = this.getActiveCycle();
      if (!cyclePath) {
        return { success: false, message: 'No active cycle found' };
      }
    }

    let content = fs.readFileSync(cyclePath, 'utf8');
    const currentPhase = this.getActivePhase(content);

    // Try partial match first
    const partialDesc = description.slice(0, 20);
    const partialPattern = new RegExp(
      `- \\[ \\] ([^\\n]*${partialDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*)`,
      'i'
    );
    const partialMatch = content.match(partialPattern);

    if (partialMatch) {
      const oldText = partialMatch[0];
      const newText = oldText.replace('- [ ]', '- [x]');
      content = content.replace(oldText, newText);
      fs.writeFileSync(cyclePath, content);
      return {
        success: true,
        message: `Completed: ${partialMatch[1]}`
      };
    }

    // Try exact match
    const exactPattern = new RegExp(
      `- \\[ \\] ${description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    );
    if (exactPattern.test(content)) {
      content = content.replace(exactPattern, `- [x] ${description}`);
      fs.writeFileSync(cyclePath, content);
      return {
        success: true,
        message: `Completed: ${description}`
      };
    }

    // Not found - list available tasks
    const cycle = this.parseCycle(cyclePath);
    const availableTasks = cycle.phases[currentPhase].items
      .filter(item => !item.completed)
      .map(item => item.text);

    return {
      success: false,
      message: `Task not found: ${description}`,
      availableTasks
    };
  }

  /**
   * Add a task to the current phase
   */
  addTask(description, cycleId = null) {
    let cyclePath;
    if (cycleId) {
      cyclePath = path.join(this.activeDir, `${cycleId}.md`);
      if (!fs.existsSync(cyclePath)) {
        return { success: false, message: `Cycle not found: ${cycleId}` };
      }
    } else {
      cyclePath = this.getActiveCycle();
      if (!cyclePath) {
        return { success: false, message: 'No active cycle found' };
      }
    }

    let content = fs.readFileSync(cyclePath, 'utf8');
    const currentPhase = this.getActivePhase(content);

    // Find the phase section
    const sectionPattern = new RegExp(
      `(## Phase \\d+: ${currentPhase}[\\s\\S]*?)((?=## Phase \\d+:)|(?=---\\s*$)|$)`
    );
    const match = content.match(sectionPattern);

    if (!match) {
      return { success: false, message: `Could not find ${currentPhase} section` };
    }

    const section = match[1];
    const newTask = `- [ ] ${description}\n`;

    // Find last checkbox in section
    const checkboxMatches = [...section.matchAll(/- \[[ xX]\] .+\n/g)];

    if (checkboxMatches.length > 0) {
      const lastMatch = checkboxMatches[checkboxMatches.length - 1];
      const insertPos = match.index + lastMatch.index + lastMatch[0].length;
      content = content.slice(0, insertPos) + newTask + content.slice(insertPos);
    } else {
      // Find ### section header
      const notesMatch = section.match(/### \w+\n\n/);
      if (notesMatch) {
        const insertPos = match.index + notesMatch.index + notesMatch[0].length;
        content = content.slice(0, insertPos) + newTask + content.slice(insertPos);
      } else {
        return { success: false, message: 'Could not find insertion point' };
      }
    }

    fs.writeFileSync(cyclePath, content);
    return {
      success: true,
      message: `Added task: ${description}`
    };
  }

  /**
   * Complete and archive a cycle
   */
  completeCycle(cycleId) {
    if (!this.isInitialized()) {
      return { success: false, message: 'FORGE not initialized' };
    }

    // Find the cycle
    let cyclePath = null;
    const files = fs.readdirSync(this.activeDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      if (file.includes(cycleId)) {
        cyclePath = path.join(this.activeDir, file);
        break;
      }
    }

    if (!cyclePath) {
      return {
        success: false,
        message: `Cycle not found: ${cycleId}`,
        available: files.map(f => path.basename(f, '.md'))
      };
    }

    // Check if in Evaluate phase
    const content = fs.readFileSync(cyclePath, 'utf8');
    const activePhase = this.getActivePhase(content);

    if (activePhase !== 'Evaluate') {
      return {
        success: false,
        message: `Cycle is in ${activePhase} phase, not Evaluate. Complete all phases first.`
      };
    }

    // Move to completed
    const destPath = path.join(this.completedDir, path.basename(cyclePath));
    fs.renameSync(cyclePath, destPath);

    return {
      success: true,
      message: `Completed cycle: ${path.basename(cyclePath, '.md')}`,
      archivedTo: destPath
    };
  }

  /**
   * Add a learning to the knowledge base
   */
  addLearning(category, title, description, context = '') {
    if (!this.isInitialized()) {
      throw new Error('FORGE not initialized');
    }

    // Map categories to sections (flexible mapping)
    const sectionMap = {
      'pattern': '## Patterns',
      'anti-pattern': '## Anti-Patterns',
      'decision': '## Decisions',
      'tool': '## Tools',
      'success': '## Patterns',  // Map success to patterns
      'error': '## Anti-Patterns',  // Map error to anti-patterns
      'insight': '## Decisions'  // Map insight to decisions
    };

    // Default to Patterns if unknown category
    const section = sectionMap[category] || '## Patterns';

    const learningsPath = path.join(this.forgeDir, 'learnings.md');
    let content = fs.readFileSync(learningsPath, 'utf8');

    const timestamp = new Date().toISOString().slice(0, 10);
    let entry = `\n### ${title}\n`;
    entry += `*Added: ${timestamp}*\n\n`;
    entry += `${description}\n`;
    if (context) {
      entry += `\n**Context**: ${context}\n`;
    }

    const sectionPos = content.indexOf(section);

    if (sectionPos === -1) {
      content += `\n${section}\n${entry}`;
    } else {
      const nextSection = content.indexOf('\n## ', sectionPos + section.length);
      if (nextSection === -1) {
        content += entry;
      } else {
        content = content.slice(0, nextSection) + entry + content.slice(nextSection);
      }
    }

    fs.writeFileSync(learningsPath, content);

    // Return object with title for test compatibility
    return {
      success: true,
      title: title,
      message: `Added learning: ${title}`,
      category
    };
  }

  /**
   * Start a retrospective
   */
  runRetrospective(cycleId = null) {
    if (!this.isInitialized()) {
      return { success: false, message: 'FORGE not initialized' };
    }

    // Find cycle if not specified
    if (!cycleId) {
      const allCycles = [
        ...fs.readdirSync(this.activeDir).filter(f => f.endsWith('.md')),
        ...fs.readdirSync(this.completedDir).filter(f => f.endsWith('.md'))
      ].sort().reverse();

      if (allCycles.length === 0) {
        return { success: false, message: 'No cycles found' };
      }

      cycleId = path.basename(allCycles[0], '.md');
    }

    const learningsPath = path.join(this.forgeDir, 'learnings.md');
    let content = fs.readFileSync(learningsPath, 'utf8');

    const date = new Date().toISOString().slice(0, 10);
    const retroContent = `## Retrospective: ${date}

### Cycle: ${cycleId}

### What Went Well
-

### What Could Be Improved
-

### Action Items
- [ ]

### Key Learnings
-

---

`;

    const retroSection = '## Retrospectives';
    if (!content.includes(retroSection)) {
      content += `\n${retroSection}\n`;
    }

    const sectionPos = content.indexOf(retroSection);
    const insertPos = sectionPos + retroSection.length + 1;
    content = content.slice(0, insertPos) + retroContent + content.slice(insertPos);

    fs.writeFileSync(learningsPath, content);

    return {
      success: true,
      message: `Started retrospective for: ${cycleId}`,
      prompts: [
        'What went well?',
        'What could be improved?',
        'What action items should we capture?',
        'What key learnings should we remember?'
      ]
    };
  }

  /**
   * Read a specific cycle file
   */
  getCycle(cycleId) {
    // Check active cycles
    let cyclePath = path.join(this.activeDir, `${cycleId}.md`);
    if (fs.existsSync(cyclePath)) {
      return {
        success: true,
        content: fs.readFileSync(cyclePath, 'utf8'),
        status: 'active',
        path: cyclePath
      };
    }

    // Check completed cycles
    cyclePath = path.join(this.completedDir, `${cycleId}.md`);
    if (fs.existsSync(cyclePath)) {
      return {
        success: true,
        content: fs.readFileSync(cyclePath, 'utf8'),
        status: 'completed',
        path: cyclePath
      };
    }

    // Try partial match
    const allFiles = [
      ...fs.readdirSync(this.activeDir).map(f => ({ f, dir: this.activeDir, status: 'active' })),
      ...fs.readdirSync(this.completedDir).map(f => ({ f, dir: this.completedDir, status: 'completed' }))
    ];

    for (const { f, dir, status } of allFiles) {
      if (f.includes(cycleId)) {
        cyclePath = path.join(dir, f);
        return {
          success: true,
          content: fs.readFileSync(cyclePath, 'utf8'),
          status,
          path: cyclePath
        };
      }
    }

    return { success: false, message: `Cycle not found: ${cycleId}` };
  }
}

module.exports = { ForgeStateManager, PHASES, CYCLE_TEMPLATE };
