# DORA Metrics

## Overview

DORA (DevOps Research and Assessment) metrics are four key metrics identified by
the DORA team at Google that indicate the performance of software development
teams. These metrics are strongly correlated with organizational performance and
are used to measure the effectiveness of DevOps practices.

### The Four Key Metrics

1. **Deployment Frequency** - How often an organization successfully releases to
   production
2. **Lead Time for Changes** - Time from code commit to code running in
   production
3. **Mean Time to Recovery (MTTR)** - Time to restore service after an incident
4. **Change Failure Rate** - Percentage of deployments causing a failure in
   production

## Performance Levels

DORA categorizes teams into four performance levels:

| Metric                | Elite                  | High              | Medium                    | Low                      |
| --------------------- | ---------------------- | ----------------- | ------------------------- | ------------------------ |
| Deployment Frequency  | Multiple times per day | Weekly to monthly | Monthly to every 6 months | Less than every 6 months |
| Lead Time for Changes | Less than 1 hour       | 1 day to 1 week   | 1 week to 1 month         | 1 to 6 months            |
| MTTR                  | Less than 1 hour       | Less than 1 day   | 1 day to 1 week           | More than 1 week         |
| Change Failure Rate   | 0-15%                  | 16-30%            | 16-30%                    | 16-30%                   |

## Implementing DORA Metrics

### 1. Deployment Frequency

**Definition**: How often code is deployed to production or released to end
users.

#### Measurement Implementation

```typescript
// TypeScript example for tracking deployments
interface Deployment {
  id: string;
  timestamp: Date;
  environment: "production" | "staging" | "development";
  version: string;
  status: "success" | "failed" | "rollback";
}

class DeploymentTracker {
  private deployments: Deployment[] = [];

  recordDeployment(deployment: Deployment): void {
    this.deployments.push(deployment);
    this.sendMetrics(deployment);
  }

  getDeploymentFrequency(days: number = 30): number {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const productionDeployments = this.deployments.filter(
      (d) =>
        d.environment === "production" && d.status === "success" &&
        d.timestamp >= startDate,
    );

    return productionDeployments.length / days;
  }

  private sendMetrics(deployment: Deployment): void {
    // Send to monitoring system
    metrics.increment("deployments.total", {
      environment: deployment.environment,
      status: deployment.status,
    });
  }
}
```

#### CI/CD Pipeline Integration

```yaml
# GitHub Actions example
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production
        run: |
          ./deploy.sh production

      - name: Record Deployment Metric
        if: success()
        run: |
          curl -X POST https://metrics.example.com/api/deployments \
            -H "Content-Type: application/json" \
            -d '{
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "environment": "production",
              "version": "&#36;&#123;&#123; github.sha &#125;&#125;",
              "status": "success"
            }'
```

### 2. Lead Time for Changes

**Definition**: Time from code commit to code successfully running in
production.

#### Measurement Implementation

```python
# Python example for tracking lead time
from datetime import datetime
from typing import List, Optional
import statistics

class LeadTimeTracker:
    def **init**(self, git*client, deployment*client):
        self.git = git_client
        self.deployments = deployment_client

    def calculate*lead*time(self, deployment_id: str) -> Optional[float]:
        """Calculate lead time in hours for a specific deployment."""
        deployment = self.deployments.get*deployment(deployment*id)
        if not deployment:
            return None

        # Get all commits in this deployment
        commits = self.git.get*commits*in_range(
            deployment.from_commit,
            deployment.to_commit
        )

        if not commits:
            return None

        # Find earliest commit time
        earliest_commit = min(commits, key=lambda c: c.timestamp)

        # Calculate lead time
        lead*time = deployment.deployed*at - earliest_commit.timestamp
        return lead*time.total*seconds() / 3600  # Convert to hours

    def get*average*lead_time(self, days: int = 30) -> float:
        """Get average lead time for recent deployments."""
        recent*deployments = self.deployments.get*recent_deployments(days)
        lead_times = []

        for deployment in recent_deployments:
            lead*time = self.calculate*lead_time(deployment.id)
            if lead_time:
                lead*times.append(lead*time)

        return statistics.mean(lead*times) if lead*times else 0

# Git hook for commit tracking
#!/usr/bin/env python
# .git/hooks/post-commit
import subprocess
import requests
import json

def track_commit():
    commit*hash = subprocess.check*output(['git', 'rev-parse', 'HEAD']).decode().strip()
    commit*time = subprocess.check*output(['git', 'show', '-s', '--format=%ci', commit_hash]).decode().strip()
    author = subprocess.check*output(['git', 'show', '-s', '--format=%ae', commit*hash]).decode().strip()

    data = {
        'commit*hash': commit*hash,
        'timestamp': commit_time,
        'author': author
    }

    requests.post('https://metrics.example.com/api/commits', json=data)

if **name** == '**main**':
    track_commit()
```

