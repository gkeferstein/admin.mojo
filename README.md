# admin.mojo

> 🏛️ Platform Administration für das MOJO Ökosystem

## Übersicht

`admin.mojo` ist das zentrale Administrations-Modul für das MOJO Ökosystem. Es verwaltet:

- **Regionale Exklusivverträge** - Vertriebsrechte für Regional Distributors (z.B. DACH 30%)
- **Platform Products** - Die 6 User Journey Levels als Basis-Produkte
- **Customer Attribution** - Platform-weites Affiliate-Tracking (First Click Wins, 3 Jahre)
- **Provisionsberechnung** - Automatische Berechnung aller Provisionstypen
- **Auszahlungen** - Monatliche Payouts via Stripe Connect

## Architektur

```
admin.mojo/
├── apps/
│   ├── api/                 # Fastify API Backend
│   │   ├── prisma/          # Database Schema
│   │   ├── src/
│   │   │   ├── routes/      # API Endpoints
│   │   │   ├── services/    # Business Logic
│   │   │   └── lib/         # Utilities
│   │   └── package.json
│   └── web/                 # Next.js Frontend
│       └── src/app/
│           ├── dashboard/   # Admin Dashboard
│           └── onboarding/  # Onboarding Flows
├── docs/
│   └── BUSINESS_MODEL.md    # Geschäftsmodell-Dokumentation
└── docker-compose.yml
```

## Features

### 🌍 Regional Agreements

Verwaltet exklusive Vertriebsrechte für Regionen:
- DACH-Region: 30% Provision auf Platform-Produkte
- Automatische Erkennung über Rechnungsadresse
- Vertragsunterzeichnung mit digitalem Signing

### 📦 Platform Products

Die 6 User Journey Levels:
1. **LEBENSENERGIE** (99€) - Finde dein MOJO wieder
2. **CAMPUS** (299€) - Vernetze dich und optimiere Regeneration
3. **BUSINESS BOOTCAMP** (999€) - Starte dein Gesundheitsbusiness
4. **RegenerationsmedizinOS** (2.999€) - Betriebssystem für Gesundheit
5. **Praxiszirkel** (4.999€) - Behandle unter Fachleuten
6. **MOJO Inkubator** (9.999€) - Eröffne dein MOJO Institut

### 🤝 Customer Attribution

Platform-weites Affiliate-System:
- **First Click Wins**: Erster Affiliate-Code wird permanent gespeichert
- **3 Jahre Attribution**: Provisionen für 3 Jahre ab Kontoerstellung
- **20% Erst-Provision**: Für den ersten Kauf eines Neukunden
- **10% Folge-Provision**: Für alle weiteren Käufe

### 💰 Commission Calculator

Automatische Provisionsberechnung:
- Regional Exclusive (30% DACH)
- Affiliate First (20%)
- Affiliate Recurring (10%)
- Platform Fee (2% für Tenant-Verkäufe)

### 💳 Payouts

Auszahlungslogik:
- 30 Tage Wartezeit nach Kauf
- Monatliche Auszahlung
- Mindestbetrag: 50€
- Via Stripe Connect

## API Endpoints

### Regional Agreements
- `GET /api/v1/regional-agreements` - Liste aller Verträge
- `POST /api/v1/regional-agreements` - Neuen Vertrag erstellen
- `GET /api/v1/regional-agreements/by-region/:code` - Nach Region suchen
- `POST /api/v1/regional-agreements/:id/sign` - Vertrag unterzeichnen

### Platform Products
- `GET /api/v1/platform-products` - Liste aller Produkte
- `GET /api/v1/platform-products/by-level/:level` - Nach Level
- `POST /api/v1/platform-products/seed` - Seed-Daten erstellen

### Customer Attributions
- `GET /api/v1/customer-attributions/:userId` - Attribution prüfen
- `POST /api/v1/customer-attributions` - Neue Attribution
- `POST /api/v1/customer-attributions/check` - Attribution für Order prüfen

### Commissions
- `POST /api/v1/commissions/calculate` - Provision berechnen (Preview)
- `POST /api/v1/commissions/process` - Provision verarbeiten
- `GET /api/v1/commissions` - Liste aller Provisionen
- `POST /api/v1/commissions/refund` - Provisionen stornieren
- `POST /api/v1/commissions/approve-eligible` - Fällige genehmigen

### Payouts
- `GET /api/v1/payouts` - Liste aller Auszahlungen
- `POST /api/v1/payouts/create` - Neue Auszahlung erstellen
- `POST /api/v1/payouts/:id/process` - Auszahlung verarbeiten
- `GET /api/v1/payouts/pending-payout` - Auszahlungsreife anzeigen

### Contracts
- `GET /api/v1/contracts/templates` - Verfügbare Vertragsvorlagen
- `POST /api/v1/contracts/sign` - Vertrag unterzeichnen
- `GET /api/v1/contracts/verify/:tenantId/:type` - Vertragsstatus prüfen

### Audit
- `GET /api/v1/audit` - Audit-Logs abfragen

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL
- Docker (optional)

### Installation

```bash
# Dependencies installieren
pnpm install

# Environment konfigurieren
cp env.example .env.local

# Datenbank migrieren
cd apps/api && pnpm db:migrate

# Development Server starten
pnpm dev
```

### Docker

```bash
# Mit Docker Compose starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

## Environment Variables

```env
# API
PORT=3010
DATABASE_URL=postgresql://localhost:5432/admin_mojo
NODE_ENV=development

# Clerk Auth
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Service URLs
PAYMENTS_API_URL=http://localhost:3001
ACCOUNTS_API_URL=http://localhost:3002
```

## Integration mit anderen Services

### payments.mojo
- Sendet Order-Events an admin.mojo
- admin.mojo berechnet Provisionen
- Entitlement-Webhook-Empfänger

### accounts.mojo
- User-Authentifizierung via Clerk
- Platform Roles werden von admin.mojo verwaltet

### kontakte.mojo
- Customer-Daten (billing_country) für DACH-Erkennung
- Customer Attribution wird hier gespeichert

## Traefik Labels

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.admin-web.rule=Host(`admin.mojo.localhost`)"
  - "traefik.http.routers.admin-api.rule=Host(`api.admin.mojo.localhost`)"
```

## License

Proprietary - MOJO LLC
