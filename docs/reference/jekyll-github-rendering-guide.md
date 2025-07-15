# Jekyll vs GitHub Markdown Rendering Guide

## The Problem

When publishing markdown docs on GitHub Pages (which uses Jekyll), code samples containing template syntax (like `&#123;&#123; &#125;&#125;` or `&#123;&#37; &#37;&#125;`) can cause issues with Jekyll's Liquid template processor.

## The Short Answer

**Yes**, adding `&#123;&#37; raw &#37;&#125;` tags will impact GitHub's native markdown rendering - these tags will appear as literal text when viewing the files directly on GitHub.

## Visual Example

Here's what happens in each context:

### Your Original Markdown:
```markdown
Here's a Vue.js example:
{{ message }}
```

### With Jekyll/Liquid Protection:
```markdown
Here's a Vue.js example:
&#123;&#37; raw &#37;&#125;
&#123;&#123; message &#125;&#125;
&#123;&#37; endraw &#37;&#125;
```

### How It Renders:

| Context | Without `&#123;&#37; raw &#37;&#125;` | With `&#123;&#37; raw &#37;&#125;` |
|---------|-------------------|------------------|
| **GitHub Repository View** | ✅ Shows `&#123;&#123; message &#125;&#125;` correctly | ❌ Shows the literal text `&#123;&#37; raw &#37;&#125;&#123;&#123; message &#125;&#125;&#123;&#37; endraw &#37;&#125;` |
| **GitHub Pages (Jekyll)** | ❌ Breaks - tries to process as Liquid | ✅ Shows `&#123;&#123; message &#125;&#125;` correctly |

## Pros and Cons

**Pros of using `&#123;&#37; raw &#37;&#125;`:**
- ✅ Your GitHub Pages site works correctly
- ✅ No Jekyll build errors
- ✅ Code examples display properly on the published site

**Cons:**
- ❌ Markdown files look messy when browsing the repo on GitHub
- ❌ Contributors see the wrapper tags in PRs and code reviews
- ❌ Less readable for developers working directly with the source

## Alternative Solutions

### 1. Use HTML Entities
Works everywhere, but less readable in source:
```markdown
Here's a Vue.js example:
&#123;&#123; message &#125;&#125;
```

### 2. Use Code Fences with Specific Syntax
Sometimes Jekyll is smart enough to not process code blocks:
````markdown
```vue
{{ message }}
```
````

### 3. Configure Jekyll to Ignore Certain Files
In `_config.yml`:
```yaml
exclude:
  - examples/*.md
  - code-samples/**/*.md
```

### 4. Use Alternative Delimiters
When possible, use different syntax in examples:
```markdown
Here's a template example:
[[ message ]]  # Document that you're using alternate syntax
```

### 5. Use Jekyll's `raw` Include Tag
Create an includes file:
```liquid
<!-- _includes/raw-code.html -->
&#123;&#37; raw &#37;&#125;&#123;&#123; include.code &#125;&#125;&#123;&#37; endraw &#37;&#125;
```

Then in your markdown:
```markdown
&#123;&#37; include raw-code.html code="&#123;&#123; message &#125;&#125;" &#37;&#125;
```

## Recommendation

The **HTML entities approach** is probably your best compromise if you need both environments to render cleanly, though it's less readable in the source. For maximum compatibility:

1. Use HTML entities for simple, inline examples
2. Use code fences for larger code blocks (Jekyll usually handles these correctly)
3. Document your approach in your contributing guidelines
4. Consider having separate folders for "GitHub viewable" docs vs "Jekyll processed" docs if the problem is severe

## Example Documentation Structure

```
docs/
├── README.md           # Uses HTML entities for compatibility
├── _config.yml         # Jekyll configuration
├── guides/             # Jekyll-processed with &#123;&#37; raw &#37;&#125; tags
│   └── vue-guide.md
└── examples/           # Excluded from Jekyll, clean markdown
    └── vue-examples.md
```