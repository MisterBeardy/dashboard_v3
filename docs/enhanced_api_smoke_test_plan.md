# Enhanced API Smoke Test Plan

## Overview

This document outlines an enhanced version of the API smoke test script that will comprehensively test all discovered endpoints in the dashboard application. The enhanced script will support:

1. All endpoints discovered in the codebase analysis
2. Different HTTP methods (GET, POST, PUT, DELETE)
3. Request bodies and parameters
4. Better error reporting and documentation

## Enhanced Script Features

### 1. Comprehensive Endpoint Coverage

The enhanced script will test all endpoints discovered in our analysis:

#### SABnzbd Endpoints (15 endpoints)
- Core endpoints: `/api/sabnzbd`, `/api/sabnzbd/queue`, `/api/sabnzbd/history`, `/api/sabnzbd/categories`, `/api/sabnzbd/config`, `/api/sabnzbd/server-stats`
- Queue management: `/api/sabnzbd/queue/pause`, `/api/sabnzbd/queue/resume`, `/api/sabnzbd/queue/[nzoId]`, `/api/sabnzbd/queue/[nzoId]/pause`, `/api/sabnzbd/queue/[nzoId]/resume`, `/api/sabnzbd/queue/[nzoId]/priority`, `/api/sabnzbd/queue/[nzoId]/category`
- Add content: `/api/sabnzbd/addfile`, `/api/sabnzbd/addurl`

#### Sonarr Endpoints (18 endpoints)
- Core endpoints: `/api/sonarr/series`, `/api/sonarr/series/[id]`, `/api/sonarr/calendar`, `/api/sonarr/queue`, `/api/sonarr/wanted/missing`, `/api/sonarr/history`
- System endpoints: `/api/sonarr/system/status`, `/api/sonarr/system/task`, `/api/sonarr/health`, `/api/sonarr/diskspace`, `/api/sonarr/update`
- Configuration endpoints: `/api/sonarr/languageprofile`, `/api/sonarr/qualityprofile`, `/api/sonarr/rootfolder`
- Command endpoints: `/api/sonarr/command`
- Episode management: `/api/sonarr/episode/[id]`
- Queue management: `/api/sonarr/queue/[id]`
- Series lookup: `/api/sonarr/series/lookup`

#### Radarr Endpoints (11 endpoints)
- Core endpoints: `/api/radarr/movie`, `/api/radarr/queue`, `/api/radarr/history`, `/api/radarr/qualityprofile`, `/api/radarr/rootfolder`
- System endpoints: `/api/radarr/system/status`, `/api/radarr/health`
- Movie management: `/api/radarr/movie/{id}`, `/api/radarr/movie/lookup`
- Command endpoints: `/api/radarr/command`

#### Prowlarr Endpoints (9 endpoints)
- Core endpoints: `/api/prowlarr/indexer`, `/api/prowlarr/application`
- Indexer management: `/api/prowlarr/indexer/{id}`, `/api/prowlarr/indexer/{id}/test`
- Application management: `/api/prowlarr/application/{id}`
- System endpoints: `/api/prowlarr/system/status`, `/api/prowlarr/health`

#### Readarr Ebook Endpoints (12 endpoints)
- Core endpoints: `/api/readarr/book`, `/api/readarr/author`, `/api/readarr/queue`, `/api/readarr/history`
- Book management: `/api/readarr/book/{id}`, `/api/readarr/book/lookup`
- Author management: `/api/readarr/author/{id}`
- System endpoints: `/api/readarr/system/status`, `/api/readarr/health`
- Wanted books: `/api/readarr/wanted/missing`
- Command endpoints: `/api/readarr/command`

#### Readarr Audiobooks Endpoints (12 endpoints)
- Core endpoints: `/api/readarr-audiobooks/book`, `/api/readarr-audiobooks/author`, `/api/readarr-audiobooks/queue`, `/api/readarr-audiobooks/history`
- Audiobook management: `/api/readarr-audiobooks/book/{id}`, `/api/readarr-audiobooks/book/lookup`
- Author management: `/api/readarr-audiobooks/author/{id}`
- System endpoints: `/api/readarr-audiobooks/system/status`, `/api/readarr-audiobooks/health`
- Wanted audiobooks: `/api/readarr-audiobooks/wanted/missing`
- Command endpoints: `/api/readarr-audiobooks/command`

### 2. HTTP Method Support

The enhanced script will support testing with different HTTP methods:

- **GET**: For data retrieval endpoints
- **POST**: For creating resources or executing commands
- **PUT**: For updating resources
- **DELETE**: For removing resources

### 3. Request Body and Parameter Support

The script will support:

- Query parameters for GET requests
- JSON request bodies for POST/PUT requests
- Path parameters (like `[nzoId]` and `[id]`)
- Form data for file uploads

### 4. Enhanced Error Reporting

The script will provide detailed error reporting including:

- HTTP status codes
- Response bodies (when available)
- Request details (method, URL, headers, body)
- Timing information
- Error categorization (network errors, HTTP errors, parsing errors)

