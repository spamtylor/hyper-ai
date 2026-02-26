# Hyper Test Standards

## Coverage Requirements
- **Minimum:** 75% code coverage
- **Target:** 80% code coverage

## Test Types

### Unit Tests (40%)
- Individual functions/methods
- Pure logic
- Edge cases

### Integration Tests (30%)
- Skill interactions
- API calls
- Memory system

### E2E Tests (30%)
- Full workflows
- Critical paths
- User scenarios

## Running Tests
```bash
npm test              # Run all tests
npm test:unit        # Unit tests only
npm test:integration # Integration tests only
npm test:e2e        # E2E tests only
npm run coverage     # Generate coverage report
```

## Coverage Reports
Generated in `coverage/` directory:
- `lcov-report/` - HTML report
- `coverage.json` - JSON output
- `coverage.txt` - Summary

## CI Enforcement
- PRs require 75%+ coverage
- Coverage decreases must be justified
- Run tests in CI before merge
