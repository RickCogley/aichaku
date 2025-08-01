# Redirect Solutions for Aichaku Installer

## Problem

When using a redirect from `https://esolia.pro/aichaku` to the init.ts file, Deno throws an SSL certificate error:

```
error: Import 'https://esolia.pro/aichaku' failed.
    0: error sending request for url (https://esolia.pro/aichaku): client error (Connect): invalid peer certificate: Expired
```

## Solutions

### 1. Fix SSL Certificate (Recommended)

The error indicates the SSL certificate for esolia.pro has expired. Update the certificate first.

### 2. Use HTTP Redirect Headers

Instead of HTML redirect, use proper HTTP 302/301 redirect:

```
Location: https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts
```

### 3. Host the File Directly

Instead of redirecting, serve the actual content with proper MIME type:

```
Content-Type: application/typescript; charset=utf-8
```

### 4. Use GitHub Pages (Best Long-term Solution)

Set up GitHub Pages for aichaku repository:

1. Create `gh-pages` branch or use `/docs` folder
2. Add CNAME file with your domain (e.g., `aichaku.dev`)
3. Serve init.ts directly or create a redirect

Example structure:

```
docs/
├── index.html (redirect)
├── init.ts (copy of main init.ts)
└── CNAME
```

### 5. Use URL Shortener Service

Services like bit.ly or GitHub's git.io can create short URLs:

```bash
# Example (not actual):
deno run -A https://git.io/aichaku
```

### 6. Cloudflare Workers (Advanced)

Create a worker that:

1. Receives requests to your short URL
2. Fetches the content from GitHub
3. Returns it with proper headers

### 7. Test with curl First

Before using with Deno, test the redirect:

```bash
curl -I https://esolia.pro/aichaku
```

This will show you:

- SSL certificate status
- Redirect headers
- Content type

## Immediate Workaround

For now, users can use the direct GitHub URL or wait for the SSL certificate to be renewed.
