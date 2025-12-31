# MOJO Business Model - Vollständige Dokumentation

> **Vertraulich** - Interne Dokumentation für Platform Administration

**Version:** 1.0.0  
**Letzte Aktualisierung:** 29. Dezember 2025

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Akteure im Ökosystem](#2-akteure-im-ökosystem)
3. [Produkt-Hierarchie](#3-produkt-hierarchie)
4. [Provisionsmodell](#4-provisionsmodell)
5. [Regionale Exklusivrechte](#5-regionale-exklusivrechte)
6. [Affiliate-System](#6-affiliate-system)
7. [Provisions-Berechnung](#7-provisions-berechnung)
8. [Technische Umsetzung](#8-technische-umsetzung)
9. [Vertragswerke](#9-vertragswerke)
10. [FAQ](#10-faq)

---

## 1. Executive Summary

Das MOJO Ökosystem ist ein **Multi-Tenant Commerce System** für chronische Gesundheit. Die Monetarisierung erfolgt über:

1. **Platform-Produkte** - 6 User Journey Levels (Verkäufer: MOJO LLC)
2. **Tenant-Produkte** - Individuelle Produkte der Partner (Verkäufer: jeweiliger Tenant)
3. **Regionale Exklusivrechte** - Vertriebspartner für definierte Regionen
4. **Affiliate-Provisionen** - Vermittlungsprovisionen für Neukunden

### Umsatzströme der MOJO LLC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MOJO LLC Einnahmen                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Platform-Produkte (6 Levels)                                             │
│    └─ Netto-Umsatz abzüglich Provisionen (Regional + Affiliate)             │
│                                                                             │
│ 2. Stripe Connect Fee (2%)                                                  │
│    └─ Von allen Tenant-Verkäufen                                            │
│                                                                             │
│ 3. Subscription Fees (optional, zukünftig)                                  │
│    └─ Monatliche Gebühr für Tenant-Zugang                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Akteure im Ökosystem

### 2.1 Platform Owner: MOJO LLC

| Attribut | Wert |
|----------|------|
| **Rolle** | Besitzer der Platform und Inhalte |
| **Eigentum** | MOJO Campus Inhalte, Software-Architektur |
| **Verkauft** | Die 6 Platform-Produkte (User Journey Levels) |
| **Erhält** | Netto nach Provisionen + 2% von Tenant-Verkäufen |

### 2.2 Regional Distributor: z.B. MOJO GmbH

| Attribut | Wert |
|----------|------|
| **Rolle** | Exklusiver Vertriebspartner für Region |
| **Region** | DACH (Deutschland, Österreich, Schweiz) |
| **Provision** | 30% auf alle Platform-Produkte in der Region |
| **Eigene Produkte** | Kann eigene Produkte verkaufen (Events, etc.) |

### 2.3 Tenant (Affiliate/Partner)

| Attribut | Wert |
|----------|------|
| **Rolle** | Affiliate-Partner und/oder eigener Verkäufer |
| **Provision Erstkauf** | 20% vom Netto |
| **Provision Folgekauf** | 10% vom Netto (3 Jahre Attribution) |
| **Eigene Produkte** | Kann eigene Produkte verkaufen |

### 2.4 Kunde (End-User)

| Attribut | Wert |
|----------|------|
| **Region** | Bestimmt durch Rechnungsadresse |
| **Attribution** | Zum werbenden Affiliate (3 Jahre) |
| **Erstkauf** | Erster Kauf im gesamten MOJO Ökosystem |

---

## 3. Produkt-Hierarchie

### 3.1 Platform-Produkte (6 User Journey Levels)

Diese Produkte werden von der **MOJO LLC** verkauft und definieren die User Journey:

| Level | Name | Preis (Beispiel) | Beschreibung |
|-------|------|------------------|--------------|
| 1 | **LEBENSENERGIE** | 0€ - 99€ | Finde dein MOJO (wieder) |
| 2 | **CAMPUS** | 299€ | Vernetze dich und optimiere deine Regeneration |
| 3 | **BUSINESS BOOTCAMP** | 999€ | Starte dein eigenes Gesundheitsbusiness |
| 4 | **RegenerationsmedizinOS** | 2.999€ | Das Betriebssystem für chronische Gesundheit |
| 5 | **Praxiszirkel** | 4.999€ | Behandle Menschen unter Fachleuten |
| 6 | **MOJO Inkubator** | 9.999€ | Eröffne dein eigenes MOJO Institut |

**Kennzeichen:** `is_platform_product: true`

### 3.2 Tenant-Produkte

Jeder Tenant kann eigene Produkte anlegen:

- Event-Tickets
- Workshops
- Beratungen
- Physische Produkte
- Eigene digitale Kurse

**Verkäufer:** Der jeweilige Tenant  
**Platform-Anteil:** 2% via Stripe Connect

---

## 4. Provisionsmodell

### 4.1 Übersicht der Provisionstypen

| Typ | Empfänger | Prozent | Basis | Bedingung |
|-----|-----------|---------|-------|-----------|
| **Regional Exclusive** | Regional Distributor | 30% | Netto | Nur Platform-Produkte, nur in Region |
| **Affiliate Erst** | Werbender Tenant | 20% | Netto | Erstkauf im Ökosystem |
| **Affiliate Folge** | Werbender Tenant | 10% | Netto | Folgekäufe (3 Jahre) |
| **Platform Fee** | MOJO LLC | 2% | Netto | Alle Tenant-Produkte |

### 4.2 Provisions-Berechnung (Beispiel)

**Szenario: DACH-Kunde kauft Level 3 (1000€ netto), geworben von Tenant 2**

```
Brutto:                               1.190€ (inkl. 19% MwSt)
Netto (Berechnungsbasis):             1.000€

Provisionen:
├── MOJO GmbH (DACH 30%):               300€
└── Tenant 2 (Affiliate Erst 20%):      200€
                                      ──────
Summe Provisionen:                      500€
MOJO LLC behält:                        500€
```

### 4.3 Deckelungsregeln

| Regel | Beschreibung |
|-------|--------------|
| **Max 30% Regional** | Regional Distributor kann max. 30% erhalten |
| **Kein Selbst-Aufschlag** | Regional Distributor kann nicht eigenen Affiliate-Code nutzen, um mehr als 30% zu erhalten |
| **Selbstkauf = Rabatt** | Wenn Tenant eigene Platform-Produkte kauft, ist Provision = Rabatt |

---

## 5. Regionale Exklusivrechte

### 5.1 Konzept

Ein **Regional Distributor** erhält exklusive Vertriebsrechte für eine definierte Region. Er ist verantwortlich für Marketing und Vertrieb in dieser Region und erhält dafür eine feste Provision auf alle Platform-Produkte.

### 5.2 Aktuelle Regionen

| Region | ISO-Codes | Distributor | Provision | Status |
|--------|-----------|-------------|-----------|--------|
| **DACH** | DE, AT, CH | MOJO GmbH | 30% | Aktiv |
| *US* | US | *TBD* | *TBD* | Geplant |
| *APAC* | *TBD* | *TBD* | *TBD* | Geplant |

### 5.3 Region-Erkennung

Die Region eines Kunden wird bestimmt durch:

1. **Rechnungsadresse** (primär)
2. Bei fehlendem Address: Erste Kauf-Adresse gilt

### 5.4 Besonderheiten

| Regel | Beschreibung |
|-------|--------------|
| **Nur Platform-Produkte** | Regional-Provision gilt NUR für Platform-Produkte |
| **Unabhängig von Affiliate** | DACH-Provision wird immer gezahlt, auch ohne Affiliate |
| **Nicht additiv für Self** | Regional Distributor kann nicht DACH + Affiliate auf selbem Kunden |

---

## 6. Affiliate-System

### 6.1 Attribution

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Customer Attribution Flow                          │
├──────────────────────────────────────────────────────────────────────────┤
│ 1. User klickt Affiliate-Link (enthält Affiliate-Code)                   │
│    └─ Cookie wird gesetzt (30 Tage Laufzeit)                             │
│                                                                          │
│ 2. User erstellt Konto (auch kostenloser Trial)                          │
│    └─ Attribution wird PERMANENT gespeichert                             │
│    └─ Cookie-Affiliate wird zum "Owner" für 3 Jahre                      │
│                                                                          │
│ 3. Alle Käufe in 3 Jahren → Provision an diesen Affiliate                │
│    └─ Erstkauf: 20%                                                      │
│    └─ Folgekäufe: 10%                                                    │
│                                                                          │
│ 4. Nach 3 Jahren: Kunde ist "frei"                                       │
│    └─ Keine weiteren Provisionen                                         │
│    └─ Kann theoretisch neu zugeordnet werden                             │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Attribution-Regeln

| Regel | Beschreibung |
|-------|--------------|
| **First Click Wins** | Der erste Affiliate-Code gewinnt |
| **Cookie: 30 Tage** | Gültigkeit des Tracking-Cookies |
| **Permanente Zuordnung** | Einmal zugeordnet = 3 Jahre fest |
| **Erstkauf-Definition** | Erster bezahlter ODER kostenloser Account |
| **Subscription Renewals** | Zählen als Folgekäufe (10%) |

### 6.3 Provisionsauszahlung

| Parameter | Wert |
|-----------|------|
| **Wartezeit** | 30 Tage nach Kauf (Refund-Frist) |
| **Auszahlungsrhythmus** | Monatlich |
| **Mindestbetrag** | 50€ |
| **Methode** | Stripe Connect |
| **Bei Refund** | Provision wird zurückgebucht |

### 6.4 Affiliate-Deaktivierung

Wenn ein Affiliate-Partner (Tenant) die Platform verlässt:

1. Offene, genehmigte Provisionen werden ausgezahlt
2. Pending Provisionen verfallen
3. Bestehende Attributionen verfallen (Kunden werden "frei")

---

## 7. Provisions-Berechnung

### 7.1 Algorithmus

```
Bei jedem Kauf:
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. PRÜFE: Ist es ein Platform-Produkt?                                  │
│    ├─ JA → Weiter zu Schritt 2                                          │
│    └─ NEIN → Springe zu Schritt 3 (Tenant-Produkt)                      │
│                                                                         │
│ 2. PRÜFE: Regional Exclusive (nur bei Platform-Produkten)               │
│    ├─ Hole Rechnungsadresse des Kunden                                  │
│    ├─ Prüfe ob Region in regional_agreements                            │
│    └─ JA → Addiere Regional-Provision (z.B. 30% DACH)                   │
│                                                                         │
│ 3. PRÜFE: Affiliate-Attribution                                         │
│    ├─ Hat Kunde gültige Attribution (< 3 Jahre)?                        │
│    ├─ JA → Ist es Erstkauf im Ökosystem?                                │
│    │       ├─ JA → 20% Affiliate-Provision                              │
│    │       └─ NEIN → 10% Affiliate-Provision                            │
│    └─ NEIN → Keine Affiliate-Provision                                  │
│                                                                         │
│ 4. BERECHNE: Verbleibend für Verkäufer                                  │
│    ├─ Platform-Produkt → MOJO LLC behält Rest                           │
│    └─ Tenant-Produkt → Tenant behält Rest - 2% Platform Fee             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Beispiel-Szenarien

#### Szenario A: Platform-Produkt, DACH, mit Affiliate

```
Produkt: Level 3 (1000€ netto)
Verkäufer: MOJO LLC
Kunde: Deutschland
Affiliate: Tenant 2
Kauftyp: Erstkauf

Berechnung:
├── DACH (30%):        300€ → MOJO GmbH
├── Affiliate (20%):   200€ → Tenant 2
└── Rest (50%):        500€ → MOJO LLC
```

#### Szenario B: Platform-Produkt, DACH, ohne Affiliate

```
Produkt: Level 3 (1000€ netto)
Verkäufer: MOJO LLC
Kunde: Deutschland
Affiliate: Keiner
Kauftyp: Erstkauf

Berechnung:
├── DACH (30%):        300€ → MOJO GmbH
├── Affiliate:           0€
└── Rest (70%):        700€ → MOJO LLC
```

#### Szenario C: Platform-Produkt, USA, mit Affiliate

```
Produkt: Level 3 (1000€ netto)
Verkäufer: MOJO LLC
Kunde: USA
Affiliate: Tenant 2
Kauftyp: Folgekauf

Berechnung:
├── Regional:            0€ (keine US-Vereinbarung)
├── Affiliate (10%):   100€ → Tenant 2
└── Rest (90%):        900€ → MOJO LLC
```

#### Szenario D: Tenant-Produkt, mit Affiliate

```
Produkt: Event-Ticket (100€ netto)
Verkäufer: MOJO GmbH (Tenant)
Kunde: Deutschland
Affiliate: Tenant 2
Kauftyp: Folgekauf

Berechnung:
├── Regional:            0€ (nur für Platform-Produkte)
├── Platform Fee (2%):   2€ → MOJO LLC
├── Affiliate (10%):    10€ → Tenant 2
└── Rest (88%):         88€ → MOJO GmbH
```

#### Szenario E: MOJO GmbH kauft selbst Platform-Produkt

```
Produkt: Level 5 (5000€ netto)
Verkäufer: MOJO LLC
Kunde: MOJO GmbH (Deutschland)
Affiliate: -

Berechnung:
├── DACH (30%):       1500€ → MOJO GmbH (= Rabatt)
└── Rest (70%):       3500€ → MOJO LLC

Effektiver Preis für MOJO GmbH: 3500€
```

---

## 8. Technische Umsetzung

### 8.1 Datenmodell

#### Platform-Produkte

```sql
products
├── id: UUID
├── tenant_id: UUID | NULL      -- NULL = Platform-Produkt
├── is_platform_product: BOOLEAN
├── name: VARCHAR
├── price_net: DECIMAL
├── user_journey_level: INTEGER  -- 1-6 für Platform-Produkte
└── ...
```

#### Regionale Vereinbarungen

```sql
regional_agreements
├── id: UUID
├── tenant_id: UUID             -- Regional Distributor
├── region_codes: VARCHAR[]     -- ['DE', 'AT', 'CH']
├── commission_percent: DECIMAL -- 30
├── applies_to: ENUM            -- 'platform_products'
├── valid_from: DATE
├── valid_until: DATE | NULL
├── contract_signed_at: TIMESTAMP
├── contract_document_url: VARCHAR
└── created_at: TIMESTAMP
```

#### Customer Attribution (Platform-weit)

```sql
customer_attributions
├── id: UUID
├── customer_user_id: VARCHAR   -- Clerk User ID
├── attributed_tenant_id: UUID  -- Wer hat geworben
├── attributed_at: TIMESTAMP    -- Wann zugeordnet
├── first_purchase_at: TIMESTAMP -- Erstkauf-Datum
├── attribution_expires_at: TIMESTAMP -- attributed_at + 3 Jahre
├── source: ENUM                -- 'affiliate_code', 'referral', 'direct'
├── source_ref: VARCHAR         -- z.B. Affiliate-Code
└── created_at: TIMESTAMP
```

#### Provisions-Berechnung

```sql
order_commissions
├── id: UUID
├── order_id: UUID
├── commission_type: ENUM       -- 'regional_exclusive', 'affiliate_first', 'affiliate_recurring', 'platform_fee'
├── recipient_tenant_id: UUID | NULL -- NULL = MOJO LLC
├── percent: DECIMAL
├── amount: DECIMAL
├── status: ENUM                -- 'pending', 'approved', 'paid', 'refunded'
├── approved_at: TIMESTAMP
├── paid_at: TIMESTAMP
└── created_at: TIMESTAMP
```

### 8.2 API Endpoints

#### Platform Admin API (admin.mojo)

```
GET    /api/v1/regional-agreements       -- Alle Vereinbarungen
POST   /api/v1/regional-agreements       -- Neue Vereinbarung
GET    /api/v1/regional-agreements/:id   -- Details
PATCH  /api/v1/regional-agreements/:id   -- Aktualisieren
DELETE /api/v1/regional-agreements/:id   -- Deaktivieren

GET    /api/v1/platform-products         -- Alle Platform-Produkte
POST   /api/v1/platform-products         -- Neues Platform-Produkt
PATCH  /api/v1/platform-products/:id     -- Aktualisieren

GET    /api/v1/customer-attributions     -- Alle Attributionen
GET    /api/v1/customer-attributions/:userId -- Attribution eines Kunden

GET    /api/v1/commissions               -- Alle Provisionen
GET    /api/v1/commissions/pending       -- Ausstehende Auszahlungen
POST   /api/v1/commissions/payout        -- Sammel-Auszahlung triggern
```

#### Payments API Erweiterung (payments.mojo)

```
GET    /api/v1/orders/:id/commissions    -- Provisionen einer Order
POST   /api/v1/internal/calculate-commissions -- Kommissionen berechnen
```

### 8.3 Prozessflüsse

#### Onboarding Regional Distributor

```
1. Admin erstellt Einladung in admin.mojo
2. Regional Distributor erhält Link
3. Onboarding-Seite erklärt Modell
4. Vertrag wird angezeigt
5. Distributor akzeptiert elektronisch
6. Tenant wird erstellt mit regional_agreement
7. Stripe Connect Onboarding
8. Aktivierung
```

#### Onboarding Tenant/Affiliate

```
1. Interessent registriert sich
2. Onboarding-Seite erklärt Affiliate-Modell
3. Vertrag wird angezeigt
4. Akzeptanz
5. Tenant wird erstellt
6. Affiliate-Code generiert
7. Stripe Connect Onboarding (für Auszahlungen)
8. Dashboard-Zugang
```

#### Kaufprozess mit Provision

```
1. Kunde kauft Produkt
2. Order wird erstellt
3. Commission Calculator wird aufgerufen
   a. Prüfe Platform-Produkt
   b. Prüfe Regional Agreement (bei Platform)
   c. Prüfe Customer Attribution
   d. Berechne alle Provisionen
4. Provisionen werden als 'pending' gespeichert
5. Nach 30 Tagen: Status → 'approved'
6. Monatlich: Payout-Job sammelt approved ≥ 50€
7. Stripe Connect Transfer
8. Status → 'paid'
```

---

## 9. Vertragswerke

### 9.1 Regional Distributor Vertrag

Wesentliche Punkte:
- Exklusive Vertriebsrechte für definierte Region
- Provisionssatz und Berechnungsbasis
- Laufzeit und Kündigungsfristen
- Marketing-Verpflichtungen
- Qualitätsstandards
- Datenschutz
- Haftung

### 9.2 Tenant/Affiliate Vertrag

Wesentliche Punkte:
- Affiliate-Provisionen (20% / 10%)
- Cookie-Laufzeit und Attribution
- 3-Jahres-Bindung
- Auszahlungsbedingungen
- Werberichtlinien
- Verbotene Praktiken
- Kündigung und Folgen

---

## 10. FAQ

### Allgemein

**Q: Kann ein Tenant gleichzeitig Regional Distributor sein?**  
A: Ja, wie z.B. MOJO GmbH. Der Tenant hat dann sowohl regionale Provision als auch einen Affiliate-Code für andere Regionen.

**Q: Was passiert wenn ein Kunde umzieht?**  
A: Es gilt immer die aktuelle Rechnungsadresse beim Kauf.

**Q: Kann ein Kunde seine Attribution ändern?**  
A: Nein, die Attribution ist für 3 Jahre fix. Nur Support kann in Ausnahmefällen eingreifen.

### Provisionen

**Q: Werden Provisionen von Brutto oder Netto berechnet?**  
A: Immer vom Netto (ohne MwSt, ohne Stripe-Gebühren).

**Q: Was passiert bei Teil-Refund?**  
A: Provisionen werden anteilig zurückgebucht.

**Q: Kann ein Affiliate auf seine eigenen Käufe Provision bekommen?**  
A: Bei Tenant-Produkten ja (als Rabatt). Bei Platform-Produkten nur im Rahmen der Regional-Provision (30% Deckel).

### Technisch

**Q: Wie wird die Region erkannt?**  
A: Über die Rechnungsadresse (ISO Country Code).

**Q: Was wenn keine Adresse vorhanden ist?**  
A: DACH-Provision wird erst bei erstem Kauf mit Adresse relevant.

**Q: Wie wird Attribution getrackt?**  
A: Cookie (30 Tage) → Bei Account-Erstellung permanent gespeichert.

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.0.0 | 29.12.2025 | Initial Release |

---

*MOJO Institut – System für chronische Gesundheit*




