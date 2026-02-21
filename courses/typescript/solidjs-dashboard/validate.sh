#!/usr/bin/env bash
set -euo pipefail

COURSE_DIR="$(cd "$(dirname "$0")" && pwd)"
COURSE_YAML="$COURSE_DIR/course.yaml"

# --- helpers ---
die()   { echo "ERROR: $*" >&2; exit 1; }
info()  { echo "==> $*"; }
cleanup() { [[ -n "${WORK_DIR:-}" && -d "${WORK_DIR:-}" ]] && rm -rf "$WORK_DIR"; }
trap cleanup EXIT

usage() {
  echo "Usage: $0 <lesson-number> [--solution]"
  echo ""
  echo "  lesson-number   Lesson to validate (e.g. 1, 2, 3)"
  echo "  --solution      Run tests against solution code instead of starter"
  echo ""
  echo "Examples:"
  echo "  $0 1              # test lesson 1 starter code"
  echo "  $0 2 --solution   # verify lesson 2 solution is correct"
  exit 1
}

# --- parse args ---
[[ $# -lt 1 ]] && usage

LESSON_NUM="$1"
MODE="starter"
[[ "${2:-}" == "--solution" ]] && MODE="solution"

# --- locate lesson ---
LESSON_DIR=$(printf "%s/lessons/%02d-*" "$COURSE_DIR" "$LESSON_NUM")
LESSON_DIR=$(compgen -G "$LESSON_DIR" | head -1) || true
[[ -d "$LESSON_DIR" ]] || die "Lesson $LESSON_NUM not found"

LESSON_NAME=$(basename "$LESSON_DIR")
info "Validating $LESSON_NAME ($MODE)"

# --- read language from course.yaml ---
if command -v yq &>/dev/null; then
  LANGUAGE=$(yq -r '.language' "$COURSE_YAML")
  TEST_RUNNER=$(yq -r '.test_runner // ""' "$COURSE_YAML")
else
  # fallback: grep-based extraction
  LANGUAGE=$(grep '^language:' "$COURSE_YAML" | awk '{print $2}' | tr -d '"')
  TEST_RUNNER=""
fi

[[ -z "$LANGUAGE" ]] && die "No language specified in course.yaml"

# --- build workspace ---
WORK_DIR=$(mktemp -d)
info "Workspace: $WORK_DIR"

# copy shared files
if [[ -d "$COURSE_DIR/shared" ]]; then
  cp -a "$COURSE_DIR/shared/." "$WORK_DIR/"
fi

# copy starter or solution code
if [[ -d "$LESSON_DIR/$MODE" ]]; then
  cp -a "$LESSON_DIR/$MODE/." "$WORK_DIR/"
fi

# copy tests
if [[ -d "$LESSON_DIR/tests" ]]; then
  cp -a "$LESSON_DIR/tests/." "$WORK_DIR/"
fi

# symlink node_modules if present (avoid slow reinstall)
if [[ -d "$COURSE_DIR/shared/node_modules" && ! -d "$WORK_DIR/node_modules" ]]; then
  ln -s "$COURSE_DIR/shared/node_modules" "$WORK_DIR/node_modules"
fi

# --- run tests ---
cd "$WORK_DIR"

if [[ -n "$TEST_RUNNER" ]]; then
  info "Running custom test runner: $TEST_RUNNER"
  eval "$TEST_RUNNER"
else
  case "$LANGUAGE" in
    go)
      go test -v -count=1 ./...
      ;;
    rust)
      cargo test
      ;;
    javascript|typescript)
      npm test
      ;;
    python)
      python -m pytest -v
      ;;
    kubernetes|shell)
      [[ -f tests/validate.sh ]] || die "No tests/validate.sh found"
      bash tests/validate.sh
      ;;
    *)
      die "Unsupported language: $LANGUAGE"
      ;;
  esac
fi

info "PASS: $LESSON_NAME ($MODE)"
