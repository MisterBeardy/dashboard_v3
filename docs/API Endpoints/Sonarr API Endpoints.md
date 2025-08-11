# Sonarr API Endpoints (Comprehensive List)

This document aims to provide a comprehensive list of Sonarr API endpoints based on the official documentation for v3. The endpoints are categorized by their primary function.

**Base URL for most v3 API calls:** `http://[host]:[port]/api/v3/`

**Authentication Parameter:** All requests typically require an `apikey` header or query parameter for authentication.

## System & Authentication

* **GET /api**: Get basic API information.
* **POST /login**: Authenticate a user.
* **GET /logout**: Log out the current user.
* **GET /ping**: Check API status.
* **HEAD /ping**: Check API status.
* **GET /api/v3/system/status**: Get system status.
* **GET /api/v3/system/routes**: Get system routes.
* **GET /api/v3/system/backup**: Get a list of available system backups.
* **DELETE /api/v3/system/backup/{id}**: Delete a specific system backup.
* **POST /api/v3/system/backup/restore/{id}**: Restore from a specific system backup.
* **POST /api/v3/system/backup/restore/upload**: Upload and restore from a backup file.
* **GET /feed/v3/calendar/sonarr.ics**: Get iCal feed for the calendar.

## Configuration

* **GET /api/v3/config/host**: Get host configuration.
* **PUT /api/v3/config/host**: Update host configuration.
* **GET /api/v3/config/downloadclient**: Get download client configuration.
* **PUT /api/v3/config/downloadclient**: Update download client configuration.
* **GET /api/v3/config/mediamanagement**: Get media management configuration.
* **PUT /api/v3/config/mediamanagement**: Update media management configuration.
* **GET /api/v3/config/naming**: Get naming configuration.
* **PUT /api/v3/config/naming**: Update naming configuration.
* **GET /api/v3/config/ui**: Get UI configuration.
* **PUT /api/v3/config/ui**: Update UI configuration.

## Content Management

* **GET /api/v3/series**: Get all series.
* **GET /api/v3/series/{id}**: Get a specific series by ID.
* **POST /api/v3/series**: Add a new series.
* **PUT /api/v3/series**: Update multiple series.
* **PUT /api/v3/series/{id}**: Update a specific series.
* **DELETE /api/v3/series/{id}**: Delete a series.
* **GET /api/v3/episode**: Get all episodes.
* **GET /api/v3/episode/{id}**: Get a specific episode by ID.
* **PUT /api/v3/episode/{id}**: Update a specific episode.
* **GET /api/v3/episodefile**: Get all episode files.
* **GET /api/v3/episodefile/{id}**: Get a specific episode file by ID.
* **DELETE /api/v3/episodefile/{id}**: Delete an episode file.
* **PUT /api/v3/episodefile/bulk**: Bulk update episode files.
* **POST /api/v3/series/import**: Import series from a disk. (Trigger a scan/import)
* **GET /api/v3/rootfolder**: Get all configured root folders.
* **GET /api/v3/rootfolder/{id}**: Get a specific root folder by ID.
* **POST /api/v3/rootfolder**: Add a new root folder.
* **DELETE /api/v3/rootfolder/{id}**: Delete a root folder.
* **GET /api/v3/manualimport**: Get manual import options.
* **POST /api/v3/manualimport**: Perform manual import.
* **GET /api/v3/parse**: Parse a release name.
* **GET /api/v3/qualitydefinition**: Get all quality definitions.
* **PUT /api/v3/qualitydefinition**: Update multiple quality definitions.
* **GET /api/v3/qualityprofile**: Get all quality profiles.
* **GET /api/v3/qualityprofile/{id}**: Get a specific quality profile by ID.
* **POST /api/v3/qualityprofile**: Add a new quality profile.
* **PUT /api/v3/qualityprofile/{id}**: Update a specific quality profile.
* **DELETE /api/v3/qualityprofile/{id}**: Delete a quality profile.
* **GET /api/v3/language**: Get all languages.
* **GET /api/v3/languageprofile**: Get all language profiles.
* **GET /api/v3/languageprofile/{id}**: Get a specific language profile by ID.
* **POST /api/v3/languageprofile**: Add a new language profile.
* **PUT /api/v3/languageprofile/{id}**: Update a specific language profile.
* **DELETE /api/v3/languageprofile/{id}**: Delete a language profile.
* **GET /api/v3/customformat**: Get all custom formats.
* **GET /api/v3/customformat/{id}**: Get a specific custom format by ID.
* **POST /api/v3/customformat**: Add a new custom format.
* **PUT /api/v3/customformat/{id}**: Update a specific custom format.
* **DELETE /api/v3/customformat/{id}**: Delete a custom format.
* **GET /api/v3/metadata**: Get all metadata profiles.
* **GET /api/v3/metadata/{id}**: Get a specific metadata profile by ID.
* **POST /api/v3/metadata**: Add a new metadata profile.
* **PUT /api/v3/metadata/{id}**: Update a specific metadata profile.
* **DELETE /api/v3/metadata/{id}**: Delete a metadata profile.
* **GET /api/v3/tag**: Get all tags.
* **GET /api/v3/tag/{id}**: Get a specific tag by ID.
* **POST /api/v3/tag**: Add a new tag.
* **PUT /api/v3/tag/{id}**: Update a specific tag.
* **DELETE /api/v3/tag/{id}**: Delete a tag.

