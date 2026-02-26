#!/bin/bash
# {{skill_name}} Skill
# Description: {{description}}
# Usage: ./run.sh <input>

set -e

INPUT="${1:-}"
if [[ -z "$INPUT" ]]; then
    echo "Usage: $0 <input>"
    echo "Example: $0 something"
    exit 1
fi

echo "Running {{skill_name}} with input: $INPUT"

# Your skill logic here
# ...

echo "{{skill_name}} completed"
