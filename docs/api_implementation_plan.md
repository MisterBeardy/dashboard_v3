# API Endpoint Testing Implementation Plan

## Overview

This document outlines the implementation plan for testing API endpoints with different HTTP methods (GET, POST, DELETE, etc.) in the dashboard application. The plan builds on the previous analysis and provides a step-by-step approach to implementing comprehensive endpoint testing.

## Implementation Architecture

### 1. Test Framework Structure

```
scripts/
├── api_smoke_test.py              # Original smoke test script
├── enhanced_api_smoke_test.py      # Enhanced version (to be implemented)
├── test_config/
│   ├── endpoints.json             # Endpoint configurations
│   ├── test_data.json             # Test data for various scenarios
│   └── expected_responses.json    # Expected response templates
├── test_utils/
│   ├── http_client.py             # HTTP client wrapper
│   ├── response_validator.py      # Response validation utilities
│   └── report_generator.py        # Test report generation
└── test_reports/                  # Generated test reports
    ├── json/                      # JSON format reports
    ├── html/                      # HTML format reports
    └── logs/                      # Detailed test logs
```

### 2. Core Components

#### HTTP Client Wrapper (`test_utils/http_client.py`)

```python
class HTTPClient:
    def __init__(self, base_url, timeout=10, headers=None):
        self.base_url = base_url
        self.timeout = timeout
        self.headers = headers or {}
    
    def request(self, method, endpoint, params=None, data=None, json_data=None):
        """
        Make HTTP request with support for different methods and data types
        """
        url = f"{self.base_url}{endpoint}"
        
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
        with urllib.request.urlopen(req, data=data, timeout=self.timeout) as response:
            return {
                'status_code': response.getcode(),
                'headers': dict(response.headers),
                'body': response.read().decode('utf-8')
            }
```

#### Response Validator (`test_utils/response_validator.py`)

```python
class ResponseValidator:
    def __init__(self):
        self.validators = {
            'status_code': self._validate_status_code,
            'json_format': self._validate_json_format,
            'response_time': self._validate_response_time,
            'required_fields': self._validate_required_fields
        }
    
    def validate(self, response, expectations):
        """
        Validate response against expectations
        """
        results = {}
        for key, value in expectations.items():
            if key in self.validators:
                results[key] = self.validators[key](response, value)
        return results
    
    def _validate_status_code(self, response, expected_code):
        return response['status_code'] == expected_code
    
    def _validate_json_format(self, response, expected_format):
        try:
            json.loads(response['body'])
            return True
        except json.JSONDecodeError:
            return False
    
    def _validate_response_time(self, response, max_time_ms):
        return response['elapsed_ms'] <= max_time_ms
    
    def _validate_required_fields(self, response, fields):
        try:
            data = json.loads(response['body'])
            return all(field in data for field in fields)
        except json.JSONDecodeError:
            return False
```

#### Report Generator (`test_utils/report_generator.py`)

```python
class ReportGenerator:
    def __init__(self):
        self.formatters = {
            'json': self._format_json,
            'html': self._format_html,
            'console': self._format_console
        }
    
    def generate_report(self, results, format_type='console'):
        """
        Generate test report in specified format
        """
        if format_type not in self.formatters:
            raise ValueError(f"Unsupported format: {format_type}")
        
        return self.formatters[format_type](results)
    
    def _format_json(self, results):
        return json.dumps(results, indent=2)
    
    def _format_html(self, results):
        # HTML template implementation
        pass
    
    def _format_console(self, results):
        # Console formatting implementation
        pass
```

## Implementation Steps

### Step 1: Endpoint Configuration

Create a comprehensive endpoint configuration file that defines all endpoints to be tested:

```json
{
  "sabnzbd": {
    "endpoints": [
      {
        "name": "Generic Proxy",
        "path": "/api/sabnzbd",
        "method": "GET",
        "description": "Generic proxy endpoint for SABnzbd API",
        "expected_status": 200,
        "expected_format": "json",
        "max_response_time": 2000,
        "tests": [
          {
            "name": "Basic connectivity",
            "params": {},
            "expected": {
              "status_code": 200
            }
          }
        ]
      },
      {
        "name": "Queue Pause",
        "path": "/api/sabnzbd/queue/pause",
        "method": "POST",
        "description": "Pause entire download queue",
        "expected_status": 200,
        "expected_format": "json",
        "max_response_time": 3000,
        "body": {},
        "tests": [
          {
            "name": "Pause queue",
            "body": {},
            "expected": {
              "status_code": 200
            }
          }
        ]
      }
    ]
  },
  "sonarr": {
    "endpoints": [
      {
        "name": "Get Series",
        "path": "/api/sonarr/series",
        "method": "GET",
        "description": "Get all series",
        "expected_status": 200,
        "expected_format": "json",
        "max_response_time": 3000,
        "expected_fields": ["id", "title", "seasonCount"],
        "tests": [
          {
            "name": "Get all series",
            "params": {},
            "expected": {
              "status_code": 200,
              "required_fields": ["id", "title"]
            }
          }
        ]
      }
    ]
  }
}
```

