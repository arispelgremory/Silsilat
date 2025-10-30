#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gold_evaluator.py (policy-synced)

Adds:
  • Live policy sync at start of each run (policy takes precedence over .env)
  • Phoenix spans include policy.version, policy.hash, and policy thresholds
  • Explanations use policy VOL_THRESHOLD instead of hard-coded values
  • Output JSON includes a concise `policy` block

See .env.local for environment defaults that can be overridden by policy.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Literal, List
from base64 import b64encode, b64decode

import requests
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError, field_validator
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# --- Local modules ---
from sources import (
    get_gold_price_myr,
    get_yesterday_gold_price_myr,
    detect_abnormal_price_change,
    get_volatility,
    get_fx_rate,
    get_regulatory_policy,   # NEW: policy pull
)
from prompts import SYSTEM_PROMPT, RECOMMENDATION_PROMPT

# ---- OpenTelemetry / Phoenix ----
from opentelemetry import trace
from opentelemetry.trace import Tracer, Status, StatusCode, get_current_span
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


# ------------------------------------------------------------------------------
# Configuration helpers (env defaults)
# ------------------------------------------------------------------------------
def base_env_config() -> Dict[str, Any]:
    load_dotenv(".env")
    return {
        "OLLAMA_BASE_URL": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/"),
        "DEFAULT_LLM_MODEL": os.getenv("DEFAULT_LLM_MODEL", "llama3.1:8b"),
        "PHOENIX_COLLECTOR_ENDPOINT": os.getenv("PHOENIX_COLLECTOR_ENDPOINT", "http://localhost:6006/v1/traces"),
        "PHOENIX_SERVICE_NAME": os.getenv("PHOENIX_SERVICE_NAME", "silsilat-gold-evaluator"),
        "SILSILAT_API_BASE": os.getenv("SILSILAT_API_BASE", "http://localhost:9487").rstrip("/"),
        "INPUT_TOPIC_ID": os.getenv("INPUT_TOPIC_ID", ""),
        "OUTPUT_TOPIC_ID": os.getenv("OUTPUT_TOPIC_ID", ""),
        "IPFS_ENCRYPTION_KEY": os.getenv("IPFS_ENCRYPTION_KEY", ""),
        # Defaults (will be overridden by policy if present)
        "JEWELLERY_HAIRCUT_BPS": int(os.getenv("JEWELLERY_HAIRCUT_BPS", "500")),
        "BAR_HAIRCUT_BPS": int(os.getenv("BAR_HAIRCUT_BPS", "100")),
        "MAX_SAFE_LTV": float(os.getenv("MAX_SAFE_LTV", "0.80")),
        "MARGIN_CALL_LTV": float(os.getenv("MARGIN_CALL_LTV", "0.85")),
        "VOL_WINDOW": int(os.getenv("VOL_WINDOW", "30")),
        "VOL_THRESHOLD": float(os.getenv("VOL_THRESHOLD", "0.05")),
        "TENURE_LIMIT_DAYS": int(os.getenv("TENURE_LIMIT_DAYS", "180")),
        "PRICE_DEVIATION_THRESHOLD": float(os.getenv("PRICE_DEVIATION_THRESHOLD", "5.0")),
    }

def merge_policy(cfg: Dict[str, Any], policy_obj: Dict[str, Any]) -> Dict[str, Any]:
    """
    Overlay thresholds from the live policy onto env defaults.
    Policy takes precedence; keep env values as fallback.
    """
    if not policy_obj or "body" not in policy_obj:
        return cfg

    vals = (policy_obj.get("body") or {}).get("values") or {}
    # Overlay known keys
    for k in ["JEWELLERY_HAIRCUT_BPS", "BAR_HAIRCUT_BPS", "MAX_SAFE_LTV",
              "MARGIN_CALL_LTV", "TENURE_LIMIT_DAYS", "VOL_THRESHOLD", "PRICE_DEVIATION_THRESHOLD"]:
        if k in vals:
            cfg[k] = vals[k]

    # Stash policy meta for tracing/output
    cfg["POLICY_VERSION"] = policy_obj.get("version")
    cfg["POLICY_HASH"] = policy_obj.get("hash")
    cfg["POLICY_ID"] = policy_obj.get("id")
    return cfg

