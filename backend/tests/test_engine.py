import pytest
import numpy as np
import pandas as pd
from aurumlens.core.contracts import SPECS, normalize, lot_factor, pure_gold_g
from aurumlens.engine.hedge import compute_hedge_ratio
from aurumlens.engine.stats import robust_z
from aurumlens.backtest.costs import compute_roundtrip_costs
from aurumlens.replay.audit import run_lookahead_audit

def test_normalization_factors():
    assert normalize(100000, SPECS["GOLDM"]) == pytest.approx(100000 * 999 / 995)
    assert normalize(100000, SPECS["GOLDTEN"]) == pytest.approx(100000)
    assert normalize(80000, SPECS["GOLDGUINEA"]) == pytest.approx(80000 * 10 / 8)
    assert normalize(10000, SPECS["GOLDPETAL"]) == pytest.approx(10000 * 10)

def test_lot_factors():
    assert lot_factor(SPECS["GOLDM"]) == 10
    assert lot_factor(SPECS["GOLDTEN"]) == 1
    assert lot_factor(SPECS["GOLDGUINEA"]) == 1
    assert lot_factor(SPECS["GOLDPETAL"]) == 1

def test_hedge_ratios():
    # TEN:PETAL -> 1:10 (0% mismatch)
    h_ten_petal = compute_hedge_ratio("GOLDTEN", "GOLDPETAL")
    assert h_ten_petal["lots_a"] == 1
    assert h_ten_petal["lots_b"] == 10
    assert h_ten_petal["mismatch_pct"] == 0.0

    # GUINEA:PETAL -> 1:8 (0% mismatch)
    h_guinea_petal = compute_hedge_ratio("GOLDGUINEA", "GOLDPETAL")
    assert h_guinea_petal["lots_a"] == 1
    assert h_guinea_petal["lots_b"] == 8
    assert h_guinea_petal["mismatch_pct"] == 0.0

    # TEN:GUINEA -> 4:5 (0% mismatch)
    h_ten_guinea = compute_hedge_ratio("GOLDTEN", "GOLDGUINEA")
    assert h_ten_guinea["lots_a"] == 4
    assert h_ten_guinea["lots_b"] == 5
    assert h_ten_guinea["mismatch_pct"] == 0.0

    # GOLDM:GOLDTEN -> 1:10 with ~0.4% purity mismatch
    h_m_ten = compute_hedge_ratio("GOLDM", "GOLDTEN")
    assert h_m_ten["lots_a"] == 1
    assert h_m_ten["lots_b"] == 10
    assert pytest.approx(h_m_ten["mismatch_pct"], abs=0.01) == 0.4

def test_robust_z_strictly_prior():
    # Past strictly before t
    past = np.array([10.0, 10.2, 9.8, 10.1, 9.9, 10.0, 10.05, 9.95, 10.1, 10.0])
    z, med, mad, count = robust_z(10.0, past, min_obs=5)
    assert z == pytest.approx(0.0, abs=1e-3)
    assert med == pytest.approx(10.0, abs=1e-2)
    assert count == 10

def test_costs_monotonicity():
    cost_low = compute_roundtrip_costs(20.0, brokerage_bps=0.5, base_slippage_bps=0.5)
    cost_high = compute_roundtrip_costs(20.0, brokerage_bps=2.0, base_slippage_bps=2.0)
    assert cost_low["total_costs_bps"] < cost_high["total_costs_bps"]
    assert cost_low["net_edge_bps"] > cost_high["net_edge_bps"]