### Step 2: Test Data Configuration

Create test data for various scenarios:

```json
{
  "sabnzbd": {
    "queue_items": [
      {
        "nzo_id": "test_nzo_id_1",
        "filename": "test_file_1.nzb",
        "status": "downloading"
      }
    ],
    "categories": ["movies", "tv", "music"],
    "priorities": ["Low", "Normal", "High", "Force"]
  },
  "sonarr": {
    "series": [
      {
        "id": 1,
        "title": "Test Series",
        "seasonCount": 5,
        "monitored": true
      }
    ],
    "episodes": [
      {
        "id": 1,
        "seriesId": 1,
        "seasonNumber": 1,
        "episodeNumber": 1,
        "monitored": true
      }
    ]
  }
}
```

### Step 3: Enhanced Test Script Implementation

Create the enhanced test script with support for different HTTP methods:

```python
#!/usr/bin/env python3
"""
Enhanced API smoke test runner with support for multiple HTTP methods.
"""

import argparse
import concurrent.futures
import json
import sys
import time
import os
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from urllib import request, error
from urllib.parse import urljoin, urlparse
from test_utils.http_client import HTTPClient
from test_utils.response_validator import ResponseValidator
from test_utils.report_generator import ReportGenerator

@dataclass
class TestResult:
    service: str
    endpoint: str
    method: str
    test_name: str
    status: str  # "PASS" or "FAIL"
    http_status: Optional[int]
    error_message: Optional[str]
    elapsed_ms: int
    request_body: Optional[str]
    response_body: Optional[str]
    validation_results: Dict[str, bool]

class EnhancedAPITester:
    def __init__(self, base_url, config_file, timeout=10, concurrency=8):
        self.base_url = base_url
        self.config_file = config_file
        self.timeout = timeout
        self.concurrency = concurrency
        self.http_client = HTTPClient(base_url, timeout)
        self.validator = ResponseValidator()
        self.report_generator = ReportGenerator()
        
    def load_config(self):
        """Load endpoint configuration from file"""
        with open(self.config_file, 'r') as f:
            return json.load(f)
    
    def run_test(self, service_name, endpoint_config, test_config):
        """Run a single test case"""
        start_time = time.time()
        
        try:
            # Prepare request parameters
            method = endpoint_config['method']
            path = endpoint_config['path']
            params = test_config.get('params', {})
            body = test_config.get('body', {})
            
            # Make request
            response = self.http_client.request(
                method=method,
                endpoint=path,
                params=params,
                json_data=body if method in ['POST', 'PUT'] else None
            )
            
            # Calculate elapsed time
            elapsed_ms = int((time.time() - start_time) * 1000)
            response['elapsed_ms'] = elapsed_ms
            
            # Validate response
            expectations = test_config.get('expected', {})
            validation_results = self.validator.validate(response, expectations)
            
            # Determine test status
            test_passed = all(validation_results.values())
            status = "PASS" if test_passed else "FAIL"
            
            # Create error message if validation failed
            error_message = None
            if not test_passed:
                failed_validations = [k for k, v in validation_results.items() if not v]
                error_message = f"Validation failed: {', '.join(failed_validations)}"
            
            return TestResult(
                service=service_name,
                endpoint=path,
                method=method,
                test_name=test_config['name'],
                status=status,
                http_status=response['status_code'],
                error_message=error_message,
                elapsed_ms=elapsed_ms,
                request_body=json.dumps(body) if body else None,
                response_body=response['body'],
                validation_results=validation_results
            )
            
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            return TestResult(
                service=service_name,
                endpoint=endpoint_config['path'],
                method=endpoint_config['method'],
                test_name=test_config['name'],
                status="FAIL",
                http_status=None,
                error_message=f"Exception: {str(e)}",
                elapsed_ms=elapsed_ms,
                request_body=None,
                response_body=None,
                validation_results={}
            )
    
    def run_all_tests(self):
        """Run all tests for all services"""
        config = self.load_config()
        all_results = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.concurrency) as executor:
            futures = []
            
            # Submit all tests
            for service_name, service_config in config.items():
                for endpoint_config in service_config['endpoints']:
                    for test_config in endpoint_config['tests']:
                        future = executor.submit(
                            self.run_test,
                            service_name,
                            endpoint_config,
                            test_config
                        )
                        futures.append(future)
            
            # Collect results
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    all_results.append(result)
                except Exception as e:
                    # Handle test execution errors
                    all_results.append(TestResult(
                        service="unknown",
                        endpoint="unknown",
                        method="unknown",
                        test_name="unknown",
                        status="FAIL",
                        http_status=None,
                        error_message=f"Test execution error: {str(e)}",
                        elapsed_ms=0,
                        request_body=None,
                        response_body=None,
                        validation_results={}
                    ))
        
        return all_results
    
    def generate_reports(self, results, output_dir):
        """Generate test reports in multiple formats"""
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate JSON report
        json_report = self.report_generator.generate_report(results, 'json')
        with open(os.path.join(output_dir, 'test_results.json'), 'w') as f:
            f.write(json_report)
        
        # Generate HTML report
        html_report = self.report_generator.generate_report(results, 'html')
        with open(os.path.join(output_dir, 'test_results.html'), 'w') as f:
            f.write(html_report)
        
        # Generate console report
        console_report = self.report_generator.generate_report(results, 'console')
        print(console_report)

def main():
    parser = argparse.ArgumentParser(description="Enhanced API Smoke Test Runner")
    parser.add_argument("--base", required=True, help="Base URL of the running app")
    parser.add_argument("--config", required=True, help="Path to endpoint configuration file")
    parser.add_argument("--timeout", type=int, default=10, help="Request timeout in seconds")
    parser.add_argument("--concurrency", type=int, default=8, help="Number of parallel workers")
    parser.add_argument("--output", default="test_reports", help="Output directory for reports")
    
    args = parser.parse_args()
    
    # Create tester instance
    tester = EnhancedAPITester(
        base_url=args.base,
        config_file=args.config,
        timeout=args.timeout,
        concurrency=args.concurrency
    )
    
    # Run all tests
    print(f"Running enhanced API tests against {args.base}...")
    results = tester.run_all_tests()
    
    # Generate reports
    tester.generate_reports(results, args.output)
    
    # Exit with appropriate code
    failed_tests = sum(1 for r in results if r.status == "FAIL")
    sys.exit(0 if failed_tests == 0 else 1)

if __name__ == "__main__":
    main()
```

