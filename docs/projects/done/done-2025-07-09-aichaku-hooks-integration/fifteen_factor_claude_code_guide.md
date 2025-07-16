# Getting Started with 15-Factor App Implementation for Claude Code

This guide provides practical implementation patterns for building cloud-native
applications following the expanded 15-factor methodology. Use these principles
to shape codebases that are portable, scalable, and maintainable across modern
cloud platforms.

## Prerequisites

Before implementing these patterns, ensure you have:

- **Basic understanding** of cloud-native concepts and containerization
- **Development environment** with Docker and your chosen programming language
- **Access to cloud platform** (AWS, GCP, Azure) or local Kubernetes cluster
- **CI/CD pipeline** setup (GitHub Actions, GitLab CI, or similar)
- **Monitoring tools** for observability (Prometheus, Grafana, or cloud
  equivalents)

## Quick Reference Checklist

- [ ] **One codebase** tracked in Git per deployable app
- [ ] **All dependencies** explicitly declared and isolated
- [ ] **Configuration** stored in environment variables
- [ ] **Backing services** treated as attached resources
- [ ] **Strict separation** of build, release, and run stages
- [ ] **Stateless processes** with no local persistent state
- [ ] **Services export** via port binding (where applicable)
- [ ] **Horizontal scaling** through process model
- [ ] **Fast startup** and graceful shutdown
- [ ] **Minimal gap** between development and production
- [ ] **Logs as event streams** to stdout/stderr
- [ ] **Admin tasks** automated and version-controlled
- [ ] **API-first design** with clear contracts
- [ ] **Comprehensive telemetry** for observability
- [ ] **Security built-in** with authentication/authorization

## Factor I: Codebase

**One codebase tracked in revision control, many deploys**

### Implementation Pattern

```bash
# Repository structure for microservices
/my-service
├── .git/
├── src/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── .github/workflows/
```

## Implementation Guidelines

### Key Practices

- Single repository per deployable service
- Multiple environments (dev/staging/prod) from same codebase
- Environment-specific behavior via configuration, not code branches
- Monorepo acceptable if services are independently deployable

## Factor II: Dependencies

**Explicitly declare and isolate dependencies**

### Implementation Examples

**Node.js/JavaScript:**

```json
{
  "name": "my-service",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "postgres": "^3.3.5"
  }
}
```

**Python:**

```txt
# requirements.txt with pinned versions
fastapi==0.104.1
psycopg2-binary==2.9.9
pydantic==2.5.0
```

**Go:**

```go
// go.mod
module github.com/myorg/myservice

go 1.21

require (
    github.com/gorilla/mux v1.8.1
    github.com/lib/pq v1.10.9
)
```

## Container Strategy

### Container Pattern

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS dev
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
CMD ["node", "server.js"]
```

## Factor III: Config

**Store config in the environment**

### Implementation Pattern

```javascript
// config.js - Node.js example
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST, // Required: set via environment
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "myapp",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD, // No default for secrets
  },
  redis: {
    url: process.env.REDIS_URL, // Required: set via environment
  },
  features: {
    newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
  },
};
```

### Kubernetes ConfigMap/Secret Pattern

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  PORT: "3000"
  DB_HOST: "postgres-service"
  FEATURE_NEW_DASHBOARD: "true"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  DB_PASSWORD: ${DB_PASSWORD} # Use environment variable from secret store
```

## Factor IV: Backing Services

**Treat backing services as attached resources**

### Implementation Pattern

```javascript
// services/database.js
class DatabaseService {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.client = null;
  }

  async connect() {
    // Connection logic that can switch between local/cloud databases
    this.client = await createConnection(this.connectionString);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }
}

// Usage with environment-based configuration
const dbService = new DatabaseService(process.env.DATABASE_URL);
```

### Service Discovery Pattern

```yaml
# Kubernetes service for backing service
apiVersion: v1
kind: Service
metadata:
  name: redis-service
spec:
  selector:
    app: redis
  ports:
    - port: 6379
```

