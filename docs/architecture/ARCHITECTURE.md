# Hyper Architecture

## Project Overview

**Hyper** is an autonomous AI assistant project forked from OpenClaw. It's designed to be a self-hosted AI agent with research, automation, and learning capabilities.

## Current Directory Structure

```
~/Projects/hyper/
├── docs/                    # Documentation
│   ├── api/                 # API reference (empty - TODO)
│   ├── architecture/        # Architecture docs (empty - TODO)
│   ├── roadmap/             # Roadmap items (empty - TODO)
│   └── openclaw-analysis.md # Original OpenClaw source analysis
├── src/                     # Source code
│   ├── automation/          # Automation scripts (empty - TODO)
│   ├── memory/              # Memory/learning system (empty - TODO)
│   ├── research/            # Research capabilities (empty - TODO)
│   ├── skills/              # Custom skills (empty - TODO)
│   └── taskboard/           # Task management system ✓
│       ├── taskboard.sh     # CLI for task management
│       ├── README.md        # TaskBoard documentation
│       ├── tasks/           # Pending tasks (JSON files)
│       ├── logs/            # Daily execution logs
│       └── archive/         # Completed tasks
├── tests/                   # Test suites (empty - TODO)
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── reviews/                 # Code reviews (empty - TODO)
├── DASHBOARD.md             # Daily schedule/cron dashboard
├── TESTING.md              # Test coverage standards (75-80%)
└── .git/                    # Git repository
```

## Components

### TaskBoard (✓ Implemented)
- **Purpose:** Self-hosted task management for autonomous AI work
- **Location:** `src/taskboard/`
- **Features:**
  - Add/complete tasks with priority levels (high/medium/low)
  - Daily execution logs
  - Archive for completed tasks
  - Cron-based daily schedule (11 automated tasks per day)

### Planned Components

#### Memory System (`src/memory/`)
- **Purpose:** Long-term knowledge storage
- **Status:** Not started
- **Planned:** Vector-based memory using Qdrant

#### Research (`src/research/`)
- **Purpose:** Web search and knowledge gathering
- **Status:** Not started
- **Planned:** Integration with Perplexica, web search APIs

#### Automation (`src/automation/`)
- **Purpose:** Scheduled tasks and self-healing
- **Status:** Not started
- **Planned:** Cron jobs, health checks, automated workflows

#### Skills (`src/skills/`)
- **Purpose:** Custom agent capabilities
- **Status:** Not started
- **Planned:** Forked from OpenClaw skills + custom additions

## Documentation Structure

| Directory | Status | Purpose |
|-----------|--------|---------|
| `docs/api/` | TODO | API endpoints and interfaces |
| `docs/architecture/` | TODO | Detailed component specs |
| `docs/roadmap/` | TODO | Feature roadmap and milestones |

## Test Standards

From `TESTING.md`:
- **Minimum Coverage:** 75%
- **Target Coverage:** 80%
- **Distribution:** 40% unit, 30% integration, 30% e2e

## Daily Workflow

Automated via cron (see `DASHBOARD.md`):
1. 6 AM - Morning Load
2. 7 AM - Research
3. 9 AM - OpenClaw + Twitter
4. 10 AM - Build Session 1
5. 12 PM - Lunch Research
6. 2 PM - Build Session 2
7. 3 PM - Afternoon Build
8. 5 PM - Pre-Evening
9. 6 PM - Evening Prep
10. 8 PM - Night Build
11. 9 PM - Deep Research
12. 10 PM - Daily Report

## Tech Stack (Planned)

- **Runtime:** Node.js v22 + Python 3.13
- **Memory:** Qdrant (vector database)
- **Search:** Perplexica (self-hosted AI search)
- **Deployment:** Docker Compose
- **Testing:** Vitest

## Git History

```
da6e112 Add TaskBoard system and full day cron schedule
c1fc8ed Add test coverage standards (75-80% requirement)
c3cda22 Initial commit: Hyper project structure
```

## Next Steps

1. Implement memory system (`src/memory/`)
2. Build research capabilities (`src/research/`)
3. Add automation scripts (`src/automation/`)
4. Create custom skills (`src/skills/`)
5. Fill in `docs/api/`, `docs/architecture/`, `docs/roadmap/`
6. Add tests to reach 75% coverage
