# API Testing Tools

This directory contains comprehensive testing tools for the dashboard application API endpoints. These tools help identify issues, test functionality, and provide recommendations for fixing problems.

## Overview

The testing suite includes:

1. **Enhanced Smoke Test Script** (`enhanced_api_smoke_test.py`) - Comprehensive endpoint testing with safety features
2. **Endpoint Configuration** (`test_config/endpoints.json`) - Configuration for all API endpoints
3. **Results Analyzer** (`analyze_results.py`) - Analyzes test results and generates recommendations

## Quick Start

### 1. Run Basic Tests

```bash
# Run tests against a running server
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000

# Run tests with custom configuration
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --config-file scripts/test_config/endpoints.json

# Run tests with custom output directory
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --output-dir custom_reports
```

### 2. Analyze Results

```bash
# Analyze test results and generate recommendations
python3 scripts/analyze_results.py test_reports/json/test_report_YYYY-MM-DDTHH-MM-SS.json

# Analyze with custom output directory
python3 scripts/analyze_results.py test_reports/json/test_report_YYYY-MM-DDTHH-MM-SS.json --output-dir custom_analysis
```

## Detailed Usage

### Enhanced Smoke Test Script

The enhanced smoke test script provides comprehensive testing of all API endpoints with safety features to prevent accidental data loss.

#### Features

- **Multi-method Support**: Tests GET, POST, PUT, DELETE endpoints
- **Safety Mode**: Prevents destructive operations in production environments
- **Comprehensive Reporting**: Generates console, JSON, and HTML reports
- **Concurrent Testing**: Runs tests in parallel for efficiency
- **Auto-start**: Can automatically start the development server if needed
- **Real-time Results**: Shows test results as they execute for immediate feedback

#### Command Line Options

```bash
python3 scripts/enhanced_api_smoke_test.py [OPTIONS]

Required:
  --base BASE_URL         Base URL of the running app (e.g., http://localhost:3000)

Optional:
  --timeout SECONDS       Request timeout in seconds (default: 10)
  --concurrency NUMBER    Number of parallel workers (default: 8)
  --safe-mode             Enable safe mode for destructive operations (default: True)
  --config-file FILE      JSON file with endpoint configurations
  --output-dir DIR        Output directory for reports (default: test_reports)
  --dev-cmd COMMAND       Command to start dev server (default: "pnpm dev -p {port}")
  --start-timeout SECONDS Seconds to wait for server to be ready (default: 90)
  --no-auto-start         Disable auto-starting dev server
```

#### Safety Features

The script includes several safety features to prevent accidental data loss:

1. **Safe Mode**: Enabled by default, prevents destructive operations
2. **Mock Responses**: Destructive operations return mock responses instead of executing
3. **Test Data**: Uses test IDs that don't exist in production
4. **Clear Warnings**: All destructive operations are clearly marked

#### Examples

```bash
# Basic test run
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000

# Test with safe mode disabled (only in test environments)
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --safe-mode=False

# Test with custom timeout and concurrency
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --timeout=15 --concurrency=4

# Test with auto-start disabled
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --no-auto-start
```

### Real-time Testing Output

The script now provides real-time feedback as it tests each endpoint:

```
Running 21 endpoint checks against http://localhost:3000...
Safe mode: Enabled

Testing endpoints:
--------------------------------------------------------------------------------
✅ sabnzbd    GET    /api/sabnzbd/queue                       PASS   HTTP 200  45ms
✅ sabnzbd    GET    /api/sabnzbd/history                     PASS   HTTP 200  32ms
✅ sabnzbd    GET    /api/sabnzbd/categories                   PASS   HTTP 200  28ms
❌ sabnzbd    POST   /api/sabnzbd/queue/pause                  FAIL   HTTP 404  15ms (Endpoint not found)
⏭️ sabnzbd    DELETE /api/sabnzbd/queue/{nzoId}               SKIPPED -      [Mocked in safe mode]
✅ sonarr     GET    /api/sonarr/series                        PASS   HTTP 200  67ms
✅ sonarr     GET    /api/sonarr/calendar                      PASS   HTTP 200  52ms
...

================================================================================
Enhanced API Smoke Test Summary
================================================================================
Summary: Total: 21  Passed: 15  Failed: 4  Skipped: 2
================================================================================
```

Each test result shows:
- Status icon (✅ for PASS, ❌ for FAIL, ⏭️ for SKIPPED)
- Service name
- HTTP method
- Endpoint path
- Test status
- HTTP status code
- Response time
- Error message (if any)
- Safety notes (if applicable)

### Endpoint Configuration

The `test_config/endpoints.json` file contains configuration for all API endpoints. This file defines:

- Endpoint paths and methods
- Expected response codes
- Destructive operation flags
- Safety mode behavior
- Test parameters

#### Configuration Structure

```json
{
  "service_name": {
    "endpoints": [
      {
        "name": "Test Name",
        "path": "/api/service/endpoint",
        "method": "GET",
        "description": "Endpoint description",
        "destructive": false,
        "safe_mode": "mock",
        "expected_status": 200,
        "path_params": {"param": "value"},
        "query_params": {"param": "value"},
        "body": {"key": "value"}
      }
    ]
  }
}
```

#### Configuration Options

- **name**: Human-readable name for the test
- **path**: API endpoint path
- **method**: HTTP method (GET, POST, PUT, DELETE)
- **description**: Description of the endpoint
- **destructive**: Whether the operation is destructive (default: false)
- **safe_mode**: How to handle in safe mode ("mock", "skip", "allow")
- **expected_status**: Expected HTTP status code (default: 200)
- **path_params**: Path parameters for the endpoint
- **query_params**: Query parameters for the endpoint
- **body**: Request body for POST/PUT requests

