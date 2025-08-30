# NO-MOCK INTEGRATION & CONTRACT TESTING RULE 🛡️
──────────────────────────────────────────────
### CONTEXT
You are writing **automated tests** with AI assistance inside AI Coding Assistant.
Unit tests may mock external dependencies, **but integration & contract tests must hit real components** (e.g., local DB containers, actual HTTP endpoints or Pact stubs). Over-mocking hides bugs and defeats the purpose of these suites.

──────────────────────────────────────────────
### REQUIRED BEHAVIOUR

| Scope | Folder / Suffix | Mocking Policy |
|-------|-----------------|---------------|
| **Unit** | `tests/unit/**` or `*.unit.test.(js|ts)` | ✅ *Allowed* (keep focused) |
| **Contract** | `tests/contract/**` or `*.contract.test.(js|ts)` | 🚫 *Forbidden* to mock the **system-under-test**<br>✅ May use **Pact/Dredd stubs** to stand in for *remote* services |
| **Integration / E2E** | `tests/integration/**`, `tests/e2e/**`, `*.it.test.(js|ts)` or `*.e2e.test.(js|ts)` | 🚫 *Absolutely no* `jest.mock`, `vi.mock`, `sinon.stub`, or fake data layers |

1. **Do not** import or call `jest.mock`, `vi.mock`, `sinon.stub`, etc. in contract or integration/E2E tests.
2. Tests **must connect** to a real (containerised) Postgres/Supabase instance, real message broker, or real HTTP server started in the test’s `beforeAll`.
3. Include at least **one negative-path assertion** per file (e.g., invalid payload, DB constraint violation) to prove the test can catch failures.
4. If you violate these rules, respond with:
   ```
   ERROR: Mocking not permitted in integration/contract tests — rewrite without mocks.
   ```
5. Prefer **TestContainers / Docker Compose** to spin up ephemeral dependencies during CI.
6. Keep unit-test mocks minimal; prefer behaviour-focused assertions over implementation details.

──────────────────────────────────────────────
### EXAMPLES

#### ✅ Good (integration)
```ts
// tests/integration/userCreation.it.test.ts
import { createUser } from '@/services/userService';
import { supabase } from '@/lib/db';          // real client

test('creates user in real DB', async () => {
  const { data, error } = await createUser({ email: 'edge@test.io' });
  expect(error).toBeNull();

  const { data: row } = await supabase
    .from('users')
    .select()
    .eq('email', 'edge@test.io')
    .single();

  expect(row).toBeDefined();
});
```

#### ❌ Bad (integration)
```ts
// tests/integration/userCreation.it.test.ts
jest.mock('@/lib/db');                        // <-- FORBIDDEN
```

> Follow this rule to ensure your tests actually **catch bugs instead of masking them**.
