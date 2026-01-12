# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- **Build**: `bun build src/index.ts --packages external --outdir dist --target node` (or `npm run build`)
- **Format**: `npm run format` (uses Biome)

## Running the Server

The server requires the `OURA_ACCESS_TOKEN` environment variable to be set.

```bash
# stdio mode (default)
OURA_ACCESS_TOKEN=<token> bun run src/index.ts

# SSE mode
OURA_ACCESS_TOKEN=<token> bun run src/index.ts --sse

# HTTP mode (streamable)
OURA_ACCESS_TOKEN=<token> bun run src/index.ts --http [endpoint]
```

## Architecture

This is an MCP (Model Context Protocol) server that exposes Oura Ring health data as tools.

### Key Files

- **src/index.ts**: CLI entry point using `cac`, parses transport type flags
- **src/server.ts**: MCP server setup and tool registration, supports three transport modes (stdio, SSE, HTTP)
- **src/oura.ts**: Oura API client class wrapping `got` for HTTP requests to `api.ouraring.com/v2`
- **src/utils.ts**: Error handling utilities for tool results

### Transport Modes

The server supports three MCP transport types:
1. **stdio** (default): Standard input/output for CLI integration
2. **sse**: Server-Sent Events over HTTP (port 3000 by default, configurable via `PORT` env)
3. **http**: Streamable HTTP using `@chatmcp/sdk` REST transport

### Tool Registration Pattern

Tools are registered using `server.registerTool()` with:
- Tool name
- Metadata object with title, description, and optional inputSchema
- Async handler function returning `{ content: [{ type: 'text', text: string }] }`

Most data-fetching tools use `GeneralOuraSchemaShape` (Zod schema) for date range filtering with `start_date`, `end_date`, and optional `next_token` pagination.
