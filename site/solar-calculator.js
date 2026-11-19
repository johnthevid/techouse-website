/**
 * Solar Calculator model, ported from the Techouse sales workbook ("Calculator" and "Pricelist" sheets).
 * Pure functions only: no DOM access, so the model can be tested in Node and reused by the page.
 * Results are planning illustrations, not quotations. Edit PRICES when the price list changes.
 */
(function (root) {
  // WORKBOOK DEFAULTS: Calculator sheet, Residential / SME and C&I client columns.
  const DEFAULTS = {
    rate: 16, // Php/kWh used by the workbook for residential/SME bills
    offset: 80, // Savings %: share of consumption the system targets
    nightShare: 60, // Night %: share of consumption used after sunset
    partialBattery: 50, // Battery %: share of night use covered in the "partial" scenario
    storageHours: 3, // C&I battery hours: battery kWh = PV kWp x hours
    psh: 4.5, // Peak sun hours per day
    heatLoss: 0.2, // Temperature/system losses
    days: 30,
    inverterRatio: 1.25, // Maximum DC (panel kWp) to AC (inverter kW) ratio
    residentialLimit: 24, // Largest residential/SME package (kWp); larger systems use C&I equipment
  };

  // PRICE LIST (PHP per unit). Only the public range tiers are kept in source:
  // Residential/SME: A2 = list price (high), A0 = best tier (low). C&I: T6 = high, T4 = low.
  const PRICES = {
    Accessories: { model: '', A2: 6928, A0: 5862, T6: 5443, T4: 4885 },
    Installation: { model: '', A2: 8255, A0: 6880, T6: 6350, T4: 5655 },
    '620w Topcon': { model: 'QM210R THCD-620-66', A2: 9396, A0: 7951, T6: 7080, T4: 6380 },
    '660w BC': { model: 'QM192 AFCD-660-72', A2: 10980, A0: 9291, T6: 8273, T4: 7456 },
    '6kw Hybrid Inverter': { model: 'SWH6000L-S1-G2', A2: 66292, A0: 55243, T6: 53461, T4: 47352 },
    '8kw Hybrid Inverter': { model: 'SWH8000L-S1-G2', A2: 99633, A0: 83028, T6: 80350, T4: 71167 },
    '10kw Hybrid Inverter': {
      model: 'SWH010KL-S1 G2',
      A2: 113565,
      A0: 94638,
      T6: 91585,
      T4: 81118,
    },
    '12kw Hybrid Inverter': {
      model: 'SWH012KL-S1-G2',
      A2: 117488,
      A0: 97907,
      T6: 94749,
      T4: 83920,
    },
    '5.12kwh Battery': { model: 'SWR5.12-L1-SW-SA', A2: 69684, A0: 58964, T6: 58964, T4: 52502 },
    '10.49kwh Battery': {
      model: 'SWR10.49-L2-SW-SA',
      A2: 123758,
      A0: 104718,
      T6: 104718,
      T4: 93242,
    },
    '16.07kwh Battery': {
      model: 'SWR16.07-L2-SW-SA',
      A2: 175893,
      A0: 148833,
      T6: 148833,
      T4: 132523,
    },
    '6kw Grid Tied Inverter': {
      model: 'SWH6000L-T1-G1',
      A2: 37564,
      A0: 31304,
      T6: 30294,
      T4: 26832,
    },
    '60kw Grid Tied 380V': {
      model: 'SW060KTL-T1-G2',
      A2: 202797,
      A0: 168997,
      T6: 163546,
      T4: 144855,
    },
    '80kw Grid Tied 380V': {
      model: 'SW080KTL-T1-G2',
      A2: 247298,
      A0: 206081,
      T6: 199434,
      T4: 176641,
    },
    '100kw Grid Tied 380V': {
      model: 'SW0100KTL-T1-G2',
      A2: 315867,
      A0: 263223,
      T6: 254732,
      T4: 225620,
    },
    '110kw Grid Tied 380V': {
      model: 'SW0110KTL-T1-G2',
      A2: 328430,
      A0: 273692,
      T6: 264863,
      T4: 234593,
    },
    '125kw Grid Tied 380V': {
      model: 'SW0125KTL-T1-G2',
      A2: 330448,
      A0: 275374,
      T6: 266491,
      T4: 236035,
    },
  };

  const PANELS = {
    topcon: { item: '620w Topcon', kw: 0.62, label: '620 W TOPCon panels' },
    bc: { item: '660w BC', kw: 0.66, label: '660 W back-contact (BC) panels' },
  };
  const INVERTERS = {
    gridResidential: [{ item: '6kw Grid Tied Inverter', kw: 6 }],
    hybrid: [
      { item: '6kw Hybrid Inverter', kw: 6 },
      { item: '8kw Hybrid Inverter', kw: 8 },
      { item: '10kw Hybrid Inverter', kw: 10 },
      { item: '12kw Hybrid Inverter', kw: 12 },
    ],
    gridCommercial: [
      { item: '60kw Grid Tied 380V', kw: 60 },
      { item: '80kw Grid Tied 380V', kw: 80 },
      { item: '100kw Grid Tied 380V', kw: 100 },
      { item: '110kw Grid Tied 380V', kw: 110 },
      { item: '125kw Grid Tied 380V', kw: 125 },
    ],
  };
  const BATTERIES = [
    { item: '5.12kwh Battery', kwh: 5.12 },
    { item: '10.49kwh Battery', kwh: 10.49 },
    { item: '16.07kwh Battery', kwh: 16.07 },
  ];

  const number = (value, fallback) => {
    const n = Number(value);
    return value === undefined || value === '' || !Number.isFinite(n) ? fallback : n;
  };

  // Fewest identical units first, then the smallest model that keeps DC/AC within the ratio.
  function pickInverters(pv, models, ratio) {
    for (let qty = 1; qty < 100; qty++) {
      const model = models.find((m) => qty * m.kw * ratio >= pv);
      if (model) return [{ item: model.item, qty, kw: model.kw }];
    }
    const largest = models[models.length - 1];
    return [{ item: largest.item, qty: Math.ceil(pv / (largest.kw * ratio)), kw: largest.kw }];
  }

  // Largest modules for the bulk, then the smallest module that covers the remainder.
  function pickBatteries(target) {
    if (!(target > 0)) return [];
    const largest = BATTERIES[BATTERIES.length - 1];
    const full = Math.floor(target / largest.kwh);
    const remainder = target - full * largest.kwh;
    const lines = [];
    const extra = remainder > 0.01 ? BATTERIES.find((b) => b.kwh >= remainder) : null;
    if (extra === largest) lines.push({ item: largest.item, qty: full + 1, kwh: largest.kwh });
    else {
      if (full) lines.push({ item: largest.item, qty: full, kwh: largest.kwh });
      if (extra) lines.push({ item: extra.item, qty: 1, kwh: extra.kwh });
    }
    return lines;
  }

  // Customer-facing names for price-list items.
  function describe(item) {
    let m;
    if ((m = item.match(/^(\d+)kw Hybrid Inverter$/))) return `${m[1]} kW hybrid inverter`;
    if ((m = item.match(/^(\d+)kw Grid Tied 380V$/))) return `${m[1]} kW grid-tied inverter · 380 V`;
    if ((m = item.match(/^(\d+)kw Grid Tied Inverter$/))) return `${m[1]} kW grid-tied inverter`;
    if ((m = item.match(/^([\d.]+)kwh Battery$/))) return `${m[1]} kWh battery`;
    return item;
  }

  function price(lines, tier) {
    return lines.reduce((sum, line) => sum + PRICES[line.item][tier] * line.qty, 0);
  }

  /**
   * values: { bill, rate, offset (%), panel ('topcon'|'bc'), nightShare (%), partialBattery (%), storageHours }
   * Returns the segment and an ordered list of scenarios, each with equipment lines, price range,
   * monthly generation, savings and simple payback (months).
   */
  function calculate(values = {}) {
    const d = DEFAULTS;
    const bill = number(values.bill, 0);
    const rate = number(values.rate, d.rate);
    const offset = Math.min(100, Math.max(0, number(values.offset, d.offset))) / 100;
    const night = Math.min(100, Math.max(0, number(values.nightShare, d.nightShare))) / 100;
    const partial = Math.min(100, Math.max(0, number(values.partialBattery, d.partialBattery))) / 100;
    const hours = Math.max(0, number(values.storageHours, d.storageHours));
    const panel = PANELS[values.panel] || PANELS.topcon;
    if (!(bill > 0) || !(rate > 0))
      return { segment: 'residential', nightShare: night * 100, scenarios: [] };

    // Workbook "Daily Demand": kW of array needed to meet the whole bill at the peak-sun-hour rate.
    const demand = bill / rate / d.days / d.psh;
    const fullPv = (demand / (1 - d.heatLoss)) * offset;
    const segment = fullPv > d.residentialLimit ? 'commercial' : 'residential';
    const [high, low] = segment === 'commercial' ? ['T6', 'T4'] : ['A2', 'A0'];

    // Hours of full-array output the night share needs: PV x Night % x PSH = PV x (Night % x PSH) hours.
    const nightHours = night * d.psh;
    const storageHours = Math.max(hours, Math.ceil(nightHours * 10) / 10);

    const plans =
      segment === 'commercial'
        ? [
            {
              // Workbook C&I "Day Only" PV = PV size x (1 - Night %) (cell E33).
              id: 'day',
              title: 'Daytime solar',
              summary: 'Grid-tied panels cover the share of use that happens in daylight.',
              share: 1 - night,
              battery: 0,
              inverters: INVERTERS.gridCommercial,
            },
            {
              // Workbook C&I battery = PV size x Battery H (cell E50). The hours rise when night use
              // needs more than that, so the battery is never smaller than the after-sunset share.
              id: 'storage',
              title: `Daytime solar + ${storageHours}-hour storage`,
              summary: `Full array with about ${storageHours} hours of battery storage for after-sunset use.`,
              share: 1,
              battery: fullPv * storageHours,
              inverters: INVERTERS.gridCommercial,
            },
          ]
        : [
            {
              id: 'day',
              title: 'Daytime solar',
              summary: 'Grid-tied panels cover the share of use that happens in daylight.',
              share: 1 - night,
              battery: 0,
              inverters: INVERTERS.gridResidential,
            },
            {
              id: 'partial',
              title: `Day + ${Math.round(partial * 100)}% of night`,
              summary: 'A hybrid system with a battery for part of your after-sunset use.',
              share: 1 - night + night * partial,
              battery: fullPv * night * d.psh * partial,
              inverters: INVERTERS.hybrid,
            },
            {
              id: 'full',
              title: 'Day + night',
              summary: 'A hybrid system sized to carry your after-sunset use as well.',
              share: 1,
              battery: fullPv * night * d.psh,
              inverters: INVERTERS.hybrid,
            },
          ];

    const scenarios = plans.map((plan) => {
      const pv = fullPv * plan.share;
      const panels = Math.max(1, Math.ceil(pv / panel.kw));
      const kwp = panels * panel.kw;
      const lines = [
        { item: panel.item, qty: panels, label: panel.label },
        ...pickInverters(kwp, plan.inverters, d.inverterRatio),
        ...pickBatteries(plan.battery),
        { item: 'Accessories', qty: panels, label: 'Mounting, cabling and protection' },
        { item: 'Installation', qty: panels, label: 'Installation' },
      ].map((line) => ({
        ...line,
        label: line.label || describe(line.item),
        model: PRICES[line.item].model,
      }));
      const generation = kwp * d.psh * d.days * (1 - d.heatLoss);
      // Without export credits, savings cannot exceed the part of the bill this scenario targets.
      const savings = Math.min(generation * rate, bill * plan.share);
      const priceLow = price(lines, low);
      const priceHigh = price(lines, high);
      return {
        id: plan.id,
        title: plan.title,
        summary: plan.summary,
        kwp,
        panels,
        batteryKwh: lines.reduce((sum, l) => sum + (l.kwh || 0) * l.qty, 0),
        lines,
        generation,
        savings,
        priceLow,
        priceHigh,
        paybackLow: savings > 0 ? priceLow / savings : Infinity,
        paybackHigh: savings > 0 ? priceHigh / savings : Infinity,
      };
    });
    return { segment, tiers: { low, high }, demand, fullPv, nightShare: night * 100, scenarios };
  }

  // Workbook ROI format: whole years plus remaining months, rounded up.
  function formatPayback(months) {
    if (!Number.isFinite(months)) return 'Not reached';
    let years = Math.floor(months / 12);
    let rest = Math.ceil(months - years * 12);
    if (rest === 12) {
      years += 1;
      rest = 0;
    }
    const y = years ? `${years} yr${years === 1 ? '' : 's'}` : '';
    const m = rest ? `${rest} mo${rest === 1 ? '' : 's'}` : '';
    return [y, m].filter(Boolean).join(' ') || 'Under 1 mo';
  }

  const api = { DEFAULTS, PRICES, PANELS, calculate, formatPayback, pickInverters, pickBatteries };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TechouseSolarCalculator = api;
})(typeof window !== 'undefined' ? window : globalThis);
