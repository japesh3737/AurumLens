from dataclasses import dataclass
import yaml
import os

@dataclass(frozen=True)
class ContractSpec:
    symbol: str
    name: str
    unit_g: float      # trading unit in grams
    quote_g: float     # price quoted per grams
    purity: int        # e.g. 995 or 999
    expiry_window: str
    tick_size: float
    tender_period_days: int
    restricted_window_days: int
    forced_exit_days: int

TARGET_G = 10.0
TARGET_PURITY = 999.0

# Built-in verified defaults
SPECS = {
    "GOLDM": ContractSpec("GOLDM", "Gold Mini", 100.0, 10.0, 995, "3rd-5th", 1.0, 5, 10, 5),
    "GOLDTEN": ContractSpec("GOLDTEN", "Gold 10 Grams", 10.0, 10.0, 999, "27th-31st", 1.0, 5, 10, 5),
    "GOLDGUINEA": ContractSpec("GOLDGUINEA", "Gold Guinea", 8.0, 8.0, 999, "27th-31st", 1.0, 5, 10, 5),
    "GOLDPETAL": ContractSpec("GOLDPETAL", "Gold Petal", 1.0, 1.0, 999, "27th-31st", 1.0, 5, 10, 5),
}

def load_specs_from_yaml(config_path: str = "config/contracts.yaml") -> dict[str, ContractSpec]:
    if not os.path.exists(config_path):
        return SPECS
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    specs = {}
    for sym, c in data.get("contracts", {}).items():
        specs[sym] = ContractSpec(
            symbol=sym,
            name=c.get("name", sym),
            unit_g=float(c.get("trading_unit_g", 10)),
            quote_g=float(c.get("quote_unit_g", 10)),
            purity=int(c.get("purity", 999)),
            expiry_window=str(c.get("expiry_window", "")),
            tick_size=float(c.get("tick_size", 1.0)),
            tender_period_days=int(c.get("tender_period_days", 5)),
            restricted_window_days=int(c.get("restricted_window_days", 10)),
            forced_exit_days=int(c.get("forced_exit_days", 5)),
        )
    return specs

def normalize(price: float, s: ContractSpec) -> float:
    """
    Normalizes quoted price to INR per 10 g of 999-equivalent physical gold.
    norm = price * (10 / quote_g) * (999 / purity)
    """
    if price <= 0 or s.quote_g <= 0 or s.purity <= 0:
        return 0.0
    return price * (TARGET_G / s.quote_g) * (TARGET_PURITY / s.purity)

def lot_factor(s: ContractSpec) -> float:
    """
    INR P&L per lot per INR 1 change in quoted price.
    e.g. GOLDM: 100g / 10g = 10; GOLDPETAL: 1g / 1g = 1.
    """
    return s.unit_g / s.quote_g

def pure_gold_g(s: ContractSpec) -> float:
    """Pure gold content in grams per lot."""
    return s.unit_g * s.purity / 1000.0
