.PHONY: test-lesson test-all validate-solution setup

SHELL := /bin/bash
LESSONS := $(sort $(wildcard lessons/*/))
N ?= 1
LESSON_DIR := $(word $(N),$(LESSONS))

setup:
	@bash shared/setup.sh

test-lesson: setup
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🧪 Testing lesson $(N): $(LESSON_DIR)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@cd $(LESSON_DIR) && bash tests/validate.sh starter

validate-solution: setup
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✅ Validating solution for lesson $(N): $(LESSON_DIR)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@cd $(LESSON_DIR) && bash tests/validate.sh solution

test-all: setup
	@FAIL=0; \
	IDX=1; \
	for lesson in $(LESSONS); do \
		echo ""; \
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
		echo "✅ Validating solution for lesson $$IDX: $$lesson"; \
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
		(cd $$lesson && bash tests/validate.sh solution) || FAIL=1; \
		IDX=$$((IDX + 1)); \
	done; \
	exit $$FAIL
