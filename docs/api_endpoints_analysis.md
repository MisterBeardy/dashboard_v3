# API Endpoints Analysis

## Summary
This document provides a comprehensive analysis of all API endpoints and button actions in the dashboard application. The application currently has working implementations for SABnzbd and Sonarr, with partial implementations for Radarr, Prowlarr, and Readarr.

## SABnzbd API Endpoints

### Core Endpoints
1. **GET /api/sabnzbd**
   - Purpose: Generic proxy endpoint for SABnzbd API
   - Methods: GET, POST
   - Implementation: [`app/api/sabnzbd/route.ts`](app/api/sabnzbd/route.ts)

2. **GET /api/sabnzbd/queue**
   - Purpose: Get download queue information
   - Methods: GET
   - Implementation: [`app/api/sabnzbd/queue/route.ts`](app/api/sabnzbd/queue/route.ts)

3. **GET /api/sabnzbd/history**
   - Purpose: Get download history
   - Methods: GET
   - Implementation: [`app/api/sabnzbd/history/route.ts`](app/api/sabnzbd/history/route.ts)

4. **GET /api/sabnzbd/categories**
   - Purpose: Get available categories
   - Methods: GET
   - Implementation: [`app/api/sabnzbd/categories/route.ts`](app/api/sabnzbd/categories/route.ts)

5. **GET /api/sabnzbd/config**
   - Purpose: Get SABnzbd configuration
   - Methods: GET
   - Implementation: [`app/api/sabnzbd/config/route.ts`](app/api/sabnzbd/config/route.ts)

6. **GET /api/sabnzbd/server-stats**
   - Purpose: Get server statistics
   - Methods: GET
   - Implementation: [`app/api/sabnzbd/server-stats/route.ts`](app/api/sabnzbd/server-stats/route.ts)

### Queue Management Endpoints
7. **POST /api/sabnzbd/queue/pause**
   - Purpose: Pause entire queue
   - Methods: POST
   - Implementation: [`app/api/sabnzbd/queue/pause/route.ts`](app/api/sabnzbd/queue/pause/route.ts)

8. **POST /api/sabnzbd/queue/resume**
   - Purpose: Resume entire queue
   - Methods: POST
   - Implementation: [`app/api/sabnzbd/queue/resume/route.ts`](app/api/sabnzbd/queue/resume/route.ts)

9. **DELETE /api/sabnzbd/queue/[nzoId]**
   - Purpose: Delete specific item from queue
   - Methods: DELETE
   - Implementation: [`app/api/sabnzbd/queue/[nzoId]/route.ts`](app/api/sabnzbd/queue/[nzoId]/route.ts)

10. **POST /api/sabnzbd/queue/[nzoId]/pause**
    - Purpose: Pause specific queue item
    - Methods: POST
    - Implementation: [`app/api/sabnzbd/queue/[nzoId]/pause/route.ts`](app/api/sabnzbd/queue/[nzoId]/pause/route.ts)

11. **POST /api/sabnzbd/queue/[nzoId]/resume**
    - Purpose: Resume specific queue item
    - Methods: POST
    - Implementation: [`app/api/sabnzbd/queue/[nzoId]/resume/route.ts`](app/api/sabnzbd/queue/[nzoId]/resume/route.ts)

12. **POST /api/sabnzbd/queue/[nzoId]/priority**
    - Purpose: Set priority for specific queue item
    - Methods: POST
    - Implementation: [`app/api/sabnzbd/queue/[nzoId]/priority/route.ts`](app/api/sabnzbd/queue/[nzoId]/priority/route.ts)

13. **POST /api/sabnzbd/queue/[nzoId]/category**
    - Purpose: Set category for specific queue item
    - Methods: POST
    - Implementation: [`app/api/sabnzbd/queue/[nzoId]/category/route.ts`](app/api/sabnzbd/queue/[nzoId]/category/route.ts)

### Add Content Endpoints
14. **POST /api/sabnzbd/addfile**
    - Purpose: Add NZB file
    - Methods: POST
    - Implementation: [`app/api/sabnzbd/addfile/route.ts`](app/api/sabnzbd/addfile/route.ts)

15. **POST /api/sabnzbd/addurl**
    - Purpose: Add NZB by URL
    - Methods: POST
    - Implementation: [`app/api/sabnzbd/addurl/route.ts`](app/api/sabnzbd/addurl/route.ts)

## Sonarr API Endpoints

