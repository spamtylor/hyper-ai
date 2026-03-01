#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/taskManager.js
export function createTask(title) {
  return { id: Date.now(), title, completed: false };
}
EOF
cat << 'EOF' > $HYPER_ROOT/tests/taskManager.test.js
import { describe, it, expect, vi } from 'vitest';
import { createTask } from '../src/taskManager';

describe('taskManager', () => {
  it('creates task with unique id, title, and default completed status', () => {
    const task = createTask('Test Task');
    expect(task.id).toBeGreaterThan(0);
    expect(task.title).toBe('Test Task');
    expect(task.completed).toBe(false);
  });
});
EOF
