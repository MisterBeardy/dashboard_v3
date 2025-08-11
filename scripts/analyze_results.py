#!/usr/bin/env python3
"""
Analyze test results and generate recommendations for fixing issues.

This script analyzes the output from the enhanced smoke test and generates
specific recommendations for fixing issues in the main application.
"""

import json
import argparse
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class Issue:
    """Represents an issue found during testing"""
    id: str
    type: str
    service: str
    endpoint: str
    method: str
    severity: str
    description: str
    error_message: str
    http_status: Optional[int]
    file_location: str
    code_location: str
    suggested_fix: str
    priority_score: int
    priority: str
    assignee: str
    estimated_effort: str
    due_date: str


class IssueAnalyzer:
    """Analyze test results and identify issues"""
    
    def __init__(self, test_results_file: str):
        self.test_results_file = test_results_file
        self.test_results = self.load_test_results()
        self.issues = []
    
    def load_test_results(self) -> List[Dict[str, Any]]:
        """Load test results from JSON file"""
        try:
            with open(self.test_results_file, 'r') as f:
                data = json.load(f)
                return data.get('results', [])
        except FileNotFoundError:
            print(f"Error: Test results file not found: {self.test_results_file}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in test results file: {e}")
            sys.exit(1)
    
    def analyze_results(self) -> List[Issue]:
        """Analyze test results and identify issues"""
        issue_id = 1
        
        for result in self.test_results:
            if result['status'] == 'FAIL':
                issue = self.create_issue(result, issue_id)
                self.issues.append(issue)
                issue_id += 1
        
        # Prioritize issues
        self.prioritize_issues()
        
        return self.issues
    
    def create_issue(self, result: Dict[str, Any], issue_id: int) -> Issue:
        """Create an issue from a test result"""
        service = result['service']
        endpoint = result['endpoint']
        method = result['method']
        error_message = result.get('error_message', '')
        http_status = result.get('http_status')
        
        # Determine severity
        severity = self.determine_severity(result)
        
        # Find file location
        file_location = self.find_file_location(service, endpoint)
        
        # Generate suggested fix
        suggested_fix = self.suggest_fix(result)
        
        # Calculate priority score and priority
        priority_score = self.calculate_priority_score(service, endpoint, severity, error_message)
        priority = self.score_to_priority(priority_score)
        
        # Determine assignee
        assignee = self.determine_assignee(service, severity)
        
        # Estimate effort
        estimated_effort = self.estimate_effort(severity, error_message)
        
        # Calculate due date
        due_date = self.calculate_due_date(priority)
        
        return Issue(
            id=f"ISSUE-{issue_id:03d}",
            type="Failing Endpoint",
            service=service,
            endpoint=endpoint,
            method=method,
            severity=severity,
            description=f"Endpoint {endpoint} failed with {method} method",
            error_message=error_message,
            http_status=http_status,
            file_location=file_location,
            code_location=f"{file_location}:endpoint_handler",
            suggested_fix=suggested_fix,
            priority_score=priority_score,
            priority=priority,
            assignee=assignee,
            estimated_effort=estimated_effort,
            due_date=due_date
        )
    
    def determine_severity(self, result: Dict[str, Any]) -> str:
        """Determine severity of the issue"""
        http_status = result.get('http_status', 0)
        error_message = result.get('error_message', '').lower()
        
        if http_status >= 500:
            return 'Critical'
        elif http_status >= 400:
            return 'High'
        elif 'timeout' in error_message:
            return 'Medium'
        elif 'connection' in error_message:
            return 'High'
        elif result['status'] == 'FAIL':
            return 'Medium'
        else:
            return 'Low'
    
    def find_file_location(self, service: str, endpoint: str) -> str:
        """Find the file location for the endpoint"""
        # Map services to file locations
        service_file_map = {
            'sabnzbd': 'app/api/sabnzbd',
            'sonarr': 'app/api/sonarr',
            'radarr': 'app/api/radarr',
            'prowlarr': 'app/api/prowlarr',
            'readarr': 'app/api/readarr'
        }
        
        # Extract endpoint path
        endpoint_path = endpoint.split('?')[0]  # Remove query parameters
        
        # Find matching file
        base_path = service_file_map.get(service, '')
        if base_path:
            # Try to find the exact file
            if '/queue/' in endpoint_path:
                return f"{base_path}/queue/route.ts"
            elif '/history/' in endpoint_path:
                return f"{base_path}/history/route.ts"
            elif '/system/' in endpoint_path:
                return f"{base_path}/system/status/route.ts"
            else:
                return f"{base_path}/route.ts"
        
        return "Unknown location"
    
    def suggest_fix(self, result: Dict[str, Any]) -> str:
        """Suggest a fix for the failing endpoint"""
        error_message = result.get('error_message', '').lower()
        http_status = result.get('http_status', 0)
        service = result['service']
        endpoint = result['endpoint']
        
        if http_status == 404:
            return f"Check if endpoint exists and is properly routed in {self.find_file_location(service, endpoint)}"
        elif http_status == 500:
            return f"Check server-side error logs and exception handling in {self.find_file_location(service, endpoint)}"
        elif 'timeout' in error_message:
            return f"Increase timeout or optimize endpoint performance in {self.find_file_location(service, endpoint)}"
        elif 'connection' in error_message:
            return f"Check {service} backend service connectivity and configuration"
        elif 'authentication' in error_message:
            return f"Verify API key and authentication implementation in {self.find_file_location(service, endpoint)}"
        elif 'validation' in error_message:
            return f"Add proper input validation and error handling in {self.find_file_location(service, endpoint)}"
        else:
            return f"Review endpoint implementation and error handling in {self.find_file_location(service, endpoint)}"
    
    def calculate_priority_score(self, service: str, endpoint: str, severity: str, error_message: str) -> int:
        """Calculate priority score based on various factors"""
        score = 0
        
        # Base score from severity
        severity_scores = {'Critical': 100, 'High': 75, 'Medium': 50, 'Low': 25}
        score += severity_scores.get(severity, 0)
        
        # Impact on core functionality
        if 'queue' in endpoint.lower():
            score += 20
        if 'series' in endpoint.lower():
            score += 15
        if 'history' in endpoint.lower():
            score += 10
        
        # Error type impact
        if 'timeout' in error_message.lower():
            score += 10
        if 'connection' in error_message.lower():
            score += 15
        
        return min(score, 100)  # Cap at 100
    
    def score_to_priority(self, score: int) -> str:
        """Convert score to priority level"""
        if score >= 80:
            return 'P0 - Critical'
        elif score >= 60:
            return 'P1 - High'
        elif score >= 40:
            return 'P2 - Medium'
        else:
            return 'P3 - Low'
    
    def determine_assignee(self, service: str, severity: str) -> str:
        """Determine the best assignee for the issue"""
        # Simple assignment logic - can be enhanced
        if service == 'sabnzbd':
            return 'Backend Team - SABnzbd Specialist'
        elif service == 'sonarr':
            return 'Backend Team - Sonarr Specialist'
        elif severity == 'Critical':
            return 'Senior Backend Developer'
        elif severity == 'High':
            return 'Backend Developer'
        else:
            return 'Backend Team - General'
    
    def estimate_effort(self, severity: str, error_message: str) -> str:
        """Estimate effort required to fix the issue"""
        # Base effort in hours
        base_effort = {
            'Critical': 8,
            'High': 4,
            'Medium': 2,
            'Low': 1
        }
        
        effort = base_effort.get(severity, 2)
        
        # Adjust based on error type
        if 'timeout' in error_message.lower():
            effort *= 1.2
        elif 'connection' in error_message.lower():
            effort *= 1.5
        
        return f"{effort}h"
    
    def calculate_due_date(self, priority: str) -> str:
        """Calculate due date based on priority"""
        from datetime import timedelta
        
        # Base turnaround time in days
        base_turnaround = {
            'P0 - Critical': 1,
            'P1 - High': 3,
            'P2 - Medium': 7,
            'P3 - Low': 14
        }
        
        days = base_turnaround.get(priority, 7)
        due_date = datetime.now() + timedelta(days=days)
        
        return due_date.strftime('%Y-%m-%d')
    
    def prioritize_issues(self):
        """Prioritize issues based on priority score"""
        self.issues.sort(key=lambda x: x.priority_score, reverse=True)


