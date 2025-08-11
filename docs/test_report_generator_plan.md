# Test Report Generator Plan

## Overview

This document outlines the design and implementation of a comprehensive test report generator for the dashboard application's API endpoints. The report generator will analyze test results and produce detailed reports that clearly identify which endpoints work and which don't, along with actionable insights for fixing issues.

## Report Generator Architecture

### 1. Core Components

```
test_report_generator/
├── core/
│   ├── data_collector.py        # Collects and aggregates test data
│   ├── analyzer.py              # Analyzes test results and identifies patterns
│   ├── report_generator.py      # Generates reports in various formats
│   └── templates/               # Report templates
│       ├── html_template.html   # HTML report template
│       ├── json_template.json   # JSON report structure
│       └── markdown_template.md # Markdown report template
├── formatters/
│   ├── html_formatter.py        # HTML report formatting
│   ├── json_formatter.py        # JSON report formatting
│   ├── console_formatter.py     # Console report formatting
│   └── markdown_formatter.py    # Markdown report formatting
├── analyzers/
│   ├── performance_analyzer.py  # Performance analysis
│   ├── error_analyzer.py       # Error pattern analysis
│   ├── endpoint_analyzer.py    # Endpoint-specific analysis
│   └── trend_analyzer.py       # Trend analysis (historical data)
└── utils/
    ├── chart_generator.py       # Chart and graph generation
    ├── data_exporter.py         # Data export utilities
    └── notification_manager.py  # Notification system
```

### 2. Data Flow

```
Test Results → Data Collector → Analyzer → Report Generator → Formatted Reports
```

## Report Types and Formats

### 1. Executive Summary Report

**Purpose**: High-level overview for stakeholders and decision-makers
**Format**: HTML, PDF
**Content**:
- Overall pass/fail rate
- Critical issues summary
- Service health overview
- Key recommendations
- Trend analysis (if historical data available)

### 2. Technical Detail Report

**Purpose**: Detailed technical information for developers
**Format**: HTML, JSON, Markdown
**Content**:
- Complete endpoint test results
- Error categorization and analysis
- Performance metrics
- Request/response details
- Specific error messages and stack traces

### 3. Service-Specific Reports

**Purpose**: Focused analysis per service (SABnzbd, Sonarr, etc.)
**Format**: HTML, JSON
**Content**:
- Service-specific pass/fall rates
- Endpoint-by-endpoint breakdown
- Service-specific issues
- Service health metrics

### 4. Performance Report

**Purpose**: Performance analysis and optimization insights
**Format**: HTML, JSON
**Content**:
- Response time analysis
- Slow endpoint identification
- Performance trends
- Bottleneck analysis

### 5. Error Analysis Report

**Purpose**: Deep dive into errors and failure patterns
**Format**: HTML, JSON
**Content**:
- Error categorization
- Common error patterns
- Root cause analysis
- Error frequency analysis

## Implementation Details

### 1. Data Collector (`core/data_collector.py`)

```python
class TestDataCollector:
    def __init__(self):
        self.test_results = []
        self.metadata = {}
    
    def collect_results(self, results):
        """Collect and normalize test results"""
        normalized_results = []
        
        for result in results:
            normalized_result = {
                'service': result.service,
                'endpoint': result.endpoint,
                'method': result.method,
                'test_name': result.test_name,
                'status': result.status,
                'http_status': result.http_status,
                'error_message': result.error_message,
                'elapsed_ms': result.elapsed_ms,
                'timestamp': datetime.now().isoformat(),
                'validation_results': result.validation_results
            }
            normalized_results.append(normalized_result)
        
        self.test_results = normalized_results
        return normalized_results
    
    def collect_metadata(self, config, environment_info):
        """Collect test metadata"""
        self.metadata = {
            'test_config': config,
            'environment': environment_info,
            'test_timestamp': datetime.now().isoformat(),
            'total_tests': len(self.test_results),
            'services_tested': list(set(r['service'] for r in self.test_results))
        }
        return self.metadata
```

### 2. Result Analyzer (`core/analyzer.py`)