## Indexing & Downloads

* **GET /api/v3/indexer**: Get all configured indexers.
* **GET /api/v3/indexer/{id}**: Get a specific indexer by ID.
* **POST /api/v3/indexer**: Add a new indexer.
* **PUT /api/v3/indexer/{id}**: Update a specific indexer.
* **DELETE /api/v3/indexer/{id}**: Delete an indexer.
* **GET /api/v3/downloadclient**: Get all configured download clients.
* **GET /api/v3/downloadclient/{id}**: Get a specific download client by ID.
* **POST /api/v3/downloadclient**: Add a new download client.
* **PUT /api/v3/downloadclient/{id}**: Update a specific download client.
* **DELETE /api/v3/downloadclient/{id}**: Delete a download client.
* **GET /api/v3/release**: Search for releases.
* **POST /api/v3/release**: Download a release.
* **GET /api/v3/releaseprofile**: Get all release profiles.
* **GET /api/v3/releaseprofile/{id}**: Get a specific release profile by ID.
* **POST /api/v3/releaseprofile**: Add a new release profile.
* **PUT /api/v3/releaseprofile/{id}**: Update a specific release profile.
* **DELETE /api/v3/releaseprofile/{id}**: Delete a release profile.
* **POST /api/v3/release/push**: Push a release manually.

## Monitoring & Automation

