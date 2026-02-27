# Ralph Loop Plan for Hyper - FINAL

## Two AI Sources

### 1. MiniMax API (Primary)
- Used for: Complex code, architecture, reasoning
- Model: MiniMax-M2.5
- Status: Already configured, rarely hits limits

### 2. Ollama on Titan (Backup/Local)
- Used for: Small scripts, quick tasks, backups
- Model: qwen3:30b-a3b
- Endpoint: 192.168.0.247:11434

## Ralph Loop Process

```
START
├── Get task from queue
├── If complex → Use MiniMax API
├── If simple → Use Ollama (Titan)
├── Generate code
├── Write to file
├── Commit to GitHub
├── Log progress
└── Repeat
```

## Usage Monitoring

### MiniMax Limits
- Track tokens used
- Switch to Ollama if getting close

### Ollama (Titan)
- Unlimited local usage
- No rate limits
- Fast on local network

## Code Generation Strategy

| Task Type | AI Source | Why |
|-----------|-----------|-----|
| Full features | MiniMax | Better reasoning |
| Bug fixes | MiniMax | Complex context |
| Simple scripts | Ollama | Fast, free |
| Research | MiniMax | Quality |
| Documentation | Ollama | Simple |

## Cron Schedule
- Run Ralph Loop every hour
- Each run: 2-3 tasks
- Estimated: 40-60 tasks/day

## Execution Command
```bash
cd ~/Projects/hyper
./src/ralph-loop.sh run
```

## Commit Protocol
- Auto-commit after each task
- Push to GitHub
- Log to taskboard

---

This gives us:
- MiniMax for quality (already configured)
- Ollama for speed/backup (local Titan)
- Never hit rate limits
- Continuous autonomous building
