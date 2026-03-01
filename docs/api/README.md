# Hyper API Reference

This document outlines the core modules, classes, and methods exposed by the Hyper autonomous agent project.

## Automation (`src/automation/`)

### `HyperScheduler`
A cron-based task executor and timeline manager.
- **`constructor()`**: Initializes a fresh scheduler with an empty task queue.
- **`scheduleTask(cronExpression, taskConfig)`**: Registers a task to run automatically according to standard cron syntax.
- **`runPending()`**: Triggers internal task execution blocks synchronously based on chronological triggers.

### `HyperHealth`
A system health and self-healing daemon monitor.
- **`constructor()`**: Initializes metrics storage.
- **`ping()`**: Simulates a basic liveness check for system core services.
- **`autoHeal(componentId)`**: Attempts context-aware reboot/repair cascades for failing project modules.

## Expansion (`src/expansion/`)

### `HyperCoordinator`
A multi-agent swarm task coordinator and delegated routing mechanism.
- **`constructor(availableRoles)`**: Bootstraps the coordinator with specific LLM sub-agent capabilities.
- **`delegateTask(role, taskDescription)`**: Unspools individual task boundaries synchronously to an autonomous node.
- **`runSwarm(tasks)`**: Concurrently resolves multiple delegated sub-agent assignments merging data upon completion.

### `HyperIntegration`
An abstract resilient API boundary fetcher.
- **`constructor(config)`**: Maps base domain targets and authorization payloads.
- **`request(endpoint, options)`**: Wraps external fetch configurations automatically validating edge cases.
- **`executeWithRetry(apiFn)`**: Secures error flow streams using an exponential backoff mathematical loop algorithm avoiding 429 limits gracefully.

### `HyperWorkflow`
Directed acyclic execution map logic module.
- **`constructor()`**: Assembles embedded workflow action capabilities.
- **`executeScript(workflowSteps, initialState)`**: Ingests JSON node trees parsing sequential instructions and aggregating internal context loops between node branches entirely independently.

## Intelligence (`src/intelligence/`)

### `HyperImprovement`
A self-correcting logic algorithm generator.
- **`evaluateLogs(logs)`**: Calculates algorithmic success metrics across execution matrices.
- **`generateImprovementPlan(evaluationResult)`**: Condenses failure streams into actionable context protocols.

### `HyperKnowledge`
A vector-driven document processing chunker and contextual searcher.
- **`ingestDocument(content)`**: Chunks and parses large raw strings into categorized embedded tokens.
- **`search(query)`**: Filters token blocks and correlates query similarity algorithms to trace best-fit semantic returns.

### `HyperLearning`
LLM synthetic long-term memory aggregation stream logic.
- **`extractFacts(text)`**: Dissects human/agent prompt conversations identifying concrete truths.
- **`learn(text)`**: Inserts extracted JSON data into the Qdrant memory injection stream pipeline.

## Memory (`src/memory/`)

### `HyperMemory`
A vector-based abstract memory persistence container.
- **`constructor()`**: Generates local memory collections schemas dynamically.
- **`storeFact(fact)`**: Safely pushes isolated JSON data trees into persistence memory arrays.
- **`retrieve(query)`**: Extracts deep search similarity traces for LLM context aggregation injections.

## Research (`src/research/`)

### `HyperResearch`
Perplexica and API fallback web-search utility nodes.
- **`constructor()`**: Assembles web search limits and parameters.
- **`search(query)`**: Ingests Google-style boolean requests tracing results instantly.
- **`synthesize(results)`**: Consolidates complex HTTP payload scraping arrays into plain-text summaries mapped effectively for human and LLM interpretation paths.
