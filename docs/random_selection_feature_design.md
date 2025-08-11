# Random Series Selection Feature Design

## Overview

This document outlines the design for the random series selection feature that will fetch the first 20 series from Sonarr, Radarr, Readarr, and Readarr_audiobooks and then select a random one for testing purposes.

## Implementation Status

✅ **Completed**: The random selection feature has been fully implemented and tested with all services.

✅ **Verified**: All services successfully return random items:
- Sonarr: Random series selection working (e.g., "All of Us Are Dead" ID: 21)
- Radarr: Random movie selection working (e.g., "13th" ID: 5562)
- Readarr: Random author selection working (e.g., "Dean R. Koontz" ID: 2)
- Readarr_audiobooks: Random author selection working (e.g., "Hugh Howey" ID: 17)

✅ **Integrated**: The feature is fully integrated into the enhanced API smoke test script and can be enabled with the `--enable-random-selection` flag.

## Feature Requirements

1. Fetch the first 20 items from each service:
   - Sonarr: TV series
   - Radarr: Movies
   - Readarr: Books
   - Readarr_audiobooks: Audiobooks

2. Select a random item from the fetched list

3. Return the selected item's information for testing

4. Handle errors gracefully when services are not configured or have no items

## Service Endpoints and Response Structure

### Sonarr
- **Endpoint**: `/api/sonarr/series`
- **Parameters**: `pageSize=20`
- **Response Structure**:
  ```json
  [
    {
      "id": 1,
      "title": "Series Title",
      "sortTitle": "series title",
      "status": "continuing",
      "overview": "Series overview",
      "year": 2023,
      "path": "/path/to/series",
      "qualityProfileId": 1,
      "seasons": [...],
      "seasonFolder": true,
      "monitored": true,
      "useSceneNumbering": false,
      "runtime": 45,
      "tvdbId": 12345,
      "tvRageId": 67890,
      "imdbId": "tt1234567",
      "images": [...],
      "genres": [...],
      "tags": [...],
      "added": "2023-01-01T00:00:00Z",
      "ratings": {...}
    }
  ]
  ```

### Radarr
- **Endpoint**: `/api/radarr/movie`
- **Parameters**: `pageSize=20`
- **Response Structure**:
  ```json
  [
    {
      "id": 1,
      "title": "Movie Title",
      "sortTitle": "movie title",
      "status": "released",
      "statusText": "Released",
      "overview": "Movie overview",
      "inCinemas": "2023-01-01",
      "physicalRelease": "2023-02-01",
      "digitalRelease": "2023-01-15",
      "year": 2023,
      "path": "/path/to/movie",
      "qualityProfileId": 1,
      "monitored": true,
      "minimumAvailability": "released",
      "isAvailable": true,
      "folderName": "Movie Title (2023)",
      "runtime": 120,
      "tmdbId": 12345,
      "imdbId": "tt1234567",
      "images": [...],
      "genres": [...],
      "tags": [...],
      "added": "2023-01-01T00:00:00Z",
      "ratings": {...}
    }
  ]
  ```

### Readarr
- **Endpoint**: `/api/readarr/book`
- **Parameters**: `pageSize=20`
- **Response Structure**:
  ```json
  [
    {
      "id": 1,
      "title": "Book Title",
      "titleSlug": "book-title",
      "releaseDate": "2023-01-01",
      "overview": "Book overview",
      "authorId": 1,
      "authorTitle": "Author Name",
      "disambiguation": "Disambiguation",
      "pageCount": 300,
      "images": [...],
      "links": [...],
      "ratings": {...},
      "statistics": {...},
      "monitored": true,
      "added": "2023-01-01T00:00:00Z"
    }
  ]
  ```

