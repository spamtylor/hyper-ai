# GitHub Trending Skill

Research trending GitHub repositories by programming language and time period.

## Usage

```bash
./run.sh [language|period]
```

## Examples

```bash
# Python repos trending today
./run.sh python

# Python repos trending this week
./run.sh "python|weekly"

# JavaScript monthly
./run.sh "javascript|monthly"

# All languages, daily
./run.sh
```

## Output

Saves results to `../../research/github-trending/` with timestamp.

## Requirements

- `curl` - for web requests
- Optional: `gh` CLI for GitHub API access
