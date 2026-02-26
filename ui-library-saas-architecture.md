# Scalable UI Library + SaaS Product Architecture

## Target
Build a reusable UI system and a SaaS app on top of it:
- `ui-library`: shared components, tokens, patterns
- `saas-app`: product features using the shared library

## System Design
### High-Level Architecture
```txt
Users
  ->
CDN/WAF
  ->
Next.js Web App (BFF)
  ->
API Layer
  ->
Core Services (Auth, Workspace, Billing, Notifications, Analytics)
  ->
PostgreSQL + Redis + Queue Workers
  ->
Object Storage + Observability Stack
```

### Core Subsystems
- `Web/BFF`: SSR, edge caching, auth session handling, API orchestration.
- `API`: business rules, tenant-aware authorization, request validation.
- `DB`: relational source of truth with tenant-scoped schemas/tables.
- `Cache`: Redis for session cache, read optimization, rate limiting.
- `Queue/Workers`: emails, exports, AI jobs, background sync.
- `Observability`: logs, traces, metrics, alerting SLOs.

### Request Flow (Tenant-Safe)
1. User request enters `web` with auth token.
2. BFF resolves tenant context (`workspace_id`).
3. API policy checks role + workspace access.
4. Service executes business logic with tenant filters.
5. DB query always scoped by `workspace_id`.
6. Audit log captures actor, action, resource, timestamp.

### Reliability + Scale Targets
- Availability target: `99.9%` for core app paths.
- P95 page/API response targets defined per feature.
- Horizontal scaling for web, API, and workers.
- Read-heavy endpoints cached with explicit TTL/invalidation.

### Security Baseline
- RBAC + tenant isolation mandatory on every write/read path.
- Encryption in transit and at rest.
- Secrets managed in vault/secret manager.
- Centralized audit trail for admin and billing actions.

## Recommended Monorepo Structure
```txt
repo/
  apps/
    web/                  # SaaS frontend (Next.js)
    docs/                 # Storybook/docs site
  packages/
    tokens/               # Design tokens (color, spacing, typography)
    ui-core/              # Primitive components (Button, Input, Modal)
    ui-patterns/          # Product patterns (Table, Filters, EmptyState)
    eslint-config/
    ts-config/
    utils/
  services/
    api/                  # Backend API (Node/FastAPI)
  infra/
    docker/
    terraform/            # optional
```

## Tech Stack
- Frontend: React + TypeScript + Next.js
- Styling: Sass + CSS variables (design tokens compiled to CSS vars)
- Component Docs: Storybook
- Build: Turborepo or Nx + pnpm
- Testing: Vitest/Jest + Playwright + Chromatic (visual regression)
- API: FastAPI or Node/Nest
- DB: PostgreSQL
- Auth: Clerk/Auth0/NextAuth

## UI Component Architecture v2.0

### Layer Model
1. `tokens`: raw + semantic design tokens.
2. `foundations`: typography, grid, spacing, motion, elevation.
3. `primitives`: unopinionated accessible components.
4. `composites`: reusable patterns built from primitives.
5. `screens`: product-level compositions inside apps only.

### Component Contract v2.0
- Every component must provide:
  - accessibility contract (`aria-*`, keyboard flow, focus behavior)
  - variant contract (`size`, `variant`, `state`)
  - theming contract (CSS variable hooks only)
  - testing contract (unit + interaction + visual story)
- No business logic inside `ui-core`; only UI behavior.
- Stable public API with deprecation policy before breaking changes.

### Folder Standard (v2.0)
```txt
packages/ui-core/src/button/
  Button.tsx
  Button.types.ts
  Button.styles.scss
  Button.test.tsx
  Button.stories.tsx
  index.ts
```

### State + Styling Rules
- Style precedence: `tokens -> base styles -> variants -> state`.
- Controlled/uncontrolled mode supported where applicable.
- Data attributes for state styling (`data-disabled`, `data-loading`).
- Avoid one-off class names; prefer token + variant driven styling.