```python
class ResultAnalyzer:
    def __init__(self, test_results, metadata):
        self.test_results = test_results
        self.metadata = metadata
    
    def analyze_overall_health(self):
        """Analyze overall system health"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['status'] == 'PASS')
        failed_tests = total_tests - passed_tests
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'pass_rate': (passed_tests / total_tests) * 100 if total_tests > 0 else 0,
            'health_status': 'healthy' if (passed_tests / total_tests) > 0.9 else 'needs_attention'
        }
    
    def analyze_by_service(self):
        """Analyze results by service"""
        service_analysis = {}
        
        for result in self.test_results:
            service = result['service']
            if service not in service_analysis:
                service_analysis[service] = {
                    'total_tests': 0,
                    'passed_tests': 0,
                    'failed_tests': 0,
                    'endpoints': set()
                }
            
            service_analysis[service]['total_tests'] += 1
            if result['status'] == 'PASS':
                service_analysis[service]['passed_tests'] += 1
            else:
                service_analysis[service]['failed_tests'] += 1
            
            service_analysis[service]['endpoints'].add(result['endpoint'])
        
        # Calculate pass rates
        for service, data in service_analysis.items():
            data['pass_rate'] = (data['passed_tests'] / data['total_tests']) * 100
            data['endpoint_count'] = len(data['endpoints'])
            data['health_status'] = 'healthy' if data['pass_rate'] > 90 else 'needs_attention'
        
        return service_analysis
    
    def analyze_errors(self):
        """Analyze error patterns"""
        error_analysis = {
            'total_errors': 0,
            'error_categories': {
                'network_errors': 0,
                'http_errors': 0,
                'validation_errors': 0,
                'timeout_errors': 0,
                'other_errors': 0
            },
            'common_errors': {},
            'error_by_endpoint': {},
            'error_by_service': {}
        }
        
        for result in self.test_results:
            if result['status'] == 'FAIL':
                error_analysis['total_errors'] += 1
                
                # Categorize errors
                error_message = result.get('error_message', '')
                http_status = result.get('http_status', None)
                
                if http_status:
                    error_analysis['error_categories']['http_errors'] += 1
                elif 'timeout' in error_message.lower():
                    error_analysis['error_categories']['timeout_errors'] += 1
                elif 'network' in error_message.lower() or 'connection' in error_message.lower():
                    error_analysis['error_categories']['network_errors'] += 1
                elif 'validation' in error_message.lower():
                    error_analysis['error_categories']['validation_errors'] += 1
                else:
                    error_analysis['error_categories']['other_errors'] += 1
                
                # Track common errors
                if error_message:
                    error_analysis['common_errors'][error_message] = \
                        error_analysis['common_errors'].get(error_message, 0) + 1
                
                # Track errors by endpoint
                endpoint = result['endpoint']
                if endpoint not in error_analysis['error_by_endpoint']:
                    error_analysis['error_by_endpoint'][endpoint] = 0
                error_analysis['error_by_endpoint'][endpoint] += 1
                
                # Track errors by service
                service = result['service']
                if service not in error_analysis['error_by_service']:
                    error_analysis['error_by_service'][service] = 0
                error_analysis['error_by_service'][service] += 1
        
        return error_analysis
    
    def analyze_performance(self):
        """Analyze performance metrics"""
        performance_data = {
            'average_response_time': 0,
            'min_response_time': float('inf'),
            'max_response_time': 0,
            'slow_endpoints': [],
            'performance_by_service': {},
            'performance_by_endpoint': {}
        }
        
        response_times = []
        
        for result in self.test_results:
            response_time = result['elapsed_ms']
            response_times.append(response_time)
            
            # Update min/max
            performance_data['min_response_time'] = min(performance_data['min_response_time'], response_time)
            performance_data['max_response_time'] = max(performance_data['max_response_time'], response_time)
            
            # Analyze by service
            service = result['service']
            if service not in performance_data['performance_by_service']:
                performance_data['performance_by_service'][service] = []
            performance_data['performance_by_service'][service].append(response_time)
            
            # Analyze by endpoint
            endpoint = result['endpoint']
            if endpoint not in performance_data['performance_by_endpoint']:
                performance_data['performance_by_endpoint'][endpoint] = []
            performance_data['performance_by_endpoint'][endpoint].append(response_time)
        
        # Calculate average
        if response_times:
            performance_data['average_response_time'] = sum(response_times) / len(response_times)
        
        # Identify slow endpoints (over 2 seconds)
        slow_threshold = 2000
        for endpoint, times in performance_data['performance_by_endpoint'].items():
            avg_time = sum(times) / len(times)
            if avg_time > slow_threshold:
                performance_data['slow_endpoints'].append({
                    'endpoint': endpoint,
                    'average_time': avg_time,
                    'max_time': max(times)
                })
        
        # Calculate service averages
        for service, times in performance_data['performance_by_service'].items():
            performance_data['performance_by_service'][service] = {
                'average_time': sum(times) / len(times),
                'min_time': min(times),
                'max_time': max(times)
            }
        
        return performance_data
```

