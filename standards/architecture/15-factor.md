## 15-Factor App Methodology

### Quick Reference

Modern cloud-native applications should follow these principles:

1. **Codebase** - One codebase tracked in revision control
2. **Dependencies** - Explicitly declare and isolate dependencies
3. **Config** - Store config in the environment
4. **Backing services** - Treat backing services as attached resources
5. **Build, release, run** - Strictly separate build and run stages
6. **Processes** - Execute the app as one or more stateless processes
7. **Port binding** - Export services via port binding
8. **Concurrency** - Scale out via the process model
9. **Disposability** - Maximize robustness with fast startup and graceful
   shutdown
10. **Dev/prod parity** - Keep development, staging, and production as similar
    as possible
11. **Logs** - Treat logs as event streams
12. **Admin processes** - Run admin/management tasks as one-off processes
13. **API first** - Design APIs before implementation
14. **Telemetry** - Collect metrics, logs, and traces
15. **Authentication & authorization** - Centralized auth for all services

### Implementation Guidelines

#### Configuration Management

```typescript
// ✅ Good: Environment variables
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL || "postgres://localhost/myapp",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET,
};

// ❌ Bad: Hardcoded config
const config = {
  port: 3000,
  dbUrl: "postgres://prod-db:5432/myapp",
  redisUrl: "redis://prod-cache:6379",
};
```

#### Stateless Processes

```typescript
// ✅ Good: Stateless request handling
export async function handleRequest(req: Request): Promise<Response> {
  const userId = extractUserId(req);
  const userData = await userService.getUser(userId);
  return new Response(JSON.stringify(userData));
}

// ❌ Bad: Storing state in process memory
const userCache = new Map();

export async function handleRequest(req: Request): Promise<Response> {
  const userId = extractUserId(req);

  if (userCache.has(userId)) {
    return new Response(JSON.stringify(userCache.get(userId)));
  }

  const userData = await userService.getUser(userId);
  userCache.set(userId, userData);
  return new Response(JSON.stringify(userData));
}
```

#### Backing Services

```typescript
// ✅ Good: Configurable backing services
class DatabaseService {
  constructor(private connectionString: string) {}

  async connect() {
    this.connection = await postgres.connect(this.connectionString);
  }
}

const db = new DatabaseService(process.env.DATABASE_URL);

// ❌ Bad: Hardcoded service locations
class DatabaseService {
  async connect() {
    this.connection = await postgres.connect("postgres://prod-db:5432/myapp");
  }
}
```

#### Graceful Shutdown

```typescript
// ✅ Good: Graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");

  // Stop accepting new requests
  server.close(() => {
    console.log("HTTP server closed");

    // Close database connections
    db.close();

    // Exit process
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.log("Forced shutdown");
    process.exit(1);
  }, 10000);
});
```

#### Telemetry Implementation

```typescript
// ✅ Good: Structured logging and metrics
import { logger } from "./logger";
import { metrics } from "./metrics";

export async function processOrder(order: Order) {
  const timer = metrics.startTimer("order_processing_duration");

  try {
    logger.info("Processing order", {
      orderId: order.id,
      userId: order.userId,
    });

    await validateOrder(order);
    await chargePayment(order);
    await fulfillOrder(order);

    metrics.incrementCounter("orders_processed", { status: "success" });
    logger.info("Order processed successfully", { orderId: order.id });
  } catch (error) {
    metrics.incrementCounter("orders_processed", { status: "error" });
    logger.error("Order processing failed", {
      orderId: order.id,
      error: error.message,
    });
    throw error;
  } finally {
    timer.end();
  }
}
```

### Cloud-Native Patterns

#### Health Checks

```typescript
// Liveness probe - is the app running?
app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

// Readiness probe - is the app ready to serve traffic?
app.get("/health/ready", async (req, res) => {
  try {
    await db.ping();
    await redis.ping();
    res.status(200).json({ status: "ready" });
  } catch (error) {
    res.status(503).json({ status: "not ready", error: error.message });
  }
});
```

#### Feature Flags

```typescript
// ✅ Good: Feature flag implementation
const featureFlags = {
  newCheckoutFlow: process.env.FEATURE_NEW_CHECKOUT === "true",
  enhancedLogging: process.env.FEATURE_ENHANCED_LOGGING === "true",
};

export function processCheckout(order: Order) {
  if (featureFlags.newCheckoutFlow) {
    return processCheckoutV2(order);
  }
  return processCheckoutV1(order);
}
```

### Container Considerations

#### Dockerfile Best Practices

```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### Key Benefits

- **Scalability**: Apps can scale horizontally
- **Maintainability**: Clear separation of concerns
- **Portability**: Runs consistently across environments
- **Resilience**: Graceful handling of failures
- **Observability**: Built-in monitoring and logging

Remember: 15-factor apps are designed for modern cloud platforms. Each factor
addresses specific challenges in distributed, containerized environments.
