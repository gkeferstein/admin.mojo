# MOJO Business Model

> **Flywheel-System für chronische Gesundheit** – Die Architektur eines nachhaltigen B2C/B2B Ökosystems

**Version:** 1.0.0  
**Letzte Aktualisierung:** 03. Januar 2026

---

## Inhaltsverzeichnis

1. [Übersicht: Das Flywheel-System](#1-übersicht-das-flywheel-system)
2. [B2C Segment: Menschen mit chronischen Krankheiten](#2-b2c-segment-menschen-mit-chronischen-krankheiten)
3. [B2B Segment: Gesundheitsprofis](#3-b2b-segment-gesundheitsprofis)
4. [Die zentrale User Journey: campus.mojo](#4-die-zentrale-user-journey-campusmojo)
5. [Flywheel-Mechanik: B2B → B2C Verbindung](#5-flywheel-mechanik-b2b--b2c-verbindung)
6. [Apps & Architektur](#6-apps--architektur)
7. [Revenue-Modell](#7-revenue-modell)

---

## 1. Übersicht: Das Flywheel-System

### Das Konzept

MOJO ist ein **Flywheel-System** mit zwei sich gegenseitig stärkenden Segmenten:

```
┌─────────────────────────────────────────────────────────────┐
│                      B2C Segment                            │
│  Menschen mit chronischen Krankheiten                       │
│  → Digitale Kurse, Workshops, Events, Mentoring             │
│  → Stufe 1: LEBENSENERGIE                                   │
│  → Stufe 2: RESILIENZ                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Buchen Events/Mentoring von B2B
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      B2B Segment                            │
│  Gesundheitsprofis (Heilpraktiker, Ärzte, Physios)         │
│  → Ausbildung zum selbstständigen Gesundheitsprofi          │
│  → Stufe 3: BUSINESS BOOTCAMP                               │
│  → Stufe 4: RegenerationsmedizinOS                          │
│  → Werden zu Mentoren für B2C                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Werden zu Service-Providern
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   campus.mojo                               │
│          Zentrale Begegnungsstätte                          │
│  Kurse | Foren | Community | Live Calls | Events            │
└─────────────────────────────────────────────────────────────┘
```

### Zentrale Frage B2C

**"Was kann ich selbst NOCH tun?"**

- Nicht zu medizinisch
- Empowerment-fokussiert
- Praktische Tools für mehr Gesundheit und Lebensenergie

### Zentrale Frage B2B

**"Wie werde ich selbstständiger Gesundheitsprofi im Selbstzahlerbereich?"**

- Aus dem Kassensystem raus
- Eigenständig im Selbstzahlerbereich arbeiten
- Teil des "Systems für chronische Gesundheit" werden

---

## 2. B2C Segment: Menschen mit chronischen Krankheiten

### Zielgruppe

Menschen mit chronischen Krankheiten, die nach zusätzlichen, selbstbestimmten Lösungen suchen.

### Zentrales Angebot

| Angebot | Format | Ziel |
|---------|--------|------|
| **Digitale Kurse** | Online | Mehr Gesundheit und Lebensenergie |
| **Live Workshops** | Online/Live | Gesundheitskompetenz aufbauen |
| **Events** | Live | Gemeinschaft und Lernen |
| **Gruppenformate** | Online/Live | Unterstützung in der Gruppe |
| **1-zu-1 Mentoring** | Online/Live | Individuelle Begleitung |

### User Journey: B2C Stufen

```
Stufe 1: LEBENSENERGIE
└─ Erste AHA-Momente
└─ Digitale Kurse für Grundlagen
└─ Community-Zugang
└─ Basis-Workshops

Stufe 2: RESILIENZ  
└─ Vertiefte Gesundheitskompetenz
└─ Erweiterte Workshops
└─ Gruppenformate
└─ Option: 1-zu-1 Mentoring (von B2B Profis)
```

**Ziel:** Mehr Selbstbestimmung und Handlungsfähigkeit im Umgang mit chronischen Krankheiten.

---

## 3. B2B Segment: Gesundheitsprofis

### Zielgruppe

- Heilpraktiker
- Ärzte (die aus dem Kassensystem raus wollen)
- Physiotherapeuten
- Andere Gesundheitsprofis

### Zentrales Angebot

**Ausbildung zum selbstständigen Gesundheitsprofi im Selbstzahlerbereich**

### User Journey: B2B Stufen

```
Stufe 3: BUSINESS BOOTCAMP
└─ Grundlagen Selbstständigkeit
└─ Selbstzahlerbereich verstehen
└─ Business-Modell entwickeln
└─ Erste Tools freigeschaltet (payments.mojo)

Stufe 4: RegenerationsmedizinOS
└─ Fachliche Vertiefung
└─ Voller Zugang zu allen Tools
└─ Werde Mentor für B2C Kunden
└─ Kann Events/Mentoring anbieten
```

**Ziel:** Eigenständig im Selbstzahlerbereich arbeiten und Teil des MOJO-Ökosystems werden.

### Tools für B2B

- `payments.mojo` – Multitenancy für einfache Zahlungsabwicklung
- `kontakte.mojo` – CRM für Kunden/Patienten
- `pos.mojo` – Point of Sale (optional)
- Event-Management – Events für B2C Kunden anbieten

---

## 4. Die zentrale User Journey: campus.mojo

### Konzept

**`campus.mojo` ist der zentrale Begegnungsort** – EINE zentrale User Journey durch die MOJO Welt.

### Struktur

```
campus.mojo-institut.de
├── Alle Kurse (B2C + B2B)
├── Foren (getrennt nach Stufen/Mitgliedschaften)
├── Community
├── Live Calls
└── Events (B2C können Events von B2B buchen)
```

### Multitenancy & Mitgliedschaften

| Mitgliedschaft | Zugang | Inhalt |
|----------------|--------|--------|
| **B2C: LEBENSENERGIE** | Stufe 1 | Basis-Kurse, Forum, Community |
| **B2C: RESILIENZ** | Stufe 2 | Erweiterte Kurse, Workshops, Gruppen |
| **B2B: BUSINESS BOOTCAMP** | Stufe 3 | Business-Kurse, Tools, Community |
| **B2B: RegenerationsmedizinOS** | Stufe 4 | Alle Kurse, Tools, Mentor-Status |

### Prinzipien

- **Eine zentrale Plattform** – alle Kurse, Foren, Community an einem Ort
- **Zugang basierend auf Mitgliedschaft** – jeder sieht nur, was zu seiner Stufe gehört
- **Nahtlose Progression** – User können durch die Stufen aufsteigen
- **Getrennte Bereiche** – B2C und B2B haben eigene Foren/Communities, aber können sich begegnen

---

## 5. Flywheel-Mechanik: B2B → B2C Verbindung

### Der Flywheel

```
1. B2B Kunden durchlaufen Stufe 3 & 4
   ↓
2. Werden ausgebildet und zertifiziert
   ↓
3. Werden zu Mentoren/Service-Providern
   ↓
4. Bieten Events/Workshops/1-zu-1 Mentoring für B2C an
   ↓
5. B2C Kunden buchen diese Services
   ↓
6. B2B Kunden generieren Revenue → mehr Engagement
   ↓
7. Mehr B2B Kunden → mehr Angebot → mehr B2C Kunden
   ↓
8. ZURÜCK ZU SCHRITT 1 (Flywheel beschleunigt sich)
```

### Konkrete Verbindungen

| B2B Angebot | B2C Nachfrage | Plattform |
|-------------|---------------|-----------|
| Live Workshops | B2C bucht Workshop | `campus.mojo` |
| Events | B2C bucht Event | `campus.mojo` |
| 1-zu-1 Mentoring | B2C bucht Mentoring | `campus.mojo` |
| Gruppensessions | B2C tritt Gruppe bei | `campus.mojo` |

### Value Proposition

**Für B2B:**
- ✅ Zusätzliche Revenue-Quelle
- ✅ Praktische Erfahrung mit Kunden
- ✅ Netzwerk-Aufbau
- ✅ Teil des Ökosystems

**Für B2C:**
- ✅ Persönliche Begleitung durch Profis
- ✅ Events und Workshops von Experten
- ✅ Direkter Kontakt zu Gesundheitsprofis
- ✅ Praktische Umsetzung des Gelernten

---

## 6. Apps & Architektur

### Zentrale Apps

#### `campus.mojo` – Die zentrale Plattform

**Rolle:** Zentrale Begegnungsstätte für alle User

**Features:**
- Multitenancy für verschiedene Mitgliedschaften
- Kurs-Management (B2C + B2B)
- Forum-System (getrennt nach Stufen)
- Community-Features
- Live Calls / Webinar-Funktionalität
- Event-Management & Buchungssystem
- Mentoring-Buchungssystem

**Technisch:**
- B2C und B2B Nutzer in einem System
- Zugriffskontrolle über Mitgliedschafts-Level
- Events können von B2B erstellt und von B2C gebucht werden

#### `account.mojo` – Account-Verwaltung

**Rolle:** Zentrale Account-Verwaltung für alle User (B2C + B2B)

**Features:**
- Persönliche Daten verwalten
- Mitgliedschaften verwalten
- Organizations (für B2B)
- Subscriptions verwalten
- Verknüpfte Accounts

**Wichtig:** 
- B2C: Persönliches Konto
- B2B: Kann Organisation erstellen (für Business-Context)

#### `payments.mojo` – Zahlungsabwicklung (Multitenancy)

**Rolle:** Zahlungsabwicklung für B2B Kunden (Multitenancy)

**Zugang:** Nur für B2B (ab Stufe 3: BUSINESS BOOTCAMP)

**Features:**
- Zahlungen entgegennehmen
- Rechnungen erstellen
- Subscriptions verwalten
- Auszahlungen (für B2B → B2C Services)

**Multitenancy:** Jeder B2B Kunde hat seinen eigenen Tenant für Zahlungsabwicklung

---

### Support Apps

#### `kontakte.mojo` – CRM (B2B)

**Rolle:** Single Source of Truth für Kontakte

**Zugang:** B2B (ab bestimmter Stufe)

**Features:**
- Kunden/Patienten verwalten
- Leads verwalten
- Partner/Affiliates verwalten

**Integration:** Wird von `payments.mojo` referenziert

#### `pos.mojo` – Point of Sale (optional für B2B)

**Rolle:** Kartenzahlungen an der Theke

**Zugang:** B2B (optional)

#### `checkin.mojo` – 10er-Karten (optional für B2B)

**Rolle:** Verwaltung von 10er-Karten

**Zugang:** B2B (optional)

---

### Platform Apps

#### `frontend.mojo` – Marketing Frontend

**Rolle:** Öffentliche Visitenkarte

**Content:**
- B2C Landing Pages (LEBENSENERGIE, RESILIENZ)
- B2B Landing Pages (BUSINESS BOOTCAMP, RegenerationsmedizinOS)
- Informationen zum Ökosystem

#### `messaging.mojo` – Echtzeit-Kommunikation

**Rolle:** Kommunikation zwischen allen Usern

**Features:**
- B2C ↔ B2C Kommunikation
- B2B ↔ B2B Kommunikation
- B2C ↔ B2B Kommunikation (für Mentoring/Events)

---

## 7. Revenue-Modell & Platform-Hierarchie

### Revenue-Modell (siehe unten)

### Platform-Hierarchie: Regionale Distributoren

Siehe [Abschnitt 7.5. Platform-Hierarchie: Regionale Distributoren](#75-platform-hierarchie-regionale-distributoren)

---

## 7.1. Revenue-Modell

### Revenue-Flows im Detail

#### Flow 1: `campus.mojo` – Mitgliedschaften (B2C & B2B)

**Alle Mitgliedschaften gehen direkt an Platform Owner (MOJO LLC)**

**Mitgliedschaften:**
- B2C: LEBENSENERGIE, RESILIENZ
- B2B: BUSINESS BOOTCAMP, RegenerationsmedizinOS

**Revenue-Aufteilung:**
```
B2C/B2B zahlt Mitgliedschaft (z.B. €29/Monat)
    ↓
Platform Owner (MOJO LLC) erhält: €29.00
    ↓
Regional Partner erhält: 30% = €8.70
Platform Owner behält: 70% = €20.30
```

**Bestimmung der Region:**
- Rechnungsadresse bestimmt, welcher Regional Partner die 30% Provision erhält
- Verankert in `admin.mojo` im Regional Distribution Agreement

**Beispiele:**

| Mitgliedschaft | Preis | Platform Owner (70%) | Regional Partner (30%) |
|----------------|-------|---------------------|----------------------|
| LEBENSENERGIE | €29/Monat | €20.30 | €8.70 |
| RESILIENZ | €79/Monat | €55.30 | €23.70 |
| BUSINESS BOOTCAMP | €99/Monat | €69.30 | €29.70 |
| RegenerationsmedizinOS | €199/Monat | €139.30 | €59.70 |

---

#### Flow 2: `payments.mojo` – Transaktionen (B2C → B2B Services)

**B2C Kunde bucht Event/Mentoring bei B2B Tenant**

**Transaction Fee:** 3.9% + €0.50 pro Transaktion

**Revenue-Aufteilung:**
```
B2C zahlt €100 für Event/Mentoring
    ↓
Transaction Fee: 3.9% + €0.50 = €4.40
    ↓
Tenant erhält: €100 - €4.40 = €95.60
    ↓
Regional Partner erhält: €4.40 (3.9% + €0.50)
    ↓
Regional Partner zahlt 70% an Platform Owner: €3.08
Regional Partner behält 30%: €1.32
```

**Zusammengefasst pro €100 Transaktion:**
- **Tenant:** €95.60 (95.6%)
- **Regional Partner:** €1.32 (1.32% von €100)
- **Platform Owner:** €3.08 (3.08% von €100)

**Verankerung:**
- Transaction Fee Deal zwischen Regional Partner und Tenant
- 70/30 Split zwischen Regional Partner und Platform Owner
- Alles in `admin.mojo` im Regional Distribution Agreement verankert

**Beispiele:**

| Transaktionsbetrag | Transaction Fee | Tenant erhält | Regional Partner | Platform Owner |
|-------------------|----------------|---------------|------------------|----------------|
| €50 | €2.45 (3.9% + €0.50) | €47.55 | €0.74 (30% von €2.45) | €1.72 (70% von €2.45) |
| €100 | €4.40 (3.9% + €0.50) | €95.60 | €1.32 (30% von €4.40) | €3.08 (70% von €4.40) |
| €200 | €8.30 (3.9% + €0.50) | €191.70 | €2.49 (30% von €8.30) | €5.81 (70% von €8.30) |
| €500 | €20.00 (3.9% + €0.50) | €480.00 | €6.00 (30% von €20.00) | €14.00 (70% von €20.00) |

---

### Revenue-Streams Übersicht

#### 1. Mitgliedschaften (campus.mojo)

- **B2C Mitgliedschaften:**
  - LEBENSENERGIE, RESILIENZ
- **B2B Mitgliedschaften:**
  - BUSINESS BOOTCAMP, RegenerationsmedizinOS

**Flow:** Direkt an Platform Owner → Regional Partner erhält 30% (basierend auf Rechnungsadresse)

#### 2. Transaction Fees (payments.mojo)

- **B2C → B2B Services:**
  - Events, Mentoring, Workshops
  - Transaction Fee: 3.9% + €0.50
  - Regional Partner erhält Fee → zahlt 70% an Platform Owner

#### 3. Regional Distribution Agreements

- **Verwaltung in `admin.mojo`:**
  - Regional Partner Verträge
  - 30% Provision für Mitgliedschaften
  - 30% von Transaction Fees (70% gehen an Platform Owner)
  - Region bestimmt durch Rechnungsadresse (Mitgliedschaften) oder Tenant-Region (Transaktionen)

---

### Revenue-Flow Visualisierung

```
┌─────────────────────────────────────────────────────────────┐
│              REVENUE FLOW: Mitgliedschaften                 │
└─────────────────────────────────────────────────────────────┘

B2C/B2B zahlt Mitgliedschaft (€29)
    ↓
Platform Owner (MOJO LLC) erhält: €29.00
    ↓
    ├─ Platform Owner behält: €20.30 (70%)
    └─ Regional Partner erhält: €8.70 (30%)
       (Bestimmt durch Rechnungsadresse)

┌─────────────────────────────────────────────────────────────┐
│           REVENUE FLOW: payments.mojo Transaktionen         │
└─────────────────────────────────────────────────────────────┘

B2C bucht Event bei B2B Tenant (€100)
    ↓
Transaction Fee: 3.9% + €0.50 = €4.40
    ↓
    ├─ Tenant erhält: €95.60
    └─ Regional Partner erhält: €4.40
       ↓
       ├─ Platform Owner erhält: €3.08 (70% von €4.40)
       └─ Regional Partner behält: €1.32 (30% von €4.40)
```

---

## 7.2. Stripe-Integration & Revenue-Management

### Stripe-Setup für 3-Ebenen-Hierarchie

**Architektur:**
- **Platform Owner (MOJO LLC)**: Haupt-Stripe Account (Zentrale Instanz)
- **Regional Partner**: Kein Stripe Account (Internes Revenue-Tracking)
- **Tenant (B2B Kunden)**: Stripe Connect Express Account (Connected to Platform Owner)

**Entscheidung:** Manuelle Auszahlungen an Regional Partner
- ✅ Monatliche Auszahlungen
- ✅ Transparentes Reporting für Regional Partner
- ✅ Kein Stripe Setup für Regional Partner nötig
- ✅ Vollständige Kontrolle durch Platform Owner

---

### Flow 1: Mitgliedschaften (campus.mojo)

**Stripe-Integration:**
```typescript
// Direkter Payment zu Platform Owner Stripe Account
const checkoutSession = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: { name: 'LEBENSENERGIE Mitgliedschaft' },
      unit_amount: 2900, // €29.00
      recurring: { interval: 'month' },
    },
    quantity: 1,
  }],
  metadata: {
    membership_type: 'LEBENSENERGIE',
    user_id: userId,
    billing_address_country: userCountry, // Für Regional Partner Bestimmung
    region_id: regionId, // Automatisch aus Rechnungsadresse
  },
  success_url: '...',
  cancel_url: '...',
});
```

**Revenue-Tracking in admin.mojo:**
```
Payment erfolgreich (€29)
    ↓
1. Platform Owner erhält: €29.00 (auf Stripe Account)
2. admin.mojo erstellt Revenue Record:
   - Amount: €29.00
   - Type: 'membership'
   - Membership Type: 'LEBENSENERGIE'
   - User ID: userId
   - Region ID: regionId (aus Rechnungsadresse)
   - Regional Partner ID: regionalPartnerId
   - Platform Owner Share: €20.30 (70%)
   - Regional Partner Provision: €8.70 (30%)
   - Status: 'pending_payout'
   - Payout Period: '2025-01' (Jahr-Monat)
```

---

### Flow 2: Transaktionen (payments.mojo)

**Stripe-Integration:**
```typescript
// Destination Charge mit Application Fee
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // €100.00 in cents
  currency: 'eur',
  application_fee_amount: 440, // €4.40 (3.9% + €0.50)
  transfer_data: {
    destination: tenantStripeAccountId, // Tenant Connected Account
  },
  metadata: {
    tenant_id: tenantId,
    regional_partner_id: regionalPartnerId, // Aus Tenant-Region
    transaction_type: 'event_booking',
    event_id: eventId,
  },
});
```

**Revenue-Tracking in admin.mojo:**
```
Payment erfolgreich (€100)
    ↓
1. Tenant erhält: €95.60 (automatisch via Stripe Transfer)
2. Platform Owner erhält: €4.40 Application Fee (auf Stripe Account)
3. admin.mojo erstellt Revenue Record:
   - Amount: €100.00
   - Transaction Fee: €4.40
   - Type: 'transaction'
   - Tenant ID: tenantId
   - Region ID: tenant.regionId
   - Regional Partner ID: regionalPartnerId
   - Platform Owner Share: €3.08 (70% von €4.40)
   - Regional Partner Provision: €1.32 (30% von €4.40)
   - Status: 'pending_payout'
   - Payout Period: '2025-01'
```

---

### Revenue-Tracking in admin.mojo

#### Datenmodell

```typescript
interface RevenueRecord {
  id: string;
  type: 'membership' | 'transaction';
  
  // Payment-Daten
  amount: number; // Original-Betrag (z.B. €29 oder €100)
  currency: string;
  stripe_payment_id: string; // Stripe Payment Intent/Checkout Session ID
  payment_date: Date;
  
  // Revenue-Aufteilung
  platform_owner_amount: number; // Was Platform Owner behält
  regional_partner_provision: number; // Was Regional Partner bekommt
  transaction_fee?: number; // Nur bei Transaktionen (3.9% + €0.50)
  
  // Zuordnung
  region_id: string;
  regional_partner_id: string;
  tenant_id?: string; // Nur bei Transaktionen
  user_id?: string; // Nur bei Mitgliedschaften
  
  // Membership-spezifisch
  membership_type?: 'LEBENSENERGIE' | 'RESILIENZ' | 'BUSINESS_BOOTCAMP' | 'REGENERATIONSMEDIZIN_OS';
  
  // Transaction-spezifisch
  transaction_type?: 'event_booking' | 'mentoring' | 'workshop';
  
  // Payout-Management
  payout_period: string; // Format: 'YYYY-MM' (z.B. '2025-01')
  payout_status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payout_date?: Date;
  payout_reference?: string; // Banküberweisungs-Referenz
  
  createdAt: Date;
  updatedAt: Date;
}

interface Payout {
  id: string;
  regional_partner_id: string;
  payout_period: string; // 'YYYY-MM'
  
  // Revenue-Zusammenfassung
  total_revenue: number; // Summe aller Revenue Records
  total_provision: number; // Summe aller Provisionen
  revenue_count: number; // Anzahl der Revenue Records
  
  // Breakdown nach Typ
  membership_provision: number;
  transaction_provision: number;
  membership_count: number;
  transaction_count: number;
  
  // Status
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  approved_at?: Date;
  paid_at?: Date;
  payment_reference?: string;
  
  // Bank-Details
  bank_account_iban?: string;
  bank_account_bic?: string;
  bank_account_holder?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Monatliches Payout-Process

#### Schritt 1: Revenue-Aggregation (1. des Monats)

```typescript
// admin.mojo - Payout für letzten Monat erstellen
async function createMonthlyPayouts(period: string) {
  // Für jeden Regional Partner
  const regionalPartners = await getRegionalPartners();
  
  for (const partner of regionalPartners) {
    // Alle Revenue Records für diesen Partner und Period
    const revenues = await getRevenueRecords({
      regional_partner_id: partner.id,
      payout_period: period,
      payout_status: 'pending',
    });
    
    // Aggregiere
    const totalProvision = revenues.reduce((sum, r) => sum + r.regional_partner_provision, 0);
    const membershipRevenues = revenues.filter(r => r.type === 'membership');
    const transactionRevenues = revenues.filter(r => r.type === 'transaction');
    
    // Erstelle Payout
    const payout = await createPayout({
      regional_partner_id: partner.id,
      payout_period: period,
      total_revenue: revenues.reduce((sum, r) => sum + r.amount, 0),
      total_provision: totalProvision,
      revenue_count: revenues.length,
      membership_provision: membershipRevenues.reduce((sum, r) => sum + r.regional_partner_provision, 0),
      transaction_provision: transactionRevenues.reduce((sum, r) => sum + r.regional_partner_provision, 0),
      membership_count: membershipRevenues.length,
      transaction_count: transactionRevenues.length,
      status: 'pending',
    });
    
    // Markiere Revenue Records als zu diesem Payout gehörend
    await updateRevenueRecords({
      revenue_ids: revenues.map(r => r.id),
      payout_id: payout.id,
    });
  }
}
```

#### Schritt 2: Review & Approval (Platform Owner)

**UI in admin.mojo:**
```
┌─────────────────────────────────────────────────────────┐
│  Payout Review - Januar 2025                           │
└─────────────────────────────────────────────────────────┘

DACH Region (Regional Partner: Partner Name)
├─ Total Provision: €1,234.50
├─ Mitgliedschaften: €890.00 (72 Revenue Records)
├─ Transaktionen: €344.50 (156 Revenue Records)
└─ [Review Details] [Approve] [Reject]

US Region (Regional Partner: Partner Name)
├─ Total Provision: €2,567.80
└─ ...

[Approve All] [Export CSV]
```

#### Schritt 3: Auszahlung (manuell via Banküberweisung)

```typescript
// Nach manueller Auszahlung per Banküberweisung
await updatePayout({
  payout_id: payoutId,
  status: 'paid',
  paid_at: new Date(),
  payment_reference: 'Überweisung XYZ-12345', // Banküberweisungs-Referenz
});
```

---

### Reporting für Regional Partner

#### Dashboard-Übersicht (admin.mojo - Regional Partner View)

```
┌─────────────────────────────────────────────────────────┐
│  Regional Partner Dashboard - DACH Region              │
└─────────────────────────────────────────────────────────┘

Aktueller Monat (Januar 2025)
├─ Total Provision: €1,234.50
│  ├─ Mitgliedschaften: €890.00 (72 Sales)
│  └─ Transaktionen: €344.50 (156 Transactions)
│
├─ Letzte Auszahlung: Dezember 2024
│  └─ €987.30 (bezahlt am 15.01.2025, Ref: XYZ-12345)
│
└─ Nächste Auszahlung: Februar 2025 (voraussichtlich 15.02.2025)

┌─────────────────────────────────────────────────────────┐
│  Revenue-Details (Januar 2025)                         │
└─────────────────────────────────────────────────────────┘

Mitgliedschaften (72 Sales)
├─ LEBENSENERGIE: €435.00 (15 Sales)
├─ RESILIENZ: €237.00 (3 Sales)
├─ BUSINESS BOOTCAMP: €178.20 (6 Sales)
└─ RegenerationsmedizinOS: €39.80 (1 Sale)

Transaktionen (156 Transactions)
├─ Total Transaction Volume: €8,823.45
├─ Transaction Fees: €394.50
├─ Deine Provision (30%): €118.35
└─ Platform Owner (70%): €276.15

┌─────────────────────────────────────────────────────────┐
│  Verlauf                                                    │
└─────────────────────────────────────────────────────────┘

| Period      | Membership | Transaction | Total    | Status   |
|-------------|------------|-------------|----------|----------|
| 2025-01     | €890.00    | €344.50     | €1,234.50| Pending  |
| 2024-12     | €756.30    | €231.00     | €987.30  | Paid     |
| 2024-11     | €689.40    | €198.60     | €888.00  | Paid     |
```

#### Detail-View: Einzelne Revenue Records

```
┌─────────────────────────────────────────────────────────┐
│  Revenue Details - Januar 2025                         │
└─────────────────────────────────────────────────────────┘

Filter: [Alle] [Mitgliedschaften] [Transaktionen] [Period: 2025-01]

| Datum       | Typ            | Betrag | Provision | Status   |
|-------------|----------------|--------|-----------|----------|
| 15.01.2025  | LEBENSENERGIE  | €29.00 | €8.70     | Pending  |
| 15.01.2025  | Event Booking  | €100.00| €1.32     | Pending  |
| 14.01.2025  | RESILIENZ      | €79.00 | €23.70    | Pending  |
| ...         | ...            | ...    | ...       | ...      |

[Export CSV] [Filter]
```

#### Export-Funktionen

**CSV-Export für Regional Partner:**
```csv
Date,Type,Amount,Provision,Status
2025-01-15,LEBENSENERGIE Membership,€29.00,€8.70,Pending
2025-01-15,Event Booking,€100.00,€1.32,Pending
2025-01-14,RESILIENZ Membership,€79.00,€23.70,Pending
...
```

**PDF-Report für Steuerberater:**
```
MOJO Platform - Regional Partner Revenue Report
DACH Region - Januar 2025

Total Revenue: €12,345.67
Total Provision: €1,234.50

Breakdown:
- Mitgliedschaften: €890.00 (72 Sales)
- Transaktionen: €344.50 (156 Transactions)

Auszahlung: Pending (voraussichtlich 15.02.2025)
```

---

### Technische Implementierung

#### Revenue Tracking Webhook Handler

```typescript
// admin.mojo - Webhook Handler für Stripe Payments
async function handleStripePayment(paymentData: {
  stripe_payment_id: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  payment_date: Date;
}) {
  // Bestimme Typ
  const type = paymentData.metadata.membership_type 
    ? 'membership' 
    : 'transaction';
  
  // Bestimme Region & Regional Partner
  const regionId = paymentData.metadata.region_id || 
                   await determineRegionFromBillingAddress(paymentData.metadata.billing_address_country);
  const regionalPartner = await getRegionalPartnerByRegion(regionId);
  
  // Berechne Provision
  let platformOwnerAmount: number;
  let regionalPartnerProvision: number;
  
  if (type === 'membership') {
    platformOwnerAmount = paymentData.amount * 0.70;
    regionalPartnerProvision = paymentData.amount * 0.30;
  } else {
    // Transaction: Application Fee war bereits 3.9% + €0.50
    const transactionFee = paymentData.amount * 0.039 + 0.50;
    platformOwnerAmount = transactionFee * 0.70;
    regionalPartnerProvision = transactionFee * 0.30;
  }
  
  // Erstelle Revenue Record
  const revenue = await createRevenueRecord({
    type,
    amount: paymentData.amount,
    currency: paymentData.currency,
    stripe_payment_id: paymentData.stripe_payment_id,
    payment_date: paymentData.payment_date,
    platform_owner_amount: platformOwnerAmount,
    regional_partner_provision: regionalPartnerProvision,
    transaction_fee: type === 'transaction' ? paymentData.amount * 0.039 + 0.50 : null,
    region_id: regionId,
    regional_partner_id: regionalPartner.id,
    tenant_id: paymentData.metadata.tenant_id,
    user_id: paymentData.metadata.user_id,
    membership_type: paymentData.metadata.membership_type,
    transaction_type: paymentData.metadata.transaction_type,
    payout_period: formatPayoutPeriod(paymentData.payment_date), // 'YYYY-MM'
    payout_status: 'pending',
  });
  
  return revenue;
}
```

#### API-Endpoints für Regional Partner

```typescript
// admin.mojo - API für Regional Partner Dashboard

// GET /api/regional-partners/:id/dashboard
async function getRegionalPartnerDashboard(regionalPartnerId: string) {
  const currentPeriod = formatPayoutPeriod(new Date());
  const lastPeriod = getLastMonth(currentPeriod);
  
  // Aktuelle Period
  const currentRevenues = await getRevenueRecords({
    regional_partner_id: regionalPartnerId,
    payout_period: currentPeriod,
  });
  
  // Letzte Auszahlung
  const lastPayout = await getLatestPayout({
    regional_partner_id: regionalPartnerId,
    status: 'paid',
  });
  
  // Aggregation
  const currentProvision = currentRevenues.reduce(
    (sum, r) => sum + r.regional_partner_provision, 
    0
  );
  
  return {
    current_period: currentPeriod,
    current_provision: currentProvision,
    current_revenue_count: currentRevenues.length,
    membership_provision: currentRevenues
      .filter(r => r.type === 'membership')
      .reduce((sum, r) => sum + r.regional_partner_provision, 0),
    transaction_provision: currentRevenues
      .filter(r => r.type === 'transaction')
      .reduce((sum, r) => sum + r.regional_partner_provision, 0),
    last_payout: lastPayout,
    next_payout_date: calculateNextPayoutDate(),
  };
}

// GET /api/regional-partners/:id/revenues
async function getRegionalPartnerRevenues(
  regionalPartnerId: string,
  filters: {
    period?: string;
    type?: 'membership' | 'transaction';
    status?: 'pending' | 'paid';
  }
) {
  return await getRevenueRecords({
    regional_partner_id: regionalPartnerId,
    ...filters,
  });
}

// GET /api/regional-partners/:id/payouts
async function getRegionalPartnerPayouts(regionalPartnerId: string) {
  return await getPayouts({
    regional_partner_id: regionalPartnerId,
  });
}
```

---

### Wichtige Punkte

1. **Tenants sind Kunden des Platform Owners:**
   - Tenants zahlen Transaction Fee an Regional Partner
   - Regional Partner ist verantwortlich für Vertrieb und regionalen Content/Distribution
   - Regional Partner erhält dafür 30% der Transaction Fees

2. **Regionale Distribution Agreements:**
   - Alles in `admin.mojo` verankert
   - Klare Verträge zwischen Platform Owner und Regional Partner
   - 70/30 Split bei allen Revenue-Streams

3. **Region-Bestimmung:**
   - **Mitgliedschaften:** Rechnungsadresse bestimmt Region
   - **Transaktionen:** Tenant-Region bestimmt, welcher Regional Partner die Fee erhält

---

## 8. Architektur-Prinzipien

### Klare Trennung, aber nahtlose Integration

```
┌─────────────────────────────────────────────────────────┐
│              campus.mojo (zentral)                      │
│  ┌──────────────┐           ┌──────────────┐          │
│  │   B2C Area   │           │   B2B Area   │          │
│  │ LEBENSENERGIE│           │BUSINESS      │          │
│  │ RESILIENZ    │           │BOOTCAMP      │          │
│  │              │◄──Events──►│Regenerations│          │
│  │              │   Mentoring│medizinOS    │          │
│  └──────────────┘           └──────────────┘          │
│         │                            │                 │
│         │                            │                 │
└─────────┼────────────────────────────┼─────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────┐        ┌──────────────────────┐
│ account.mojo    │        │ payments.mojo        │
│ (alle User)     │        │ (nur B2B)            │
└─────────────────┘        └──────────────────────┘
```

### Datenmodell

**User Types:**
- `B2C_USER` – Menschen mit chronischen Krankheiten
- `B2B_USER` – Gesundheitsprofis

**Mitgliedschaften:**
- `LEBENSENERGIE` (B2C Stufe 1)
- `RESILIENZ` (B2C Stufe 2)
- `BUSINESS_BOOTCAMP` (B2B Stufe 3)
- `REGENERATIONSMEDIZIN_OS` (B2B Stufe 4)

**Organizations:**
- B2B User können Organizations erstellen
- Organizations sind Tenants für `payments.mojo`

**Events/Mentoring:**
- B2B User können Events/Mentoring anbieten
- B2C User können diese buchen
- Transaktionen über `payments.mojo` (B2B Tenant)

---

## 7.5. Platform-Hierarchie: Regionale Distributoren

### Die 3-Ebenen-Architektur

MOJO LLC ist der **Platform Owner** weltweit. Für jede Weltregion gibt es **Regionale Distributoren**, die regionalen Vertrieb und Anpassungen machen.

```
┌─────────────────────────────────────────────────────────────┐
│  EBENE 1: MOJO LLC (Platform Owner)                        │
│  → Sieht ALLES weltweit                                     │
│  → Alle Regionalen Partner                                  │
│  → Alle Tenants                                             │
│  → Alle Kunden                                              │
│  → Platform Administration (admin.mojo)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ EBENE 2:     │ │ EBENE 2:     │ │ EBENE 2:     │ │ EBENE 2:     │
│ DACH Region  │ │ US Region    │ │ INDIEN Region│ │ ... Region   │
│              │ │              │ │              │ │              │
│ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │
│ • DACH Tenant│ │ • US Tenants │ │ • INDIEN     │ │ • ... Tenants│
│ • DACH Kunden│ │ • US Kunden  │ │   Tenants    │ │ • ... Kunden │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┼────────────────┼────────────────┘
                        │                │
        ┌───────────────┼────────────────┼───────────────┐
        │               │                │               │
        ▼               ▼                ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ EBENE 3:     │ │ EBENE 3:     │ │ EBENE 3:     │ │ EBENE 3:     │
│ Tenant Anna  │ │ Tenant Tom   │ │ Tenant ...   │ │ Tenant ...   │
│ (B2B Profi)  │ │ (B2B Profi)  │ │              │ │              │
│              │ │              │ │              │ │              │
│ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │ │ Sieht nur:   │
│ • Eigene     │ │ • Eigene     │ │ • Eigene     │ │ • Eigene     │
│   Kunden     │ │   Kunden     │ │   Kunden     │ │   Kunden     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### admin.mojo – Platform Administration

**Rolle:** Zentrale Platform Administration für MOJO LLC

**Zugang:** Nur für MOJO LLC Team (Platform Owner)

**Features:**
- **Regionale Distributoren verwalten**
  - Neue Regionen anlegen (DACH, US, INDIEN, etc.)
  - Regionale Verträge verwalten
  - Provisionen und Auszahlungen für Regionen

- **Globale Übersicht**
  - Alle Regionen weltweit
  - Alle Tenants in allen Regionen
  - Alle Kunden (aggregiert)
  - Platform-Health & Analytics

- **Revenue & Provisionen**
  - Regionale Revenue-Tracking
  - Provision-Berechnung für Regionale Partner:
    - **Mitgliedschaften:** 30% Provision an Regional Partner (70% an Platform Owner)
    - **Transaction Fees:** 30% von 3.9% + €0.50 Fee (70% an Platform Owner)
  - Auszahlungs-Management
  - Regional Distribution Agreements verwalten
  - Transaction Fee Deals (3.9% + €0.50 pro Transaktion) zwischen Regional Partner und Tenant

### Regionale Versionen

**Jede Region hat eigene Campus-Versionen:**

| Region | Campus Version | Domain (Beispiel) | Anpassungen |
|--------|----------------|-------------------|-------------|
| **DACH** | campus.mojo-dach | campus.dach.mojo-institut.de | Deutsche Sprache, DACH-spezifische Inhalte |
| **US** | campus.mojo-us | campus.us.mojo-institut.de | Englisch, US-spezifische Inhalte |
| **INDIEN** | campus.mojo-indien | campus.indien.mojo-institut.de | Hindi/Englisch, INDIEN-spezifische Inhalte |
| **...** | campus.mojo-{region} | campus.{region}.mojo-institut.de | Region-spezifisch |

**Gleiches gilt für andere Apps:**
- `payments.mojo-dach`, `payments.mojo-us`, etc.
- `kontakte.mojo-dach`, `kontakte.mojo-us`, etc.
- Alle Apps können regionalisiert werden

### Zugriffsrechte: Wer sieht was?

#### MOJO LLC (Platform Owner)

**Sieht ALLES:**
- ✅ Alle Regionen (DACH, US, INDIEN, ...)
- ✅ Alle Regionalen Partner
- ✅ Alle Tenants in allen Regionen
- ✅ Alle Kunden (aggregiert)
- ✅ Globale Platform-Metriken
- ✅ Regionale Revenue & Provisionen

**Zugang:** `admin.mojo` (Platform Administration)

#### Regionale Distributoren

**Sieht nur ihre Region:**
- ✅ Alle Tenants in ihrer Region
- ✅ Alle Kunden in ihrer Region
- ✅ Regionale Metriken
- ✅ Regionale Revenue
- ❌ Keine Zugriff auf andere Regionen
- ❌ Keine Zugriff auf globale Platform-Daten

**Zugang:** Regionale Admin-View in `admin.mojo` (gefiltert nach Region)

**Beispiel:**
- DACH Distributor sieht nur DACH Tenants und DACH Kunden
- US Distributor sieht nur US Tenants und US Kunden

#### Tenants (B2B Kunden)

**Sieht nur eigene Daten:**
- ✅ Eigene Kunden
- ✅ Eigene Zahlungen
- ✅ Eigene Events/Mentoring
- ❌ Keine Zugriff auf andere Tenants
- ❌ Keine Zugriff auf regionale Daten
- ❌ Keine Zugriff auf Platform-Daten

**Zugang:** Ihre eigenen Apps (`payments.mojo`, `kontakte.mojo`, etc.)

### Datenmodell: Regionale Hierarchie

```typescript
// Platform-Ebene
interface Region {
  id: string;
  code: 'DACH' | 'US' | 'INDIEN' | string;
  name: string;
  distributorId: string; // Regionale Distributor ID
  currency: string;
  locale: string;
}

// Tenant mit Region-Referenz
interface Tenant {
  id: string;
  slug: string;
  name: string;
  regionId: string; // VERBINDUNG ZUR REGION
  clerkOrgId?: string;
  // ...
}

// User mit Region (optional)
interface CampusUser {
  clerkUserId: string;
  membership: Membership;
  regionId?: string; // Region, in der User registriert ist
  // ...
}
```

### Technische Umsetzung

#### admin.mojo – Regionale Filterung

```typescript
// admin.mojo - Platform Owner sieht ALLES
async function getAllRegions() {
  // MOJO LLC sieht alle Regionen
  return await prisma.region.findMany();
}

// admin.mojo - Regionale Distributor sieht nur seine Region
async function getRegionalData(distributorId: string) {
  const region = await prisma.region.findUnique({
    where: { distributorId },
    include: {
      tenants: true, // Alle Tenants in dieser Region
      users: true,   // Alle User in dieser Region
    },
  });
  return region;
}
```

#### Tenant-Isolation pro Region

```typescript
// payments.mojo - Tenant sieht nur eigene Daten
async function getTenantCustomers(tenantId: string, regionId: string) {
  // Sicherstellung: Tenant gehört zur Region
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });
  
  if (tenant.regionId !== regionId) {
    throw new Error('Unauthorized: Tenant does not belong to region');
  }
  
  // Return nur Kunden dieses Tenants
  return await prisma.customer.findMany({
    where: { tenantId },
  });
}
```

#### Regionale Campus-Versionen

**Jede Region hat eigene Deployment:**
- `campus.mojo-dach` → Separate DB, eigene Instanz
- `campus.mojo-us` → Separate DB, eigene Instanz
- `campus.mojo-indien` → Separate DB, eigene Instanz

**Gemeinsam:**
- Gleiche Codebase
- Gleiche Architektur
- Regionale Konfiguration via Environment Variables
- Regionale Inhalte via CMS

---

## 8. Datenmodell: B2C ↔ B2B Verbindung

### Die Verbindung zwischen campus.mojo und payments.mojo

**Kernfrage:** Wie sind B2C Kunden in `campus.mojo` mit B2B Tenants in `payments.mojo` verbunden, wenn die gleiche Person beide Rollen hat?

### Lösung: Clerk User ID als zentrale Verbindung

**Prinzip:** Gleiche Person = Gleiche `clerkUserId` überall, aber verschiedene Kontexte durch Tenant-Separation.

```
┌─────────────────────────────────────────────────┐
│  account.mojo (Single Source of Truth)          │
│                                                  │
│  User: Max (Clerk User ID: user_abc123)         │
│  ├── B2C Mitgliedschaft: LEBENSENERGIE         │
│  │   → campus.mojo Zugriff                     │
│  │                                              │
│  └── B2B Tenant Kunde (in verschiedenen Tenants)│
│      → kontakte.mojo (Anna's Tenant)           │
│      → payments.mojo (Anna's Tenant)            │
└─────────────────────────────────────────────────┘
```

### Datenmodell-Struktur

#### campus.mojo

```typescript
interface CampusUser {
  clerkUserId: string; // "user_abc123" - ZENTRALE VERBINDUNG
  membership: 'LEBENSENERGIE' | 'RESILIENZ' | 'BUSINESS_BOOTCAMP' | 'REGENERATIONSMEDIZIN_OS';
  type: 'B2C' | 'B2B';
  email: string;
  name: string;
}
```

#### kontakte.mojo (B2B Tenant)

```typescript
interface Contact {
  id: string;
  clerkUserId: string; // "user_abc123" - VERBINDUNG ZU CAMPUS USER
  tenantId: string; // B2B Tenant ID (z.B. Anna's Tenant)
  name: string;
  email: string;
  // ... weitere Felder
}
```

**Wichtig:** Ein User kann in mehreren B2B Tenants als Kontakt existieren, immer mit derselben `clerkUserId`.

#### payments.mojo (B2B Tenant)

```typescript
interface Customer {
  id: string;
  clerkUserId: string; // "user_abc123" - VERBINDUNG ZU CAMPUS USER
  tenantId: string; // B2B Tenant ID
  contactId: string; // Referenz zu kontakte.mojo
  // ... weitere Felder
}
```

### Event-Buchung Flow

**Beispiel:** Max (B2C) bucht Event bei Anna (B2B)

```
1. Max (B2C, clerkUserId: "user_abc123") bucht Event bei Anna (B2B, tenantId: "tenant_anna")
   in campus.mojo
   ↓
2. campus.mojo erstellt Buchung:
   {
     buyerClerkUserId: "user_abc123",
     sellerTenantId: "tenant_anna",
     eventId: "event_xyz"
   }
   ↓
3. campus.mojo ruft kontakte.mojo auf (mit sellerTenantId als x-tenant-id Header):
   POST /api/contacts
   {
     clerkUserId: "user_abc123",  // Max's ID - VERBINDUNG!
     tenantId: "tenant_anna",
     name: "Max Mustermann",
     email: "max@example.com",
     source: "campus_event_booking"
   }
   ↓
4. kontakte.mojo erstellt/aktualisiert Kontakt:
   - Wenn Kontakt existiert (gleiche clerkUserId + tenantId) → Update
   - Wenn nicht → Neuer Kontakt
   ↓
5. campus.mojo leitet Zahlung an payments.mojo weiter (mit sellerTenantId als x-tenant-id Header):
   POST /api/payments
   {
     clerkUserId: "user_abc123",  // Max's ID - VERBINDUNG!
     tenantId: "tenant_anna",
     contactId: "contact_xyz",
     amount: 100,
     bookingId: "booking_123"
   }
   ↓
6. payments.mojo erstellt Zahlung:
   - Verknüpft mit Max's clerkUserId
   - In Anna's Tenant
   - Referenziert Kontakt aus kontakte.mojo
```

### Daten-Synchronisation: Real-time Sync (Option A)

**Entscheidung:** Real-time Synchronisation zwischen Systemen.

**Implementierung:**

1. **Bei Änderung in `account.mojo`:**
   - Webhook an alle betroffenen Services
   - Update in `campus.mojo` User-Profil
   - Update in allen B2B Tenants, wo User als Kontakt existiert

2. **Bei Event-Buchung in `campus.mojo`:**
   - Sofortige Synchronisation zu `kontakte.mojo`
   - Sofortige Synchronisation zu `payments.mojo`

3. **Cache-Strategie:**
   - User-Daten werden gecached (TTL: 5 Minuten)
   - Bei Updates: Cache-Invalidierung

**Vorteile:**
- ✅ Immer aktuelle Daten
- ✅ Konsistenz zwischen Systemen
- ✅ Bessere User Experience

**Implementierung:**
```typescript
// account.mojo - Webhook bei User-Update
async function onUserUpdate(userId: string, changes: UserChanges) {
  // 1. Update campus.mojo
  await updateCampusUser(userId, changes);
  
  // 2. Update in allen B2B Tenants, wo User Kontakt ist
  const contacts = await getContactsByClerkUserId(userId);
  for (const contact of contacts) {
    await updateContactInTenant(contact.tenantId, userId, changes);
  }
}
```

### User sieht B2B Tenant-Beziehungen: Mit Consent (Option 2)

**Entscheidung:** User kann seine B2B Tenant-Beziehungen sehen, aber nur mit explizitem Consent.

**Implementierung in `account.mojo`:**

```typescript
interface UserProfile {
  clerkUserId: string;
  b2cMembership: Membership;
  
  // B2B Tenant Beziehungen (nur wenn Consent gegeben)
  b2bRelationships?: Array<{
    tenantId: string;
    tenantName: string;
    role: 'customer' | 'contact';
    since: Date;
    lastInteraction: Date;
  }>;
  
  // Consent-Settings
  consentSettings: {
    showB2bRelationships: boolean; // User muss aktiv zustimmen
    shareB2cMembershipWithB2b: boolean; // Wird nicht verwendet (siehe unten)
  };
}
```

**UI in `account.mojo`:**
```
┌─────────────────────────────────────────────┐
│  Deine B2B Beziehungen                     │
│                                             │
│  ℹ️  Diese Informationen sind privat.      │
│      Aktiviere sie, um zu sehen, bei       │
│      welchen Gesundheitsprofis du Kunde    │
│      bist.                                  │
│                                             │
│  ☐ B2B Beziehungen anzeigen                │
│                                             │
│  [Speichern]                                │
└─────────────────────────────────────────────┘

Nach Aktivierung:
┌─────────────────────────────────────────────┐
│  Deine B2B Beziehungen                     │
│                                             │
│  Du bist Kunde bei:                        │
│  • Anna Schmidt (seit 15.12.2024)          │
│    → 3 Events gebucht                      │
│  • Tom Müller (seit 20.12.2024)            │
│    → 1 Mentoring gebucht                   │
└─────────────────────────────────────────────┘
```

**Privacy-First:**
- ✅ Standard: Aus (Opt-in)
- ✅ User muss explizit zustimmen
- ✅ Klare Information, was angezeigt wird

### B2B Profi sieht B2C Mitgliedschaft: Nein (Option 3)

**Entscheidung:** B2B Profis sehen NICHT die B2C Mitgliedschaft ihrer Kunden.

**Begründung:**
- Privacy-First Ansatz
- B2C Mitgliedschaft ist private Information
- Keine Notwendigkeit für B2B Geschäftsbeziehung

**Implementierung:**
- In `kontakte.mojo` wird `clerkUserId` gespeichert
- Aber: Kein Zugriff auf `campus.mojo` Mitgliedschafts-Daten
- B2B Profi sieht nur:
  - Kontakt-Informationen (Name, Email, etc.)
  - Buchungs-Historie
  - Zahlungs-Historie
  - **NICHT:** B2C Mitgliedschaft, LEBENSENERGIE-Level, etc.

**Ausnahme (nur wenn User explizit teilt):**
- User kann optional in `account.mojo` einstellen: "Teile meine B2C Mitgliedschaft mit B2B Profis"
- Aber: Standard ist "NEIN"

### Technische Integration

#### Service-to-Service Kommunikation

**Tenant-Header bei API-Calls:**
```typescript
// campus.mojo → kontakte.mojo
await fetch('https://kontakte.mojo-institut.de/api/contacts', {
  method: 'POST',
  headers: {
    'x-tenant-id': sellerTenantId, // Anna's Tenant
    'Authorization': `Bearer ${serviceToken}`,
  },
  body: JSON.stringify({
    clerkUserId: userId, // Max's ID
    // ...
  }),
});
```

**Kontakt-Lookup mit clerkUserId:**
```typescript
// kontakte.mojo - Finde Kontakt in Tenant
async function findContactByClerkUserId(
  tenantId: string,
  clerkUserId: string
): Promise<Contact | null> {
  return await prisma.contact.findUnique({
    where: {
      clerkUserId_tenantId: {
        clerkUserId,
        tenantId,
      },
    },
  });
}
```

---

## 9. Implementierungs-Überlegungen

### campus.mojo Multitenancy

**Option 1: Mitgliedschafts-basierte Zugriffskontrolle**
- Alle User in einer DB
- Zugriff über Mitgliedschafts-Level
- Separate Foren/Bereiche per Filter

**Option 2: Tenant-basiert**
- B2C und B2B als separate Tenants
- Events/Mentoring verbindet beide

**Empfehlung:** Option 1 (Mitgliedschafts-basiert), da es eine zentrale Journey ist.

### payments.mojo Multitenancy

- Jede B2B Organization = ein Tenant
- B2C hat keinen Zugang (nur B2B)

### Event/Mentoring-Buchung

**Flow:**
1. B2B User erstellt Event/Mentoring in `campus.mojo`
2. B2C User sieht verfügbare Events
3. B2C User bucht Event
4. **Daten-Synchronisation:**
   - B2C User wird als Kontakt in B2B Tenant angelegt/aktualisiert (`kontakte.mojo`)
   - Real-time Sync mit `clerkUserId` als Verbindung
5. Zahlung geht an B2B Tenant in `payments.mojo`
   - Verknüpft mit `clerkUserId` des B2C Users
6. Platform-Fee (optional) an MOJO

**Details:** Siehe [Event-Buchung Flow](#event-buchung-flow) in Abschnitt 8.

---

## 10. Nächste Schritte

### Dokumentation aktualisieren

- [x] `MOJO_ECOSYSTEM.md` aktualisieren mit B2C/B2B Trennung
- [x] B2C Angebotsmodell detailliert ausgearbeitet → [B2C_OFFER_MODEL.md](./B2C_OFFER_MODEL.md)
- [x] Datenmodell B2C ↔ B2B Verbindung dokumentiert
- [ ] Architektur-Dokumentation für Multitenancy-Ansatz

### Technische Umsetzung

- [ ] `campus.mojo` Multitenancy-Design finalisieren
- [ ] Mitgliedschafts-System designen
- [ ] Event/Mentoring-Buchungssystem planen
- [ ] Integration `campus.mojo` ↔ `payments.mojo` implementieren
- [x] Real-time Sync zwischen `account.mojo` ↔ `campus.mojo` ↔ `kontakte.mojo`
- [ ] Consent-System für B2B Beziehungen in `account.mojo`

### B2C Rollout

- [ ] Onboarding-Wizard implementieren
- [ ] Progressive Feature Freischaltung bauen
- [ ] LEBENSENERGIE Dashboard entwickeln

---

## Referenzen

- **B2C Angebotsmodell:** [B2C_OFFER_MODEL.md](./B2C_OFFER_MODEL.md) – Detailliertes Angebotsmodell für B2C Segment
- **Coding Standards:** [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- **MOJO Ökosystem:** [MOJO_ECOSYSTEM.md](./MOJO_ECOSYSTEM.md)

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.4.0 | 03.01.2026 | Revenue-Modell detailliert: Exakte Zahlen (3.9% + €0.50 Transaction Fee, 70/30 Split), Mitgliedschaften Flow, alle Revenue-Streams dokumentiert |
| 1.3.0 | 03.01.2026 | Platform-Hierarchie dokumentiert: 3-Ebenen-System (MOJO LLC → Regionale Distributoren → Tenants), regionale Campus-Versionen, Zugriffsrechte klar definiert |
| 1.2.0 | 03.01.2026 | Datenmodell B2C ↔ B2B Verbindung dokumentiert: Real-time Sync, Consent für B2B Beziehungen, Privacy-First Ansatz |
| 1.1.0 | 03.01.2026 | B2C Angebotsmodell Referenz hinzugefügt |
| 1.0.0 | 03.01.2026 | Initial Release – Business Model Dokumentation mit Flywheel-System |

---

*MOJO Institut – System für chronische Gesundheit*

