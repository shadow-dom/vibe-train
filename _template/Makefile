.PHONY: test-lesson test-all validate-solution help

N ?= 1

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  make %-20s %s\n", $$1, $$2}'

test-lesson: ## Validate a lesson (make test-lesson N=1)
	@./validate.sh $(N)

test-all: ## Validate all lessons in order
	@for dir in lessons/*/; do \
		num=$$(basename "$$dir" | grep -o '^[0-9]*'); \
		echo ""; \
		./validate.sh "$$num" || exit 1; \
	done
	@echo ""
	@echo "All lessons passed!"

validate-solution: ## Run tests against solution code (make validate-solution N=1)
	@./validate.sh $(N) --solution
