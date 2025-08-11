# Service Test Plan

## Overview

This document provides a detailed test plan for each service in the dashboard application. The plan covers SABnzbd, Sonarr, and the partially implemented services (Radarr, Prowlarr, Readarr, Readarr Audiobooks).

## Safety Guidelines

**IMPORTANT**: All destructive operations (DELETE requests and certain POST/PUT requests) will be handled with safety measures to prevent accidental data loss. See [`safe_testing_guidelines.md`](safe_testing_guidelines.md) for detailed safety procedures.

### Safety Mode
- **SAFE_MODE = True** (default): Destructive operations are mocked/skipped
- **SAFE_MODE = False**: Only used in dedicated test environments

### Destructive Operations
The following operations are considered destructive and will be handled with safety measures:
- All DELETE requests
- POST requests that modify state (pause/resume operations)
- PUT requests that can delete files or data

### Test Data
- Use test IDs that don't exist in production (e.g., 99999, 99998)
- All destructive tests will use mock responses in SAFE_MODE

## SABnzbd Test Plan

### Service Overview
SABnzbd is a Usenet binary newsreader that downloads NZB files. The dashboard provides management capabilities for downloads, queue, history, and server configuration.

### Test Categories

#### 1. Core Functionality Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Generic Proxy | `/api/sabnzbd` | GET | Test generic proxy endpoint | HTTP 200 OK |
| Queue Information | `/api/sabnzbd/queue` | GET | Get download queue information | HTTP 200 OK, JSON response with queue data |
| History Information | `/api/sabnzbd/history` | GET | Get download history | HTTP 200 OK, JSON response with history data |
| Categories | `/api/sabnzbd/categories` | GET | Get available categories | HTTP 200 OK, JSON response with categories |
| Configuration | `/api/sabnzbd/config` | GET | Get SABnzbd configuration | HTTP 200 OK, JSON response with config |
| Server Stats | `/api/sabnzbd/server-stats` | GET | Get server statistics | HTTP 200 OK, JSON response with stats |

#### 2. Queue Management Tests

| Test Case | Endpoint | Method | Description | Expected Result | Safety Notes |
|-----------|----------|--------|-------------|----------------|--------------|
| Pause Queue | `/api/sabnzbd/queue/pause` | POST | Pause entire download queue | HTTP 200 OK | **DESTRUCTIVE**: Affects user experience. Will be mocked in SAFE_MODE. |
| Resume Queue | `/api/sabnzbd/queue/resume` | POST | Resume entire download queue | HTTP 200 OK | **DESTRUCTIVE**: Affects user experience. Will be mocked in SAFE_MODE. |
| Delete Item | `/api/sabnzbd/queue/{nzoId}` | DELETE | Delete specific item from queue | HTTP 200 OK | **DESTRUCTIVE**: Deletes data. Will use test_nzo_id and mock response in SAFE_MODE. |
| Pause Item | `/api/sabnzbd/queue/{nzoId}/pause` | POST | Pause specific queue item | HTTP 200 OK | **DESTRUCTIVE**: Affects user experience. Will be mocked in SAFE_MODE. |
| Resume Item | `/api/sabnzbd/queue/{nzoId}/resume` | POST | Resume specific queue item | HTTP 200 OK | **DESTRUCTIVE**: Affects user experience. Will be mocked in SAFE_MODE. |
| Set Priority | `/api/sabnzbd/queue/{nzoId}/priority` | POST | Set priority for queue item | HTTP 200 OK | **SAFE**: Non-destructive operation. |
| Set Category | `/api/sabnzbd/queue/{nzoId}/category` | POST | Set category for queue item | HTTP 200 OK | **SAFE**: Non-destructive operation. |

#### 3. Add Content Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Add NZB File | `/api/sabnzbd/addfile` | POST | Add NZB file | HTTP 200 OK |
| Add NZB URL | `/api/sabnzbd/addurl` | POST | Add NZB by URL | HTTP 200 OK |

#### 4. Error Handling Tests

