#!/usr/bin/env node

/**
 * FORGE Status Line for Claude Code
 * Displays current FORGE cycle status in the Claude Code status line
 *
 * Output format: "🔵 FORGE: [cycle-name] Phase 🎯 | priority | progress%"
 * Updates every 300ms during active conversation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  purple: '\x1b[35m',
  orange: '\x1b[38;5;208m',
  gray: '\x1b[90m'
};

// Phase emojis and colors
const phaseConfig = {
  'Focus': { emoji: '🎯', color: colors.blue, icon: '🔵' },
  'Orchestrate': { emoji: '📝', color: colors.yellow, icon: '🟡' },
  'Refine': { emoji: '🔨', color: colors.green, icon: '🟢' },
  'Generate': { emoji: '🚀', color: colors.purple, icon: '🟣' },
  'Evaluate': { emoji: '📊', color: colors.orange, icon: '🟠' }
};

/**
 * Read and parse session context from stdin
 */
async function readSessionContext() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

/**
 * Find active FORGE cycles in the current working directory
 */
function findActiveCycles(cwd) {
  const activeCyclesDir = path.join(cwd, '.forge', 'cycles', 'active');

  try {
    if (!fs.existsSync(activeCyclesDir)) {
      return [];
    }

    const files = fs.readdirSync(activeCyclesDir);
    const cycles = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(activeCyclesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const cycleData = parseCycleFile(content, file);
        if (cycleData) {
          cycles.push(cycleData);
        }
      }
    }

    return cycles;
  } catch (error) {
    return [];
  }
}

/**
 * Parse cycle markdown file to extract metadata
 */
function parseCycleFile(content, filename) {
  try {
    // Extract front matter or parse content
    const lines = content.split('\n');
    const data = {
      name: '',
      phase: 'Focus',
      priority: 'medium',
      progress: 0
    };

    // Look for phase indicators
    for (const line of lines) {
      // Try to find phase from headers or content
      if (line.includes('**Phase**:')) {
        const match = line.match(/\*\*Phase\*\*:\s*(\w+)/);
        if (match) data.phase = match[1];
      }
      if (line.includes('**Priority**:')) {
        const match = line.match(/\*\*Priority\*\*:\s*(\w+)/);
        if (match) data.priority = match[1];
      }
      // Extract progress from progress bars
      if (line.includes('█') && line.includes('%')) {
        const match = line.match(/(\d+)%/);
        if (match) data.progress = parseInt(match[1]);
      }
      // Get cycle name from first # header
      if (!data.name && line.startsWith('# ')) {
        data.name = line.replace('# ', '').trim();
      }
    }

    // If no name found, use filename
    if (!data.name) {
      data.name = filename.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Format status line output
 */
function formatStatusLine(cycles) {
  if (cycles.length === 0) {
    return `${colors.gray}⭕ FORGE: Ready${colors.reset}`;
  }

  // Show first active cycle (most recent)
  const cycle = cycles[0];
  const phaseInfo = phaseConfig[cycle.phase] || phaseConfig['Focus'];

  // Truncate cycle name if too long
  const maxNameLength = 30;
  let displayName = cycle.name;
  if (displayName.length > maxNameLength) {
    displayName = displayName.substring(0, maxNameLength - 3) + '...';
  }

  // Format: "🔵 FORGE: [name] Phase 🎯 | priority | 0%"
  const parts = [
    `${phaseInfo.icon} ${phaseInfo.color}FORGE${colors.reset}:`,
    `${colors.gray}[${displayName}]${colors.reset}`,
    `${phaseInfo.color}${cycle.phase}${colors.reset} ${phaseInfo.emoji}`,
    `${colors.gray}|${colors.reset}`,
    cycle.priority,
    `${colors.gray}|${colors.reset}`,
    `${cycle.progress}%`
  ];

  return parts.join(' ');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Read session context (contains cwd and other info)
    const context = await readSessionContext();
    const cwd = context.cwd || process.cwd();

    // Find active cycles
    const cycles = findActiveCycles(cwd);

    // Format and output status line
    const statusLine = formatStatusLine(cycles);
    console.log(statusLine);
  } catch (error) {
    // Fallback to simple output on error
    console.log(`${colors.gray}⭕ FORGE${colors.reset}`);
  }
}

main();
