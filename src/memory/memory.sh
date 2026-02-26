#!/bin/bash
# Hyper Memory System

MEMORY_DIR="$HOME/Projects/hyper/src/memory"

mkdir -p "$MEMORY_DIR/conversations"
mkdir -p "$MEMORY_DIR/facts"
mkdir -p "$MEMORY_DIR/preferences"

save() {
    echo "$3" > "$MEMORY_DIR/$2/$1.txt"
}

get() {
    cat "$MEMORY_DIR/$2/$1.txt" 2>/dev/null
}

case "$1" in
    save) save "$2" "$3" "$4" ;;
    get) get "$2" "$3" ;;
    *) echo "Memory: save key type value | get key type" ;;
esac