## Factor V: Build, Release, Run

**Strictly separate build and run stages**

### CI/CD Pipeline Pattern

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker tag myapp:${{ github.sha }} myapp:latest

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Push to registry
        run: |
          docker push myregistry/myapp:${{ github.sha }}
          docker push myregistry/myapp:latest

  deploy:
    needs: release
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/myapp myapp=myregistry/myapp:${{ github.sha }}
```

## Factor VI: Processes

**Execute the app as one or more stateless processes**

### Stateless Service Pattern

```javascript
// ❌ BAD: Storing state in process memory
let sessionStore = {};
app.post("/login", (req, res) => {
  const sessionId = generateId();
  sessionStore[sessionId] = { user: req.body.username };
  res.cookie("session", sessionId);
});

// ✅ GOOD: Using external session store
const redis = require("redis");
const client = redis.createClient({ url: process.env.REDIS_URL });

app.post("/login", async (req, res) => {
  const sessionId = generateId();
  await client.set(
    `session:${sessionId}`,
    JSON.stringify({ user: req.body.username }),
  );
  res.cookie("session", sessionId);
});
```

## Factor VII: Port Binding

**Export services via port binding**

### Self-Contained Service Pattern

```javascript
const express = require("express");
const app = express();

// Service is completely self-contained
app.use(express.json());
app.use(express.static("public"));

// Bind to port from environment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Note for Serverless

For AWS Lambda/Google Cloud Functions, this factor doesn't apply directly. Focus
on the self-contained principle:

```javascript
// handler.js - Serverless function
exports.handler = async (event) => {
  // Self-contained logic, no port binding needed
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Lambda" }),
  };
};
```

## Factor VIII: Concurrency

**Scale out via the process model**

### Horizontal Scaling Pattern

```yaml
# Kubernetes HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Process Management

### Process Types Pattern

```yaml
# docker-compose.yml for local development
version: "3.8"
services:
  web:
    build: .
    command: node server.js
    ports:
      - "3000:3000"
    scale: 3

  worker:
    build: .
    command: node worker.js
    scale: 2

  scheduler:
    build: .
    command: node scheduler.js
```

## Factor IX: Disposability

**Maximize robustness with fast startup and graceful shutdown**

### Graceful Shutdown Pattern

```javascript
const server = app.listen(PORT);