### Core Endpoints
1. **GET /api/sonarr/series**
   - Purpose: Get all series
   - Methods: GET
   - Implementation: [`app/api/sonarr/series/route.ts`](app/api/sonarr/series/route.ts)

2. **GET /api/sonarr/series/[id]**
   - Purpose: Get specific series
   - Methods: GET, PUT
   - Implementation: [`app/api/sonarr/series/[id]/route.ts`](app/api/sonarr/series/[id]/route.ts)

3. **GET /api/sonarr/calendar**
   - Purpose: Get calendar information
   - Methods: GET
   - Implementation: [`app/api/sonarr/calendar/route.ts`](app/api/sonarr/calendar/route.ts)

4. **GET /api/sonarr/queue**
   - Purpose: Get download queue
   - Methods: GET
   - Implementation: [`app/api/sonarr/queue/route.ts`](app/api/sonarr/queue/route.ts)

5. **GET /api/sonarr/wanted/missing**
   - Purpose: Get wanted/missing episodes
   - Methods: GET
   - Implementation: [`app/api/sonarr/wanted/missing/route.ts`](app/api/sonarr/wanted/missing/route.ts)

6. **GET /api/sonarr/history**
   - Purpose: Get download history
   - Methods: GET
   - Implementation: [`app/api/sonarr/history/route.ts`](app/api/sonarr/history/route.ts)

### System Endpoints
7. **GET /api/sonarr/system/status**
   - Purpose: Get system status
   - Methods: GET
   - Implementation: [`app/api/sonarr/system/status/route.ts`](app/api/sonarr/system/status/route.ts)

8. **GET /api/sonarr/system/task**
   - Purpose: Get system tasks
   - Methods: GET
   - Implementation: [`app/api/sonarr/system/task/route.ts`](app/api/sonarr/system/task/route.ts)

9. **GET /api/sonarr/health**
   - Purpose: Get system health
   - Methods: GET
   - Implementation: [`app/api/sonarr/health/route.ts`](app/api/sonarr/health/route.ts)

10. **GET /api/sonarr/diskspace**
    - Purpose: Get disk space information
    - Methods: GET
    - Implementation: [`app/api/sonarr/diskspace/route.ts`](app/api/sonarr/diskspace/route.ts)

11. **GET /api/sonarr/update**
    - Purpose: Get update information
    - Methods: GET
    - Implementation: [`app/api/sonarr/update/route.ts`](app/api/sonarr/update/route.ts)

### Configuration Endpoints
12. **GET /api/sonarr/languageprofile**
    - Purpose: Get language profiles
    - Methods: GET
    - Implementation: [`app/api/sonarr/languageprofile/route.ts`](app/api/sonarr/languageprofile/route.ts)

13. **GET /api/sonarr/qualityprofile**
    - Purpose: Get quality profiles
    - Methods: GET
    - Implementation: [`app/api/sonarr/qualityprofile/route.ts`](app/api/sonarr/qualityprofile/route.ts)

14. **GET /api/sonarr/rootfolder**
    - Purpose: Get root folders
    - Methods: GET
    - Implementation: [`app/api/sonarr/rootfolder/route.ts`](app/api/sonarr/rootfolder/route.ts)

### Command Endpoints
15. **POST /api/sonarr/command**
    - Purpose: Execute commands
    - Methods: POST
    - Implementation: [`app/api/sonarr/command/route.ts`](app/api/sonarr/command/route.ts)

### Episode Management
16. **PUT /api/sonarr/episode/[id]**
    - Purpose: Update episode
    - Methods: PUT
    - Implementation: [`app/api/sonarr/episode/[id]/route.ts`](app/api/sonarr/episode/[id]/route.ts)

### Queue Management
17. **DELETE /api/sonarr/queue/[id]**
    - Purpose: Delete queue item
    - Methods: DELETE
    - Implementation: [`app/api/sonarr/queue/[id]/route.ts`](app/api/sonarr/queue/[id]/route.ts)

### Series Lookup
18. **GET /api/sonarr/series/lookup**
    - Purpose: Lookup series
    - Methods: GET
    - Implementation: [`app/api/sonarr/series/lookup/route.ts`](app/api/sonarr/series/lookup/route.ts)

## Other Services (Partially Implemented)

The following services have directory structures but may not have complete implementations:

