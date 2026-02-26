#!/bin/bash
# Skill Loader - Scans and loads Hyper skills
# Usage: ./loader.sh [list|enabled|disabled|load <skill-name>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(dirname "$SCRIPT_DIR")"
CACHE_DIR="$SKILLS_DIR/.cache"

# Ensure cache directory exists
mkdir -p "$CACHE_DIR"

list_skills() {
    echo "=== Available Skills ==="
    # Scan direct skills and subdirectory skills
    for dir in "$SKILLS_DIR"/*/; do
        if [[ -f "$dir/skill.yaml" ]] || [[ -f "$dir/skill.yml" ]]; then
            local name=$(basename "$dir")
            local status="disabled"
            [[ -f "$CACHE_DIR/${name}.enabled" ]] && status="enabled"
            echo "  $name [$status]"
        fi
    done
    # Also scan examples/ and custom/ subdirectories
    for subdir in examples custom; do
        if [[ -d "$SKILLS_DIR/$subdir" ]]; then
            for dir in "$SKILLS_DIR/$subdir"/*/; do
                if [[ -f "$dir/skill.yaml" ]] || [[ -f "$dir/skill.yml" ]]; then
                    local name=$(basename "$dir")
                    local status="disabled"
                    [[ -f "$CACHE_DIR/${name}.enabled" ]] && status="enabled"
                    echo "  $name [$status] (from $subdir)"
                fi
            done
        fi
    done
}

load_skill() {
    local skill_name="$1"
    local skill_dir="$SKILLS_DIR/$skill_name"
    
    if [[ ! -d "$skill_dir" ]]; then
        echo "Error: Skill '$skill_name' not found" >&2
        return 1
    fi
    
    if [[ ! -f "$skill_dir/run.sh" ]]; then
        echo "Error: Skill '$skill_name' has no run.sh" >&2
        return 1
    fi
    
    # Mark as enabled
    touch "$CACHE_DIR/${skill_name}.enabled"
    echo "Loaded skill: $skill_name"
}

disable_skill() {
    local skill_name="$1"
    rm -f "$CACHE_DIR/${skill_name}.enabled"
    echo "Disabled skill: $skill_name"
}

is_enabled() {
    local skill_name="$1"
    [[ -f "$CACHE_DIR/${skill_name}.enabled" ]]
}

case "${1:-list}" in
    list)
        list_skills
        ;;
    load)
        load_skill "$2"
        ;;
    disable)
        disable_skill "$2"
        ;;
    is-enabled)
        is_enabled "$2" && echo "true" || echo "false"
        ;;
    *)
        echo "Usage: $0 {list|load|disable|is-enabled} [skill-name]"
        exit 1
        ;;
esac
