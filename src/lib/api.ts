import { DailySnapshot } from '../types';

const API_BASE = '/api';

export async function fetchMeta() {
  try {
    const res = await fetch(`${API_BASE}/meta`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /meta unavailable, falling back to bundle');
  }
  const fallback = await fetch('/data/bundle/manifest.json');
  return await fallback.json();
}

export async function fetchSnapshot(date: string): Promise<DailySnapshot | null> {
  try {
    const res = await fetch(`${API_BASE}/snapshot?date=${date}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn(`API /snapshot?date=${date} failed, trying local bundle`);
  }

  try {
    const res = await fetch('/data/bundle/snapshots.json');
    const data = await res.json();
    return data.snapshots?.[date] || null;
  } catch (e) {
    console.error('Failed to load snapshot from bundle:', e);
    return null;
  }
}

export async function fetchSeries(pair: string, start?: string, end?: string) {
  try {
    const q = new URLSearchParams({ pair, ...(start && { start }), ...(end && { end }) });
    const res = await fetch(`${API_BASE}/series?${q}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /series failed');
  }
  return { pair, points: [] };
}

export async function fetchCurve(date: string) {
  try {
    const res = await fetch(`${API_BASE}/curve?date=${date}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /curve failed');
  }
  return { date, fit: null, points: [] };
}

export async function fetchContracts() {
  try {
    const res = await fetch(`${API_BASE}/contracts`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /contracts failed, using bundle');
  }
  const fallback = await fetch('/data/bundle/contracts.json');
  return await fallback.json();
}

export async function fetchIntegrity() {
  try {
    const res = await fetch(`${API_BASE}/integrity`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /integrity failed, using bundle');
  }
  const fallback = await fetch('/data/bundle/integrity.json');
  return await fallback.json();
}

export async function fetchLookaheadAudit() {
  try {
    const res = await fetch(`${API_BASE}/audit/lookahead`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /audit/lookahead failed, using bundle');
  }
  const fallback = await fetch('/data/bundle/lookahead_audit.json');
  return await fallback.json();
}

export async function fetchBookmarks() {
  try {
    const res = await fetch(`${API_BASE}/bookmarks`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /bookmarks failed, using bundle');
  }
  const fallback = await fetch('/data/bundle/bookmarks.json');
  return await fallback.json();
}

export async function runBacktestApi(params: any) {
  try {
    const res = await fetch(`${API_BASE}/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /backtest failed, checking precomputed bundle');
  }

  const fallback = await fetch('/data/bundle/backtest_defaults.json');
  const defaults = await fallback.json();
  return defaults[params.pair] || { error: 'No precomputed backtest available for this pair' };
}
