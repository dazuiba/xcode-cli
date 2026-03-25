import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRunSomeTestsPayload } from '../src/xcode-mcp.ts';

test('normalizeRunSomeTestsPayload adds errors alias from errorMessages', () => {
  const payload = normalizeRunSomeTestsPayload({
    summary: '1 tests',
    counts: {
      total: 1,
      passed: 1,
      failed: 0,
      skipped: 0,
      expectedFailures: 0,
      notRun: 0,
    },
    results: [
      {
        targetName: 'DemoProjTests',
        identifier: 'DemoProjTests/testHelloWorld()',
        displayName: 'testHelloWorld()',
        state: 'Passed',
        errorMessages: [],
      },
    ],
    schemeName: 'DemoProj',
    truncated: false,
    totalResults: 1,
    fullSummaryPath: '/tmp/summary.txt',
  });

  assert.deepEqual(payload.results, [
    {
      targetName: 'DemoProjTests',
      identifier: 'DemoProjTests/testHelloWorld()',
      displayName: 'testHelloWorld()',
      state: 'Passed',
      errorMessages: [],
      errors: [],
    },
  ]);
});

test('normalizeRunSomeTestsPayload preserves existing errors and backfills errorMessages', () => {
  const payload = normalizeRunSomeTestsPayload({
    results: [
      {
        targetName: 'DemoProjTests',
        identifier: 'DemoProjTests/testHelloWorld()',
        displayName: 'testHelloWorld()',
        state: 'Failed',
        errors: ['boom'],
      },
    ],
  });

  assert.deepEqual(payload.results, [
    {
      targetName: 'DemoProjTests',
      identifier: 'DemoProjTests/testHelloWorld()',
      displayName: 'testHelloWorld()',
      state: 'Failed',
      errors: ['boom'],
      errorMessages: ['boom'],
    },
  ]);
});
