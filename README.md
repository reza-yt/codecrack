# codecrack.dev

OpenAI-compatible HTTP gateway to a locally-running **Hermes Agent**. Drop-in
replacement for the OpenAI Chat Completions API — set `base_url`, set
`api_key`, dan jalan.

```
client (any openai SDK)
   │
   ▼  HTTPS
api.codecrack.dev          ← this repo (Next.js on Vercel)
   ├─ landing + dashboard
   └─ /api/v1/* gateway routes
        1. verify Bearer key
        2. check credits > 0
        3. proxy upstream + stream
        4. parse usage + deduct
        5. log to usage_logs
   │
   ▼  HTTPS (Cloudflare Tunnel)
hermes.codecrack.dev       ← VPS, not in this repo
   └─ Hermes Agent v0.16.0
        127.0.0.1:8642/v1
```

The Vercel-hosted website handles auth, billing, and request proxying. The
upstream Hermes Agent runs on a private VPS and is exposed only through a
Cloudflare Tunnel.

---

## Stack

- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS, hand-rolled UI primitives in `components/ui/` (shadcn-style,
  no install)
- Supabase (Postgres + Auth via magic link, no passwords)
- Vercel (Node.js runtime — gateway uses `node:crypto` for SHA-256)
- `lucide-react`, JetBrains Mono / Inter fonts

---

## Local development

```bash
# 1. Install
npm install

# 2. Copy env template
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, HERMES_BASE_URL, HERMES_API_KEY

# 3. Run
npm run dev
# → http://localhost:3000

# Build
npm run build
npm start
```

### Required env vars

Public (exposed to browser):

| Name | Description |
| ---- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon JWT |
| `NEXT_PUBLIC_BUILD_ID` | _optional_ — git SHA shown in the footer |

Server-only (NEVER expose):

| Name | Description |
| ---- | ----------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role JWT — used only by API routes |
| `HERMES_BASE_URL` | `https://hermes.codecrack.dev/v1` |
| `HERMES_API_KEY` | Bearer token Hermes accepts |
| `PRICE_INPUT_PER_M` | _optional_, default `3.00` |
| `PRICE_OUTPUT_PER_M` | _optional_, default `15.00` |

---

## Supabase setup

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor** → **New query** → paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. **Authentication → Providers**: enable **Email**, disable confirm email
   if you want frictionless magic-link, otherwise leave on.
4. **Authentication → URL Configuration**:
   - Site URL: `https://codecrack.dev`
   - Redirect URLs: `https://codecrack.dev/auth/callback`,
     `http://localhost:3000/auth/callback`
5. **Project Settings → API**: copy the **Project URL**, **anon key**, and
   **service_role key** into your env.

That's it. The schema also installs:

- An `on_auth_user_created` trigger that auto-provisions
  `profiles` (status = `waitlist`) and `credits` (balance = 0) on signup.
- A `deduct_credits(p_user_id, p_amount)` RPC the gateway uses for atomic
  charge-on-completion.
- RLS on every table — users can only read/write their own rows. The
  gateway uses the service role to bypass RLS where needed.

---

## Vercel deployment

1. Push this repo to GitHub.
2. <https://vercel.com/new> → import the repo. Framework should auto-detect
   as Next.js.
3. **Environment Variables**: add all keys from the table above.
4. Deploy.
5. **Project Settings → Domains** — add both:
   - `codecrack.dev` (set as primary)
   - `api.codecrack.dev` (alias to the same project)
6. Update DNS at your registrar (codecrack.dev) using the A/CNAME records
   Vercel provides.
7. Sanity check:
   ```bash
   curl https://api.codecrack.dev/api/health
   ```

Both domains hit the same Next.js app. The landing/dashboard render on
`codecrack.dev`; the gateway routes work on either, but the `api.` subdomain
is the canonical `base_url` to advertise.

---

## Cloudflare Tunnel — exposing Hermes

Hermes runs on the VPS at `127.0.0.1:8642`. Don't open ports — use a tunnel.

```bash
# On the VPS
cloudflared tunnel login
cloudflared tunnel create codecrack-hermes
cloudflared tunnel route dns codecrack-hermes hermes.codecrack.dev
```

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: codecrack-hermes
credentials-file: /root/.cloudflared/<UUID>.json

ingress:
  - hostname: hermes.codecrack.dev
    service: http://localhost:8642
  - service: http_status:404
```

Run as a service:

```bash
cloudflared service install
systemctl enable --now cloudflared
```

Verify (note: Hermes itself rejects unauthenticated requests, but the tunnel
should respond with 401, not a network error):

```bash
curl -i https://hermes.codecrack.dev/v1/models
# expect: HTTP/2 401  (or 200 with -H "Authorization: Bearer <hermes-key>")
```

---

## Manual approval & top-up (MVP)

There is no Stripe integration in MVP. Owner workflow:

### Approve a waitlisted user

```sql
-- 1. Find them
select id, email, status from profiles where email = 'them@domain.dev';

