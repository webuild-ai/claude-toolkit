.PHONY: install uninstall list check help

CLAUDE_COMMANDS_DIR := $(HOME)/.claude/commands
COMMANDS := $(wildcard commands/*.md)

help: ## Show this help message
	@echo "Claude Toolkit"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install commands to ~/.claude/commands
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

uninstall: ## Remove installed commands from ~/.claude/commands
	@echo "Uninstalling Claude Code commands..."
	@for cmd in $(COMMANDS); do \
		rm -f $(CLAUDE_COMMANDS_DIR)/$$(basename $$cmd); \
		echo "  ✗ Removed: $$(basename $$cmd)"; \
	done
	@echo "Done!"

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