### 3. Report Generator (`core/report_generator.py`)

```python
class ReportGenerator:
    def __init__(self, test_results, metadata):
        self.test_results = test_results
        self.metadata = metadata
        self.analyzer = ResultAnalyzer(test_results, metadata)
        self.formatters = {
            'html': HTMLFormatter(),
            'json': JSONFormatter(),
            'console': ConsoleFormatter(),
            'markdown': MarkdownFormatter()
        }
    
    def generate_executive_summary(self, format_type='html'):
        """Generate executive summary report"""
        # Analyze data
        overall_health = self.analyzer.analyze_overall_health()
        service_analysis = self.analyzer.analyze_by_service()
        error_analysis = self.analyzer.analyze_errors()
        
        # Prepare report data
        report_data = {
            'title': 'API Test Executive Summary',
            'generated_at': datetime.now().isoformat(),
            'overall_health': overall_health,
            'service_analysis': service_analysis,
            'error_summary': {
                'total_errors': error_analysis['total_errors'],
                'error_distribution': error_analysis['error_categories']
            },
            'key_findings': self._generate_key_findings(overall_health, service_analysis, error_analysis),
            'recommendations': self._generate_recommendations(overall_health, service_analysis, error_analysis)
        }
        
        # Generate formatted report
        return self.formatters[format_type].format_executive_summary(report_data)
    
    def generate_technical_report(self, format_type='html'):
        """Generate detailed technical report"""
        # Analyze data
        overall_health = self.analyzer.analyze_overall_health()
        service_analysis = self.analyzer.analyze_by_service()
        error_analysis = self.analyzer.analyze_errors()
        performance_analysis = self.analyzer.analyze_performance()
        
        # Prepare report data
        report_data = {
            'title': 'API Test Technical Report',
            'generated_at': datetime.now().isoformat(),
            'metadata': self.metadata,
            'overall_health': overall_health,
            'service_analysis': service_analysis,
            'error_analysis': error_analysis,
            'performance_analysis': performance_analysis,
            'detailed_results': self.test_results
        }
        
        # Generate formatted report
        return self.formatters[format_type].format_technical_report(report_data)
    
    def generate_service_report(self, service_name, format_type='html'):
        """Generate service-specific report"""
        # Filter results for specific service
        service_results = [r for r in self.test_results if r['service'] == service_name]
        
        # Analyze service data
        service_analyzer = ResultAnalyzer(service_results, self.metadata)
        service_health = service_analyzer.analyze_overall_health()
        service_errors = service_analyzer.analyze_errors()
        service_performance = service_analyzer.analyze_performance()
        
        # Prepare report data
        report_data = {
            'title': f'{service_name} API Test Report',
            'service_name': service_name,
            'generated_at': datetime.now().isoformat(),
            'service_health': service_health,
            'error_analysis': service_errors,
            'performance_analysis': service_performance,
            'detailed_results': service_results
        }
        
        # Generate formatted report
        return self.formatters[format_type].format_service_report(report_data)
    
    def _generate_key_findings(self, overall_health, service_analysis, error_analysis):
        """Generate key findings from analysis"""
        findings = []
        
        # Overall health findings
        if overall_health['pass_rate'] > 95:
            findings.append("System health is excellent with over 95% pass rate")
        elif overall_health['pass_rate'] > 80:
            findings.append("System health is good but has room for improvement")
        else:
            findings.append("System health needs immediate attention")
        
        # Service-specific findings
        for service, data in service_analysis.items():
            if data['pass_rate'] < 80:
                findings.append(f"{service} service has low pass rate ({data['pass_rate']:.1f}%)")
            elif data['pass_rate'] > 95:
                findings.append(f"{service} service is performing excellently ({data['pass_rate']:.1f}%)")
        
        # Error findings
        if error_analysis['total_errors'] > 0:
            most_common_error = max(error_analysis['common_errors'].items(), key=lambda x: x[1])
            findings.append(f"Most common error: '{most_common_error[0]}' ({most_common_error[1]} occurrences)")
        
        return findings
    
    def _generate_recommendations(self, overall_health, service_analysis, error_analysis):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Overall recommendations
        if overall_health['pass_rate'] < 90:
            recommendations.append("Priority: Address failing endpoints to improve overall system health")
        
        # Service-specific recommendations
        for service, data in service_analysis.items():
            if data['pass_rate'] < 80:
                recommendations.append(f"High Priority: Investigate and fix failing endpoints in {service} service")
            elif data['pass_rate'] < 95:
                recommendations.append(f"Medium Priority: Optimize endpoints in {service} service")
        
        # Error-specific recommendations
        if error_analysis['error_categories']['network_errors'] > 0:
            recommendations.append("Check network connectivity and timeout settings")
        
        if error_analysis['error_categories']['http_errors'] > 0:
            recommendations.append("Review HTTP error handling and status codes")
        
        if error_analysis['error_categories']['timeout_errors'] > 0:
            recommendations.append("Increase timeout values or optimize endpoint performance")
        
        return recommendations
```

