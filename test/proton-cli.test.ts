import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- keep the MVP on Node's built-in runner
import test from 'node:test'
import { createProtonSessionId, isProtonSessionId } from '../server/api/_lib/proton-cli.ts'

test('Proton session IDs cannot escape their storage directory', () => {
  assert.equal(isProtonSessionId(createProtonSessionId()), true)
  assert.equal(isProtonSessionId('../../auth-session.json'), false)
  assert.equal(isProtonSessionId('a'.repeat(63)), false)
})
