/**
 * Command Safety Validator
 * Protects against destructive system operations by requiring human approval
 */

class CommandSafety {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.strictMode = options.strictMode !== false; // Default to strict

    // Destructive command patterns
    this.destructivePatterns = [
      // File deletion (order matters - most specific first)
      { pattern: /\brm\b.*-[a-z]*[rf][rf]+/i, severity: 'critical', description: 'Recursive file deletion' },
      { pattern: /\brm\b.*\*/, severity: 'high', description: 'Wildcard file deletion' },
      { pattern: /\brm\b.*-r\b/, severity: 'high', description: 'Directory deletion' },
      { pattern: /\brm\b.*\//, severity: 'high', description: 'Directory deletion' },
      { pattern: /\brm\b/, severity: 'medium', description: 'File deletion' },

      // Dangerous operations
      { pattern: /\bmv\b.*\/dev\/null/, severity: 'high', description: 'Moving files to /dev/null' },
      { pattern: /\bchmod\b.*777/, severity: 'medium', description: 'Setting world-writable permissions' },
      { pattern: /\bchown\b.*root/, severity: 'high', description: 'Changing ownership to root' },

      // Data overwriting
      { pattern: />\s*\/dev\//, severity: 'critical', description: 'Writing to device files' },
      { pattern: /\bdd\b.*if=/, severity: 'critical', description: 'Direct disk operations' },
      { pattern: /\bmkfs\b/, severity: 'critical', description: 'Filesystem creation (destroys data)' },

      // System modification
      { pattern: /\bsudo\b.*rm/, severity: 'critical', description: 'Elevated file deletion' },
      { pattern: /\bsudo\b.*reboot/, severity: 'medium', description: 'System reboot' },
      { pattern: /\bsudo\b.*shutdown/, severity: 'high', description: 'System shutdown' },
      { pattern: /\bkill\b.*-9/, severity: 'medium', description: 'Force killing processes' },
      { pattern: /\bkillall\b/, severity: 'medium', description: 'Killing multiple processes' },

      // Package/dependency operations
      { pattern: /\bnpm\b.*uninstall/, severity: 'low', description: 'Removing npm packages' },
      { pattern: /\bpip\b.*uninstall/, severity: 'low', description: 'Removing Python packages' },
      { pattern: /\bapt-get\b.*remove/, severity: 'medium', description: 'Removing system packages' },
      { pattern: /\bbrew\b.*uninstall/, severity: 'low', description: 'Removing Homebrew packages' },

      // Git operations (order matters - most specific first)
      { pattern: /\bgit\b.*push.*--force/, severity: 'critical', description: 'Force push (rewrites history)' },
      { pattern: /\bgit\b.*--force/, severity: 'high', description: 'Forced git operation' },
      { pattern: /\bgit\b.*reset.*--hard/, severity: 'high', description: 'Hard reset (loses changes)' },
      { pattern: /\bgit\b.*clean.*-[fd]+/, severity: 'high', description: 'Cleaning untracked files' },
      { pattern: /\bgit\b.*branch.*-D/, severity: 'medium', description: 'Force deleting git branch' },

      // Docker operations
      { pattern: /\bdocker\b.*rm.*-f/, severity: 'medium', description: 'Force removing containers' },
      { pattern: /\bdocker\b.*system.*prune/, severity: 'high', description: 'Pruning Docker system' },
      { pattern: /\bdocker\b.*volume.*rm/, severity: 'high', description: 'Removing Docker volumes' },

      // Database operations
      { pattern: /DROP\s+DATABASE/i, severity: 'critical', description: 'Dropping database' },
      { pattern: /DROP\s+TABLE/i, severity: 'high', description: 'Dropping database table' },
      { pattern: /TRUNCATE/i, severity: 'high', description: 'Truncating table data' },
      { pattern: /DELETE\s+FROM.*WHERE/i, severity: 'medium', description: 'Deleting database rows' },

      // Additional wildcard dangers
      { pattern: /\*.*\|.*rm/, severity: 'critical', description: 'Wildcard piped to rm' },
      { pattern: /chmod.*\*/, severity: 'medium', description: 'Changing permissions with wildcards' }
    ];

    // Safe command prefixes (always allowed)
    this.safeCommands = [
      'ls', 'cat', 'echo', 'pwd', 'cd', 'which', 'whereis',
      'git status', 'git log', 'git diff',
      'npm list', 'npm ls', 'npm outdated',
      'docker ps', 'docker images', 'docker inspect',
      'grep', 'find', 'head', 'tail', 'wc', 'sort', 'uniq'
    ];
  }

  /**
   * Validate command safety before execution
   * @param {string} command - Command to validate
   * @returns {Object} Validation result
   */
  validateCommand(command) {
    // Check if command is in safe list
    if (this.isSafeCommand(command)) {
      return {
        safe: true,
        severity: 'none',
        description: 'Safe read-only command'
      };
    }

    // Check for destructive patterns
    for (const { pattern, severity, description } of this.destructivePatterns) {
      if (pattern.test(command)) {
        return {
          safe: false,
          severity,
          description,
          pattern: pattern.source,
          requiresConfirmation: true
        };
      }
    }

    // Check for suspicious combinations
    const suspiciousIndicators = [
      command.includes('sudo') && command.includes('rm'),
      command.includes('*') && (command.includes('rm') || command.includes('mv')),
      command.includes('>/dev/') || command.includes('2>/dev/'),
      command.match(/\|\s*sh/) || command.match(/\|\s*bash/),
      command.includes('curl') && command.includes('| sh')
    ];

    if (suspiciousIndicators.some(Boolean)) {
      return {
        safe: false,
        severity: 'high',
        description: 'Suspicious command combination',
        requiresConfirmation: true
      };
    }

    // Command appears safe
    return {
      safe: true,
      severity: 'none',
      description: 'No destructive patterns detected'
    };
  }

  /**
   * Check if command is in the safe list
   */
  isSafeCommand(command) {
    const trimmed = command.trim().toLowerCase();
    return this.safeCommands.some(safe => trimmed.startsWith(safe.toLowerCase()));
  }

  /**
   * Generate human-readable confirmation prompt
   * @param {string} command - Command requiring confirmation
   * @param {Object} validation - Validation result
   * @returns {string} Confirmation prompt
   */
  generateConfirmationPrompt(command, validation) {
    const severityEmoji = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '⚠️',
      'low': '💡'
    };

    const emoji = severityEmoji[validation.severity] || '⚠️';

    let prompt = `${emoji} **DESTRUCTIVE COMMAND DETECTED - HUMAN APPROVAL REQUIRED**\n\n`;
    prompt += `**Command**: \`${command}\`\n`;
    prompt += `**Risk Level**: ${validation.severity.toUpperCase()}\n`;
    prompt += `**Reason**: ${validation.description}\n\n`;

    prompt += '**⚠️  WARNING: This command could:**\n';

    switch (validation.severity) {
    case 'critical':
      prompt += '• Permanently destroy data\n';
      prompt += '• Cause system instability\n';
      prompt += '• Require system recovery\n';
      prompt += '• Impact other users/services\n';
      break;
    case 'high':
      prompt += '• Delete files or directories\n';
      prompt += '• Lose uncommitted changes\n';
      prompt += '• Require manual recovery\n';
      break;
    case 'medium':
      prompt += '• Modify system state\n';
      prompt += '• Affect running services\n';
      prompt += '• Require careful review\n';
      break;
    case 'low':
      prompt += '• Remove installed dependencies\n';
      prompt += '• Require reinstallation\n';
      break;
    }

    prompt += '\n**📋 BEFORE PROCEEDING:**\n';
    prompt += '1. Verify you understand what this command does\n';
    prompt += '2. Ensure you have backups of important data\n';
    prompt += '3. Check if there\'s a safer alternative\n';
    prompt += '4. Consider the impact on your project\n\n';

    if (validation.severity === 'critical' || validation.severity === 'high') {
      prompt += '**🛡️  SAFER ALTERNATIVES:**\n';
      prompt += this.getSaferAlternatives(command) + '\n\n';
    }

    prompt += '**🔒 TO PROCEED:**\n';
    prompt += 'You must explicitly approve this command.\n';
    prompt += 'The command will NOT be executed automatically.\n\n';

    prompt += '**✅ TO APPROVE:**\n';
    prompt += 'Respond with your explicit approval and I will ask for final confirmation.\n\n';

    prompt += '**🚫 TO CANCEL:**\n';
    prompt += 'Request a different approach or safer alternative.';

    return prompt;
  }

