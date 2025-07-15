# How to [Specific Task]

This guide shows you how to [task description]. This is useful when you need to
[use case/scenario].

**Time:** About [X] minutes\
**Difficulty:** [Beginner | Intermediate | Advanced]

## Prerequisites

Before starting, ensure you have:

- [ ] [Prerequisite 1] ([how to verify])
- [ ] [Prerequisite 2] ([link to setup guide])
- [ ] [Required permission or access]

## Overview

We'll accomplish this task by:

1. [High-level step 1]
2. [High-level step 2]
3. [High-level step 3]

## Step-by-Step Instructions

### 1. Prepare Your Environment

First, we need to set up [what and why]:

```bash
# Set necessary environment variables
export PROJECT_ENV=production
export API_KEY=your-api-key-here
```

> 📝 **Note**: Store sensitive values like API keys in a `.env` file. See
> [Managing Secrets](link) for details.

<details>
<summary>Using environment files</summary>

Create a `.env` file:

```bash
# .env
PROJECT_ENV=production
API_KEY=your-api-key-here
DATABASE_URL=postgresql://user:pass@host:5432/db
```

Load it:

```bash
source .env
# or
export $(cat .env | xargs)
```

</details>

### 2. [Main Action]

Now we'll [what you're doing and why]:

```bash
project command --option value \
  --another-option \
  --verbose
```

**What's happening here:**

- `--option value`: [Explanation]
- `--another-option`: [Why you need this]
- `--verbose`: Shows detailed output (helpful for debugging)

<details>
<summary>Alternative: Using the configuration file</summary>

Instead of command-line options, you can use a configuration file:

```yaml
# config.yaml
options:
  option: value
  another_option: true
  verbose: true
```

Then run:

```bash
project command --config config.yaml
```

This approach is better for:

- Reproducible deployments
- Complex configurations
- Team collaboration

</details>

### 3. Verify Success

Check that your [task] completed successfully:

```bash
project status --check [thing-you-created]
```

Expected output:

```
Status: Active
Health: Healthy
Last Updated: 2023-10-15 14:30:00
Details:
  - Component A: Running
  - Component B: Running
  - Component C: Running
```

> ✅ **Success indicators:**
>
> - Status shows "Active"
> - All components are "Running"
> - No error messages in the output

## Common Variations

### Using with Docker

If you're running [Project] in Docker:

```dockerfile
FROM project:latest

# Copy configuration
COPY config.yaml /app/

# Set environment
ENV PROJECT_ENV=production

# Run the command
RUN project command --config /app/config.yaml
```

Build and run:

```bash
docker build -t my-project .
docker run my-project
```

### Automating with CI/CD

#### GitHub Actions

```yaml
name: Deploy [Thing]

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up [Project]
        uses: project/setup-action@v1

      - name: Run [task]
        env:
          PROJECT_ENV: &#36;&#123;&#123; secrets.PROJECT_ENV &#125;&#125;
          API_KEY: &#36;&#123;&#123; secrets.API_KEY &#125;&#125;
        run: |
          project command --option &#36;&#123;&#123; github.event.inputs.value &#125;&#125;
```

#### GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    - project command --option $VALUE
  variables:
    PROJECT_ENV: production
  only:
    - main
```

### Using with Different Cloud Providers

<details>
<summary>AWS</summary>

```bash
# Using AWS CLI
aws configure set region us-east-1
project command --cloud aws --region us-east-1
```

</details>

<details>
<summary>Azure</summary>

```bash
# Using Azure CLI
az login
project command --cloud azure --resource-group my-rg
```

</details>

<details>
<summary>GCP</summary>

```bash
# Using gcloud
gcloud auth login
project command --cloud gcp --project my-project-id
```

</details>

## Troubleshooting

<details>
<summary>❌ Error: "Permission denied"</summary>

This usually means you don't have the required access. Check:

1. **Authentication status**:
   ```bash
   project auth status
   ```

2. **Your permissions**:
   ```bash
   project iam check --resource [resource-name]
   ```

3. **Resource existence**:
   ```bash
   project list resources --filter name=[resource-name]
   ```

**Solutions**:

- Request access from your administrator
- Use a service account with proper permissions
- Check you're in the right project/namespace

</details>

<details>
<summary>❌ Error: "Resource not found"</summary>

**Verify**:

- The resource name is spelled correctly (case-sensitive!)
- You're in the right project/namespace:
  ```bash
  project config get-context
  ```
- The resource hasn't been deleted:
  ```bash
  project list resources --all --include-deleted
  ```

**Common causes**:

- Typo in resource name
- Wrong environment (dev vs prod)
- Resource in different region

</details>

<details>
<summary>⚠️ Task succeeds but doesn't work as expected</summary>

**Debugging steps**:

1. **Check logs**:
   ```bash
   project logs [resource-name] --tail 100
   ```

2. **Verify configuration**:
   ```bash
   project describe [resource-name]
   ```

3. **Common issues**:
   - **Caching**: Clear with `project cache clear`
   - **Propagation delay**: Changes can take 2-5 minutes
   - **Configuration drift**: Compare with `project diff`

</details>

<details>
<summary>🐌 Performance issues</summary>

**Optimization strategies**:

1. **Enable caching**:
   ```bash
   project command --cache-ttl 3600
   ```

2. **Batch operations**:
   ```bash
   project command --batch-size 100
   ```

3. **Use regional endpoints**:
   ```bash
   project command --endpoint https://region.api.example.com
   ```

4. **Monitor metrics**:
   ```bash
   project metrics [resource-name] --duration 1h
   ```

</details>

## Related Tasks

- [How to Update [Thing]](link) - Modify existing resources
- [How to Delete [Thing]](link) - Clean up when done
- [How to Monitor [Thing]](link) - Track performance and health
- [How to Backup [Thing]](link) - Ensure data safety
- [How to Scale [Thing]](link) - Handle increased load

## Further Reading

- [Architecture Overview](link) - Understand how this fits in the bigger picture
- [Best Practices for [Topic]](link) - Optimize your approach
- [API Reference](link) - Complete options and parameters
- [Security Guide](link) - Secure your implementation

---

## Help Improve This Guide

Something unclear? Missing information? We appreciate your feedback!

- 📝 [Edit this guide](github-edit-link)
- 💬 [Ask questions](community-link)
- 🐛 [Report issues](issue-link)

**Contributors**: [List of contributors]\
**Last updated**: [Date]\
**Applies to version**: [Version]
