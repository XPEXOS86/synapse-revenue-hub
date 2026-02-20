# 🏛️ ARQUITETURA - SYNAPSE REVENUE HUB

## Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (BROWSER)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FRONTEND (React 18 + Vite)                 │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Index.tsx  │  │ Dashboard    │  │ Auth.tsx     │   │  │
│  │  │ (Landing)   │  │ (Protected)  │  │              │   │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         React Router v6 + Protected Routes         │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │   AuthContext (useAuth hook)                    │  │  │
│  │  │   - User session management                     │  │  │
│  │  │   - Subscription status (Stripe integration)    │  │  │
│  │  │   - Auto-refresh token                          │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │   TanStack Query (React Query)                  │  │  │
│  │  │   - API state management                        │  │  │
│  │  │   - Caching & sync                              │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │   Shadcn UI + Tailwind CSS                      │  │  │
│  │  │   - 30+ components                              │  │  │
│  │  │   - Responsive design                           │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  localStorage                                                   │
│  ├── Supabase session token                                     │
│  └── auth.users JWT                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS/TLS │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend + Database)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            SUPABASE EDGE FUNCTIONS (Deno)              │  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │validate-email   │  │bulk-validate                 │ │  │
│  │  │(individual)     │  │(up to 50k emails)            │ │  │
│  │  └─────────────────┘  └──────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │bulk-worker      │  │check-subscription            │ │  │
│  │  │(async processor)│  │(Stripe status)               │ │  │
│  │  └─────────────────┘  └──────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │create-checkout  │  │stripe-webhook                │ │  │
│  │  │(Stripe payment) │  │(payment events)              │ │  │
│  │  └─────────────────┘  └──────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │manage-keys      │  │agent-heartbeat               │ │  │
│  │  │(API keys CRUD)  │  │(agent tracking)              │ │  │
│  │  └─────────────────┘  └──────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  customer-portal                                 │  │  │
│  │  │  (Stripe customer portal redirect)               │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  _shared/observability.ts                        │  │  │
│  │  │  - Request tracing (request_id)                  │  │  │
│  │  │  - Correlation IDs                               │  │  │
│  │  │  - Structured logging                            │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            POSTGRESQL DATABASE                          │  │
│  │                                                          │  │
│  │  Tables (with RLS):                                     │  │
│  │  ├── auth.users (Supabase native)                       │  │
│  │  ├── profiles (user profiles)                           │  │
│  │  ├── tenants (multi-tenant)                             │  │
│  │  ├── api_keys (with hash)                               │  │
│  │  ├── user_roles                                         │  │
│  │  ├── agents (with heartbeat)                            │  │
│  │  ├── bulk_jobs (async queue)                            │  │
│  │  ├── bulk_inputs (email queue)                          │  │
│  │  ├── validation_results (email status)                  │  │
│  │  ├── usage_logs (API usage)                             │  │
│  │  ├── system_events (observability)                      │  │
│  │  ├── subscriptions (billing)                            │  │
│  │  ├── plans (pricing)                                    │  │
│  │  ├── usage_aggregations (stats)                         │  │
│  │  ├── stripe_events (idempotency)                        │  │
│  │  └── user_roles (RBAC)                                  │  │
│  │                                                          │  │
│  │  Functions:                                             │  │
│  │  ├── has_role() - check user role                       │  │
│  │  ├── handle_new_user() - auto-create profile            │  │
│  │  └── update_updated_at() - timestamp trigger            │  │
│  │                                                          │  │
│  │  Extensions:                                            │  │
│  │  ├── pg_cron (job scheduling)                           │  │
│  │  └── pg_net (HTTP calls)                                │  │
│  │                                                          │  │
│  │  RLS Policies: ✅ Enabled on all critical tables        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            SUPABASE AUTH                                │  │
│  │                                                          │  │
│  │  - Email/Password authentication                        │  │
│  │  - JWT token generation & refresh                       │  │
│  │  - Session management                                   │  │
│  │  - Auto-create profile on signup                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS/TLS │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE (Payments)                            │
│                                                                 │
│  ├── Customers API (create/find/list)                           │
│  ├── Subscriptions API (create/update/cancel)                   │
│  ├── Checkout Sessions (payment flow)                           │
│  ├── Invoices (billing history)                                 │
│  ├── Webhooks (payment events)                                  │
│  └── Customer Portal (management)                               │
│                                                                 │
│  Events handled:                                                │
│  ├── checkout.session.completed                                 │
│  ├── customer.subscription.updated                              │
│  ├── customer.subscription.deleted                              │
│  ├── invoice.paid                                               │
│  └── invoice.payment_failed                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação

