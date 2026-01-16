# FAQ & Troubleshooting

Common questions, issues, and solutions for Claude Toolkit.

## Table of Contents

- [Installation](#installation)
- [Command Usage](#command-usage)
- [Configuration](#configuration)
- [Integration Issues](#integration-issues)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)

---

## Installation

### Q: Where are commands installed?

**A**: Commands are installed to `~/.claude/commands/` by default.

You can verify with:
```bash
ls ~/.claude/commands/
```

---

### Q: How do I install only specific commands?

**A**: Use `install-cmd` target:
```bash
make install-cmd CMD=sanitycheck
make install-cmd CMD=commit
make install-cmd CMD=pr-review
```

---

### Q: How do I update commands to the latest version?

**A**: Pull the latest changes and reinstall:
```bash
cd claude-toolkit
git pull origin main
make install
```

---

### Q: Can I install commands to a different directory?

**A**: Yes, set the `CLAUDE_COMMANDS_DIR` variable:
```bash
make install CLAUDE_COMMANDS_DIR=~/my-custom-path
```

---

### Q: Commands aren't showing up in Claude Code

**A**: Verify installation:
```bash
# Check if commands are installed
make check

# List available commands
make list

# Manually check directory
ls -la ~/.claude/commands/
```

If commands are present but not appearing:
1. Restart Claude Code
2. Check Claude Code settings for command directory path
3. Ensure files have `.md` extension

---

## Command Usage

### Q: What's the difference between `/commit` and `git commit`?

**A**: `/commit` is a Claude Code command that:
- Reviews your changes
- Suggests appropriate commit type
- Generates conventional commit message
- Creates the commit with proper formatting

`git commit` is the direct Git command.

**Use `/commit` when**: You want Claude to help draft a good commit message
**Use `git commit` when**: You already know exactly what message to write

---

### Q: Do I need to run `/sanitycheck` for every commit?

**A**: **Yes, highly recommended!** It catches:
- Console.log statements
- Linting errors
- Security vulnerabilities
- Test failures
- Build issues

Taking 2-3 minutes for sanitycheck can save hours of debugging later.

---

### Q: Can I customize which checks `/sanitycheck` runs?

**A**: The command runs all 16 checks by default. To skip specific checks, you can:

1. **Modify the command file**: Edit `commands/sanitycheck.md`
2. **Create a custom command**: Copy and modify for your needs

Example custom command with only security and tests:
```markdown
# Quick Check

## Instructions
1. Run security scan
2. Run test suite
3. Report results
```

---

### Q: How do I use commands in CI/CD?

**A**: Commands are designed for interactive use with Claude Code. For CI/CD, use the underlying tools directly:

Instead of `/sanitycheck`, use:
```yaml
- run: npm run lint
- run: npm test
- run: npm run build
- run: npm audit
```

See [GitHub Actions Integration](Tutorials-and-Guides#github-actions) for examples.

---

### Q: Can I create my own commands?

**A**: Yes! See [Creating Commands](Tutorials-and-Guides#creating-commands) guide.

Basic structure:
```markdown
# My Command

Brief description.

## Instructions
1. Step one
2. Step two

## Output Format
How results should look.
```

Save to `commands/my-command.md` and install with:
```bash
make install-cmd CMD=my-command
```

---

## Configuration

### Q: How do I auto-run `/sanitycheck` before commits?

**A**: Add to `~/.claude/CLAUDE.md`:

```markdown
## Pre-Commit Requirements

### Sanity Check Before Commits
**ALWAYS** run `/sanitycheck` before creating any git commit, whether:
- Using `git commit` directly in terminal
- Using any git MCP tools
- Being asked to commit changes

This is a mandatory step - do not skip it.
```

---

### Q: I use bash/fish, not zsh. How do I adapt commands?

**A**: Commands use `zsh -i -c "npm ..."` for npm commands.

**For bash users**:
- Replace with `bash -c "npm ..."`

**For fish users**:
- Replace with `fish -c "npm ..."`

**Or simply**:
- Run `npm ...` directly if npm is in your PATH

Example in commands:
```bash
# Original
zsh -i -c "npm run lint"

# Bash
bash -c "npm run lint"

# Direct
npm run lint
```

---

### Q: How do I configure Claude Code to find commands?

**A**: Claude Code automatically checks `~/.claude/commands/` for `.md` files.

No additional configuration needed if you use the default installation.

---

## Integration Issues

### Q: GitHub Actions workflow fails with "command not found"

**A**: Commands are for interactive Claude Code use, not direct execution.

**Wrong**:
```yaml
- run: /sanitycheck  # ❌ Won't work
```

**Right**:
```yaml
- run: npm run lint    # ✅ Use underlying tools
- run: npm test
- run: npm run build
```

---

### Q: How do I use commands with GitHub Copilot?

**A**: Claude Code commands are specific to Claude and won't work with GitHub Copilot. However, you can:
1. Reference command content as documentation
2. Use the same underlying tools
3. Adapt patterns to Copilot workflow

---

### Q: Can I use commands with other AI coding assistants?

**A**: Commands are Claude Code specific, but the patterns and checks they implement can be adapted to any development workflow.

---

## Troubleshooting

### Q: `/sanitycheck` is too slow

**A**: Sanitycheck runs 16 comprehensive checks. To speed up:

**1. Skip long-running checks** (modify command):
```markdown
Skip checks 10 (dependency audit) and 16 (production build) for faster iteration
```

**2. Run specific checks only**:
- Create a "quick-check" command with fewer checks
- Use individual commands: `/test-coverage`, `/dead-code`, etc.

**3. Optimize your project**:
- Reduce test suite runtime
- Use faster linters
- Implement caching

---

### Q: Command gives "file not found" error

**A**: Check if the file is being referenced correctly:

```bash
# Verify file exists
ls -la commands/sanitycheck.md

# Check if installed
ls -la ~/.claude/commands/sanitycheck.md

# Reinstall if missing
make install-cmd CMD=sanitycheck
```

---

### Q: `/commit` creates messages that are too long

**A**: The `/commit` command aims for conventional commit format with descriptive details.

If messages are too verbose:
1. Stage fewer files per commit
2. Keep commits more focused
3. Edit the generated message before finalizing
4. Modify `commands/commit.md` to generate shorter messages

---

### Q: `/pr-review` misses important issues

**A**: `/pr-review` provides a checklist, but human review is still essential.

**Improve review quality**:
1. Run `/sanitycheck` before PR creation
2. Use `/test-coverage` to ensure adequate testing
3. Run `/refactor-check` to catch code smells
4. Manually review critical security areas

---

### Q: Commands don't work in my monorepo

**A**: Commands work with monorepos, but you may need to:

1. **Adjust paths**: Commands assume standard project structure
2. **Run from package directory**: `cd packages/api && /sanitycheck`
3. **Modify commands**: Edit to handle monorepo structure

Example modification for monorepo:
```markdown
## Instructions
1. Detect if this is a monorepo (check for packages/, apps/, etc.)
2. If monorepo, ask which package to check
3. Change to package directory
4. Run checks in that context
```

---

### Q: npm/Node.js commands fail

**A**: Ensure npm is in your PATH:

```bash
# Check npm availability
which npm

# Check Node version
node --version
npm --version
```

If npm isn't found:
1. Install Node.js
2. Add npm to PATH
3. Restart terminal/Claude Code

---

### Q: Git commands fail with authentication issues

**A**: Configure Git authentication:

**For HTTPS**:
```bash
git config --global credential.helper store
```

**For SSH**:
```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub
cat ~/.ssh/id_ed25519.pub
# Copy output and add to GitHub Settings > SSH Keys
```

---

## Performance

### Q: Why is `/sanitycheck` slow on large codebases?

**A**: Sanitycheck runs comprehensive checks including:
- Linting entire codebase
- Running all tests
- Building production bundle
- npm audit

**Optimization strategies**:

1. **Use incremental checks**:
```bash
# Only lint changed files
npm run lint -- --fix $(git diff --name-only '*.js' '*.ts')
```

2. **Parallelize checks**:
- Run independent checks concurrently
- Use CI/CD for expensive checks

3. **Cache dependencies**:
```bash
# npm
npm ci --prefer-offline

# Linting
ESLint --cache
```

4. **Skip unnecessary checks**:
- Modify command to skip checks not relevant to your project

---

### Q: How can I speed up test runs?

**A**: Several strategies:

**1. Run only changed tests**:
```bash
npm test -- --onlyChanged
```

**2. Use test sharding**:
```bash
npm test -- --shard=1/4
```

**3. Optimize test setup**:
- Use test doubles (mocks/stubs) for external services
- Minimize database interactions
- Parallelize test execution

**4. Skip slow tests in development**:
```javascript
describe.skip('slow integration tests', () => {
  // Skip these in dev, run in CI
});
```

---

### Q: Bundle size check is slow

**A**: Webpack/build tools can be slow on large projects.

**Speed up builds**:

1. **Use production build only when needed**:
```bash
# Development build (faster)
npm run build:dev

# Production build (slower, more optimized)
npm run build:prod
```

2. **Enable caching**:
```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem'
  }
};
```

3. **Reduce bundle analysis frequency**:
- Check bundle size only before releases
- Use CI/CD for automated checks

---

### Q: Too many checks are running unnecessarily

**A**: Not all checks apply to all projects. Customize `/sanitycheck`:

**For Python projects**:
- Skip npm audit, bundle size
- Add Python-specific checks (mypy, black, pylint)

**For small projects**:
- Skip infrastructure checks
- Focus on code quality and tests

**For libraries**:
- Skip E2E tests
- Focus on unit tests and documentation

---

## Still Having Issues?

### Get Help

**1. Check Documentation**:
- [Home](Home) - Overview and quick start
- [Command Reference](Command-Reference) - Detailed command docs
- [Tutorials & Guides](Tutorials-and-Guides) - Step-by-step guides

**2. Search Issues**:
- [GitHub Issues](https://github.com/webuild-ai/claude-toolkit/issues)
- Check if your issue is already reported

**3. Ask Questions**:
- [GitHub Discussions](https://github.com/webuild-ai/claude-toolkit/discussions)
- Community can help troubleshoot

**4. Report Bugs**:
- [Create Issue](https://github.com/webuild-ai/claude-toolkit/issues/new)
- Include:
  - Command being used
  - Error message
  - Steps to reproduce
  - Environment details (OS, Node version, etc.)

---

## Tips & Tricks

### Tip: Create Command Aliases

For frequently used commands, create shell aliases:

```bash
# ~/.zshrc or ~/.bashrc
alias cc='claude-code'
alias ccs='/sanitycheck'
alias ccc='/commit'
alias ccr='/pr-review'
```

---

### Tip: Batch Operations

Install multiple commands at once:

```bash
for cmd in sanitycheck commit pr-review test-coverage; do
  make install-cmd CMD=$cmd
done
```

---

### Tip: Quick Verification

Before starting work, verify your setup:

```bash
# One-liner to check everything
make check && npm test && npm run build
```

---

### Tip: Custom Workflow Commands

Create project-specific commands:

```markdown
# commands/my-workflow.md

# My Workflow

Complete workflow for our project.

## Instructions
1. Run /sanitycheck
2. Run /test-coverage
3. Run /build-fix
4. Run /commit
5. Push changes
```

---

**[← Back to Home](Home) | [← Command Reference](Command-Reference) | [← Tutorials & Guides](Tutorials-and-Guides)**
