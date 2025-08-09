Based on the SABnzbd API documentation, the API is based on a command-driven structure using the `mode` parameter. Unlike Sonarr's RESTful API with distinct endpoints for each resource, SABnzbd uses a single API URL with a different `mode` for each action.

Here is a comprehensive list of SABnzbd API commands (`mode` values) and their functions, formatted as a markdown file.

**Base API URL:** `http://[host]:[port]/sabnzbd/api`

**Authentication:** All requests must include `apikey=YOUR_API_KEY` as a query parameter. It is also highly recommended to include `output=json` for structured responses.

---

# SABnzbd API Endpoints

## Queue Management

* **`mode=queue`**: Get a detailed list of all items currently in the queue.
* **`mode=qstatus`**: Get a brief, high-level status of the queue.
* **`mode=pause`**: Pause all downloads globally.
* **`mode=resume`**: Resume all downloads globally.
* **`mode=pause.specific`**: Pause a specific queue item.
    * **Parameters**: `id` (the nzo\_id of the item).
* **`mode=resume.specific`**: Resume a specific queue item.
    * **Parameters**: `id` (the nzo\_id of the item).
* **`mode=queue.delete`**: Delete an item from the queue.
    * **Parameters**: `id` (the nzo\_id of the item).
* **`mode=queue.pause`**: Pause the entire queue (same as `mode=pause`).
* **`mode=queue.resume`**: Resume the entire queue (same as `mode=resume`).
* **`mode=queue.setpause`**: Set a pause period for the queue.
    * **Parameters**: `value` (in minutes).
* **`mode=queue.move`**: Move an item to a different position in the queue.
    * **Parameters**: `id` (the nzo\_id of the item), `value` (the new position).
* **`mode=queue.setcat`**: Change the category of a queue item.
    * **Parameters**: `id` (the nzo\_id of the item), `value` (the new category name).
* **`mode=queue.setname`**: Change the name of a queue item.
    * **Parameters**: `id` (the nzo\_id of the item), `value` (the new name).
* **`mode=queue.setpri`**: Change the priority of a queue item.
    * **Parameters**: `id` (the nzo\_id of the item), `value` (priority level, e.g., "high", "normal", "low", "forced").
* **`mode=queue.setscript`**: Change the script for a queue item.
    * **Parameters**: `id` (the nzo\_id of the item), `value` (the new script name).
* **`mode=queue.setpp`**: Set the post-processing status of a queue item.
    * **Parameters**: `id` (the nzo\_id of the item), `value` (post-processing option, e.g., "1" for full post-processing).

---

## History & Downloads

* **`mode=history`**: Get a list of all completed, failed, or downloaded items in the history.
* **`mode=history.delete`**: Delete a specific item from the history.
    * **Parameters**: `id` (the nzo\_id of the item).
* **`mode=history.purge`**: Clear all items from the history.
* **`mode=history.retry`**: Retry a failed download from the history.
    * **Parameters**: `id` (the nzo\_id of the item).
* **`mode=addurl`**: Add an NZB from a URL to the queue.
    * **Parameters**: `name` (URL of the NZB file), and optional parameters like `cat`, `script`, `priority`.
* **`mode=addlocalfile`**: Add a local NZB file to the queue.
    * **Parameters**: `name` (the local path of the NZB file).

---

## System & Configuration

* **`mode=shutdown`**: Shut down SABnzbd.
* **`mode=restart`**: Restart SABnzbd.
* **`mode=version`**: Get the current version of SABnzbd.
* **`mode=warnings`**: Get a list of current system warnings.
* **`mode=get_config`**: Display the contents of the `sabnzbd.ini` configuration file.
    * *Warning: This can expose sensitive information. Use with caution.*
* **`mode=get_cats`**: Get a list of all configured categories.
* **`mode=get_scripts`**: Get a list of all configured post-processing scripts.
* **`mode=test_email`**: Send a test email notification.
* **`mode=test_notif`**: Send a test push notification (e.g., Growl).
* **`mode=disconnect`**: Force disconnect server connections.
* **`mode=options`**: Display SABnzbd tools options.
* **`mode=browse`**: API function for the path browser dialog.
    * **Parameters**: `name` (a valid path), `compact` (set to `1` for a concise output).
* **`mode=rss_now`**: Trigger an immediate fetch of RSS feed items.