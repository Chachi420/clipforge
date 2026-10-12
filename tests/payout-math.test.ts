/**
 * Starter coverage for the payout money math (lib/payout-math.ts).
 *
 * Runs on Node's built-in test runner — no new dependencies:
 *   npm test   →   node --test tests/
 *
 * These tests pin the exact behavior the monthly payout cron depends on.
 * If any of them fail, the money math changed — treat that as a P0.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  startOfMonth,
  endOfMonth,
  roundCents,
  computePayouts,
} from "../lib/payout-math.ts";

describe("startOfMonth / endOfMonth", () => {
  it("bounds a 31-day month", () => {
    assert.equal(startOfMonth("2026-01-15"), "2026-01-01");
    assert.equal(endOfMonth("2026-01-15"), "2026-01-31");
  });

  it("bounds a 30-day month", () => {
    assert.equal(startOfMonth("2026-04-02"), "2026-04-01");
    assert.equal(endOfMonth("2026-04-02"), "2026-04-30");
  });

  it("handles February in a non-leap year", () => {
    assert.equal(endOfMonth("2023-02-10"), "2023-02-28");
  });

  it("handles February in a leap year", () => {
    assert.equal(endOfMonth("2024-02-10"), "2024-02-29");
  });

  it("handles the December → January year rollover", () => {
    assert.equal(endOfMonth("2026-12-25"), "2026-12-31");
    assert.equal(startOfMonth("2027-01-05"), "2027-01-01");
  });

  it("is idempotent on month boundaries", () => {
    assert.equal(startOfMonth("2026-01-01"), "2026-01-01");
    assert.equal(endOfMonth("2026-01-31"), "2026-01-31");
  });
});

describe("roundCents", () => {
  it("rounds half-cents up", () => {
    assert.equal(roundCents(10.126), 10.13);
  });

  it("rounds down below half a cent", () => {
    assert.equal(roundCents(10.124), 10.12);
  });

  it("leaves whole dollars alone", () => {
    assert.equal(roundCents(10), 10);
    assert.equal(roundCents(0), 0);
  });

  it("survives binary floating point (0.1 + 0.2)", () => {
    assert.equal(roundCents(0.1 + 0.2), 0.3);
  });

  it("documents float reality: 1.005 rounds to 1, not 1.01", () => {
    // 1.005 is stored as 1.0049999… in binary, so Math.round sees 100.4999…
    // This is inherent to the Math.round(n*100)/100 formula — flag it here
    // so nobody "fixes" it into a different rounding behavior unknowingly.
    // (2.675 happens to land exactly on 267.5 after multiplication, so it
    // rounds half-up to 2.68 — float rounding is not symmetric. Both cases
    // are pinned so any formula change shows up here first.)
    assert.equal(roundCents(1.005), 1);
    assert.equal(roundCents(2.675), 2.68);
  });
});

describe("computePayouts", () => {
  it("aggregates views and clips per user", () => {
    const rows = computePayouts(
      [
        { userId: "u1", views: 60000 },
        { userId: "u1", views: 40000 },
        { userId: "u2", views: 200000 },
      ],
      50
    );
    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0], {
      userId: "u1",
      views: 100000,
      clips: 2,
      estimatedAmount: 50,
    });
    assert.deepEqual(rows[1], {
      userId: "u2",
      views: 200000,
      clips: 1,
      estimatedAmount: 100,
    });
  });

  it("uses cumulative views, not period deltas", () => {
    const rows = computePayouts([{ userId: "u1", views: 500000 }], 50);
    assert.equal(rows[0].estimatedAmount, 250);
  });

  it("rounds fractional earnings to cents", () => {
    const rows = computePayouts([{ userId: "u1", views: 33333 }], 50);
    assert.equal(rows[0].estimatedAmount, 16.67);
  });

  it("drops zero-view clips (no $0 noise rows)", () => {
    const rows = computePayouts([{ userId: "u1", views: 0 }], 50);
    assert.deepEqual(rows, []);
  });

  it("drops dust earnings that round to $0", () => {
    const rows = computePayouts([{ userId: "u1", views: 1 }], 50);
    assert.deepEqual(rows, []);
  });

  it("keeps earners while dropping dust-only users", () => {
    const rows = computePayouts(
      [
        { userId: "u1", views: 200000 },
        { userId: "u2", views: 3 },
      ],
      50
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].userId, "u1");
  });

  it("returns nothing for empty input or a zero rate", () => {
    assert.deepEqual(computePayouts([], 50), []);
    assert.deepEqual(computePayouts([{ userId: "u1", views: 100000 }], 0), []);
  });
});
