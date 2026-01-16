# README Update

Update README files with recent changes, setup instructions, and examples to keep documentation current.

## Instructions

### 1. Review Current README

Check what exists and what's missing:

- [ ] Project title and description
- [ ] Badges (build status, coverage, version)
- [ ] Quick start / installation
- [ ] Usage examples
- [ ] API reference or link to docs
- [ ] Configuration options
- [ ] Development setup
- [ ] Testing instructions
- [ ] Contributing guidelines
- [ ] License information
- [ ] Contact/support information

### 2. Update Project Description

Ensure the description is clear and current:

```markdown
# Project Name

Brief one-liner description of what the project does.

## Overview

2-3 paragraphs explaining:
- What problem it solves
- Key features
- Target audience
- Technology stack
```

### 3. Update Installation Instructions

Keep setup steps current:

```markdown
## Installation

### Prerequisites
- Node.js 18+ / Python 3.10+
- Required tools or services

### Quick Start

\`\`\`bash
# Clone repository
git clone https://github.com/org/project.git
cd project

# Install dependencies
# Python
uv sync

# TypeScript
npm install

# Start development server
npm run dev
\`\`\`
```

### 4. Add/Update Usage Examples

Include realistic examples:

```markdown
## Usage

### Basic Example

\`\`\`python
from mypackage import MyClass

client = MyClass(api_key="your-key")
result = client.do_something()
print(result)
\`\`\`

### Advanced Example

\`\`\`python
# More complex scenario
config = {
    "option1": "value1",
    "option2": "value2"
}
client = MyClass(**config)
result = client.advanced_operation()
\`\`\`
```

### 5. Update Configuration Section

Document all configuration options:

```markdown
## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | Yes | - | Your API key |
| `DATABASE_URL` | Yes | - | Database connection string |
| `LOG_LEVEL` | No | `INFO` | Logging level (DEBUG, INFO, WARN, ERROR) |
| `PORT` | No | `8000` | Server port |

### Configuration File

Create a `.env` file:

\`\`\`env
API_KEY=your_api_key_here
DATABASE_URL=postgresql://localhost/mydb
LOG_LEVEL=INFO
\`\`\`
```

### 6. Add Development Section

Help contributors get started:

```markdown
## Development

### Setup

\`\`\`bash
# Install development dependencies
npm install --include=dev

# Run in development mode
npm run dev
\`\`\`

### Testing

\`\`\`bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test user.test.ts
\`\`\`

### Linting and Formatting

\`\`\`bash
# Lint
npm run lint

# Format
npm run format
\`\`\`
```

### 7. Update Changelog or Recent Changes

Add recent changes at the top:

```markdown
## Recent Changes

### v2.1.0 (2026-01-16)
- Added support for webhooks
- Improved error handling in API client
- Fixed bug in authentication flow
- Updated dependencies

### v2.0.0 (2026-01-01)
- Breaking: Renamed `oldMethod` to `newMethod`
- Added async/await support
- Improved performance by 40%
```

### 8. Add Badges

Include relevant badges at the top:

```markdown
![Build Status](https://github.com/org/project/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/org/project/branch/main/graph/badge.svg)
![Version](https://img.shields.io/npm/v/package-name.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

### 9. Verify Links and Examples

- Test all code examples
- Verify all links work
- Update screenshots if UI changed
- Check badge URLs are correct

## Output Format

A well-structured README with:
1. Clear project overview
2. Up-to-date installation steps
3. Working code examples
4. Complete configuration reference
5. Development instructions
6. Recent changes documented

## Best Practices

- Keep it concise but complete
- Use consistent formatting
- Include code examples that actually work
- Update with every significant change
- Use relative links for internal docs
- Add table of contents for long READMEs
- Include troubleshooting section
- Link to detailed docs for complex topics

## Notes

- Test all commands before documenting
- Keep README in sync with actual code
- Use conventional structure for consistency
- Consider separate docs for extensive documentation
