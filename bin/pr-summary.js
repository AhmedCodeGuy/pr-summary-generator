#!/usr/bin/env node
/* eslint-disable no-plusplus */
/* eslint-disable max-lines, max-lines-per-function */

/**
 * PR Summary Generator
 *
 * Analyzes git changes and generates a structured PR summary based on the template.
 * Provides intelligent suggestions based on file changes and commit messages.
 *
 * Usage:
 *   pr-summary [base-branch] [--output file.md] [--config path/to/config.json]
 *
 * Examples:
 *   pr-summary
 *   pr-summary main --output MY_PR.md
 *   pr-summary develop --config .prsummaryrc.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Default configuration
const defaultConfig = {
  baseBranch: 'main',
  outputFile: 'PR_SUMMARY.md',
  templatePath: null,
  guidePath: null,
  excludePatterns: [
    /^\.windsurf\//,
    /^\.cursor\//,
    /^\.vscode\//,
    /^\.idea\//,
    /^node_modules\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
    /^coverage\//,
    /\.log$/,
    /^\.env/,
    /^\.gitignore$/,
    /^package-lock\.json$/,
    /^yarn\.lock$/,
  ],
};

// Load configuration from file
function loadConfig(configPath) {
  const configFiles = [
    configPath,
    '.prsummaryrc.json',
    '.prsummaryrc',
    'prsummary.config.json',
  ].filter(Boolean);

  for (const file of configFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.warn(`${colors.yellow}⚠️  Warning: Could not parse config file ${file}${colors.reset}`);
      }
    }
  }

  return defaultConfig;
}

// Parse command line arguments
const args = process.argv.slice(2);
const configIndex = args.indexOf('--config');
const configPath = configIndex !== -1 && args[configIndex + 1] ? args[configIndex + 1] : null;

const config = loadConfig(configPath);

const baseBranch = args[0] && !args[0].startsWith('--') ? args[0] : config.baseBranch;
const outputIndex = args.indexOf('--output');
const outputFile = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : config.outputFile;

/**
 * Execute git command and return output
 * @param {string} command - Git command to execute
 * @returns {string} Command output
 */