1. **Radarr** - `/api/radarr/`
2. **Prowlarr** - `/api/prowlarr/`
3. **Readarr** - `/api/readarr/`
4. **Readarr Audiobooks** - `/api/readarr-audiobooks/`

## Button Actions and API Calls

### SABnzbd Dashboard Button Actions

From [`components/sabnzbd-dashboard.tsx`](components/sabnzbd-dashboard.tsx):

1. **Pause All Button**
   - Action: Pause entire download queue
   - API Call: `actions.pause()`
   - Endpoint: `POST /api/sabnzbd/queue/pause`

2. **Resume All Button**
   - Action: Resume entire download queue
   - API Call: `actions.resume()`
   - Endpoint: `POST /api/sabnzbd/queue/resume`

3. **Pause Item Button** (per queue item)
   - Action: Pause specific download item
   - API Call: `actions.pauseItem(nzo_id)`
   - Endpoint: `POST /api/sabnzbd/queue/[nzoId]/pause`

4. **Resume Item Button** (per queue item)
   - Action: Resume specific download item
   - API Call: `actions.resumeItem(nzo_id)`
   - Endpoint: `POST /api/sabnzbd/queue/[nzoId]/resume`

5. **Delete Item Button** (per queue item)
   - Action: Delete specific download item
   - API Call: `actions.deleteItem(nzo_id)`
   - Endpoint: `DELETE /api/sabnzbd/queue/[nzoId]`

6. **Category Selection** (per queue item)
   - Action: Change category of download item
   - API Call: `actions.setCategory(nzo_id, category)`
   - Endpoint: `POST /api/sabnzbd/queue/[nzoId]/category`

7. **Priority Selection** (per queue item)
   - Action: Change priority of download item
   - API Call: `actions.setPriority(nzo_id, priority)`
   - Endpoint: `POST /api/sabnzbd/queue/[nzoId]/priority`

8. **Delete History Item Button** (per history item)
   - Action: Delete item from history
   - API Call: `actions.deleteItem(nzo_id)`
   - Endpoint: `DELETE /api/sabnzbd/queue/[nzoId]` (reused for history)

### Sonarr Dashboard Button Actions

From [`components/sonarr-dashboard.tsx`](components/sonarr-dashboard.tsx):

1. **Search All Button**
   - Action: Search for all missing episodes
   - API Call: `actions.searchAllMissing()`
   - Endpoint: `POST /api/sonarr/command` with body `{"name": "MissingEpisodeSearch"}`

2. **Add Series Button**
   - Action: Open dialog to add new series
   - API Call: `actions.lookupSeries(term)` for search, then `actions.series.addSeries()`
   - Endpoint: `GET /api/sonarr/series/lookup` then `POST /api/sonarr/series`

3. **Toggle Monitoring Button** (per series)
   - Action: Toggle monitoring status for series
   - API Call: `actions.series.toggleMonitoring(seriesId)`
   - Endpoint: `PUT /api/sonarr/series/[id]`

4. **Refresh Series Button** (per series)
   - Action: Refresh/search for episodes in series
   - API Call: `actions.series.searchSeries(seriesId)`
   - Endpoint: `POST /api/sonarr/command` with body `{"name": "SeasonSearch", "seriesId": id, "seasonNumber": 0}`

5. **Scan Series Button** (per series)
   - Action: Scan series for new episodes
   - API Call: `actions.series.searchSeries(seriesId)` (same as refresh)
   - Endpoint: `POST /api/sonarr/command` with body `{"name": "SeasonSearch", "seriesId": id, "seasonNumber": 0}`

6. **Delete Series Button** (per series)
   - Action: Delete series
   - API Call: `actions.series.deleteSeries(seriesId)`
   - Endpoint: `DELETE /api/sonarr/series/[id]`

7. **Edit Series Button** (per series)
   - Action: Open dialog to edit series
   - API Call: `actions.series.toggleMonitoring(seriesId)` (for monitoring toggle)
   - Endpoint: `PUT /api/sonarr/series/[id]`

8. **Search Episode Button** (per wanted episode)
   - Action: Search for specific episode
   - API Call: `actions.episodes.searchEpisode(episodeId)`
   - Endpoint: `POST /api/sonarr/command` with body `{"name": "EpisodeSearch", "episodeIds": [id]}`

## Hook-Based API Calls

### SABnzbd Hook ([`hooks/use-sabnzbd.ts`](hooks/use-sabnzbd.ts))

The following API calls are made automatically or through the hook:

