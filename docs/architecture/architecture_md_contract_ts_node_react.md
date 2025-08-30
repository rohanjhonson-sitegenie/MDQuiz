# Architecture Contract (ARCHITECTURE.md)

> **Purpose**: Turn architecture into *executable constraints* so that humans and AI generate consistent, maintainable code. This contract is short, normative (MUST/SHOULD), and enforced by tooling.

---

## 1) Scope & Tech Baseline

- **Scope**: All apps and packages in this repo (backend services, web frontends, shared libraries, infra code).
- **Primary stack**: TypeScript ≥ 5.x, Node ≥ 18.x, React + Vite, pnpm workspaces (or npm/yarn), Prisma (or equivalent), Zod for schema validation.
- **Style**: ES Modules, strict TS, Prettier.

---

## 2) Architectural Model (Clean Architecture-lite)

### 2.1 Layers & Dependency Rule

```
app  →  domain  →  infra
```

- **app**: IO layer. Controllers, HTTP/RPC handlers, DTOs, mappers, validators. No business rules.
- **domain**: Business core. Entities, Value Objects, Use Cases/Services, Ports (interfaces). **No framework imports.**
- **infra**: Adapters. DB repositories, HTTP/SDK clients, message brokers, providers. Implements domain ports.

**Hard rule**: Dependencies flow **only downward**. Reverse or cross-layer imports are forbidden.

### 2.2 Module Boundaries

- Code is grouped by *business module* under `src/modules/*` (e.g., `orders`, `users`).
- Modules may not import each other’s internals directly. Cross-module interactions go through:
  1. app orchestration (application services) or
  2. domain events/ports.

### 2.3 Allowed Imports Matrix

| From \ To  | shared | app            | domain         | infra          |
| ---------- | ------ | -------------- | -------------- | -------------- |
| **shared** | ✅      | ❌              | ❌              | ❌              |
| **app**    | ✅      | ✅(same module) | ✅              | ❌              |
| **domain** | ✅      | ❌              | ✅              | ❌              |
| **infra**  | ✅      | ❌              | ✅ (ports only) | ✅(same module) |

---

## 3) Repository Layout

```
/ apps
  / web              (React app)
  / api              (HTTP service)
/ packages
  / shared           (Result, AppError, config, logger)
  / ui               (design system, React components)
  / sdk              (typed API client, generated)
/ infra              (IaC, docker, scripts)
```

**Backend module anatomy** (`apps/api/src/modules/orders`):

```
app/      controllers/, dto/, validators/, mappers/, services/
domain/   entities/, value-objects/, ports/, use-cases/
infra/    repos/, orm/, gateways/, providers/
```

**Frontend feature anatomy** (`apps/web/src/features/orders`):

```
api/ (typed sdk usage), ui/ (feature components), model/ (state), pages/
```

Conventions: file suffixes `*.controller.ts`, `*.use-case.ts`, `*.repo.ts`, `*.port.ts`, `*.entity.ts`, `*.vo.ts`.

---

## 4) Contracts as Source of Truth

- **API**: OpenAPI/GraphQL SDL is the *single source of truth*. Types and clients are generated into `packages/sdk`.
- **Data**: DB schema managed via migrations (Prisma or SQL). No runtime schema drift.
- **Events**: Domain/integration events have JSON Schemas (Zod) versioned under `contracts/events`. Generated types are used in code.

---

## 5) Cross-Cutting Concerns

### 5.1 Configuration (12-Factor)

- All environment differences live in **env vars**. No secrets in code.
- `packages/shared/config` is the only place reading `process.env`; export a typed config object validated by Zod.

### 5.2 Errors & Results

- All public functions return `Result<T, AppError>` or throw **only** domain-specific errors caught at app layer.
- Standard error shape at the edge: `{ code, message, details?, traceId }`.

### 5.3 Validation

- Input validation is at **app layer** (DTO + Zod). Domain guards protect invariants (constructors/factories).

### 5.4 Logging & Telemetry

- Log to stdout with structured logs. No file I/O.
- Include `traceId`/`spanId`; emit metrics for latency/error rate.

### 5.5 Security

- AuthN/AuthZ enforced at app layer middleware/guards.
- Never pass raw tokens into domain.
- Sensitive data must be redacted in logs.

### 5.6 Caching & Idempotency

- Caches live in infra (repository or gateway decorators). Keys are named; TTL declared near usage.
- External side-effect calls must be idempotent or guarded by de-dupe keys.

### 5.7 Background Jobs

- Use a job queue adapter in infra (e.g., BullMQ). Handlers belong to app layer; business logic is domain use-cases.

---

## 6) Testing Strategy (Quality Gates)