function git(command) {
  try {
    return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

/**
 * Check if we're in a git repository
 * @returns {boolean} True if in git repo
 */
function checkGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    console.error(`${colors.red}❌ Error: Not a git repository${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Detect PR type from commits and file changes
 * @param {string[]} commits - Array of commit messages
 * @param {string[]} files - Array of changed files
 * @returns {{type: string, emoji: string}} PR type and emoji
 */
function detectPRType(commits, files) {
  const commitText = commits.join(' ').toLowerCase();
  const fileText = files.join(' ').toLowerCase();

  // Check for bug fixes
  if (commitText.includes('fix') || commitText.includes('bug') || commitText.includes('resolve')) {
    return { type: 'Fix', emoji: '🐛' };
  }

  // Check for new features
  if (commitText.includes('feat') || commitText.includes('feature') || commitText.includes('add')) {
    return { type: 'Feature', emoji: '✨' };
  }

  // Check for refactoring
  if (commitText.includes('refactor') || commitText.includes('restructure')) {
    return { type: 'Refactor', emoji: '♻️' };
  }

  // Check for documentation
  if (
    commitText.includes('docs') ||
    commitText.includes('documentation') ||
    fileText.includes('.md')
  ) {
    return { type: 'Docs', emoji: '📝' };
  }

  // Check for tests
  if (commitText.includes('test') || fileText.includes('test') || fileText.includes('spec')) {
    return { type: 'Test', emoji: '🧪' };
  }

  // Check for performance improvements
  if (
    commitText.includes('perf') ||
    commitText.includes('performance') ||
    commitText.includes('optimize')
  ) {
    return { type: 'Performance', emoji: '⚡' };
  }

  // Default to chore
  return { type: 'Chore', emoji: '🔧' };
}

/**
 * Categorize files by type, excluding irrelevant files
 * @param {string[]} files - Array of file paths
 * @returns {object} Categorized files object
 */
function categorizeFiles(files) {
  const categories = {
    components: [],
    hooks: [],
    utils: [],
    types: [],
    styles: [],
    tests: [],
    docs: [],
    config: [],
    scripts: [],
    other: [],
  };

  files.forEach((file) => {
    // Skip excluded files
    if (config.excludePatterns.some((pattern) => pattern.test(file))) {
      return;
    }

    if (file.includes('components/') || file.includes('src/components/')) categories.components.push(file);
    else if (file.includes('hooks/') || file.includes('src/hooks/')) categories.hooks.push(file);
    else if (file.includes('utils/') || file.includes('src/utils/')) categories.utils.push(file);
    else if (file.includes('types/') || file.includes('src/types/')) categories.types.push(file);
    else if (file.match(/\.(scss|css|less|sass)$/)) categories.styles.push(file);
    else if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) categories.tests.push(file);
    else if (file.includes('scripts/') || file.includes('src/scripts/')) categories.scripts.push(file);
    else if (file.endsWith('.md') && !file.includes('node_modules')) categories.docs.push(file);
    else if (file.match(/\.(json|yml|yaml|config\.(ts|js))$/)) categories.config.push(file);
    else categories.other.push(file);
  });

  return categories;
}

/**
 * Generate suggestions based on file changes
 * @param {object} categories - Categorized files
 * @param {{type: string}} prType - PR type object
 * @returns {string[]} Array of suggestions
 */
function generateSuggestions(categories, prType) {
  const suggestions = [];

  if (categories.components.length > 0) {
    suggestions.push('📸 Consider adding screenshots for UI changes');
    suggestions.push('♿ Verify accessibility with screen reader');
  }

  if (categories.hooks.length > 0) {
    suggestions.push('🧪 Add unit tests for custom hooks');
  }

  if (categories.utils.length > 0) {
    suggestions.push('📊 Aim for 100% test coverage on utility functions');
  }

  if (categories.tests.length === 0 && prType.type !== 'Docs') {
    suggestions.push('⚠️  No test files modified - consider adding tests');
  }

  if (categories.types.length > 0) {
    suggestions.push('📝 Update JSDoc comments for type changes');
  }

  if (categories.styles.length > 0) {
    suggestions.push('🎨 Test responsive design on mobile devices');
    suggestions.push('🌓 Verify dark mode compatibility (if applicable)');
  }

  return suggestions;
}

/**
 * Analyze git diff for complexity indicators
 * @param {string} branch - Base branch to compare against
 * @returns {{complexity: string, risk: string, totalAdded: number, totalRemoved: number, fileCount: number}} Analysis results
 */
function analyzeComplexity(branch) {
  const stats = git(`diff ${branch}..HEAD --numstat`);
  const lines = stats.split('\n').filter(Boolean);

  let totalAdded = 0;
  let totalRemoved = 0;
  let largeFiles = 0;

  lines.forEach((line) => {
    const [added, removed] = line.split('\t').map(Number);
    totalAdded += added || 0;
    totalRemoved += removed || 0;
    if (added + removed > 200) largeFiles++;
  });

  const totalChanges = totalAdded + totalRemoved;

  // Determine complexity
  let complexity = 'Low';
  if (totalChanges > 1000 || largeFiles > 3) complexity = 'High';
  else if (totalChanges > 300 || largeFiles > 1) complexity = 'Medium';

  // Determine risk
  let risk = 'Low';
  if (largeFiles > 2 || totalRemoved > totalAdded * 2) risk = 'Medium';
  if (largeFiles > 5 || totalChanges > 2000) risk = 'High';

  return { complexity, risk, totalAdded, totalRemoved, fileCount: lines.length };
}

/**
 * Main function
 */
function main() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${colors.cyan}           🚀 PR Summary Generator 🚀${colors.reset}`);
  console.log(`${'='.repeat(50)}\n`);

  checkGitRepo();

  // Get current branch
  const currentBranch = git('rev-parse --abbrev-ref HEAD');

  // Get commits
  const commits = git(`log ${baseBranch}..HEAD --pretty=format:"%s"`).split('\n').filter(Boolean);

  // Get files changed in YOUR commits only (not all differences from base branch)
  const allFiles = git(`log ${baseBranch}..HEAD --name-only --pretty=format:`)
    .split('\n')
    .filter(Boolean)
    .filter((file, index, self) => self.indexOf(file) === index); // Remove duplicates

  const files = allFiles.filter((file) => !config.excludePatterns.some((pattern) => pattern.test(file)));

  // Detect PR type
  const prType = detectPRType(commits, files);

  // Categorize files
  const categories = categorizeFiles(files);

  // Analyze complexity
  const analysis = analyzeComplexity(baseBranch);

  // Generate suggestions
  const suggestions = generateSuggestions(categories, prType);

  // Generate PR summary
  const template = generateTemplate(prType, commits, files, categories, analysis, suggestions);

  // Write to file
  fs.writeFileSync(outputFile, template);

  console.log(`${colors.green}✅ Generated:${colors.reset} ${outputFile}`);
  console.log(`${colors.cyan}   Branch:${colors.reset} ${currentBranch} → ${baseBranch}`);
  console.log(`${colors.cyan}   Type:${colors.reset} ${prType.emoji} ${prType.type}`);
  console.log(`${colors.cyan}   Files:${colors.reset} ${files.length} changed`);
  console.log(`${colors.cyan}   Commits:${colors.reset} ${commits.length}`);

  // Generate AI agent prompt and copy to clipboard
  const aiPrompt = generateAIPrompt(outputFile, commits, files);

  // Copy to clipboard using pbcopy (macOS) or xclip (Linux) or clip (Windows)
  const { platform } = process;
  let copyCommand;

  if (platform === 'darwin') {
    copyCommand = 'pbcopy';
  } else if (platform === 'win32') {
    copyCommand = 'clip';
  } else {
    copyCommand = 'xclip -selection clipboard';
  }

  try {
    execSync(copyCommand, { input: aiPrompt });
    console.log(`\n${colors.green}📋 AI prompt copied to clipboard!${colors.reset}`);
    console.log(`${colors.cyan}   → Paste to your AI agent to fill in ${outputFile}${colors.reset}`);
  } catch (error) {
    console.log(`\n${colors.yellow}⚠️  Could not copy to clipboard${colors.reset}`);
    console.log(`${colors.cyan}   → AI prompt saved in ${outputFile}${colors.reset}`);
  }

  // Show post-AI review checklist
  console.log(`\n${colors.yellow}📝 After AI fills the PR:${colors.reset}`);
  console.log(`   ${colors.green}✓${colors.reset} Link to related ticket`);
  console.log(`   ${colors.green}✓${colors.reset} Verify regression testing is complete`);
  console.log(`   ${colors.green}✓${colors.reset} Confirm test scenarios cover edge cases`);
  console.log(`   ${colors.green}✓${colors.reset} Add screenshots if UI changes\n`);
}

/**
 * Generate PR template
 * @param {{type: string, emoji: string}} prType - PR type object
 * @param {string[]} commits - Array of commit messages
 * @param {string[]} files - Array of changed files
 * @param {object} categories - Categorized files
 * @param {object} analysis - Complexity analysis
 * @param {string[]} suggestions - Generated suggestions
 * @returns {string} Generated PR template
 */
function generateTemplate(prType, commits, files, categories, analysis, suggestions) {
  const hasComponents = categories.components.length > 0;
  const isBugFix = prType.type === 'Fix';

  return `# ${prType.emoji} ${prType.type}: [Brief Description]

<!-- TODO: Add a clear, concise title describing the change -->

## Problem Statement

<!-- TODO: Describe the issue or requirement that prompted this PR -->

${
  isBugFix
    ? `### Reproduction Steps

<!-- Exact steps to reproduce the issue -->
1. Step 1
2. Step 2
3. **Result**: What happens (error, unexpected behavior)

### Root Cause

<!-- Explain the technical reason for the bug -->
<!-- Optional: Add ASCII diagram showing the problem flow -->

\`\`\`text
Step 1
  ↓
Step 2
  ↓
Problem occurs 🔄
\`\`\`
`
    : ''
}
---

## Solution

<!-- TODO: High-level description of your approach -->

### Why This Works

<!-- Before/After comparison explaining the mechanism -->
- **Before**: <!-- What was happening -->
- **After**: <!-- How the fix changes behavior -->

### Changes Made

${generateChangesSection(categories)}

---

## Technical Details

### Implementation

\`\`\`typescript
// TODO: Add key code snippet showing the solution
\`\`\`

${
  hasComponents
    ? `### Visual Flow (optional)

\`\`\`text
┌─────────────────────────────────────┐
│ Component Flow                      │
├─────────────────────────────────────┤
│ 1. User action                      │
│ 2. State update ← Change here       │
│ 3. Re-render                        │
└─────────────────────────────────────┘
\`\`\`
`
    : ''
}
### Alternative Solutions Considered (if applicable)

