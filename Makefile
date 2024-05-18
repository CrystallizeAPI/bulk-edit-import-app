# Styles
YELLOW := $(shell echo "\033[00;33m")
RED := $(shell echo "\033[00;31m")
RESTORE := $(shell echo "\033[0m")

# Variables
.DEFAULT_GOAL := list
PACKAGE_MANAGER := pnpm
CURRENT_DIR := $(shell pwd)
DEPENDENCIES := node pnpm git
NODE := node -r dotenv/config
CADDY_PID_FILE := caddy.dev.pid
CADDY = caddy

.PHONY: list
list:
	@echo "${YELLOW}***${RED}***${RESTORE}***${YELLOW}***${RED}***${RESTORE}***${YELLOW}***${RED}***${RESTORE}***${YELLOW}***${RED}***${RESTORE}"
	@echo "${RED}Bulk Edit Import App: ${YELLOW}Available targets${RESTORE}:"
	@grep -E '^[a-zA-Z-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf " ${YELLOW}%-15s${RESTORE} > %s\n", $$1, $$2}'
	@echo "${RED}=================================${RESTORE}"

.PHONY: check-dependencies
check-dependencies:
	@for dependency in $(DEPENDENCIES); do \
		if ! command -v $$dependency &> /dev/null; then \
			echo "${RED}Error:${RESTORE} ${YELLOW}$$dependency${RESTORE} is not installed."; \
			exit 1; \
		fi; \
	done
	@echo "All ${YELLOW}dependencies are installed.${RESTORE}"

.PHONY: install
install: check-dependencies update ## Install the Application and reset the database

.PHONY: update
update: check-dependencies ## Update the Repo
	@$(PACKAGE_MANAGER) install

.PHONY: codeclean
codeclean: ## Code Clean
	@$(PACKAGE_MANAGER) run lint:fix
	@$(PACKAGE_MANAGER) run prettier:fix
	@$(PACKAGE_MANAGER) run lint:check
	@$(PACKAGE_MANAGER) run prettier:check

.PHONY: strict-codeclean
strict-codeclean: codeclean
	@$(PACKAGE_MANAGER) run typecheck

.PHONY: build
build: ## Build All
	@$(PACKAGE_MANAGER) run build

.PHONY: start-services
start-services: stop-services ## Start Services
	@touch $(CADDY_PID_FILE)
	@$(CADDY) start --pidfile $(CADDY_PID_FILE)

.PHONY: stop-services
stop-services: ## Stop Services
	-@$(CADDY) stop > /dev/null 2>&1 &
	-@if [ -f $(CADDY_PID_FILE) ]; then \
		kill -9 `cat $(CADDY_PID_FILE)`; \
		rm -f  $(CADDY_PID_FILE); \
	fi

.PHONY: serve
serve: ## Serve the application
	@$(PACKAGE_MANAGER) run dev --host

.PHONY: tests
tests: ## Run All the Tests
	@$(PACKAGE_MANAGER) run test
