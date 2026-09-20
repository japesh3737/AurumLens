from pydantic import BaseModel, Field
from typing import Optional, Any

class BacktestRequest(BaseModel):
    pair: str = Field(default="GOLDTEN-GOLDPETAL", description="Selected cross-contract pair")
    entry_z: float = Field(default=2.5, description="Entry z-score threshold")
    exit_z: float = Field(default=0.5, description="Exit convergence z-score threshold")
    brokerage_bps: float = Field(default=1.0, description="Brokerage per leg turn in bps")
    base_slippage_bps: float = Field(default=1.0, description="Base slippage stress per leg turn in bps")
    max_holding_days: int = Field(default=20, description="Max holding period in trading days")
    execution_lag: int = Field(default=1, description="Execution lag in days (1 = next day settlement)")
    min_history: int = Field(default=20, description="Minimum baseline history days")