| Solution | Result |
|----------|--------|
| Option 1 | ❌ Why it didn't work |
| **Chosen Solution** | ✅ **Why this is best** |

---

## Testing

### Test Matrix

| Test Case | Setup | Expected Result | Verified |
|-----------|-------|-----------------|----------|
| Primary scenario | <!-- Setup details --> | <!-- Expected outcome --> | ✅ |
| Edge case 1 | <!-- Setup details --> | <!-- Expected outcome --> | ✅ |
| Edge case 2 | <!-- Setup details --> | <!-- Expected outcome --> | ✅ |

### Regression Testing (CRITICAL!)

**Verify NO existing functionality is broken:**

- [ ] All features that use the changed code still work
- [ ] Related components/pages render correctly
- [ ] No new console errors introduced
- [ ] Existing tests still pass
- [ ] No broken imports or dependencies

**Specific checks performed:**
<!-- List the specific features/flows you tested -->

### Automated Tests

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

---

## Impact Analysis

### Scope

**Files Modified**: ${analysis.fileCount} files, +${analysis.totalAdded} lines, -${analysis.totalRemoved} lines

**Affected Flows**: <!-- List the user flows or systems affected -->

### Breaking Changes

- [ ] No breaking changes
- [ ] Has breaking changes (describe below)

