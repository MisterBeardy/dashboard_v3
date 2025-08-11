# API Endpoint Analysis Report

## Summary
This report compares the endpoints tested in the enhanced API smoke test script with the actual API endpoints available in the project.

## Endpoints in Smoke Test Script

The smoke test script (`scripts/enhanced_api_smoke_test.py`) includes tests for the following endpoints:

### SABnzbd Endpoints (8 endpoints)
1. `/api/sabnzbd/queue` (GET)
2. `/api/sabnzbd/history` (GET)
3. `/api/sabnzbd/categories` (GET)
4. `/api/sabnzbd/config` (GET)
5. `/api/sabnzbd/server-stats` (GET)
6. `/api/sabnzbd/queue/pause` (POST) - Destructive
7. `/api/sabnzbd/queue/resume` (POST) - Destructive
8. `/api/sabnzbd/queue/{nzoId}` (DELETE) - Destructive

### Sonarr Endpoints (8 endpoints)
1. `/api/sonarr/series` (GET)
2. `/api/sonarr/calendar` (GET)
3. `/api/sonarr/queue` (GET)
4. `/api/sonarr/wanted/missing` (GET)
5. `/api/sonarr/system/status` (GET)
6. `/api/sonarr/health` (GET)
7. `/api/sonarr/queue/{id}` (DELETE) - Destructive
8. `/api/sonarr/command` (POST) - Destructive

## Missing Endpoints in Smoke Test

### Prowlarr Endpoints (14 endpoints missing)
The smoke test script does not include any Prowlarr endpoints, but the project has:
1. `/api/prowlarr/` (GET)
2. `/api/prowlarr/application/` (GET)
3. `/api/prowlarr/application/[id]/` (GET)
4. `/api/prowlarr/applications/` (GET)
5. `/api/prowlarr/command/` (GET)
6. `/api/prowlarr/downloadclient/` (GET)
7. `/api/prowlarr/downloadclient/[id]/` (GET)
8. `/api/prowlarr/downloadclient/[id]/test/` (GET)
9. `/api/prowlarr/health/` (GET)
10. `/api/prowlarr/indexer/` (GET)
11. `/api/prowlarr/indexer/[id]/` (GET)
12. `/api/prowlarr/indexer/[id]/test/` (GET)
13. `/api/prowlarr/indexer/lookup/` (GET)
14. `/api/prowlarr/log/` (GET)
15. `/api/prowlarr/system/status/` (GET)

### Radarr Endpoints (15 endpoints missing)
The smoke test script does not include any Radarr endpoints, but the project has:
1. `/api/radarr/` (GET)
2. `/api/radarr/command/` (GET)
3. `/api/radarr/diskspace/` (GET)
4. `/api/radarr/health/` (GET)
5. `/api/radarr/history/` (GET)
6. `/api/radarr/movie/` (GET)
7. `/api/radarr/movie/[id]/` (GET)
8. `/api/radarr/movie/lookup/` (GET)
9. `/api/radarr/movies/` (GET)
10. `/api/radarr/qualityprofile/` (GET)
11. `/api/radarr/queue/` (GET)
12. `/api/radarr/rootfolder/` (GET)
13. `/api/radarr/system/status/` (GET)
14. `/api/radarr/wanted/missing/` (GET)

### Readarr Endpoints (14 endpoints missing)
The smoke test script does not include any Readarr endpoints, but the project has:
1. `/api/readarr/` (GET)
2. `/api/readarr/author/` (GET)
3. `/api/readarr/author/[id]/` (GET)
4. `/api/readarr/book/` (GET)
5. `/api/readarr/book/[id]/` (GET)
6. `/api/readarr/command/` (GET)
7. `/api/readarr/health/` (GET)
8. `/api/readarr/history/` (GET)
9. `/api/readarr/metadataprofile/` (GET)
10. `/api/readarr/qualityprofile/` (GET)
11. `/api/readarr/queue/` (GET)
12. `/api/readarr/rootfolder/` (GET)
13. `/api/readarr/system/status/` (GET)
14. `/api/readarr/wanted/missing/` (GET)

### Readarr Audiobooks Endpoints (14 endpoints missing)
The smoke test script does not include any Readarr Audiobooks endpoints, but the project has:
1. `/api/readarr-audiobooks/` (GET)
2. `/api/readarr-audiobooks/author/` (GET)
3. `/api/readarr-audiobooks/author/[id]/` (GET)
4. `/api/readarr-audiobooks/book/` (GET)
5. `/api/readarr-audiobooks/book/[id]/` (GET)
6. `/api/readarr-audiobooks/command/` (GET)
7. `/api/readarr-audiobooks/health/` (GET)
8. `/api/readarr-audiobooks/history/` (GET)
9. `/api/readarr-audiobooks/metadataprofile/` (GET)
10. `/api/readarr-audiobooks/qualityprofile/` (GET)
11. `/api/readarr-audiobooks/queue/` (GET)
12. `/api/readarr-audiobooks/rootfolder/` (GET)
13. `/api/readarr-audiobooks/system/status/` (GET)
14. `/api/readarr-audiobooks/wanted/missing/` (GET)

### Additional SABnzbd Endpoints (8 endpoints missing)
The smoke test script includes some SABnzbd endpoints, but is missing:
1. `/api/sabnzbd/` (GET)
2. `/api/sabnzbd/addfile/` (GET)
3. `/api/sabnzbd/addurl/` (GET)
4. `/api/sabnzbd/queue/[nzoId]/` (GET)
5. `/api/sabnzbd/queue/[nzoId]/category/` (GET)
6. `/api/sabnzbd/queue/[nzoId]/pause/` (GET)
7. `/api/sabnzbd/queue/[nzoId]/priority/` (GET)
8. `/api/sabnzbd/queue/[nzoId]/resume/` (GET)

### Additional Sonarr Endpoints (10 endpoints missing)
The smoke test script includes some Sonarr endpoints, but is missing:
1. `/api/sonarr/` (GET)
2. `/api/sonarr/diskspace/` (GET)
3. `/api/sonarr/episode/[id]/` (GET)
4. `/api/sonarr/languageprofile/` (GET)
5. `/api/sonarr/qualityprofile/` (GET)
6. `/api/sonarr/queue/[id]/` (GET)
7. `/api/sonarr/rootfolder/` (GET)
8. `/api/sonarr/series/[id]/` (GET)
9. `/api/sonarr/series/lookup/` (GET)
10. `/api/sonarr/system/task/` (GET)
11. `/api/sonarr/update/` (GET)

## Recommendations

1. **Add Missing Service Endpoints**: The smoke test script should be updated to include endpoints for Prowlarr, Radarr, Readarr, and Readarr Audiobooks services.

2. **Complete Existing Service Coverage**: Add the missing endpoints for SABnzbd and Sonarr to ensure comprehensive testing.

3. **Prioritize Critical Endpoints**: Focus on adding endpoints that are essential for the core functionality of each service first.

4. **Maintain Safety Features**: Continue using the safe mode for destructive operations when adding new endpoints.

5. **Consider Configuration File**: As the number of endpoints grows, consider using a configuration file to manage endpoint definitions rather than hardcoding them in the script.

## Conclusion

The enhanced API smoke test script currently tests only 16 endpoints (8 for SABnzbd and 8 for Sonarr), which represents approximately 18% of the total 88 endpoints available in the project. Significant expansion is needed to achieve comprehensive API testing coverage.