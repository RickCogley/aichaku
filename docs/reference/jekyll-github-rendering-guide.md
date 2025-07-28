# Jekyll vs GitHub Markdown Rendering Guide

## The Problem

When publishing Markdown docs on GitHub Pages (which uses Jekyll), two main issues can occur:

1. **Liquid Syntax Errors**: Code samples containing template syntax (like `&#123;&#123; &#125;&#125;` or
   `&#123;&#37; &#37;&#125;`) can cause Jekyll's Liquid template processor to fail
2. **Recursive Processing**: Jekyll follows relative links in your README and tries to process ALL linked files, causing
   errors in files you never intended to be part of the Pages site

## The Short Answer

**Yes**, adding `&#123;&#37; raw &#37;&#125;` tags will impact GitHub's native Markdown rendering - these tags will
appear as literal text when viewing the files directly on GitHub.

## Visual Example

Here's what happens in each context:

### Your Original Markdown:

```markdown
Here's a Vue.js example: {{ message }}
```

### With Jekyll/Liquid Protection:

```markdown
Here's a Vue.js example: &#123;&#37; raw &#37;&#125; &#123;&#123; message &#125;&#125; &#123;&#37; endraw &#37;&#125;
```

### How It Renders:

| Context                    | Without `&#123;&#37; raw &#37;&#125;`                  | With `&#123;&#37; raw &#37;&#125;`                                                                                     |
| -------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **GitHub Repository View** | ✅ Shows `&#123;&#123; message &#125;&#125;` correctly | ❌ Shows the literal text `&#123;&#37; raw &#37;&#125;&#123;&#123; message &#125;&#125;&#123;&#37; endraw &#37;&#125;` |
| **GitHub Pages (Jekyll)**  | ❌ Breaks - tries to process as Liquid                 | ✅ Shows `&#123;&#123; message &#125;&#125;` correctly                                                                 |

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
Here's a Vue.js example: &#123;&#123; message &#125;&#125;
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
Here's a template example: [[message]] # Document that you're using alternate syntax
```

### 5. Use Jekyll's `raw` Include Tag

Create an includes file:

```liquid
<!-- _includes/raw-code.html -->
&#123;&#37; raw &#37;&#125;&#123;&#123; include.code &#125;&#125;&#123;&#37; endraw &#37;&#125;
```

Then in your Markdown:

```markdown
&#123;&#37; include raw-code.html code="&#123;&#123; message &#125;&#125;" &#37;&#125;
```

## The Best Solution: External Links

**The most effective solution** for GitHub Pages serving from root is to use absolute GitHub URLs for all documentation
links. This prevents Jekyll from recursively processing linked files AND enables Mermaid diagram rendering.

### Before (Problematic):

```markdown
[Documentation](docs/) [How-to Guide](docs/how-to/configure.md)
```

### After (Solution):

```markdown
[Documentation](https://github.com/YourName/YourRepo/tree/main/docs)
[How-to Guide](https://github.com/YourName/YourRepo/blob/main/docs/how-to/configure.md)
```

**Key Benefits:**

- **Mermaid Diagrams Work!** - GitHub's native rendering supports Mermaid diagrams, but GitHub Pages doesn't without
  complex setup
- Jekyll treats these as external links and doesn't process them
- Users can browse the repository directly with full GitHub features
- No need to modify your actual documentation files
- Works perfectly when GitHub Pages serves from repository root
- Avoids Liquid syntax processing errors

**Important:** If you want to render Mermaid diagrams, linking to the repository directly will allow that, so use the
absolute URLs and just let visitors browse the repository for the details.

## Alternative Solutions

### For Content Within Your Pages Site

If you DO want certain Markdown files to be part of your Jekyll site:

1. **HTML Entities** - Use for simple inline examples
2. **Code Fences** - Jekyll usually handles these correctly
3. **Jekyll Excludes** - Use `_config.yml` to exclude specific directories

## Recommendation

**For GitHub Pages serving from root:**

1. Use absolute GitHub URLs for all documentation links in your README
2. This prevents Jekyll from processing files containing Liquid syntax
3. Users can still access all documentation via GitHub's native rendering
4. No need to modify documentation files with `{% raw %}` tags

## Example Documentation Structure

```
/                       # GitHub Pages serves from here
├── README.md           # Landing page with absolute GitHub URLs
├── docs/               # Not processed by Jekyll (not linked relatively)
│   ├── guides/         # Contains Liquid syntax, viewed on GitHub
│   └── examples/       # Clean markdown, viewed on GitHub
└── _config.yml         # Optional Jekyll config (if needed)
```
