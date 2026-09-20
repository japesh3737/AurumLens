export interface ContractSpec {
  unit_g: number;
  quote_g: number;
  purity: number;
  expiry_window: string;
}

export interface ContractCardData {
  symbol: string;
  contract_id: string;
  name: string;
  raw_price: number;
  norm_price: number;
  expiry_date: string;
  dte: number;
  volume: number;
  open_interest: number;
  traded: boolean;
  liquidity_tier: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
  spec: ContractSpec;
}

export interface GateResult {
  id: number;
  gate_number?: number;
  name: string;
  status: 'PASS' | 'FAIL' | 'N/A';
  passed?: boolean;
  value: string;
  actual_value?: string;
  threshold: string;
  metric_name?: string;
  message: string;
  detail?: string;
}

export interface PairSpread {
  norm_a: number;
  norm_b: number;
  norm_diff: number;
  pct_spread: number;
  log_spread: number;
  curve_implied_spread: number;
  curve_adj_spread: number;
  curve_adj_spread_bps?: number;
  expiry_gap_days: number;
  leg_a_cid: string;
  leg_b_cid: string;
  leg_a_dte: number;
  leg_b_dte: number;
}

export interface PairResult {
  pair: string;
  sym_a: string;
  sym_b: string;
  status: 'NORMAL' | 'WATCH' | 'ELEVATED' | 'POTENTIAL SIGNAL';
  radar_state: 'NORMAL' | 'WATCH' | 'ELEVATED' | 'POTENTIAL SIGNAL';
  verdict: 'SIGNAL' | 'NO SIGNAL';
  headline_reason: string;
  gates: GateResult[];
  spread: PairSpread;
  z_score: number | null;
  median: number | null;
  mad: number | null;
  obs_count: number;
  gross_edge_inr?: number;
  net_edge_inr?: number;
  hedge: {
    lots_a: number;
    lots_b: number;
    gold_a_g: number;
    gold_b_g: number;
    mismatch_pct: number;
    ratio_str: string;
  };
  costs: {
    gross_edge_bps: number;
    haircut_edge_bps: number;
    brokerage_bps: number;
    exchange_bps: number;
    gst_bps: number;
    ctt_bps: number;
    slippage_bps: number;
    total_costs_bps: number;
    net_edge_bps: number;
    pair_tier: string;
    total_cost_inr?: number;
    total_cost_bps?: number;
  };
  pair_liquidity: {
    tier: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
    leg_a_tier?: string;
    leg_b_tier?: string;
  };
  leg_a?: any;
  leg_b?: any;
}

export interface CurvePoint {
  symbol: string;
  contract_id: string;
  expiry_date: string;
  dte: number;
  raw_close: number;
  norm_close: number;
  expected_curve_norm: number;
  residual_inr: number;
  residual_bps: number;
  volume: number;
  open_interest: number;
  traded: boolean;
  norm_price?: number;
  curve_price?: number;
  loo_residual?: number;
}

export interface DailySnapshot {
  date: string;
  contracts: ContractCardData[];
  curve: {
    coefficients: number[];
    degree: number;
    quality: string;
    r2: number;
    annualized_carry: number;
    classification: 'CONTANGO' | 'BACKWARDATION' | 'FLAT / MIXED';
    status_msg: string;
  };
  pairs: Record<string, PairResult>;
  active_signals_count: number;
  contracts_count: number;
  traded_contracts_count: number;
}

export interface StoryStep {
  id: number;
  title: string;
  screen: 'overview' | 'relative-value' | 'curve' | 'replay' | 'backtest' | 'lifecycle' | 'integrity';
  duration_s: number;
  target_selector?: string;
  narration?: string;
  action?: string;
  script?: string;
  highlight_element?: string;
}

export interface Bookmark {
  date: string;
  type: string;
  title: string;
  pair: string;
  description: string;
}
