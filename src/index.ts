import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  screenshotToolName,
  screenshotToolDescription,
  ScreenshotToolSchema,
  runScreenshotTool,
} from "./tools/screenshot.js";

import {
  architectToolName,
  architectToolDescription,
  ArchitectToolSchema,
  runArchitectTool,
} from "./tools/architect.js";

import {
  codeReviewToolName,
  codeReviewToolDescription,
  CodeReviewToolSchema,
  runCodeReviewTool,
} from "./tools/codeReview.js";

import { z } from "zod";
import fs from "fs/promises";

// Define schemas for read_file and read_multiple_files
const ReadFileArgsSchema = z.object({
  path: z.string(),
});

const ReadMultipleFilesArgsSchema = z.object({
  paths: z.array(z.string()),
});

const server = new Server(
  {
    name: "cursor-tools",
    version: "2.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: screenshotToolName,
        description: screenshotToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Full URL to screenshot",
            },
            relativePath: {
              type: "string",
              description: "Relative path appended to http://localhost:3000",
            },
            fullPathToScreenshot: {
              type: "string",
              description:
                "Path to where the screenshot file should be saved. This should be a cwd-style full path to the file (not relative to the current working directory) including the file name and extension.",
            },
          },
          required: [],
        },
      },
      {
        name: architectToolName,
        description: architectToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "Description of the task",
            },
            code: {
              type: "string",
              description: "Concatenated code from one or more files",
            },
          },
          required: ["task", "code"],
        },
      },
      {
        name: codeReviewToolName,
        description: codeReviewToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            folderPath: {
              type: "string",
              description:
                "Path to the full root directory of the repository to diff against main",
            },
          },
          required: ["folderPath"],
        },
      },
      {
        name: "read_file",
        description: "Read the contents of a single file",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Full path to the file to read",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "read_multiple_files",
        description: "Read the contents of multiple files",
        inputSchema: {
          type: "object",
          properties: {
            paths: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of full paths to files to read",
            },
          },
          required: ["paths"],
        },
      },
    ],
  };
});

// Implement tool call logic with read_file and read_multiple_files
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case screenshotToolName: {
      const validated = ScreenshotToolSchema.parse(args);
      return await runScreenshotTool(validated);
    }
    case architectToolName: {
      const validated = ArchitectToolSchema.parse(args);
      return await runArchitectTool(validated);
    }
    case codeReviewToolName: {
      const validated = CodeReviewToolSchema.parse(args);
      return await runCodeReviewTool(validated);
    }
    case "read_file": {
      const parsed = ReadFileArgsSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for read_file: ${parsed.error}`);
      }
      try {
        const content = await fs.readFile(parsed.data.path, "utf-8");
        return {
          content: [{ type: "text", text: content }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading file ${parsed.data.path}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
    case "read_multiple_files": {
      const parsed = ReadMultipleFilesArgsSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(
          `Invalid arguments for read_multiple_files: ${parsed.error}`
        );
      }

      const results = await Promise.all(
        parsed.data.paths.map(async (filePath) => {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            return `${filePath}:\n${content}\n`;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return `${filePath}: Error - ${errorMessage}`;
          }
        })
      );

      return {
        content: [{ type: "text", text: results.join("\n---\n") }],
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the MCP server with a stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cursor Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
