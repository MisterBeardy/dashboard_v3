# Safe Testing Guidelines

## Overview

This document provides guidelines for safely testing API endpoints without risking data loss in production or development environments. Since a dedicated test environment is not yet available, we need to implement safeguards to prevent destructive operations.

## Destructive Operations Identification

### 1. DELETE Operations

The following endpoints perform destructive operations and should be handled with care:

#### SABnzbd DELETE Operations
- `DELETE /api/sabnzbd/queue/[nzoId]` - Deletes items from download queue
- `DELETE /api/sabnzbd/history/[nzoId]` - Deletes items from download history

#### Sonarr DELETE Operations
- `DELETE /api/sonarr/queue/[id]` - Deletes items from download queue
- `DELETE /api/sonarr/series/[id]` - Deletes entire series
- `DELETE /api/sonarr/episode/[id]` - Deletes episodes

#### Radarr DELETE Operations (when implemented)
- `DELETE /api/radarr/queue/[id]` - Deletes items from download queue
- `DELETE /api/radarr/movie/[id]` - Deletes movies

#### Prowlarr DELETE Operations (when implemented)
- `DELETE /api/prowlarr/indexer/[id]` - Deletes indexers

#### Readarr DELETE Operations (when implemented)
- `DELETE /api/readarr/book/[id]` - Deletes books
- `DELETE /api/readarr/author/[id]` - Deletes authors

### 2. Destructive POST/PUT Operations

Some POST/PUT operations can also modify or delete data:

#### SABnzbd Destructive Operations
- `POST /api/sabnzbd/queue/pause` - Pauses all downloads (affects user experience)
- `POST /api/sabnzbd/queue/resume` - Resumes all downloads (affects user experience)
- `POST /api/sabnzbd/queue/[nzoId]/pause` - Pauses specific download
- `POST /api/sabnzbd/queue/[nzoId]/resume` - Resumes specific download

#### Sonarr Destructive Operations
- `PUT /api/sonarr/series/[id]` - Can delete series if monitored=false and files are deleted
- `PUT /api/sonarr/episode/[id]` - Can delete episode files if not monitored
- `POST /api/sonarr/command` with "RefreshSeries" or "RescanSeries" can trigger file operations

## Safe Testing Implementation

### 1. Configuration Flag Approach

Add a configuration flag to control destructive operations:

```python
# In test configuration
SAFE_MODE = True  # Set to False only in dedicated test environments

# In test runner
def is_destructive_operation(method, endpoint):
    """Check if an operation is destructive"""
    if method == "DELETE":
        return True
    
    # Check for specific destructive endpoints
    destructive_patterns = [
        "/delete",
        "/remove",
        "/pause",
        "/resume",
        "/command"
    ]
    
    return any(pattern in endpoint.lower() for pattern in destructive_patterns)

def safe_execute_test(method, endpoint, data=None):
    """Safely execute test with checks for destructive operations"""
    if SAFE_MODE and is_destructive_operation(method, endpoint):
        # Log the test but don't execute
        log_test_skipped(method, endpoint, "Destructive operation blocked by SAFE_MODE")
        return {
            "status": "SKIPPED",
            "reason": "Destructive operation blocked by SAFE_MODE",
            "method": method,
            "endpoint": endpoint
        }
    else:
        # Execute the test normally
        return execute_test(method, endpoint, data)
```

### 2. Test Data Approach

Instead of testing with real data, create test data that can be safely manipulated:

```python
# Test data configuration
TEST_DATA = {
    "sabnzbd": {
        "test_nzo_ids": ["test_nzo_1", "test_nzo_2", "test_nzo_3"],
        "safe_categories": ["test", "demo", "sample"]
    },
    "sonarr": {
        "test_series_ids": [99999, 99998, 99997],  # IDs that don't exist in production
        "test_episode_ids": [99999, 99998, 99997]
    }
}

def get_test_id(service, entity_type):
    """Get a safe test ID that won't affect production data"""
    return TEST_DATA.get(service, {}).get(f"test_{entity_type}_ids", [999999])[0]
```

### 3. Mock Response Approach

For DELETE operations, return mock responses instead of executing them:

```python
def mock_destructive_response(method, endpoint):
    """Generate a mock response for destructive operations"""
    if method == "DELETE":
        return {
            "status_code": 200,
            "body": json.dumps({
                "message": "DELETE operation mocked for safety",
                "endpoint": endpoint,
                "method": method,
                "timestamp": datetime.now().isoformat()
            })
        }
    
    # Add other destructive operations as needed
    return None
```

## Updated Test Plans

### 1. Enhanced Smoke Test Script Modifications