```
┌─────────────────┐
│  User accesses  │
│  /auth page     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Auth.tsx component       │
│ - Email input            │
│ - Password input         │
│ - Sign up / Sign in      │
└────────┬─────────────────┘
         │
         ▼ (signUp / signIn)
┌──────────────────────────┐
│ AuthContext              │
│ - Call Supabase auth API │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Supabase Auth            │
│ - Validate credentials   │
│ - Generate JWT token     │
│ - Return session         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ localStorage             │
│ - Store session          │
│ - Persist JWT token      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ AuthContext state        │
│ - user object            │
│ - session token          │
│ - loading = false        │
└────────┬─────────────────┘
         │
         ▼ (auto-triggers)
┌──────────────────────────┐
│ refreshSubscription()    │
│ Edge function:           │
│ check-subscription       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Stripe API               │
│ - Find customer          │
│ - Check subscriptions    │
│ - Get product/price info │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Update AuthContext       │
│ - subscription.status    │
│ - subscription.tier      │
│ - subscription.priceId   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ User can access          │
│ /dashboard (protected)   │
│ Billing/Keys/etc         │
└──────────────────────────┘
```

---

## Fluxo de Validação de Email

### Validação Individual

```
┌──────────────────────────┐
│ Frontend                 │
│ User input: email        │
│ click "Validate"         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /validate-email     │
│ Headers:                 │
│ - x-api-key OR Bearer    │
│ - x-request-id           │
│ - x-correlation-id       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ validate-email function  │
│ 1. Auth: verify API key  │
│ 2. Parse email           │
│ 3. Score email:          │
│    - Format check        │
│    - Disposable check    │
│    - Role-based check    │
│    - Domain check        │
│ 4. Return: {             │
│    score,                │
│    risk,                 │
│    checks }              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Log to system_events     │
│ - request_id             │
│ - correlation_id         │
│ - status: completed      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Return to Frontend       │
│ {                        │
│   subscribed: bool,      │
│   score: 0-100,          │
│   risk: low|med|high,    │
│   checks: {...}          │
│ }                        │
└──────────────────────────┘
```

### Validação em Lote

```
┌──────────────────────────┐
│ Frontend                 │
│ - Upload CSV/TXT         │
│ - click "Validate Bulk"  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /bulk-validate      │
│ Body: file (text/csv)    │
│ Up to 50k emails         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ bulk-validate function   │
│ 1. Auth: verify token    │
│ 2. Get tenant_id         │
│ 3. Parse file            │
│ 4. CREATE bulk_jobs row  │
│ 5. INSERT bulk_inputs    │
│ 6. QUEUE async worker    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Return job_id            │
│ status: "processing"     │
└────────┬─────────────────┘
         │
         ▼ (async background)
┌──────────────────────────┐
│ bulk-worker function     │
│ (runs async)             │
│                          │
│ 1. Lock job:             │
│    locked_at = now()     │
│    worker_id = UUID      │
│ 2. Get bulk_inputs       │
│    WHERE processed=false │
│ 3. For each email:       │
│    - Call validate-email │
│    - INSERT result       │
│    - UPDATE bulk_inputs  │
│ 4. Update counts:        │
│    - valid_count         │
│    - invalid_count       │
│    - catch_all_count     │
│ 5. Update bulk_jobs:     │
│    status = "completed"  │
│ 6. POST webhook_url      │
│    (if configured)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend polls status    │
│ GET /dashboard/usage     │
│ Shows processing...      │
│ Updates when done        │
└──────────────────────────┘
```

---

## Fluxo de Pagamento (Stripe)

