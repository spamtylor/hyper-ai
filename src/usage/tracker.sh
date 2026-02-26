#!/bin/bash
# Hyper Usage Tracker - Self-hosted, free, no external services
# Tracks tokens, rate limits, session time, task completion speed

HYPER_ROOT="$HOME/Projects/hyper"
DATA_DIR="$HYPER_ROOT/src/usage/data"
mkdir -p "$DATA_DIR"

DATE=$(date +%Y-%m-%d)
DATETIME=$(date +%Y-%m-%d\ %H:%M:%S)

case "$1" in
    start)
        # Start tracking an activity
        echo "$DATETIME|$2|started" >> "$DATA_DIR/activity_$DATE.log"
        echo "Tracking started: $2"
        ;;
    
    complete)
        # Complete a task and track speed
        START=$(grep "$2|started" "$DATA_DIR/activity_$DATE.log" | tail -1 | cut -d'|' -f1)
        if [ -n "$START" ]; then
            START_SEC=$(date -j -f "%Y-%m-%d %H:%M:%S" "$START" +%s 2>/dev/null || echo 0)
            END_SEC=$(date +%s)
            DURATION=$((END_SEC - START_SEC))
            echo "$DATETIME|$2|completed|$DURATION" >> "$DATA_DIR/activity_$DATE.log"
            echo "Task completed in ${DURATION} seconds: $2"
        fi
        ;;
    
    tokens)
        # Log token usage
        MODEL="$2"
        TOKENS="$3"
        echo "$DATETIME|tokens|$MODEL|$TOKENS" >> "$DATA_DIR/tokens_$DATE.log
        echo "Logged $TOKENS tokens for $MODEL"
        ;;
    
    rate-limit)
        # Log rate limit hit
        WAIT="$2"
        echo "$DATETIME|rate-limit|$WAIT" >> "$DATA_DIR/ratelimits_$DATE.log"
        echo "Rate limit hit, waited ${WAIT}s"
        ;;
    
    stats)
        # Show stats for today or date
        TARGET_DATE="${2:-$DATE}"
        
        echo "=== HYPER USAGE STATS: $TARGET_DATE ==="
        echo ""
        
        # Tasks completed
        echo "Tasks Completed:"
        grep "completed" "$DATA_DIR/activity_$TARGET_DATE.log" 2>/dev/null | wc -l | xargs echo "  Total:"
        
        # Average time per task
        echo ""
        echo "Average Task Duration:"
        grep "completed" "$DATA_DIR/activity_$TARGET_DATE.log" | cut -d'|' -f4 | awk '{sum+=$1; count++} END {if(count>0) print "  " int(sum/count) " seconds/task"}'
        
        # Tokens used
        echo ""
        echo "Token Usage:"
        cut -d'|' -f3,4 "$DATA_DIR/tokens_$TARGET_DATE.log" 2>/dev/null | sort | uniq -c | while read count model tokens; do
            echo "  $model: $tokens tokens"
        done
        
        # Rate limits
        echo ""
        echo "Rate Limits Hit:"
        wc -l "$DATA_DIR/ratelimits_$TARGET_DATE.log" 2>/dev/null | xargs echo "  Total:"
        ;;
    
    speed)
        # Speed analysis
        echo "=== SPEED ANALYSIS ==="
        echo ""
        
        # Tasks by duration
        echo "Fastest Tasks:"
        cut -d'|' -f2,4 "$DATA_DIR/activity_$DATE.log" | grep completed | sort -t'|' -k2 -n | head -5 | while read task dur; do
            echo "  ${dur}s - $task"
        done
        
        echo ""
        echo "Slowest Tasks:"
        cut -d'|' -f2,4 "$DATA_DIR/activity_$DATE.log" | grep completed | sort -t'|' -k2 -rn | head -5 | while read task dur; do
            echo "  ${dur}s - $task"
        done
        ;;
    
    *)
        echo "Hyper Usage Tracker"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  start <task>       - Start tracking a task"
        echo "  complete <task>    - Mark task complete (tracks speed)"
        echo "  tokens <model> <n> - Log token usage"
        echo "  rate-limit <sec>  - Log rate limit hit"
        echo "  stats [date]       - Show usage stats"
        echo "  speed              - Speed analysis"
        ;;
esac
