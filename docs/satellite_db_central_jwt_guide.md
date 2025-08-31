# Satellite DB Guide --- Using a Centralized ID (Supabase Auth) & JWT for RLS

This guide shows how to let **multiple satellite Supabase projects**
enforce **Row Level Security (RLS)** using **JWTs issued by your central
Supabase project** (your central ID). Satellites don't need to "own" the
user; they just **verify** and **trust** the central token and evaluate
RLS on its claims.

---

## Architecture at a Glance

- **Central ID (Supabase Project A)**
  - Issues **JWT access tokens** (Auth).
  - Exposes a **JWKS URL** with public keys.
  - Optionally enriches tokens with tenant/role claims.
- **Satellites (Supabase Projects B, C, ...)**
  - **Accept** the central project's JWTs (via JWKS).
  - Write **RLS policies** using claims from `auth.jwt()` and
    `auth.uid()`.

Client flow:

1.  Client signs in to **Central ID** → receives JWT.\
2.  Client calls **Satellite** APIs directly with that JWT.\
3.  Satellite verifies JWT via **central JWKS** → RLS evaluates claims.

---

## Prerequisites

- Central Supabase project (the only place users authenticate).
- One or more satellite Supabase projects with data + RLS.
- Asymmetric JWT signing enabled in the central project (JWKS endpoint
  exists).

---

## Key URLs & Terms

- **Central JWKS URL** (public keys):

      https://<CENTRAL_PROJECT_REF>.supabase.co/auth/v1/.well-known/jwks.json

- **Issuer (iss)**: your central auth issuer (the Supabase Auth URL).\

- **Audience (aud)**: typically `"authenticated"` (keep consistent
  across projects unless you have a reason to separate).

---

## 1) Central Project: Token Shape & Claims

Decide what satellites need from the token. Minimal set:

- `sub`: **stable user UUID** (source of truth user id).
- `role`: `"authenticated"` (so satellite gateways grant the
  **authenticated** Postgres role).
- Tenant/Context claims you will use in RLS, e.g.:
  - `org_id` (single-tenant) **or** `tenant_ids` (multi-tenant
    array)
  - optional `scopes` / `permissions`
  - optional `user_role` within the org (e.g.,
    `"owner" | "admin" | "member"`)

**Example "intended" claim payload** (inside the JWT):

```json
{
  "iss": "https://<CENTRAL_PROJECT_REF>.supabase.co/auth/v1",
  "aud": "authenticated",
  "sub": "4c50b7b2-...-3de0", // central user id (UUID)
  "role": "authenticated",
  "org_id": "25df6c41-...-a8b3", // single-tenant example
  "user_role": "admin", // optional
  "scopes": ["orders:read", "orders:write"],
  "exp": 1735689600, // required
  "iat": 1735686000
}
```

> Tip: If you need dynamic, per-session claims (like `org_id` switch),
> add an **Access Token Hook** or your own issuing step to enrich tokens
> accordingly.

---

## 2) Satellite Project: Trust the Central JWT (JWKS)

For each satellite:

1.  Open **Auth → External / Third-Party JWT** (or equivalent
    settings).\
2.  Set:
    - **JWKS URI** = central JWKS URL:\
      `https://<CENTRAL_PROJECT_REF>.supabase.co/auth/v1/.well-known/jwks.json`
    - **Issuer (iss)** = the central `iss` value.
    - **Audience (aud)** = `"authenticated"` (or your chosen value).
3.  Save. The satellite will now **verify signatures** using the central
    project's public keys.

**Validation sanity checks:** - `sub` is a UUID (your canonical user
id).\

- `role` is `"authenticated"` (so PostgREST/Realtime/Storage map to the
  right DB role).\
- `aud` matches what the satellite expects.

---

## 3) RLS in Satellites --- Use Claims Directly

Enable RLS and write policies that read claims from the verified JWT.

Helpers (optional but recommended):

```sql
-- Returns a text claim (or null) safely
create or replace function app.jwt_text(claim text)
returns text language sql stable as $$
  select coalesce(nullif(auth.jwt()->>claim, ''), null);
$$;

-- Common cast helper (UUID claim)
create or replace function app.jwt_uuid(claim text)
returns uuid language sql stable as $$
  select (auth.jwt()->>claim)::uuid;
$$;
```

### Example: Single-Tenant (org_id)

