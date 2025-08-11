#!/usr/bin/env python3
"""
Enhanced API smoke test runner for the dashboard application.

- Sends requests to all API endpoints exposed by the Next.js app
- Supports multiple HTTP methods (GET, POST, PUT, DELETE)
- Implements safety measures for destructive operations
- Reports pass/fail per endpoint and an overall summary
- Exits with non-zero code if any endpoint fails, making it CI-friendly
- Provides detailed reporting with error categorization

Usage:
  python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000
  python3 scripts/enhanced_api_smoke_test.py --base https://your-deployed-host

Optional:
  --timeout 10           Request timeout (seconds)
  --concurrency 8        Number of parallel workers
  --safe-mode            Enable safe mode (default: True)
  --config-file file     JSON file with endpoint configurations
  --output-dir dir       Output directory for reports
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
import urllib.request
import urllib.error
import urllib.parse
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
import pathlib


@dataclass
class TestResult:
    """Enhanced test result with detailed information"""
    service: str
    endpoint: str
    method: str
    test_name: str
    status: str  # "PASS", "FAIL", "SKIPPED"
    http_status: Optional[int]
    error_message: Optional[str]
    elapsed_ms: int
    request_body: Optional[str]
    response_body: Optional[str]
    validation_results: Dict[str, Any]
    safety_notes: Optional[str]


@dataclass
class EndpointConfig:
    """Configuration for an endpoint test"""
    name: str
    path: str
    method: str
    description: str
    destructive: bool = False
    safe_mode: str = "mock"  # "mock", "skip", "allow"
    path_params: Optional[Dict[str, str]] = None
    query_params: Optional[Dict[str, str]] = None
    headers: Optional[Dict[str, str]] = None
    body: Optional[Dict[str, Any]] = None
    expected_status: int = 200
    tests: Optional[List[Dict[str, Any]]] = None


class HTTPClient:
    """HTTP client wrapper for making requests"""
    
    def __init__(self, base_url: str, timeout: int = 10, headers: Optional[Dict[str, str]] = None):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.headers = headers or {}
        self.headers.setdefault("Accept", "application/json, */*;q=0.1")
    
    def request(self, method: str, endpoint: str, params: Optional[Dict[str, str]] = None, 
                data: Optional[bytes] = None, json_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make HTTP request with support for different methods and data types"""
        url = f"{self.base_url}{endpoint}"
        
        # Add query parameters
        if params:
            query_string = urllib.parse.urlencode(params)
            url = f"{url}?{query_string}"
        
        # Prepare request
        req = urllib.request.Request(url, method=method.upper())
        
        # Add headers
        for key, value in self.headers.items():
            req.add_header(key, value)
        
        # Add content type for POST/PUT requests
        if method.upper() in ['POST', 'PUT'] and json_data:
            req.add_header('Content-Type', 'application/json')
            data = json.dumps(json_data).encode('utf-8')
        
        # Make request and return response
        start_time = time.time()
        try:
            with urllib.request.urlopen(req, data=data, timeout=self.timeout) as response:
                response_body = response.read().decode('utf-8')
                elapsed_ms = int((time.time() - start_time) * 1000)
                
                return {
                    'status_code': response.getcode(),
                    'headers': dict(response.headers),
                    'body': response_body,
                    'elapsed_ms': elapsed_ms,
                    'error': None
                }
        except urllib.error.HTTPError as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            try:
                response_body = e.read().decode('utf-8')
            except:
                response_body = ""
            
            return {
                'status_code': e.code,
                'headers': {},
                'body': response_body,
                'elapsed_ms': elapsed_ms,
                'error': f"HTTPError: {e.reason}"
            }
        except urllib.error.URLError as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            return {
                'status_code': None,
                'headers': {},
                'body': "",
                'elapsed_ms': elapsed_ms,
                'error': f"URLError: {e.reason}"
            }
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            return {
                'status_code': None,
                'headers': {},
                'body': "",
                'elapsed_ms': elapsed_ms,
                'error': f"Exception: {str(e)}"
            }


class ResponseValidator:
    """Validator for API responses"""
    
    def __init__(self):
        self.validators = {
            'status_code': self._validate_status_code,
            'json_format': self._validate_json_format,
            'response_time': self._validate_response_time,
            'required_fields': self._validate_required_fields
        }
    
    def validate(self, response: Dict[str, Any], expectations: Dict[str, Any]) -> Dict[str, Any]:
        """Validate response against expectations"""
        results = {}
        for key, value in expectations.items():
            if key in self.validators:
                results[key] = self.validators[key](response, value)
        return results
    
    def _validate_status_code(self, response: Dict[str, Any], expected_code: int) -> bool:
        """Validate HTTP status code"""
        return response.get('status_code') == expected_code
    
    def _validate_json_format(self, response: Dict[str, Any], expected_format: bool = True) -> bool:
        """Validate JSON response format"""
        if not expected_format:
            return True
        
        try:
            json.loads(response.get('body', '{}'))
            return True
        except json.JSONDecodeError:
            return False
    
    def _validate_response_time(self, response: Dict[str, Any], max_time_ms: int) -> bool:
        """Validate response time"""
        return response.get('elapsed_ms', 0) <= max_time_ms
    
    def _validate_required_fields(self, response: Dict[str, Any], fields: List[str]) -> bool:
        """Validate required fields in response"""
        try:
            body = json.loads(response.get('body', '{}'))
            return all(field in body for field in fields)
        except json.JSONDecodeError:
            return False


