import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const calculator = createRequire(import.meta.url)('../../site/solar-calculator.js');

test('solar calculator reproduces the sales workbook residential scenarios', () => {
  const { segment, scenarios } = calculator.calculate({ bill: 6000, rate: 16, offset: 80 });
  assert.equal(segment, 'residential');
  assert.deepEqual(
    scenarios.map((s) => s.id),
    ['day', 'partial', 'full'],
  );
  // Workbook "Day + 50% Night" column: 4 x 620 W, 6 kW hybrid, 5.12 kWh battery (L26/M26).
  const partial = scenarios[1];
  assert.equal(partial.panels, 4);
  assert.equal(partial.priceHigh, 234292);
  assert.equal(partial.priceLow, 196979);
  // Workbook "Day + Night" savings (F27): 5 x 0.62 kW x 4.5 h x PHP 16 x 30 x 0.8.
  assert.equal(scenarios[2].panels, 5);
  assert.ok(Math.abs(scenarios[2].savings - 5356.8) < 0.01);
  assert.ok(scenarios[2].batteryKwh >= 7.5);
});

test('solar calculator switches large systems to C&I equipment and tiers', () => {
  const { segment, tiers, scenarios } = calculator.calculate({ bill: 250000, rate: 12, offset: 80 });
  assert.equal(segment, 'commercial');
  assert.deepEqual(tiers, { low: 'T4', high: 'T6' });
  // Workbook C&I "Day Only": 249 x 620 W with a 125 kW 380 V inverter (F40/G40).
  const day = scenarios[0];
  assert.equal(day.panels, 249);
  assert.equal(day.lines[1].item, '125kw Grid Tied 380V');
  assert.equal(day.priceHigh, 4965868);
  assert.equal(day.priceLow, 4449115);
});

test('solar calculator equipment selection and formatting', () => {
  assert.deepEqual(calculator.pickBatteries(20).map((b) => [b.item, b.qty]), [
    ['16.07kwh Battery', 1],
    ['5.12kwh Battery', 1],
  ]);
  assert.equal(calculator.pickInverters(30, [{ item: '12kw Hybrid Inverter', kw: 12 }], 1.25)[0].qty, 2);
  assert.equal(calculator.formatPayback(13), '1 yr 1 mo');
  assert.equal(calculator.formatPayback(Infinity), 'Not reached');
  assert.deepEqual(calculator.calculate({ bill: 0 }).scenarios, []);
  for (const item of Object.values(calculator.PRICES))
    assert.deepEqual(Object.keys(item).sort(), ['A0', 'A2', 'T4', 'T6', 'model']);
});

test('back-office electricity rate setting is validated', async () => {
  const { validateContent } = await import('../worker.mjs');
  const base = { text: {}, images: {}, projects: [], posts: [] };
  assert.deepEqual(
    validateContent({
      ...base,
      settings: { electricityRate: 15.551, electricityRateNote: 'Meralco, November 2026' },
    }).settings,
    { electricityRate: 15.551, electricityRateNote: 'Meralco, November 2026' },
  );
  assert.equal(validateContent(base).settings, undefined);
  for (const settings of [
    { electricityRate: 0 },
    { electricityRate: '15' },
    { electricityRate: 150 },
    { electricityRateNote: 'x'.repeat(121) },
    { other: 1 },
    [],
  ])
    assert.throws(() => validateContent({ ...base, settings }));
});
