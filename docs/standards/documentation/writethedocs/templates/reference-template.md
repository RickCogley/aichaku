# [Component] API Reference

## Overview

The [Component] API provides [what it does]. Use this API to [common use cases].

**Base URL**: `https://api.example.com/v1`\
**Authentication**: Bearer token required\
**Rate Limits**: 1000 requests per hour\
**API Version**: v1.2.3

## Quick Start

```bash
# Minimal working example
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/v1/resources
```

<details>
<summary>Using different tools</summary>

**HTTPie**:

```bash
http GET api.example.com/v1/resources \
  "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript (fetch)**:

```javascript
fetch("https://api.example.com/v1/resources", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

**Python (requests)**:

```python
import requests

response = requests.get(
    'https://api.example.com/v1/resources',
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
data = response.json()
```

</details>

## Authentication

All requests require authentication using a Bearer token in the Authorization
header:

```
Authorization: Bearer YOUR*API*TOKEN
```

### Getting an API Token

1. Log in to your account at [https://example.com](https://example.com)
2. Navigate to **Settings** > **API Tokens**
3. Click **Generate New Token**
4. Set token permissions and expiration
5. Copy the token (you won't see it again)

### Token Permissions

Tokens can have different permission levels:

| Permission | Description       | Endpoints        |
| ---------- | ----------------- | ---------------- |
| `read`     | Read-only access  | GET endpoints    |
| `write`    | Create and update | POST, PUT, PATCH |
| `delete`   | Remove resources  | DELETE endpoints |
| `admin`    | Full access       | All endpoints    |

## Endpoints

### Resources

#### List Resources

```http
GET /resources
```

Returns a paginated list of resources in your account.

**Parameters**:

| Name       | Type    | Required | Description                                     |
| ---------- | ------- | -------- | ----------------------------------------------- |
| `page`     | integer | No       | Page number (default: 1)                        |
| `per_page` | integer | No       | Results per page (default: 20, max: 100)        |
| `sort`     | string  | No       | Sort field: `created`, `updated`, `name`        |
| `order`    | string  | No       | Sort order: `asc`, `desc` (default: `desc`)     |
| `filter`   | string  | No       | Filter expression (see [Filtering](#filtering)) |
| `include`  | string  | No       | Include related data: `metadata`, `tags`, `all` |

**Request Example**:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/v1/resources?page=2&per_page=50&sort=created&include=metadata"
```

**Response** (`200 OK`):

```json
{
  "data": [
    {
      "id": "res_123abc",
      "name": "My Resource",
      "type": "standard",
      "created_at": "2023-10-15T10:30:00Z",
      "updated_at": "2023-10-15T14:45:00Z",
      "status": "active",
      "metadata": {
        "owner": "user@example.com",
        "tags": ["production", "critical"],
        "custom_field": "value"
      }
    }
  ],
  "pagination": {
    "page": 2,
    "per_page": 50,
    "total": 247,
    "pages": 5,
    "next": "https://api.example.com/v1/resources?page=3&per_page=50",
    "prev": "https://api.example.com/v1/resources?page=1&per_page=50"
  }
}
```

#### Get Resource

```http
GET /resources/{id}
```

Retrieve a specific resource by ID.

**Parameters**:

| Name      | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| `id`      | string | Yes      | Resource ID          |
| `include` | string | No       | Include related data |

**Response** (`200 OK`):

```json
{
  "id": "res_123abc",
  "name": "My Resource",
  "type": "standard",
  "created_at": "2023-10-15T10:30:00Z",
  "updated_at": "2023-10-15T14:45:00Z",
  "status": "active",
  "configuration": {
    "size": "medium",
    "region": "us-east-1",
    "backup_enabled": true
  },
  "metadata": {
    "owner": "user@example.com",
    "tags": ["production", "critical"]
  },
  "links": {
    "self": "https://api.example.com/v1/resources/res_123abc",
    "logs": "https://api.example.com/v1/resources/res_123abc/logs",
    "metrics": "https://api.example.com/v1/resources/res_123abc/metrics"
  }
}
```

#### Create Resource

```http
POST /resources
```

Create a new resource.

**Request Body**:

```json
{
  "name": "My Resource",
  "type": "standard",
  "configuration": {
    "size": "medium",
    "region": "us-east-1",
    "backup_enabled": true
  },
  "metadata": {
    "tags": ["production"],
    "owner": "team@example.com"
  }
}
```

**Field Descriptions**:

| Field           | Type   | Required | Description                                                  |
| --------------- | ------ | -------- | ------------------------------------------------------------ |
| `name`          | string | Yes      | Display name (1-255 chars, unique)                           |
| `type`          | string | Yes      | Resource type: `standard`, `premium`, `enterprise`           |
| `configuration` | object | No       | Type-specific settings (see [Configuration](#configuration)) |
| `metadata`      | object | No       | Custom metadata and tags                                     |

**Response** (`201 Created`):

```json
{
  "id": "res_789xyz",
  "name": "My Resource",
  "type": "standard",
  "created_at": "2023-10-15T16:00:00Z",
  "status": "provisioning",
  "links": {
    "self": "https://api.example.com/v1/resources/res_789xyz",
    "status": "https://api.example.com/v1/resources/res_789xyz/status"
  }
}
```

**Response Headers**:

```
Location: https://api.example.com/v1/resources/res_789xyz
X-Request-ID: req_abc123
```

#### Update Resource

```http
PATCH /resources/{id}
```

Update an existing resource. Only include fields you want to change.

**Request Body**:

```json
{
  "name": "Updated Resource Name",
  "configuration": {
    "backup_enabled": false
  }
}
```

**Response** (`200 OK`):

Returns the updated resource object.

#### Delete Resource

```http
DELETE /resources/{id}
```

Delete a resource.

**Parameters**:

| Name    | Type    | Required | Description                         |
| ------- | ------- | -------- | ----------------------------------- |
| `id`    | string  | Yes      | Resource ID                         |
| `force` | boolean | No       | Force delete even with dependencies |

**Response**:

- `204 No Content` - Resource deleted successfully
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource has dependencies (use `force=true` to override)

### Resource Operations

#### Get Resource Status

```http
GET /resources/{id}/status
```

Get detailed status information.

**Response**:

```json
{
  "status": "active",
  "health": "healthy",
  "checks": {
    "connectivity": "passing",
    "performance": "passing",
    "configuration": "warning"
  },
  "last_checked": "2023-10-15T16:30:00Z",
  "uptime": 86400,
  "metrics": {
    "cpu_usage": 45.2,
    "memory_usage": 62.8,
    "disk_usage": 34.1
  }
}
```

## Data Types

### Resource Object

```typescript
interface Resource {
  id: string; // Unique identifier (res_[a-z0-9]{6})
  name: string; // Display name (1-255 characters)
  type: "standard" | "premium" | "enterprise";
  status: "provisioning" | "active" | "updating" | "error" | "deleted";
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  configuration?: Configuration;
  metadata?: Metadata;
  links?: Links;
}

interface Configuration {
  size?: "small" | "medium" | "large" | "xlarge";
  region?: string; // Valid region code
  backup_enabled?: boolean;
  custom_domain?: string;
  [key: string]: any; // Type-specific fields
}

interface Metadata {
  tags?: string[]; // Up to 50 tags
  owner?: string; // Email or team identifier
  [key: string]: any; // Custom fields
}

interface Links {
  self: string; // This resource
  [rel: string]: string; // Related resources
}
```

## Error Handling

All errors follow RFC 7807 (Problem Details):

```json
{
  "type": "https://api.example.com/errors/resource-not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "The resource 'res_123abc' does not exist or you don't have permission to access it",
  "instance": "/v1/resources/res_123abc",
  "request*id": "req*987zyx",
  "timestamp": "2023-10-15T16:45:00Z"
}
```

### Error Types

| Type                   | Status | Description               | Action                               |
| ---------------------- | ------ | ------------------------- | ------------------------------------ |
| `validation-error`     | 400    | Request validation failed | Check the `errors` field for details |
| `authentication-error` | 401    | Invalid or missing auth   | Verify your API token                |
| `permission-denied`    | 403    | Insufficient permissions  | Check token permissions              |
| `resource-not-found`   | 404    | Resource doesn't exist    | Verify the resource ID               |
| `conflict`             | 409    | Resource conflict         | Check existing resources             |
| `rate-limit`           | 429    | Too many requests         | Wait and retry with backoff          |
| `server-error`         | 500    | Internal server error     | Contact support with request_id      |
| `service-unavailable`  | 503    | Service temporarily down  | Retry with exponential backoff       |

### Validation Errors

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation failed",
  "status": 400,
  "errors": [
    {
      "field": "name",
      "code": "required",
      "message": "Name is required"
    },
    {
      "field": "configuration.size",
      "code": "invalid_value",
      "message": "Size must be one of: small, medium, large"
    }
  ]
}
```

## Rate Limiting

Rate limits are applied per API token:

| Tier       | Requests/Hour | Burst    | Concurrent |
| ---------- | ------------- | -------- | ---------- |
| Free       | 100           | 10/min   | 2          |
| Standard   | 1,000         | 100/min  | 10         |
| Premium    | 10,000        | 1000/min | 50         |
| Enterprise | Custom        | Custom   | Custom     |

**Response Headers**:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 942
X-RateLimit-Reset: 1697382000
X-RateLimit-Reset-After: 3245
Retry-After: 3245
```

### Handling Rate Limits

```javascript
async function makeRequest(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);

    if (response.status !== 429) {
      return response;
    }

    const retryAfter = response.headers.get("Retry-After");
    const delay = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.pow(2, i) * 1000;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("Rate limit exceeded after retries");
}
```

## Filtering

Use the `filter` parameter for advanced queries:

### Simple Filters

```
# Equality
filter=status:active

# Multiple conditions (AND)
filter=status:active,type:premium

# OR conditions
filter=status:active|status:provisioning
```

### Advanced Filters

```
# Pattern matching
filter=name:prod*

# Numeric comparisons
filter=created_at:>2023-01-01

# Array contains
filter=metadata.tags:@production

# Nested fields
filter=configuration.region:us-east-1
```

### Filter Operators

| Operator | Description    | Example                  |
| -------- | -------------- | ------------------------ |
| `:`      | Equals         | `status:active`          |
| `:!`     | Not equals     | `status:!deleted`        |
| `:>`     | Greater than   | `created_at:>2023-01-01` |
| `:<`     | Less than      | `size:<1000`             |
| `:~`     | Contains       | `name:~test`             |
| `:^`     | Starts with    | `name:^prod`             |
| `:$`     | Ends with      | `name:$-dev`             |
| `:@`     | Array contains | `tags:@critical`         |

## Webhooks

Configure webhooks to receive real-time notifications:

### Create Webhook

```http
POST /webhooks
```

```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["resource.created", "resource.deleted", "resource.status_changed"],
  "secret": "your-webhook-secret",
  "active": true
}
```

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "resource.created",
  "created_at": "2023-10-15T16:00:00Z",
  "data": {
    "resource": {
      /* resource object */
    }
  }
}
```

### Verifying Webhooks

```javascript
const crypto = require("crypto");

function verifyWebhook(payload, signature, secret) {
  const hash = crypto.createHmac("sha256", secret).update(payload).digest(
    "hex",
  );

  return `sha256=${hash}` === signature;
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ApiClient } from "@example/sdk";

const client = new ApiClient({
  token: process.env.API_TOKEN,
  retryConfig: {
    retries: 3,
    backoff: "exponential",
  },
});

// List resources with filtering
const resources = await client.resources.list({
  page: 1,
  perPage: 50,
  filter: "status:active",
  sort: "created",
  order: "desc",
});

// Create resource
const newResource = await client.resources.create({
  name: "My Resource",
  type: "standard",
  configuration: {
    size: "medium",
    region: "us-east-1",
  },
});

// Update resource
await client.resources.update(newResource.id, {
  name: "Updated Name",
});

// Delete resource
await client.resources.delete(newResource.id);
```

### Python

```python
from example_sdk import ApiClient
from example_sdk.exceptions import RateLimitError
import time

client = ApiClient(
    token=os.environ['API_TOKEN'],
    retry*on*rate_limit=True
)

# List resources
resources = client.resources.list(
    page=1,
    per_page=50,
    filter='status:active'
)

# Create with error handling
try:
    new_resource = client.resources.create(
        name='My Resource',
        type='standard',
        configuration={
            'size': 'medium',
            'region': 'us-east-1'
        }
    )
except RateLimitError as e:
    time.sleep(e.retry_after)
    new_resource = client.resources.create(...)
```

### Go

```go
package main

import (
    "github.com/example/sdk-go"
)

func main() {
    client := sdk.NewClient(os.Getenv("API_TOKEN"))

    // List resources
    resources, err := client.Resources.List(&sdk.ListOptions{
        Page: 1,
        PerPage: 50,
        Filter: "status:active",
    })

    // Create resource
    resource, err := client.Resources.Create(&sdk.Resource{
        Name: "My Resource",
        Type: "standard",
        Configuration: &sdk.Configuration{
            Size: "medium",
            Region: "us-east-1",
        },
    })
}
```

## Changelog

### v1.2.3 (Current)

- Added `include` parameter for related data
- Improved filter syntax with new operators
- Added webhook signature verification

### v1.2.0

- Added webhook support
- New filtering operators
- Pagination links in responses

### v1.1.0

- Rate limiting headers
- Batch operations endpoint
- Async job support

[View full changelog](https://api.example.com/changelog)

## Support

- 📧 Email: api-support@example.com
- 💬 Chat: [Developer Discord](https://discord.gg/example)
- 📚 Docs: [Full Documentation](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/example/api/issues)

---

**API Status**: [status.example.com](https://status.example.com)\
**Last Updated**: 2023-10-15\
**API Version**: v1.2.3
