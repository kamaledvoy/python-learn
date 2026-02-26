# UI Library + SaaS Monorepo Starter

This scaffold follows `UI Component Architecture v2.0` and the system design in `ui-library-saas-architecture.md`.

## Apps
- `apps/web`: SaaS app (Next.js-ready)
- `apps/docs`: Storybook/docs site

## Packages
- `packages/tokens`: design tokens + theme variables
- `packages/ui-core`: primitive components
- `packages/ui-patterns`: composed product patterns
- `packages/eslint-config`: shared lint rules
- `packages/ts-config`: shared TypeScript presets
- `packages/utils`: shared utility helpers

## Services
- `services/api`: API service modules

## Infra
- `infra/docker`: docker assets
- `infra/terraform`: infra as code placeholders
