#!/usr/bin/env python3
"""
Simple API smoke test runner.

- Sends GET requests to a set of API endpoints exposed by the Next.js app.
- Reports pass/fail per endpoint and an overall summary.
- Exits with non-zero code if any endpoint fails, making it CI-friendly.

Usage:
  python3 scripts/api_smoke_test.py --base http://localhost:3000
  python3 scripts/api_smoke_test.py --base https://your-deployed-host

Optional:
  --timeout 10           Request timeout (seconds)
  --concurrency 8        Number of parallel workers
  --endpoints-file file  JSON file with a list of endpoint paths to test (overrides defaults)
"""

from __future__ import annotations
import argparse
import concurrent.futures
import json
import sys
import time
import os
import shlex
import signal
import subprocess
from dataclasses import dataclass
from typing import List, Optional, Tuple
from urllib import request, error
from urllib.parse import urljoin, urlparse


# Default safe GET endpoints (no side-effects)
DEFAULT_ENDPOINTS: List[str] = [
    # SABnzbd
    "/api/sabnzbd",
    "/api/sabnzbd/queue",
    "/api/sabnzbd/history",
    "/api/sabnzbd/categories",
    "/api/sabnzbd/config",
    "/api/sabnzbd/server-stats",

    # Sonarr
    "/api/sonarr/series",
    "/api/sonarr/calendar",
    "/api/sonarr/queue",
    "/api/sonarr/wanted/missing",
    "/api/sonarr/system/status",
    "/api/sonarr/system/task",
    "/api/sonarr/health",
    "/api/sonarr/diskspace",
    "/api/sonarr/languageprofile",
    "/api/sonarr/qualityprofile",
    "/api/sonarr/rootfolder",
    "/api/sonarr/update",
    "/api/sonarr/series/lookup?term=Star",

    # Radarr/Readarr/Prowlarr root proxies (generic)
    # "/api/radarr",
    # "/api/prowlarr",
    # "/api/readarr",
    #" /api/readarr-audiobooks",
]


@dataclass
class TestResult:
    endpoint: str
    status: str  # "PASS" or "FAIL"
    http_status: Optional[int]
    error_message: Optional[str]
    elapsed_ms: int


def fetch_endpoint(base: str, path: str, timeout: int) -> TestResult:
    url = urljoin(base.rstrip("/") + "/", path.lstrip("/"))
    start = time.time()
    req = request.Request(url, method="GET")
    # Explicitly accept JSON but not required
    req.add_header("Accept", "application/json, */*;q=0.1")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            # Consider 200 OK a pass; treat other 2xx as pass too
            status_family = code // 100
            passed = status_family == 2
            elapsed_ms = int((time.time() - start) * 1000)
            return TestResult(
                endpoint=path,
                status="PASS" if passed else "FAIL",
                http_status=code,
                error_message=None if passed else f"Unexpected HTTP {code}",
                elapsed_ms=elapsed_ms,
            )
    except error.HTTPError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return TestResult(
            endpoint=path,
            status="FAIL",
            http_status=e.code,
            error_message=f"HTTPError: {e.reason}",
            elapsed_ms=elapsed_ms,
        )
    except error.URLError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return TestResult(
            endpoint=path,
            status="FAIL",
            http_status=None,
            error_message=f"URLError: {e.reason}",
            elapsed_ms=elapsed_ms,
        )
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return TestResult(
            endpoint=path,
            status="FAIL",
            http_status=None,
            error_message=f"Exception: {e}",
            elapsed_ms=elapsed_ms,
        )


def load_endpoints_from_file(filepath: str) -> List[str]:
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("endpoints-file JSON must be a list of endpoint path strings")
    # Basic validation
    out = []
    for item in data:
        if not isinstance(item, str):
            raise ValueError("endpoints-file list entries must be strings (endpoint paths)")
        if not item.startswith("/"):
            item = "/" + item
        out.append(item)
    return out


def parse_base_port(base: str) -> int:
    try:
        p = urlparse(base)
        if p.port:
            return p.port
        if p.scheme == "https":
            return 443
        if p.scheme == "http":
            if (p.hostname or "").lower() in ("localhost", "127.0.0.1"):
                return 3000
            return 80
    except Exception:
        pass
    return 3000

def is_server_up(base: str, timeout: int = 2) -> bool:
    url = base.rstrip("/") + "/"
    try:
        req = request.Request(url, method="GET")
        with request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            return (code // 100) in (2, 3)
    except Exception:
        return False

def start_dev_server(dev_cmd: str, port: int) -> subprocess.Popen:
    # Allow {port} placeholder in command; if absent, append -p {port}
    cmd_str = dev_cmd.format(port=port) if "{port}" in dev_cmd else (dev_cmd + f" -p {port}")
    args = shlex.split(cmd_str)
    if os.name == "posix":
        # New process group so we can terminate subtree
        return subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, preexec_fn=os.setsid)
    else:
        return subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

