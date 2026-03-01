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

# Generate autonomous task
generate_autonomous_task() {
    log "Queue empty. Autonomous task generation engaged."
    local prompt="You are Ralph, an elite autonomous architect for the 'Hyper' AI Framework. 
The task queue is empty. Invent a single new feature or expansion module that Hyper needs.
Output a strict JSON object with these fields: 'id' (e.g. AUTO-001), 'title', 'description', 'priority' (e.g. MEDIUM), and 'mode' (e.g. build). Do not output anything else except the JSON."

    local json_response=$("$HYPER_ROOT/src/ollama.sh" "$prompt" | jq -r '.response' | sed 's/```json//g' | sed 's/```//g')
    
    local task_id=$(echo "$json_response" | jq -r '.id')
    if [ "$task_id" != "null" ] && [ -n "$task_id" ]; then
        local filename="$TASK_DIR/task-${task_id}.json"
        echo "$json_response" > "$filename"
        log "Generated autonomous task: $task_id"
        cat "$filename"
    else
        log "Failed to generate valid autonomous task JSON."
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
            task_json=$(generate_autonomous_task)
            if [ -z "$task_json" ]; then
                log "Autonomous generation failed. Breaking loop segment."
                break
            fi
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
3. Place files in \$HYPER_ROOT/src/ or \$HYPER_ROOT/tests/.
4. Make sure to generate BOTH the implementation file AND the Vitest .test.js file.
5. ALL code must be valid Node.js and the test suite MUST achieve at least 80% code coverage.
6. The test file should include 'import { describe, it, expect, vi } from "vitest";' and use modern testing patterns.

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
        log "Executed generated context. Validating tests..."
        
        # Run tests for this specific task (best effort matching)
        local test_file=$(grep -oE "\$HYPER_ROOT/tests/[a-zA-Z0-9_-]+\.test\.js" "$filename" | head -1 | sed "s|\$HYPER_ROOT|$HYPER_ROOT|")
        if [ -f "$test_file" ]; then
            log "Running Vitest for $test_file..."
            if npx vitest run "$test_file" --coverage >> "$LOG_DIR/ralph-loop.log" 2>&1; then
                log "Tests passed! 80%+ coverage validated."
            else
                log "WARNING: Tests failed or coverage was below threshold. Check logs."
            fi
        else
            log "No specific test file identified in generated script. Skipping validation."
        fi

        log "Moving task to archive."
        
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

run_daemon() {
    log "Starting Ralph Daemon Mode (24/7 Continuous Loop)"
    while true; do
        run_loop
        log "Sleeping for 60 seconds before next cycle..."
        sleep 60
    done
}

case "$1" in
    run) run_loop ;;
    daemon) run_daemon ;;
    *) echo "Usage: $0 {run|daemon}" ;;
esac
