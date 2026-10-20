import { describe, it, expect } from 'vitest';
import { gainVsPrevious, runningTotalGain, bestQuarterGain } from './snapshot-stats';

const series = [
  { id: 1, takenAt: new Date('2025-01-01'), total: 1000 },
  { id: 2, takenAt: new Date('2025-04-01'), total: 1500 },
  { id: 3, takenAt: new Date('2025-07-01'), total: 1400 }
];
const single = [series[0]];

describe('snapshot-stats', () => {
  it('gainVsPrevious', () => {
    expect(gainVsPrevious(series, 1)).toBeNull();
    expect(gainVsPrevious(series, 2)).toBe(500);
    expect(gainVsPrevious(series, 3)).toBe(-100);
    expect(gainVsPrevious(single, 1)).toBeNull();
    expect(gainVsPrevious(series, 99)).toBeNull();
  });
  it('runningTotalGain', () => {
    expect(runningTotalGain(series, 1)).toBe(0);
    expect(runningTotalGain(series, 2)).toBe(500);
    expect(runningTotalGain(series, 3)).toBe(400);
    expect(runningTotalGain(single, 1)).toBe(0);
    expect(runningTotalGain(series, 99)).toBe(0);
  });
  it('bestQuarterGain', () => {
    expect(bestQuarterGain(series)).toBe(500);
    expect(bestQuarterGain(single)).toBeNull();
    expect(bestQuarterGain([])).toBeNull();
    expect(bestQuarterGain([series[0], { id: 2, takenAt: new Date('2025-04-01'), total: 900 }])).toBe(-100);
  });
});
