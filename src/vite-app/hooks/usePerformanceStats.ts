import { useMemo } from 'react';
import type { PerformanceRecord } from '../types';

/**
 * @hook usePerformanceStats
 * @description
 * [Developer] Calculates aggregated performance statistics (success rate, average return, etc.)
 * from a given array of performance records. Uses `useMemo` for optimization.
 * 
 * [AI Agent] Use this hook whenever you need to display summary statistics for past recommendations.
 * Do not duplicate calculation logic in UI components.
 */
export function usePerformanceStats(records: PerformanceRecord[]) {
  const stats = useMemo(() => {
    const successCount = records.filter(r => r.hitFlag === 'success').length;
    const failCount = records.filter(r => r.hitFlag === 'fail').length;
    const evaluatingCount = records.filter(r => r.hitFlag === 'evaluating').length;

    const successRate = records.length > 0
      ? ((successCount / records.length) * 100).toFixed(1)
      : '0.0';

    const avgReturn = records.length > 0
      ? (
          records.reduce((sum, r) => {
            const val = parseFloat(r.realizedReturn.replace(/[+%]/g, ''));
            return sum + val;
          }, 0) / records.length
        ).toFixed(1)
      : '0.0';

    return {
      totalCount: records.length,
      successCount,
      failCount,
      evaluatingCount,
      successRate,
      avgReturn,
    };
  }, [records]);

  return stats;
}
