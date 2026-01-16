# Wiki Content for GitHub

This directory contains markdown files ready to be uploaded to the GitHub wiki.

## Wiki Pages

1. **Home.md** - Main wiki homepage with overview and quick start
2. **Command-Reference.md** - Complete reference for all commands, prompts, schemas
3. **Tutorials-and-Guides.md** - Step-by-step tutorials and practical guides
4. **FAQ-and-Troubleshooting.md** - Common questions and solutions

## How to Upload to GitHub Wiki

### Method 1: Manual Upload (Easiest)

1. Go to https://github.com/webuild-ai/claude-toolkit/wiki
2. Click "Create the first page" button
3. Copy content from `Home.md` and paste it
4. Click "Save Page"
5. Repeat for other pages:
   - Click "New Page"
   - Set page title (e.g., "Command Reference")
   - Copy and paste content
   - Save

### Method 2: Git Clone (Advanced)

GitHub wikis are git repositories. You can clone and push:

```bash
# Clone wiki repository
git clone https://github.com/webuild-ai/claude-toolkit.wiki.git

# Copy files
cp wiki/*.md claude-toolkit.wiki/

# Commit and push
cd claude-toolkit.wiki
git add .
git commit -m "docs: add comprehensive wiki documentation"
git push origin master
```

**Note**: The wiki repository only exists after creating the first page manually.

### Method 3: Use gh CLI

If available:

```bash
# First, create the wiki by making the first page through the web interface
# Then you can use git to update it
```

## Wiki Structure

```
wiki/
├── Home.md                       # Homepage and getting started
├── Command-Reference.md          # All commands, prompts, schemas
├── Tutorials-and-Guides.md       # Step-by-step guides
├── FAQ-and-Troubleshooting.md   # Q&A and solutions
└── README.md                     # This file
```

## Content Overview

### Home.md
- Welcome and quick start
- Feature overview
- Learning paths for new/experienced users
- Configuration basics
- Support links

### Command-Reference.md
- All 25 commands organized by category
- 8 prompts with descriptions
- 10 schemas documentation
- 8 examples overview
- Quick reference guide

### Tutorials-and-Guides.md
- Getting started tutorial
- Essential workflows (pre-commit, feature development, code review)
- Advanced workflows (releases, infrastructure)
- Creating custom commands, prompts, schemas
- Integration guides (GitHub Actions, Slack)
- Best practices

### FAQ-and-Troubleshooting.md
- Installation questions
- Command usage questions
- Configuration help
- Integration issues
- Troubleshooting common problems
- Performance optimization tips

## Maintenance

To update wiki content:

1. Edit files in this directory
2. Copy updated files to wiki repository
3. Commit and push changes

## Links Between Pages

Wiki pages use these links:
- `[Home](Home)` - Link to home
- `[Command Reference](Command-Reference)` - Link to command reference
- `[Tutorials](Tutorials-and-Guides)` - Link to tutorials
- `[FAQ](FAQ-and-Troubleshooting)` - Link to FAQ

These work automatically in GitHub wikis.

## Preview Locally

To preview how pages will look:

```bash
# Using grip (GitHub README previewer)
pip install grip
grip wiki/Home.md
```

Visit http://localhost:6419 to see the rendered markdown.
