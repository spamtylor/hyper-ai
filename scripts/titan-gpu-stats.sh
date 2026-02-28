#!/bin/bash
# Quick GPU stats for Titan (AMD Radeon 8060S via ROCm)
# Usage: ./titan-gpu-stats.sh

ssh root@192.168.0.247 "rocm-smi -t -u -p --showmemuse --csv" 2>/dev/null || echo "Titan unreachable or rocm-smi not available"
