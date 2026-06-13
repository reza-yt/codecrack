# codecrack.dev

OpenAI-compatible gateway to Hermes Agent. Persona-locked agent with tools, memory, and streaming. Satu base URL, satu key — pakai dari CLI mana aja.

## Architecture

```
Client (any OpenAI SDK/CLI)
    ↓ HTTPS
codecrack.dev (Next.js/Vercel) — auth, billing, proxy
    ↓ HTTPS (Cloudflare Tunnel)
hermes.codecrack.dev (VPS) — Hermes Agent v0.16.0
```

## Stack

- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS + hand-rolled shadcn-style components
- Supabase (Postgres + Auth via magic link)
- Vercel deployment (Node.js runtime for API routes)
- lucide-react for icons

## Local Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project (for auth & database)

### Setup

```bash
# Clone
git clone https://github.com/your-org/codecrack.git
cd codecrack

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-only
SUPABASE_SERVICE_ROLE_KEY=eyJ...
HERMES_BASE_URL=https://hermes.codecrack.dev/v1
HERMES_API_KEY=your-hermes-api-key

# Pricing (optional, defaults shown)
PRICE_INPUT_PER_M=3.00
PRICE_OUTPUT_PER_M=15.00
```

### Run

```bash
npm run dev
# → http://localhost:3000
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. In Auth settings:
   - Enable Email provider
   - Set Site URL to `https://codecrack.dev` (or `http://localhost:3000` for dev)
   - Add redirect URL: `https://codecrack.dev/auth/callback`
4. Note down: Project URL, Anon key, Service role key

## Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set all environment variables (see `.env.example`)
4. Add custom domains:
   - `codecrack.dev` (primary)
   - `api.codecrack.dev` (alias to same project)
5. Update DNS at registrar with Vercel-provided records

## Cloudflare Tunnel Setup (VPS)

Hermes runs on a VPS at `127.0.0.1:8642`. Expose it via Cloudflare Tunnel:

```bash
# Install cloudflared on VPS
# Create tunnel
cloudflared tunnel create codecrack-hermes

# Route DNS
cloudflared tunnel route dns codecrack-hermes hermes.codecrack.dev

# Config (~/.cloudflared/config.yml):
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: hermes.codecrack.dev
    service: http://localhost:8642
  - service: http_status:404

# Run
cloudflared tunnel run codecrack-hermes
```

## Manual Approval & Top-up (Admin)

After a user signs up and is on the waitlist:

```sql
-- Approve user
UPDATE profiles
SET status = 'approved', approved_at = now()
WHERE email = 'user@example.com';

-- Top up credits ($10)
UPDATE credits
SET balance_usd = balance_usd + 10, updated_at = now()
WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@example.com');

-- Mark waitlist entry as approved
UPDATE waitlist SET approved = true WHERE email = 'user@example.com';
```

## Testing End-to-End

```bash
# Health check
curl https://api.codecrack.dev/health

# List models
curl https://api.codecrack.dev/v1/models

# Chat completion
curl https://api.codecrack.dev/v1/chat/completions \
  -H "Authorization: Bearer cc_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"model":"hermes-agent","messages":[{"role":"user","content":"hello"}]}'

# Streaming
curl https://api.codecrack.dev/v1/chat/completions \
  -H "Authorization: Bearer cc_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"model":"hermes-agent","messages":[{"role":"user","content":"hello"}],"stream":true}'
```

## Python SDK Test

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_YOUR_KEY_HERE"
)

response = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "hello"}],
)
print(response.choices[0].message.content)
```

## Pricing

| Type | Price |
|------|-------|
| Input tokens | $3.00 / 1M |
| Output tokens | $15.00 / 1M |
| Min top-up | $10 |

Note: Hermes injects ~6.6k token system prompt per request.

## File Structure

```
codecrack/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                           ← landing
│   ├── docs/page.tsx
│   ├── pricing/page.tsx
│   ├── status/page.tsx
│   ├── waitlist/
│   │   ├── page.tsx
│   │   └── waitlist-form.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx
│   ├── auth/callback/route.ts
│   ├── auth/error/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── logout-button.tsx
│   │   ├── keys/
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts
│   │   │   ├── create-key-button.tsx
│   │   │   └── revoke-key-button.tsx
│   │   ├── usage/page.tsx
│   │   ├── billing/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── health/route.ts
│       └── v1/
│           ├── models/route.ts
│           └── chat/completions/route.ts
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── status-pill.tsx
│   ├── code-block.tsx
│   └── ui/button.tsx
├── lib/
│   ├── utils.ts
│   ├── api-keys.ts
│   ├── pricing.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── supabase/
│   └── schema.sql
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
└── README.md
```

## License

Private. All rights reserved.