### Readarr_audiobooks
- **Endpoint**: `/api/readarr-audiobooks/book`
- **Parameters**: `pageSize=20`
- **Response Structure**:
  ```json
  [
    {
      "id": 1,
      "title": "Audiobook Title",
      "titleSlug": "audiobook-title",
      "releaseDate": "2023-01-01",
      "overview": "Audiobook overview",
      "authorId": 1,
      "authorTitle": "Author Name",
      "disambiguation": "Disambiguation",
      "duration": 300, // in minutes
      "images": [...],
      "links": [...],
      "ratings": {...},
      "statistics": {...},
      "monitored": true,
      "added": "2023-01-01T00:00:00Z"
    }
  ]
  ```

## Class Design

### MediaRandomSelector Class

```python
import random
import json
from typing import Optional, Dict, Any, List

class MediaRandomSelector:
    """Random media selector for testing purposes"""
    
    def __init__(self, http_client, service_name: str):
        """
        Initialize the media random selector
        
        Args:
            http_client: HTTP client instance for making requests
            service_name: Name of the service (sonarr, radarr, readarr, readarr_audiobooks)
        """
        self.http_client = http_client
        self.service_name = service_name
        self.service_config = self._get_service_config(service_name)
    
    def _get_service_config(self, service_name: str) -> Dict[str, Any]:
        """
        Get service-specific configuration for random selection
        
        Args:
            service_name: Name of the service
            
        Returns:
            Dictionary containing service configuration
        """
        configs = {
            'sonarr': {
                'endpoint': '/api/sonarr/series',
                'response_key': None,  # Response is a direct array
                'id_field': 'id',
                'title_field': 'title',
                'limit_param': 'pageSize',
                'additional_fields': ['year', 'status', 'overview'],
                'item_type': 'series'
            },
            'radarr': {
                'endpoint': '/api/radarr/movie',
                'response_key': None,  # Response is a direct array
                'id_field': 'id',
                'title_field': 'title',
                'limit_param': 'pageSize',
                'additional_fields': ['year', 'status', 'overview'],
                'item_type': 'movie'
            },
            'readarr': {
                'endpoint': '/api/readarr/book',
                'response_key': None,  # Response is a direct array
                'id_field': 'id',
                'title_field': 'title',
                'limit_param': 'pageSize',
                'additional_fields': ['authorTitle', 'releaseDate', 'pageCount'],
                'item_type': 'book'
            },
            'readarr_audiobooks': {
                'endpoint': '/api/readarr-audiobooks/book',
                'response_key': None,  # Response is a direct array
                'id_field': 'id',
                'title_field': 'title',
                'limit_param': 'pageSize',
                'additional_fields': ['authorTitle', 'releaseDate', 'duration'],
                'item_type': 'audiobook'
            }
        }
        return configs.get(service_name, {})
    
    def fetch_media_items(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Fetch media items from the service
        
        Args:
            limit: Maximum number of items to fetch
            
        Returns:
            List of media items
        """
        if not self.service_config:
            return []
        
        try:
            params = {self.service_config['limit_param']: limit}
            response = self.http_client.request('GET', self.service_config['endpoint'], params=params)
            
            if response['status_code'] == 200:
                data = json.loads(response['body'])
                
                # Handle different response structures
                if self.service_config['response_key']:
                    items = data.get(self.service_config['response_key'], [])
                else:
                    items = data if isinstance(data, list) else []
                
                return items[:limit]  # Ensure we don't exceed the limit
            else:
                print(f"Error fetching {self.service_name} items: HTTP {response['status_code']}")
                return []
                
        except Exception as e:
            print(f"Exception fetching {self.service_name} items: {str(e)}")
            return []
    
    def select_random_item(self, limit: int = 20) -> Optional[Dict[str, Any]]:
        """
        Select a random item from fetched media
        
        Args:
            limit: Maximum number of items to fetch
            
        Returns:
            Randomly selected media item or None if no items available
        """
        items = self.fetch_media_items(limit)
        if not items:
            return None
        
        return random.choice(items)
    
    def get_random_item_info(self, limit: int = 20) -> Optional[Dict[str, Any]]:
        """
        Get formatted information about a randomly selected item
        
        Args:
            limit: Maximum number of items to fetch
            
        Returns:
            Dictionary with formatted item information or None if no items available
        """
        item = self.select_random_item(limit)
        if not item:
            return None
        
        # Extract basic information
        info = {
            'id': item.get(self.service_config['id_field']),
            'title': item.get(self.service_config['title_field']),
            'service': self.service_name,
            'type': self.service_config['item_type']
        }
        
        # Add additional fields
        for field in self.service_config.get('additional_fields', []):
            if field in item:
                info[field] = item[field]
        
        return info
    
    def get_random_item_summary(self, limit: int = 20) -> str:
        """
        Get a human-readable summary of a randomly selected item
        
        Args:
            limit: Maximum number of items to fetch
            
        Returns:
            String summary of the random item or error message
        """
        item = self.get_random_item_info(limit)
        if not item:
            return f"No {self.service_config.get('item_type', 'items')} found in {self.service_name}"
        
        # Create service-specific summary
        if self.service_name == 'sonarr':
            return f"Random Series: {item['title']} ({item.get('year', 'N/A')}) - {item.get('status', 'N/A')}"
        elif self.service_name == 'radarr':
            return f"Random Movie: {item['title']} ({item.get('year', 'N/A')}) - {item.get('status', 'N/A')}"
        elif self.service_name == 'readarr':
            return f"Random Book: {item['title']} by {item.get('authorTitle', 'N/A')} ({item.get('releaseDate', 'N/A')})"
        elif self.service_name == 'readarr_audiobooks':
            return f"Random Audiobook: {item['title']} by {item.get('authorTitle', 'N/A')} ({item.get('releaseDate', 'N/A')})"
        else:
            return f"Random {item['type']}: {item['title']}"
```

