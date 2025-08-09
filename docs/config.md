# Dashboard Configuration Guide

## Overview

The dashboard supports two connection modes for accessing backend services: **local** and **remote**. This dual-mode architecture allows for seamless operation whether you're running services on your local network or accessing them remotely through Traefik.

## Connection Modes

### Local Mode
- **Environment Variable**: `BACKEND_TARGET=local`
- **Description**: The Next.js server connects directly to services on your LAN
- **API Keys**: Stored in server-side environment variables (`LOCAL_*_API_KEY`)
- **Base URLs**: Use local network addresses (`LOCAL_*_BASE_URL`)
- **Security**: API keys never exposed to the client browser

### Remote Mode
- **Environment Variable**: `BACKEND_TARGET=remote`
- **Description**: All requests go through Next.js API proxy to remote services via Traefik
- **API Keys**: Stored in server-side environment variables (`REMOTE_*_API_KEY`)
- **Base URLs**: Use remote service addresses (`REMOTE_*_BASE_URL`)
- **Traefik**: Uses bypass headers for authentication
- **Security**: API keys and Traefik headers injected server-side only

## Environment Schema

### Required Variables

```bash
# Connection mode (required)
BACKEND_TARGET=local|remote

# Local mode configuration
LOCAL_SABNZBD_BASE_URL=http://localhost:8080
LOCAL_SABNZBD_API_KEY=your-sab-api-key
LOCAL_SONARR_BASE_URL=http://localhost:8989
LOCAL_SONARR_API_KEY=your-sonarr-api-key
LOCAL_RADARR_BASE_URL=http://localhost:7878
LOCAL_RADARR_API_KEY=your-radarr-api-key
LOCAL_PROWLARR_BASE_URL=http://localhost:9696
LOCAL_PROWLARR_API_KEY=your-prowlarr-api-key
LOCAL_READARR_BASE_URL=http://localhost:8787
LOCAL_READARR_API_KEY=your-readarr-api-key
LOCAL_READARR_AUDIOBOOKS_BASE_URL=http://localhost:8788
LOCAL_READARR_AUDIOBOOKS_API_KEY=your-readarr-audiobooks-api-key

# Remote mode configuration
REMOTE_SABNZBD_BASE_URL=https://sabnzbd.example.com
REMOTE_SABNZBD_API_KEY=your-sab-api-key
REMOTE_SONARR_BASE_URL=https://sonarr.example.com
REMOTE_SONARR_API_KEY=your-sonarr-api-key
REMOTE_RADARR_BASE_URL=https://radarr.example.com
REMOTE_RADARR_API_KEY=your-radarr-api-key
REMOTE_PROWLARR_BASE_URL=https://prowlarr.example.com
REMOTE_PROWLARR_API_KEY=your-prowlarr-api-key
REMOTE_READARR_BASE_URL=https://readarr.example.com
REMOTE_READARR_API_KEY=your-readarr-api-key
REMOTE_READARR_AUDIOBOOKS_BASE_URL=https://readarr-audiobooks.example.com
REMOTE_READARR_AUDIOBOOKS_API_KEY=your-readarr-audiobooks-api-key

# Traefik configuration (remote mode only)
REMOTE_TRAEFIK_BYPASS_HEADER=X-Forwarded-User
REMOTE_TRAEFIK_BYPASS_KEY=your-traefik-bypass-key

# Public configuration (safe for client)
NEXT_PUBLIC_BACKEND_TARGET=local|remote
```

### Optional Variables

```bash
# Dashboard customization (optional)
NEXT_PUBLIC_APP_NAME="Media Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Unified media management interface"
```

## Migration Steps

### From Public API Keys (Old Method)

1. **Remove all NEXT_PUBLIC_*_API_KEY entries** from your environment
2. **Add symmetric LOCAL_* and REMOTE_* variables** for each service
3. **Set BACKEND_TARGET** to your preferred connection mode
4. **Add NEXT_PUBLIC_BACKEND_TARGET** for client-side display
5. **Configure Traefik bypass headers** if using remote mode

