#!/bin/bash
# MCP stdio logger — logs both requests (stdin) and responses (stdout)
LOG_DIR="/tmp/mcp-dump"
mkdir -p "$LOG_DIR"
TS=$(date +%s)
REQ_LOG="$LOG_DIR/req-$TS.jsonl"
RESP_LOG="$LOG_DIR/resp-$TS.jsonl"

tee "$REQ_LOG" | xcrun mcpbridge | tee "$RESP_LOG"
