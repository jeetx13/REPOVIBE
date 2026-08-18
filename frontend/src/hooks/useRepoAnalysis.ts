import { useCallback, useRef, useState } from 'react';
import { analyzeRepo, type AnalysisResult, type RepoAnalysis } from '@/services/api';

/**
 * useRepoAnalysis — the one hook every component uses to run an analysis.
 * Swap `analyzeRepo` in api.ts and nothing here changes.
 */
export function useRepoAnalysis() {
  const [result, setResult] = useState<AnalysisResult>({ status: 'idle' });
  const reqId = useRef(0);

  const run = useCallback(async (fullName: string) => {
    const id = ++reqId.current;
    setResult({ status: 'loading' });
    try {
      const data: RepoAnalysis = await analyzeRepo(fullName);
      if (id !== reqId.current) return; // a newer request superseded this one
      setResult({ status: 'success', data });
    } catch (err) {
      if (id !== reqId.current) return;
      setResult({ status: 'error', error: err instanceof Error ? err.message : 'Analysis failed' });
    }
  }, []);

  const reset = useCallback(() => setResult({ status: 'idle' }), []);

  return { result, run, reset };
}