<!-- If breaking changes, list them and migration steps -->

### Performance Impact

- [ ] No performance impact
- [ ] Performance improved
- [ ] Performance degraded (explain below)

<!-- If performance impact, describe it -->

### Accessibility Impact

- [ ] No accessibility changes
- [ ] Accessibility improved
- [ ] Accessibility affected (explain below)

<!-- If accessibility impact, describe it -->

### Backward Compatibility

- [ ] ✅ Fully backward compatible
- [ ] ⚠️ Requires migration (describe below)

<!-- If migration needed, provide steps -->

---

## Deployment

### Deployment Safety

- ✅ Safe to deploy immediately / ⚠️ Requires coordination

### Requirements

- [ ] No database migrations needed
- [ ] No environment variable changes
- [ ] No API contract changes
- [ ] No infrastructure changes

---

## Checklist

**Code Quality:**
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.log or debug code left

**Testing:**
- [ ] **Regression testing completed - NO existing functionality broken**
- [ ] All automated tests passing
${hasComponents ? '- [ ] Tested on multiple browsers (if UI change)\n- [ ] Tested on mobile (if responsive change)\n- [ ] Tested with screen reader (if a11y change)' : ''}

**Documentation:**
- [ ] Documentation updated (if needed)
- [ ] README updated (if needed)

---

## Related Issues

Closes #issue_number
Related to #issue_number

---

## Additional Notes

<!-- Any other context, concerns, or discussion points -->

### Recent Commits

${commits.map((c) => `- ${c}`).join('\n')}

### Modified Files by Category

${generateFileList(categories)}

${
  suggestions.length > 0
    ? `### 💡 Generated Suggestions

${suggestions.map((s) => `- ${s}`).join('\n')}`
    : ''
}

---

