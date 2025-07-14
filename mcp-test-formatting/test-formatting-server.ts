#!/usr/bin/env -S deno run --allow-read --allow-env

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Test different formatting approaches
const formatters = {
  markdown: (title: string, content: string) => {
    return `## ${title}\n\n**Status:** Active\n**Details:** ${content}\n\n- Item 1\n- Item 2`;
  },

  plain: (title: string, content: string) => {
    return `${title}\n${
      "=".repeat(title.length)
    }\n\nStatus: Active\nDetails: ${content}\n\n• Item 1\n• Item 2`;
  },

  ansi: (title: string, content: string) => {
    // ANSI escape codes for formatting
    const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
    const underline = (text: string) => `\x1b[4m${text}\x1b[0m`;
    const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

    return `${bold(underline(title))}\n\n${bold("Status:")} ${
      green("Active")
    }\n${bold("Details:")} ${content}\n\n• Item 1\n• Item 2`;
  },

  unicode: (title: string, content: string) => {
    return `📋 ${title}\n${
      "━".repeat(30)
    }\n\n✅ Status: Active\n📝 Details: ${content}\n\n▸ Item 1\n▸ Item 2`;
  },

  structured: (title: string, content: string) => {
    return [
      title,
      "-".repeat(title.length),
      "",
      "Status: Active",
      `Details: ${content}`,
      "",
      "- Item 1",
      "- Item 2",
    ].join("\n");
  },
};

async function main() {
  const transport = new StdioServerTransport();
  const server = new Server(
    {
      name: "test-formatting",
      vendor: "aichaku",
      version: "1.0.0",
      description: "Test MCP server for formatting experiments",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, () => {
    const tools = Object.keys(formatters).map((style) => ({
      name: `test_${style}`,
      description: `Test ${style} formatting`,
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title text" },
          content: { type: "string", description: "Content text" },
        },
        required: ["title", "content"],
      },
    }));

    // Add JSON tool
    tools.push({
      name: "test_json",
      description: "Test JSON response",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title text" },
          content: { type: "string", description: "Content text" },
        },
        required: ["title", "content"],
      },
    });

    return { tools };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, (request) => {
    const { name, arguments: args } = request.params;

    if (!args) {
      return {
        content: [
          {
            type: "text",
            text: "Error: No arguments provided",
          },
        ],
        isError: true,
      };
    }

    if (name === "test_json") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                title: args.title,
                status: "Active",
                details: args.content,
                items: ["Item 1", "Item 2"],
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // Handle formatter tools
    const style = name.replace("test_", "");
    const formatter = formatters[style as keyof typeof formatters];

    if (!formatter) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
    }

    const formatted = formatter(args.title as string, args.content as string);

    return {
      content: [
        {
          type: "text",
          text: formatted,
        },
      ],
    };
  });

  await server.connect(transport);
}

// Run the server
if (import.meta.main) {
  await main().catch(console.error);
}
