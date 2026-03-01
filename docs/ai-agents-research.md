# AI Agents Research - March 2026

## Overview

AI agents are software systems that string together multiple processing steps, including LLM calls, to achieve desired results. They have conditional logic, decision-making capabilities, and working memory between steps.

## Current State (2026)

### The Shift from ReAct to Constrained Agents

**First Generation (ReAct):** 
- Reason-Act architecture with heavy abstraction
- Promised wide set of outcomes but struggled in practice
- Hard to use, didn't deliver on promises

**Second Generation:**
- Rigidly defined possible paths (smaller solution spaces)
- Trend toward reducing what each agent can do
- More powerful because easier to define
- Most agents today written in code without frameworks
- Have LLM router stage + iterative data processing loops

## Key Components

### Router
- Decides next step in agent execution
- Powered by LLM or classifier making intent decisions
- Uses function calling to select from defined actions
- Often needs most improvement in agent systems

### Components/Nodes
- Blocks of code for specific small tasks
- Can call LLM, make API calls, or run application code
- In LangGraph: nodes; in LlamaIndex: steps
- Can be grouped as skills/branches

### State/Memory
- Shared state tracked during execution
- Allows passing context between components

## When to Use Agents

Three criteria:
1. Iterative flow based on incoming data
2. Need to adapt/follow different flows based on actions/feedback
3. State space of actions that can be taken (non-linear)

## Common Problems

### Long-term Planning
- Models struggle to break complex tasks into steps
- Task decomposition is difficult
- Agents get stuck in loops, lose track of goals

### Solution Space Vastness
- Too many possible actions paths
- Inconsistent outcomes
- Expensive to run (more resources needed)
- **Trend:** Market pushing toward constrained agents with limited action sets

### Malformed Tooling Calls
- Poorly structured inputs cause failures
- Hard to recover without human intervention

## Solutions/Best Practices

1. **Map Solution Space Preemptively** - Define range of possible actions/outcomes to reduce ambiguity

2. **Incorporate Domain Heuristics** - Embed business-specific rules to guide decisions

3. **Be Explicit About Action Intentions** - Clearly define what each action accomplishes; modern frameworks encourage strict definitions

4. **Create Repeatable Processes** - Standardize steps and methodologies

## Frameworks

- **LangChain/LangGraph** - Control for custom workflows, human-in-the-loop, streaming
- **LlamaIndex Workflows** - Step-based agent building
- **CrewAI** - Multi-agent collaboration
- **Anthropic Computer Use** - Connect agents to external websites
- **OpenAI Operator** - Browser automation agents

### Architectures Supported
- Plan-and-execute
- Multi-agent systems
- Critique-Revise
- ReAct (foundational but limited)
- Self-ask

## Evaluation

Tools like **LangSmith** provide:
- End-to-end trace observability
- Tool selection visibility
- Playground for prompt/model/tool testing
- Cost, latency, error tracking
- LLM evaluators for agent runs

## Market Notes

- Few agents have taken off with consumer/enterprise users
- Despite popularity in AI ecosystem, limited real-world adoption
- Shift toward copilots that "write first drafts for review" vs fully autonomous
- Human-in-the-loop approval becoming standard pattern

---
*Researched: March 1, 2026*
*Sources: LangChain, Arize AI*