**Metadata**: Type: ${prType.type} | Priority: [High/Medium/Low] | Complexity: ${analysis.complexity} | Risk: ${analysis.risk}
`;
}

/**
 * Generate changes section grouped by category
 * @param {object} categories - Categorized files
 * @returns {string} Generated changes section
 */
function generateChangesSection(categories) {
  let section = '';

  const categoryLabels = {
    components: 'Components',
    hooks: 'Hooks',
    utils: 'Utilities',
    types: 'Types',
    styles: 'Styles',
    tests: 'Tests',
    scripts: 'Scripts',
    docs: 'Documentation',
    config: 'Configuration',
    other: 'Other Files',
  };

  Object.entries(categories).forEach(([key, files]) => {
    if (files.length > 0) {
      section += `#### ${categoryLabels[key]}\n\n`;
      files.slice(0, 5).forEach((file) => {
        section += `**\`${file}\`**\n\n`;
        section += `<!-- TODO: Describe changes in this file -->\n`;
        section += `- Change description\n\n`;
      });
      if (files.length > 5) {
        section += `_...and ${files.length - 5} more files_\n\n`;
      }
    }
  });

  return section || '<!-- TODO: Describe your changes -->';
}

/**
 * Generate AI agent prompt with all context
 * @param {string} summaryFile - Path to the generated PR summary
 * @param {string[]} commits - Array of commit messages
 * @param {string[]} files - Array of changed files
 * @returns {string} AI agent prompt
 */
function generateAIPrompt(summaryFile, commits, files) {
  const fileList = files.map((f) => `  - ${f}`).join('\n');

  return `# Fill PR Summary: ${summaryFile}

## 📋 What You're Working With

**Files Changed (${files.length})**:
${fileList}

**Your Commits**:
${commits.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

## 🎯 Your Mission

Read the actual code changes and fill in \`${summaryFile}\` with a complete, reviewer-friendly PR description.

### Step 1: Read the PR Writing Guide (if available)
Check if there's a \`.github/PR_WRITING_GUIDE.md\` in your project - it may have examples and templates.

### Step 2: Analyze the Code Changes
\`\`\`bash
git diff ${baseBranch}..HEAD
\`\`\`

For each changed file, understand:
- **What** changed (which functions, variables, logic)
- **Why** it changed (what problem does it solve)
- **How** it works (the mechanism, not just the diff)

### Step 3: Fill in ${summaryFile}

Replace **ALL** \`<!-- TODO -->\` comments with real content. Follow the template structure:

#### 📝 Problem Statement
- What bug/issue prompted this PR?
- Be crystal clear - reviewers should understand immediately

#### 🔄 Reproduction Steps (for bugs only)
Use numbered list format:
\`\`\`markdown
1. Set profile language to English
2. Navigate to /ar (Arabic)
3. Login with credentials
4. **Result**: ERR_TOO_MANY_REDIRECTS
\`\`\`

#### 🔍 Root Cause (for bugs only)
- WHY did this happen? (not just what)
- What was the technical reason?
- **Add ASCII diagram** if the flow is complex

#### ✅ Solution
- High-level description of your approach
- Explain the mechanism (the "why it works")

#### 💡 Why This Works (CRITICAL!)
Use the Before/After format:
- **Before**: What was broken
- **After**: How it's fixed

#### 📂 Changes Made
For EACH file describe what changed and why

#### 🧪 Test Matrix
Fill in the table with actual test cases

#### ⚠️ Regression Testing (CRITICAL!)
Verify and check off all items in the regression testing checklist

#### 📊 Impact Analysis
Check the appropriate boxes and fill in details

#### 🔗 Related Issues
Link to the issue: \`Closes #123\`

#### ✅ Checklist
Check ALL relevant items!

---

## ✨ Pro Tips

1. **Be Specific**: Use actual function names, file paths, line numbers
2. **Show, Don't Tell**: Code snippets > descriptions
3. **Think Like a Reviewer**: What would YOU want to know?
4. **Test for Regressions**: ALWAYS verify existing functionality still works!

---

**Output**: A complete, reviewer-ready \`${summaryFile}\`!
`;
}

/**
 * Generate file list by category
 * @param {object} categories - Categorized files
 * @returns {string} Generated file list
 */
function generateFileList(categories) {
  let list = '';

  Object.entries(categories).forEach(([key, files]) => {
    if (files.length > 0) {
      list += `**${key.charAt(0).toUpperCase() + key.slice(1)}** (${files.length}):\n`;
      files.slice(0, 10).forEach((file) => {
        list += `- \`${file}\`\n`;
      });
      if (files.length > 10) {
        list += `- _...and ${files.length - 10} more_\n`;
      }
      list += '\n';
    }
  });

  return list || '- No files modified';
}

// Run the script
main();