```python
# In enhanced_api_smoke_test.py
class SafeAPITester:
    def __init__(self, base_url, config_file, safe_mode=True, timeout=10, concurrency=8):
        self.base_url = base_url
        self.config_file = config_file
        self.safe_mode = safe_mode
        self.timeout = timeout
        self.concurrency = concurrency
        self.http_client = HTTPClient(base_url, timeout)
        self.validator = ResponseValidator()
        self.report_generator = ReportGenerator()
    
    def run_test(self, service_name, endpoint_config, test_config):
        """Run a single test case with safety checks"""
        start_time = time.time()
        
        # Check if this is a destructive operation
        if self.safe_mode and self.is_destructive_operation(endpoint_config['method'], endpoint_config['path']):
            # Return a mock result for destructive operations
            elapsed_ms = int((time.time() - start_time) * 1000)
            return TestResult(
                service=service_name,
                endpoint=endpoint_config['path'],
                method=endpoint_config['method'],
                test_name=test_config['name'],
                status="SKIPPED",
                http_status=None,
                error_message="Destructive operation skipped in safe mode",
                elapsed_ms=elapsed_ms,
                request_body=None,
                response_body='{"message": "Operation skipped for safety"}',
                validation_results={}
            )
        
        # Proceed with normal test execution for non-destructive operations
        # ... (rest of the original implementation)
    
    def is_destructive_operation(self, method, path):
        """Check if an operation is destructive"""
        if method.upper() == "DELETE":
            return True
        
        # Check for specific destructive patterns
        destructive_patterns = [
            "/queue/pause",
            "/queue/resume",
            "/delete",
            "/remove"
        ]
        
        return any(pattern in path.lower() for pattern in destructive_patterns)
```

### 2. Updated Endpoint Configuration

```json
{
  "sabnzbd": {
    "endpoints": [
      {
        "name": "Delete Queue Item",
        "path": "/api/sabnzbd/queue/{nzoId}",
        "method": "DELETE",
        "description": "Delete specific item from queue",
        "destructive": true,
        "safe_mode": "mock",
        "tests": [
          {
            "name": "Delete queue item",
            "path_params": {"nzoId": "test_nzo_123"},
            "expected": {
              "status_code": 200,
              "mock_response": true
            }
          }
        ]
      }
    ]
  }
}
```

### 3. Updated Error Handling Tests

```python
class SafeErrorTestRunner:
    def __init__(self, base_url, config_file, safe_mode=True):
        self.base_url = base_url
        self.config = self.load_config(config_file)
        self.safe_mode = safe_mode
        self.test_results = []
    
    def run_destructive_test(self, test_case):
        """Run a destructive test with safety checks"""
        if self.safe_mode:
            # Return a mock result instead of executing
            return {
                "test_name": test_case['name'],
                "status": "SKIPPED",
                "reason": "Destructive test skipped in safe mode",
                "expected_response": test_case['expected_response'],
                "actual_response": {
                    "status_code": 200,
                    "body": '{"message": "Destructive operation mocked for safety"}'
                }
            }
        else:
            # Execute the actual test
            return self.execute_test(test_case)
```

## Safe Testing Best Practices

### 1. Always Use Safe Mode
- Default SAFE_MODE to True in all configurations
- Only disable SAFE_MODE in dedicated test environments
- Document clearly when SAFE_MODE is disabled

### 2. Use Test Data
- Create dedicated test data that doesn't overlap with production data
- Use clearly identifiable test IDs (e.g., 99999, 99998)
- Clean up test data after testing when possible

### 3. Log All Operations
- Log all API calls, especially destructive ones
- Include timestamps and user information
- Maintain audit trails for all operations

### 4. Implement Review Process
- Require review before disabling SAFE_MODE
- Document when and why SAFE_MODE was disabled
- Have rollback procedures ready

### 5. Use Read-Only Operations First
- Test GET endpoints first to understand the data structure
- Use the data to inform safe testing of other operations
- Verify that test data doesn't overlap with real data

## Implementation Timeline

### Week 1: Safety Implementation
- Day 1: Implement SAFE_MODE flag in test scripts
- Day 2: Add destructive operation detection
- Day 3: Implement mock responses for destructive operations
- Day 4: Update test configurations
- Day 5: Test safety mechanisms

### Week 2: Test Data Setup
- Day 1-2: Create test data configuration
- Day 3-4: Implement test ID generation
- Day 5: Verify test data safety

### Week 3: Documentation and Review
- Day 1-2: Update documentation
- Day 3-4: Review safety implementation
- Day 5: Finalize safety guidelines

## Success Criteria

1. **Data Protection**: No production data is accidentally deleted or modified
2. **Test Coverage**: All endpoints are tested, including destructive ones (via mocking)
3. **Clear Documentation**: Safety procedures are clearly documented
4. **Audit Trail**: All operations are logged and traceable
5. **Flexibility**: Easy to enable full testing when test environment is available

## Emergency Procedures

If accidental data deletion occurs:

1. **Immediate Action**: Stop all testing processes
2. **Assessment**: Determine what data was affected
3. **Recovery**: Restore from backups if available
4. **Investigation**: Determine how the safety measures failed
5. **Prevention**: Update safety measures to prevent recurrence

This safe testing approach ensures that we can thoroughly test all API endpoints without risking data loss in production or development environments.