| Test Case | Endpoint | Method | Description | Expected Result | Safety Notes |
|-----------|----------|--------|-------------|----------------|--------------|
| Invalid nzoId | `/api/sabnzbd/queue/invalid` | DELETE | Delete with invalid ID | HTTP 400 or 404 | **DESTRUCTIVE**: Will be mocked in SAFE_MODE. |
| Empty Request | `/api/sabnzbd/queue/pause` | POST | Pause with empty body | HTTP 200 OK | **DESTRUCTIVE**: Will be mocked in SAFE_MODE. |
| Invalid Priority | `/api/sabnzbd/queue/{nzoId}/priority` | POST | Set invalid priority | HTTP 400 | **SAFE**: Non-destructive operation. |
| Invalid Category | `/api/sabnzbd/queue/{nzoId}/category` | POST | Set invalid category | HTTP 400 | **SAFE**: Non-destructive operation. |

#### 5. Performance Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Queue Response Time | `/api/sabnzbd/queue` | GET | Measure response time | < 2 seconds |
| History Response Time | `/api/sabnzbd/history` | GET | Measure response time | < 3 seconds |
| Concurrent Requests | `/api/sabnzbd/queue` | GET | Multiple concurrent requests | All succeed |

### Test Data Requirements

- Valid nzoId for queue operations
- Valid categories for category operations
- Valid priority levels for priority operations
- Test NZB file for file upload
- Valid NZB URL for URL addition

## Sonarr Test Plan

### Service Overview
Sonarr is a PVR for Usenet and BitTorrent users to manage and watch TV series. The dashboard provides management capabilities for series, episodes, calendar, and system configuration.

### Test Categories

#### 1. Core Functionality Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Get Series | `/api/sonarr/series` | GET | Get all series | HTTP 200 OK, JSON response with series data |
| Get Series by ID | `/api/sonarr/series/{id}` | GET | Get specific series | HTTP 200 OK, JSON response with series data |
| Get Calendar | `/api/sonarr/calendar` | GET | Get calendar information | HTTP 200 OK, JSON response with calendar data |
| Get Queue | `/api/sonarr/queue` | GET | Get download queue | HTTP 200 OK, JSON response with queue data |
| Get Missing Episodes | `/api/sonarr/wanted/missing` | GET | Get wanted/missing episodes | HTTP 200 OK, JSON response with missing episodes |
| Get History | `/api/sonarr/history` | GET | Get download history | HTTP 200 OK, JSON response with history data |

#### 2. System Management Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| System Status | `/api/sonarr/system/status` | GET | Get system status | HTTP 200 OK, JSON response with status |
| System Tasks | `/api/sonarr/system/task` | GET | Get system tasks | HTTP 200 OK, JSON response with tasks |
| System Health | `/api/sonarr/health` | GET | Get system health | HTTP 200 OK, JSON response with health data |
| Disk Space | `/api/sonarr/diskspace` | GET | Get disk space information | HTTP 200 OK, JSON response with disk space |
| Update Info | `/api/sonarr/update` | GET | Get update information | HTTP 200 OK, JSON response with update info |

#### 3. Configuration Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Language Profiles | `/api/sonarr/languageprofile` | GET | Get language profiles | HTTP 200 OK, JSON response with profiles |
| Quality Profiles | `/api/sonarr/qualityprofile` | GET | Get quality profiles | HTTP 200 OK, JSON response with profiles |
| Root Folders | `/api/sonarr/rootfolder` | GET | Get root folders | HTTP 200 OK, JSON response with folders |

#### 4. Command Execution Tests

| Test Case | Endpoint | Method | Description | Expected Result | Safety Notes |
|-----------|----------|--------|-------------|----------------|--------------|
| Execute Command | `/api/sonarr/command` | POST | Execute system command | HTTP 200 OK | **CONDITIONAL**: Some commands may trigger file operations. Will be reviewed individually. |
| Search Missing | `/api/sonarr/command` | POST | Search for missing episodes | HTTP 200 OK | **SAFE**: Read-only operation. |
| Season Search | `/api/sonarr/command` | POST | Search for episodes in season | HTTP 200 OK | **SAFE**: Read-only operation. |
| Episode Search | `/api/sonarr/command` | POST | Search for specific episode | HTTP 200 OK | **SAFE**: Read-only operation. |

