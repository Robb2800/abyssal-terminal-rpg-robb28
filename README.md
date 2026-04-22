# Abyssal Terminal RPG

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Robb2800/abyssal-terminal-rpg)

A immersive terminal-style RPG experience built on Cloudflare Workers. Dive into the abyssal depths with a full-stack application featuring a React frontend powered by modern UI components and a performant Hono-based API backend.

## Features

- **Terminal-Inspired UI**: Retro aesthetic with modern responsiveness using shadcn/ui and Tailwind CSS.
- **Full-Stack Architecture**: Cloudflare Workers for serverless API routes with Hono.
- **State Management**: TanStack Query for data fetching and caching.
- **Theming**: Dark/light mode support with smooth transitions.
- **Type-Safe**: End-to-end TypeScript with Workers type generation.
- **Production-Ready**: Error boundaries, logging, CORS, and optimized builds.
- **Rapid Development**: Hot reload, linting, and one-command deployment.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion, Sonner (toasts), React Router
- **Backend**: Hono, Cloudflare Workers, Workers KV/Durable Objects ready
- **Data & State**: TanStack React Query, Zustand, React Hook Form, Zod
- **Utilities**: clsx, tailwind-merge, date-fns, UUID
- **Dev Tools**: Bun, ESLint, Wrangler, Cloudflare Vite plugin

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed
   - [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated (`wrangler login`)

2. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd abyssal-terminal-rpg-wpuhu1jov-vmxzbdv4j3f
   bun install
   ```

3. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`).

4. **Type Generation** (for Workers):
   ```bash
   bun cf-typegen
   ```

## Development

- **Hot Reload**: `bun dev` – Frontend auto-reloads, Workers routes available at `/api/*`.
- **Linting**: `bun lint`
- **Build**: `bun build` – Outputs to `dist/`.
- **Preview**: `bun preview` – Serves production build.
- **Add API Routes**: Edit `worker/userRoutes.ts` and restart dev server.
- **Custom Pages**: Update `src/pages/` and `src/main.tsx` router.

All API routes are auto-mounted under `/api/*` with CORS enabled. Example:
```bash
curl http://localhost:3000/api/test
# { "success": true, "data": { "name": "this works" } }
```

## Deployment

Deploy to Cloudflare Workers with Pages integration:

```bash
bun deploy
```

This builds the frontend assets and deploys the Worker. Your app will be live at `<your-worker>.<your-subdomain>.workers.dev`.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Robb2800/abyssal-terminal-rpg)

**Customization**:
- Update `wrangler.jsonc` for bindings (KV, DO, R2).
- Set custom domain via Wrangler dashboard.
- Assets use SPA fallback for client-side routing.

## Project Structure

```
├── src/              # React app (Vite)
│   ├── components/   # UI components (shadcn/ui + custom)
│   ├── pages/        # Route components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities
├── worker/           # Cloudflare Worker (Hono API)
└── public/           # Static assets
```

## Environment & Bindings

Extend `worker/core-utils.ts` `Env` interface for KV/DO:
```ts
interface Env {
  ASSETS: Fetcher;
  MY_KV: KVNamespace;
  MY_DO: DurableObjectNamespace;
}
```

Generate types: `bun cf-typegen`.

## Contributing

1. Fork & clone
2. `bun install`
3. `bun dev` for testing
4. Submit PR with clear description

## License

MIT – see [LICENSE](LICENSE) for details.