# -*- coding: utf-8 -*-
"""
hedera_utils.py
Lightweight Hedera HCS submitter.
"""

import os
from dotenv import load_dotenv
load_dotenv(".env")

from hedera import (
    Client,
    TopicId,
    AccountId,
    PrivateKey,
    TopicMessageSubmitTransaction,
)

HEDERA_NETWORK = os.getenv("HEDERA_NETWORK", "testnet").lower()
OPERATOR_ID = os.getenv("HEDERA_OPERATOR_ID")
OPERATOR_KEY = os.getenv("HEDERA_OPERATOR_KEY")

HCS_INPUT_TOPIC_ID   = os.getenv("HCS_INPUT_TOPIC_ID")
HCS_OUTPUT_TOPIC_ID  = os.getenv("HCS_OUTPUT_TOPIC_ID")
HCS_OVERRIDE_TOPIC_ID= os.getenv("HCS_OVERRIDE_TOPIC_ID")

_topic_map = {
    "input": HCS_INPUT_TOPIC_ID,
    "output": HCS_OUTPUT_TOPIC_ID,
    "override": HCS_OVERRIDE_TOPIC_ID,
}

_client = None

def _client_init() -> Client:
    global _client
    if _client:
        return _client
    if HEDERA_NETWORK == "mainnet":
        client = Client.for_mainnet()
    elif HEDERA_NETWORK == "previewnet":
        client = Client.for_previewnet()
    else:
        client = Client.for_testnet()
    client.set_operator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromString(OPERATOR_KEY))
    _client = client
    return _client

def hcs_submit(kind: str, message_str: str) -> dict:
    """
    kind: 'input' | 'output' | 'override'
    message_str: JSON string ≤ 6KB is safe; larger messages will be chunked by SDK.
    Returns mirror-friendly receipt dict: {topicId, consensusTimestamp, sequenceNumber}
    """
    topic = _topic_map.get(kind)
    if not topic:
        raise ValueError(f"Unknown topic kind '{kind}'. Must be one of {_topic_map.keys()}")

    client = _client_init()

    tx = TopicMessageSubmitTransaction().setTopicId(TopicId.fromString(topic)).setMessage(message_str)
    resp = tx.execute(client)
    receipt = resp.getReceipt(client)
    # The python SDK exposes record/message; we’ll return useful bits:
    rec = resp.getRecord(client)
    consensus = str(rec.consensusTimestamp) if rec and rec.consensusTimestamp else None
    seq = rec.topicSequenceNumber if rec and hasattr(rec, "topicSequenceNumber") else None

    return {
        "topicId": topic,
        "consensusTimestamp": consensus,
        "sequenceNumber": seq,
    }
