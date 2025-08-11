# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [[0.0.3] - 2025-08-011

### Added
- OpenAPI specification endpoints for all services (Sonarr, Radarr, Prowlarr, Readarr, Readarr_audiobooks)
- Enhanced API testing with OpenAPI specification support
- Random media selection feature for Sonarr, Radarr, Readarr, and Readarr_audiobooks
- Mixed OpenAPI and command-based API testing approach
- Dynamic parameter handling for Next.js routes
- Enhanced API smoke test script with comprehensive validation
- Automatic test analysis and issue reporting
- System status monitoring functionality to Sonarr dashboard
- System Status tab to the Sonarr dashboard interface
- Health monitoring API methods to lib/api/sonarr.ts:
  - getSystemStatus()
  - getSystemHealth()
  - getDiskSpace()
  - getSystemTasks()
  - getUpdateInfo()
- System status data to hooks/use-sonarr.ts
- System status display components to components/sonarr-dashboard.tsx:
  - System Status card showing version, build time, runtime, OS info
  - System Health card showing health status of Sonarr components
  - Disk Space card showing storage information with progress bars
  - Updates card showing available updates for Sonarr
  - System Tasks card showing currently running system tasks
- Helper function formatBytes() for displaying disk space in human-readable format
- New icons for system status: Cpu, Activity, AlertTriangle, Info, Zap

### Changed
- Updated useSonarr hook to include system status data
- Enhanced SonarrDashboard component to display system status information
- Modified TabsList in SonarrDashboard to include new System tab

### Fixed
- TypeScript errors related to missing formatBytes function
- Fixed API routing for Sonarr command endpoints to properly handle /command requests
- Enhanced error handling and logging in Sonarr API route
- Added fallback environment variable access without NEXT_PUBLIC_ prefix for server-side API routes
- Restructured Sonarr API route to follow the same pattern as SABnzbd
- Fixed undefined pathname error in buildUpstreamUrl function
- Added proper X-Api-Key header authentication for Sonarr API requests
- Added missing DELETE and PUT HTTP methods to Sonarr API route
- Corrected command endpoint handling to match Sonarr API documentation
- Simplified API routing to use /api/v3 as the base path for all Sonarr API calls
- Standardized environment variable access to match SABnzbd implementation
- Ensured Traefik bypass headers are properly included in all Sonarr API requests

## [0.0.2] - 2025-08-09

### Added
- Complete Sonarr API integration with comprehensive endpoints
  - Series management (CRUD operations, monitoring, search)
  - Episode management and wanted episodes tracking
  - Calendar view for upcoming episodes
  - Activity monitoring and history
  - System status, health, disk space, and update information
  - Quality profiles, language profiles, and root folders management
- Enhanced SABnzbd API integration with full feature support
  - Queue management with pause, resume, delete, priority, and category controls
  - History viewing with filtering capabilities
  - Server statistics and monitoring
  - Categories management
  - NZB file upload and URL addition
- Advanced dashboard components
  - Sonarr dashboard with table and poster view modes
  - SABnzbd dashboard with queue filtering and history management
  - System status tabs for both modules
  - Statistics and logs viewing
- Settings management system
  - Dashboard settings for section visibility
  - Module-specific settings with display mode preferences
  - Connection mode information display
- API proxy architecture
  - Secure server-side API key handling
  - Traefik bypass support for remote connections
  - CORS avoidance through internal proxy routes
- Development utilities
  - API smoke test script for endpoint validation
  - Comprehensive documentation in docs/config.md

### Changed
- Improved API architecture to use proxy routes instead of direct client connections
- Enhanced error handling and loading states throughout the UI
- Optimized data fetching with automatic refresh intervals
- Standardized component structure and props across modules

### Fixed
- Resolved API connection issues through proxy implementation
- Fixed data type inconsistencies in API responses
- Improved UI responsiveness and loading states
- Corrected tab state persistence between page refreshes

## [0.0.1] - 2025-08-07

### Added
- Initial project setup
- Basic Sonarr dashboard with series management
- SABnzbd integration
- Basic UI components and styling