```
┌──────────────────────────┐
│ User in Dashboard        │
│ clicks "Upgrade to Pro"  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend                 │
│ POST /create-checkout    │
│ Body: { priceId }        │
│ Headers: Bearer token    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ create-checkout func     │
│ 1. Auth: verify JWT      │
│ 2. Get user email        │
│ 3. Find/create customer  │
│    in Stripe             │
│ 4. Create checkout       │
│    session:              │
│    - Line item: priceId  │
│    - Customer id         │
│ 5. Return session.url    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend redirects to    │
│ Stripe Checkout page     │
│ (hosted checkout)        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ User enters:             │
│ - Card details           │
│ - Email                  │
│ - Billing address        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Stripe processes         │
│ payment & creates        │
│ subscription             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Stripe POST webhook      │
│ Event:                   │
│ checkout.session.comp    │
│ to Supabase function:    │
│ /stripe-webhook          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ stripe-webhook func      │
│ 1. Verify signature      │
│ 2. Check idempotency:    │
│    stripe_events table   │
│ 3. Handle event:         │
│    - Get customer        │
│    - Create subscription │
│    - Store in DB         │
│ 4. Mark processed        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Subscribe table updated  │
│ status = "active"        │
│ plan_id set              │
│ stripe_sub_id stored     │
└────────┬─────────────────┘
         │
         ▼ (next check)
┌──────────────────────────┐
│ refreshSubscription()    │
│ called (60s refresh)     │
│ Returns:                 │
│ subscribed: true         │
│ status: "active"         │
│ tier: "professional"     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend shows:          │
│ "Subscribed to Pro"      │
│ Features unlocked!       │
└──────────────────────────┘
```

---

## Estrutura de Dados Detalhada

### Tabela: users (Supabase Auth)
```
auth.users (Supabase managed)
├── id (UUID)
├── email (TEXT, UNIQUE)
├── encrypted_password
├── email_confirmed_at
├── created_at
└── ...
```

### Tabela: profiles
```
profiles
├── id (UUID, PK)
├── user_id (FK → auth.users)
├── display_name (TEXT)
├── avatar_url (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

RLS: ✅ Enabled
- SELECT: auth.uid() = user_id
- INSERT: auth.uid() = user_id
- UPDATE: auth.uid() = user_id
```

### Tabela: tenants (Multi-tenant)
```
tenants
├── id (UUID, PK)
├── name (TEXT)
├── slug (TEXT, UNIQUE)
├── owner_id (FK → auth.users)
├── plan (TEXT: 'starter'|'pro'|'enterprise')
├── status (TEXT: 'active'|'suspended')
├── settings (JSONB)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

RLS: ✅ Enabled
- ALL: auth.uid() = owner_id
```

### Tabela: api_keys
```
api_keys
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── user_id (FK → auth.users)
├── name (TEXT)
├── key_hash (TEXT) - bcrypt-like
├── key_prefix (TEXT, 8 chars) - for lookup
├── brain (TEXT: 'all'|specific)
├── rate_limit (INTEGER: 1000)
├── is_active (BOOLEAN)
├── last_used_at (TIMESTAMPTZ)
└── created_at (TIMESTAMPTZ)

RLS: ✅ Enabled
- ALL: auth.uid() = user_id
```

### Tabela: bulk_jobs
```
bulk_jobs
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── user_id (FK → auth.users)
├── file_name (TEXT)
├── file_format (TEXT: 'csv'|'txt'|'xlsx')
├── total_emails (INTEGER)
├── processed (INTEGER)
├── valid_count (INTEGER)
├── invalid_count (INTEGER)
├── catch_all_count (INTEGER)
├── risky_count (INTEGER)
├── status (TEXT: 'pending'|'processing'|'completed'|'failed')
├── webhook_url (TEXT)
├── error_message (TEXT)
├── processing_started_at (TIMESTAMPTZ)
├── processing_completed_at (TIMESTAMPTZ)
├── locked_at (TIMESTAMPTZ) - async worker lock
├── worker_id (TEXT) - UUID of worker
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

RLS: ✅ Enabled
- SELECT: auth.uid() = user_id
- INSERT: auth.uid() = user_id
- UPDATE: auth.uid() = user_id

Indexes:
- idx_bulk_jobs_status
- idx_bulk_jobs_locked_at
```

### Tabela: validation_results
```
validation_results
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── bulk_job_id (FK → bulk_jobs, nullable)
├── api_key_id (FK → api_keys, nullable)
├── email (TEXT)
├── status (TEXT: 'valid'|'invalid'|'catch-all'|'risky'|'pending')
├── confidence_score (INTEGER: 0-100)
├── risk_level (TEXT: 'low'|'medium'|'high')
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

RLS: ✅ Enabled
- SELECT: tenant owner check
```