class ReportGenerator:
    """Generate various reports from analysis results"""
    
    def __init__(self, issues: List[Issue], output_dir: str = "analysis_reports"):
        self.issues = issues
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_console_report(self) -> Dict[str, int]:
        """Generate console report"""
        print("\n" + "="*80)
        print("Issue Analysis Report")
        print("="*80)
        
        # Summary statistics
        total_issues = len(self.issues)
        critical_issues = sum(1 for i in self.issues if i.severity == 'Critical')
        high_issues = sum(1 for i in self.issues if i.severity == 'High')
        medium_issues = sum(1 for i in self.issues if i.severity == 'Medium')
        low_issues = sum(1 for i in self.issues if i.severity == 'Low')
        
        print(f"\nSummary:")
        print(f"  Total Issues: {total_issues}")
        print(f"  Critical: {critical_issues}")
        print(f"  High: {high_issues}")
        print(f"  Medium: {medium_issues}")
        print(f"  Low: {low_issues}")
        
        # Issues by service
        print(f"\nIssues by Service:")
        service_counts = {}
        for issue in self.issues:
            service_counts[issue.service] = service_counts.get(issue.service, 0) + 1
        
        for service, count in service_counts.items():
            print(f"  {service}: {count}")
        
        # Top priority issues
        print(f"\nTop Priority Issues:")
        for issue in self.issues[:5]:  # Show top 5
            print(f"  {issue.id}: {issue.endpoint} ({issue.priority})")
        
        print("\n" + "="*80)
        
        return {
            'total': total_issues,
            'critical': critical_issues,
            'high': high_issues,
            'medium': medium_issues,
            'low': low_issues
        }
    
    def generate_json_report(self) -> str:
        """Generate JSON report"""
        timestamp = datetime.now().isoformat()
        
        # Summary statistics
        summary = {
            'total_issues': len(self.issues),
            'critical_issues': sum(1 for i in self.issues if i.severity == 'Critical'),
            'high_issues': sum(1 for i in self.issues if i.severity == 'High'),
            'medium_issues': sum(1 for i in self.issues if i.severity == 'Medium'),
            'low_issues': sum(1 for i in self.issues if i.severity == 'Low'),
            'issues_by_service': {}
        }
        
        # Count issues by service
        for issue in self.issues:
            service = issue.service
            if service not in summary['issues_by_service']:
                summary['issues_by_service'][service] = 0
            summary['issues_by_service'][service] += 1
        
        report = {
            'timestamp': timestamp,
            'summary': summary,
            'issues': [asdict(issue) for issue in self.issues]
        }
        
        json_file = self.output_dir / f"issue_analysis_{timestamp.replace(':', '-')}.json"
        with open(json_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return str(json_file)
    
    def generate_html_report(self) -> str:
        """Generate HTML report"""
        timestamp = datetime.now().isoformat()
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Issue Analysis Report - {timestamp}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background-color: #f0f0f0; padding: 20px; border-radius: 5px; }}
        .summary {{ margin: 20px 0; }}
        .issues {{ margin-top: 20px; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        .critical {{ color: #d32f2f; font-weight: bold; }}
        .high {{ color: #f57c00; font-weight: bold; }}
        .medium {{ color: #fbc02d; }}
        .low {{ color: #388e3c; }}
        .priority-p0 {{ background-color: #ffebee; }}
        .priority-p1 {{ background-color: #fff3e0; }}
        .priority-p2 {{ background-color: #fffde7; }}
        .priority-p3 {{ background-color: #e8f5e8; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Issue Analysis Report</h1>
        <p>Generated: {timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Issues: {len(self.issues)}</p>
        <p class="critical">Critical: {sum(1 for i in self.issues if i.severity == 'Critical')}</p>
        <p class="high">High: {sum(1 for i in self.issues if i.severity == 'High')}</p>
        <p class="medium">Medium: {sum(1 for i in self.issues if i.severity == 'Medium')}</p>
        <p class="low">Low: {sum(1 for i in self.issues if i.severity == 'Low')}</p>
    </div>
    
    <div class="issues">
        <h2>Issues</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>Service</th>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Severity</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Effort</th>
                <th>Due Date</th>
                <th>Suggested Fix</th>
            </tr>
"""
        
        for issue in self.issues:
            severity_class = issue.severity.lower()
            priority_class = f"priority-{issue.priority.split(' ')[0].lower()}"
            
            html_content += f"""
            <tr class="{priority_class}">
                <td>{issue.id}</td>
                <td>{issue.service}</td>
                <td>{issue.endpoint}</td>
                <td>{issue.method}</td>
                <td class="{severity_class}">{issue.severity}</td>
                <td>{issue.priority}</td>
                <td>{issue.assignee}</td>
                <td>{issue.estimated_effort}</td>
                <td>{issue.due_date}</td>
                <td>{issue.suggested_fix}</td>
            </tr>
"""
        
        html_content += """
        </table>
    </div>
</body>
</html>
"""
        
        html_file = self.output_dir / f"issue_analysis_{timestamp.replace(':', '-')}.html"
        with open(html_file, 'w') as f:
            f.write(html_content)
        
        return str(html_file)
    
    def generate_fix_script(self) -> str:
        """Generate a script with suggested fixes"""
        script_content = """#!/bin/bash
# Suggested fixes for identified issues
# This script provides manual steps to fix the issues found during testing

echo "Applying suggested fixes for identified issues..."
echo ""
"""
        
        for issue in self.issues:
            script_content += f"""
# Fix for {issue.id}: {issue.endpoint}
echo "Fixing {issue.id}..."
echo "Issue: {issue.description}"
echo "Location: {issue.file_location}"
echo "Suggested fix: {issue.suggested_fix}"
echo ""
echo "Manual steps required:"
echo "1. Open the file: {issue.file_location}"
echo "2. Locate the endpoint handler for: {issue.method} {issue.endpoint}"
echo "3. Apply the suggested fix"
echo "4. Test the endpoint locally"
echo "5. Run the smoke test suite to verify"
echo ""
"""
        
        script_file = self.output_dir / "apply_fixes.sh"
        with open(script_file, 'w') as f:
            f.write(script_content)
        
        # Make script executable
        os.chmod(script_file, 0o755)
        
        return str(script_file)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Analyze test results and generate recommendations")
    parser.add_argument("test_results", help="Path to test results JSON file")
    parser.add_argument("--output-dir", default="analysis_reports", help="Output directory for reports")
    
    args = parser.parse_args()
    
    # Analyze results
    analyzer = IssueAnalyzer(args.test_results)
    issues = analyzer.analyze_results()
    
    if not issues:
        print("No issues found in test results!")
        return
    
    # Generate reports
    report_generator = ReportGenerator(issues, args.output_dir)
    
    # Console report
    summary = report_generator.generate_console_report()
    
    # JSON report
    json_file = report_generator.generate_json_report()
    print(f"JSON report generated: {json_file}")
    
    # HTML report
    html_file = report_generator.generate_html_report()
    print(f"HTML report generated: {html_file}")
    
    # Fix script
    fix_script = report_generator.generate_fix_script()
    print(f"Fix script generated: {fix_script}")
    
    print(f"\nTotal issues identified: {len(issues)}")
    print(f"Critical issues: {summary['critical']}")
    print(f"High priority issues: {summary['high']}")
    print("\nReview the generated reports for detailed information and suggested fixes.")


if __name__ == "__main__":
    main()