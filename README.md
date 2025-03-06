# 🤖 AI Development Assistant MCP Server

Welcome to your AI-powered development toolkit, designed as a Model Context Protocol (MCP) server for Cursor! This project provides intelligent coding assistance through custom AI tools. Note that this is mostly a tutorial demo, and not a production-ready tool.

## ✨ Features

### 🎨 Code Architect

Call advanced reasoning LLMs to generate plans and instructions for coding agents.

### 📸 Screenshot Buddy

Take UI design screenshots and use them with the composer agent.

### 🔍 Code Review

Use git diffs to trigger code reviews.

## 🚀 Getting Started

### 1. Environment Setup

First, you'll need to set up your environment variables. Create a file at `src/env/keys.ts`:

```typescript
export const OPENAI_API_KEY = "your_key_here";
// Add any other keys you need
```

> ⚠️ **Security Note**: Storing API keys directly in source code is not recommended for production environments. This is only for local development and learning purposes. You can set the env var inline in the Cursor MCP interface as well.

### 2. Installation

```bash
npm install
# or
yarn install
```

### 3. Build the Server

```bash
npm run build
```

### 4. Open Windsurf Chat and Configure MCP

This project is designed to be used as an MCP server in Cursor. Here's how to set it up:

1. Open Windsurf on your system.
2. Navigate to the Chat section.
3. Click `+ Configure MCP` (this allows you to add a new MCP server).
4. Add the following JSON configuration:
```npm
{
  "mcpServers": {
    "mcp-server": {
      "command": "node",
      "args": [
        "D:\\mpc-server\\build\\index.js"
      ]
    }
  }
}
```

> 📘 **Pro Tip**: You might need to use the full path to your project's built index.js file.

After adding the server, you should see your tools listed under "Available Tools". If not, try clicking the refresh button in the top right corner of the MCP server section.

For more details about MCP setup, check out the [Windsurf MCP Documentation](https://docs.codeium.com/windsurf/mcp).

## 🛠️ Using the Tools

Once configured, you can use these tools directly in Cursor's Composer. The AI will automatically suggest using relevant tools, or you can explicitly request them by name or description.

For example, try typing in Composer:

- "Review this code for best practices"
- "Help me architect a new feature"
- "Analyze this UI screenshot"

The agent will ask for your approval before making any tool calls.

> 📘 **Pro Tip**: You can update your .cursorrules file with instructions on how to use the tools for certain scenarios, and the agent will use the tools automatically.

## 📁 Project Structure

```
src/
├── tools/
│   ├── architect.ts    # Code structure generator
│   ├── screenshot.ts   # Screenshot analysis tool
│   └── codeReview.ts   # Code review tool
├── env/
│   └── keys.ts         # Environment configuration (add your API keys here!)
└── index.ts           # Main entry point
```

---
