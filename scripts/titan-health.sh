#!/bin/bash
# Titan Health Monitor - Comprehensive status check for Titan (.247)
# Checks GPU, services, disk, memory - useful for Hoss heartbeat integration
# Usage: ./titan-health.sh [--json]

JSON_MODE=false
if [[ "$1" == "--json" ]]; then
  JSON_MODE=true
fi

HOST="root@192.168.0.247"
TIMEOUT=10

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Results (using simple variables)
gpu_temp=0
gpu_usage=0
gpu_mem=0
gpu_status="unknown"
ollama_status="down"
comfy_status="down"
mkdocs_status="down"
xtts_status="down"
qdrant_status="down"
disk_pct=0
memory_info="unknown"
overall_status="healthy"

# Helper function to check service
check_service() {
  local service_name=$1
  local port=$2
  local endpoint=${3:-""}
  
  if [[ -n "$endpoint" ]]; then
    response=$(curl -s --max-time 5 "http://192.168.0.247:${port}${endpoint}" 2>/dev/null)
  else
    response=$(nc -zv 192.168.0.247 $port 2>&1)
  fi
  
  if [[ $? -eq 0 ]]; then
    echo "up"
  else
    echo "down"
  fi
}

# Check GPU Stats
echo "Checking GPU..."
gpu_output=$(ssh -o ConnectTimeout=$TIMEOUT $HOST "rocm-smi -t -u -p --showmemuse --csv 2>/dev/null" 2>/dev/null)
if [[ $? -eq 0 && -n "$gpu_output" ]]; then
  # Extract values - macOS compatible grep
  gpu_temp=$(echo "$gpu_output" | grep -Eo '[0-9]+\.[0-9]+' | head -1)
  gpu_usage=$(echo "$gpu_output" | awk -F',' '{gsub(/[^0-9]/,"",$3); print $3}' | head -1)
  gpu_mem=$(echo "$gpu_output" | awk -F',' '{gsub(/[^0-9]/,"",$4); print $4}' | tail -1)
  
  # Clean up
  gpu_temp=${gpu_temp%.0}
  gpu_usage=${gpu_usage:-0}
  gpu_mem=${gpu_mem:-0}
  
  # Temperature alert
  if [[ $gpu_temp -gt 85 ]]; then
    gpu_status="warning"
    overall_status="warning"
    echo -e "${YELLOW}⚠️ GPU temperature high: ${gpu_temp}°C${NC}"
  elif [[ $gpu_temp -gt 0 ]]; then
    gpu_status="healthy"
    echo -e "${GREEN}✓ GPU: ${gpu_temp}°C, ${gpu_usage}% usage, ${gpu_mem}% VRAM${NC}"
  else
    gpu_status="unknown"
    overall_status="warning"
    echo -e "${RED}✗ GPU stats unavailable${NC}"
  fi
else
  gpu_status="unreachable"
  overall_status="error"
  echo -e "${RED}✗ Cannot reach Titan for GPU stats${NC}"
fi

# Check Services
echo "Checking services..."