  /**
   * Suggest safer alternatives for destructive commands
   */
  getSaferAlternatives(command) {
    const alternatives = [];

    if (command.match(/\brm\b.*-rf/)) {
      alternatives.push('• Use `git clean -n` to preview what would be deleted first');
      alternatives.push('• Move to trash/archive instead of permanent deletion');
      alternatives.push('• Delete specific files individually rather than recursively');
    }

    if (command.includes('git push --force')) {
      alternatives.push('• Use `git push --force-with-lease` for safer force push');
      alternatives.push('• Create a new branch instead of rewriting history');
      alternatives.push('• Use `git revert` instead of rewriting commits');
    }

    if (command.match(/\bgit\b.*reset.*--hard/)) {
      alternatives.push('• Use `git stash` to save changes first');
      alternatives.push('• Use `git reset --soft` to keep changes staged');
      alternatives.push('• Create a backup branch before resetting');
    }

    if (command.includes('DROP')) {
      alternatives.push('• Create a backup/export first');
      alternatives.push('• Use a transaction that can be rolled back');
      alternatives.push('• Test on a dev database first');
    }

    if (alternatives.length === 0) {
      alternatives.push('• Review the command carefully');
      alternatives.push('• Test on a copy or dev environment first');
      alternatives.push('• Ensure you have backups');
    }

    return alternatives.join('\n');
  }

  /**
   * Log command execution for audit trail
   */
  logCommand(command, validation, approved = false) {
    this.logger.info('Command Safety Check:', {
      command,
      severity: validation.severity,
      description: validation.description,
      approved,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { CommandSafety };
