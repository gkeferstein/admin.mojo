'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckCircle2, FileText, DollarSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RegionalDistributorOnboardingPage() {
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(false);

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Globe className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold">Regionaler Distributor</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Werden Sie exklusiver Vertriebspartner für die MOJO Platform-Produkte in Ihrer Region
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mojo-glass-card rounded-xl p-5 text-center">
            <DollarSign className="h-8 w-8 mx-auto text-mojo-green" />
            <h3 className="font-semibold mt-3">30% Provision</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Auf alle Platform-Verkäufe in Ihrer Region
            </p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5 text-center">
            <Shield className="h-8 w-8 mx-auto text-blue-400" />
            <h3 className="font-semibold mt-3">Exklusivität</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Alleinige Vertriebsrechte für Ihre Region
            </p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5 text-center">
            <FileText className="h-8 w-8 mx-auto text-purple-400" />
            <h3 className="font-semibold mt-3">Eigene Produkte</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Verkaufen Sie zusätzlich eigene Produkte
            </p>
          </div>
        </div>

        {/* Contract */}
        <div className="mojo-glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <h2 className="font-semibold">Regionaler Distributionsvertrag</h2>
          </div>
          <div className="p-6 h-80 overflow-y-auto text-sm space-y-4">
            <h3 className="font-bold">1. Vertragsgegenstand</h3>
            <p className="text-muted-foreground">
              Dieser Vertrag regelt die exklusiven Vertriebsrechte für die 6 MOJO Platform-Produkte 
              (User Journey Levels) in der zugewiesenen Region.
            </p>

            <h3 className="font-bold">2. Provisionen</h3>
            <p className="text-muted-foreground">
              Der Distributor erhält 30% Provision auf den Netto-Verkaufspreis aller Platform-Produkte, 
              die an Kunden in der zugewiesenen Region verkauft werden.
            </p>

            <h3 className="font-bold">3. Provisionsdeckelung</h3>
            <p className="text-muted-foreground">
              Sollte der Distributor zusätzlich als Affiliate einen Kunden werben, ist die maximale 
              Provision auf 30% gedeckelt. Es erfolgt keine zusätzliche Affiliate-Provision für 
              Platform-Produkte in der eigenen Region.
            </p>

            <h3 className="font-bold">4. Eigene Produkte</h3>
            <p className="text-muted-foreground">
              Der Distributor kann eigene Produkte über das MOJO Ökosystem verkaufen. 
              Hierfür gilt die Standard-Platform-Fee von 2% über Stripe Connect.
            </p>

            <h3 className="font-bold">5. Zahlungsbedingungen</h3>
            <p className="text-muted-foreground">
              Provisionen werden 30 Tage nach dem Kauf fällig und monatlich ausgezahlt, 
              sofern ein Mindestbetrag von €50 erreicht wurde. Bei Rückerstattungen werden 
              Provisionen entsprechend zurückgebucht.
            </p>

            <h3 className="font-bold">6. Laufzeit</h3>
            <p className="text-muted-foreground">
              Dieser Vertrag hat eine unbefristete Laufzeit und kann von beiden Seiten 
              mit einer Frist von 3 Monaten zum Monatsende gekündigt werden.
            </p>
          </div>
        </div>

        {/* Agreement */}
        <div className="mojo-glass-card rounded-xl p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span className="text-sm">
              Ich habe den Regionalen Distributionsvertrag gelesen und akzeptiere alle Bedingungen.
            </span>
          </label>

          <Button
            size="lg"
            className={cn('w-full gap-2', signed && 'bg-green-600 hover:bg-green-600')}
            disabled={!agreed || signed}
            onClick={() => setSigned(true)}
          >
            {signed ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Vertrag unterzeichnet
              </>
            ) : (
              'Vertrag digital unterzeichnen'
            )}
          </Button>
        </div>

        {signed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold">Willkommen als Regional Distributor!</h2>
            <p className="text-muted-foreground">
              Unser Team wird sich in Kürze mit Ihnen in Verbindung setzen, 
              um die regionalen Details zu besprechen.
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard">Zum Dashboard</a>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

