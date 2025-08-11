# Dashboard API Testing Framework

A comprehensive API testing framework for media management services (Sonarr, Radarr, Prowlarr, Readarr, Readarr_audiobooks, and SABnzbd) with OpenAPI specification support and random media selection capabilities.

## Features

### 🚀 OpenAPI Specification Support
- **Custom OpenAPI endpoints** for all services (Sonarr, Radarr, Prowlarr, Readarr, Readarr_audiobooks)
- **Automatic endpoint discovery** from OpenAPI specifications
- **Service-specific configurations** for tailored testing
- **Mixed API approach** supporting both OpenAPI and command-based APIs

### 🎲 Random Media Selection
- **Fetch first 20 items** from Sonarr, Radarr, Readarr, and Readarr_audiobooks
- **Random selection** from fetched media items
- **Service-specific handling** for different media types (series, movies, books, audiobooks)
- **Integration with test runner** for realistic testing scenarios

### 🧪 Enhanced Testing Capabilities
- **Comprehensive validation** of API responses
- **Safety mechanisms** for destructive operations
- **Concurrent test execution** with configurable concurrency
- **Detailed reporting** with JSON, HTML, and console outputs
- **Automatic analysis** of test failures with suggested fixes

### 🔧 Service Support
- **Sonarr**: TV series management with OpenAPI support
- **Radarr**: Movie management with OpenAPI support
- **Prowlarr**: Indexer management with OpenAPI support
- **Readarr**: Ebook management with OpenAPI support
- **Readarr_audiobooks**: Audiobook management with OpenAPI support
- **SABnzbd**: Usenet download manager with command-based API support

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- pnpm package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd dashboard_v3

# Install dependencies
pnpm install
```

### Running Tests

#### Basic API Testing
```bash
# Run basic API smoke tests
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000
```

#### OpenAPI-Based Testing
```bash
# Run tests with OpenAPI specification support
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --use-openapi
```

#### Testing with Random Selection
```bash
# Run tests with random media selection feature
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --use-openapi --enable-random-selection
```

#### Advanced Configuration
```bash
# Run with custom settings
python3 scripts/enhanced_api_smoke_test.py \
  --base http://localhost:3000 \
  --use-openapi \
  --enable-random-selection \
  --random-selection-limit 20 \
  --concurrency 4 \
  --timeout 15 \
  --safe-mode
```

## API Endpoints

### OpenAPI Specification Endpoints
Each service provides a custom OpenAPI specification endpoint:

- **Sonarr**: `GET /api/sonarr/openapi.json`
- **Radarr**: `GET /api/radarr/openapi.json`
- **Prowlarr**: `GET /api/prowlarr/openapi.json`
- **Readarr**: `GET /api/readarr/openapi.json`
- **Readarr_audiobooks**: `GET /api/readarr-audiobooks/openapi.json`

### Service API Endpoints
The framework automatically discovers and tests endpoints based on OpenAPI specifications:

#### Sonarr Endpoints
- `GET /api/sonarr/series` - Get all series
- `GET /api/sonarr/series/{id}` - Get series by ID
- `GET /api/sonarr/calendar` - Get calendar
- `GET /api/sonarr/queue` - Get queue
- `GET /api/sonarr/history` - Get history
- `GET /api/sonarr/system/status` - Get system status

#### Radarr Endpoints
- `GET /api/radarr/movie` - Get movies
- `GET /api/radarr/movie/{id}` - Get movie by ID
- `GET /api/radarr/movies` - Get all movies
- `GET /api/radarr/queue` - Get queue
- `GET /api/radarr/history` - Get history
- `GET /api/radarr/system/status` - Get system status
- `GET /api/radarr/diskSpace` - Get disk space
- `GET /api/radarr/qualityprofile` - Get quality profiles

#### Prowlarr Endpoints
- `GET /api/prowlarr/indexer` - Get indexers
- `GET /api/prowlarr/indexer/{id}` - Get indexer by ID
- `GET /api/prowlarr/applications` - Get applications
- `GET /api/prowlarr/downloadclient` - Get download clients
- `GET /api/prowlarr/command` - Get commands
- `GET /api/prowlarr/system/status` - Get system status
- `GET /api/prowlarr/health` - Get health status

#### Readarr Endpoints
- `GET /api/readarr/author` - Get authors
- `GET /api/readarr/author/{id}` - Get author by ID
- `GET /api/readarr/book` - Get books
- `GET /api/readarr/book/{id}` - Get book by ID
- `GET /api/readarr/queue` - Get queue
- `GET /api/readarr/history` - Get history
- `GET /api/readarr/wanted/missing` - Get wanted missing
- `GET /api/readarr/system/status` - Get system status
- `GET /api/readarr/qualityprofile` - Get quality profiles
- `GET /api/readarr/metadataprofile` - Get metadata profiles

#### Readarr Audiobooks Endpoints
- `GET /api/readarr-audiobooks/author` - Get authors
- `GET /api/readarr-audiobooks/author/{id}` - Get author by ID
- `GET /api/readarr-audiobooks/book` - Get books
- `GET /api/readarr-audiobooks/book/{id}` - Get book by ID
- `GET /api/readarr-audiobooks/queue` - Get queue
- `GET /api/readarr-audiobooks/history` - Get history
- `GET /api/readarr-audiobooks/wanted/missing` - Get wanted missing
- `GET /api/readarr-audiobooks/system/status` - Get system status
- `GET /api/readarr-audiobooks/qualityprofile` - Get quality profiles
- `GET /api/readarr-audiobooks/metadataprofile` - Get metadata profiles

#### SABnzbd Endpoints (Command-based)
- `GET /api/sabnzbd` - Get SABnzbd info
- `GET /api/sabnzbd/queue` - Get queue
- `GET /api/sabnzbd/history` - Get history
- `GET /api/sabnzbd/categories` - Get categories
- `GET /api/sabnzbd/config` - Get configuration
- `GET /api/sabnzbd/server-stats` - Get server statistics

## Configuration

### Environment Variables
Create a `.env.local` file based on `.env.local.template.md`:

```bash
# Sonarr Configuration
NEXT_PUBLIC_SONARR_URL=http://localhost:8989
SONARR_API_KEY=your-sonarr-api-key

