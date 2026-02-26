# Hyper API Documentation

> Status: TODO - API not yet implemented

## Overview

This directory will contain API reference documentation for Hyper's internal and external interfaces.

## Planned Endpoints

### TaskBoard API
- `GET /tasks` - List all pending tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Mark task complete

### Memory API
- `POST /memory` - Store memory vector
- `GET /memory/search` - Search memories
- `DELETE /memory/:id` - Remove memory

### Research API
- `POST /research` - Run research query
- `GET /research/:id` - Get research results

## Authentication

TBD - Based on OpenClaw authentication system

## Response Format

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Rate Limits

TBD