# Ollama
ollama_check=$(curl -s --max-time 5 http://192.168.0.247:11434/api/tags 2>/dev/null)
if echo "$ollama_check" | grep -q "models"; then
  ollama_status="up"
  echo -e "${GREEN}✓ Ollama (11434)${NC}"
else
  echo -e "${RED}✗ Ollama (11434)${NC}"
  overall_status="warning"
fi

# ComfyUI
comfy_check=$(curl -s --max-time 5 http://192.168.0.247:8188/system_stats 2>/dev/null)
if [[ -n "$comfy_check" ]]; then
  comfy_status="up"
  echo -e "${GREEN}✓ ComfyUI (8188)${NC}"
else
  echo -e "${RED}✗ ComfyUI (8188)${NC}"
  overall_status="warning"
fi

# MkDocs
mkdocs_status_code=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" http://192.168.0.247:8888/ 2>/dev/null)
if [[ "$mkdocs_status_code" == "200" ]]; then
  mkdocs_status="up"
  echo -e "${GREEN}✓ MkDocs (8888)${NC}"
else
  echo -e "${RED}✗ MkDocs (8888)${NC}"
  overall_status="warning"
fi

# XTTS
xtts_check=$(curl -s --max-time 5 http://192.168.0.247:8189/health 2>/dev/null)
if echo "$xtts_check" | grep -qiE "(healthy|true|ok)"; then
  xtts_status="up"
  echo -e "${GREEN}✓ XTTS (8189)${NC}"
else
  echo -e "${RED}✗ XTTS (8189)${NC}"
  overall_status="warning"
fi

# Qdrant
qdrant_check=$(curl -s --max-time 5 http://192.168.0.247:6333/collections 2>/dev/null)
if echo "$qdrant_check" | grep -q "result"; then
  qdrant_status="up"
  echo -e "${GREEN}✓ Qdrant (6333)${NC}"
else
  echo -e "${RED}✗ Qdrant (6333)${NC}"
  overall_status="warning"
fi

# Check Disk Space on Titan
echo "Checking disk..."
disk_output=$(ssh -o ConnectTimeout=$TIMEOUT $HOST "df -h / | tail -1 | awk '{print \$5}'" 2>/dev/null)
if [[ -n "$disk_output" ]]; then
  disk_pct=${disk_output%\%}
  if [[ $disk_pct -gt 90 ]]; then
    echo -e "${RED}✗ Disk usage: ${disk_pct}% (critical)${NC}"
    overall_status="error"
  elif [[ $disk_pct -gt 80 ]]; then
    echo -e "${YELLOW}⚠️ Disk usage: ${disk_pct}% (high)${NC}"
    overall_status="warning"
  else
    echo -e "${GREEN}✓ Disk usage: ${disk_pct}%${NC}"
  fi
else
  echo -e "${RED}✗ Cannot check disk${NC}"
  overall_status="warning"
fi

# Check Memory on Titan
echo "Checking memory..."
mem_output=$(ssh -o ConnectTimeout=$TIMEOUT $HOST "free -h | grep Mem | awk '{print \$3\"/\"\$2}'" 2>/dev/null)
if [[ -n "$mem_output" ]]; then
  memory_info="$mem_output"
  echo -e "${GREEN}✓ Memory: ${mem_output}${NC}"
else
  echo -e "${RED}✗ Cannot check memory${NC}"
  overall_status="warning"
fi

# Summary
echo ""
echo "========================================"
case $overall_status in
  healthy)
    echo -e "${GREEN}🎯 Overall: HEALTHY${NC}"
    ;;
  warning)
    echo -e "${YELLOW}⚠️ Overall: WARNINGS${NC}"
    ;;
  *)
    echo -e "${RED}✗ Overall: ERRORS${NC}"
    ;;
esac
echo "========================================"

# JSON output if requested
if [[ "$JSON_MODE" == "true" ]]; then
  echo "{"
  echo "  \"timestamp\": \"$(date -Iseconds)\","
  echo "  \"overall\": \"$overall_status\","
  echo "  \"gpu\": {"
  echo "    \"temp\": ${gpu_temp:-0},"
  echo "    \"usage\": ${gpu_usage:-0},"
  echo "    \"memory\": ${gpu_mem:-0},"
  echo "    \"status\": \"$gpu_status\""
  echo "  },"
  echo "  \"services\": {"
  echo "    \"ollama\": \"$ollama_status\","
  echo "    \"comfyui\": \"$comfy_status\","
  echo "    \"mkdocs\": \"$mkdocs_status\","
  echo "    \"xtts\": \"$xtts_status\","
  echo "    \"qdrant\": \"$qdrant_status\""
  echo "  },"
  echo "  \"system\": {"
  echo "    \"disk_pct\": \"$disk_pct\","
  echo "    \"memory\": \"$memory_info\""
  echo "  }"
  echo "}"
fi

# Exit with appropriate code
case $overall_status in
  healthy) exit 0 ;;
  warning) exit 1 ;;
  *) exit 2 ;;
esac
