# .env.local template (dual-mode: remote | local)

Copy this content into a file named .env.local and fill in the values. Secrets should never be committed.

Mode toggles
- BACKEND_TARGET controls server behavior. Default to local.
- NEXT_PUBLIC_BACKEND_TARGET is for UI display only and should mirror BACKEND_TARGET.

Traefik header pair (remote mode only)
- A single header name and value used by Traefik ForwardAuth when calling upstream services in remote mode.

Remote targets (no API keys)
- Provide the public reverse-proxied URLs for each service (include https://).
- Optional URL base is the subpath behind the proxy, if any; leave empty if none.

Local targets (with API keys)
- Provide local base URLs (include http:// and explicit ports) and the corresponding API keys for each service.

Example scaffold to fill in:

```dotenv
# Mode toggles
BACKEND_TARGET=local
NEXT_PUBLIC_BACKEND_TARGET=local

# Traefik single header pair (applied in remote mode by server proxies)
REMOTE_TRAEFIK_BYPASS_HEADER=traefik-auth-bypass-key
REMOTE_TRAEFIK_BYPASS_KEY=UIhGhEcE2uWxjAiO

# =======================
# Remote targets (no API keys)
# =======================
# SABnzbd
REMOTE_SABNZBD_BASE_URL=https://sabnzbd.blankcanvas.photos

# Sonarr
REMOTE_SONARR_BASE_URL=https://sonarr.blankcanvas.photos
REMOTE_SONARR_URL_BASE=

# Radarr
REMOTE_RADARR_BASE_URL=https://radarr.blankcanvas.photos
REMOTE_RADARR_URL_BASE=

# Prowlarr
REMOTE_PROWLARR_BASE_URL=https://prowlarr.blankcanvas.photos
REMOTE_PROWLARR_URL_BASE=

# Readarr
REMOTE_READARR_BASE_URL=https://readarr.blankcanvas.photos
REMOTE_READARR_URL_BASE=

# Readarr Audiobooks
REMOTE_READARR_AUDIOBOOKS_BASE_URL=https://readarr-audiobooks.blankcanvas.photos
REMOTE_READARR_AUDIOBOOKS_URL_BASE=

# =======================
# Local targets (with API keys)
# =======================
# SABnzbd
LOCAL_SABNZBD_BASE_URL=http://192.168.3.1:8080
LOCAL_SABNZBD_API_KEY=5b348af2e4e64198857984c54bc24c98

# Sonarr
LOCAL_SONARR_BASE_URL=http://192.168.3.10:8989
LOCAL_SONARR_API_KEY=e8b77c3396294527aafd83a2fd36bc72
LOCAL_SONARR_URL_BASE=

# Radarr
LOCAL_RADARR_BASE_URL=http://192.168.3.12:7878
LOCAL_RADARR_API_KEY=0995f49fd5934786aebd7aea9a48dcc9
LOCAL_RADARR_URL_BASE=

# Prowlarr
LOCAL_PROWLARR_BASE_URL=http://192.168.3.3:9696
LOCAL_PROWLARR_API_KEY=4dc49e792ab44133adab2bdc1e20f3b4
LOCAL_PROWLARR_URL_BASE=

# Readarr
LOCAL_READARR_BASE_URL=http://192.168.3.14:8787
LOCAL_READARR_API_KEY=f4acbe1f5b8d42519982ba61af763d13
LOCAL_READARR_URL_BASE=

# Readarr Audiobooks
LOCAL_READARR_AUDIOBOOKS_BASE_URL=http://192.168.3.15:8788
LOCAL_READARR_AUDIOBOOKS_API_KEY=b3228d245012427d88e4923b3fe04199
LOCAL_READARR_AUDIOBOOKS_URL_BASE=
```

Notes
- Only API routes are used by the client: /api/sab, /api/sonarr, /api/radarr, /api/prowlarr, /api/readarr, /api/readarr-audiobooks.
- API keys must not appear in NEXT_PUBLIC_* variables.
- In remote mode, the server attaches the Traefik header pair to upstream requests if both REMOTE_TRAEFIK_BYPASS_* are set.
- URL base variables let you support services mounted under a path (e.g., /sonarr). Leave blank if service is at domain root.