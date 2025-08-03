# Static Site Example: How App Description Helps Claude Code

This document shows how the app description for a Lume static site enhances Claude Code's responses.

## Example Queries with Static Site Context

### Query 1: "How do I add a new blog post?"

**Claude with App Context:**

````
🪴 Aichaku: I see you're working on the eSolia Blog using Lume SSG. Based on your content structure, here's how to add a new blog post:

1. **Create a new Markdown file** in `/src/posts/`:

```bash
# File: /src/posts/2025-08-03-new-feature-announcement.md
---
title: "New Feature Announcement"
date: 2025-08-03
author: "rick"  # Should match an author in /_data/authors.yml
tags: 
  - announcements
  - features
layout: layouts/post.njk
---

Your blog post content here...
````

2. **If adding a new author**, update `/_data/authors.yml`:

```yaml
rick:
  name: "Rick Cogley"
  bio: "CEO and Tech Lead"
  avatar: "/images/authors/rick.jpg"
  social:
    twitter: "@rickcogley"
```

3. **Preview locally**:

```bash
deno task serve
# Visit http://localhost:3000
```

4. **Deploy via GitHub**:

```bash
git add src/posts/2025-08-03-new-feature-announcement.md
git commit -m "feat: add new feature announcement post"
git push origin main
```

This will trigger your GitHub Actions workflow and auto-deploy to Netlify at https://blog.esolia.pro.

```
### Query 2: "How do I optimize images for the blog?"

**Claude with App Context:**
```

🪴 Aichaku: For your Lume static site with Cloudinary integration, here are the image optimization approaches:

**Option 1: Cloudinary Integration** (You have this configured):

```typescript
// In your Lume config (_config.ts)
import cloudinary from "lume/plugins/cloudinary.ts";

site.use(cloudinary({
  cloud_name: "your-cloud-name",
  transformations: {
    thumbnail: "w_300,h_300,c_fill,q_auto,f_auto",
    hero: "w_1200,h_600,c_fill,q_auto,f_auto",
    inline: "w_800,q_auto,f_auto",
  },
}));
```

Then in your Markdown:

```markdown
![Alt text](./images/photo.jpg){.cloudinary:thumbnail}
```

**Option 2: Build-time Optimization** with Lume:

```typescript
// Add to _config.ts
import picture from "lume/plugins/picture.ts";

site.use(picture({
  formats: ["avif", "webp", "jpg"],
  sizes: "(max-width: 768px) 100vw, 768px",
}));
```

**Option 3: Netlify Image CDN**:

Since you're deploying to Netlify, use their image transformation:

```html
<img src="/images/hero.jpg?nf_resize=fit&w=1200" alt="Hero image">
```

For your Lighthouse performance target of 95+, I recommend:

- Use Cloudinary for complex transformations
- Implement lazy loading for below-fold images
- Add `loading="lazy"` to image tags
- Keep hero images under 200KB

```
### Query 3: "How do I set up the CMS for a content editor?"

**Claude with App Context:**
```

🪴 Aichaku: You're using Lume CMS with basic authentication. Here's how to set it up for content editors:

1. **Configure Lume CMS** in `_cms.ts`:

```typescript
import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS({
  site: site,
  auth: {
    method: "basic",
    users: {
      admin: "hashed_password_here",
      editor: "hashed_password_here",
    },
  },
});

// Define content collections
cms.collection("posts", {
  name: "Blog Posts",
  description: "Blog articles and news",
  store: "src/posts/*.md",
  fields: [
    "title: text",
    "date: datetime",
    "author: select",
    "tags: list",
    "content: markdown",
  ],
});

cms.collection("pages", {
  name: "Static Pages",
  store: "src/pages/*.md",
  fields: [
    "title: text",
    "layout: select",
    "content: markdown",
  ],
});

export default cms;
```

2. **Access the CMS**:

- Development: http://localhost:3000/_cms
- Production: https://blog.esolia.pro/_cms

3. **Create editor account**:

```bash
# Generate password hash
deno run -A https://deno.land/x/lume_cms/cli.ts hash-password
# Enter password when prompted
# Add hash to _cms.ts users config
```

4. **Security headers** are already configured in your `netlify.toml`:

```toml
[[headers]]
  for = "/_cms/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

InfoSec: Basic auth over HTTPS is sufficient for static site CMS. For enhanced security, consider Netlify Identity for
OAuth.

```
### Query 4: "I'm getting slow build times"

**Claude with App Context:**
```

🪴 Aichaku: Let's optimize your Lume build performance. Since you're using Deno and deploying to Netlify:

1. **Check current build time**:

```bash
time deno task build
```

2. **Optimize Lume plugins** - you have many active:

```typescript
// _config.ts - Load only needed plugins
import lume from "lume/mod.ts";

const site = lume({
  // Enable caching
  cache: true,
});

// Conditional plugin loading
if (Deno.env.get("ENVIRONMENT") === "production") {
  site.use(terser()); // Only minify in production
  site.use(inline()); // Only inline CSS in production
}
```

3. **Parallelize asset processing**:

```typescript
site.process([".jpg", ".png"], (files) => {
  return Promise.all(files.map(async (file) => {
    // Process images in parallel
  }));
});
```

4. **Netlify build caching**:

```toml
# netlify.toml
[build]
  environment = { DENO_DIR = "/opt/buildhome/.deno" }

[[plugins]]
  package = "netlify-plugin-cache"
  [plugins.inputs]
    paths = [
      ".deno",
      "_cache"  # Lume's cache directory
    ]
```

5. **Reduce plugin overhead**:

- Remove unused plugins from your list
- `paginate` - only if you have many posts
- `feed` - can be built less frequently
- Consider moving image optimization to Cloudinary entirely

Your current plugins: postcss, terser, sass, date, feed, sitemap, paginate Essential only: date, sitemap (others can be
conditional)

This should help achieve faster builds while maintaining your performance targets.

```
## Benefits for Static Sites

The app description helps Claude Code understand:

1. **No Backend** - Won't suggest server-side solutions
2. **Deno/Lume Specific** - Uses correct commands and imports
3. **Static Deployment** - Netlify-specific optimizations
4. **Build Process** - Understands the SSG workflow
5. **CMS Integration** - Knows about Lume CMS setup
6. **Performance Focus** - Targets static site metrics

This context prevents Claude from suggesting inappropriate solutions (like databases or server-side authentication) and focuses on static-site-specific patterns and optimizations.
```