### 4. HTML Formatter (`formatters/html_formatter.py`)

```python
class HTMLFormatter:
    def format_executive_summary(self, report_data):
        """Format executive summary as HTML"""
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>{title}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background-color: #f0f0f0; padding: 20px; border-radius: 5px; }}
                .metric {{ display: inline-block; margin: 10px; padding: 15px; background-color: #e8f4f8; border-radius: 5px; }}
                .service-health {{ margin: 20px 0; }}
                .recommendations {{ background-color: #fff3cd; padding: 15px; border-radius: 5px; }}
                .findings {{ background-color: #d4edda; padding: 15px; border-radius: 5px; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{title}</h1>
                <p>Generated: {generated_at}</p>
            </div>
            
            <div class="metrics">
                <div class="metric">
                    <h3>Overall Health</h3>
                    <p>Pass Rate: {overall_health[pass_rate]:.1f}%</p>
                    <p>Status: {overall_health[health_status]}</p>
                </div>
                <div class="metric">
                    <h3>Test Summary</h3>
                    <p>Total Tests: {overall_health[total_tests]}</p>
                    <p>Passed: {overall_health[passed_tests]}</p>
                    <p>Failed: {overall_health[failed_tests]}</p>
                </div>
            </div>
            
            <div class="findings">
                <h2>Key Findings</h2>
                <ul>
                    {findings_list}
                </ul>
            </div>
            
            <div class="service-health">
                <h2>Service Health</h2>
                <table>
                    <tr>
                        <th>Service</th>
                        <th>Pass Rate</th>
                        <th>Status</th>
                        <th>Tests</th>
                    </tr>
                    {service_rows}
                </table>
            </div>
            
            <div class="recommendations">
                <h2>Recommendations</h2>
                <ul>
                    {recommendations_list}
                </ul>
            </div>
        </body>
        </html>
        """
        
        # Format findings
        findings_list = ''.join([f'<li>{finding}</li>' for finding in report_data['key_findings']])
        
        # Format service rows
        service_rows = ''
        for service, data in report_data['service_analysis'].items():
            status_color = 'green' if data['health_status'] == 'healthy' else 'orange'
            service_rows += f"""
            <tr>
                <td>{service}</td>
                <td>{data['pass_rate']:.1f}%</td>
                <td style="color: {status_color}">{data['health_status']}</td>
                <td>{data['total_tests']}</td>
            </tr>
            """
        
        # Format recommendations
        recommendations_list = ''.join([f'<li>{rec}</li>' for rec in report_data['recommendations']])
        
        return html_template.format(
            title=report_data['title'],
            generated_at=report_data['generated_at'],
            overall_health=report_data['overall_health'],
            findings_list=findings_list,
            service_rows=service_rows,
            recommendations_list=recommendations_list
        )
    
    def format_technical_report(self, report_data):
        """Format technical report as HTML"""
        # Implementation for detailed technical report
        pass
    
    def format_service_report(self, report_data):
        """Format service report as HTML"""
        # Implementation for service-specific report
        pass
```