```sql
alter table public.orders enable row level security;

-- SELECT policy: users can read rows for their org
create policy "org can read"
on public.orders
for select
to authenticated
using (orders.org_id = app.jwt_uuid('org_id'));

-- INSERT policy: users can create rows only for their org
create policy "org can insert"
on public.orders
for insert
to authenticated
with check (new.org_id = app.jwt_uuid('org_id'));

-- UPDATE policy: users can update rows only within their org
create policy "org can update"
on public.orders
for update
to authenticated
using  (orders.org_id = app.jwt_uuid('org_id'))
with check (orders.org_id = app.jwt_uuid('org_id'));
```

### Example: User Ownership

```sql
-- Owner-only reads/writes using sub (auth.uid() is shortcut for sub)
create policy "owner read"
on public.files
for select
to authenticated
using (files.user_id = auth.uid());

create policy "owner write"
on public.files
for update
to authenticated
using     (files.user_id = auth.uid())
with check(files.user_id = auth.uid());
```

### Example: Role Gating

```sql
-- Admins within an org can see all org orders
create policy "org admin can read all"
on public.orders
for select
to authenticated
using (
  orders.org_id = app.jwt_uuid('org_id')
  and app.jwt_text('user_role') = 'admin'
);
```

---

## 4) Do We Need a Local "users" Table in Satellites?

**Usually no.** RLS can rely entirely on claims.\
Create a minimal **shadow user table** only if you need: - **FK
constraints** to `user_id` - **Joins** for profile/preferences -
**Auditing** stable copies of email/display name

"On-demand materialization" pattern:

```sql
create table app_users (
  id uuid primary key,    -- equals central sub
  email text,
  display_name text,
  created_at timestamptz default now()
);

create or replace function app.ensure_local_user()
returns void language plpgsql as $$
declare
  v_id uuid := auth.uid();
  v_email text := auth.jwt()->>'email';
  v_name  text := auth.jwt()->>'name';
begin
  insert into app_users (id, email, display_name)
  values (v_id, v_email, v_name)
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, app_users.display_name);
end$$;
```

---

## 5) Client Usage

From the browser/app:

1.  **Sign in** with the central project → receive `access_token`.

2.  Initialize a **satellite** Supabase client and set the **central
    token**:

    ```ts
    satelliteClient.auth.setSession({
      access_token: CENTRAL_TOKEN,
      refresh_token: "", // optional if you only use short-lived tokens
    });
    ```

3.  Call satellite tables/storage/realtime as usual. The gateway
    verifies with JWKS, then RLS runs with your claims.

---

## 6) Alternative Patterns (When Useful)

- **Token Exchange (Broker)**: Exchange central token for a
  **satellite-scoped** token you mint server-side.\
- **Server/Edge Proxy**: Route all satellite calls through your server
  and set `request.jwt.claims` manually.

---

## 7) Testing Checklist

- **JWT contents**: `iss`, `aud`, `sub`, `role`, `exp`, and your
  custom claims are present and correct.
- **JWKS reachable** from satellites.
- **RLS ON** for all protected tables.
- **Happy path**: Token with `org_id = A` only sees `org A` rows.\
- **Denied paths**: Wrong or missing claims fail as expected.

---

## 8) Ops: Key Rotation & Security

- Use **asymmetric keys** so satellites pick up new keys automatically
  via JWKS.
- Keep JWTs short-lived.\
- Limit claims to essentials.\
- Rotate central signing keys via Supabase dashboard.

---

## 9) FAQ

**Q: Do satellites need Supabase Auth?**\
A: No, they just need to verify central JWTs.

**Q: Do I replicate auth.users?**\
A: No, only if you need FKs/joins → make a shadow table.

**Q: Can I store multiple tenant_ids?**\
A: Yes, put them in an array claim and check with `@>` in RLS.

---

## 10) Quick Reference Snippets

**Central JWKS:**

```bash
curl https://<CENTRAL_PROJECT_REF>.supabase.co/auth/v1/.well-known/jwks.json
```

**RLS: single org**

```sql
create policy "org read"
on public.items for select to authenticated
using (items.org_id = app.jwt_uuid('org_id'));
```

**RLS: owner**

```sql
create policy "owner rw"
on public.docs for all to authenticated
using (docs.user_id = auth.uid())
with check (docs.user_id = auth.uid());
```
