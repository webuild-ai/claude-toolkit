.PHONY: install install-cmd uninstall uninstall-cmd list check help

CLAUDE_COMMANDS_DIR := $(HOME)/.claude/commands
COMMANDS := $(filter-out commands/README.md, $(wildcard commands/*.md))

help: ## Show this help message
	@echo "Claude Toolkit"
	@echo ""
	@echo "Usage: make [target] [CMD=command-name]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make install                    # Install all commands"
	@echo "  make install-cmd CMD=sanitycheck # Install specific command"
	@echo "  make uninstall-cmd CMD=commit    # Uninstall specific command"

install: ## Install all commands to ~/.claude/commands
	@echo "Installing Claude Code commands..."
	@mkdir -p $(CLAUDE_COMMANDS_DIR)
	@for cmd in $(COMMANDS); do \
		cp $$cmd $(CLAUDE_COMMANDS_DIR)/; \
		echo "  ✓ Installed: $$(basename $$cmd)"; \
	done
	@echo ""
	@echo "Done! Commands installed to $(CLAUDE_COMMANDS_DIR)"
	@echo ""
	@echo "Available commands:"
	@for cmd in $(COMMANDS); do \
		echo "  /$$(basename $$cmd .md)"; \
	done

uninstall: ## Remove all installed commands from ~/.claude/commands
	@echo "Uninstalling Claude Code commands..."
	@for cmd in $(COMMANDS); do \
		rm -f $(CLAUDE_COMMANDS_DIR)/$$(basename $$cmd); \
		echo "  ✗ Removed: $$(basename $$cmd)"; \
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

list: ## List available commands
	@echo "Available commands:"
	@for cmd in $(COMMANDS); do \
		echo "  /$$(basename $$cmd .md)"; \
	done

check: ## Check if commands are installed
	@echo "Checking installed commands..."
	@for cmd in $(COMMANDS); do \
		if [ -f "$(CLAUDE_COMMANDS_DIR)/$$(basename $$cmd)" ]; then \
			echo "  ✓ $$(basename $$cmd) (installed)"; \
		else \
			echo "  ✗ $$(basename $$cmd) (not installed)"; \
		fi \
	done