def load_config_with_policy() -> Dict[str, Any]:
    print("[INFO] Loading configuration with policy...", file=sys.stderr)
    cfg = base_env_config()
    try:
        pol = get_regulatory_policy()
        if pol:
            print(f"[INFO] Regulatory policy loaded - Version: {pol.get('version')}, Hash: {pol.get('hash')}", file=sys.stderr)
    except Exception as e:
        print(f"[WARN] Failed to fetch regulatory policy: {e}", file=sys.stderr)
        pol = None
    cfg = merge_policy(cfg, pol or {})
    print(f"[INFO] Configuration loaded. Policy active: {bool(pol)}", file=sys.stderr)
    return cfg


# ------------------------------------------------------------------------------
# OpenTelemetry / Phoenix initialization
# ------------------------------------------------------------------------------
def init_tracing(phoenix_endpoint: str, service_name: str) -> Tracer:
    resource = Resource.create(
        attributes={
            "service.name": service_name,
            "service.version": "1.0.0",
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
        }
    )
    provider = TracerProvider(resource=resource)
    exporter = OTLPSpanExporter(endpoint=phoenix_endpoint)
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    return trace.get_tracer(__name__)


# ------------------------------------------------------------------------------
# Data models
# ------------------------------------------------------------------------------
class LoanInput(BaseModel):
    principal_myr: float = Field(gt=0)
    gold_weight_g: float = Field(gt=0)
    purity: int = Field(ge=500, le=999)
    tenure_days: int = Field(ge=1)

    @field_validator("purity")
    @classmethod
    def purity_reasonable(cls, v: int) -> int:
        if v not in (999, 995, 990, 958, 950, 925, 916, 875, 750, 585):
            return v
        return v

