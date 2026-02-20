# 🚀 GUIA DE DEPLOYMENT - SYNAPSE REVENUE HUB

---

## ✅ Pré-Requisitos

- Node.js 18+ (LTS recomendado)
- Git configurado
- Conta Supabase (gratuita ou paga)
- Conta Stripe (teste ou produção)
- Conta Vercel (recomendado para frontend)

---

## 📋 Checklist Pré-Deployment

### 1️⃣ Supabase Setup

```bash
# 1. Criar projeto no Supabase
# https://app.supabase.com

# 2. Copiar credenciais
# Settings → API → Project URL
# Settings → API → anon public key
# Settings → API → service_role_key (manter privado)

# 3. Adicionar ao .env.local
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." (local apenas)
```

### 2️⃣ Executar Migrations

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g @supabase/cli

# Login no Supabase
supabase login

# Link ao seu projeto
supabase link --project-id axbcrczjilegtsmieipf

# Executar migrations
supabase db pull  # Atualizar schema localmente
supabase db push  # Deploy migrations

# Ou manualmente via Supabase dashboard:
# SQL Editor → Executar cada migration em ordem
```

### 3️⃣ Stripe Configuration

#### Teste (Development)
```bash
# 1. Criar conta em https://stripe.com
# 2. Ativar test mode
# 3. Copiar test keys:
#    - Publishable Key (sk_test_...)
#    - Secret Key (sk_test_...)
```

#### Produção
```bash
# 1. Ativar modo produção no Stripe
# 2. Copiar live keys:
#    - Publishable Key (pk_live_...)
#    - Secret Key (sk_live_...)
```

#### Adicionar ao Supabase

```bash
# No Supabase Dashboard:
# 1. Settings → Edge Functions Secrets
# 2. Adicionar:
#    STRIPE_SECRET_KEY=sk_test_xxx
#    STRIPE_WEBHOOK_SECRET=whsec_xxx

# Para webhook secret:
# Stripe Dashboard → Webhooks → Clique no endpoint
# Copiar "Signing secret"
```

#### Configurar Webhook

```bash
# Stripe Dashboard → Webhooks → Add endpoint
# URL: https://axbcrczjilegtsmieipf.supabase.co/functions/v1/stripe-webhook
# Events:
#   ✅ checkout.session.completed
#   ✅ customer.subscription.updated
#   ✅ customer.subscription.deleted
#   ✅ invoice.paid
#   ✅ invoice.payment_failed

# Copiar "Signing secret" para STRIPE_WEBHOOK_SECRET
```

### 4️⃣ Deploy Edge Functions

```bash
# Deploy todas as functions
supabase functions deploy validate-email
supabase functions deploy bulk-validate
supabase functions deploy bulk-worker
supabase functions deploy check-subscription
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy customer-portal
supabase functions deploy manage-keys
supabase functions deploy agent-heartbeat

# Ou todas de uma vez:
supabase functions deploy
```

---

## 🔧 Frontend Deployment (Vercel)

### 1️⃣ Preparar Código

```bash
# Testar build localmente
npm run build

# Verificar se compila sem erros
npm run lint
npm run test
```

### 2️⃣ Conectar ao Git

```bash
# Push para GitHub
git add .
git commit -m "Ready for production"
git push origin main
```

### 3️⃣ Deploy no Vercel

```bash
# Option A: Via CLI
npm install -g vercel
vercel

# Option B: Via Dashboard
# 1. Ir a https://vercel.com
# 2. Novo projeto → Importar repositório GitHub
# 3. Framework: Vite
# 4. Build command: npm run build
# 5. Output dir: dist
```

### 4️⃣ Adicionar Environment Variables (Vercel)

```bash
# Vercel Dashboard → Settings → Environment Variables

VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=axbcrczjilegtsmieipf
```

### 5️⃣ Configurar Custom Domain (Opcional)

```bash
# Vercel Dashboard → Settings → Domains
# Adicionar seu domínio personalizado
# Seguir instruções de DNS
```

---

## 🗄️ Banco de Dados: Verificação Pós-Deploy

```bash
# Conectar ao Supabase (via psql ou admin CLI)
# Verificar tabelas:

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

# Deve incluir:
# - profiles
# - tenants
# - api_keys
# - agents
# - bulk_jobs
# - bulk_inputs
# - validation_results
# - usage_logs
# - system_events
# - subscriptions
# - plans
# - usage_aggregations
# - stripe_events
# - user_roles

# Verificar RLS habilitado:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

