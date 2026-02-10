# oura-mcp

An MCP server for [Oura Ring](https://ouraring.com/) that exposes your health and wellness data as tools for AI assistants.

## Setup

1. Create a personal access token at [cloud.ouraring.com](https://cloud.ouraring.com/personal-access-tokens)
2. Copy the token

## Usage

### stdio (default)

Add to your MCP client config (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "oura": {
      "command": "npx",
      "args": ["-y", "oura-mcp"],
      "env": {
        "OURA_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

### Streamable HTTP

```bash
OURA_ACCESS_TOKEN=<your-token> npx -y oura-mcp --http
```

Starts on `http://localhost:3000/mcp` by default. Custom endpoint:

```bash
npx -y oura-mcp --http /custom/path
```

Port is configurable via `PORT` environment variable.

## Tools

All tools support `response_format` (`json` | `markdown`) and paginated endpoints accept `start_date`, `end_date`, `limit`, and `next_token`.

| Tool | Description |
|------|-------------|
| `oura_get_personal_info` | User profile: age, weight, height, biological sex, email |
| `oura_get_daily_activity` | Activity score, steps, calories, active minutes |
| `oura_get_daily_cardiovascular_age` | Estimated vascular age |
| `oura_get_daily_sleep` | Sleep score, contributors (deep, REM, efficiency, etc.) |
| `oura_get_daily_spo2` | Blood oxygen saturation averages |
| `oura_get_daily_stress` | Stress/recovery minutes and day summary |
| `oura_get_heartrate` | Heart rate time-series with BPM summary in markdown mode |

## Development

```bash
bun install
bun run src/index.ts                    # stdio mode
bun run src/index.ts --http             # HTTP mode
npm run build                           # bundle to dist/
npm run format                          # biome format
npx tsc --noEmit                        # type check
```

## License

MIT.