### 3. Mean Time to Recovery (MTTR)

**Definition**: How long it takes to recover from a failure in production.

#### Measurement Implementation

```go
// Go example for tracking incidents and recovery
package metrics

import (
    "time"
    "fmt"
)

type IncidentStatus string

const (
    IncidentOpen     IncidentStatus = "open"
    IncidentResolved IncidentStatus = "resolved"
)

type Incident struct {
    ID          string
    StartTime   time.Time
    EndTime     *time.Time
    Status      IncidentStatus
    Severity    string
    Description string
}

type MTTRTracker struct {
    incidents map[string]*Incident
}

func NewMTTRTracker() *MTTRTracker {
    return &MTTRTracker{
        incidents: make(map[string]*Incident),
    }
}

func (m *MTTRTracker) StartIncident(id, severity, description string) {
    m.incidents[id] = &Incident{
        ID:          id,
        StartTime:   time.Now(),
        Status:      IncidentOpen,
        Severity:    severity,
        Description: description,
    }

    // Alert on-call
    m.alertOnCall(id, severity, description)

    // Start incident response automation
    m.startAutomatedResponse(id)
}

func (m *MTTRTracker) ResolveIncident(id string) error {
    incident, exists := m.incidents[id]
    if !exists {
        return fmt.Errorf("incident %s not found", id)
    }

    now := time.Now()
    incident.EndTime = &now
    incident.Status = IncidentResolved

    // Calculate and record MTTR
    mttr := now.Sub(incident.StartTime)
    m.recordMTTR(id, mttr)

    return nil
}

func (m *MTTRTracker) GetAverageMTTR(days int) time.Duration {
    cutoff := time.Now().AddDate(0, 0, -days)
    var totalDuration time.Duration
    count := 0

    for _, incident := range m.incidents {
        if incident.Status == IncidentResolved &&
           incident.StartTime.After(cutoff) &&
           incident.EndTime != nil {
            totalDuration += incident.EndTime.Sub(incident.StartTime)
            count++
        }
    }

    if count == 0 {
        return 0
    }

    return totalDuration / time.Duration(count)
}

// Automated incident response
func (m *MTTRTracker) startAutomatedResponse(incidentID string) {
    go func() {
        // Try automated recovery procedures
        if err := m.runHealthChecks(); err != nil {
            m.escalateIncident(incidentID)
            return
        }

        if err := m.attemptAutoRecovery(); err != nil {
            m.escalateIncident(incidentID)
            return
        }
    }()
}
```

#### Monitoring and Alerting Setup

{% raw %}

```yaml
# Prometheus alert rules for incident detection
groups:
  - name: production_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http*requests*total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: ServiceDown
        expr: up{job="production"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.instance }} is down"
```

{% endraw %}

### 4. Change Failure Rate

**Definition**: The percentage of deployments causing a failure in production.

#### Measurement Implementation

```java
// Java example for tracking change failure rate
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

public class ChangeFailureRateTracker {
    private final List<Deployment> deployments = new ArrayList<>();
    private final List<Incident> incidents = new ArrayList<>();

    public class Deployment {
        String id;
        Instant timestamp;
        String version;
        boolean causedIncident;

        public Deployment(String id, String version) {
            this.id = id;
            this.timestamp = Instant.now();
            this.version = version;
            this.causedIncident = false;
        }
    }

    public class Incident {
        String id;
        String deploymentId;
        Instant timestamp;
        String rootCause;
    }

    public void recordDeployment(String deploymentId, String version) {
        deployments.add(new Deployment(deploymentId, version));

        // Set up monitoring for this deployment
        schedulePostDeploymentChecks(deploymentId);
    }

    public void recordIncident(String incidentId, String deploymentId, String rootCause) {
        // Link incident to deployment
        deployments.stream()
            .filter(d -> d.id.equals(deploymentId))
            .findFirst()
            .ifPresent(d -> d.causedIncident = true);

        Incident incident = new Incident();
        incident.id = incidentId;
        incident.deploymentId = deploymentId;
        incident.timestamp = Instant.now();
        incident.rootCause = rootCause;

        incidents.add(incident);
    }

    public double getChangeFailureRate(int days) {
        Instant cutoff = Instant.now().minus(days, ChronoUnit.DAYS);

        List<Deployment> recentDeployments = deployments.stream()
            .filter(d -> d.timestamp.isAfter(cutoff))
            .collect(Collectors.toList());

        if (recentDeployments.isEmpty()) {
            return 0.0;
        }

        long failedDeployments = recentDeployments.stream()
            .filter(d -> d.causedIncident)
            .count();

        return (double) failedDeployments / recentDeployments.size() * 100;
    }

    private void schedulePostDeploymentChecks(String deploymentId) {
        // Schedule automated checks at intervals
        Timer timer = new Timer();

        // Check after 5 minutes
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                runHealthChecks(deploymentId);
            }
        }, 5 * 60 * 1000);

        // Check after 1 hour
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                runComprehensiveChecks(deploymentId);
            }
        }, 60 * 60 * 1000);
    }
}
```

