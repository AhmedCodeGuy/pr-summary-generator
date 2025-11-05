# Publishing Guide

This guide will help you publish the `pr-summary-generator` package to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI**: Ensure npm is installed (`npm --version`)
3. **Login**: Log in to npm (`npm login`)

## Before Publishing

### 1. Update Package Metadata

Edit `package.json` and update:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/pr-summary-generator.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/pr-summary-generator/issues"
  },
  "homepage": "https://github.com/yourusername/pr-summary-generator#readme"
}
```

### 2. Initialize Git Repository

```bash
cd /Users/ahmed/Projects/npm-packages/pr-summary-generator
git init
git add .
git commit -m "Initial commit: pr-summary-generator v1.0.0"
```

### 3. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `pr-summary-generator`
3. Push your code:

```bash
git remote add origin https://github.com/yourusername/pr-summary-generator.git
git branch -M main
git push -u origin main
```

### 4. Test Package Locally

```bash
# Link the package globally
npm link

# Test in another project
cd /path/to/test/project
pr-summary

# Unlink when done testing
npm unlink -g pr-summary-generator
```

## Publishing to npm

### First Time Publishing

```bash
# 1. Login to npm
npm login

# 2. Test what will be published
npm pack --dry-run

# 3. Publish the package
npm publish

# If the name is taken, you can use a scoped package:
# npm publish --access public
```

### Package Name Availability

Check if the package name is available:

```bash
npm search pr-summary-generator
```

If the name is taken, you have options:

1. **Use a scoped package** (recommended):
   - Update `package.json`: `"name": "@yourusername/pr-summary-generator"`
   - Publish: `npm publish --access public`
   - Users install: `npm install -g @yourusername/pr-summary-generator`

2. **Choose a different name**:
   - Example: `git-pr-summary-generator`
   - Update in `package.json` and `README.md`

## Publishing Updates

### Semantic Versioning

Follow [semver](https://semver.org/):
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Update Version

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

### Publish Update

```bash
git push
git push --tags
npm publish
```

## Post-Publishing

### 1. Add npm Badge

The README already includes npm badges. After publishing, they will work automatically.

### 2. Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description: Copy from CHANGELOG section in README
6. Click "Publish release"

### 3. Share the Package

Share on:
- Twitter/X
- Reddit (r/javascript, r/nodejs)
- Dev.to
- Your blog

### 4. Monitor Usage

```bash
# Check package info
npm info pr-summary-generator

# Check download stats
npm-stat pr-summary-generator
```

## Using in Projects

### Global Installation

```bash
npm install -g pr-summary-generator
pr-summary
```

### Project Installation

```bash
npm install --save-dev pr-summary-generator

# Add to package.json scripts
{
  "scripts": {
    "pr:summary": "pr-summary"
  }
}

# Run
npm run pr:summary
```

### Using with npx

```bash
npx pr-summary-generator
```

## Updating Your Projects

Once published, update your existing projects:

### QuranReflect Project

```bash
cd /Users/ahmed/Projects/QuranFoundation/quranreflect

# Install the package
npm install --save-dev pr-summary-generator

# Update package.json script
# Change: "pr:summary": "node scripts/generate-pr-summary.js"
# To:     "pr:summary": "pr-summary"
```

### Other Projects

```bash
cd /path/to/other/project
npm install --save-dev pr-summary-generator

# Add to package.json
{
  "scripts": {
    "pr:summary": "pr-summary testing"
  }
}
```

## Troubleshooting

### "You do not have permission to publish"

**Solution**: The package name is taken. Use a scoped package or different name.

### "npm login" not working

**Solution**:
1. Generate an access token at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Use `npm login` with username, password, and email
3. Or use `npm adduser`

### Package not found after publishing

**Solution**: Wait a few minutes for npm to index the package, then try again.

## Maintenance

### Regular Updates

- Fix bugs reported in GitHub Issues
- Add features requested by users
- Keep dependencies updated
- Update documentation

### Versioning Strategy

- Patch releases: Weekly or as needed for bugs
- Minor releases: Monthly or when new features are ready
- Major releases: Yearly or when breaking changes are necessary

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm Package Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

**Good luck with your npm package!** 🚀