### MediaRandomSelectorManager Class

```python
class MediaRandomSelectorManager:
    """Manager for handling random selection across multiple services"""
    
    def __init__(self, http_client):
        """
        Initialize the media random selector manager
        
        Args:
            http_client: HTTP client instance for making requests
        """
        self.http_client = http_client
        self.services = ['sonarr', 'radarr', 'readarr', 'readarr_audiobooks']
        self.selectors = {
            service: MediaRandomSelector(http_client, service)
            for service in self.services
        }
    
    def get_random_items_from_all_services(self, limit: int = 20) -> Dict[str, Optional[Dict[str, Any]]]:
        """
        Get random items from all services
        
        Args:
            limit: Maximum number of items to fetch from each service
            
        Returns:
            Dictionary mapping service names to random items
        """
        results = {}
        
        for service in self.services:
            try:
                item = self.selectors[service].get_random_item_info(limit)
                results[service] = item
            except Exception as e:
                print(f"Error getting random item from {service}: {str(e)}")
                results[service] = None
        
        return results
    
    def get_random_items_summary(self, limit: int = 20) -> str:
        """
        Get a summary of random items from all services
        
        Args:
            limit: Maximum number of items to fetch from each service
            
        Returns:
            String summary of random items from all services
        """
        items = self.get_random_items_from_all_services(limit)
        
        summary = "Random Items Summary:\n"
        summary += "=" * 50 + "\n"
        
        for service, item in items.items():
            if item:
                selector = self.selectors[service]
                summary += f"{service.upper()}: {selector.get_random_item_summary(limit)}\n"
            else:
                summary += f"{service.upper()}: No items found\n"
        
        return summary
    
    def select_random_service_item(self, services: List[str] = None, limit: int = 20) -> Optional[Dict[str, Any]]:
        """
        Select a random item from a random service
        
        Args:
            services: List of services to choose from (default: all services)
            limit: Maximum number of items to fetch from each service
            
        Returns:
            Random item from a random service or None if no items available
        """
        if services is None:
            services = self.services
        
        # Filter out services that don't have items
        available_services = []
        for service in services:
            try:
                if self.selectors[service].fetch_media_items(1):  # Test if service has items
                    available_services.append(service)
            except Exception:
                continue
        
        if not available_services:
            return None
        
        # Select a random service
        selected_service = random.choice(available_services)
        
        # Get a random item from the selected service
        return self.selectors[selected_service].get_random_item_info(limit)
```

