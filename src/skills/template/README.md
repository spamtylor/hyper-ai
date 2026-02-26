# Skill Template

Use this template to create new Hyper skills.

## Quick Start

1. Copy the template directory:
   ```bash
   cp -r template my-new-skill
   cd my-new-skill
   ```

2. Edit `skill.yaml`:
   - Replace `{{skill_name}}` with your skill name
   - Replace `{{description}}` with a brief description
   - Update capabilities and triggers

3. Edit `run.sh`:
   - Add your skill logic
   - Make sure to handle errors gracefully

4. Test your skill:
   ```bash
   ./run.sh test-input
   ```

5. Load it:
   ```bash
   ../framework/loader.sh load my-new-skill
   ```

## Skill Structure

```
my-skill/
├── skill.yaml    # Metadata and configuration
├── run.sh        # Main skill logic
├── README.md     # Documentation (optional)
└── *.sh          # Additional scripts (optional)
```

## skill.yaml Fields

| Field | Required | Description |
|-------|----------|-------------|
| name | yes | Skill identifier |
| description | yes | What the skill does |
| version | yes | Semantic version |
| author | no | Who created it |
| capabilities | no | List of capabilities |
| triggers | no | How to invoke |
| output | no | Output configuration |
| requirements | no | Dependencies |

## Best Practices

- Keep `run.sh` focused and single-purpose
- Add proper error handling with `set -e`
- Document complex logic in comments
- Save research/outputs to `../research/`
- Log progress with timestamps
