#!/bin/bash
# Hyper TaskBoard - Self-hosted task management
# No cloud, no payments, 100% free

HYPER_ROOT="$HOME/Projects/hyper"
TASK_DIR="$HYPER_ROOT/src/taskboard/tasks"
LOG_DIR="$HYPER_ROOT/src/taskboard/logs"
ARCHIVE_DIR="$HYPER_ROOT/src/taskboard/archive"

# Ensure directories exist
mkdir -p "$TASK_DIR" "$LOG_DIR" "$ARCHIVE_DIR"

# Get timestamp
TIMESTAMP=$(date +%s)
DATE=$(date +%Y-%m-%d)

case "$1" in
    add)
        # Usage: taskboard.sh add "Task title" [priority]
        TITLE="$2"
        PRIORITY="${3:-medium}"
        echo "{\"id\":\"$TIMESTAMP\",\"title\":\"$TITLE\",\"priority\":\"$PRIORITY\",\"status\":\"pending\",\"created\":\"$DATE\",\"worker\":\"hyper\"}" > "$TASK_DIR/$TIMESTAMP.json"
        echo "Task added: $TIMESTAMP"
        ;;
    
    list)
        # List pending tasks sorted by priority
        echo "=== PENDING TASKS ==="
        for f in "$TASK_DIR"/*.json; do
            [ -f "$f" ] || break
            echo "$(basename "$f" .json): $(cat "$f" | grep -o '"title":"[^"]*"' | cut -d'"' -f4) [$(cat "$f" | grep -o '"priority":"[^"]*"' | cut -d'"' -f4)]"
        done
        ;;
    
    complete)
        # Usage: taskboard.sh complete [id]
        ID="$2"
        if [ -f "$TASK_DIR/$ID.json" ]; then
            sed -i '' 's/pending/completed/' "$TASK_DIR/$ID.json"
            mv "$TASK_DIR/$ID.json" "$ARCHIVE_DIR/"
            echo "Task completed: $ID"
        else
            echo "Task not found: $ID"
        fi
        ;;
    
    log)
        # Usage: taskboard.sh log "Work description"
        echo "[$DATE $(date +%H:%M:%S)] $2" >> "$LOG_DIR/$DATE.log"
        ;;
    
    today)
        # Show today's work
        echo "=== WORK LOG $DATE ==="
        cat "$LOG_DIR/$DATE.log" 2>/dev/null || echo "No work logged yet"
        ;;
    
    *)
        echo "Hyper TaskBoard"
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  add \"title\" [priority]  - Add new task"
        echo "  list                      - List pending tasks"
        echo "  complete [id]             - Mark task complete"
        echo "  log \"message\"             - Log work"
        echo "  today                     - Show today's log"
        ;;
esac