class RiskMetrics(BaseModel):
    gold_price_myr_per_g: float
    purity_factor: float
    haircut_bps: int
    haircut_factor: float
    collateral_value_myr: float
    principal_myr: float
    ltv: float
    risk_level: Literal["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]
    max_safe_ltv: float
    margin_call_ltv: float
    vol_window_days: int
    gold_volatility: Optional[float] = None
    fx_usd_myr: Optional[float] = None
    shop_rating: Optional[str] = None

class LLMRecommendation(BaseModel):
    model: str
    rationale: str
    action: Literal["approve", "monitor", "margin_call", "reject"]

class RuleHit(BaseModel):
    code: str
    severity: Literal["info", "warn", "critical"]
    message: str
    details: Dict[str, Any] = {}

class EvaluationOutput(BaseModel):
    schema_id: str = "ps.silsilat/gold-eval/1.2"
    eval_id: str
    timestamp_utc: str
    trace_id: str
    inputs: LoanInput
    metrics: RiskMetrics
    recommendation: LLMRecommendation
    explanations: List[RuleHit] = []
    policy: Dict[str, Any] = {}   # NEW: compact policy meta (id, version, hash)

# ------------------------------------------------------------------------------
# Computation logic
# ------------------------------------------------------------------------------
def calculate_risk_level(ltv: float) -> Literal["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]:
    """
    Calculate risk level based on LTV ratio:
    - VERY_LOW: < 60%
    - LOW: 61% - 69%
    - MEDIUM: 70% - 79%
    - HIGH: 80% - 85%
    - VERY_HIGH: > 85%
    """
    if ltv < 0.60:
        return "VERY_LOW"
    elif ltv <= 0.69:
        return "LOW"
    elif ltv <= 0.79:
        return "MEDIUM"
    elif ltv <= 0.85:
        return "HIGH"
    else:
        return "VERY_HIGH"


def compute_metrics(
    loan: LoanInput,
    gold_price_myr_per_g: float,
    haircut_bps: int,
    max_safe_ltv: float,
    margin_call_ltv: float,
    vol_window_days: int,
    tracer: Tracer,
) -> RiskMetrics:
    print(f"[INFO] Computing metrics - Gold price: {gold_price_myr_per_g} MYR/g, Weight: {loan.gold_weight_g}g, Purity: {loan.purity}", file=sys.stderr)
    with tracer.start_as_current_span("compute_metrics") as span:
        purity_factor = loan.purity / 999.0
        haircut_factor = max(0.0, 1.0 - haircut_bps / 10_000.0)

        raw_value = loan.gold_weight_g * purity_factor * gold_price_myr_per_g
        collateral_value_myr = raw_value * haircut_factor
        ltv = loan.principal_myr / max(collateral_value_myr, 1e-9)
        risk_level = calculate_risk_level(ltv)

        gold_vol = None
        fx = None

        try:
            with tracer.start_as_current_span("get_gold_volatility") as s_vol:
                gold_vol = float(get_volatility("XAU/MYR", window=vol_window_days))
                s_vol.set_attribute("result.gold_volatility", gold_vol)
                print(f"[INFO] Gold volatility: {gold_vol:.2%} over {vol_window_days} days", file=sys.stderr)
        except Exception as e:
            print(f"[WARN] Failed to fetch volatility: {e}", file=sys.stderr)
            span.add_event("volatility_fetch_error", {"error": str(e)})

        try:
            with tracer.start_as_current_span("get_fx_rate") as s_fx:
                fx = float(get_fx_rate("USD/MYR"))
                s_fx.set_attribute("result.usd_myr", fx)
                print(f"[INFO] USD/MYR rate: {fx}", file=sys.stderr)
        except Exception as e:
            print(f"[WARN] Failed to fetch FX rate: {e}", file=sys.stderr)
            pass

        span.set_attribute("metrics.ltv", round(ltv, 6))
        span.set_attribute("metrics.risk_level", risk_level)
        span.set_attribute("metrics.collateral_value_myr", round(collateral_value_myr, 2))
        span.set_attribute("inputs.purity_factor", purity_factor)
        span.set_attribute("inputs.haircut_bps", haircut_bps)
        
        print(f"[INFO] Metrics computed - LTV: {ltv:.2%}, Risk Level: {risk_level}, Collateral Value: {collateral_value_myr:.2f} MYR", file=sys.stderr)

        return RiskMetrics(
            gold_price_myr_per_g=gold_price_myr_per_g,
            purity_factor=purity_factor,
            haircut_bps=haircut_bps,
            haircut_factor=haircut_factor,
            collateral_value_myr=collateral_value_myr,
            principal_myr=loan.principal_myr,
            ltv=ltv,
            risk_level=risk_level,
            max_safe_ltv=max_safe_ltv,
            margin_call_ltv=margin_call_ltv,
            vol_window_days=vol_window_days,
            gold_volatility=gold_vol,
            fx_usd_myr=fx,
            shop_rating=None,
        )


# ------------------------------------------------------------------------------
# Rule explanations using policy thresholds
# ------------------------------------------------------------------------------
def generate_explanations(loan: LoanInput, m: RiskMetrics, vol_threshold: float, tenure_limit: int, 
                         tracer: Tracer, abnormal_price_info: Optional[Dict[str, Any]] = None) -> List[RuleHit]:
    hits: List[RuleHit] = []
    with tracer.start_as_current_span("generate_explanations") as span:
        span.set_attribute("inputs.vol_threshold", vol_threshold)
        span.set_attribute("inputs.tenure_limit_days", tenure_limit)
        span.set_attribute("inputs.ltv", round(m.ltv, 6))
        span.set_attribute("inputs.risk_level", m.risk_level)

    # Risk Level Classification
    risk_severity_map = {
        "VERY_LOW": "info",
        "LOW": "info",
        "MEDIUM": "warn",
        "HIGH": "warn",
        "VERY_HIGH": "critical"
    }
    risk_messages = {
        "VERY_LOW": f"Risk level VERY_LOW (LTV {m.ltv:.2%} < 60%)",
        "LOW": f"Risk level LOW (LTV {m.ltv:.2%} between 61-69%)",
        "MEDIUM": f"Risk level MEDIUM (LTV {m.ltv:.2%} between 70-79%)",
        "HIGH": f"Risk level HIGH (LTV {m.ltv:.2%} between 80-85%)",
        "VERY_HIGH": f"Risk level VERY_HIGH (LTV {m.ltv:.2%} > 85%)"
    }
    hits.append(RuleHit(
        code=f"RISK_LEVEL_{m.risk_level}",
        severity=risk_severity_map[m.risk_level],
        message=risk_messages[m.risk_level],
        details={"ltv": m.ltv, "risk_level": m.risk_level}
    ))

    # LTV thresholds
    if m.ltv >= m.margin_call_ltv:
        hits.append(RuleHit(
            code="LTV_CRITICAL",
            severity="critical",
            message=f"LTV {m.ltv:.2f} ≥ margin-call threshold {m.margin_call_ltv:.2f}.",
            details={"ltv": m.ltv, "margin_call_ltv": m.margin_call_ltv}
        ))
    elif m.ltv > m.max_safe_ltv:
        hits.append(RuleHit(
            code="LTV_ELEVATED",
            severity="warn",
            message=f"LTV {m.ltv:.2f} above safe limit {m.max_safe_ltv:.2f}.",
            details={"ltv": m.ltv, "max_safe_ltv": m.max_safe_ltv}
        ))
    else:
        hits.append(RuleHit(
            code="LTV_OK",
            severity="info",
            message=f"LTV {m.ltv:.2f} within safe limit {m.max_safe_ltv:.2f}.",
            details={"ltv": m.ltv, "max_safe_ltv": m.max_safe_ltv}
        ))

    # Collateral haircut context
    hits.append(RuleHit(
        code="HAIRCUT_APPLIED",
        severity="info",
        message=f"Applied haircut {m.haircut_bps} bps.",
        details={"haircut_bps": m.haircut_bps}
    ))

    # Volatility vs policy threshold
    if m.gold_volatility is not None:
        if m.gold_volatility >= vol_threshold:
            hits.append(RuleHit(
                code="VOL_ELEVATED",
                severity="warn",
                message=f"30d volatility {m.gold_volatility:.2%} ≥ policy threshold {vol_threshold:.2%}.",
                details={"volatility_30d": m.gold_volatility, "policy_vol_threshold": vol_threshold}
            ))
        else:
            hits.append(RuleHit(
                code="VOL_NORMAL",
                severity="info",
                message=f"30d volatility {m.gold_volatility:.2%} below policy threshold {vol_threshold:.2%}.",
                details={"volatility_30d": m.gold_volatility, "policy_vol_threshold": vol_threshold}
            ))

        # Tenure
    if loan.tenure_days >= tenure_limit:
        hits.append(RuleHit(
            code="TENURE_LONG",
            severity="warn",
            message=f"Tenure {loan.tenure_days}d ≥ policy limit {tenure_limit}d.",
            details={"tenure_days": loan.tenure_days, "policy_tenure_limit_days": tenure_limit}
        ))
    else:
        hits.append(RuleHit(
            code="TENURE_NORMAL",
            severity="info",
            message=f"Tenure {loan.tenure_days}d within policy limit {tenure_limit}d.",
            details={"tenure_days": loan.tenure_days, "policy_tenure_limit_days": tenure_limit}
        ))

    # Abnormal price detection
    if abnormal_price_info:
        if abnormal_price_info["is_abnormal"]:
            hits.append(RuleHit(
                code="PRICE_ABNORMAL",
                severity="critical",
                message=f"Gold price shows abnormal deviation: {abnormal_price_info['reason']}",
                details={
                    "current_price": abnormal_price_info["current_price"],
                    "yesterday_price": abnormal_price_info["yesterday_price"],
                    "deviation_percent": abnormal_price_info["deviation_percent"],
                    "threshold_percent": abnormal_price_info["threshold_percent"]
                }
            ))
        else:
            hits.append(RuleHit(
                code="PRICE_NORMAL",
                severity="info",
                message=f"Gold price within normal range: {abnormal_price_info['reason']}",
                details={
                    "current_price": abnormal_price_info["current_price"],
                    "yesterday_price": abnormal_price_info["yesterday_price"],
                    "deviation_percent": abnormal_price_info["deviation_percent"],
                    "threshold_percent": abnormal_price_info["threshold_percent"]
                }
            ))

        # Summary attributes for quick filtering
        span.set_attribute("explanations.count", len(hits))
        span.set_attribute("explanations.codes", ",".join([h.code for h in hits]))
    return hits


# ------------------------------------------------------------------------------
# Encryption utilities
# ------------------------------------------------------------------------------
def encrypt_message(message: str, encryption_key: str) -> str:
    """
    Encrypt a message using AES-256-GCM.
    Returns base64-encoded string in format: iv:tag:ciphertext
    """
    if not encryption_key:
        return message  # Return plain text if no encryption key
    
    try:
        # Derive 32-byte key from encryption key using PBKDF2HMAC
        salt = b'hedera-topic-salt'  # Fixed salt for consistency
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA512(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = kdf.derive(encryption_key.encode('utf-8'))
        
        # Generate random 16-byte IV
        iv = os.urandom(16)
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # Add associated data
        encryptor.authenticate_additional_data(b'hedera-topic-message')
        
        # Encrypt the message
        ciphertext = encryptor.update(message.encode('utf-8')) + encryptor.finalize()
        
        # Get authentication tag
        tag = encryptor.tag
        
        # Combine iv:tag:ciphertext (all base64 encoded)
        encrypted = f"{b64encode(iv).decode('utf-8')}:{b64encode(tag).decode('utf-8')}:{b64encode(ciphertext).decode('utf-8')}"
        return encrypted
    except Exception as e:
        print(f"[ERROR] Failed to encrypt message: {e}", file=sys.stderr)
        return message  # Fallback to plain text on error


# ------------------------------------------------------------------------------
# Ollama LLM caller
# ------------------------------------------------------------------------------
def send_to_hedera_topic(api_base: str, topic_id: str, message: str, encryption_key: str = "") -> None:
    """Send an encrypted message to a Hedera topic via the Silsilat API."""
    if not topic_id:
        return  # Skip if topic ID not configured
    print(f"[INFO] Sending message to Hedera topic {topic_id}", file=sys.stderr)
    try:
        # Encrypt the message if encryption key is provided
        encrypted_message = encrypt_message(message, encryption_key)
        print(f"[INFO] Encrypted message: {encrypted_message}", file=sys.stderr)
        url = f"{api_base}/api/v1/topic/setmessage"
        payload = {
            "topicId": topic_id,
            "message": encrypted_message
        }
        print(f"[INFO] Payload: {payload}", file=sys.stderr)
        requests.post(url, json=payload, timeout=10)
        print(f"[INFO] Sent encrypted message to Hedera topic {topic_id}", file=sys.stderr)
    except Exception as e:
        print(f"[ERROR] Failed to send message to Hedera topic {topic_id}: {e}", file=sys.stderr)


def call_ollama(base_url: str, model: str, system_prompt: str, user_prompt: str, tracer: Tracer, 
                api_base: str = "", input_topic_id: str = "", output_topic_id: str = "", 
                risk_level: str = "", metrics: Optional[Dict[str, Any]] = None, encryption_key: str = "") -> str:
    chat_url = f"{base_url}/api/chat"
    gen_url = f"{base_url}/api/generate"
    payload_chat = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {"temperature": 0.2, "top_p": 0.9},
    }

    print(f"[INFO] Calling Ollama LLM - Model: {model}", file=sys.stderr)
    with tracer.start_as_current_span("call_ollama") as span:
        span.set_attribute("llm.model", model)
        span.set_attribute("ollama.endpoint", chat_url)
        
        # Track AI agent input (Generative AI semantic key)
        span.set_attribute("input.value", user_prompt)
        # Send encrypted input to Hedera topic (without risk_level)
        send_to_hedera_topic(api_base, input_topic_id, user_prompt, encryption_key)

        try:
            resp = requests.post(chat_url, json=payload_chat, timeout=120)
            if resp.ok:
                data = resp.json()
                text = data.get("message", {}).get("content", "").strip()
                print(f"[INFO] LLM response received via chat API (length: {len(text)} chars)", file=sys.stderr)
                
                # Create output with risk_level included
                output_data = {
                    "risk_level": risk_level,
                    "llm_response": text,
                    "metrics": metrics
                }
                # Send encrypted AI response with risk_level to Hedera topic
                send_to_hedera_topic(api_base, output_topic_id, json.dumps(output_data), encryption_key)
                
                span.set_attribute("llm.mode", "chat")
                span.set_attribute("llm.tokens_out_len", len(text))
                span.set_attribute("output.value", text)
                return text
        except Exception as e:
            span.add_event("ollama_chat_error", {"error": str(e)})

        span.set_attribute("ollama.endpoint", gen_url)
        gen_prompt = f"{system_prompt}\n\n{user_prompt}"
        payload_gen = {
            "model": model,
            "prompt": gen_prompt,
            "stream": False,
            "options": {"temperature": 0.2, "top_p": 0.9},
        }

        resp = requests.post(gen_url, json=payload_gen, timeout=120)
        resp.raise_for_status()
        text = resp.json().get("response", "").strip()
        print(f"[INFO] LLM response received via generate API (length: {len(text)} chars)", file=sys.stderr)
        
        # Create output with risk_level included
        output_data = {
            "risk_level": risk_level,
            "llm_response": text,
            "metrics": metrics
        }
        # Send encrypted AI response with risk_level to Hedera topic
        send_to_hedera_topic(api_base, output_topic_id, json.dumps(output_data), encryption_key)

        span.set_attribute("llm.mode", "generate")
        span.set_attribute("llm.tokens_out_len", len(text))
        # Track AI agent output (Generative AI semantic key)
        span.set_attribute("output.value", text)
        return text


# ------------------------------------------------------------------------------
# Recommendation generator
# ------------------------------------------------------------------------------
def build_recommendation_with_llm(
    loan: LoanInput, metrics: RiskMetrics, llm_model: str, base_url: str, tracer: Tracer,
    api_base: str = "", input_topic_id: str = "", output_topic_id: str = "", encryption_key: str = ""
) -> LLMRecommendation:
    print(f"[INFO] Building recommendation with LLM - Action will be based on risk level: {metrics.risk_level}", file=sys.stderr)
    with tracer.start_as_current_span("build_recommendation_with_llm") as span:
        loan_json = loan.model_dump_json()
        
        # Create metrics dict without risk_level for the prompt
        metrics_dict = metrics.model_dump()
        metrics_dict.pop("risk_level", None)  # Remove risk_level from input
        metrics_json = json.dumps(metrics_dict)
        
        user_prompt = RECOMMENDATION_PROMPT.format(
            loan_json=loan_json,
            metrics_json=metrics_json,
            allowed_actions="approve | monitor | margin_call | reject",
        )
        span.set_attribute("input.value", user_prompt)

        llm_text = call_ollama(
            base_url, llm_model, SYSTEM_PROMPT, user_prompt, tracer,
            api_base, input_topic_id, output_topic_id,
            risk_level=metrics.risk_level,
            metrics=metrics.model_dump(),
            encryption_key=encryption_key
        )
        span.set_attribute("output.value", llm_text)
        span.set_attribute("llm.model", llm_model)

        chosen_action = "monitor"
        for token in ["approve", "margin_call", "reject", "monitor"]:
            if token in llm_text.lower():
                chosen_action = token
                break
        span.set_attribute("decision.recommendation_action", chosen_action)
        
        print(f"[INFO] LLM recommendation - Action: {chosen_action.upper()}", file=sys.stderr)

        return LLMRecommendation(model=llm_model, rationale=llm_text, action=chosen_action)


# ------------------------------------------------------------------------------
# Orchestration (one-shot evaluation)
# ------------------------------------------------------------------------------
def evaluate_loan(loan: LoanInput, cfg: Dict[str, Any], tracer: Tracer) -> EvaluationOutput:
    eval_id = str(uuid.uuid4())
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    
    print(f"[INFO] ========== Starting loan evaluation (ID: {eval_id}) ==========", file=sys.stderr)
    print(f"[INFO] Loan inputs - Principal: {loan.principal_myr} MYR, Weight: {loan.gold_weight_g}g, Purity: {loan.purity}, Tenure: {loan.tenure_days} days", file=sys.stderr)

    with tracer.start_as_current_span("evaluate_loan") as span:
        span.set_attribute("eval.id", eval_id)
        
        # Track AI agent input (loan data) using Generative AI semantic key
        span.set_attribute("input.value", loan.model_dump_json())

        # ---- Log active policy to Phoenix ----
        span.set_attribute("policy.version", cfg.get("POLICY_VERSION", "unknown"))
        span.set_attribute("policy.hash", cfg.get("POLICY_HASH", ""))
        span.set_attribute("policy.id", cfg.get("POLICY_ID", ""))
        # thresholds for quick filters
        span.set_attribute("policy.max_safe_ltv", cfg["MAX_SAFE_LTV"])
        span.set_attribute("policy.margin_call_ltv", cfg["MARGIN_CALL_LTV"])
        span.set_attribute("policy.haircut_bps", cfg["JEWELLERY_HAIRCUT_BPS"])
        span.set_attribute("policy.vol_threshold", cfg["VOL_THRESHOLD"])
        span.set_attribute("policy.tenure_limit_days", cfg["TENURE_LIMIT_DAYS"])
        span.set_attribute("policy.price_deviation_threshold", cfg["PRICE_DEVIATION_THRESHOLD"])

        # 1) Fetch gold price and detect abnormalities
        print("[INFO] Step 1: Fetching current gold price...", file=sys.stderr)
        with tracer.start_as_current_span("fetch_gold_price") as span_price:
            gold_price = float(get_gold_price_myr())
            span_price.set_attribute("result.gold_price_myr_per_g", gold_price)
            
            # Fetch yesterday's price for comparison
            yesterday_price = get_yesterday_gold_price_myr()
            span_price.set_attribute("result.yesterday_gold_price_myr_per_g", yesterday_price or 0.0)
            
            # Detect abnormal price changes
            price_deviation_threshold = cfg["PRICE_DEVIATION_THRESHOLD"]
            abnormal_detection = detect_abnormal_price_change(
                current_price=gold_price,
                yesterday_price=yesterday_price,
                max_deviation_percent=price_deviation_threshold
            )
            
            # Log abnormal price detection to Phoenix with admin-friendly attributes
            span_price.set_attribute("price_analysis.is_abnormal", abnormal_detection["is_abnormal"])
            span_price.set_attribute("price_analysis.deviation_percent", abnormal_detection["deviation_percent"])
            span_price.set_attribute("price_analysis.threshold_percent", abnormal_detection["threshold_percent"])
            span_price.set_attribute("price_analysis.reason", abnormal_detection["reason"])
            
            # Enhanced Phoenix visibility for admins
            if abnormal_detection["is_abnormal"]:
                print(f"[CRITICAL] Abnormal gold price detected! - Deviation: {abnormal_detection['deviation_percent']:.1f}%, Threshold: {price_deviation_threshold}%", file=sys.stderr)
                # High-visibility attributes for easy filtering
                span_price.set_attribute("alert.price_abnormal", True)
                span_price.set_attribute("alert.severity", "CRITICAL")
                span_price.set_attribute("alert.type", "GOLD_PRICE_ANOMALY")
                span_price.set_attribute("alert.priority", "P0")
                
                # Admin-friendly summary attributes
                span_price.set_attribute("admin.price_change_summary", 
                    f"Gold price {abnormal_detection['deviation_percent']:.1f}% deviation detected")
                span_price.set_attribute("admin.current_price_myr", gold_price)
                span_price.set_attribute("admin.yesterday_price_myr", yesterday_price)
                span_price.set_attribute("admin.price_difference_myr", abs(gold_price - yesterday_price))
                
                # Critical event with detailed context
                span_price.add_event("CRITICAL_GOLD_PRICE_ANOMALY", {
                    "alert_type": "GOLD_PRICE_ABNORMAL",
                    "severity": "CRITICAL",
                    "priority": "P0",
                    "current_price_myr": gold_price,
                    "yesterday_price_myr": yesterday_price,
                    "deviation_percent": abnormal_detection["deviation_percent"],
                    "threshold_percent": price_deviation_threshold,
                    "price_difference_myr": abs(gold_price - yesterday_price),
                    "direction": "increase" if gold_price > yesterday_price else "decrease",
                    "admin_action_required": True,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
                # Set span status to ERROR for immediate visibility
                span_price.set_status(Status(StatusCode.ERROR, "Abnormal gold price detected"))
                
            else:
                span_price.set_attribute("alert.price_abnormal", False)
                span_price.set_attribute("alert.severity", "NORMAL")
                span_price.set_attribute("admin.price_change_summary", 
                    f"Gold price normal ({abnormal_detection['deviation_percent']:.1f}% deviation)")

        # 2) Compute metrics (using jewellery haircut as default)
        print("[INFO] Step 2: Computing risk metrics...", file=sys.stderr)
        metrics = compute_metrics(
            loan=loan,
            gold_price_myr_per_g=gold_price,
            haircut_bps=cfg["JEWELLERY_HAIRCUT_BPS"],
            max_safe_ltv=cfg["MAX_SAFE_LTV"],
            margin_call_ltv=cfg["MARGIN_CALL_LTV"],
            vol_window_days=cfg["VOL_WINDOW"],
            tracer=tracer,
        )

        # 3) Rule explanations using policy thresholds
        print("[INFO] Step 3: Generating rule explanations...", file=sys.stderr)
        explanations = generate_explanations(
            loan, metrics,
            vol_threshold=cfg["VOL_THRESHOLD"],
            tenure_limit=cfg["TENURE_LIMIT_DAYS"],
            tracer=tracer,
            abnormal_price_info=abnormal_detection,
        )

        # 4) LLM recommendation
        print("[INFO] Step 4: Getting LLM recommendation...", file=sys.stderr)
        rec = build_recommendation_with_llm(
            loan=loan,
            metrics=metrics,
            llm_model=cfg["DEFAULT_LLM_MODEL"],
            base_url=cfg["OLLAMA_BASE_URL"],
            tracer=tracer,
            api_base=cfg["SILSILAT_API_BASE"],
            input_topic_id=cfg["INPUT_TOPIC_ID"],
            output_topic_id=cfg["OUTPUT_TOPIC_ID"],
            encryption_key=cfg["IPFS_ENCRYPTION_KEY"],
        )

        # 5) Decision attributes and admin visibility
        span.set_attribute("decision.action", rec.action)
        
        # Enhanced admin visibility for abnormal prices
        if abnormal_detection["is_abnormal"]:
            span.set_attribute("admin.has_critical_alert", True)
            span.set_attribute("admin.alert_summary", 
                f"CRITICAL: Gold price anomaly detected - {abnormal_detection['deviation_percent']:.1f}% deviation")
            span.set_status(Status(StatusCode.ERROR, "Critical gold price anomaly detected"))
        else:
            span.set_attribute("admin.has_critical_alert", False)
            span.set_status(
                Status(StatusCode.OK if rec.action in ("approve", "monitor") else StatusCode.ERROR)
            )

    # Trace id for Phoenix deep-linking
    current_span = get_current_span()
    span_ctx = current_span.get_span_context()
    trace_id_hex = f"{span_ctx.trace_id:032x}" if span_ctx and span_ctx.trace_id else ""

    # Compact policy meta for output JSON
    policy_meta = {
        "id": cfg.get("POLICY_ID"),
        "version": cfg.get("POLICY_VERSION"),
        "hash": cfg.get("POLICY_HASH"),
        "values": {
            "MAX_SAFE_LTV": cfg["MAX_SAFE_LTV"],
            "MARGIN_CALL_LTV": cfg["MARGIN_CALL_LTV"],
            "HAIRCUT_BPS": cfg["JEWELLERY_HAIRCUT_BPS"],
            "VOL_THRESHOLD": cfg["VOL_THRESHOLD"],
            "TENURE_LIMIT_DAYS": cfg["TENURE_LIMIT_DAYS"],
            "PRICE_DEVIATION_THRESHOLD": cfg["PRICE_DEVIATION_THRESHOLD"],
        }
    }

    # Create the evaluation output
    output = EvaluationOutput(
        eval_id=eval_id,
        timestamp_utc=timestamp_utc,
        trace_id=trace_id_hex,
        inputs=loan,
        metrics=metrics,
        recommendation=rec,
        explanations=explanations,
        policy=policy_meta,  # NEW
    )
    
    # Track AI agent output (final evaluation result)
    current_span = get_current_span()
    if current_span:
        current_span.set_attribute("output.value", output.model_dump_json())
    
    print(f"[INFO] ========== Evaluation complete - Final recommendation: {rec.action.upper()} ==========", file=sys.stderr)
    print(f"[INFO] Trace ID: {trace_id_hex}", file=sys.stderr)
    
    return output


# ------------------------------------------------------------------------------
# CLI / Demo runner
# ------------------------------------------------------------------------------
def main(argv: list[str]) -> int:
    print("[INFO] Gold Evaluator Agent starting...", file=sys.stderr)
    cfg = load_config_with_policy()
    print("[INFO] Initializing Phoenix tracing...", file=sys.stderr)
    tracer = init_tracing(
        phoenix_endpoint=cfg["PHOENIX_COLLECTOR_ENDPOINT"],
        service_name=cfg["PHOENIX_SERVICE_NAME"],
    )

    # Read input (file path or stdin)
    if len(argv) > 1 and argv[1] != "-":
        print(f"[INFO] Reading input from file: {argv[1]}", file=sys.stderr)
        with open(argv[1], "r", encoding="utf-8") as f:
            raw = json.load(f)
    else:
        print("[INFO] Reading input from stdin...", file=sys.stderr)
        raw = json.loads(sys.stdin.read())

    try:
        loan = LoanInput(**raw)
    except ValidationError as ve:
        print(f"[ERROR] Input validation failed: {ve}", file=sys.stderr)
        with tracer.start_as_current_span("input_validation_error") as span:
            span.record_exception(ve)
            span.set_status(Status(StatusCode.ERROR))
        print(json.dumps({"error": "validation_error", "details": json.loads(ve.json())}, indent=2))
        return 1

    try:
        output = evaluate_loan(loan, cfg, tracer)
        print("\n[INFO] Returning evaluation result...", file=sys.stderr)
        print(output.model_dump_json(indent=2, ensure_ascii=False))
        return 0
    except Exception as e:
        print(f"[ERROR] Fatal error during evaluation: {e}", file=sys.stderr)
        with trace.get_tracer(__name__).start_as_current_span("fatal_error") as span:
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR))
        print(json.dumps({"error": "fatal", "message": str(e)}, indent=2))
        return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