#### 5. Series Management Tests

| Test Case | Endpoint | Method | Description | Expected Result | Safety Notes |
|-----------|----------|--------|-------------|----------------|--------------|
| Update Series | `/api/sonarr/series/{id}` | PUT | Update series information | HTTP 200 OK | **CONDITIONAL**: May delete files if monitored=false. Will use test_series_id. |
| Update Episode | `/api/sonarr/episode/{id}` | PUT | Update episode information | HTTP 200 OK | **CONDITIONAL**: May delete files if not monitored. Will use test_episode_id. |
| Delete Queue Item | `/api/sonarr/queue/{id}` | DELETE | Delete item from queue | HTTP 200 OK | **DESTRUCTIVE**: Deletes data. Will use test_queue_id and mock response in SAFE_MODE. |
| Lookup Series | `/api/sonarr/series/lookup` | GET | Lookup series by term | HTTP 200 OK, JSON response with results | **SAFE**: Read-only operation. |

#### 6. Error Handling Tests

| Test Case | Endpoint | Method | Description | Expected Result | Safety Notes |
|-----------|----------|--------|-------------|----------------|--------------|
| Invalid Series ID | `/api/sonarr/series/999999` | GET | Get non-existent series | HTTP 404 | **SAFE**: Read-only operation. |
| Invalid Episode ID | `/api/sonarr/episode/999999` | PUT | Update non-existent episode | HTTP 404 | **SAFE**: Uses non-existent test ID. |
| Invalid Command | `/api/sonarr/command` | POST | Execute invalid command | HTTP 400 | **SAFE**: Invalid command won't execute. |
| Empty Search Term | `/api/sonarr/series/lookup` | GET | Lookup with empty term | HTTP 400 | **SAFE**: Read-only operation. |

#### 7. Performance Tests

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Series Response Time | `/api/sonarr/series` | GET | Measure response time | < 3 seconds |
| Calendar Response Time | `/api/sonarr/calendar` | GET | Measure response time | < 2 seconds |
| Concurrent Requests | `/api/sonarr/series` | GET | Multiple concurrent requests | All succeed |

### Test Data Requirements

- Valid series ID for series operations
- Valid episode ID for episode operations
- Valid command names for command execution
- Valid search terms for series lookup
- Valid series data for update operations

## Radarr Test Plan

### Service Overview
Radarr is a movie collection manager for Usenet and BitTorrent users. The dashboard integration is partially implemented and needs to be explored.

### Test Categories (To Be Implemented)

#### 1. Core Functionality Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Generic Proxy | `/api/radarr` | GET | Test generic proxy endpoint | To be determined |
| Movies List | `/api/radarr/movie` | GET | Get movies list | To be determined |
| Queue | `/api/radarr/queue` | GET | Get download queue | To be determined |
| History | `/api/radarr/history` | GET | Get download history | To be determined |

#### 2. Movie Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Add Movie | `/api/radarr/movie` | POST | Add new movie | To be determined |
| Update Movie | `/api/radarr/movie/{id}` | PUT | Update movie information | To be determined |
| Delete Movie | `/api/radarr/movie/{id}` | DELETE | Delete movie | To be determined |
| Search Movie | `/api/radarr/movie/lookup` | GET | Search for movie | To be determined |

#### 3. System Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| System Status | `/api/radarr/system/status` | GET | Get system status | To be determined |
| Disk Space | `/api/radarr/diskspace` | GET | Get disk space | To be determined |
| Health | `/api/radarr/health` | GET | Get system health | To be determined |

## Prowlarr Test Plan

### Service Overview
Prowlarr is an indexer manager/proxy for various PVR applications. The dashboard integration is partially implemented and needs to be explored.

### Test Categories (To Be Implemented)

#### 1. Core Functionality Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Generic Proxy | `/api/prowlarr` | GET | Test generic proxy endpoint | To be determined |
| Indexers | `/api/prowlarr/indexer` | GET | Get indexers list | To be determined |
| Applications | `/api/prowlarr/application` | GET | Get applications | To be determined |