## Implementation Plan

### 1. Endpoint Configuration Structure

```python
ENDPOINT_CONFIGS = [
    # SABnzbd endpoints
    {
        "path": "/api/sabnzbd",
        "method": "GET",
        "description": "Generic proxy endpoint for SABnzbd API"
    },
    {
        "path": "/api/sabnzbd/queue",
        "method": "GET",
        "description": "Get download queue information"
    },
    {
        "path": "/api/sabnzbd/queue/pause",
        "method": "POST",
        "description": "Pause entire queue",
        "body": {}
    },
    {
        "path": "/api/sabnzbd/queue/resume",
        "method": "POST",
        "description": "Resume entire queue",
        "body": {}
    },
    {
        "path": "/api/sabnzbd/queue/{nzoId}",
        "method": "DELETE",
        "description": "Delete specific item from queue",
        "path_params": ["nzoId"]
    },
    # ... more endpoints
]
```

### 2. Test Execution Flow

1. **Load Configuration**: Load endpoint configurations from a JSON file or embedded configuration
2. **Prepare Tests**: For each endpoint, prepare the request with appropriate method, headers, and body
3. **Execute Requests**: Send requests to the server with proper error handling
4. **Collect Results**: Gather response data, timing information, and error details
5. **Generate Report**: Create a comprehensive report of test results

### 3. Enhanced Test Result Structure

```python
@dataclass
class EnhancedTestResult:
    endpoint: str
    method: str
    status: str  # "PASS" or "FAIL"
    http_status: Optional[int]
    error_message: Optional[str]
    elapsed_ms: int
    request_body: Optional[str]
    response_body: Optional[str]
    error_category: Optional[str]  # "network", "http", "parse", "timeout"
    description: str
```

### 4. Sample Endpoint Tests

#### SABnzbd Queue Management Tests

```python
# Test pause queue
{
    "path": "/api/sabnzbd/queue/pause",
    "method": "POST",
    "description": "Pause entire download queue",
    "body": {},
    "expected_status": 200
}

# Test delete item
{
    "path": "/api/sabnzbd/queue/{nzoId}",
    "method": "DELETE",
    "description": "Delete specific item from queue",
    "path_params": ["nzoId"],
    "expected_status": 200
}
```

#### Sonarr Series Management Tests

```python
# Test get series
{
    "path": "/api/sonarr/series",
    "method": "GET",
    "description": "Get all series",
    "expected_status": 200
}

# Test toggle monitoring
{
    "path": "/api/sonarr/series/{id}",
    "method": "PUT",
    "description": "Update series monitoring status",
    "path_params": ["id"],
    "body": {"monitored": True},
    "expected_status": 200
}
```

### 5. Command Line Interface Enhancements

The enhanced script will support additional command line options:

```bash
python3 scripts/enhanced_api_smoke_test.py \
    --base http://localhost:3000 \
    --timeout 10 \
    --concurrency 8 \
    --methods GET,POST,PUT,DELETE \
    --services sabnzbd,sonarr \
    --report-format json \
    --output-file results.json
```

### 6. Report Generation

The script will generate reports in multiple formats:

- **Console Output**: Human-readable test results with color coding
- **JSON Output**: Machine-readable results for CI/CD integration
- **HTML Report**: Detailed interactive report with filtering and sorting

## Test Scenarios

### 1. Basic Connectivity Tests

- Test all GET endpoints without parameters
- Verify HTTP 200 OK responses
- Check response format (JSON)

### 2. Parameterized Tests

- Test endpoints with path parameters (e.g., `/api/sabnzbd/queue/{nzoId}`)
- Test endpoints with query parameters (e.g., `/api/sonarr/series/lookup?term=Star`)
- Test endpoints with request bodies (e.g., POST/PUT requests)

### 3. Error Handling Tests

- Test with invalid path parameters
- Test with malformed request bodies
- Test with missing required parameters
- Test with invalid HTTP methods

### 4. Performance Tests

- Measure response times for all endpoints
- Identify slow endpoints
- Test with concurrent requests

## Implementation Steps

1. **Enhance the existing script** to support multiple HTTP methods
2. **Add endpoint configuration** for all discovered endpoints
3. **Implement parameter substitution** for path parameters
4. **Add request body handling** for POST/PUT requests
5. **Enhance error reporting** with detailed error information
6. **Add report generation** in multiple formats
7. **Create comprehensive documentation** for the enhanced script

## Expected Outcomes

1. **Comprehensive Test Coverage**: All API endpoints will be tested
2. **Detailed Error Reporting**: Clear identification of failing endpoints and reasons
3. **Performance Metrics**: Response time data for all endpoints
4. **Actionable Insights**: Recommendations for fixing broken endpoints
5. **Automation Ready**: Script can be integrated into CI/CD pipelines

## Next Steps

1. Implement the enhanced smoke test script based on this plan
2. Run the script against the development environment
3. Analyze the results and identify issues
4. Create a detailed report of findings
5. Provide recommendations for fixing broken endpoints