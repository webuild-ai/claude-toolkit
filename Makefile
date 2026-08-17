.PHONY: install install-cmd install-list uninstall uninstall-cmd list check help

CLAUDE_COMMANDS_DIR := $(HOME)/.claude/commands
CLAUDE_SKILLS_DIR := $(HOME)/.claude/skills
COMMANDS := $(filter-out commands/README.md, $(wildcard commands/*.md))
SKILLS := $(patsubst %/SKILL.md,%,$(wildcard skills/*/SKILL.md))

help: ## Show this help message
	@echo "Claude Toolkit"
	@echo ""
	@echo "Usage: make [target] [CMD=command-name]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make install                     # Install all commands and skills"
	@echo "  make install-list                # List available commands with descriptions"
	@echo "  make install-cmd CMD=sanitycheck # Install specific command"
	@echo "  make uninstall-cmd CMD=commit    # Uninstall specific command"

install: ## Install all commands to ~/.claude/commands and skills to ~/.claude/skills
	@echo "Installing Claude Code commands..."
	@mkdir -p $(CLAUDE_COMMANDS_DIR)
	@for cmd in $(COMMANDS); do \
		cp $$cmd $(CLAUDE_COMMANDS_DIR)/; \
		echo "  ✓ Installed: $$(basename $$cmd)"; \
	done
	@if [ -n "$(SKILLS)" ]; then \
		echo ""; \
		echo "Installing Claude Code skills..."; \
		mkdir -p "$(CLAUDE_SKILLS_DIR)"; \
		for skill in $(SKILLS); do \
			rm -rf "$(CLAUDE_SKILLS_DIR)/$$(basename $$skill)"; \
			cp -R "$$skill" "$(CLAUDE_SKILLS_DIR)/" || exit 1; \
			echo "  ✓ Installed skill: $$(basename $$skill)"; \
		done; \
	fi
	@echo ""
	@echo "Done! Commands installed to $(CLAUDE_COMMANDS_DIR), skills to $(CLAUDE_SKILLS_DIR)"
	@echo ""
	@echo "Available commands:"
	@for cmd in $(COMMANDS); do \
		echo "  /$$(basename $$cmd .md)"; \
	done
	@echo ""
	@echo "Available skills:"
	@for skill in $(SKILLS); do \
		echo "  /$$(basename $$skill)"; \
	done

uninstall: ## Remove all installed commands and skills
	@echo "Uninstalling Claude Code commands..."
	@for cmd in $(COMMANDS); do \
		rm -f $(CLAUDE_COMMANDS_DIR)/$$(basename $$cmd); \
		echo "  ✗ Removed: $$(basename $$cmd)"; \
	done
	@for skill in $(SKILLS); do \
		rm -rf "$(CLAUDE_SKILLS_DIR)/$$(basename $$skill)"; \
		echo "  ✗ Removed skill: $$(basename $$skill)"; \
	done
	@echo "Done!"

install-cmd: ## Install specific command (usage: make install-cmd CMD=command-name)
	@if [ -z "$(CMD)" ]; then \
		echo "Error: CMD parameter required"; \
		echo "Usage: make install-cmd CMD=command-name"; \
		echo "Example: make install-cmd CMD=sanitycheck"; \
		exit 1; \
	fi
	@if [ ! -f "commands/$(CMD).md" ]; then \
		echo "Error: Command '$(CMD)' not found"; \
		echo "Available commands:"; \
		for cmd in $(COMMANDS); do \
			echo "  - $$(basename $$cmd .md)"; \
		done; \
		exit 1; \
	fi
	@mkdir -p $(CLAUDE_COMMANDS_DIR)
	@cp commands/$(CMD).md $(CLAUDE_COMMANDS_DIR)/
	@echo "✓ Installed: $(CMD).md"
	@echo "Command available as: /$(CMD)"

install-list: ## List commands available for installation
	@echo ""
	@echo "┌─────────────────────────┬────────────────────────────────────────────────────────┐"
	@echo "│ Command                 │ Description                                            │"
	@echo "├─────────────────────────┼────────────────────────────────────────────────────────┤"
	@for cmd in $(COMMANDS); do \
		name=$$(basename $$cmd .md); \
		desc=$$(grep -m1 '^description:' $$cmd 2>/dev/null | sed 's/description: *//'); \
		if [ -z "$$desc" ]; then \
			desc=$$(sed -n '2,10p' $$cmd | grep -v '^#' | grep -v '^---' | grep -v '^$$' | head -1 | cut -c1-54); \
		fi; \
		desc=$$(echo "$$desc" | cut -c1-54); \
		printf "│ %-23s │ %-54s │\n" "$$name" "$$desc"; \
	done
	@echo "└─────────────────────────┴────────────────────────────────────────────────────────┘"
	@echo ""
	@echo "Install: make install-cmd CMD=<name>  |  Install all: make install"

uninstall-cmd: ## Uninstall specific command (usage: make uninstall-cmd CMD=command-name)
	@if [ -z "$(CMD)" ]; then \
		echo "Error: CMD parameter required"; \
		echo "Usage: make uninstall-cmd CMD=command-name"; \
		echo "Example: make uninstall-cmd CMD=sanitycheck"; \
		exit 1; \
	fi
	@if [ -f "$(CLAUDE_COMMANDS_DIR)/$(CMD).md" ]; then \
		rm -f $(CLAUDE_COMMANDS_DIR)/$(CMD).md; \
		echo "✗ Removed: $(CMD).md"; \
	else \
		echo "Command '$(CMD)' is not installed"; \
	fi

list: ## List available commands and skills
	@echo "Available commands:"
	@for cmd in $(COMMANDS); do \
		echo "  /$$(basename $$cmd .md)"; \
	done
	@echo ""
	@echo "Available skills:"
	@for skill in $(SKILLS); do \
		echo "  /$$(basename $$skill)"; \
	done

check: ## Check if commands and skills are installed
	@echo "Checking installed commands..."
	@for cmd in $(COMMANDS); do \
		if [ -f "$(CLAUDE_COMMANDS_DIR)/$$(basename $$cmd)" ]; then \
			echo "  ✓ $$(basename $$cmd) (installed)"; \
		else \
			echo "  ✗ $$(basename $$cmd) (not installed)"; \
		fi \
	done
	@echo ""
	@echo "Checking installed skills..."
	@for skill in $(SKILLS); do \
		if [ -f "$(CLAUDE_SKILLS_DIR)/$$(basename $$skill)/SKILL.md" ]; then \
			echo "  ✓ $$(basename $$skill) (installed)"; \
		else \
			echo "  ✗ $$(basename $$skill) (not installed)"; \
		fi \
	done
