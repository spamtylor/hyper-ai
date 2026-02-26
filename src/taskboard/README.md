# Hyper TaskBoard

## Overview
Self-hosted task management for autonomous AI work.

## Features
- Add/complete tasks
- Track progress
- Daily logs
- Archive completed

## Commands
```bash
# Add task
./taskboard.sh add "Research AI agents" high

# List pending
./taskboard.sh list

# Complete task
./taskboard.sh complete 1234567890

# View daily log
cat logs/2026-02-26.log
```

## Task Priorities
- high: Must do today
- medium: Do if time allows
- low: Nice to have

## Daily Workflow
1. Morning: Load tasks from queue
2. Work throughout day
3. Evening: Log progress
4. Archive completed

## View Progress
```bash
# Today's logs
cat logs/$(date +%Y-%m-%d).log

# All pending tasks
ls tasks/

# Completed today
ls archive/ | grep $(date +%s)
```
