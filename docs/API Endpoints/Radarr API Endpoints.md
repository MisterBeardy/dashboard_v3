# Radarr API Endpoints

This document provides a comprehensive list of API endpoints for Radarr, based on the official v3 API documentation. The endpoints are categorized by their primary function.

**Base URL:** `http://[host]:[port]/api/v3/`

**Authentication:** All requests must include an `apikey` header or query parameter for authentication.

---

## Movies

* **GET `/api/v3/movie`**: Get a list of all movies in your library.
* **GET `/api/v3/movie/{id}`**: Get a specific movie by its Radarr ID.
* **GET `/api/v3/movie/lookup`**: Search for a movie by title.
* **GET `/api/v3/movie/lookup/{tmdbId}`**: Look up a movie by TMDB ID.
* **POST `/api/v3/movie`**: Add a new movie to Radarr.
* **PUT `/api/v3/movie/{id}`**: Update an existing movie.
* **DELETE `/api/v3/movie/{id}`**: Delete a movie from Radarr.
* **PUT `/api/v3/movie/editor`**: Bulk update properties of multiple movies.
* **PUT `/api/v3/movie/bulk`**: Bulk update or delete movies.

## Collections

* **GET `/api/v3/collection`**: Get a list of all movie collections.
* **GET `/api/v3/collection/{id}`**: Get a specific collection by ID.
* **PUT `/api/v3/collection`**: Update multiple collections.
* **PUT `/api/v3/collection/{id}`**: Update a specific collection.

## Downloads & Queue

* **GET `/api/v3/queue`**: Get a list of all items currently in the download queue.
* **DELETE `/api/v3/queue/{id}`**: Delete an item from the queue.
* **GET `/api/v3/release`**: Search for movie releases.
* **POST `/api/v3/release`**: Download a specific release.
* **GET `/api/v3/history`**: Get the download history.

## System & Commands

* **GET `/api/v3/system/status`**: Get the current system status.
* **GET `/api/v3/system/backup`**: Get a list of available system backups.
* **DELETE `/api/v3/system/backup/{id}`**: Delete a specific system backup.
* **GET `/api/v3/diskspace`**: Get disk space information.
* **POST `/api/v3/command`**: Send a command to Radarr (e.g., `RefreshMovie`, `MoviesSearch`, `DownloadedMoviesScan`).
* **GET `/api/v3/command`**: Get a list of running and completed commands.
* **GET `/api/v3/command/{id}`**: Get the status of a specific command.

## Configuration & Management

* **GET `/api/v3/config/host`**: Get host configuration.
* **PUT `/api/v3/config/host`**: Update host configuration.
* **GET `/api/v3/config/downloadclient`**: Get download client configuration.
* **PUT `/api/v3/config/downloadclient`**: Update download client configuration.
* **GET `/api/v3/indexer`**: Get all configured indexers.
* **POST `/api/v3/indexer`**: Add a new indexer.
* **GET `/api/v3/downloadclient`**: Get all configured download clients.
* **POST `/api/v3/downloadclient`**: Add a new download client.
* **GET `/api/v3/qualityprofile`**: Get all quality profiles.
* **POST `/api/v3/qualityprofile`**: Add a new quality profile.
* **PUT `/api/v3/qualityprofile/{id}`**: Update a quality profile.
* **DELETE `/api/v3/qualityprofile/{id}`**: Delete a quality profile.
* **GET `/api/v3/notification`**: Get all configured notifications.
* **POST `/api/v3/notification`**: Add a new notification.
* **PUT `/api/v3/notification/{id}`**: Update a notification.
* **DELETE `/api/v3/notification/{id}`**: Delete a notification.

## Misc. & Advanced

* **GET `/api/v3/wanted/cutoff`**: Get a list of movies that have not met the cutoff.
* **GET `/api/v3/calendar`**: Get calendar events for movies.
* **GET `/api/v3/rootfolder`**: Get all configured root folders.
* **POST `/api/v3/rootfolder`**: Add a new root folder.
* **DELETE `/api/v3/rootfolder/{id}`**: Delete a root folder.
* **GET `/api/v3/tag`**: Get all configured tags.
* **POST `/api/v3/tag`**: Add a new tag.
* **PUT `/api/v3/tag/{id}`**: Update a specific tag.
* **DELETE `/api/v3/tag/{id}`**: Delete a tag.
* **GET `/api/v3/manualimport`**: Get manual import options.
* **POST `/api/v3/manualimport`**: Perform manual import.
* **GET `/api/v3/delayprofile`**: Get all delay profiles.
* **GET `/api/v3/customformat`**: Get all custom formats.
* **POST `/api/v3/customformat`**: Add a new custom format.
* **PUT `/api/v3/customformat/{id}`**: Update a specific custom format.
* **DELETE `/api/v3/customformat/{id}`**: Delete a custom format.
* **GET `/api/v3/blocklist`**: Get a list of all blocklisted items.
* **DELETE `/api/v3/blocklist/{id}`**: Delete a specific item from the blocklist.
* **DELETE `/api/v3/blocklist/bulk`**: Delete multiple items from the blocklist.
* **GET `/api/v3/importlist`**: Get all configured import lists.
* **POST `/api/v3/importlist`**: Add a new import list.
* **PUT `/api/v3/importlist/{id}`**: Update a specific import list.
* **DELETE `/api/v3/importlist/{id}`**: Delete an import list.
* **GET `/api/v3/health`**: Get the health status of Radarr.
* **GET `/api/v3/log`**: Get recent logs.
* **GET `/api/v3/logfile`**: Get the list of available log files.