// Handle shutdown signals
const shutdown = async () => {
  console.log("Received shutdown signal");

  // Stop accepting new connections
  server.close(() => {
    console.log("HTTP server closed");
  });

  // Wait for existing connections to close (with timeout)
  await Promise.race([
    waitForConnections(),
    new Promise((resolve) => setTimeout(resolve, 30000)),
  ]);

  // Close database connections
  await db.disconnect();
  await redis.quit();

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

## Factor X: Dev/Prod Parity

**Keep development, staging, and production as similar as possible**

### Docker Compose for Dev/Prod Parity

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: devpassword

  redis:
    image: redis:7-alpine
```

## Factor XI: Logs

**Treat logs as event streams**

### Structured Logging Pattern

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Usage
logger.info("Request received", {
  method: req.method,
  path: req.path,
  userId: req.user?.id,
  duration: responseTime,
});
```

## Factor XII: Admin Processes

**Run admin/management tasks as one-off processes**

### Automated Admin Tasks Pattern

```javascript
// scripts/migrate.js
const { migrate } = require("./database/migrations");

async function runMigrations() {
  console.log("Starting database migrations...");
  try {
    await migrate();
    console.log("Migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
```

### Kubernetes Job Pattern

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: myapp:latest
          command: ["node", "scripts/migrate.js"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
      restartPolicy: Never
```

## Factor XIII: API First

**Design all services with API-first approach**

### OpenAPI Specification Pattern

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: User Service API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
```

## API Design

### API Versioning Pattern

```javascript
const router = express.Router();

// Version in URL path
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);

// Version in header
app.use((req, res, next) => {
  const version = req.headers["api-version"] || "v1";
  req.apiVersion = version;
  next();
});
```

## Factor XIV: Telemetry

**Comprehensive monitoring and observability**

### Three Pillars of Observability

```javascript
// Metrics
const prometheus = require("prom-client");
const httpRequestDuration = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

// Traces
const { trace } = require("@opentelemetry/api");
const tracer = trace.getTracer("my-service");

// Logs (structured)
logger.info("Order processed", {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  traceId: span.spanContext().traceId,
});
```

## Observability Implementation

### Health Check Pattern

```javascript
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get("/ready", async (req, res) => {
  try {
    await db.ping();
    await redis.ping();
    res.json({ status: "ready" });
  } catch (error) {
    res.status(503).json({ status: "not ready", error: error.message });
  }
});
```

## Factor XV: Authentication and Authorization

**Security as a first-class concern**

### JWT Authentication Pattern

```javascript
const jwt = require("jsonwebtoken");

// Middleware for authentication
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// Usage
app.get("/admin/users", authenticate, authorize("admin"), getUsers);
```

### OAuth2/OIDC Pattern

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
  }, async (accessToken, refreshToken, profile, done) => {
    const user = await User.findOrCreate({
      googleId: profile.id,
      email: profile.emails[0].value,
    });
    return done(null, user);
  }),
);
```

## Platform-Specific Adaptations

### Kubernetes Native Implementation

```yaml
# Complete deployment following 15 factors
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3 # Factor VIII: Concurrency
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myregistry/myapp:v1.0.0 # Factor V: Build/Release
          ports:
            - containerPort: 3000 # Factor VII: Port Binding
          env: # Factor III: Config
            - name: PORT
              value: "3000"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          livenessProbe: # Factor XIV: Telemetry
            httpGet:
              path: /health
              port: 3000
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
          resources: # Factor IX: Disposability
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

## Cloud Platform Adaptations

### Serverless Adaptations

- **Port Binding**: Not applicable - focus on event-driven handlers
- **Processes**: Each invocation is inherently stateless
- **Concurrency**: Platform manages scaling automatically
- **Admin Processes**: Use scheduled functions or step functions

## Implementation Priority Guide

### Phase 1: Foundation (Weeks 1-2)

1. **Codebase**: Set up Git repository with branching strategy
2. **Dependencies**: Establish dependency management
3. **Config**: Implement environment-based configuration
4. **Logs**: Set up structured logging

### Phase 2: Development Practices (Weeks 3-4)

5. **Dev/Prod Parity**: Create Docker environments
6. **Build/Release/Run**: Set up CI/CD pipeline
7. **Backing Services**: Abstract database/cache connections
8. **API First**: Define OpenAPI specifications

### Phase 3: Production Readiness (Weeks 5-6)

9. **Processes**: Ensure stateless design
10. **Port Binding**: Implement health checks
11. **Disposability**: Add graceful shutdown
12. **Admin Processes**: Automate migrations/tasks

### Phase 4: Scale & Security (Weeks 7-8)

13. **Concurrency**: Implement horizontal scaling
14. **Telemetry**: Add metrics, traces, alerts
15. **Auth**: Implement authentication/authorization

## Common Pitfalls to Avoid

1. **Storing sessions in memory** - Use Redis/database
2. **Hardcoding configuration** - Use environment variables
3. **Manual production changes** - Automate everything
4. **Ignoring health checks** - Essential for orchestration
5. **Mixing concerns in one service** - Keep services focused
6. **Skipping API documentation** - API-first means documentation-first
7. **Basic console.log only** - Implement structured logging
8. **Security as afterthought** - Build it in from the start

Remember: These factors are guidelines, not rigid rules. Adapt them thoughtfully
to your specific architecture and requirements while maintaining their core
principles of portability, scalability, and maintainability.
