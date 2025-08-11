# Media Management Dashboard

A comprehensive dashboard for managing and monitoring media services including Sonarr, Radarr, Prowlarr, Readarr, Readarr Audiobooks, and SABnzbd. This dashboard provides a unified interface for managing your media collection across multiple services.

## Features

### 🎬 Unified Media Management
- **Sonarr**: TV series management with episode tracking and scheduling
- **Radarr**: Movie collection management with quality profiles
- **Prowlarr**: Indexer management for optimal search results
- **Readarr**: Ebook and audiobook collection management
- **Readarr Audiobooks**: Specialized audiobook management
- **SABnzbd**: Usenet download management with queue control

### 📊 Dashboard Overview
- **Real-time Statistics**: Monitor system status across all services
- **Queue Management**: View and manage download queues
- **Health Monitoring**: Track service health and performance
- **Disk Space**: Monitor storage usage across services
- **Calendar Integration**: View upcoming releases and scheduled downloads

### 🛠️ Advanced Features
- **OpenAPI Support**: Full OpenAPI specification integration for all services
- **Random Media Selection**: Discover random content from your collection
- **Comprehensive API Testing**: Built-in testing framework for all endpoints
- **Safe Testing Guidelines**: Built-in safeguards to prevent accidental data loss
- **Configuration Management**: Centralized configuration for all services

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Access to media services (Sonarr, Radarr, etc.)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dashboard_v3

# Install dependencies
pnpm install
```

### Configuration

1. Copy the environment template:
```bash
cp docs/env.local.template.md .env.local
```

2. Configure your services in `.env.local`:
```bash
# Sonarr Configuration
NEXT_PUBLIC_SONARR_URL=http://localhost:8989
SONARR_API_KEY=your-sonarr-api-key

# Radarr Configuration
NEXT_PUBLIC_RADARR_URL=http://localhost:7878
RADARR_API_KEY=your-radarr-api-key

# Add other services as needed...
```

### Running the Dashboard

```bash
# Start development server
pnpm dev

# Production build
pnpm build
pnpm start
```

The dashboard will be available at `http://localhost:3000`.

## Dashboard Components

### Main Dashboard
- **Overall Statistics**: Key metrics across all services
- **Service Status**: Real-time health monitoring
- **Recent Activity**: Latest downloads and additions
- **System Information**: Hardware and resource usage

### Service-Specific Dashboards
Each service has its own dedicated dashboard with:
- **Service Overview**: Key metrics and status
- **Queue Management**: Active downloads and their status
- **History**: Past downloads and activities
- **Settings**: Service-specific configuration options

### Module Details
- **Detailed Information**: In-depth view of media items
- **Management Actions**: Add, remove, or modify content
- **Quality Profiles**: Configure quality settings
- **Search and Discovery**: Find new content to add

## API Documentation

For detailed API documentation and testing information, see the `docs/endpoint/` directory:

- [`docs/endpoint/README.md`](docs/endpoint/README.md) - API Testing Framework Documentation
- [`docs/endpoint/enhanced_api_smoke_test_plan.md`](docs/endpoint/enhanced_api_smoke_test_plan.md) - Enhanced API Testing Plan
- [`docs/endpoint/service_test_plan.md`](docs/endpoint/service_test_plan.md) - Service-Specific Test Plans
- [`docs/endpoint/safe_testing_guidelines.md`](docs/endpoint/safe_testing_guidelines.md) - Safe Testing Guidelines

## Architecture

### Frontend
- **Next.js**: React framework with server-side rendering
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern React component library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Proxy Architecture**: Secure proxy to media services
- **OpenAPI Integration**: Dynamic API documentation
- **CORS Configuration**: Secure cross-origin requests

### Testing Framework
- **Comprehensive Testing**: Full endpoint coverage
- **Safety Mechanisms**: Built-in safeguards
- **Performance Monitoring**: Response time tracking
- **Error Handling**: Robust error management

## Service Integration

### Supported Services
1. **Sonarr** - TV Series Management
   - Series tracking and monitoring
   - Episode scheduling and downloading
   - Quality profile management
   - Calendar integration

2. **Radarr** - Movie Collection Management
   - Movie library management
   - Quality profile configuration
   - Release monitoring
   - Disk space management

3. **Prowlarr** - Indexer Management
   - Indexer configuration and testing
   - Application management
   - Download client integration
   - Health monitoring

4. **Readarr** - Ebook Management
   - Book library management
   - Author tracking
   - Quality profiles
   - Metadata management

5. **Readarr Audiobooks** - Audiobook Management
   - Audiobook library management
   - Duration tracking
   - Quality profiles
   - Metadata management

6. **SABnzbd** - Usenet Download Manager
   - Queue management
   - Download history
   - Category management
   - Server statistics

## Configuration

### Environment Variables
All configuration is handled through environment variables:

```bash
# Service URLs
NEXT_PUBLIC_SONARR_URL=http://localhost:8989
NEXT_PUBLIC_RADARR_URL=http://localhost:7878
NEXT_PUBLIC_PROWLARR_URL=http://localhost:9696
NEXT_PUBLIC_READARR_URL=http://localhost:8787
NEXT_PUBLIC_READARR_AUDIOBOOKS_URL=http://localhost:8788
NEXT_PUBLIC_SABNZBD_URL=http://localhost:8080

# API Keys
SONARR_API_KEY=your-api-key
RADARR_API_KEY=your-api-key
PROWLARR_API_KEY=your-api-key
READARR_API_KEY=your-api-key
READARR_AUDIOBOOKS_API_KEY=your-api-key
SABNZBD_API_KEY=your-api-key
```

### Service Settings
Each service can be configured through:
- **Dashboard UI**: User-friendly configuration interface
- **Environment Variables**: For deployment configuration
- **Configuration Files**: For advanced settings

## Development

### Project Structure
```
dashboard_v3/
├── app/                    # Next.js application
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   └── *.tsx             # Dashboard components
├── docs/                  # Documentation
│   └── endpoint/         # API documentation
├── lib/                   # Utility libraries
├── public/                # Static assets
└── styles/               # CSS styles
```

### Adding New Services
1. Create API routes in `app/api/{service_name}/`
2. Add service configuration to environment variables
3. Create dashboard components in `components/`
4. Update the main dashboard to include the new service
5. Add documentation to `docs/endpoint/`

### Running Tests
```bash
# Run API smoke tests
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000

# Run with OpenAPI support
python3 scripts/enhanced_api_smoke_test.py --base http://localhost:3000 --use-openapi
```

## Troubleshooting

### Common Issues

#### Service Connection Problems
- Verify service URLs are correct
- Check API keys are valid
- Ensure services are running and accessible
- Check firewall and network settings

#### Dashboard Loading Issues
- Clear browser cache
- Check console for errors
- Verify all dependencies are installed
- Restart the development server

#### API Testing Failures
- Review safe testing guidelines
- Check service configurations
- Verify endpoint availability
- Consult API documentation

### Support

For support and questions:
- Check the documentation in the `docs/` directory
- Review API testing information in `docs/endpoint/`
- Check the changelog for recent updates
- Create an issue in the repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details on changes to the project.