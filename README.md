# TrueStock

AI-powered stock analysis for Vietnamese F0 investors. Enter a stock ticker and receive plain-language analysis of financial health — no jargon, no broker bias.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Hono on Cloudflare Workers
- **Database**: Neon PostgreSQL
- **AI**: Anthropic Claude API
- **Auth**: Clerk

## Project Structure

```
truestock/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # Hono + Cloudflare Workers backend
├── packages/
│   └── types/        # Shared TypeScript types
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm (enabled via corepack)

### Setup

```bash
# Enable pnpm via corepack
corepack enable
corepack prepare pnpm@latest --activate

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run linting across all packages |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm clean` | Clean all build artifacts |

## Workspaces

- `@truestock/web` - Frontend application
- `@truestock/api` - Backend API
- `@truestock/types` - Shared TypeScript types