### Tabela: system_events (Observability)
```
system_events
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── event_type (TEXT)
├── source (TEXT: 'api'|'webhook'|'system'|'agent')
├── request_id (UUID) - for tracing
├── correlation_id (TEXT) - for grouping
├── actor_user_id (UUID, FK → auth.users)
├── function_name (TEXT)
├── payload (JSONB)
├── status (TEXT: 'started'|'completed'|'failed')
├── error_message (TEXT)
├── idempotency_key (TEXT, UNIQUE)
├── created_at (TIMESTAMPTZ)
└── [indexes on all important columns]

RLS: ✅ Enabled
- SELECT: tenant owner only

Indexes:
- idx_system_events_tenant
- idx_system_events_request
- idx_system_events_correlation
- idx_system_events_type
- idx_system_events_created (DESC)
- idx_system_events_function_name
- idx_system_events_status
```

### Tabela: subscriptions
```
subscriptions
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── user_id (FK → auth.users)
├── plan_id (FK → plans)
├── stripe_subscription_id (TEXT, UNIQUE)
├── stripe_customer_id (TEXT)
├── status (TEXT: 'incomplete'|'active'|'past_due'|'cancelled')
├── current_period_start (TIMESTAMPTZ)
├── current_period_end (TIMESTAMPTZ)
├── cancel_at_period_end (BOOLEAN)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

RLS: ✅ Enabled
- SELECT: auth.uid() = user_id
- INSERT: auth.uid() = user_id
- UPDATE: auth.uid() = user_id

Indexes:
- idx_subscriptions_tenant
- idx_subscriptions_stripe_sub
```

---

## Padrões de Segurança

### 1. RLS (Row Level Security)
✅ Implementado em todas as tabelas

```sql
-- Example:
CREATE POLICY "Users can view own api keys"
ON public.api_keys
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
```

### 2. API Key Hashing
```typescript
// Frontend: Send raw key (only on creation)
// Backend: Hash with bcrypt, store hash
// On use: Compare prefix, then validate hash
```

### 3. JWT Token
```typescript
// Supabase generates JWT
// Stored in localStorage
// Auto-refreshed before expiry
// Passed in Authorization header
```

### 4. Webhook Signature Verification
```typescript
// Stripe sends: stripe-signature header
// Edge function verifies: stripe.webhooks.constructEventAsync()
// Prevents spoofed events
```

### 5. Idempotency
```typescript
// stripe_events table tracks processed events
// idempotency_key field prevents double-processing
// system_events logs all operations
```

### 6. CORS
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "...",
};
```

### 7. Rate Limiting
```typescript
// Per API key: rate_limit field (default 1000)
// Checked on each validate-email/bulk-validate call
// Future: Global rate limiting recommended
```

---

## Observabilidade

### Request Tracing
```typescript
// Every request gets:
const requestId = crypto.randomUUID();
const correlationId = req.headers.get("x-correlation-id") || requestId;

// Passed through system:
// - Frontend → Edge function (headers)
// - Edge function → system_events table
// - system_events → queryable by requestId

// Usage:
const { data } = await supabase
  .from("system_events")
  .select("*")
  .eq("request_id", requestId);
```

### Structured Logging
```typescript
logSystemEvent(ctx, {
  event_type: "email_validated",
  status: "completed",
  payload: {
    email,
    score,
    risk,
  },
});
```

### System Events
```sql
-- Query for debugging:
SELECT * FROM system_events
WHERE correlation_id = $1
ORDER BY created_at;

-- Status monitoring:
SELECT status, COUNT(*) 
FROM system_events 
WHERE function_name = 'bulk-worker'
AND created_at > now() - '1 hour'::interval
GROUP BY status;
```

---

## Conclusão

**Arquitetura:** Enterprise-ready SPA + Serverless Backend
**Escala:** Suportado por Supabase (auto-scale PostgreSQL + Edge Functions)
**Segurança:** RLS, JWT, API Key Hashing, Webhook Verification
**Observabilidade:** Request Tracing, Structured Logging, System Events
**Pagamentos:** Stripe integration nativa com webhook idempotency

✅ Pronto para produção com melhorias recomendadas.