1. **Queue Auto-refresh**
   - Action: Refresh queue every 5 seconds
   - API Call: `api.getQueue()`
   - Endpoint: `GET /api/sabnzbd/queue`

2. **Fetch History**
   - Action: Get download history with filters
   - API Call: `api.getHistory(start, limit, opts)`
   - Endpoint: `GET /api/sabnzbd/history`

3. **Fetch Server Stats**
   - Action: Get server statistics
   - API Call: `api.getServerStats()`
   - Endpoint: `GET /api/sabnzbd/server-stats`

4. **Fetch Categories**
   - Action: Get available categories
   - API Call: `api.getCategories()`
   - Endpoint: `GET /api/sabnzbd/categories`

5. **Add NZB by URL**
   - Action: Add download by URL
   - API Call: `api.addUrl(url, name, category, priority)`
   - Endpoint: `POST /api/sabnzbd/addurl`

6. **Add NZB by File**
   - Action: Add download by file upload
   - API Call: `api.addNzbFromFile(file, name, category, priority)`
   - Endpoint: `POST /api/sabnzbd/addfile`

### Sonarr Hook ([`hooks/use-sonarr.ts`](hooks/use-sonarr.ts))

The following API calls are made automatically or through the hook:

1. **Series Auto-refresh**
   - Action: Refresh series every 30 seconds
   - API Call: `api.getSeries()`
   - Endpoint: `GET /api/sonarr/series`

2. **Fetch Calendar**
   - Action: Get calendar for next 7 days
   - API Call: `api.getCalendar(start, end)`
   - Endpoint: `GET /api/sonarr/calendar`

3. **Fetch Wanted Episodes**
   - Action: Get wanted/missing episodes
   - API Call: `api.getWanted()`
   - Endpoint: `GET /api/sonarr/wanted/missing`

4. **Fetch Activity**
   - Action: Get recent activity
   - API Call: `api.getActivity()`
   - Endpoint: `GET /api/sonarr/history`

5. **Fetch System Status**
   - Action: Get system status information
   - API Call: `api.getSystemStatus()`
   - Endpoint: `GET /api/sonarr/system/status`

6. **Fetch System Health**
   - Action: Get system health information
   - API Call: `api.getSystemHealth()`
   - Endpoint: `GET /api/sonarr/health`

7. **Fetch Disk Space**
   - Action: Get disk space information
   - API Call: `api.getDiskSpace()`
   - Endpoint: `GET /api/sonarr/diskspace`

8. **Fetch System Tasks**
   - Action: Get running system tasks
   - API Call: `api.getSystemTasks()`
   - Endpoint: `GET /api/sonarr/system/task`

9. **Fetch Update Info**
   - Action: Get update information
   - API Call: `api.getUpdateInfo()`
   - Endpoint: `GET /api/sonarr/update`

10. **Fetch Quality Profiles**
    - Action: Get available quality profiles
    - API Call: `api.getQualityProfiles()`
    - Endpoint: `GET /api/sonarr/qualityprofile`

11. **Fetch Language Profiles**
    - Action: Get available language profiles
    - API Call: `api.getLanguageProfiles()`
    - Endpoint: `GET /api/sonarr/languageprofile`

12. **Fetch Root Folders**
    - Action: Get available root folders
    - API Call: `api.getRootFolders()`
    - Endpoint: `GET /api/sonarr/rootfolder`

13. **Lookup Series**
    - Action: Search for series to add
    - API Call: `api.searchSeries(term)`
    - Endpoint: `GET /api/sonarr/series/lookup`

## Test Plan Recommendations

Based on this analysis, the following test plan is recommended:

1. **Core Functionality Tests**
   - Test all GET endpoints for basic connectivity
   - Test POST/PUT/DELETE endpoints with valid data
   - Test error handling with invalid data

2. **Button Action Tests**
   - Test all button actions in the UI
   - Verify correct API endpoints are called
   - Verify UI updates appropriately after actions

3. **Hook-Based Tests**
   - Test auto-refresh functionality
   - Test data fetching with various parameters
   - Test error handling in hooks

4. **Service-Specific Tests**
   - Test SABnzbd-specific functionality (queue management, categories)
   - Test Sonarr-specific functionality (series management, episodes)
   - Test partially implemented services (Radarr, Prowlarr, Readarr)

5. **Integration Tests**
   - Test workflow across multiple services
   - Test data consistency between services
   - Test error recovery mechanisms