-- 2. Flip status to approved
update profiles
set    status = 'approved',
       approved_at = now()
where  email = 'them@domain.dev';
```

### Credit / top up an account

```sql
-- $50 top-up for a user
update credits
set    balance_usd = balance_usd + 50,
       updated_at = now()
where  user_id = (select id from profiles where email = 'them@domain.dev');
```

### Suspend / unsuspend

```sql
update profiles set status = 'suspended' where email = 'spam@bad.dev';
update profiles set status = 'approved'  where email = 'spam@bad.dev';
```

The gateway re-reads `profiles.status` on every request, so changes apply
immediately.

---

## End-to-end test

Once a user is approved and topped up, with a fresh API key from
`/dashboard/keys`:

```python
# pip install openai
from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_•••",
)

# Non-streaming
resp = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "halo, siapa lo?"}],
)
print(resp.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "audit lib auth gua"}],
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
```

After the call returns, refresh `/dashboard/usage` — the request should
appear with token counts, cost, and duration.

---

## Pricing

Pay-as-you-go, defaults set in env:

| | per 1M tokens |
| --- | --- |
| Input | **$3.00** |
| Output | **$15.00** |

Minimum top-up: **$10**.

Hermes injects a ~6.6k-token system prompt (SOUL.md persona + skills +
memory) on every request, so even a trivial "hi" bills around `$0.020`.

Cost formula:

```
cost_usd = (prompt_tokens / 1e6) * PRICE_INPUT_PER_M
        + (completion_tokens / 1e6) * PRICE_OUTPUT_PER_M
```

Stored in `usage_logs.cost_usd` at 8 decimals.

---

## Security checklist

- [x] API keys: `cc_live_<32 base62>` format, stored only as `sha256` hex,
      never logged, shown once on creation.
- [x] Service-role Supabase key only used in `/api/*` route handlers + server
      actions, never imported from client components. Verifiable with
      `next build && grep -r "<service-role-jwt-prefix>" .next/static`.
- [x] RLS enabled on every user-facing table; self-read/write policies only.
- [x] Magic-link auth — no passwords stored.
- [x] CORS open on `/api/v1/*` (it's a public API), but auth is by Bearer
      token only — no cookie auth on the gateway.
- [x] Rate limit on `/waitlist` (5/hr/IP) and `/login` (10/hr/IP) at server
      action layer. Use Cloudflare WAF in front for harder limits.
- [x] No `dangerouslySetInnerHTML` anywhere.
- [x] Constant-time key comparison via indexed hash lookup (no string
      compare).

---

## File structure

```
codecrack/
├── app/
│   ├── layout.tsx                            # root layout, fonts, metadata
│   ├── globals.css                           # tailwind + brand tokens
│   ├── page.tsx                              # landing
│   ├── docs/page.tsx
│   ├── pricing/page.tsx
│   ├── status/page.tsx                       # calls /api/health
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── waitlist/{page,waitlist-form,actions}
│   ├── login/{page,login-form,actions}
│   ├── auth/callback/route.ts                # OTP exchange
│   ├── auth/error/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                        # sidebar + auth gate
│   │   ├── page.tsx                          # overview
│   │   ├── sidebar-link.tsx
│   │   ├── logout-button.tsx
│   │   ├── keys/{page,actions,create-key-button,revoke-key-button}
│   │   ├── usage/page.tsx
│   │   ├── billing/page.tsx
│   │   └── settings/{page,settings-form,actions}
│   └── api/
│       ├── health/route.ts                   # liveness + upstream check
│       ├── dashboard/usage.csv/route.ts      # CSV export
│       └── v1/
│           ├── models/route.ts
│           └── chat/completions/route.ts     # THE GATEWAY
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── status-pill.tsx
│   ├── code-block.tsx
│   └── ui/button.tsx
├── lib/
│   ├── utils.ts                              # cn, format helpers
│   ├── api-keys.ts                           # generate, hash, validate
│   ├── pricing.ts                            # calcCost
│   ├── rate-limit.ts                         # in-memory IP buckets
│   ├── gateway-errors.ts                     # OpenAI-shaped error helper
│   └── supabase/
│       ├── client.ts                         # browser client
│       ├── server.ts                         # SSR + service role
│       └── middleware.ts                     # session refresh
├── supabase/
│   └── schema.sql                            # run in SQL Editor
├── middleware.ts                             # session refresh wrapper
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## What's intentionally out of scope (MVP)

- Stripe / payment processing — manual top-ups only.
- Multiple model aliases — only `hermes-agent` exists.
- Team / organization accounts — single user only.
- Webhooks for billing alerts.
- Programmatic admin API.
- Audio / image-gen endpoints — Hermes supports image input, but billing
  for non-text is left for later.
- Free tier — every account starts at `$0` and must top up.
- Email notifications beyond Supabase magic links.
- Rate limiting beyond the credit-balance gate.

See the spec doc for full context.
