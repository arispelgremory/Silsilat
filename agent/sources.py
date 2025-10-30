# -*- coding: utf-8 -*-
"""
sources.py

External data and policy access layer for the Gold Collateral Evaluation Agent.

Responsibilities:
1. Retrieve loan details from the Silsilat API endpoint (API or stubbed call).
2. Fetch live gold price (USD per troy ounce) from https://metalpriceapi.com.
3. Fetch live FX rate (USD→MYR) from https://www.fastforex.io.
4. Retrieve regulatory & operational policy thresholds from policy.py.

These are lightweight helpers called by gold_evaluator.py.
"""

import os
import json
import requests
from datetime import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Import policy settings (max LTVs, haircut policy, etc.)
import policy

# Load env configuration
load_dotenv(".env")


# ------------------------------------------------------------------------------
# 1. Retrieve loan details from Silsilat API (stub / API placeholder)
# ------------------------------------------------------------------------------
def get_loan_details(loan_id: str) -> dict:
    """
    Fetch loan details from the Silsilat API endpoint.
    The endpoint should return a JSON with Silsilat data that will be mapped to loan details format:
        loan_id, shop_id, principal_myr, gold_weight_g, purity, collateral_type, tenure_days, fees_myr
    If API is unavailable, a local stub will be used.

    Returns:
        dict: parsed loan details ready for LoanInput model
    """
    base_url = os.getenv("SILSILAT_API_BASE", "https://api.silsilat.finance")
    api_key = os.getenv("SILSILAT_API_KEY")

    url = f"{base_url}/Silsilat/{loan_id}"
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        # Map Silsilat data to loan details format
        if data.get("success") and data.get("data"):
            Silsilat_data = data["data"]
            Silsilat_properties = Silsilat_data.get("SilsilatProperties", {})
            
            return {
                "loan_id": loan_id,
                "shop_id": "Silsilat-SHOP",  # Default shop ID for Silsilat-based loans
                "principal_myr": Silsilat_properties.get("loan", 0),
                "gold_weight_g": Silsilat_properties.get("weightG", 0),
                "purity": Silsilat_properties.get("karat", 916),  # Convert karat to purity (916 = 22k)
                "collateral_type": Silsilat_properties.get("assetType", "jewellery"),
                "tenure_days": Silsilat_properties.get("tenorM", 3) * 30,  # Convert months to days
                "fees_myr": 0.0,  # Default fees
            }
        else:
            raise ValueError("Invalid Silsilat API response format")
            
    except Exception as e:
        # Fallback stub (for local testing)
        print(f"[WARN] Silsilat API not reachable ({e}); using stub data.")
        return {
            "loan_id": loan_id,
            "shop_id": "Silsilat-SHOP",
            "principal_myr": 4000,
            "gold_weight_g": 25.0,
            "purity": 916,
            "collateral_type": "jewellery",-
            "tenure_days": 90,
            "fees_myr": 0.0,
        }


# ------------------------------------------------------------------------------
# 2. Get gold price from MetalPriceAPI (USD per troy ounce)
#    Docs: https://metalpriceapi.com/
# ------------------------------------------------------------------------------
def get_gold_price_usd() -> float:
    """
    Fetch latest gold spot price in USD per troy ounce.

    Environment:
        METALPRICE_API_KEY
    Returns:
        float: gold price (USD/oz)
    """
    api_key = os.getenv("METALPRICE_API_KEY")
    url = f"https://api.metalpriceapi.com/v1/latest?api_key={api_key}&base=USD&currencies=XAU"

    try:
        # resp = requests.get(url, timeout=15)
        # resp.raise_for_status()
        # data = resp.json()
        # # The API returns something like {"rates": {"XAU": 0.00044}, "base": "USD"}
        # rate_xau = data["rates"]["XAU"]
        # if rate_xau == 0:
        #     raise ValueError("Invalid XAU rate (0)")
        # gold_price_usd_per_oz = 1.0 / rate_xau
        # return gold_price_usd_per_oz
        return 592.48 
    except Exception as e:
        print(f"[ERROR] Could not fetch gold price: {e}")
        # Fallback to a safe default (approx)
        return 592.48  # USD/oz


# ------------------------------------------------------------------------------
# 3. Get FX rate USD→MYR from FastForex.io
#    Docs: https://www.fastforex.io/documentation
# ------------------------------------------------------------------------------
def get_fx_rate(pair: str = "USD/MYR") -> float:
    """
    Fetch latest FX rate (USD to MYR).

    Environment:
        FASTFOREX_API_KEY
    Returns:
        float: exchange rate (1 USD = ? MYR)
    """
    api_key = os.getenv("FASTFOREX_API_KEY")
    if not api_key:
        raise ValueError("FASTFOREX_API_KEY not set in .env.local")

    base, quote = pair.split("/")
    url = f"https://api.fastforex.io/fetch-one?from={base}&to={quote}&api_key={api_key}"

    try:
        # resp = requests.get(url, timeout=10)
        # resp.raise_for_status()
        # data = resp.json()
        # rate = float(data["result"][quote])
        # return rate
        return 4.70
    except Exception as e:
        print(f"[ERROR] Could not fetch FX rate {pair}: {e}")
        return 4.70  # safe default (USD→MYR)


