"""
Centralized, versioned policy for Gold Collateral Evaluation.
Update VERSION when any effective threshold/logic changes.

You may load this from a config service or repo later; for now it's local.
"""

import hashlib
import json
from datetime import datetime, timezone


VERSION = "gold-risk-2025.10.1"  # bump on any policy change

# Core thresholds / knobs
POLICY = {
    "MAX_SAFE_LTV": 0.80,
    "MARGIN_CALL_LTV": 0.85,
    "JEWELLERY_HAIRCUT_BPS": 500,
    "BAR_HAIRCUT_BPS": 100,
    "VOL_THRESHOLD": 0.05,        # 30d vol deemed "elevated" at/above this level
    "TENURE_LIMIT_DAYS": 180,
    "RISK_LEVEL": {
        "VERY_LOW": 0.60,      # LTV < 60%
        "LOW": 0.69,           # LTV 61% - 69%
        "MEDIUM": 0.79,        # LTV 70% - 79%
        "HIGH": 0.85,          # LTV 80% - 85%
        "VERY_HIGH": 0.85,     # LTV > 85%
    }
}

def _hash_policy(payload: dict) -> str:
    # Stable JSON for hashing
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()

def get_current_policy() -> dict:
    """
    Returns a self-describing policy object with id/version/hash.
    """
    body = {
        "version": VERSION,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "values": POLICY,
    }
    return {
        "id": f"{VERSION}:{_hash_policy(body)}",
        "version": VERSION,
        "hash": _hash_policy(POLICY),
        "body": body,
    }