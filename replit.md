# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Eye Color Atlas (`artifacts/eye-color-atlas`)
- **Type**: react-vite web app
- **Preview**: `/` (root)
- **Description**: Interactive eye color encyclopedia with global population data, genetics, disease risks, image upload analyzer, inheritance predictor, and country finder.
- **Pages**:
  - `/` — Home: grid of all eye colors with search
  - `/eye/:id` — Eye color detail: country data, primary country, diseases, recovery, recommendations
  - `/inheritance` — Genetics-based eye color inheritance predictor with pie chart
  - `/country` — Country Finder: search any country, view pie chart of eye color distribution
  - `/upload` — Eye image uploader: analyzes iris color using canvas pixel sampling
- **Data**: All embedded in `src/data/eyeColorData.ts` — no backend required

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