# Todos devem ter rowsecurity = true
```

---

## 🧪 Teste Pós-Deployment

### 1️⃣ Testar Frontend

```bash
# 1. Acessar app (Vercel URL ou domínio customizado)
# 2. Verificar:
#    ✅ Landing page carrega
#    ✅ Navbar funciona
#    ✅ Footer visível
#    ✅ Responsive em mobile
```

### 2️⃣ Testar Autenticação

```bash
# 1. Clicar em "Sign up"
# 2. Preencher: email + senha
# 3. Submit
# 4. Verificar:
#    ✅ Supabase cria usuário
#    ✅ Profile criado automaticamente (trigger)
#    ✅ Redireciona para dashboard
#    ✅ useAuth() retorna user object
```

### 3️⃣ Testar Validação de Email

```bash
# 1. Dashboard → Validation Sandbox (se disponível)
# 2. Entrar email: test@example.com
# 3. Verificar:
#    ✅ Edge function responde
#    ✅ Score é retornado (0-100)
#    ✅ Risk level exibido
#    ✅ Request tracing em system_events
```

```sql
-- Query no Supabase SQL Editor:
SELECT * FROM system_events 
WHERE function_name = 'validate-email'
ORDER BY created_at DESC 
LIMIT 10;
```

### 4️⃣ Testar Pagamento (Stripe Test)

```bash
# 1. Dashboard → Billing
# 2. Clicar "Upgrade to Pro"
# 3. Verificar:
#    ✅ Redireciona para Stripe checkout
#    ✅ Pode preencher detalhes
#    ✅ Usar cartão teste Stripe: 4242 4242 4242 4242
#    ✅ Expiração futura, CVC qualquer 3 dígitos
# 4. Completar pagamento
# 5. Verificar:
#    ✅ Webhook recebido (Stripe webhook log)
#    ✅ Subscription criada no DB
#    ✅ AuthContext atualizado
#    ✅ Dashboard mostra "Subscribed"
```

```sql
-- Verificar no DB:
SELECT * FROM subscriptions 
WHERE stripe_customer_id LIKE '%test%'
ORDER BY created_at DESC;

-- Verificar webhook:
SELECT * FROM stripe_events 
ORDER BY created_at DESC LIMIT 5;
```

### 5️⃣ Testar API Keys

```bash
# 1. Dashboard → API Keys
# 2. Clicar "Generate New Key"
# 3. Copiar chave exibida (aparece uma vez!)
# 4. Testar com curl:

curl -X POST https://xxx.supabase.co/functions/v1/validate-email \
  -H "x-api-key: your-key-here" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verificar:
#    ✅ Retorna 200 OK
#    ✅ Retorna score + risk
#    ✅ Request logged em system_events
```

### 6️⃣ Testar Observabilidade

```sql
-- Query todos os eventos de um usuário:
SELECT * FROM system_events 
WHERE actor_user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Query eventos por correlation_id:
SELECT * FROM system_events 
WHERE correlation_id = 'corr-id'
ORDER BY created_at;

-- Query por tipo:
SELECT event_type, COUNT(*) 
FROM system_events 
GROUP BY event_type;

-- Query por função:
SELECT function_name, status, COUNT(*) 
FROM system_events 
WHERE created_at > now() - '24 hours'::interval
GROUP BY function_name, status;
```

---

## 📊 Monitoramento Pós-Deployment

### Logs

```bash
# Ver logs de Edge Functions (Supabase Dashboard)
# Functions → [Nome] → Logs

# Ou via CLI:
supabase functions list
supabase functions logs validate-email --tail
```

### Alertas Recomendados

```bash
# Configurar em Supabase (PgBoss ou similar):
# 1. Error rate alto em system_events
# 2. Falhas de webhook Stripe
# 3. Rate limit atingido
# 4. Database connection pool full
```

### Backups

```bash
# Supabase automático diário
# Settings → Backups → Automatic Backups

# Ou manual:
supabase db backup create
```

---

## 🔐 Segurança Pós-Deployment

### 1️⃣ Verificar Secrets

```bash
# Supabase Dashboard → Settings → Secrets
# Verificar:
#    ✅ STRIPE_SECRET_KEY presente
#    ✅ STRIPE_WEBHOOK_SECRET presente
#    ✅ Nenhuma chave em .env committed
```

### 2️⃣ RLS Policies

```bash
# Verificar todas ativadas:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

