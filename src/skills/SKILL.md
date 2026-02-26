---
name: hyper-core
description: |
  Hyper Core - Custom skill framework for autonomous AI agent
  Provides structure for research, building, and self-improvement skills
metadata:
  openclaw:
    emoji: "⚡"
---

# Hyper Core Skill Framework

## Overview
Hyper uses a skill-based architecture for modular capabilities. Each skill is a self-contained unit that can be loaded, executed, and composed.

## Skill Structure
```
src/skills/
├── SKILL.md          # This file
├── framework/        # Core skill loading/execution
│   ├── loader.sh
│   └── runner.sh
├── examples/         # Example skill implementations
│   ├── github-trending/
│   └── fmhy-search/
└── custom/           # User-defined skills go here
```

## Writing a Skill
Each skill needs:
1. `skill.yaml` - Skill metadata and config
2. `run.sh` - Main execution script
3. `README.md` - Documentation

## Skill Metadata (skill.yaml)
```yaml
name: skill-name
description: What this skill does
version: 1.0.0
author: hyper
capabilities:
  - research
  - build
triggers:
  - cron: "0 9 * * *"
  - command: "research <topic>"
```

## Loading Skills
Skills are loaded from `src/skills/` directories. The framework scans for `skill.yaml` files and registers capabilities.

## Execution
- Direct: `./run.sh <input>`
- Via framework: `../framework/runner.sh <skill-name> <input>`
- Composed: Skills can call other skills

## Example Usage
```bash
# Run a skill directly
./custom/my-skill/run.sh "query"

# Via framework
../framework/runner.sh github-trending "python|weekly"

# Chain skills
./skill-a/run.sh output | ./skill-b/run.sh -
```

## Integration with OpenClaw
Hyper skills can be invoked via OpenClaw's skill system or run standalone.