class ReportGenerator:
    """Generate test reports in various formats"""
    
    def __init__(self, output_dir: str = "test_reports"):
        self.output_dir = pathlib.Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.output_dir / "json").mkdir(exist_ok=True)
        (self.output_dir / "html").mkdir(exist_ok=True)
        (self.output_dir / "logs").mkdir(exist_ok=True)
    
    def generate_console_report(self, results: List[TestResult]) -> Tuple[int, int]:
        """Generate console report summary"""
        passed = sum(1 for r in results if r.status == "PASS")
        failed = sum(1 for r in results if r.status == "FAIL")
        skipped = sum(1 for r in results if r.status == "SKIPPED")
        
        print("\n" + "="*80)
        print("Enhanced API Smoke Test Summary")
        print("="*80)
        print(f"Summary: Total: {len(results)}  Passed: {passed}  Failed: {failed}  Skipped: {skipped}")
        print("="*80)
        
        return passed, failed
    
    def generate_json_report(self, results: List[TestResult]) -> str:
        """Generate JSON report"""
        timestamp = datetime.now().isoformat()
        
        report = {
            "timestamp": timestamp,
            "summary": {
                "total": len(results),
                "passed": sum(1 for r in results if r.status == "PASS"),
                "failed": sum(1 for r in results if r.status == "FAIL"),
                "skipped": sum(1 for r in results if r.status == "SKIPPED")
            },
            "results": [asdict(result) for result in results]
        }
        
        json_file = self.output_dir / "json" / f"test_report_{timestamp.replace(':', '-')}.json"
        with open(json_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return str(json_file)
    
    def generate_html_report(self, results: List[TestResult]) -> str:
        """Generate HTML report"""
        timestamp = datetime.now().isoformat()
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>API Test Report - {timestamp}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background-color: #f0f0f0; padding: 20px; border-radius: 5px; }}
        .summary {{ margin: 20px 0; }}
        .results {{ margin-top: 20px; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        .pass {{ color: green; }}
        .fail {{ color: red; }}
        .skip {{ color: orange; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>API Test Report</h1>
        <p>Generated: {timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total: {len(results)}</p>
        <p class="pass">Passed: {sum(1 for r in results if r.status == "PASS")}</p>
        <p class="fail">Failed: {sum(1 for r in results if r.status == "FAIL")}</p>
        <p class="skip">Skipped: {sum(1 for r in results if r.status == "SKIPPED")}</p>
    </div>
    
    <div class="results">
        <h2>Results</h2>
        <table>
            <tr>
                <th>Service</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>HTTP Status</th>
                <th>Response Time</th>
                <th>Error Message</th>
            </tr>
"""
        
        for result in results:
            status_class = result.status.lower()
            error_msg = result.error_message or ""
            html_content += f"""
            <tr>
                <td>{result.service}</td>
                <td>{result.method}</td>
                <td>{result.endpoint}</td>
                <td class="{status_class}">{result.status}</td>
                <td>{result.http_status or '-'}</td>
                <td>{result.elapsed_ms}ms</td>
                <td>{error_msg}</td>
            </tr>
"""
        
        html_content += """
        </table>
    </div>
</body>
</html>
"""
        
        html_file = self.output_dir / "html" / f"test_report_{timestamp.replace(':', '-')}.html"
        with open(html_file, 'w') as f:
            f.write(html_content)
        
        return str(html_file)


class EnhancedOpenAPIFetcher:
    """Enhanced OpenAPI fetcher with service-specific configurations"""
    
    def __init__(self, http_client: HTTPClient, service_name: str):
        self.http_client = http_client
        self.service_name = service_name
        self.config = self._get_service_config(service_name)
        self.openapi_cache = {}
    
    def _get_service_config(self, service_name: str) -> Dict[str, Any]:
        """Get configuration for a specific service"""
        configs = {
            'sonarr': {
                'openapi_path': '/api/sonarr/openapi.json',
                'api_base': '/api/sonarr',
                'media_endpoint': '/api/sonarr/series',
                'media_id_field': 'id',
                'media_name_field': 'title'
            },
            'radarr': {
                'openapi_path': '/api/radarr/openapi.json',
                'api_base': '/api/radarr',
                'media_endpoint': '/api/radarr/movies',
                'media_id_field': 'id',
                'media_name_field': 'title'
            },
            'prowlarr': {
                'openapi_path': '/api/prowlarr/openapi.json',
                'api_base': '/api/prowlarr',
                'media_endpoint': '/api/prowlarr/indexers',
                'media_id_field': 'id',
                'media_name_field': 'name'
            },
            'readarr': {
                'openapi_path': '/api/readarr/openapi.json',
                'api_base': '/api/readarr',
                'media_endpoint': '/api/readarr/author',
                'media_id_field': 'id',
                'media_name_field': 'authorName'
            },
            'readarr_audiobooks': {
                'openapi_path': '/api/readarr-audiobooks/openapi.json',
                'api_base': '/api/readarr-audiobooks',
                'media_endpoint': '/api/readarr-audiobooks/author',
                'media_id_field': 'id',
                'media_name_field': 'authorName'
            }
        }
        
        return configs.get(service_name, {
            'openapi_path': f'/api/{service_name}/openapi.json',
            'api_base': f'/api/{service_name}',
            'media_endpoint': f'/api/{service_name}',
            'media_id_field': 'id',
            'media_name_field': 'name'
        })
    
    def get_openapi_spec(self) -> Optional[Dict[str, Any]]:
        """Get OpenAPI specification for the service"""
        if self.service_name in self.openapi_cache:
            return self.openapi_cache[self.service_name]
        
        # Try to fetch OpenAPI spec from the service
        try:
            openapi_spec = self._fetch_openapi_spec()
            if openapi_spec:
                self.openapi_cache[self.service_name] = openapi_spec
                return openapi_spec
        except Exception as e:
            print(f"  Warning: Could not fetch OpenAPI spec for {self.service_name}: {e}")
        
        return None
    
    def _fetch_openapi_spec(self) -> Optional[Dict[str, Any]]:
        """Fetch OpenAPI specification from the service's API"""
        endpoint = self.config['openapi_path']
        
        try:
            print(f"  Fetching OpenAPI spec for {self.service_name} from {endpoint}")
            response = self.http_client.request('GET', endpoint)
            
            if response['error']:
                print(f"    Error fetching OpenAPI spec: {response['error']}")
                return None
            
            if response['status_code'] == 200:
                try:
                    data = json.loads(response.get('body', '{}'))
                    if data and ('openapi' in data or 'swagger' in data):
                        print(f"    Found OpenAPI spec for {self.service_name}")
                        return data
                except json.JSONDecodeError as e:
                    print(f"    Error parsing OpenAPI JSON: {e}")
            else:
                print(f"    Non-200 status code for OpenAPI spec: {response['status_code']}")
        except Exception as e:
            print(f"    Exception fetching OpenAPI spec: {e}")
        
        return None
    
    def generate_endpoint_configs(self) -> List[EndpointConfig]:
        """Generate endpoint configurations from OpenAPI specification"""
        configs = []
        
        openapi_spec = self.get_openapi_spec()
        if not openapi_spec:
            return configs
        
        # Get base path from OpenAPI spec
        base_path = openapi_spec.get('basePath', '')
        if not base_path and 'servers' in openapi_spec:
            servers = openapi_spec.get('servers', [])
            if servers and 'url' in servers[0]:
                server_url = servers[0]['url']
                # Extract path from server URL
                parsed = urllib.parse.urlparse(server_url)
                base_path = parsed.path
        
        # Get paths from OpenAPI spec
        paths = openapi_spec.get('paths', {})
        
        for path, path_data in paths.items():
            # Skip if the path already starts with the API prefix
            if path.startswith('/api/'):
                full_path = path
            else:
                # Combine base path with path
                full_path = base_path + path
            
            # For readarr_audiobooks, ensure we don't duplicate the API prefix
            if self.service_name == 'readarr_audiobooks':
                # If the path already includes the service prefix, don't add it again
                if full_path.startswith('/api/readarr-audiobooks/'):
                    pass  # Keep as is
                # If the path starts with the base path but not the full API prefix, add it
                elif full_path.startswith('/api/') and not full_path.startswith('/api/readarr-audiobooks/'):
                    full_path = f'/api/readarr-audiobooks{full_path[4:]}'  # Replace /api/ with /api/readarr-audiobooks/
                # If the path doesn't start with /api/, add the full prefix
                elif not full_path.startswith('/api/'):
                    full_path = f'/api/readarr-audiobooks{full_path}'
            
            # Process each HTTP method for this path
            for method, method_data in path_data.items():
                if method.lower() not in ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']:
                    continue
                
                # Get operation details
                operation_id = method_data.get('operationId', f"{method.upper()} {full_path}")
                summary = method_data.get('summary', '')
                description = method_data.get('description', summary or f"{method.upper()} {full_path}")
                
                # Check if operation is marked as deprecated
                deprecated = method_data.get('deprecated', False)
                if deprecated:
                    continue
                
                # Determine if this is a destructive operation
                destructive = self._is_destructive_operation(method, path, method_data)
                
                # Extract path parameters
                path_params = {}
                parameters = method_data.get('parameters', [])
                for param in parameters:
                    if param.get('in') == 'path':
                        param_name = param.get('name')
                        # Use a placeholder for path parameters
                        path_params[param_name] = f"test_{param_name}_123"
                
                # Create endpoint config
                config = EndpointConfig(
                    name=operation_id,
                    path=full_path,
                    method=method.upper(),
                    description=description,
                    destructive=destructive,
                    safe_mode="mock" if destructive else "allow",
                    path_params=path_params if path_params else None,
                    expected_status=200
                )
                
                configs.append(config)
        
        return configs
    
    def _is_destructive_operation(self, method: str, path: str, method_data: Dict[str, Any]) -> bool:
        """Determine if an operation is destructive based on method, path, and OpenAPI data"""
        # DELETE operations are always destructive
        if method.lower() == 'delete':
            return True
        
        # Check for destructive patterns in path
        destructive_patterns = [
            '/delete',
            '/remove',
            '/pause',
            '/resume',
            '/cancel',
            '/stop',
            '/kill',
            '/reset',
            '/clear'
        ]
        
        if any(pattern in path.lower() for pattern in destructive_patterns):
            return True
        
        # Check operation ID for destructive keywords
        operation_id = method_data.get('operationId', '').lower()
        destructive_keywords = [
            'delete', 'remove', 'pause', 'resume', 'cancel', 'stop',
            'kill', 'reset', 'clear', 'disable', 'shutdown'
        ]
        
        if any(keyword in operation_id for keyword in destructive_keywords):
            return True
        
        # Check tags for destructive operations
        tags = method_data.get('tags', [])
        if any(tag.lower() in ['destructive', 'admin', 'system'] for tag in tags):
            return True
        
        return False


class OpenAPIFetcher:
    """Legacy wrapper for backward compatibility"""
    
    def __init__(self, http_client: HTTPClient):
        self.http_client = http_client
        self.fetchers = {}
    
    def get_openapi_spec(self, service: str) -> Optional[Dict[str, Any]]:
        """Get OpenAPI specification for a service"""
        if service not in self.fetchers:
            self.fetchers[service] = EnhancedOpenAPIFetcher(self.http_client, service)
        
        return self.fetchers[service].get_openapi_spec()
    
    def generate_endpoint_configs(self, service: str, openapi_spec: Dict[str, Any]) -> List[EndpointConfig]:
        """Generate endpoint configurations from OpenAPI specification"""
        if service not in self.fetchers:
            self.fetchers[service] = EnhancedOpenAPIFetcher(self.http_client, service)
        
        return self.fetchers[service].generate_endpoint_configs()


class MediaRandomSelector:
    """Selects random media items from services"""
    
    def __init__(self, http_client: HTTPClient, service_name: str):
        self.http_client = http_client
        self.service_name = service_name
        self.config = self._get_service_config(service_name)
    
    def _get_service_config(self, service_name: str) -> Dict[str, Any]:
        """Get configuration for a specific service"""
        configs = {
            'sonarr': {
                'media_endpoint': '/api/sonarr/series',
                'media_id_field': 'id',
                'media_name_field': 'title',
                'media_type': 'series'
            },
            'radarr': {
                'media_endpoint': '/api/radarr/movies',
                'media_id_field': 'id',
                'media_name_field': 'title',
                'media_type': 'movie'
            },
            'readarr': {
                'media_endpoint': '/api/readarr/author',
                'media_id_field': 'id',
                'media_name_field': 'authorName',
                'media_type': 'author'
            },
            'readarr_audiobooks': {
                'media_endpoint': '/api/readarr-audiobooks/author',
                'media_id_field': 'id',
                'media_name_field': 'authorName',
                'media_type': 'author'
            }
        }
        
        return configs.get(service_name, {
            'media_endpoint': f'/api/{service_name}',
            'media_id_field': 'id',
            'media_name_field': 'name',
            'media_type': 'item'
        })
    
    def fetch_media_items(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch media items from the service"""
        endpoint = self.config['media_endpoint']
        
        try:
            print(f"  Fetching media items for {self.service_name} from {endpoint}")
            response = self.http_client.request('GET', endpoint)
            
            if response['error']:
                print(f"    Error fetching media items: {response['error']}")
                return []
            
            if response['status_code'] != 200:
                print(f"    Non-200 status code: {response['status_code']}")
                return []
            
            data = json.loads(response.get('body', '[]'))
            
            if not isinstance(data, list):
                print(f"    Expected list response, got {type(data)}")
                return []
            
            # Limit the number of items
            items = data[:limit]
            
            print(f"    Fetched {len(items)} {self.config['media_type']} items")
            return items
            
        except json.JSONDecodeError as e:
            print(f"    Error parsing JSON response: {e}")
        except Exception as e:
            print(f"    Exception fetching media items: {e}")
        
        return []
    
    def select_random_item(self, limit: int = 20) -> Optional[Dict[str, Any]]:
        """Select a random media item from the service"""
        import random
        
        items = self.fetch_media_items(limit)
        if not items:
            return None
        
        return random.choice(items)
    
    def get_random_item_info(self, limit: int = 20) -> Optional[Dict[str, Any]]:
        """Get information about a random media item"""
        item = self.select_random_item(limit)
        if not item:
            return None
        
        id_field = self.config['media_id_field']
        name_field = self.config['media_name_field']
        
        return {
            'service': self.service_name,
            'media_type': self.config['media_type'],
            'id': item.get(id_field),
            'name': item.get(name_field),
            'item': item
        }


class MediaRandomSelectorManager:
    """Manages random media selection across multiple services"""
    
    def __init__(self, http_client: HTTPClient):
        self.http_client = http_client
        self.selectors = {
            'sonarr': MediaRandomSelector(http_client, 'sonarr'),
            'radarr': MediaRandomSelector(http_client, 'radarr'),
            'readarr': MediaRandomSelector(http_client, 'readarr'),
            'readarr_audiobooks': MediaRandomSelector(http_client, 'readarr_audiobooks')
        }
    
    def get_random_items_from_all_services(self, limit: int = 20) -> Dict[str, Optional[Dict[str, Any]]]:
        """Get random items from all services"""
        results = {}
        
        for service_name, selector in self.selectors.items():
            print(f"Getting random {service_name} item...")
            item_info = selector.get_random_item_info(limit)
            results[service_name] = item_info
        
        return results
    
    def get_random_items_summary(self, limit: int = 20) -> str:
        """Get a summary of random items from all services"""
        results = self.get_random_items_from_all_services(limit)
        
        summary = "Random Media Items Summary:\n"
        summary += "=" * 40 + "\n"
        
        for service_name, item_info in results.items():
            if item_info:
                summary += f"{service_name.capitalize()}:\n"
                summary += f"  Type: {item_info['media_type']}\n"
                summary += f"  ID: {item_info['id']}\n"
                summary += f"  Name: {item_info['name']}\n"
            else:
                summary += f"{service_name.capitalize()}: No items found\n"
            summary += "\n"
        
        return summary


class MediaIDFetcher:
    """Fetches real media IDs from API endpoints for testing"""
    
    def __init__(self, http_client: HTTPClient):
        self.http_client = http_client
        self.id_cache = {}
    
    def get_id_for_service(self, service: str) -> Optional[str]:
        """Get a real ID for the specified service"""
        if service in self.id_cache:
            print(f"  Using cached ID for {service}: {self.id_cache[service]}")
            return self.id_cache[service]
        
        # Try to fetch a real ID from the service
        try:
            real_id = self._fetch_real_id(service)
            if real_id:
                self.id_cache[service] = real_id
                return real_id
        except Exception as e:
            print(f"  Warning: Could not fetch real ID for {service}: {e}")
        
        # Fall back to test ID if fetching fails
        fallback_ids = {
            'sabnzbd': 'test_nzo_123',
            'sonarr': 'test_series_123',
            'radarr': 'test_movie_123',
            'prowlarr': 'test_app_123',
            'readarr': 'test_author_123',
            'readarr_audiobooks': 'test_author_123'
        }
        
        fallback_id = fallback_ids.get(service, 'test_id_123')
        print(f"  Using fallback ID for {service}: {fallback_id}")
        return fallback_id
    
    def _fetch_real_id(self, service: str) -> Optional[str]:
        """Fetch a real ID from the service's API"""
        endpoints = {
            'sabnzbd': '/api/sabnzbd/queue',
            'sonarr': '/api/sonarr/series',
            'radarr': '/api/radarr/movies',
            'prowlarr': '/api/prowlarr/applications',
            'readarr': '/api/readarr/author',
            'readarr_audiobooks': '/api/readarr-audiobooks/book'
        }
        
        if service not in endpoints:
            print(f"  Warning: No endpoint mapping for service '{service}'")
            return None
        
        endpoint = endpoints[service]
        print(f"  Fetching real ID for {service} from {endpoint}")
        
        try:
            response = self.http_client.request('GET', endpoint)
            
            if response['error']:
                print(f"  Error fetching ID for {service}: {response['error']}")
                return None
            
            if response['status_code'] != 200:
                print(f"  Non-200 status code for {service}: {response['status_code']}")
                return None
            
            data = json.loads(response.get('body', '[]'))
            
            # Extract ID based on service type
            if service == 'sabnzbd' and isinstance(data, dict) and 'queue' in data:
                # SABnzbd returns a dict with queue items
                queue_items = data.get('queue', [])
                if queue_items and len(queue_items) > 0:
                    nzo_id = queue_items[0].get('nzo_id')
                    if nzo_id:
                        print(f"  Found real ID for {service}: {nzo_id}")
                        return str(nzo_id)
                    else:
                        print(f"  Warning: No 'nzo_id' field in queue item for {service}")
                else:
                    print(f"  Warning: No queue items found for {service}")
            elif isinstance(data, list) and len(data) > 0:
                # Most services return a list of items
                first_item = data[0]
                
                # Try different ID field names
                id_fields = ['id', 'Id', 'ID', 'seriesId', 'movieId', 'authorId', 'bookId',
                            'applicationId', 'indexerId', 'downloadClientId', 'nzo_id']
                
                for field in id_fields:
                    if field in first_item:
                        real_id = str(first_item[field])
                        print(f"  Found real ID for {service}: {real_id} (field: {field})")
                        return real_id
                
                # If no standard ID field found, try to find any field with 'id' in it
                for field, value in first_item.items():
                    if 'id' in field.lower() and isinstance(value, (int, str)):
                        real_id = str(value)
                        print(f"  Found real ID for {service}: {real_id} (field: {field})")
                        return real_id
                
                print(f"  Warning: No ID field found in response for {service}")
            else:
                print(f"  Warning: Empty or invalid response for {service}")
            
        except json.JSONDecodeError as e:
            print(f"  Error parsing JSON response for {service}: {e}")
        except Exception as e:
            print(f"  Unexpected error fetching ID for {service}: {e}")
        
        return None


class EnhancedAPITester:
    """Enhanced API tester with safety features"""
    
    def __init__(self, base_url: str, config_file: Optional[str] = None,
                 safe_mode: bool = True, timeout: int = 10, concurrency: int = 8,
                 use_openapi: bool = False, enable_random_selection: bool = False):
        self.base_url = base_url
        self.config_file = config_file
        self.safe_mode = safe_mode
        self.timeout = timeout
        self.concurrency = concurrency
        self.use_openapi = use_openapi
        self.enable_random_selection = enable_random_selection
        self.http_client = HTTPClient(base_url, timeout)
        self.validator = ResponseValidator()
        self.report_generator = ReportGenerator()
        self.id_fetcher = MediaIDFetcher(self.http_client)
        self.openapi_fetcher = OpenAPIFetcher(self.http_client)
        self.random_selector_manager = MediaRandomSelectorManager(self.http_client) if enable_random_selection else None
        self.endpoint_configs = self.load_endpoint_configs()
        self.test_results = []
    
    def load_endpoint_configs(self) -> List[EndpointConfig]:
        """Load endpoint configurations from file, OpenAPI specs, or use defaults"""
        if self.config_file and os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                config_data = json.load(f)
            
            configs = []
            for service, service_data in config_data.items():
                for endpoint_data in service_data.get('endpoints', []):
                    configs.append(EndpointConfig(
                        name=endpoint_data['name'],
                        path=endpoint_data['path'],
                        method=endpoint_data['method'],
                        description=endpoint_data['description'],
                        destructive=endpoint_data.get('destructive', False),
                        safe_mode=endpoint_data.get('safe_mode', 'mock'),
                        path_params=endpoint_data.get('path_params'),
                        query_params=endpoint_data.get('query_params'),
                        headers=endpoint_data.get('headers'),
                        body=endpoint_data.get('body'),
                        expected_status=endpoint_data.get('expected_status', 200),
                        tests=endpoint_data.get('tests')
                    ))
            return configs
        elif self.use_openapi:
            return self.get_mixed_endpoint_configs()
        else:
            return self.get_default_endpoint_configs()
    
    def get_default_endpoint_configs(self) -> List[EndpointConfig]:
        """Get default endpoint configurations"""
        return [
            # SABnzbd endpoints
            EndpointConfig(
                name="Get SABnzbd Base",
                path="/api/sabnzbd",
                method="GET",
                description="Get SABnzbd base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue",
                path="/api/sabnzbd/queue",
                method="GET",
                description="Get download queue information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd History",
                path="/api/sabnzbd/history",
                method="GET",
                description="Get download history",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Categories",
                path="/api/sabnzbd/categories",
                method="GET",
                description="Get available categories",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Config",
                path="/api/sabnzbd/config",
                method="GET",
                description="Get SABnzbd configuration",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Server Stats",
                path="/api/sabnzbd/server-stats",
                method="GET",
                description="Get server statistics",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Add File",
                path="/api/sabnzbd/addfile",
                method="GET",
                description="Get add file information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Add URL",
                path="/api/sabnzbd/addurl",
                method="GET",
                description="Get add URL information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}",
                method="GET",
                description="Get specific queue item",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item Category",
                path="/api/sabnzbd/queue/{nzoId}/category",
                method="GET",
                description="Get queue item category",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item Priority",
                path="/api/sabnzbd/queue/{nzoId}/priority",
                method="GET",
                description="Get queue item priority",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Pause SABnzbd Queue",
                path="/api/sabnzbd/queue/pause",
                method="POST",
                description="Pause entire download queue",
                destructive=True,
                safe_mode="mock",
                expected_status=200
            ),
            EndpointConfig(
                name="Resume SABnzbd Queue",
                path="/api/sabnzbd/queue/resume",
                method="POST",
                description="Resume entire download queue",
                destructive=True,
                safe_mode="mock",
                expected_status=200
            ),
            EndpointConfig(
                name="Pause SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}/pause",
                method="POST",
                description="Pause specific queue item",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Resume SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}/resume",
                method="POST",
                description="Resume specific queue item",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Delete SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}",
                method="DELETE",
                description="Delete specific item from queue",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            
            # Sonarr endpoints
            EndpointConfig(
                name="Get Sonarr Base",
                path="/api/sonarr",
                method="GET",
                description="Get Sonarr base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Series",
                path="/api/sonarr/series",
                method="GET",
                description="Get all series",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Series by ID",
                path="/api/sonarr/series/{id}",
                method="GET",
                description="Get series by ID",
                path_params={"id": "test_series_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Series Lookup",
                path="/api/sonarr/series/lookup",
                method="GET",
                description="Lookup series information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Calendar",
                path="/api/sonarr/calendar",
                method="GET",
                description="Get calendar information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Queue",
                path="/api/sonarr/queue",
                method="GET",
                description="Get download queue",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Queue Item",
                path="/api/sonarr/queue/{id}",
                method="GET",
                description="Get specific queue item",
                path_params={"id": "test_queue_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Episode",
                path="/api/sonarr/episode/{id}",
                method="GET",
                description="Get episode by ID",
                path_params={"id": "test_episode_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Wanted Missing",
                path="/api/sonarr/wanted/missing",
                method="GET",
                description="Get wanted/missing episodes",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr System Status",
                path="/api/sonarr/system/status",
                method="GET",
                description="Get system status",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr System Task",
                path="/api/sonarr/system/task",
                method="GET",
                description="Get system tasks",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Update",
                path="/api/sonarr/update",
                method="GET",
                description="Get update information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Health",
                path="/api/sonarr/health",
                method="GET",
                description="Get system health",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Disk Space",
                path="/api/sonarr/diskspace",
                method="GET",
                description="Get disk space information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Language Profile",
                path="/api/sonarr/languageprofile",
                method="GET",
                description="Get language profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Quality Profile",
                path="/api/sonarr/qualityprofile",
                method="GET",
                description="Get quality profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Sonarr Root Folder",
                path="/api/sonarr/rootfolder",
                method="GET",
                description="Get root folders",
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Delete Sonarr Queue Item",
                path="/api/sonarr/queue/{id}",
                method="DELETE",
                description="Delete item from queue",
                destructive=True,
                safe_mode="mock",
                path_params={"id": "test_queue_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Execute Sonarr Command",
                path="/api/sonarr/command",
                method="POST",
                description="Execute system command",
                destructive=True,
                safe_mode="mock",
                body={"name": "MissingEpisodeSearch"},
                expected_status=200
            ),
            
            # Radarr endpoints
            EndpointConfig(
                name="Get Radarr Base",
                path="/api/radarr",
                method="GET",
                description="Get Radarr base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Movies",
                path="/api/radarr/movies",
                method="GET",
                description="Get all movies",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Movie",
                path="/api/radarr/movie",
                method="GET",
                description="Get movie information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Movie by ID",
                path="/api/radarr/movie/{id}",
                method="GET",
                description="Get movie by ID",
                path_params={"id": "test_movie_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Movie Lookup",
                path="/api/radarr/movie/lookup",
                method="GET",
                description="Lookup movie information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Queue",
                path="/api/radarr/queue",
                method="GET",
                description="Get download queue",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr History",
                path="/api/radarr/history",
                method="GET",
                description="Get download history",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Wanted Missing",
                path="/api/radarr/wanted/missing",
                method="GET",
                description="Get wanted/missing movies",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr System Status",
                path="/api/radarr/system/status",
                method="GET",
                description="Get system status",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Health",
                path="/api/radarr/health",
                method="GET",
                description="Get system health",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Disk Space",
                path="/api/radarr/diskspace",
                method="GET",
                description="Get disk space information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Quality Profile",
                path="/api/radarr/qualityprofile",
                method="GET",
                description="Get quality profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Radarr Root Folder",
                path="/api/radarr/rootfolder",
                method="GET",
                description="Get root folders",
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Execute Radarr Command",
                path="/api/radarr/command",
                method="POST",
                description="Execute system command",
                destructive=True,
                safe_mode="mock",
                body={"name": "MoviesSearch"},
                expected_status=200
            ),
            
            # Prowlarr endpoints
            EndpointConfig(
                name="Get Prowlarr Base",
                path="/api/prowlarr",
                method="GET",
                description="Get Prowlarr base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Applications",
                path="/api/prowlarr/applications",
                method="GET",
                description="Get all applications",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Application",
                path="/api/prowlarr/application",
                method="GET",
                description="Get application information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Application by ID",
                path="/api/prowlarr/application/{id}",
                method="GET",
                description="Get application by ID",
                path_params={"id": "test_app_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Download Clients",
                path="/api/prowlarr/downloadclient",
                method="GET",
                description="Get download clients",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Download Client by ID",
                path="/api/prowlarr/downloadclient/{id}",
                method="GET",
                description="Get download client by ID",
                path_params={"id": "test_client_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Test Prowlarr Download Client",
                path="/api/prowlarr/downloadclient/{id}/test",
                method="GET",
                description="Test download client",
                path_params={"id": "test_client_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Indexers",
                path="/api/prowlarr/indexer",
                method="GET",
                description="Get all indexers",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Indexer by ID",
                path="/api/prowlarr/indexer/{id}",
                method="GET",
                description="Get indexer by ID",
                path_params={"id": "test_indexer_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Test Prowlarr Indexer",
                path="/api/prowlarr/indexer/{id}/test",
                method="GET",
                description="Test indexer",
                path_params={"id": "test_indexer_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Indexer Lookup",
                path="/api/prowlarr/indexer/lookup",
                method="GET",
                description="Lookup indexer information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Health",
                path="/api/prowlarr/health",
                method="GET",
                description="Get system health",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr Log",
                path="/api/prowlarr/log",
                method="GET",
                description="Get system logs",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Prowlarr System Status",
                path="/api/prowlarr/system/status",
                method="GET",
                description="Get system status",
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Execute Prowlarr Command",
                path="/api/prowlarr/command",
                method="POST",
                description="Execute system command",
                destructive=True,
                safe_mode="mock",
                body={"name": "ApplicationCheck"},
                expected_status=200
            ),
            
            # Readarr endpoints
            EndpointConfig(
                name="Get Readarr Base",
                path="/api/readarr",
                method="GET",
                description="Get Readarr base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Authors",
                path="/api/readarr/author",
                method="GET",
                description="Get all authors",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Author by ID",
                path="/api/readarr/author/{id}",
                method="GET",
                description="Get author by ID",
                path_params={"id": "test_author_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Books",
                path="/api/readarr/book",
                method="GET",
                description="Get all books",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Book by ID",
                path="/api/readarr/book/{id}",
                method="GET",
                description="Get book by ID",
                path_params={"id": "test_book_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Queue",
                path="/api/readarr/queue",
                method="GET",
                description="Get download queue",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr History",
                path="/api/readarr/history",
                method="GET",
                description="Get download history",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Wanted Missing",
                path="/api/readarr/wanted/missing",
                method="GET",
                description="Get wanted/missing books",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr System Status",
                path="/api/readarr/system/status",
                method="GET",
                description="Get system status",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Health",
                path="/api/readarr/health",
                method="GET",
                description="Get system health",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Metadata Profile",
                path="/api/readarr/metadataprofile",
                method="GET",
                description="Get metadata profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Quality Profile",
                path="/api/readarr/qualityprofile",
                method="GET",
                description="Get quality profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Root Folder",
                path="/api/readarr/rootfolder",
                method="GET",
                description="Get root folders",
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Execute Readarr Command",
                path="/api/readarr/command",
                method="POST",
                description="Execute system command",
                destructive=True,
                safe_mode="mock",
                body={"name": "AuthorSearch"},
                expected_status=200
            ),
            
            # Readarr Audiobooks endpoints
            EndpointConfig(
                name="Get Readarr Audiobooks Base",
                path="/api/readarr-audiobooks",
                method="GET",
                description="Get Readarr Audiobooks base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Authors",
                path="/api/readarr-audiobooks/author",
                method="GET",
                description="Get all authors",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Author by ID",
                path="/api/readarr-audiobooks/author/{id}",
                method="GET",
                description="Get author by ID",
                path_params={"id": "test_author_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Books",
                path="/api/readarr-audiobooks/book",
                method="GET",
                description="Get all books",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Book by ID",
                path="/api/readarr-audiobooks/book/{id}",
                method="GET",
                description="Get book by ID",
                path_params={"id": "test_book_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Queue",
                path="/api/readarr-audiobooks/queue",
                method="GET",
                description="Get download queue",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks History",
                path="/api/readarr-audiobooks/history",
                method="GET",
                description="Get download history",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Wanted Missing",
                path="/api/readarr-audiobooks/wanted/missing",
                method="GET",
                description="Get wanted/missing books",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks System Status",
                path="/api/readarr-audiobooks/system/status",
                method="GET",
                description="Get system status",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Health",
                path="/api/readarr-audiobooks/health",
                method="GET",
                description="Get system health",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Metadata Profile",
                path="/api/readarr-audiobooks/metadataprofile",
                method="GET",
                description="Get metadata profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Quality Profile",
                path="/api/readarr-audiobooks/qualityprofile",
                method="GET",
                description="Get quality profiles",
                expected_status=200
            ),
            EndpointConfig(
                name="Get Readarr Audiobooks Root Folder",
                path="/api/readarr-audiobooks/rootfolder",
                method="GET",
                description="Get root folders",
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Execute Readarr Audiobooks Command",
                path="/api/readarr-audiobooks/command",
                method="POST",
                description="Execute system command",
                destructive=True,
                safe_mode="mock",
                body={"name": "AuthorSearch"},
                expected_status=200
            )
        ]
    
    def get_openapi_endpoint_configs(self) -> List[EndpointConfig]:
        """Get endpoint configurations from OpenAPI specifications for supported services and predefined for SABnzbd"""
        configs = []
        
        # Use predefined endpoints for SABnzbd
        print("Using predefined endpoints for SABnzbd...")
        sabnzbd_configs = [
            # SABnzbd endpoints
            EndpointConfig(
                name="Get SABnzbd Base",
                path="/api/sabnzbd",
                method="GET",
                description="Get SABnzbd base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue",
                path="/api/sabnzbd/queue",
                method="GET",
                description="Get download queue information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd History",
                path="/api/sabnzbd/history",
                method="GET",
                description="Get download history",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Categories",
                path="/api/sabnzbd/categories",
                method="GET",
                description="Get available categories",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Config",
                path="/api/sabnzbd/config",
                method="GET",
                description="Get SABnzbd configuration",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Server Stats",
                path="/api/sabnzbd/server-stats",
                method="GET",
                description="Get server statistics",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Add File",
                path="/api/sabnzbd/addfile",
                method="GET",
                description="Get add file information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Add URL",
                path="/api/sabnzbd/addurl",
                method="GET",
                description="Get add URL information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}",
                method="GET",
                description="Get specific queue item",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item Category",
                path="/api/sabnzbd/queue/{nzoId}/category",
                method="GET",
                description="Get queue item category",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item Priority",
                path="/api/sabnzbd/queue/{nzoId}/priority",
                method="GET",
                description="Get queue item priority",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Pause SABnzbd Queue",
                path="/api/sabnzbd/queue/pause",
                method="POST",
                description="Pause entire download queue",
                destructive=True,
                safe_mode="mock",
                expected_status=200
            ),
            EndpointConfig(
                name="Resume SABnzbd Queue",
                path="/api/sabnzbd/queue/resume",
                method="POST",
                description="Resume entire download queue",
                destructive=True,
                safe_mode="mock",
                expected_status=200
            ),
            EndpointConfig(
                name="Pause SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}/pause",
                method="POST",
                description="Pause specific queue item",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Resume SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}/resume",
                method="POST",
                description="Resume specific queue item",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Delete SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}",
                method="DELETE",
                description="Delete specific item from queue",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            )
        ]
        
        configs.extend(sabnzbd_configs)
        print(f"  Added {len(sabnzbd_configs)} predefined endpoint configurations for SABnzbd")
        
        # List of services to fetch OpenAPI specs from (excluding SABnzbd)
        services = ['sonarr', 'radarr', 'prowlarr', 'readarr', 'readarr_audiobooks']
        
        print("Fetching OpenAPI specifications from services...")
        
        for service in services:
            print(f"  Fetching OpenAPI spec for {service}...")
            # Use the EnhancedOpenAPIFetcher directly
            enhanced_fetcher = EnhancedOpenAPIFetcher(self.http_client, service)
            openapi_spec = enhanced_fetcher.get_openapi_spec()
            
            if openapi_spec:
                print(f"  Generating endpoint configurations for {service}...")
                service_configs = enhanced_fetcher.generate_endpoint_configs()
                
                # Add service prefix to paths if needed, but be careful with readarr_audiobooks
                for config in service_configs:
                    # For readarr_audiobooks, the path is already correctly formatted
                    if service == 'readarr_audiobooks':
                        # Just ensure it starts with the correct prefix
                        if not config.path.startswith('/api/readarr-audiobooks/'):
                            if config.path.startswith('/api/'):
                                # Replace /api/ with /api/readarr-audiobooks/
                                config.path = f'/api/readarr-audiobooks{config.path[4:]}'
                            else:
                                # Add the full prefix
                                config.path = f'/api/readarr-audiobooks{config.path}'
                    else:
                        # For other services, ensure the path has the correct service prefix
                        if not config.path.startswith(f'/api/{service}'):
                            config.path = f'/api/{service}{config.path}'
                    
                    configs.append(config)
                
                print(f"  Generated {len(service_configs)} endpoint configurations for {service}")
            else:
                print(f"  Warning: Could not fetch OpenAPI spec for {service}")
        
        print(f"Total endpoint configurations generated: {len(configs)}")
        return configs
    
    def get_mixed_endpoint_configs(self) -> List[EndpointConfig]:
        """Get endpoint configurations using mixed OpenAPI and command-based approaches"""
        configs = []
        
        # Use command-based approach for SABnzbd
        print("Using command-based endpoints for SABnzbd...")
        sabnzbd_configs = [
            # SABnzbd endpoints
            EndpointConfig(
                name="Get SABnzbd Base",
                path="/api/sabnzbd",
                method="GET",
                description="Get SABnzbd base information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue",
                path="/api/sabnzbd/queue",
                method="GET",
                description="Get download queue information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd History",
                path="/api/sabnzbd/history",
                method="GET",
                description="Get download history",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Categories",
                path="/api/sabnzbd/categories",
                method="GET",
                description="Get available categories",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Config",
                path="/api/sabnzbd/config",
                method="GET",
                description="Get SABnzbd configuration",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Server Stats",
                path="/api/sabnzbd/server-stats",
                method="GET",
                description="Get server statistics",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Add File",
                path="/api/sabnzbd/addfile",
                method="GET",
                description="Get add file information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Add URL",
                path="/api/sabnzbd/addurl",
                method="GET",
                description="Get add URL information",
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}",
                method="GET",
                description="Get specific queue item",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item Category",
                path="/api/sabnzbd/queue/{nzoId}/category",
                method="GET",
                description="Get queue item category",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Get SABnzbd Queue Item Priority",
                path="/api/sabnzbd/queue/{nzoId}/priority",
                method="GET",
                description="Get queue item priority",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            # Destructive operations
            EndpointConfig(
                name="Pause SABnzbd Queue",
                path="/api/sabnzbd/queue/pause",
                method="POST",
                description="Pause entire download queue",
                destructive=True,
                safe_mode="mock",
                expected_status=200
            ),
            EndpointConfig(
                name="Resume SABnzbd Queue",
                path="/api/sabnzbd/queue/resume",
                method="POST",
                description="Resume entire download queue",
                destructive=True,
                safe_mode="mock",
                expected_status=200
            ),
            EndpointConfig(
                name="Pause SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}/pause",
                method="POST",
                description="Pause specific queue item",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Resume SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}/resume",
                method="POST",
                description="Resume specific queue item",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            ),
            EndpointConfig(
                name="Delete SABnzbd Queue Item",
                path="/api/sabnzbd/queue/{nzoId}",
                method="DELETE",
                description="Delete specific item from queue",
                destructive=True,
                safe_mode="mock",
                path_params={"nzoId": "test_nzo_123"},
                expected_status=200
            )
        ]
        
        configs.extend(sabnzbd_configs)
        print(f"  Added {len(sabnzbd_configs)} command-based endpoint configurations for SABnzbd")
        
        # Use OpenAPI-based approach for other services
        openapi_services = ['sonarr', 'radarr', 'prowlarr', 'readarr', 'readarr_audiobooks']
        
        print("Fetching OpenAPI specifications from services...")
        
        for service in openapi_services:
            print(f"  Fetching OpenAPI spec for {service}...")
            # Use the EnhancedOpenAPIFetcher directly
            enhanced_fetcher = EnhancedOpenAPIFetcher(self.http_client, service)
            openapi_spec = enhanced_fetcher.get_openapi_spec()
            
            if openapi_spec:
                print(f"  Generating endpoint configurations for {service}...")
                service_configs = enhanced_fetcher.generate_endpoint_configs()
                
                # Add service prefix to paths if needed, but be careful with readarr_audiobooks
                for config in service_configs:
                    # For readarr_audiobooks, the path is already correctly formatted
                    if service == 'readarr_audiobooks':
                        # Just ensure it starts with the correct prefix
                        if not config.path.startswith('/api/readarr-audiobooks/'):
                            if config.path.startswith('/api/'):
                                # Replace /api/ with /api/readarr-audiobooks/
                                config.path = f'/api/readarr-audiobooks{config.path[4:]}'
                            else:
                                # Add the full prefix
                                config.path = f'/api/readarr-audiobooks{config.path}'
                    else:
                        # For other services, ensure the path has the correct service prefix
                        if not config.path.startswith(f'/api/{service}'):
                            config.path = f'/api/{service}{config.path}'
                    
                    configs.append(config)
                
                print(f"  Generated {len(service_configs)} OpenAPI-based endpoint configurations for {service}")
            else:
                print(f"  Warning: Could not fetch OpenAPI spec for {service}")
                # Fallback to default configurations if OpenAPI spec is not available
                print(f"  Using default configurations for {service}")
                default_configs = self.get_default_configs_for_service(service)
                configs.extend(default_configs)
        
        print(f"Total endpoint configurations generated: {len(configs)}")
        return configs
    
    def get_default_configs_for_service(self, service: str) -> List[EndpointConfig]:
        """Get default endpoint configurations for a specific service"""
        if service == 'sonarr':
            return [
                EndpointConfig(
                    name="Get Sonarr Base",
                    path="/api/sonarr",
                    method="GET",
                    description="Get Sonarr base information",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Sonarr Series",
                    path="/api/sonarr/series",
                    method="GET",
                    description="Get all series",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Sonarr System Status",
                    path="/api/sonarr/system/status",
                    method="GET",
                    description="Get system status",
                    expected_status=200
                )
            ]
        elif service == 'radarr':
            return [
                EndpointConfig(
                    name="Get Radarr Base",
                    path="/api/radarr",
                    method="GET",
                    description="Get Radarr base information",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Radarr Movies",
                    path="/api/radarr/movies",
                    method="GET",
                    description="Get all movies",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Radarr System Status",
                    path="/api/radarr/system/status",
                    method="GET",
                    description="Get system status",
                    expected_status=200
                )
            ]
        elif service == 'prowlarr':
            return [
                EndpointConfig(
                    name="Get Prowlarr Base",
                    path="/api/prowlarr",
                    method="GET",
                    description="Get Prowlarr base information",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Prowlarr Applications",
                    path="/api/prowlarr/applications",
                    method="GET",
                    description="Get all applications",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Prowlarr System Status",
                    path="/api/prowlarr/system/status",
                    method="GET",
                    description="Get system status",
                    expected_status=200
                )
            ]
        elif service == 'readarr':
            return [
                EndpointConfig(
                    name="Get Readarr Base",
                    path="/api/readarr",
                    method="GET",
                    description="Get Readarr base information",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Readarr Authors",
                    path="/api/readarr/author",
                    method="GET",
                    description="Get all authors",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Readarr System Status",
                    path="/api/readarr/system/status",
                    method="GET",
                    description="Get system status",
                    expected_status=200
                )
            ]
        elif service == 'readarr_audiobooks':
            return [
                EndpointConfig(
                    name="Get Readarr Audiobooks Base",
                    path="/api/readarr-audiobooks",
                    method="GET",
                    description="Get Readarr Audiobooks base information",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Readarr Audiobooks Authors",
                    path="/api/readarr-audiobooks/author",
                    method="GET",
                    description="Get all authors",
                    expected_status=200
                ),
                EndpointConfig(
                    name="Get Readarr Audiobooks System Status",
                    path="/api/readarr-audiobooks/system/status",
                    method="GET",
                    description="Get system status",
                    expected_status=200
                )
            ]
        else:
            return []
    
    def is_destructive_operation(self, method: str, path: str) -> bool:
        """Check if an operation is destructive"""
        if method.upper() == "DELETE":
            return True
        
        # Check for specific destructive patterns
        destructive_patterns = [
            "/queue/pause",
            "/queue/resume",
            "/delete",
            "/remove",
            "/command"
        ]
        
        return any(pattern in path.lower() for pattern in destructive_patterns)
    
    def run_test(self, config: EndpointConfig) -> TestResult:
        """Run a single test case with safety checks"""
        start_time = time.time()
        
        # Determine service from endpoint path
        service = self.extract_service_from_path(config.path)
        
        # Check if this is a destructive operation
        if self.safe_mode and config.destructive:
            # Handle based on safe_mode setting
            if config.safe_mode == "mock":
                # Return a mock result for destructive operations
                elapsed_ms = int((time.time() - start_time) * 1000)
                return TestResult(
                    service=service,
                    endpoint=config.path,
                    method=config.method,
                    test_name=config.name,
                    status="SKIPPED",
                    http_status=200,
                    error_message=None,
                    elapsed_ms=elapsed_ms,
                    request_body=json.dumps(config.body) if config.body else None,
                    response_body='{"message": "Destructive operation mocked for safety"}',
                    validation_results={},
                    safety_notes="Mocked in safe mode"
                )
            elif config.safe_mode == "skip":
                # Skip the test entirely
                elapsed_ms = int((time.time() - start_time) * 1000)
                return TestResult(
                    service=service,
                    endpoint=config.path,
                    method=config.method,
                    test_name=config.name,
                    status="SKIPPED",
                    http_status=None,
                    error_message=None,
                    elapsed_ms=elapsed_ms,
                    request_body=None,
                    response_body=None,
                    validation_results={},
                    safety_notes="Skipped in safe mode"
                )
        
        # Prepare the endpoint path with parameters
        endpoint_path = config.path
        path_params = config.path_params or {}
        
        # Replace path parameters with real IDs if available
        for key, value in path_params.items():
            # If the value is a placeholder (starts with 'test_'), try to get a real ID
            if isinstance(value, str) and value.startswith('test_'):
                real_id = self.id_fetcher.get_id_for_service(service)
                endpoint_path = endpoint_path.replace(f"{{{key}}}", real_id)
                
                # Log if we're using a fallback ID
                if real_id.startswith('test_'):
                    print(f"  Using fallback ID '{real_id}' for {service} endpoint: {config.name}")
            else:
                endpoint_path = endpoint_path.replace(f"{{{key}}}", str(value))
        
        # Make the request
        response = self.http_client.request(
            method=config.method,
            endpoint=endpoint_path,
            params=config.query_params,
            json_data=config.body
        )
        
        # Validate the response
        expectations = {
            'status_code': config.expected_status,
            'json_format': True,
            'response_time': 10000  # 10 seconds max
        }
        
        validation_results = self.validator.validate(response, expectations)
        
        # Determine test status
        if response['error']:
            status = "FAIL"
            error_message = response['error']
        elif all(validation_results.values()):
            status = "PASS"
            error_message = None
        else:
            status = "FAIL"
            error_message = "Validation failed"
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        return TestResult(
            service=service,
            endpoint=endpoint_path,
            method=config.method,
            test_name=config.name,
            status=status,
            http_status=response.get('status_code'),
            error_message=error_message,
            elapsed_ms=elapsed_ms,
            request_body=json.dumps(config.body) if config.body else None,
            response_body=response.get('body'),
            validation_results=validation_results,
            safety_notes=None
        )
    
    def extract_service_from_path(self, path: str) -> str:
        """Extract service name from endpoint path"""
        if '/sabnzbd/' in path:
            return 'sabnzbd'
        elif '/sonarr/' in path:
            return 'sonarr'
        elif '/radarr/' in path:
            return 'radarr'
        elif '/prowlarr/' in path:
            return 'prowlarr'
        elif '/readarr/' in path:
            return 'readarr'
        elif '/readarr-audiobooks/' in path:
            return 'readarr_audiobooks'
        else:
            return 'unknown'
    
    def print_test_result(self, result: TestResult):
        """Print a single test result"""
        if result.status == "PASS":
            status_icon = "✅"
        elif result.status == "FAIL":
            status_icon = "❌"
        else:
            status_icon = "⏭️"
        
        http_info = f"HTTP {result.http_status}" if result.http_status else "-"
        extra = f" ({result.error_message})" if result.error_message else ""
        safety_note = f" [{result.safety_notes}]" if result.safety_notes else ""
        
        print(f"{status_icon} {result.service:10s} {result.method:6s} {result.endpoint:40s} {result.status:6s} {http_info:8s} {result.elapsed_ms}ms{extra}{safety_note}")
    
    def run_random_selection(self, limit: int = 20) -> Dict[str, Optional[Dict[str, Any]]]:
        """Run random selection for all supported services"""
        if not self.random_selector_manager:
            print("Random selection is not enabled. Use --enable-random-selection flag.")
            return {}
        
        print(f"\nRunning random selection with limit: {limit}")
        print("=" * 50)
        
        return self.random_selector_manager.get_random_items_from_all_services(limit)
    
    def run_all_tests(self) -> List[TestResult]:
        """Run all configured tests"""
        print(f"Running {len(self.endpoint_configs)} endpoint checks against {self.base_url}...")
        print(f"Safe mode: {'Enabled' if self.safe_mode else 'Disabled'}")
        print("\nTesting endpoints:")
        print("-" * 80)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.concurrency) as executor:
            futures = [executor.submit(self.run_test, config) for config in self.endpoint_configs]
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    self.test_results.append(result)
                    # Print the result immediately
                    self.print_test_result(result)
                except Exception as e:
                    # This should not normally happen; capture a synthetic failure
                    result = TestResult(
                        service="unknown",
                        endpoint="unknown",
                        method="unknown",
                        test_name="unknown",
                        status="FAIL",
                        http_status=None,
                        error_message=f"Runner exception: {e}",
                        elapsed_ms=0,
                        request_body=None,
                        response_body=None,
                        validation_results={},
                        safety_notes=None
                    )
                    self.test_results.append(result)
                    # Print the failure immediately
                    self.print_test_result(result)
        
        # Keep the original endpoint order in the output
        order = {config.path: i for i, config in enumerate(self.endpoint_configs)}
        self.test_results.sort(key=lambda r: order.get(r.endpoint, 10**9))
        
        return self.test_results
    
    def create_fix_summary(self, analysis_report_file: str) -> None:
        """Create a summary of what needs fixing based on the analysis report"""
        try:
            with open(analysis_report_file, 'r') as f:
                analysis_data = json.load(f)
            
            issues = analysis_data.get('issues', [])
            summary = analysis_data.get('summary', {})
            
            if not issues:
                print("\nNo issues found in the analysis report!")
                return
            
            print("\n" + "="*80)
            print("FIX SUMMARY - WHAT NEEDS TO BE ADDRESSED")
            print("="*80)
            
            # Overall summary
            print(f"\nOVERVIEW:")
            print(f"  Total Issues: {summary.get('total_issues', 0)}")
            print(f"  Critical: {summary.get('critical_issues', 0)}")
            print(f"  High: {summary.get('high_issues', 0)}")
            print(f"  Medium: {summary.get('medium_issues', 0)}")
            print(f"  Low: {summary.get('low_issues', 0)}")
            
            # Issues by service
            issues_by_service = summary.get('issues_by_service', {})
            if issues_by_service:
                print(f"\nISSUES BY SERVICE:")
                for service, count in issues_by_service.items():
                    print(f"  {service}: {count} issues")
            
            # Top priority issues
            print(f"\nTOP PRIORITY ISSUES (P0 - Critical):")
            critical_issues = [issue for issue in issues if issue.get('priority') == 'P0 - Critical']
            for issue in critical_issues[:5]:  # Show top 5 critical issues
                print(f"  - {issue.get('id', 'N/A')}: {issue.get('endpoint', 'N/A')} ({issue.get('method', 'N/A')})")
                print(f"    Severity: {issue.get('severity', 'N/A')}")
                print(f"    Error: {issue.get('error_message', 'N/A')[:80]}...")
                print(f"    Suggested Fix: {issue.get('suggested_fix', 'N/A')[:80]}...")
                print(f"    Assignee: {issue.get('assignee', 'N/A')}")
                print(f"    Due Date: {issue.get('due_date', 'N/A')}")
                print()
            
            # High priority issues
            print(f"HIGH PRIORITY ISSUES (P1 - High):")
            high_issues = [issue for issue in issues if issue.get('priority') == 'P1 - High']
            for issue in high_issues[:5]:  # Show top 5 high priority issues
                print(f"  - {issue.get('id', 'N/A')}: {issue.get('endpoint', 'N/A')} ({issue.get('method', 'N/A')})")
                print(f"    Severity: {issue.get('severity', 'N/A')}")
                print(f"    Error: {issue.get('error_message', 'N/A')[:80]}...")
                print(f"    Suggested Fix: {issue.get('suggested_fix', 'N/A')[:80]}...")
                print(f"    Assignee: {issue.get('assignee', 'N/A')}")
                print(f"    Due Date: {issue.get('due_date', 'N/A')}")
                print()
            
            # Common error patterns
            error_patterns = {}
            for issue in issues:
                error_msg = issue.get('error_message', '')
                if error_msg:
                    # Extract common error patterns
                    if '404' in error_msg:
                        error_patterns['404 Not Found'] = error_patterns.get('404 Not Found', 0) + 1
                    elif '500' in error_msg:
                        error_patterns['500 Server Error'] = error_patterns.get('500 Server Error', 0) + 1
                    elif 'timeout' in error_msg.lower():
                        error_patterns['Timeout'] = error_patterns.get('Timeout', 0) + 1
                    elif 'connection' in error_msg.lower():
                        error_patterns['Connection Error'] = error_patterns.get('Connection Error', 0) + 1
                    elif 'authentication' in error_msg.lower():
                        error_patterns['Authentication'] = error_patterns.get('Authentication', 0) + 1
                    else:
                        error_patterns['Other'] = error_patterns.get('Other', 0) + 1
            
            if error_patterns:
                print(f"\nCOMMON ERROR PATTERNS:")
                for pattern, count in sorted(error_patterns.items(), key=lambda x: x[1], reverse=True):
                    print(f"  {pattern}: {count} occurrences")
            
            # Recommended actions
            print(f"\nRECOMMENDED ACTIONS:")
            print(f"  1. Address all Critical (P0) issues immediately")
            print(f"  2. Review and fix High (P1) priority issues this week")
            print(f"  3. Consider batching similar issues for efficient fixing")
            print(f"  4. Check the generated fix script: analysis_reports/apply_fixes.sh")
            print(f"  5. Run the smoke test again after applying fixes")
            
            print(f"\nDETAILED REPORTS AVAILABLE:")
            print(f"  - JSON Analysis: {analysis_report_file}")
            
            # Check for HTML report
            import glob
            html_reports = glob.glob("analysis_reports/issue_analysis_*.html")
            if html_reports:
                latest_html = max(html_reports, key=os.path.getctime)
                print(f"  - HTML Report: {latest_html}")
            
            print(f"  - Fix Script: analysis_reports/apply_fixes.sh")
            
            print("\n" + "="*80)
            
        except FileNotFoundError:
            print(f"\nError: Analysis report file not found: {analysis_report_file}")
        except json.JSONDecodeError as e:
            print(f"\nError: Invalid JSON in analysis report: {e}")
        except Exception as e:
            print(f"\nError creating fix summary: {e}")
    
    def generate_reports(self, output_dir: str) -> Dict[str, str]:
        """Generate all test reports"""
        report_files = {}
        
        # Console report
        passed, failed = self.report_generator.generate_console_report(self.test_results)
        
        # JSON report
        json_file = self.report_generator.generate_json_report(self.test_results)
        report_files['json'] = json_file
        
        # HTML report
        html_file = self.report_generator.generate_html_report(self.test_results)
        report_files['html'] = html_file
        
        print(f"\nReports generated:")
        print(f"  JSON: {json_file}")
        print(f"  HTML: {html_file}")
        
        return report_files


def parse_base_port(base: str) -> int:
    """Parse port number from base URL"""
    try:
        p = urllib.parse.urlparse(base)
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
    """Check if server is up and responding"""
    url = base.rstrip("/") + "/"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            return (code // 100) in (2, 3)
    except Exception:
        return False


def start_dev_server(dev_cmd: str, port: int) -> subprocess.Popen:
    """Start development server"""
    # Allow {port} placeholder in command; if absent, append -p {port}
    cmd_str = dev_cmd.format(port=port) if "{port}" in dev_cmd else (dev_cmd + f" -p {port}")
    args = shlex.split(cmd_str)
    if os.name == 'posix':
        # New process group so we can terminate subtree
        return subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, preexec_fn=os.setsid)
    else:
        return subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def stop_process(proc: subprocess.Popen):
    """Stop a process"""
    try:
        if proc.poll() is not None:
            return
        if os.name == 'posix':
            os.killpg(proc.pid, signal.SIGTERM)
        else:
            proc.terminate()
    except Exception:
        pass


def wait_for_server(base: str, timeout_seconds: int) -> bool:
    """Wait for server to be ready"""
    start = time.time()
    while (time.time() - start) < timeout_seconds:
        if is_server_up(base, timeout=2):
            return True
        time.sleep(1.0)
    return False


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Enhanced API Smoke Test Runner")
    parser.add_argument("--base", required=True, help="Base URL of the running app (e.g., http://localhost:3000)")
    parser.add_argument("--timeout", type=int, default=10, help="Request timeout in seconds (default: 10)")
    parser.add_argument("--concurrency", type=int, default=8, help="Number of parallel workers (default: 8)")
    parser.add_argument("--safe-mode", action="store_true", default=True, help="Enable safe mode for destructive operations")
    parser.add_argument("--config-file", help="JSON file with endpoint configurations")
    parser.add_argument("--output-dir", default="test_reports", help="Output directory for reports")
    parser.add_argument("--use-openapi", action="store_true", default=False, help="Use OpenAPI specifications to discover endpoints")
    parser.add_argument("--enable-random-selection", action="store_true", default=False, help="Enable random media selection feature")
    parser.add_argument("--random-selection-limit", type=int, default=20, help="Number of items to fetch for random selection (default: 20)")

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
        # Create tester instance
        tester = EnhancedAPITester(
            base_url=args.base,
            config_file=args.config_file,
            safe_mode=args.safe_mode,
            timeout=args.timeout,
            concurrency=args.concurrency,
            use_openapi=args.use_openapi,
            enable_random_selection=args.enable_random_selection
        )
        
        # Run random selection if enabled
        if args.enable_random_selection:
            random_results = tester.run_random_selection(args.random_selection_limit)
            
            if random_results:
                print("\nRandom Selection Results:")
                print("=" * 50)
                for service, item_info in random_results.items():
                    if item_info:
                        print(f"{service.capitalize()}: {item_info['name']} (ID: {item_info['id']})")
                    else:
                        print(f"{service.capitalize()}: No items found")
                print("=" * 50)
        
        # Run all tests
        results = tester.run_all_tests()
        
        # Generate reports
        report_files = tester.generate_reports(args.output_dir)
        
        # Get the latest JSON report file
        latest_json_report = report_files['json']
        
        # Count failed tests
        failed_tests = sum(1 for r in results if r.status == "FAIL")
        
        # Automatically analyze results if there are failed tests
        if failed_tests > 0:
            print(f"\n{failed_tests} tests failed. Automatically analyzing results...")
            print(f"\nAnalyzing results with {latest_json_report}...")
            
            # Run the analyze_results.py script
            try:
                result = subprocess.run(
                    ["/usr/bin/python3", "scripts/analyze_results.py", latest_json_report],
                    capture_output=True,
                    text=True,
                    check=True
                )
                
                # Print the analysis output
                print("\n" + "="*80)
                print("ANALYSIS RESULTS")
                print("="*80)
                print(result.stdout)
                
                if result.stderr:
                    print("\n" + "="*80)
                    print("ANALYSIS ERRORS")
                    print("="*80)
                    print(result.stderr)
                
                # Find the latest analysis report
                import glob
                analysis_reports = glob.glob("analysis_reports/issue_analysis_*.json")
                if analysis_reports:
                    latest_analysis = max(analysis_reports, key=os.path.getctime)
                    print(f"\nLatest analysis report: {latest_analysis}")
                    
                    # Create a summary of what needs fixing
                    tester.create_fix_summary(latest_analysis)
                
            except subprocess.CalledProcessError as e:
                print(f"\nError running analysis: {e}")
                print("Please run the analysis manually:")
                print(f"  python3 scripts/analyze_results.py {latest_json_report}")
            except Exception as e:
                print(f"\nUnexpected error during analysis: {e}")
        else:
            print("\nAll tests passed! No analysis needed.")
        
        # Exit with appropriate code
        exit_code = 0 if failed_tests == 0 else 1
        
    finally:
        if server_started and proc:
            print("Stopping dev server started by the smoke test ...")
            stop_process(proc)

    sys.exit(exit_code)


if __name__ == "__main__":
    main()