## Integration with Test Runner

The random selection feature will be integrated into the `EnhancedAPITester` class:

```python
class EnhancedAPITester:
    def __init__(self, base_url, config_file=None, safe_mode=True, timeout=10, concurrency=8, use_openapi=True):
        # ... existing initialization code ...
        
        # Initialize random selection manager
        self.random_selector_manager = MediaRandomSelectorManager(self.http_client)
    
    def test_random_selection_feature(self, limit: int = 20):
        """
        Test the random selection feature for all services
        
        Args:
            limit: Maximum number of items to fetch from each service
        """
        print("\nTesting Random Selection Feature...")
        print("=" * 50)
        
        # Get random items from all services
        random_items = self.random_selector_manager.get_random_items_from_all_services(limit)
        
        # Create test results
        for service, item in random_items.items():
            if item:
                result = TestResult(
                    service=service,
                    endpoint=f"/{service}/random",
                    method="GET",
                    test_name="Random Selection Test",
                    status="PASS",
                    http_status=200,
                    error_message=None,
                    elapsed_ms=0,
                    request_body=None,
                    response_body=json.dumps(item),
                    validation_results={},
                    safety_notes=None
                )
                self.test_results.append(result)
                
                # Print the random item
                selector = self.random_selector_manager.selectors[service]
                print(f"✅ {service.upper()}: {selector.get_random_item_summary(limit)}")
            else:
                result = TestResult(
                    service=service,
                    endpoint=f"/{service}/random",
                    method="GET",
                    test_name="Random Selection Test",
                    status="FAIL",
                    http_status=None,
                    error_message="No items found for random selection",
                    elapsed_ms=0,
                    request_body=None,
                    response_body=None,
                    validation_results={},
                    safety_notes=None
                )
                self.test_results.append(result)
                
                print(f"❌ {service.upper()}: No items found")
        
        print("=" * 50)
```

## Usage Examples

### Basic Usage
```python
# Initialize HTTP client
http_client = HTTPClient(base_url="http://localhost:3000")

# Create selector for Sonarr
sonarr_selector = MediaRandomSelector(http_client, "sonarr")

# Get a random series
random_series = sonarr_selector.get_random_item_info()
if random_series:
    print(f"Random series: {random_series['title']} ({random_series['year']})")
```

### Multi-Service Usage
```python
# Initialize manager
manager = MediaRandomSelectorManager(http_client)

# Get random items from all services
all_random_items = manager.get_random_items_from_all_services()

# Print summary
print(manager.get_random_items_summary())
```

### Testing Integration
```python
# Initialize tester
tester = EnhancedAPITester(base_url="http://localhost:3000")

# Test random selection feature
tester.test_random_selection_feature(limit=20)

# Generate reports
tester.generate_reports()
```

## Error Handling

The random selection feature includes robust error handling:

1. **Service Not Configured**: Gracefully handle cases where a service is not configured
2. **Empty Responses**: Handle cases where services return empty lists
3. **Network Errors**: Handle network timeouts and connection issues
4. **Invalid Responses**: Handle malformed JSON or unexpected response structures
5. **Missing Fields**: Handle cases where expected fields are missing from responses

## Performance Considerations

1. **Caching**: Consider caching responses to avoid repeated requests
2. **Timeouts**: Use appropriate timeouts for network requests
3. **Limits**: Respect the limit parameter to avoid excessive data transfer
4. **Concurrency**: Consider concurrent requests for multiple services

## Future Enhancements

1. **Filtering**: Add filtering options (e.g., by status, year, genre)
2. **Weighted Selection**: Implement weighted random selection based on item properties
3. **Batch Processing**: Support for processing multiple random items at once
4. **Custom Endpoints**: Allow customization of endpoints and parameters
5. **Response Transformation**: Add options for transforming response data