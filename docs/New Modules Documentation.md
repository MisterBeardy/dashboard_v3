# New Modules Documentation

This document provides information about the new modules added to the dashboard: Radarr, Prowlarr, Readarr Ebook, and Readarr Audiobooks.

## Overview

The dashboard has been extended to include four new modules that integrate with the *arr suite of media management tools:

1. **Radarr** - Movie collection and management
2. **Prowlarr** - Indexer management and proxy
3. **Readarr Ebook** - Ebook collection and management
4. **Readarr Audiobooks** - Audiobook collection and management

## Module Features

### Radarr

Radarr is a movie collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new movies and will interface with clients and indexers to grab, sort, and rename them.

**Features:**
- Movie discovery and management
- Quality profile configuration
- Wanted movies tracking
- Download queue monitoring
- System status monitoring
- Health checks

**API Endpoints:**
- `/api/radarr/movie` - Movie management
- `/api/radarr/wanted/missing` - Missing movies
- `/api/radarr/queue` - Download queue
- `/api/radarr/command` - Command execution
- `/api/radarr/health` - Health checks
- `/api/radarr/system/status` - System status

### Prowlarr

Prowlarr is an indexer manager/proxy built on the popular *arr .net/reactjs base stack to integrate with your various PVR apps. Prowlarr supports both Torrent Trackers and Usenet Indexers.

**Features:**
- Indexer management
- Application synchronization
- Download client configuration
- System status monitoring
- Health checks

**API Endpoints:**
- `/api/prowlarr/indexer` - Indexer management
- `/api/prowlarr/application` - Application sync
- `/api/prowlarr/downloadclient` - Download client management
- `/api/prowlarr/health` - Health checks
- `/api/prowlarr/system/status` - System status

### Readarr Ebook

Readarr is an ebook and comic book collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new books from your favorite authors and will interface with clients and indexers to grab, sort, and rename them.

**Features:**
- Author management
- Book discovery and management
- Wanted books tracking
- Download queue monitoring
- System status monitoring
- Health checks

**API Endpoints:**
- `/api/readarr/author` - Author management
- `/api/readarr/book` - Book management
- `/api/readarr/wanted/missing` - Missing books
- `/api/readarr/queue` - Download queue
- `/api/readarr/command` - Command execution
- `/api/readarr/health` - Health checks
- `/api/readarr/system/status` - System status

### Readarr Audiobooks

Readarr Audiobooks is a specialized version of Readarr focused on audiobook collection and management. It shares the same core functionality as Readarr Ebook but is specifically tailored for audiobooks.

**Features:**
- Author management
- Audiobook discovery and management
- Wanted audiobooks tracking
- Download queue monitoring
- System status monitoring
- Health checks

**API Endpoints:**
- `/api/readarr-audiobooks/author` - Author management
- `/api/readarr-audiobooks/book` - Audiobook management
- `/api/readarr-audiobooks/wanted/missing` - Missing audiobooks
- `/api/readarr-audiobooks/queue` - Download queue
- `/api/readarr-audiobooks/command` - Command execution
- `/api/readarr-audiobooks/health` - Health checks
- `/api/readarr-audiobooks/system/status` - System status

## Configuration

### Environment Variables

Each module requires specific environment variables to be configured. The variables follow a pattern based on the service name and whether you're using local or remote mode.

#### Local Mode

For local mode (default), each service requires a base URL and API key:

```
# Radarr
LOCAL_RADARR_BASE_URL=http://localhost:7878
LOCAL_RADARR_API_KEY=your_api_key_here
LOCAL_RADARR_URL_BASE=/radarr (optional)

# Prowlarr
LOCAL_PROWLARR_BASE_URL=http://localhost:9696
LOCAL_PROWLARR_API_KEY=your_api_key_here
LOCAL_PROWLARR_URL_BASE=/prowlarr (optional)

# Readarr Ebook
LOCAL_READARR_BASE_URL=http://localhost:8787
LOCAL_READARR_API_KEY=your_api_key_here
LOCAL_READARR_URL_BASE=/readarr (optional)

# Readarr Audiobooks
LOCAL_READARR_AUDIOBOOKS_BASE_URL=http://localhost:8788
LOCAL_READARR_AUDIOBOOKS_API_KEY=your_api_key_here
LOCAL_READARR_AUDIOBOOKS_URL_BASE=/readarr-audiobooks (optional)
```

#### Remote Mode

For remote mode, each service requires a base URL but no API key:

```
BACKEND_TARGET=remote

# Radarr
REMOTE_RADARR_BASE_URL=http://radarr.example.com
REMOTE_RADARR_URL_BASE=/radarr (optional)

# Prowlarr
REMOTE_PROWLARR_BASE_URL=http://prowlarr.example.com
REMOTE_PROWLARR_URL_BASE=/prowlarr (optional)

# Readarr Ebook
REMOTE_READARR_BASE_URL=http://readarr.example.com
REMOTE_READARR_URL_BASE=/readarr (optional)

# Readarr Audiobooks
REMOTE_READARR_AUDIOBOOKS_BASE_URL=http://readarr-audiobooks.example.com
REMOTE_READARR_AUDIOBOOKS_URL_BASE=/readarr-audiobooks (optional)

# Optional: Traefik bypass headers for remote mode
REMOTE_TRAEFIK_BYPASS_HEADER=X-Forwarded-User
REMOTE_TRAEFIK_BYPASS_KEY=your_bypass_key_here
```

### Dashboard Configuration

The new modules can be enabled or disabled through the dashboard settings:

1. Navigate to the dashboard
2. Click on the settings icon
3. Scroll to the "Module Settings" section
4. Toggle the switches for each module to enable or disable them

The dashboard will remember your preferences and only show enabled modules in the navigation and main dashboard view.

## Usage

### Navigation

Each module has its own dedicated page accessible through the sidebar navigation:

- **Radarr** - Film icon
- **Prowlarr** - Radio icon
- **Readarr Ebook** - BookOpen icon
- **Readarr Audiobooks** - Headphones icon

### Main Dashboard

The main dashboard provides an overview of all enabled modules with status cards showing:

- Service status (online/offline)
- Current activity (queue length)
- Wanted items count
- System health

### Module-Specific Dashboards

Each module has its own dashboard with detailed information:

1. **Radarr Dashboard**
   - Movie statistics
   - Download queue
   - Missing movies
   - System status

2. **Prowlarr Dashboard**
   - Indexer statistics
   - Application sync status
   - System health

3. **Readarr Ebook Dashboard**
   - Author statistics
   - Book library overview
   - Download queue
   - Missing books

4. **Readarr Audiobooks Dashboard**
   - Author statistics
   - Audiobook library overview
   - Download queue
   - Missing audiobooks

### Settings

Each module has its own settings page where you can:

- View current configuration
- Test connectivity
- Refresh data
- Configure module-specific options

## API Architecture

The dashboard uses a proxy-based API architecture to communicate with the *arr services. This approach provides several benefits:

1. **Security** - API keys are stored server-side and never exposed to the client
2. **CORS** - Handles cross-origin requests transparently
3. **Caching** - Reduces load on the *arr services
4. **Error Handling** - Provides consistent error messages and status codes

### API Versioning

Different *arr services use different API versions:

- **Radarr** - API v3
- **Sonarr** - API v3
- **Prowlarr** - API v1
- **Readarr** - API v1

The dashboard automatically handles the appropriate API version for each service.

## Troubleshooting

### Common Issues

1. **Service Not Configured**
   - Error: "Service is not configured"
   - Solution: Check environment variables and ensure they are correctly set

2. **Connection Failed**
   - Error: "Upstream request failed"
   - Solution: Verify the service is running and accessible at the configured URL

3. **Invalid API Key**
   - Error: "Unauthorized" or "401"
   - Solution: Verify the API key is correct and has sufficient permissions

4. **CORS Errors**
   - Error: "CORS policy blocked request"
   - Solution: Ensure the service is configured to allow requests from the dashboard domain

### Debugging

To debug issues with the new modules:

1. Check the browser console for JavaScript errors
2. Check the network tab for failed API requests
3. Verify the service logs for any errors
4. Test the API endpoints directly using curl or a similar tool

Example curl command to test an endpoint:

```bash
curl -H "X-Api-Key: your_api_key" http://localhost:7878/api/v3/movie
```

## Future Enhancements

Potential future enhancements for the new modules:

1. **Advanced Filtering** - More sophisticated filtering options for movies, books, and audiobooks
2. **Batch Operations** - Ability to perform actions on multiple items at once
3. **Custom Notifications** - Configurable notifications for specific events
4. **Integration with Other Services** - Connect with additional media management tools
5. **Mobile App** - Native mobile application for on-the-go management
6. **Analytics Dashboard** - Detailed analytics and reporting features

## Support

For support with the new modules:

1. Check the existing documentation
2. Review the troubleshooting section
3. Check the GitHub issues for known problems
4. Create a new issue if you encounter a bug
5. Contact the development team for assistance