* **GET /api/v3/wanted/missing**: Get episodes that are missing.
* **GET /api/v3/wanted/cutoff**: Get episodes that have not met cutoff.
* **GET /api/v3/calendar**: Get calendar events.
* **GET /api/v3/queue**: Get the current download queue.
* **GET /api/v3/queue/status**: Get the status of the download queue.
* **DELETE /api/v3/queue/{id}**: Delete an item from the queue.
* **GET /api/v3/history**: Get download history.
* **GET /api/v3/blocklist**: Get blocklist entries.
* **GET /api/v3/blocklist/{id}**: Get a specific blocklist entry by ID.
* **DELETE /api/v3/blocklist/{id}**: Delete a blocklist entry.
* **POST /api/v3/command**: Send a command to Sonarr (e.g., refresh series, scan disk, rename files).
* **GET /api/v3/command/{id}**: Get status of a specific command.
* **GET /api/v3/system/task**: Get system tasks.
* **POST /api/v3/system/task/start/{name}**: Start a specific system task.
* **GET /api/v3/update**: Get update information.
* **GET /api/v3/notification**: Get all configured notifications.
* **GET /api/v3/notification/{id}**: Get a specific notification by ID.
* **POST /api/v3/notification**: Add a new notification.
* **PUT /api/v3/notification/{id}**: Update a specific notification.
* **DELETE /api/v3/notification/{id}**: Delete a notification.
* **GET /api/v3/autotagging**: Get all auto-tagging settings.
* **POST /api/v3/autotagging**: Add new auto-tagging settings.
* **PUT /api/v3/autotagging/{id}**: Update specific auto-tagging settings.
* **DELETE /api/v3/autotagging/{id}**: Delete auto-tagging settings.
* **GET /api/v3/autotagging/schema**: Get the schema for auto-tagging settings.
* **GET /api/v3/delayprofile**: Get all delay profiles.
* **GET /api/v3/delayprofile/{id}**: Get a specific delay profile by ID.
* **POST /api/v3/delayprofile**: Add a new delay profile.
* **PUT /api/v3/delayprofile/{id}**: Update a specific delay profile.
* **DELETE /api/v3/delayprofile/{id}**: Delete a delay profile.
* **GET /api/v3/remotepathmapping**: Get all remote path mappings.
* **GET /api/v3/remotepathmapping/{id}**: Get a specific remote path mapping by ID.
* **POST /api/v3/remotepathmapping**: Add a new remote path mapping.
* **PUT /api/v3/remotepathmapping/{id}**: Update a specific remote path mapping.
* **DELETE /api/v3/remotepathmapping/{id}**: Delete a remote path mapping.
* **GET /api/v3/importlist**: Get all import lists.
* **GET /api/v3/importlist/{id}**: Get a specific import list by ID.
* **POST /api/v3/importlist**: Add a new import list.
* **PUT /api/v3/importlist/{id}**: Update a specific import list.
* **DELETE /api/v3/importlist/{id}**: Delete an import list.
* **GET /api/v3/importlistconfig**: Get import list configuration.
* **PUT /api/v3/importlistconfig**: Update import list configuration.
* **GET /api/v3/importlistexclusion**: Get all import list exclusions.
* **GET /api/v3/importlistexclusion/{id}**: Get a specific import list exclusion by ID.
* **POST /api/v3/importlistexclusion**: Add a new import list exclusion.
* **PUT /api/v3/importlistexclusion/{id}**: Update a specific import list exclusion.
* **DELETE /api/v3/importlistexclusion/{id}**: Delete an import list exclusion.
* **GET /api/v3/serieslookup**: Search for series using a lookup.
* **GET /api/v3/serieseditor**: Get series for editing.
* **PUT /api/v3/serieseditor**: Edit multiple series.
* **GET /api/v3/renameepisode**: Get episodes to be renamed.
* **POST /api/v3/renameepisode**: Perform episode renaming.
* **GET /api/v3/seasonpass**: Get season pass settings.
* **PUT /api/v3/seasonpass**: Update season pass settings.

## Utilities

* **GET /api/v3/log**: Get recent logs.
* **GET /api/v3/logfile**: Get specific log files.
* **GET /api/v3/health**: Get system health status.
* **GET /api/v3/diskspace**: Get disk space information.
* **GET /api/v3/filesystem**: Get file system information.
* **GET /api/v3/mediacover**: Get media cover images.
* **GET /api/v3/localization**: Get localization strings.
* **GET /api/v3/customfilter**: Get custom filters.
* **GET /api/v3/indexerflag**: Get indexer flags.
* **GET /api/v3/qualityprofileschema**: Get the schema for quality profiles.
* **GET /api/v3/languageprofileschema**: Get the schema for language profiles.
* **GET /api/v3/tagdetails**: Get details for tags.
* **GET /api/v3/queuedetails**: Get details for queue items.
* **POST /api/v3/queue/grab/{id}**: Mark a queue item as grabbed.
* **POST /api/v3/queue/ungrab/{id}**: Mark a queue item as ungrabbed.
* **POST /api/v3/queue/import/{id}**: Import a specific queue item.
* **POST /api/v3/queue/rescan/{id}**: Rescan a specific queue item.
* **POST /api/v3/queue/movetofolder/{id}**: Move a queue item to a different folder.
* **POST /api/v3/queue/download/{id}**: Trigger a download for a queue item.
* **GET /api/v3/update/logFile**: Get update log file content.

This list is intended to be exhaustive for the Sonarr v3 API as documented. Please note that specific parameters for each endpoint are not listed here but can be found in the detailed Sonarr API documentation.