### Accessibility Gates (v2.0)
- WCAG 2.2 AA baseline.
- Keyboard navigation tests for all interactive components.
- Focus-visible styles required.
- Color contrast checks in CI.

### Performance Gates (v2.0)
- Tree-shakable exports and side-effect-safe packaging.
- Prevent unnecessary re-renders with memoization where valid.
- Bundle budget per package and per app route.
- Lazy-load heavy patterns (table, editor, charts).

## 1) Design Tokens Layer
- Single source of truth:
  - colors (semantic: `--color-bg-surface`, `--color-text-primary`)
  - spacing scale (`4, 8, 12, 16...`)
  - typography scale
  - radii, shadows, z-index
- Keep raw and semantic tokens separate.

## 2) Primitive Components (`ui-core`)
- Stateless and composable.
- Examples: `Button`, `Input`, `Select`, `Checkbox`, `Modal`, `Tabs`.
- API rules:
  - consistent props (`size`, `variant`, `disabled`)
  - forward refs
  - accessibility first (ARIA, keyboard support)

## 3) Product Patterns (`ui-patterns`)
- Built from primitives.
- Examples: `DataTable`, `FilterBar`, `AppHeader`, `BillingCard`.
- Contains SaaS-specific UX patterns.

## 4) Theming Model
- Sass compiles base styles.
- Runtime theme switch with CSS variables:
  - `data-theme="light"`
  - `data-theme="dark"`
  - customer branding override

## SaaS Product Architecture

## Frontend (BFF style recommended)
- Next.js app router.
- Server actions/API routes as BFF layer.
- Feature folders:
```txt
apps/web/src/features/
  auth/
  onboarding/
  dashboard/
  billing/
  settings/
```

## Backend
- Domain modules:
  - users
  - orgs/workspaces
  - subscriptions
  - analytics/events
- Queue for async jobs (emails, exports, AI tasks).

## Multi-Tenant Strategy
- Tenant key in every domain record (`workspace_id`).
- Auth + RBAC:
  - owner
  - admin
  - member
- Enforce tenant isolation in API and DB queries.

## Scalability Rules
1. Keep UI library independent from product business logic.
2. Add strict versioning for `ui-core` and `ui-patterns`.
3. Use feature flags for gradual rollout.
4. Track bundle size and component render performance.
5. Add visual regression tests before each release.

## CI/CD Pipeline
1. Lint + typecheck + unit tests
2. Build changed packages only (Turbo/Nx cache)
3. Storybook build + visual snapshots
4. E2E smoke tests
5. Release:
   - library packages to registry
   - SaaS app to hosting

## Versioning Strategy
- SemVer for library packages.
- Changesets for release notes.
- Breaking changes require migration docs with examples.

## Example Sass + Token Pattern
```scss
/* packages/tokens/src/_semantic.scss */
:root {
  --color-bg-surface: #ffffff;
  --color-text-primary: #1f2937;
  --space-3: 12px;
  --radius-md: 10px;
}

[data-theme='dark'] {
  --color-bg-surface: #101418;
  --color-text-primary: #e5e7eb;
}
```

```tsx
// packages/ui-core/src/button/Button.tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

## 90-Day Build Plan
1. Weeks 1-2:
   - Repo setup, tokens, lint/test baseline
2. Weeks 3-4:
   - 10 core components + Storybook docs
3. Weeks 5-6:
   - SaaS shell: auth, layout, dashboard
4. Weeks 7-8:
   - billing/settings modules + RBAC
5. Weeks 9-10:
   - pattern components + performance pass
6. Weeks 11-12:
   - E2E, visual tests, release process

## First Components to Build
1. Button
2. Input
3. Select
4. Modal
5. Table
6. FormField
7. Toast
8. EmptyState
9. Pagination
10. Command Palette

## Non-Negotiables
- Accessibility from day 1
- Token-driven styling (no random colors in components)
- Strong docs with usage and do/don't examples
- Measurable quality gates in CI
