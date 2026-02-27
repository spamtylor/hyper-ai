#!/bin/bash
# Ralph Loop - Autonomous code generator for Hyper
# Uses MiniMax API + Ollama on Titan

HYPER_ROOT="$HOME/Projects/hyper"
TASK_DIR="$HYPER_ROOT/src/taskboard/tasks"
LOG_DIR="$HYPER_ROOT/src/taskboard/logs"
MINIMAX_API="https://api.minimax.chat/v1/text/chatcompletion_pro"
OLLAMA="http://192.168.0.247:11434"

mkdir -p "$LOG_DIR"

log() {
    echo "[$(date +%H:%M:%S)] $1" | tee -a "$LOG_DIR/ralph-loop.log"
}

# Get next task
get_task() {
    local task=$(ls -t "$TASK_DIR"/*.json 2>/dev/null | head -1)
    if [ -n "$task" ]; then
        cat "$task"
    fi
}

# Use Ollama (local, free)
ollama_generate() {
    local prompt="$1"
    curl -s "$OLLAMA/api/generate" -d "{\"model\":\"qwen3:30b-a3b\",\"prompt\":\"$prompt\",\"stream\":false}" | jq -r '.response'
}

# Main loop
run_loop() {
    log "=== Ralph Loop Started ==="
    
    local task_count=0
    
    # Run up to 3 tasks per loop
    for i in 1 2 3; do
        local task_json=$(get_task)
        
        if [ -z "$task_json" ]; then
            log "No tasks in queue"
            break
        fi
        
        local task_id=$(echo "$task_json" | jq -r '.id')
        local title=$(echo "$task_json" | jq -r '.title')
        
        log "Working on: $title"
        
        # Generate code using Ollama
        local prompt="Create a bash script for Hyper AI. Task: $title. Write only code, no explanations."
        local code=$(ollama_generate "$prompt")
        
        # Write to file
        local filename="$HYPER_ROOT/src/generated/task_${task_id}.sh"
        echo "$code" > "$filename"
        chmod +x "$filename"
        
        log "Created: $filename"
        
        # Commit
        cd "$HYPER_ROOT"
        git add .
        git commit -m "Ralph: $title" 2>/dev/null
        git push 2>/dev/null
        
        task_count=$((task_count + 1))
        log "Completed task $i"
    done
    
    log "=== Ralph Loop Complete: $task_count tasks ==="
}

case "$1" in
    run) run_loop ;;
    *) echo "Usage: $0 run" ;;
esac
