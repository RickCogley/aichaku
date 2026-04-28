import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://aichaku-docs.esolia.workers.dev",
  integrations: [
    starlight({
      title: "Aichaku (愛着)",
      description:
        "AI-optimized methodology helper for Claude Code. Brings affection (愛着) to your development workflow.",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/RickCogley/aichaku" },
        { icon: "jsr", label: "JSR", href: "https://jsr.io/@rick/aichaku" },
      ],
      sidebar: [
        { label: "Tutorials", autogenerate: { directory: "tutorials" } },
        { label: "How-to guides", autogenerate: { directory: "how-to" } },
        { label: "Reference", autogenerate: { directory: "reference" } },
        { label: "Explanation", autogenerate: { directory: "explanation" } },
        { label: "Development", autogenerate: { directory: "development" } },
        {
          label: "API Reference",
          link: "/api/",
          attrs: { target: "_blank", rel: "noopener" },
          badge: { text: "deno doc", variant: "tip" },
        },
      ],
      editLink: {
        baseUrl: "https://github.com/RickCogley/aichaku/edit/main/docs-site/",
      },
      lastUpdated: true,
    }),
  ],
});