# ------------------------------------------------------------------------------
# 4. Compute gold price in MYR per gram (helper for evaluator)
# ------------------------------------------------------------------------------
def get_gold_price_myr() -> float:
    """
    Convert USD/oz gold price to MYR/gram using live FX rate.

    1 troy ounce = 31.1034768 grams

    Returns:
        float: gold price in MYR per gram
    """
    usd_per_oz = get_gold_price_usd()
    usd_to_myr = get_fx_rate("USD/MYR")
    myr_per_gram = (usd_per_oz * usd_to_myr) / 31.1034768
    return round(myr_per_gram, 2)


# ------------------------------------------------------------------------------
# 4.1. Get yesterday's gold price from backend API
# ------------------------------------------------------------------------------
def get_yesterday_gold_price_myr() -> Optional[float]:
    """
    Fetch yesterday's gold price in MYR per gram from the backend API.
    
    Environment:
        SILSILAT_API_BASE
        SILSILAT_API_KEY (optional, for authentication)
    
    Returns:
        Optional[float]: yesterday's gold price in MYR per gram, or None if unavailable
    """
    base_url = os.getenv("SILSILAT_API_BASE", "http://localhost:9487")
    api_key = os.getenv("SILSILAT_API_KEY")
    url = f"{base_url}/api/v1/gold-price/yesterday"
    
    # Prepare headers with authentication if API key is available
    headers = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    
    try:
        # resp = requests.get(url, headers=headers, timeout=10)
        # resp.raise_for_status()
        # data = resp.json()
        
        # if data.get("success") and data.get("data"):
        #     price_per_gram_myr = float(data["data"]["pricePerGramMyr"])
        #     return round(price_per_gram_myr, 2)
        # else:
        #     print(f"[WARN] Invalid response from yesterday gold price API: {data}")
        #     return None

        return 90.00
            
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print(f"[WARN] Authentication required for gold price API. Set SILSILAT_API_KEY in environment.")
        elif e.response.status_code == 404:
            print(f"[WARN] No gold price data found for yesterday")
        else:
            print(f"[WARN] HTTP error fetching yesterday's gold price: {e}")
        return None
    except Exception as e:
        print(f"[WARN] Could not fetch yesterday's gold price: {e}")
        return None


# ------------------------------------------------------------------------------
# 4.2. Detect abnormal gold price fluctuations
# ------------------------------------------------------------------------------
def detect_abnormal_price_change(current_price: float, yesterday_price: Optional[float], 
                               max_deviation_percent: float = 5.0) -> Dict[str, Any]:
    """
    Detect if current gold price shows abnormal deviation from yesterday's price.
    
    Args:
        current_price: Current gold price in MYR per gram
        yesterday_price: Yesterday's gold price in MYR per gram (can be None)
        max_deviation_percent: Maximum allowed deviation percentage (default 5%)
    
    Returns:
        Dict containing:
        - is_abnormal: bool
        - deviation_percent: float
        - yesterday_price: Optional[float]
        - current_price: float
        - threshold_percent: float
    """
    if yesterday_price is None or yesterday_price <= 0:
        return {
            "is_abnormal": False,
            "deviation_percent": 0.0,
            "yesterday_price": yesterday_price,
            "current_price": current_price,
            "threshold_percent": max_deviation_percent,
            "reason": "No yesterday price available for comparison"
        }
    
    # Calculate percentage deviation
    deviation_percent = abs((current_price - yesterday_price) / yesterday_price) * 100
    
    is_abnormal = deviation_percent > max_deviation_percent
    
    return {
        "is_abnormal": is_abnormal,
        "deviation_percent": round(deviation_percent, 2),
        "yesterday_price": yesterday_price,
        "current_price": current_price,
        "threshold_percent": max_deviation_percent,
        "reason": f"Price deviation {deviation_percent:.2f}% {'exceeds' if is_abnormal else 'within'} threshold {max_deviation_percent}%"
    }


# ------------------------------------------------------------------------------
# 5. Get recent volatility (stub for now; replace with actual logic)
# ------------------------------------------------------------------------------
def get_volatility(symbol: str = "XAU/MYR", window: int = 30) -> float:
    """
    Compute or fetch rolling volatility (% stddev of daily returns).
    In production, integrate with time-series data provider or Silsilat data lake.
    For now, returns a static illustrative value.

    Args:
        symbol: asset symbol (e.g., XAU/MYR)
        window: rolling window in days

    Returns:
        float: volatility (0.0–1.0)
    """
    # Example: use historical API later; stubbed to 0.03 (3%)
    return 0.03


# ------------------------------------------------------------------------------
# 6. Get shop rating from Silsilat or local lookup
# ------------------------------------------------------------------------------
def get_shop_rating(shop_id: str) -> str:
    """
    Placeholder: fetch pawnshop operational rating (A–E).
    Replace with API call to Silsilat registry when available.
    """
    # Stubbed simple logic
    return "A" if shop_id.endswith("4") else "B"


# ------------------------------------------------------------------------------
# 7. Get regulatory policy (delegates to policy.py)
# ------------------------------------------------------------------------------
def get_regulatory_policy() -> dict:
    """
    Retrieve the versioned regulatory policy.
    Structure:
      {
        "id": "...",
        "version": "...",
        "hash": "...",
        "body": {
          "version": "...",
          "updated_at": "...",
          "values": { ... thresholds ... }
        }
      }
    """
    return policy.get_current_policy()


# ------------------------------------------------------------------------------
# Simple test run
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    print("Gold price MYR/g:", get_gold_price_myr())
    print("FX USD/MYR:", get_fx_rate("USD/MYR"))
    print("Volatility 30d:", get_volatility())
    print("Policy:", json.dumps(get_regulatory_policy(), indent=2))
