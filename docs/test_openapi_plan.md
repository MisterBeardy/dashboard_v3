# OpenAPI Specification Testing Plan

## Overview

This document outlines the plan for testing OpenAPI specification fetching functionality for the dashboard application API endpoints. The goal is to verify that OpenAPI specifications can be successfully fetched from Sonarr, Radarr, Prowlarr, and Readarr (including Readarr_audiobooks) services.

## Current OpenAPI Support Analysis

The existing `enhanced_api_smoke_test.py` script already has significant OpenAPI support through the `OpenAPIFetcher` class (lines 329-492) and `get_openapi_endpoint_configs()` method (lines 1369-1537). Key components include:

### OpenAPIFetcher Class
- Fetches OpenAPI specifications from services
- Generates endpoint configurations from OpenAPI specs
- Handles different OpenAPI endpoints automatically
- Implements caching for fetched specifications

### Current OpenAPI Endpoint Discovery
The script tries multiple common OpenAPI endpoints:
- `/openapi.json`
- `/swagger.json`
- `/api/v3/openapi.json`
- `/api/v1/openapi.json`
- `/api/openapi.json`

### Service Support
The `get_openapi_endpoint_configs()` method already supports:
- Sonarr: OpenAPI-based
- Radarr: OpenAPI-based
- Prowlarr: OpenAPI-based
- Readarr: OpenAPI-based
- Readarr_audiobooks: OpenAPI-based
- SABnzbd: Predefined endpoints (command-based)

## Testing Plan

### Step 1: Create a Simple Test Script
- Create a dedicated test script to verify OpenAPI specification fetching
- Test with a running dashboard instance
- Verify that specifications can be fetched from all services

### Step 2: Test with Each Service
Test OpenAPI specification fetching with each service individually:
1. **Sonarr**
   - Expected OpenAPI endpoint: `/api/v3/openapi.json`
   - Verify specification structure and content
   
2. **Radarr**
   - Expected OpenAPI endpoint: `/api/v3/openapi.json`
   - Verify specification structure and content
   
3. **Prowlarr**
   - Expected OpenAPI endpoint: `/api/v1/openapi.json`
   - Verify specification structure and content
   
4. **Readarr**
   - Expected OpenAPI endpoint: `/api/v1/openapi.json`
   - Verify specification structure and content
   
5. **Readarr_audiobooks**
   - Expected OpenAPI endpoint: `/api/v1/openapi.json`
   - Verify specification structure and content

### Step 3: Verify Endpoint Configuration Generation
- Test that endpoint configurations are correctly generated from OpenAPI specs
- Verify that service prefixes are correctly applied
- Check that destructive operations are properly identified

### Step 4: Test with Existing Enhanced Script
- Use the `--use-openapi` flag with the existing `enhanced_api_smoke_test.py` script
- Compare results with predefined endpoint configurations
- Verify that all expected endpoints are discovered and tested

## Expected OpenAPI Specification Structure

Each service should provide an OpenAPI specification with:

### Required Fields
- `openapi`: OpenAPI specification version (e.g., "3.0.0")
- `info`: Information about the API
  - `title`: API title
  - `version`: API version
- `paths`: Available API endpoints and operations
- `servers`: Server URLs (optional)

### Expected Endpoints by Service

#### Sonarr
- `/api/v3/series` - Get all series
- `/api/v3/series/{id}` - Get series by ID
- `/api/v3/calendar` - Get calendar information
- `/api/v3/queue` - Get download queue
- `/api/v3/system/status` - Get system status

#### Radarr
- `/api/v3/movie` - Get all movies
- `/api/v3/movie/{id}` - Get movie by ID
- `/api/v3/queue` - Get download queue
- `/api/v3/history` - Get download history
- `/api/v3/system/status` - Get system status

#### Prowlarr
- `/api/v1/application` - Get applications
- `/api/v1/indexer` - Get indexers
- `/api/v1/downloadclient` - Get download clients
- `/api/v1/system/status` - Get system status

#### Readarr
- `/api/v1/author` - Get authors
- `/api/v1/book` - Get books
- `/api/v1/queue` - Get download queue
- `/api/v1/system/status` - Get system status

#### Readarr_audiobooks
- Same as Readarr but different instance

## Test Script Design

The test script should:

1. **Initialize HTTP Client**
   - Create an HTTP client with the base URL
   - Set appropriate headers and timeout

2. **Test OpenAPI Fetching**
   - Try each OpenAPI endpoint for each service
   - Report success/failure for each attempt
   - Display the first successful endpoint found

3. **Validate OpenAPI Specification**
   - Check for required fields
   - Verify the specification structure
   - Report any issues found

4. **Generate Sample Endpoints**
   - Generate a few sample endpoint configurations
   - Display the generated configurations
   - Verify that service prefixes are correctly applied

5. **Report Results**
   - Summarize success/failure for each service
   - Provide recommendations for any issues found

## Success Criteria

The OpenAPI specification fetching is considered successful if:

1. **All Services Respond**
   - Each service returns a valid OpenAPI specification
   - HTTP status code is 200
   - Response contains valid JSON

2. **Specifications Are Valid**
   - All required OpenAPI fields are present
   - The specification follows OpenAPI 3.0.x structure
   - Paths and operations are properly defined

3. **Endpoint Generation Works**
   - Endpoint configurations are successfully generated
   - Service prefixes are correctly applied
   - Destructive operations are properly identified

## Potential Issues and Mitigation

### Issue 1: OpenAPI Specification Not Available
- **Symptom**: Service returns 404 for all OpenAPI endpoints
- **Mitigation**: Fall back to predefined endpoint configurations
- **Solution**: Document the issue and use manual configuration

### Issue 2: Invalid OpenAPI Specification
- **Symptom**: Service returns JSON that doesn't match OpenAPI structure
- **Mitigation**: Log the issue and skip the service
- **Solution**: Report the issue to service maintainers

### Issue 3: Network or Authentication Issues
- **Symptom**: Cannot connect to the service or receive authentication errors
- **Mitigation**: Check network connectivity and API keys
- **Solution**: Verify service configuration and credentials

### Issue 4: Service-Specific OpenAPI Variations
- **Symptom**: Different services use different OpenAPI structures
- **Mitigation**: Implement service-specific parsing logic
- **Solution**: Add support for multiple OpenAPI versions and structures

## Next Steps

1. Create the test script and run initial tests
2. Analyze results and identify any issues
3. Fix issues found during testing
4. Document the OpenAPI specification endpoints for each service
5. Update the enhanced script with any improvements discovered during testing

## Testing Commands

### Run the Test Script
```bash
python3 scripts/test_openapi_fetch.py --base http://localhost:3000
```

### Test with Enhanced Script
```bash
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --use-openapi
```

### Compare Results
```bash
# Run with predefined endpoints
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 > predefined_results.txt

# Run with OpenAPI
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --use-openapi > openapi_results.txt

# Compare results
diff predefined_results.txt openapi_results.txt
```

This plan provides a comprehensive approach to testing OpenAPI specification fetching for all supported services while maintaining backward compatibility with the existing predefined endpoint configurations.