### Example Migration

**Before (old method):**
```bash
NEXT_PUBLIC_SABNZBD_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SABNZBD_API_KEY=abc123
NEXT_PUBLIC_SONARR_BASE_URL=http://localhost:8989
NEXT_PUBLIC_SONARR_API_KEY=def456
```

**After (new method):**
```bash
BACKEND_TARGET=local
NEXT_PUBLIC_BACKEND_TARGET=local

LOCAL_SABNZBD_BASE_URL=http://localhost:8080
LOCAL_SABNZBD_API_KEY=abc123
LOCAL_SONARR_BASE_URL=http://localhost:8989
LOCAL_SONARR_API_KEY=def456

# Remote configuration (example only)
REMOTE_SABNZBD_BASE_URL=https://sabnzbd.example.com
REMOTE_SABNZBD_API_KEY=abc123
REMOTE_SONARR_BASE_URL=https://sonarr.example.com
REMOTE_SONARR_API_KEY=def456
REMOTE_TRAEFIK_BYPASS_HEADER=X-Forwarded-User
REMOTE_TRAEFIK_BYPASS_KEY=traefik-key
```

## Service Endpoints

All client requests go through Next.js API proxy endpoints:

| Service | Proxy Endpoint | Description |
|---------|---------------|-------------|
| SABnzbd | `/api/sab` | Download manager |
| Sonarr | `/api/sonarr` | TV series management |
| Radarr | `/api/radarr` | Movie management |
| Prowlarr | `/api/prowlarr` | Indexer management |
| Readarr | `/api/readarr` | Book management |
| Readarr Audiobooks | `/api/readarr-audiobooks` | Audiobook management |

## Troubleshooting

### Common Issues

#### 1. Services Not Connecting
- **Check**: `BACKEND_TARGET` matches your intended mode
- **Verify**: Service URLs are correct for the selected mode
- **Test**: Direct service access in browser
- **Logs**: Check Next.js server logs for proxy errors

#### 2. API Key Errors
- **Check**: API keys are correct for the selected mode
- **Verify**: No NEXT_PUBLIC_*_API_KEY variables remain
- **Test**: API keys work directly with services
- **Note**: Keys are server-side only, never in browser

#### 3. Traefik Issues (Remote Mode)
- **Check**: Traefik bypass header and key are correct
- **Verify**: Traefik routes are configured properly
- **Test**: Direct access through Traefik works
- **Headers**: Verify bypass header is being sent

#### 4. Mixed Mode Issues
- **Symptom**: Some services work, others don't
- **Check**: All services have both LOCAL and REMOTE configs
- **Verify**: No partial old configuration remains
- **Test**: Each service individually

### Debug Commands

```bash
# Check environment variables
echo "BACKEND_TARGET: $BACKEND_TARGET"
echo "Mode: $NEXT_PUBLIC_BACKEND_TARGET"

# Test direct service access
curl -H "X-Api-Key: your-key" http://localhost:8080/api?mode=queue

# Test proxy endpoint
curl http://localhost:3000/api/sab?mode=queue

# Check Next.js logs
npm run dev
```

### Configuration Validation

Use the included smoke test script to validate your configuration:

```bash
# Test all endpoints
python scripts/api_smoke_test.py

# Test with additional services
python scripts/api_smoke_test.py --include-arr
```

## Security Notes

### API Key Security
- **Never expose API keys in client-side code**
- **Use server-side environment variables only**
- **Rotate keys regularly**
- **Use different keys for different services**

### Network Security
- **Local mode**: Restrict to internal network access
- **Remote mode**: Use HTTPS and proper authentication
- **Traefik**: Configure proper access controls
- **Firewall**: Only expose necessary ports

### Environment Variables
- **Store secrets in .env.local (never commit)**
- **Use .env.example as template**
- **Document required variables for deployment**
- **Validate environment on startup**

## Support

For additional help:
1. Check the troubleshooting section above
2. Run the smoke test script to identify issues
3. Review server logs for error messages
4. Verify service configurations individually
5. Check network connectivity and firewall rules