## Report Generation Workflow

### 1. Data Collection
- Collect test results from the enhanced smoke test script
- Normalize and structure the data
- Collect metadata about the test environment

### 2. Analysis
- Analyze overall system health
- Analyze results by service
- Identify error patterns and common issues
- Analyze performance metrics
- Generate insights and recommendations

### 3. Report Generation
- Generate executive summary report
- Generate detailed technical report
- Generate service-specific reports
- Generate performance analysis report
- Generate error analysis report

### 4. Output
- Save reports in multiple formats (HTML, JSON, Markdown)
- Generate charts and visualizations
- Create summary statistics
- Provide actionable recommendations

## Implementation Timeline

### Week 1: Core Components
- Day 1-2: Implement data collector
- Day 3-4: Implement result analyzer
- Day 5: Implement report generator base class

### Week 2: Formatters
- Day 1-2: Implement HTML formatter
- Day 3-4: Implement JSON and console formatters
- Day 5: Implement markdown formatter

### Week 3: Advanced Features
- Day 1-2: Implement chart generation
- Day 3-4: Implement trend analysis
- Day 5: Implement notification system

### Week 4: Integration and Testing
- Day 1-2: Integrate with enhanced smoke test script
- Day 3-4: Test and debug
- Day 5: Finalize documentation

## Success Criteria

1. **Comprehensive Reporting**
   - Reports cover all aspects of test results
   - Multiple report formats are supported
   - Reports are easy to understand and navigate

2. **Actionable Insights**
   - Clear identification of failing endpoints
   - Categorization of errors and issues
   - Specific recommendations for fixes

3. **Performance Analysis**
   - Detailed performance metrics
   - Identification of slow endpoints
   - Performance trend analysis

4. **Automation Ready**
   - Can be integrated into CI/CD pipelines
   - Supports automated report generation
   - Provides machine-readable output formats

## Example Output

### Executive Summary (HTML)
- Dashboard showing overall system health
- Service health indicators
- Key findings and recommendations
- Visual charts for pass/fail rates

### Technical Report (JSON)
```json
{
  "title": "API Test Technical Report",
  "generated_at": "2023-11-15T10:30:00Z",
  "overall_health": {
    "total_tests": 150,
    "passed_tests": 135,
    "failed_tests": 15,
    "pass_rate": 90.0,
    "health_status": "needs_attention"
  },
  "service_analysis": {
    "sabnzbd": {
      "total_tests": 45,
      "passed_tests": 42,
      "failed_tests": 3,
      "pass_rate": 93.3,
      "health_status": "healthy"
    },
    "sonarr": {
      "total_tests": 65,
      "passed_tests": 58,
      "failed_tests": 7,
      "pass_rate": 89.2,
      "health_status": "needs_attention"
    }
  },
  "recommendations": [
    "Priority: Address failing endpoints in Sonarr service",
    "Medium Priority: Optimize endpoints in SABnzbd service",
    "Check network connectivity and timeout settings"
  ]
}
```

This comprehensive test report generator will provide clear visibility into API endpoint health and enable data-driven decisions for improving the dashboard application.