# Radarr Configuration
NEXT_PUBLIC_RADARR_URL=http://localhost:7878
RADARR_API_KEY=your-radarr-api-key

# Prowlarr Configuration
NEXT_PUBLIC_PROWLARR_URL=http://localhost:9696
PROWLARR_API_KEY=your-prowlarr-api-key

# Readarr Configuration
NEXT_PUBLIC_READARR_URL=http://localhost:8787
READARR_API_KEY=your-readarr-api-key

# Readarr Audiobooks Configuration
NEXT_PUBLIC_READARR_AUDIOBOOKS_URL=http://localhost:8788
READARR_AUDIOBOOKS_API_KEY=your-readarr-audiobooks-api-key

# SABnzbd Configuration
NEXT_PUBLIC_SABNZBD_URL=http://localhost:8080
SABNZBD_API_KEY=your-sabnzbd-api-key
```

### Test Configuration
The framework supports both file-based and OpenAPI-based configuration:

#### File-based Configuration
Create a JSON configuration file:
```json
{
  "sonarr": {
    "endpoints": [
      {
        "name": "Get Series",
        "path": "/api/sonarr/series",
        "method": "GET",
        "description": "Get all series",
        "expected_status": 200
      }
    ]
  }
}
```

#### OpenAPI-based Configuration
Use the `--use-openapi` flag to automatically generate configurations from OpenAPI specifications.

## Command Line Options

```bash
python3 scripts/enhanced_api_smoke_test.py --help

usage: enhanced_api_smoke_test.py [-h] --base BASE [--timeout TIMEOUT] 
                                  [--concurrency CONCURRENCY] [--safe-mode]
                                  [--config-file CONFIG_FILE]
                                  [--output-dir OUTPUT_DIR] [--use-openapi]
                                  [--enable-random-selection]
                                  [--random-selection-limit RANDOM_SELECTION_LIMIT]
                                  [--dev-cmd DEV_CMD]
                                  [--start-timeout START_TIMEOUT]
                                  [--no-auto-start]

Enhanced API Smoke Test Runner

