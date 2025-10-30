# -*- coding: utf-8 -*-
"""
ipfs_utils.py
IPFS utilities for storing artifacts using Pinata Cloud API.

Supports:
- Pinata Cloud API for IPFS storage and pinning
- Local IPFS daemon as fallback
- Automatic CIDv1 generation
"""

import base64
import io
import json
import os
import requests
from typing import Optional, Dict, Any

from dotenv import load_dotenv
load_dotenv(".env")

# Pinata Configuration
PINATA_API_URL = "https://api.pinata.cloud"
PINATA_JWT = os.getenv("PINATA_JWT", "")
PINATA_API_KEY = os.getenv("PINATA_API_KEY", "")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY", "")

# Fallback to local IPFS
IPFS_API_URL = os.getenv("IPFS_API_URL", "http://127.0.0.1:5001/api/v0").rstrip("/")
USE_LOCAL_IPFS = os.getenv("USE_LOCAL_IPFS", "false").lower() == "true"

def _pinata_headers() -> Dict[str, str]:
    """Get headers for Pinata API requests."""
    if PINATA_JWT:
        return {
            "Authorization": f"Bearer {PINATA_JWT}",
            "Content-Type": "application/json"
        }
    elif PINATA_API_KEY and PINATA_SECRET_KEY:
        return {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_KEY
        }
    else:
        raise ValueError("Either PINATA_JWT or PINATA_API_KEY + PINATA_SECRET_KEY must be set")

def _local_ipfs_headers() -> Dict[str, str]:
    """Get headers for local IPFS daemon."""
    return {}

def pinata_add_bytes(data: bytes, filename: str = "artifact.json", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Add raw bytes to IPFS via Pinata API."""
    if not PINATA_JWT and not (PINATA_API_KEY and PINATA_SECRET_KEY):
        raise ValueError("Pinata credentials not configured")
    
    # Prepare the file for upload
    files = {"file": (filename, io.BytesIO(data))}
    
    # Prepare metadata
    pinata_metadata = {
        "name": filename,
        "keyvalues": metadata or {}
    }
    
    # Prepare options
    pinata_options = {
        "cidVersion": 1,  # Use CIDv1
        "wrapWithDirectory": False
    }
    
    # Make the request
    url = f"{PINATA_API_URL}/pinning/pinFileToIPFS"
    headers = _pinata_headers()
    
    # Remove Content-Type for multipart form data
    if "Content-Type" in headers:
        del headers["Content-Type"]
    
    data_payload = {
        "pinataMetadata": json.dumps(pinata_metadata),
        "pinataOptions": json.dumps(pinata_options)
    }
    
    resp = requests.post(url, files=files, data=data_payload, headers=headers, timeout=60)
    resp.raise_for_status()
    
    result = resp.json()
    return {
        "cid": result["IpfsHash"],
        "size": result["PinSize"],
        "timestamp": result["Timestamp"],
        "isDuplicate": result.get("isDuplicate", False)
    }

def local_ipfs_add_bytes(data: bytes, filename: str = "artifact.json") -> Dict[str, Any]:
    """Add raw bytes to local IPFS daemon."""
    url = f"{IPFS_API_URL}/add"
    files = {"file": (filename, io.BytesIO(data))}
    resp = requests.post(url, files=files, headers=_local_ipfs_headers(), timeout=60)
    resp.raise_for_status()
    j = resp.json()
    return {
        "cid": j.get("Hash"),
        "size": int(j.get("Size", 0))
    }

def ipfs_add_bytes(data: bytes, filename: str = "artifact.json", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Add raw bytes to IPFS (Pinata preferred, local fallback)."""
    if USE_LOCAL_IPFS:
        return local_ipfs_add_bytes(data, filename)
    else:
        try:
            return pinata_add_bytes(data, filename, metadata)
        except Exception as e:
            print(f"Pinata upload failed: {e}")
            if not USE_LOCAL_IPFS:
                print("Falling back to local IPFS...")
                return local_ipfs_add_bytes(data, filename)
            raise

def ipfs_add_json(obj: Dict[str, Any], filename: str = "artifact.json", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Add JSON object to IPFS."""
    data = json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return ipfs_add_bytes(data, filename, metadata)

def pinata_pin_by_hash(hash_to_pin: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Pin an existing IPFS hash to Pinata."""
    url = f"{PINATA_API_URL}/pinning/pinByHash"
    headers = _pinata_headers()
    
    payload = {
        "hashToPin": hash_to_pin,
        "pinataMetadata": {
            "name": f"pinned-{hash_to_pin}",
            "keyvalues": metadata or {}
        }
    }
    
    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    return resp.json()

def pinata_unpin(hash_to_unpin: str) -> bool:
    """Unpin a hash from Pinata."""
    url = f"{PINATA_API_URL}/pinning/unpin/{hash_to_unpin}"
    headers = _pinata_headers()
    
    resp = requests.delete(url, headers=headers, timeout=60)
    return resp.status_code == 200

def pinata_list_pins() -> Dict[str, Any]:
    """List all pinned files in Pinata."""
    url = f"{PINATA_API_URL}/data/pinList"
    headers = _pinata_headers()
    
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()
    return resp.json()
