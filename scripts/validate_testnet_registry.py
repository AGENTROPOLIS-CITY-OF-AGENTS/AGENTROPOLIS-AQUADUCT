#!/usr/bin/env python3
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

REGISTRY = Path("config/testnet-registry.json")
REQUIRED = {"id","name","network","asset","family","category","environment","adapter","adapterStatus","docs","funding","color"}
VALID_CATEGORIES = {"evm","non-evm","privacy"}
VALID_ADAPTER_STATUS = {"existing","planned"}

def fail(message):
    print(f"ERROR: {message}", file=sys.stderr)
    return 1

def main():
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    if data.get("policy", {}).get("mainnetAllowed") is not False:
        return fail("mainnetAllowed must remain false")
    networks = data.get("networks")
    if not isinstance(networks, list) or not networks:
        return fail("networks must be a non-empty list")
    seen = set()
    errors = []
    for index, network in enumerate(networks):
        missing = REQUIRED - set(network)
        if missing:
            errors.append(f"[{index}] missing fields: {sorted(missing)}")
            continue
        network_id = network["id"]
        if network_id in seen:
            errors.append(f"duplicate id: {network_id}")
        seen.add(network_id)
        if network["category"] not in VALID_CATEGORIES:
            errors.append(f"{network_id}: invalid category")
        if network["adapterStatus"] not in VALID_ADAPTER_STATUS:
            errors.append(f"{network_id}: invalid adapterStatus")
        if network["environment"].lower() == "mainnet":
            errors.append(f"{network_id}: mainnet environment forbidden")
        if not isinstance(network["funding"], list) or not network["funding"]:
            errors.append(f"{network_id}: at least one funding source required")
        for source in network.get("funding", []):
            url = source.get("url", "")
            parsed = urlparse(url)
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{network_id}: funding URL must be HTTPS: {url}")
            if source.get("automation") not in {"programmatic","mixed","human-required","manual"}:
                errors.append(f"{network_id}: invalid automation mode")
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"OK: {len(networks)} governed test/dev/stage/preview lanes; mainnet denied")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
