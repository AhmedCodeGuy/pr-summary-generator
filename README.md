# 🚀 PR Summary Generator

Automatically generate structured PR summaries with AI-ready prompts for comprehensive, reviewer-friendly pull request descriptions.

[![npm version](https://img.shields.io/npm/v/pr-summary-generator.svg)](https://www.npmjs.com/package/pr-summary-generator)
[![npm downloads](https://img.shields.io/npm/dm/pr-summary-generator.svg)](https://www.npmjs.com/package/pr-summary-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Smart Analysis**: Analyzes your git commits and detects PR type automatically
✅ **AI Integration**: Generates comprehensive AI prompts (auto-copied to clipboard!)
✅ **Structured Templates**: Creates professional PR summaries following best practices
✅ **Context-Aware**: Provides suggestions based on file types (components, hooks, utils, etc.)
✅ **Framework Agnostic**: Works with any codebase (React, Vue, Angular, Node.js, etc.)
✅ **Configurable**: Customize base branch, output file, and exclude patterns
✅ **Zero Dependencies**: Lightweight, uses only Node.js built-ins

## Quick Start

### Installation

```bash
# Install globally
npm install -g pr-summary-generator

# Or use with npx (no installation needed)
npx pr-summary-generator
```

### Usage

```bash
# Basic usage (defaults to main branch)
pr-summary

# Specify base branch
pr-summary develop

# Custom output file
pr-summary main --output MY_PR.md

# With configuration file
pr-summary --config .prsummaryrc.json
```

## How It Works

1. **Generate Template**: Run `pr-summary` in your git repository
2. **AI Prompt**: The command auto-copies an AI prompt to your clipboard
3. **Paste to AI**: Paste the prompt to your AI assistant (Claude, ChatGPT, etc.)
4. **Review**: AI fills in the PR summary, you review and adjust
5. **Create PR**: Copy the completed summary to your pull request

## Perfect Workflow

```bash
# 1. Generate template (AI prompt auto-copied!)
pr-summary

# 2. Paste clipboard to your AI agent (Cmd+V / Ctrl+V)

# 3. AI analyzes your code and fills PR_SUMMARY.md

# 4. Review, adjust if needed, and copy to GitHub PR
```

## What Gets Generated

The tool creates a comprehensive PR template with:

- **Problem Statement** - What issue prompted this PR
- **Reproduction Steps** (for bugs) - Exact steps to reproduce
- **Root Cause** (for bugs) - Technical reason with optional diagrams
- **Solution** - High-level approach
- **Why This Works** - Before/After comparison
- **Changes Made** - Per-file breakdown by category
- **Technical Details** - Code snippets and diagrams
- **Test Matrix** - Table with test scenarios
- **Regression Testing** - Checklist to verify no breakage
- **Impact Analysis** - Affected flows, breaking changes, performance
- **Deployment** - Safety checklist
- **Related Issues** - Links to tickets
- **Metadata** - Type, Priority, Complexity, Risk

## Configuration

Create a `.prsummaryrc.json` file in your project root:

```json
{
  "baseBranch": "main",
  "outputFile": "PR_SUMMARY.md",
  "excludePatterns": [
    "^\\.vscode/",
    "^\\.idea/",
    "^node_modules/",
    "^\\.env"
  ]
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseBranch` | string | `"main"` | Base branch to compare against |
| `outputFile` | string | `"PR_SUMMARY.md"` | Output file path |
| `excludePatterns` | array | See below | Regex patterns to exclude files |

### Default Exclude Patterns

The tool automatically excludes:
- IDE configs (`.vscode/`, `.idea/`, `.cursor/`, `.windsurf/`)
- Dependencies (`node_modules/`)
- Build artifacts (`.next/`, `dist/`, `build/`, `coverage/`)
- Lock files (`package-lock.json`, `yarn.lock`)
- Environment files (`.env*`)
- Log files (`*.log`)

## Examples

### Bug Fix PR

```bash
# On branch: fix/login-redirect-loop
pr-summary testing
```

Generates:
- 🐛 Fix type with reproduction steps
- Root cause analysis section
- Before/after comparison
- Test cases for the bug scenario

### Feature PR

```bash
# On branch: feature/dark-mode
pr-summary develop --output DARK_MODE_PR.md
```

Generates:
- ✨ Feature type
- User benefit explanation
- Implementation details
- Accessibility considerations (auto-suggested)

### Refactor PR

```bash
# On branch: refactor/api-client
pr-summary main
```

Generates:
- ♻️ Refactor type
- Explanation of improvements
- Performance impact section
- Backward compatibility notes

## PR Type Detection

The tool automatically detects your PR type based on commits and files:

| Detected Keywords | PR Type | Emoji |
|-------------------|---------|-------|
| fix, bug, resolve | Fix | 🐛 |
| feat, feature, add | Feature | ✨ |
| refactor, restructure | Refactor | ♻️ |
| docs, documentation | Docs | 📝 |
| test, spec | Test | 🧪 |
| perf, performance, optimize | Performance | ⚡ |
| (default) | Chore | 🔧 |

## Smart Suggestions

The tool provides intelligent suggestions based on your changes:

| File Changes | Suggestions |
|--------------|-------------|
| Components modified | 📸 Add screenshots, ♿ Test accessibility |
| Hooks added | 🧪 Add unit tests for custom hooks |
| Utils changed | 📊 Aim for 100% test coverage |
| No tests modified | ⚠️ Consider adding tests |
| Styles updated | 🎨 Test responsive design, 🌓 Check dark mode |

## Advanced Usage

### Multiple PRs

```bash
# Generate for feature A
pr-summary testing --output PR_FEATURE_A.md

# Generate for feature B
pr-summary testing --output PR_FEATURE_B.md
```

### Different Base Branches

```bash
# Compare against main
pr-summary main

# Compare against develop
pr-summary develop

# Compare against release branch
pr-summary release/v2.0

# Compare against specific commit
pr-summary abc123
```

### Custom Configuration Path

```bash
pr-summary --config path/to/custom-config.json
```

## Integration with npm Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "pr:summary": "pr-summary",
    "pr:develop": "pr-summary develop",
    "pr:custom": "pr-summary -- --output MY_PR.md"
  }
}
```

Then run:

```bash
npm run pr:summary
```

## Requirements

- Node.js 14.0.0 or higher
- Git repository
- Commits on current branch (compared to base branch)

## Troubleshooting

### "Not a git repository"

**Solution**: Run from inside a git repository

### "No commits found"

**Solution**: Ensure you have commits on your branch that aren't on the base branch

### Clipboard not working

**Solution**: The tool auto-detects your OS. If clipboard fails, the AI prompt will still be generated in the output file.

### Wrong file count

**Solution**: The tool shows only files YOU changed in YOUR commits, not all differences from base branch. This is correct behavior.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Why This Tool?

**Problem**: Writing comprehensive PR summaries is time-consuming and often incomplete.

**Solution**:
1. Script generates structured template
2. AI agent gets comprehensive prompt with your changes
3. AI fills template following best practices
4. You review and adjust

**Result**: High-quality, consistent PR summaries in minutes instead of hours!

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pr-summary-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pr-summary-generator/discussions)

## Changelog

### 1.0.0 (2025-11-05)
- Initial release
- Smart PR type detection
- AI prompt generation with clipboard support
- Framework-agnostic design
- Configurable via `.prsummaryrc.json`
- Comprehensive PR template generation

---

**Made with ❤️ by the open source community**
