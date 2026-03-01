#!/bin/bash
# Ralph Loop - Autonomous code generator for Hyper
# Uses MiniMax API + Ollama on Titan

HYPER_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"
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
        local description=$(echo "$task_json" | jq -r '.description // "Implement standard requirements"')
        local mode=$(echo "$task_json" | jq -r '.mode // "build"')
        
        log "Working on: $title [$mode]"
        
        # Generate code using Ollama with advanced Build Context
        local prompt="You are Ralph, an elite autonomous architect for the 'Hyper' AI Framework. 
Your task is to: $title.
Description: $description.

Requirements:
1. OUTPUT ONLY A RAW BASH SCRIPT starting with #!/bin/bash. No markdown wrapping, no explanations. 
2. Use 'cat << 'EOF' > filename' commands to write the necessary files directly to the filesystem.
3. Place files in \$HYPER_ROOT/src/ or \$HYPER_ROOT/src/.
4. Make sure to generate BOTH the implementation file AND the Vitest .test.js file.
5. All code should be valid Node.js.

Generate the exact bash script to execute this task:"

        # Strip markdown logic to ensure the shell engine can run it safely
        local code=$("$HYPER_ROOT/src/ollama.sh" "$prompt" | jq -r '.response' | sed 's/```bash//g' | sed 's/```//g')
        
        # Write to file
        local filename="$HYPER_ROOT/src/generated/task_${task_id}.sh"
        echo "$code" > "$filename"
        chmod +x "$filename"
        
        log "Created execution context: $filename"
        
        # Execute generated structure!
        bash "$filename" >> "$LOG_DIR/ralph-loop.log" 2>&1
        log "Executed generated context. Moving task to archive."
        
        # Archive the task so the loop pulls the next item on the next tick
        local org_file=$(ls -t "$TASK_DIR"/*.json | head -1)
        mv "$org_file" "$HYPER_ROOT/src/taskboard/archive/"
        
        # Commit
        cd "$HYPER_ROOT"
        git add .
        git commit -m "Ralph ($mode): $title" 2>/dev/null
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