## Implementation Strategies

### 1. Automated Data Collection

```typescript
// Centralized metrics collection service
class DORAMetricsCollector {
  private deploymentFrequency: number = 0;
  private leadTimes: number[] = [];
  private incidentRecoveryTimes: number[] = [];
  private deploymentOutcomes: { total: number; failed: number } = {
    total: 0,
    failed: 0,
  };

  async collectMetrics(): Promise<DORAMetrics> {
    const metrics = await Promise.all([
      this.getDeploymentFrequency(),
      this.getAverageLeadTime(),
      this.getMTTR(),
      this.getChangeFailureRate(),
    ]);

    return {
      deploymentFrequency: metrics[0],
      leadTimeForChanges: metrics[1],
      mttr: metrics[2],
      changeFailureRate: metrics[3],
      timestamp: new Date(),
    };
  }

  // Webhook endpoints for CI/CD integration
  async handleDeploymentWebhook(data: DeploymentData): Promise<void> {
    this.deploymentFrequency++;

    if (data.commitHash) {
      const leadTime = await this.calculateLeadTime(
        data.commitHash,
        data.timestamp,
      );
      this.leadTimes.push(leadTime);
    }

    this.deploymentOutcomes.total++;

    // Monitor deployment for failures
    this.monitorDeployment(data.deploymentId);
  }

  async handleIncidentWebhook(data: IncidentData): Promise<void> {
    if (data.status === "resolved") {
      const recoveryTime = data.resolvedAt.getTime() - data.startedAt.getTime();
      this.incidentRecoveryTimes.push(recoveryTime);

      // Check if incident was caused by recent deployment
      if (data.relatedDeploymentId) {
        this.deploymentOutcomes.failed++;
      }
    }
  }
}
```

### 2. Dashboard Implementation

```python
# Flask dashboard for DORA metrics
from flask import Flask, render_template, jsonify
import pandas as pd
from datetime import datetime, timedelta

app = Flask(**name**)

class DORADashboard:
    def **init**(self, metrics_store):
        self.metrics = metrics_store

    def get*current*metrics(self):
        return {
            'deployment*frequency': self.calculate*deployment_frequency(),
            'lead*time': self.calculate*average*lead*time(),
            'mttr': self.calculate_mttr(),
            'change*failure*rate': self.calculate*change*failure_rate(),
            'performance*level': self.determine*performance_level()
        }

    def calculate*deployment*frequency(self):
        deployments = self.metrics.get_deployments(days=30)
        daily_frequency = len(deployments) / 30

        if daily_frequency >= 3:
            return {'value': daily_frequency, 'label': 'Multiple per day', 'level': 'elite'}
        elif daily_frequency >= 0.14:  # Weekly
            return {'value': daily_frequency, 'label': 'Weekly', 'level': 'high'}
        elif daily_frequency >= 0.03:  # Monthly
            return {'value': daily_frequency, 'label': 'Monthly', 'level': 'medium'}
        else:
            return {'value': daily_frequency, 'label': 'Less than monthly', 'level': 'low'}

    def determine*performance*level(self):
        metrics = self.get*current*metrics()
        levels = [m['level'] for m in metrics.values() if isinstance(m, dict) and 'level' in m]

        # Simple scoring: elite=4, high=3, medium=2, low=1
        score_map = {'elite': 4, 'high': 3, 'medium': 2, 'low': 1}
        scores = [score_map[level] for level in levels]
        avg_score = sum(scores) / len(scores)

        if avg_score >= 3.5:
            return 'Elite Performer'
        elif avg_score >= 2.5:
            return 'High Performer'
        elif avg_score >= 1.5:
            return 'Medium Performer'
        else:
            return 'Low Performer'

@app.route('/api/metrics')
def get_metrics():
    dashboard = DORADashboard(metrics_store)
    return jsonify(dashboard.get*current*metrics())

@app.route('/dashboard')
def show_dashboard():
    return render*template('dora*dashboard.html')
```

### 3. Continuous Improvement Process

{% raw %}

