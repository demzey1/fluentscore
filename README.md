# FluentScore

FluentScore is a Next.js App Router project for Fluent ecosystem wallet intelligence and eligibility scoring.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- wagmi + viem
- zod
- ESLint + Prettier

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

Required defaults:

- `FLUENT_RPC_URL=https://rpc.testnet.fluent.xyz/`
- `FLUENT_WS_RPC_URL=wss://rpc.testnet.fluent.xyz/ws`
- `FLUENT_EXPLORER_URL=https://testnet.fluentscan.xyz/`
- `FLUENT_EXPLORER_API_URL=https://testnet.fluentscan.xyz/api/`
- `BUILDER_MODE_PASSCODE=123456`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:generate
npm run db:push
```

## Builder Mode

- Builder Mode is hidden from public navigation.
- Access route: `/builder-access`
- Passcode `123456` unlocks Builder Mode for the current browser session via cookie.
- This passcode gate is temporary and not production authentication.
