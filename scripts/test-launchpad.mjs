import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Exercise the real adapter with isolated storage; no backend or browser required.
const dir = await mkdtemp(join(tmpdir(), 'launchpad-test-'));
try {
  for (const name of ['types', 'fixtures', 'localApi']) {
    const source = await readFile(new URL(`../src/pages/Launchpad/data/${name}.ts`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } });
    await writeFile(join(dir, `${name}.mjs`), outputText.replace(/from '\.\/(types|fixtures)'/g, "from './$1.mjs'"));
  }
  const { createLocalLaunchpadApi } = await import(pathToFileURL(join(dir, 'localApi.mjs')));
  const { poolStatus } = await import(pathToFileURL(join(dir, 'types.mjs')));
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const api = createLocalLaunchpadApi('test', storage);
  const pools = await api.listPools();
  assert.deepEqual(pools.map(pool => poolStatus(pool)), ['live', 'live', 'upcoming', 'ended']);
  assert.equal(poolStatus(pools[0], Date.parse(pools[0].startsAt)), 'live');
  assert.equal(poolStatus(pools[0], Date.parse(pools[0].endsAt)), 'ended');
  console.log('✓ fixtures and exact sale boundaries');

  await api.setSaved('nova', true); await api.setSaved('nova', true);
  assert.deepEqual((await api.getPortfolio()).savedPoolIds, ['nova']);
  await api.setSaved('nova', false);
  assert.deepEqual((await api.getPortfolio()).savedPoolIds, []);
  console.log('✓ save / unsave is idempotent');

  const request = { poolId: 'orbit', amountCents: 5000, requestId: 'join-1' };
  const [first, duplicate] = await Promise.all([api.participate(request), api.participate(request)]);
  assert.equal(first.tokenAmount, 625); assert.deepEqual(duplicate, first);
  assert.equal((await api.getPortfolio()).balanceCents, 85000);
  assert.equal((await api.getPool('orbit')).raisedCents, pools[0].raisedCents + 5000);
  assert.equal((await api.getPool('orbit')).participants, pools[0].participants + 1);
  await assert.rejects(api.participate({ ...request, amountCents: 6000 }), /already been used/);
  console.log('✓ participation totals, concurrent retries, and request-ID conflicts');

  await assert.rejects(api.participate({ poolId: 'nova', amountCents: 5000, requestId: 'early' }), /not open/);
  await assert.rejects(api.participate({ poolId: 'forma', amountCents: 5000, requestId: 'late' }), /not open/);
  for (const amountCents of [0, -1, 2499, 2500.5, NaN, Infinity]) {
    await assert.rejects(api.participate({ poolId: 'orbit', amountCents, requestId: 'invalid' }));
  }
  await assert.rejects(api.participate({ poolId: 'orbit', amountCents: 46000, requestId: 'limit' }), /individual allocation/);
  await assert.rejects(api.claim('orbit', 'claim-early'), /not opened/);
  console.log('✓ amount validation, cumulative caps, closed sales, and early claims');

  const restored = createLocalLaunchpadApi('test', storage);
  assert.equal((await restored.getPortfolio()).balanceCents, 85000);
  assert.equal((await createLocalLaunchpadApi('another-user', storage).getPortfolio()).balanceCents, 90000);
  const claimed = await restored.claim('forma', 'claim-1');
  assert.equal(claimed.claimed, true);
  assert.deepEqual(await restored.claim('forma', 'claim-1'), claimed);
  await assert.rejects(restored.claim('forma', 'claim-2'), /already been claimed/);
  assert.equal((await restored.getPortfolio()).balanceCents, 85000);
  console.log('✓ reload persistence, account isolation, and duplicate claim protection');

  await api.participate({ poolId: 'orbit', amountCents: 45000, requestId: 'join-2' });
  assert.equal((await api.getPool('orbit')).participants, pools[0].participants + 1);
  await assert.rejects(api.participate({ poolId: 'bloom', amountCents: 50000, requestId: 'balance' }), /balance/);
  const key = 'nolandev.launchpad.demo.v1:test';
  const state = JSON.parse(values.get(key));
  state.pools.find(pool => pool.id === 'bloom').raisedCents = 7999000;
  values.set(key, JSON.stringify(state));
  await assert.rejects(api.participate({ poolId: 'bloom', amountCents: 2500, requestId: 'capacity' }), /remaining pool/);
  await assert.rejects(api.getPool('missing'), /no longer available/);
  console.log('✓ top-ups, insufficient balance, pool capacity, and missing projects');

  values.set(key, '{broken');
  await assert.rejects(api.getPortfolio(), /could not be read/);
  const blocked = createLocalLaunchpadApi('blocked', { getItem: () => null, setItem: () => { throw new Error('quota'); } });
  await assert.rejects(blocked.getPortfolio(), /could not be saved/);
  console.log('✓ corrupt and unavailable storage errors');
  console.log('All Launchpad adapter checks passed.');
} finally { await rm(dir, { recursive: true, force: true }); }