```yaml
# DORA improvement workflow
name: DORA Metrics Review

on:
  schedule:
    - cron: "0 9 * * 1" # Every Monday at 9 AM

jobs:
  analyze-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch DORA Metrics
        id: metrics
        run: |
          METRICS=$(curl -s https://metrics.example.com/api/dora/weekly)
          echo "::set-output name=metrics::$METRICS"

      - name: Analyze Trends
        run: |
          python analyze*dora*trends.py --metrics '${{ steps.metrics.outputs.metrics }}'

      - name: Generate Improvement Suggestions
        id: suggestions
        run: |
          SUGGESTIONS=$(python generate_improvements.py --metrics '${{ steps.metrics.outputs.metrics }}')
          echo "::set-output name=suggestions::$SUGGESTIONS"

      - name: Create Issue for Team Review
        uses: actions/github-script@v6
        with:
          script: |
            const metrics = ${{ steps.metrics.outputs.metrics }};
            const suggestions = ${{ steps.suggestions.outputs.suggestions }};

            const issueBody = `
            ## Weekly DORA Metrics Review

            ### Current Metrics
            - **Deployment Frequency**: ${metrics.deployment_frequency.label}
            - **Lead Time**: ${metrics.lead_time.value} hours
            - **MTTR**: ${metrics.mttr.value} minutes
            - **Change Failure Rate**: ${metrics.change*failure*rate.value}%

            ### Performance Level: ${metrics.performance_level}

            ### Improvement Suggestions
            ${suggestions}

            ### Action Items
            - [ ] Review metrics with team
            - [ ] Identify bottlenecks
            - [ ] Create improvement tasks
            `;

            github.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'DORA Metrics Review - Week ' + new Date().toISOString().split('T')[0],
              body: issueBody,
              labels: ['dora-metrics', 'process-improvement']
            });
```

{% endraw %}

## Tools and Technologies

### Open Source Tools

1. **Four Keys** (Google) - Complete DORA metrics platform
2. **Pelorus** (Red Hat) - GitOps-based metrics gathering
3. **DevLake** - Open-source dev data platform
4. **Sleuth** - Deployment tracking and DORA metrics

### Implementation Stack Example

{% raw %}

```docker
# docker-compose.yml for DORA metrics stack
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF*SECURITY*ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"

  metrics-collector:
    build: ./metrics-collector
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - PROMETHEUS_URL=http://prometheus:9090
    depends_on:
      - prometheus

  webhook-receiver:
    build: ./webhook-receiver
    ports:
      - "8080:8080"
    environment:
      - METRICS*DB*URL=postgresql://metrics:password@postgres:5432/dora

volumes:
  prometheus_data:
  grafana_data:
```

{% endraw %}

## Best Practices

### 1. Start Small

- Begin with deployment frequency
- Add other metrics gradually
- Focus on trends, not absolute numbers

### 2. Automate Everything

- Automated deployment tracking
- Automated incident detection
- Automated metric calculation

### 3. Make Metrics Visible

- Team dashboards
- Regular reviews
- Celebrate improvements

### 4. Use Metrics for Improvement

- Identify bottlenecks
- Run experiments
- Measure impact

### 5. Avoid Gaming

- Focus on outcomes, not metrics
- Balance all four metrics
- Consider additional context

## Common Pitfalls

### 1. Focusing on Single Metrics

```
❌ Optimizing deployment frequency while ignoring failure rate
✅ Balancing all four metrics together
```

### 2. Manual Data Collection

```
❌ Manually tracking deployments in spreadsheets
✅ Automated collection from CI/CD pipelines
```

### 3. Comparing Teams Directly

```
❌ Team A is better because they deploy more
✅ Each team improves their own metrics over time
```

### 4. Ignoring Context

```
❌ All teams must achieve elite performance
✅ Consider team maturity, technology, and constraints
```

## DORA Metrics Maturity Model

### Level 1: Baseline

- Manual tracking
- Monthly reviews
- Basic dashboards

### Level 2: Automated

- Automated collection
- Weekly reviews
- Real-time dashboards

### Level 3: Integrated

- Metrics drive decisions
- Daily visibility
- Automated alerts

### Level 4: Optimized

- Predictive analytics
- Continuous improvement
- Cultural integration

## Future Evolution: DORA+

Recent additions to DORA metrics include:

1. **Reliability** - Service uptime and SLO performance
2. **Developer Experience** - Time to onboard, tool satisfaction
3. **Security** - Time to remediate vulnerabilities
4. **Documentation** - Coverage and accuracy metrics
5. **Technical Debt** - Code quality trends

Remember: DORA metrics are indicators, not goals. Use them to identify areas for
improvement and track progress, but always consider the broader context of your
team and organization.
