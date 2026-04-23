const HISTORY_KEY = 'stellar-drift-run-history';
const MAX_RUNS = 20;

export interface RunRecord {
  id: string;
  score: number;
  kills: number;
  timeSec: number;
  pilotId: string;
  shipId: string;
  date: string; // ISO string
}

export function saveRun(run: Omit<RunRecord, 'id' | 'date'>): RunRecord {
  const history = getRunHistory();
  const record: RunRecord = {
    ...run,
    id: `run_${Date.now()}`,
    date: new Date().toISOString(),
  };
  const updated = [record, ...history].slice(0, MAX_RUNS);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
  return record;
}

export function getRunHistory(): RunRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RunRecord[];
  } catch {
    return [];
  }
}

export function clearRunHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