- **Unit (domain-first)**: Entities/VOs/Use-cases with in-memory fakes. Fast.
- **Contract**: API schemas, event payloads, repository interfaces.
- **Integration**: Adapters (DB/HTTP) with real infra via Docker or testcontainers.
- **E2E (selective)**: Critical flows only.

**CI pipeline (must pass to merge)**: `typecheck → lint → arch-lint → unit → contract → integration (if changed) → build`.

---

## 7) Tooling Enforcement (Arch‑Lint)

### 7.1 ESLint Boundaries (TS/Node)

Add to `.eslintrc`:

```json
{
  "settings": {
    "boundaries/elements": [
      { "type": "app", "pattern": "src/modules/*/app" },
      { "type": "domain", "pattern": "src/modules/*/domain" },
      { "type": "infra", "pattern": "src/modules/*/infra" },
      { "type": "shared", "pattern": "src/shared" }
    ]
  },
  "rules": {
    "boundaries/element-types": [2, {
      "default": "disallow",
      "rules": [
        { "from": ["app"], "allow": ["domain", "shared"] },
        { "from": ["domain"], "allow": ["shared"] },
        { "from": ["infra"], "allow": ["domain", "shared"] },
        { "from": ["shared"], "allow": ["shared"] }
      ]
    }]
  }
}
```

### 7.2 Monorepo boundaries (optional)

If using Nx/Turborepo, tag libs with `domain`, `app`, `infra` and enable dependency constraints.

---

## 8) Frontend Contract (React + Vite)

- **Feature-first structure**: `src/features/<feature>/{ui,model,api}`; shared UI in `packages/ui`.
- **Data fetching**: Only through `packages/sdk` (generated types). No ad-hoc `fetch` in components.
- **State**: Co-locate minimal state; avoid global stores by default.
- **Styling/Design system**: Use shared components; no inline magic numbers. Tokens in CSS vars.
- **Env**: Only `VITE_*` variables; read via a typed config module.

---

## 9) Backend Contract (HTTP service)

- Controllers/routers live in `app/` and are *thin*.
- Each route delegates to a **single use-case** in `domain/`.
- Repositories in `infra/` implement `ports` from `domain/` and return **domain entities**, not ORM models.
- Mappers translate **DTO ↔︎ Domain** in `app/mappers`.

---

## 10) Code Generation & AI Guardrails

- Always generate a **file plan** before code: JSON listing files to add/modify with responsibilities and dependencies.
- “One PR, one purpose.”
- Use Plop/Hygen generators to scaffold modules/use-cases consistently.

**AI prompt header** (paste to the top of requests):

```
Role: You are the project code generator. You MUST follow ARCHITECTURE.md.
Goal: modify only the {module} module.
Constraints: app→domain→infra; no cross‑module imports; domain has no framework.
Output: (1) a JSON file plan; (2) code matching the plan.
Error/Result: use Result<T, AppError>.
```

---

## 11) PR Checklist (must answer “Yes”)

-

---

## 12) Non‑Functional Requirements (NFR)

- **Performance**: P95 latency and memory budgets must be declared per endpoint.
- **Scalability**: Processes are stateless; session/state stored externally.
- **Observability**: Logs + metrics + traces for critical paths.
- **Security**: Least privilege, input/output validation, secret management, dependency scanning.

---

## 13) Anti‑Patterns (Forbidden)

- Domain importing framework/transport/ORM types.
- Controllers directly using repositories or external SDKs.
- Passing ORM models across layers; leaking persistence concerns.
- Cross‑module “reach‑in” imports (use events or app services).
- Reading `process.env` outside the config module.
- Silent catches; unstructured logs; swallowing errors.

---

## Appendix A: Example Result & Error

```ts
export type Result<T, E extends Error = Error> = { ok: true; value: T } | { ok: false; error: E };

export class AppError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Appendix B: Example Mapper Skeleton

```ts
// app/mappers/order.mapper.ts
import { Order } from '../../domain/entities/order.entity';
import { z } from 'zod';

export const OrderDto = z.object({ id: z.string().uuid(), total: z.number().nonnegative() });
export type OrderDto = z.infer<typeof OrderDto>;

export const toDto = (e: Order): OrderDto => ({ id: e.id.value, total: e.total.amount });
```

## Appendix C: Example Repo Port & Adapter

```ts
// domain/ports/order.repo.port.ts
import { Order } from '../entities/order.entity';
export interface OrderRepoPort { byId(id: string): Promise<Order | null>; save(o: Order): Promise<void>; }

// infra/repos/order.prisma.repo.ts
import { OrderRepoPort } from '../../domain/ports/order.repo.port';
import { prisma } from '../../orm/client';
export class OrderPrismaRepo implements OrderRepoPort { /* ... */ }
```

---

> **Amendment rule**: Any change to these rules must be in a dedicated PR titled `chore(arch): update architecture contract`, reviewed by at least one maintainer.