options:
  -h, --help            show this help message and exit
  --base BASE           Base URL of the running app (e.g., http://localhost:3000)
  --timeout TIMEOUT     Request timeout in seconds (default: 10)
  --concurrency CONCURRENCY
                        Number of parallel workers (default: 8)
  --safe-mode           Enable safe mode for destructive operations
  --config-file CONFIG_FILE
                        JSON file with endpoint configurations
  --output-dir OUTPUT_DIR
                        Output directory for reports
  --use-openapi         Use OpenAPI specifications to discover endpoints
  --enable-random-selection
                        Enable random media selection feature
  --random-selection-limit RANDOM_SELECTION_LIMIT
                        Number of items to fetch for random selection (default: 20)
  --dev-cmd DEV_CMD     Command to start the Next.js dev server
  --start-timeout START_TIMEOUT
                        Seconds to wait for the server to be ready when auto-starting
  --no-auto-start       Disable auto-starting the dev server
```

## Test Results

### Example Output
```
Running 57 endpoint checks against http://localhost:3000...
Safe mode: Enabled

Testing endpoints:
--------------------------------------------------------------------------------
✅ sonarr     GET    /api/sonarr/series                       PASS   HTTP 200 790ms
✅ radarr     GET    /api/radarr/movie                        PASS   HTTP 200 5478ms
✅ prowlarr   GET    /api/prowlarr/indexer                    PASS   HTTP 200 27ms
✅ readarr    GET    /api/readarr/author                      PASS   HTTP 200 481ms
✅ readarr_audiobooks GET    /api/readarr-audiobooks/author           PASS   HTTP 200 109ms

Random Selection Results:
==================================================
Sonarr: All of Us Are Dead (ID: 21)
Radarr: 13th (ID: 5562)
Readarr: Dean R. Koontz (ID: 2)
Readarr_audiobooks: Hugh Howey (ID: 17)
==================================================

Enhanced API Smoke Test Summary
================================================================================
Summary: Total: 57  Passed: 40  Failed: 5  Skipped: 12
================================================================================
```

### Report Files
The framework generates detailed reports in multiple formats:

- **JSON Report**: `test_reports/json/test_report_<timestamp>.json`
- **HTML Report**: `test_reports/html/test_report_<timestamp>.html`
- **Analysis Report**: `analysis_reports/issue_analysis_<timestamp>.json`

## Architecture

### Core Components

#### EnhancedOpenAPIFetcher
- Fetches OpenAPI specifications from services
- Generates endpoint configurations from specifications
- Handles service-specific configurations

#### MediaRandomSelector
- Fetches media items from services
- Implements random selection algorithms
- Provides formatted item information

#### MediaRandomSelectorManager
- Manages random selection across multiple services
- Coordinates concurrent requests
- Provides unified interface for random selection

#### ResponseValidator
- Validates API responses against expectations
- Supports multiple validation types (status code, JSON format, response time)
- Provides detailed validation results

### Class Diagram
```
EnhancedAPITester
├── HTTPClient
├── EnhancedOpenAPIFetcher
│   ├── Service-specific configurations
│   └── OpenAPI specification handling
├── MediaRandomSelectorManager
│   ├── MediaRandomSelector (per service)
│   └── Random selection algorithms
├── ResponseValidator
│   ├── Status code validation
│   ├── JSON format validation
│   └── Response time validation
└── ReportGenerator
    ├── Console reports
    ├── JSON reports
    └── HTML reports
```

## Development

### Project Structure
```
dashboard_v3/
├── app/                          # Next.js application
│   └── api/                      # API routes
├── components/                   # React components
├── docs/                         # Documentation
├── lib/                          # Utility libraries
├── scripts/                      # Testing scripts
│   ├── enhanced_api_smoke_test.py
│   └── analyze_results.py
├── styles/                       # CSS styles
└── test_reports/                 # Test results
```

### Adding New Services
1. Create API routes in `app/api/{service_name}/`
2. Add OpenAPI specification endpoint
3. Update service configurations in `enhanced_api_smoke_test.py`
4. Add service to `MediaRandomSelector` if applicable

### Running Development Server
```bash
# Start development server
pnpm dev

# Run tests in parallel
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --use-openapi --enable-random-selection
```

## Troubleshooting

### Common Issues

#### OpenAPI Specification Not Found
Ensure that the OpenAPI specification endpoints are properly implemented:
```bash
curl http://localhost:3000/api/sonarr/openapi.json
```

#### Random Selection Fails
Check that services have media items available:
```bash
curl http://localhost:3000/api/sonarr/series?pageSize=1
```

#### SABnzbd HTTP 405 Errors
SABnzbd uses a command-based API that may return HTTP 405 for GET requests to certain endpoints. This is expected behavior.

#### Next.js Dynamic Parameter Issues
Ensure that dynamic parameters are properly awaited in Next.js routes:
```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ... rest of the code
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details on changes to the project.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` directory
- Review the test reports for detailed error information