### Results Analyzer

The results analyzer processes test results and generates actionable recommendations for fixing issues.

#### Features

- **Issue Identification**: Automatically identifies issues from test results
- **Prioritization**: Prioritizes issues based on severity and impact
- **Assignment**: Suggests assignees for each issue
- **Effort Estimation**: Estimates effort required to fix each issue
- **Multiple Report Formats**: Generates console, JSON, and HTML reports
- **Fix Script**: Generates a script with suggested fixes

#### Command Line Options

```bash
python3 scripts/analyze_results.py TEST_RESULTS_FILE [OPTIONS]

Required:
  TEST_RESULTS_FILE       Path to test results JSON file

Optional:
  --output-dir DIR        Output directory for reports (default: analysis_reports)
```

#### Examples

```bash
# Analyze test results
python3 scripts/analyze_results.py test_reports/json/test_report_2023-08-09T19-25-20.json

# Analyze with custom output directory
python3 scripts/analyze_results.py test_reports/json/test_report_2023-08-09T19-25-20.json --output-dir custom_analysis
```

## Integration with Development Workflow

### Pre-commit Testing

Add the following to your pre-commit hooks to run tests before each commit:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running API smoke tests..."
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000

if [ $? -ne 0 ]; then
    echo "API tests failed. Please fix issues before committing."
    exit 1
fi

echo "API tests passed. Proceeding with commit."
```

### CI/CD Integration

Add the following to your CI/CD pipeline:

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Start development server
      run: npm run dev &
    
    - name: Wait for server
      run: sleep 30
    
    - name: Run API tests
      run: python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000
    
    - name: Analyze results
      run: python3 scripts/analyze_results.py test_reports/json/*.json
    
    - name: Upload reports
      uses: actions/upload-artifact@v2
      with:
        name: test-reports
        path: test_reports/
```

### Regular Testing Schedule

Set up regular testing to catch issues early:

```bash
# Run tests daily via cron
0 9 * * * cd /path/to/project && python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000

# Weekly comprehensive testing
0 9 * * 0 cd /path/to/project && python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --safe-mode=False
```

## Understanding Test Results

### Test Status Values

- **PASS**: Endpoint responded correctly
- **FAIL**: Endpoint failed or returned unexpected results
- **SKIPPED**: Endpoint was skipped (usually for safety reasons)

### Report Files

#### Console Report
- Human-readable summary displayed in terminal
- Shows pass/fail status for each endpoint
- Includes timing information and error messages

#### JSON Report
- Machine-readable format for automation
- Contains detailed test results and metadata
- Can be processed by other tools

#### HTML Report
- Interactive web-based report
- Includes filtering and sorting capabilities
- Suitable for sharing with team members

### Issue Categories

The analyzer categorizes issues based on severity:

- **Critical**: Server errors (500+) that prevent functionality
- **High**: Client errors (400+) that significantly impact users
- **Medium**: Functional issues that don't completely break functionality
- **Low**: Minor issues with minimal impact

## Troubleshooting

### Common Issues

#### Server Not Running
```
Error: Server not detected at http://localhost:3000
```

**Solution**: Start the development server or use the auto-start feature:
```bash
npm run dev
# or
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --auto-start
```

#### Timeout Errors
```
Error: URLError: timed out
```

**Solution**: Increase the timeout value:
```bash
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --timeout=30
```

#### Permission Errors
```
Error: Permission denied
```

**Solution**: Make sure the script has execute permissions:
```bash
chmod +x scripts/enhanced_api_smoke_test.py
```

#### Configuration File Not Found
```
Error: Configuration file not found
```

**Solution**: Check the file path or use the default configuration:
```bash
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000
```

### Debug Mode

Enable debug mode for more detailed output:

```bash
export DEBUG=1
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000
```

### Log Files

Check log files for detailed error information:

```bash
# View test logs
tail -f test_reports/logs/*.log

# View analysis logs
tail -f analysis_reports/*.log
```

## Contributing

### Adding New Endpoints

1. Update the endpoint configuration file (`test_config/endpoints.json`)
2. Add the new endpoint to the appropriate service section
3. Configure any required parameters or body data
4. Mark destructive operations appropriately
5. Test the configuration by running the smoke test

### Modifying Test Logic

1. Update the appropriate test script
2. Add new validation rules if needed
3. Update documentation
4. Test the changes thoroughly
5. Submit a pull request

### Reporting Issues

If you encounter issues with the testing tools:

1. Check the troubleshooting section
2. Enable debug mode for more information
3. Create an issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Error messages
   - Environment information

## Best Practices

### Safety First

- Always run tests with safe mode enabled in production
- Review destructive operations carefully before disabling safe mode
- Use test environments for comprehensive testing
- Backup data before running tests with safe mode disabled

### Regular Testing

- Run tests before committing changes
- Include tests in CI/CD pipelines
- Schedule regular automated testing
- Monitor test results and trends

### Issue Management

- Prioritize critical and high-severity issues
- Track issues to resolution
- Document fixes and lessons learned
- Update tests to prevent regressions

### Performance Considerations

- Monitor test execution times
- Optimize slow endpoints
- Use appropriate concurrency levels
- Consider performance in production environments

## Support

For additional support:

1. Check the documentation in this README
2. Review the generated reports for detailed information
3. Examine the source code for implementation details
4. Contact the development team for assistance