### Step 4: Test Execution Strategy

1. **Basic Connectivity Tests**
   - Test all GET endpoints without parameters
   - Verify HTTP 200 OK responses
   - Check response format (JSON)

2. **Parameterized Tests**
   - Test endpoints with path parameters
   - Test endpoints with query parameters
   - Test endpoints with request bodies

3. **Error Handling Tests**
   - Test with invalid parameters
   - Test with malformed request bodies
   - Test with invalid HTTP methods

4. **Performance Tests**
   - Measure response times
   - Test with concurrent requests
   - Identify performance bottlenecks

### Step 5: Reporting and Analysis

1. **Generate Comprehensive Reports**
   - JSON format for machine processing
   - HTML format for interactive viewing
   - Console format for quick overview

2. **Analyze Results**
   - Identify failing endpoints
   - Categorize errors (network, HTTP, validation)
   - Measure performance metrics

3. **Provide Recommendations**
   - Prioritize fixes based on impact
   - Suggest specific improvements
   - Document known limitations

## Implementation Timeline

### Week 1: Core Implementation
- Day 1-2: Implement HTTP client wrapper
- Day 3-4: Implement response validator
- Day 5: Implement report generator

### Week 2: Test Configuration
- Day 1-2: Create endpoint configuration files
- Day 3-4: Create test data files
- Day 5: Create expected response templates

### Week 3: Enhanced Script
- Day 1-3: Implement enhanced test script
- Day 4-5: Test and debug the implementation

### Week 4: Execution and Analysis
- Day 1-2: Run comprehensive tests
- Day 3-4: Analyze results
- Day 5: Generate final report

## Success Criteria

1. **Comprehensive Coverage**
   - All discovered endpoints are tested
   - Multiple HTTP methods are supported
   - Various test scenarios are covered

2. **Robust Error Handling**
   - Network errors are properly handled
   - HTTP errors are properly categorized
   - Validation errors are clearly reported

3. **Detailed Reporting**
   - Reports are generated in multiple formats
   - Results are easy to understand
   - Recommendations are actionable

4. **Performance and Reliability**
   - Tests run efficiently
   - Concurrent execution is supported
   - Results are consistent

## Risk Mitigation

1. **Complex Endpoints**
   - Implement parameter substitution
   - Use test data templates
   - Provide clear error messages

2. **Performance Issues**
   - Implement timeout handling
   - Support concurrent execution
   - Monitor resource usage

3. **Configuration Management**
   - Use JSON for easy configuration
   - Provide validation for config files
   - Include default values

4. **Compatibility Issues**
   - Support multiple Python versions
   - Handle different response formats
   - Provide fallback mechanisms