# fn-musobaqa

Next.js 16 asosidagi musobaqa ro'yxatdan o'tish va admin boshqaruv tizimi.

## Local development
```bash
npm ci
npm run dev
```

## Quality checks
```bash
npm run lint
npm run build
npm run test:e2e
```

E2E testlar `3200` portda ishlaydi (`playwright.config.ts`).

## Production (Docker)
```bash
npm run prod:build
npm run prod:migrate
npm run prod:up
```

To'liq VPS deployment bo'yicha yo'riqnoma:
- [DEPLOYMENT.md](./DEPLOYMENT.md)

## Health endpoints
- `GET /api/healthz` - liveness
- `GET /api/readyz` - DB readiness
