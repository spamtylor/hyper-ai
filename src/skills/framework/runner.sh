#!/bin/bash
# Skill Runner - Executes Hyper skills
# Usage: ./runner.sh <skill-name> [input]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(dirname "$SCRIPT_DIR")"

run_skill() {
    local skill_name="$1"
    local input="${2:--}"
    local skill_dir=""
    
    # Check direct match first
    if [[ -d "$SKILLS_DIR/$skill_name" ]]; then
        skill_dir="$SKILLS_DIR/$skill_name"
    # Then check subdirectories
    elif [[ -d "$SKILLS_DIR/examples/$skill_name" ]]; then
        skill_dir="$SKILLS_DIR/examples/$skill_name"
    elif [[ -d "$SKILLS_DIR/custom/$skill_name" ]]; then
        skill_dir="$SKILLS_DIR/custom/$skill_name"
    else
        echo "Error: Skill '$skill_name' not found" >&2
        return 1
    fi
    
    local run_script="$skill_dir/run.sh"
    if [[ ! -f "$run_script" ]]; then
        echo "Error: Skill '$skill_name' has no run.sh" >&2
        return 1
    fi
    
    chmod +x "$run_script"
    
    # Run the skill with input
    if [[ "$input" == "-" ]]; then
        # Read from stdin
        "$run_script" </dev/stdin
    else
        "$run_script" "$input"
    fi
}

list_available() {
    echo "Available skills:"
    # Direct skills
    for dir in "$SKILLS_DIR"/*/; do
        if [[ -f "$dir/run.sh" ]]; then
            local name=$(basename "$dir")
            local desc=""
            [[ -f "$dir/skill.yaml" ]] && desc=$(grep "^description:" "$dir/skill.yaml" | head -1 | cut -d: -f2- | xargs)
            [[ -f "$dir/skill.yml" ]] && desc=$(grep "^description:" "$dir/skill.yml" | head -1 | cut -d: -f2- | xargs)
            echo "  $name: $desc"
        fi
    done
    # Example skills
    if [[ -d "$SKILLS_DIR/examples" ]]; then
        for dir in "$SKILLS_DIR/examples"/*/; do
            if [[ -f "$dir/run.sh" ]]; then
                local name=$(basename "$dir")
                local desc=""
                [[ -f "$dir/skill.yaml" ]] && desc=$(grep "^description:" "$dir/skill.yaml" | head -1 | cut -d: -f2- | xargs)
                [[ -f "$dir/skill.yml" ]] && desc=$(grep "^description:" "$dir/skill.yml" | head -1 | cut -d: -f2- | xargs)
                echo "  $name (example): $desc"
            fi
        done
    fi
}

case "${1:-}" in
    run)
        run_skill "$2" "$3"
        ;;
    list|available)
        list_available
        ;;
    help|--help|-h)
        echo "Usage: runner.sh <command> [args]"
        echo ""
        echo "Commands:"
        echo "  run <skill-name> [input]  Run a skill"
        echo "  list                       List available skills"
        echo "  help                       Show this help"
        echo ""
        echo "Examples:"
        echo "  ./runner.sh run github-trending 'python|weekly'"
        echo "  echo 'query' | ./runner.sh run search -"
        ;;
    *)
        if [[ -n "$1" ]]; then
            run_skill "$1" "$2"
        else
            list_available
        fi
        ;;
esac