#### 2. Indexer Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Add Indexer | `/api/prowlarr/indexer` | POST | Add new indexer | To be determined |
| Update Indexer | `/api/prowlarr/indexer/{id}` | PUT | Update indexer | To be determined |
| Test Indexer | `/api/prowlarr/indexer/{id}/test` | POST | Test indexer connection | To be determined |

#### 3. System Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| System Status | `/api/prowlarr/system/status` | GET | Get system status | To be determined |
| Health | `/api/prowlarr/health` | GET | Get system health | To be determined |

## Readarr Test Plan

### Service Overview
Readarr is an ebook and comic collection manager for Usenet and BitTorrent users. The dashboard integration is partially implemented and needs to be explored.

### Test Categories (To Be Implemented)

#### 1. Core Functionality Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Generic Proxy | `/api/readarr` | GET | Test generic proxy endpoint | To be determined |
| Books List | `/api/readarr/book` | GET | Get books list | To be determined |
| Authors | `/api/readarr/author` | GET | Get authors list | To be determined |
| Queue | `/api/readarr/queue` | GET | Get download queue | To be determined |

#### 2. Book Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Add Book | `/api/readarr/book` | POST | Add new book | To be determined |
| Update Book | `/api/readarr/book/{id}` | PUT | Update book information | To be determined |
| Search Book | `/api/readarr/book/lookup` | GET | Search for book | To be determined |

#### 3. System Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| System Status | `/api/readarr/system/status` | GET | Get system status | To be determined |
| Health | `/api/readarr/health` | GET | Get system health | To be determined |

## Readarr Audiobooks Test Plan

### Service Overview
Readarr Audiobooks is a specialized version of Readarr for managing audiobook collections. The dashboard integration is partially implemented and needs to be explored.

### Test Categories (To Be Implemented)

#### 1. Core Functionality Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Generic Proxy | `/api/readarr-audiobooks` | GET | Test generic proxy endpoint | To be determined |
| Audiobooks List | `/api/readarr-audiobooks/book` | GET | Get audiobooks list | To be determined |
| Authors | `/api/readarr-audiobooks/author` | GET | Get authors list | To be determined |
| Queue | `/api/readarr-audiobooks/queue` | GET | Get download queue | To be determined |

#### 2. Audiobook Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| Add Audiobook | `/api/readarr-audiobooks/book` | POST | Add new audiobook | To be determined |
| Update Audiobook | `/api/readarr-audiobooks/book/{id}` | PUT | Update audiobook info | To be determined |
| Search Audiobook | `/api/readarr-audiobooks/book/lookup` | GET | Search for audiobook | To be determined |

#### 3. System Management Tests (Exploratory)

| Test Case | Endpoint | Method | Description | Expected Result |
|-----------|----------|--------|-------------|----------------|
| System Status | `/api/readarr-audiobooks/system/status` | GET | Get system status | To be determined |
| Health | `/api/readarr-audiobooks/health` | GET | Get system health | To be determined |

## Test Execution Strategy

### Phase 1: Core Services (SABnzbd and Sonarr)
1. Execute all test cases for SABnzbd
2. Execute all test cases for Sonarr
3. Document any failures or issues
4. Provide recommendations for fixing broken endpoints

### Phase 2: Partially Implemented Services (Radarr, Prowlarr, Readarr, Readarr Audiobooks)
1. Explore available endpoints for each service
2. Create exploratory test cases
3. Execute basic connectivity tests
4. Document findings and limitations

### Phase 3: Integration Tests
1. Test interactions between services
2. Test data consistency across services
3. Test error handling and recovery
4. Test performance under load

### Phase 4: Documentation and Reporting
1. Create comprehensive test reports
2. Document all findings and issues
3. Provide actionable recommendations
4. Create test automation scripts

## Success Criteria

### SABnzbd and Sonarr
- 95% of endpoints should be functional
- All core functionality should work correctly
- Error handling should be robust
- Performance should meet acceptable thresholds

### Partially Implemented Services
- Basic connectivity should be established
- Available endpoints should be documented
- Clear path to full implementation should be identified

### Overall System
- Cross-service integration should work correctly
- Error recovery should be reliable
- Performance should be consistent across services