def stop_process(proc: subprocess.Popen):
    try:
        if proc.poll() is not None:
            return
        if os.name == "posix":
            os.killpg(proc.pid, signal.SIGTERM)
        else:
            proc.terminate()
    except Exception:
        pass

def wait_for_server(base: str, timeout_seconds: int) -> bool:
    start = time.time()
    while (time.time() - start) < timeout_seconds:
        if is_server_up(base, timeout=2):
            return True
        time.sleep(1.0)
    return False

def run_tests(base: str, endpoints: List[str], timeout: int, concurrency: int) -> List[TestResult]:
    results: List[TestResult] = []
    # Deduplicate while preserving order
    seen = set()
    unique_endpoints = []
    for ep in endpoints:
        if ep not in seen:
            seen.add(ep)
            unique_endpoints.append(ep)

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(fetch_endpoint, base, ep, timeout) for ep in unique_endpoints]
        for fut in concurrent.futures.as_completed(futures):
            try:
                res = fut.result()
                results.append(res)
            except Exception as e:
                # This should not normally happen; capture a synthetic failure
                results.append(TestResult(
                    endpoint="UNKNOWN",
                    status="FAIL",
                    http_status=None,
                    error_message=f"Runner exception: {e}",
                    elapsed_ms=0,
                ))
    # Keep the original endpoint order in the output
    order = {ep: i for i, ep in enumerate(unique_endpoints)}
    results.sort(key=lambda r: order.get(r.endpoint, 10**9))
    return results


def print_report(results: List[TestResult]) -> Tuple[int, int]:
    passed = sum(1 for r in results if r.status == "PASS")
    failed = len(results) - passed

    print("\nAPI Smoke Test Report")
    print("---------------------")
    for r in results:
        status_icon = "✅" if r.status == "PASS" else "❌"
        http_info = f"HTTP {r.http_status}" if r.http_status is not None else "-"
        extra = f" ({r.error_message})" if r.error_message else ""
        print(f"{status_icon} {r.endpoint:40s} {r.status:4s}  {http_info:8s}  {r.elapsed_ms}ms{extra}")

    print("\nSummary")
    print("-------")
    print(f"Total: {len(results)}  Passed: {passed}  Failed: {failed}")
    return passed, failed


def main():
    parser = argparse.ArgumentParser(description="API Smoke Test Runner")
    parser.add_argument("--base", required=True, help="Base URL of the running app (e.g., http://localhost:3000)")
    parser.add_argument("--timeout", type=int, default=10, help="Request timeout in seconds (default: 10)")
    parser.add_argument("--concurrency", type=int, default=8, help="Number of parallel workers (default: 8)")
    parser.add_argument("--endpoints-file", help="JSON file with a list of endpoint paths to test")

    # Auto-start controls
    parser.add_argument(
        "--dev-cmd",
        default="pnpm dev -p {port}",
        help="Command to start the Next.js dev server (use {port} placeholder; default: 'pnpm dev -p {port}')"
    )
    parser.add_argument(
        "--start-timeout",
        type=int,
        default=90,
        help="Seconds to wait for the server to be ready when auto-starting (default: 90)"
    )
    parser.add_argument(
        "--no-auto-start",
        dest="auto_start",
        action="store_false",
        help="Disable auto-starting the dev server if the target base URL is not responding",
    )
    parser.set_defaults(auto_start=True)

    args = parser.parse_args()

    if args.endpoints_file:
        try:
            endpoints = load_endpoints_from_file(args.endpoints_file)
        except Exception as e:
            print(f"Failed to load endpoints from file: {e}", file=sys.stderr)
            sys.exit(2)
    else:
        endpoints = DEFAULT_ENDPOINTS

    server_started = False
    proc: Optional[subprocess.Popen] = None

    if not is_server_up(args.base, timeout=2):
        if args.auto_start:
            port = parse_base_port(args.base)
            print(f"Server not detected at {args.base}. Attempting to start dev server using: '{args.dev_cmd}' on port {port} ...")
            try:
                proc = start_dev_server(args.dev_cmd, port)
                server_started = True
            except Exception as e:
                print(f"Failed to start dev server: {e}", file=sys.stderr)
                sys.exit(3)
            print(f"Waiting up to {args.start_timeout}s for server to be ready ...")
            if not wait_for_server(args.base, args.start_timeout):
                print("Server did not become ready within the timeout.", file=sys.stderr)
                if proc:
                    stop_process(proc)
                sys.exit(3)
        else:
            print("Warning: Server not detected and auto-start disabled. Tests are likely to fail.", file=sys.stderr)

    try:
        print(f"Running {len(endpoints)} endpoint checks against {args.base} ...")
        results = run_tests(args.base, endpoints, timeout=args.timeout, concurrency=args.concurrency)
        passed, failed = print_report(results)
        exit_code = 0 if failed == 0 else 1
    finally:
        if server_started and proc:
            print("Stopping dev server started by the smoke test ...")
            stop_process(proc)

    sys.exit(exit_code)


if __name__ == "__main__":
    main()