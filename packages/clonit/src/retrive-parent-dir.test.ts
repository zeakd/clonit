import { test, expect }     from 'vitest';

import { retriveParentDir } from './retrive-parent-dir.js';

test('retrive-parent-dir', () => {
  const gen = retriveParentDir('/a/b/c');
  expect(gen.next().value).toBe('/a/b/c');
  expect(gen.next().value).toBe('/a/b');
  expect(gen.next().value).toBe('/a');
  expect(gen.next().value).toBe('/');
  expect(gen.next().done).toBe(true);
});
