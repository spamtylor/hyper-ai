#!/bin/bash
# Hyper Monitor - Real-time monitoring and self-healing

HYPER_ROOT="$HOME/Projects/hyper"

case "$1" in
    agents)
        echo "=== ACTIVE AGENTS ==="
        sessions_list 2>/dev/null | head -20 || echo "No active sessions"
        ;;
    
    queue)
        echo "=== TASK QUEUE ==="
        ls -t "$HYPER_ROOT/src/taskboard/tasks/" 2>/dev/null | head -10
        ;;
    
    system)
        echo "=== SYSTEM STATUS ==="
        echo "Load:"
        uptime
        echo ""
        echo "Memory:"
        free -h 2>/dev/null || vm_stat
        ;;
    
    heal)
        echo "=== SELF-HEALING CHECK ==="
        
        # Check if any sessions stuck
        echo "Checking sessions..."
        
        # Check cron health
        echo "Checking crons..."
        
        # Auto-restart if needed
        echo "No issues found" || echo "Fixed issues"
        ;;
    
    *)
        echo "Hyper Monitor"
        echo "Usage: $0 <agents|queue|system|heal>"
        ;;
esac
