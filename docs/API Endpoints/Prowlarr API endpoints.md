Based on the official Prowlarr API documentation, here is a comprehensive list of API endpoints formatted for a markdown file. The API is RESTful and uses a `v1` base path for most endpoints.

**Base URL:** `http://[host]:[port]/api/v1/`

**Authentication:** All requests must include an `apikey` header or query parameter for authentication.

---

# Prowlarr API Endpoints

## Indexers

* **GET `/api/v1/indexer`**: Get all configured indexers.
* **POST `/api/v1/indexer`**: Add a new indexer.
* **PUT `/api/v1/indexer`**: Update an existing indexer.
* **GET `/api/v1/indexer/{id}`**: Get a specific indexer by ID.
* **PUT `/api/v1/indexer/{id}`**: Update a specific indexer.
* **DELETE `/api/v1/indexer/{id}`**: Delete an indexer.
* **POST `/api/v1/indexer/test`**: Test an indexer's connection.
* **POST `/api/v1/indexer/testall`**: Test all configured indexers.
* **GET `/api/v1/indexer/schema`**: Get the schema for indexer configuration.
* **GET `/api/v1/indexer/categories`**: Get default indexer categories.
* **GET `/api/v1/indexerstats`**: Get a summary of indexer statistics.
* **GET `/api/v1/indexerstatus`**: Get the connection status of each indexer.

## Applications

* **GET `/api/v1/applications`**: Get all configured applications (Sonarr, Radarr, etc.).
* **POST `/api/v1/applications`**: Add a new application.
* **PUT `/api/v1/applications`**: Update multiple applications.
* **GET `/api/v1/applications/{id}`**: Get a specific application by ID.
* **PUT `/api/v1/applications/{id}`**: Update a specific application.
* **DELETE `/api/v1/applications/{id}`**: Delete an application.
* **POST `/api/v1/applications/test`**: Test a specific application's connection.
* **POST `/api/v1/applications/testall`**: Test all configured applications.
* **GET `/api/v1/applications/schema`**: Get the schema for application configuration.
* **POST `/api/v1/applications/action/{name}`**: Perform an action on an application.

## Download Clients

* **GET `/api/v1/downloadclient`**: Get all configured download clients.
* **POST `/api/v1/downloadclient`**: Add a new download client.
* **PUT `/api/v1/downloadclient`**: Update multiple download clients.
* **GET `/api/v1/downloadclient/{id}`**: Get a specific download client by ID.
* **PUT `/api/v1/downloadclient/{id}`**: Update a specific download client.
* **DELETE `/api/v1/downloadclient/{id}`**: Delete a download client.
* **POST `/api/v1/downloadclient/test`**: Test a specific download client's connection.
* **POST `/api/v1/downloadclient/testall`**: Test all configured download clients.
* **GET `/api/v1/downloadclient/schema`**: Get the schema for download client configuration.

## System & Commands

* **GET `/api/v1/system/status`**: Get the current system status.
* **POST `/api/v1/system/shutdown`**: Shut down Prowlarr.
* **POST `/api/v1/system/restart`**: Restart Prowlarr.
* **GET `/api/v1/system/routes`**: Get system routes.
* **GET `/api/v1/system/backup`**: Get a list of available system backups.
* **POST `/api/v1/system/backup/restore/{id}`**: Restore from a specific backup.
* **DELETE `/api/v1/system/backup/{id}`**: Delete a specific system backup.
* **POST `/api/v1/command`**: Send a command to Prowlarr.
* **GET `/api/v1/command`**: Get a list of running and completed commands.
* **GET `/api/v1/command/{id}`**: Get the status of a specific command.
* **GET `/api/v1/system/task`**: Get a list of system tasks.

## Configuration & Management

* **GET `/api/v1/config/host`**: Get host configuration.
* **PUT `/api/v1/config/host`**: Update host configuration.
* **GET `/api/v1/config/ui`**: Get UI configuration.
* **PUT `/api/v1/config/ui`**: Update UI configuration.
* **GET `/api/v1/config/downloadclient`**: Get download client configuration.
* **PUT `/api/v1/config/downloadclient`**: Update download client configuration.
* **GET `/api/v1/notification`**: Get all configured notifications.
* **POST `/api/v1/notification`**: Add a new notification.
* **PUT `/api/v1/notification/{id}`**: Update a specific notification.
* **DELETE `/api/v1/notification/{id}`**: Delete a notification.
* **GET `/api/v1/tag`**: Get all configured tags.
* **POST `/api/v1/tag`**: Add a new tag.
* **PUT `/api/v1/tag/{id}`**: Update a specific tag.
* **DELETE `/api/v1/tag/{id}`**: Delete a tag.

## Misc. & Utilities

* **GET `/api/v1/search`**: Search for releases.
* **POST `/api/v1/search`**: Perform a search.
* **GET `/api/v1/history`**: Get search history.
* **GET `/api/v1/log`**: Get recent logs.
* **GET `/api/v1/log/file`**: Get a list of available log files.
* **GET `/api/v1/log/file/{filename}`**: Get the content of a specific log file.
* **GET `/api/v1/health`**: Get the system health status.
* **GET `/api/v1/update`**: Get update information.
* **GET `/api/v1/filesystem`**: Get file system information.
* **GET `/api/v1/localization`**: Get localization strings.
* **GET `/api/v1/customfilter`**: Get custom filters.
* **GET `/ping`**: Check API status.
* **HEAD `/ping`**: Check API status.