# Deve retornar vazio (todas ativadas)
```

### 3️⃣ JWT Configuration

```bash
# Supabase Dashboard → Authentication → Providers
# Email/Password ativado
# Auto-confirm email (se em teste)
```

### 4️⃣ CORS

```bash
# Edge Functions verificam CORS headers
# Testar com curl:
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  https://xxx.supabase.co/functions/v1/validate-email \
  -v
```

### 5️⃣ Rate Limiting

```bash
# Implementado por API key
# Testar: Fazer >1000 requests com mesma chave
# Deve retornar 429 (Too Many Requests)
```

---

## 🐛 Troubleshooting

### Problema: "CORS error"

**Solução:**
```typescript
// Edge function deve retornar:
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
};
return new Response(data, { headers: corsHeaders });
```

### Problema: "Stripe webhook not received"

**Checklist:**
```
☑️ Webhook URL correto em Stripe Dashboard
☑️ Events selecionados (checkout, subscription, invoice)
☑️ Stripe webhook secret em Supabase Secrets
☑️ Edge function stripe-webhook deployada
☑️ Verificar logs: Stripe Dashboard → Webhooks → evento
```

### Problema: "Database connection error"

**Solução:**
```bash
# Verificar connection pool:
# Supabase Dashboard → Settings → Database
# Check: Connections (should be < 20)

# Se alta: Pode ser connection leak
# Verificar edge functions (criar novo client cada vez)
```

### Problema: "Invalid JWT token"

**Solução:**
```bash
# Verificar:
☑️ Token não expirou
☑️ Token é do projeto correto
☑️ Authorization header está "Bearer {token}"
☑️ Endpoint correto (função edge)
```

### Problema: "RLS policy violation"

**Solução:**
```bash
# Erro: "new row violates row-level security policy"
# Verificar:
☑️ auth.uid() está correto
☑️ Usuário autenticado
☑️ Dados sendo inseridos pertencem ao usuário/tenant
☑️ Policy sintaxe correta (FOR INSERT WITH CHECK)
```

---

## 🚀 Performance Tips

### Frontend
```bash
# 1. Vite build otimização
npm run build  # Verificar tamanho bundle

# 2. React Query cache
# Já configurado, aumentar staleTime se preciso

# 3. Lazy load de rotas
# Já implementado em App.tsx (React.lazy)

# 4. Image optimization
# Usar <img> com width/height ou lazy="loading"
```

### Backend
```bash
# 1. Database indexes
# Já presente em:
# - system_events (tenant, request, created_at)
# - bulk_jobs (status, locked_at)
# - subscriptions (tenant, stripe_sub)

# 2. Query optimization
# Usar .select() específico (não select('*'))
# Use .limit() para queries grandes

# 3. Connection pooling
# Supabase gerencia automaticamente
```

---

## 📈 Scaling Checklist

```
Para 10k+ usuários:
☑️ Aumentar Postgres compute (Supabase)
☑️ Habilitar autoscaling de funções
☑️ Implementar caching com Redis (Upstash)
☑️ CDN para assets estáticos
☑️ Database read replicas
☑️ Monitoramento com Sentry/Datadog

Para 100k+ usuários:
☑️ Separar read/write databases
☑️ Sharding de tenants
☑️ Message queue para async jobs
☑️ API gateway para rate limiting
☑️ Observabilidade em tempo real
```

---

## ✅ Checklist Final

```
Pre-Deployment:
☑️ Build sem erros (npm run build)
☑️ Linting passa (npm run lint)
☑️ Testes passam (npm run test)
☑️ Git history limpo
☑️ .gitignore correto
☑️ .env não commitado

Supabase:
☑️ Migrations executadas
☑️ RLS policies ativas
☑️ Secrets adicionadas
☑️ Edge functions deployadas
☑️ Webhook Stripe configurado

Vercel:
☑️ Repositório conectado
☑️ Environment vars adicionadas
☑️ Build settings corretos
☑️ Domain configurado

Testing:
☑️ Landing page carrega
☑️ Autenticação funciona
☑️ Validação de email funciona
☑️ Pagamento funciona (teste Stripe)
☑️ Dashboard acesso protegido

Security:
☑️ Sem dados sensíveis em .env público
☑️ HTTPS ativado
☑️ CORS configurado
☑️ Rate limiting testado
☑️ RLS policies verificadas

Monitoring:
☑️ Error tracking configurado
☑️ Logs acessíveis
☑️ Alertas configurados
☑️ Backups agendados
```

---

## 📞 Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Status:** ✅ Pronto para deploy!

Último atualizado: 20/02/2026
