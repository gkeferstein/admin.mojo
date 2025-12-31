'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, DollarSign, ShoppingBag, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TenantOnboardingPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mojo-green/10 border border-mojo-green/20">
            <Users className="h-8 w-8 text-mojo-green" />
          </div>
          <h1 className="text-3xl font-bold">Tenant & Affiliate Partner</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Werden Sie Teil des MOJO Ökosystems und profitieren Sie vom Affiliate-Programm
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mojo-glass-card rounded-xl p-5 text-center">
            <Megaphone className="h-8 w-8 mx-auto text-green-400" />
            <h3 className="font-semibold mt-3">20% Erstprovision</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Für den ersten Kauf eines von Ihnen geworbenen Kunden
            </p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5 text-center">
            <DollarSign className="h-8 w-8 mx-auto text-yellow-400" />
            <h3 className="font-semibold mt-3">10% Folgeprovision</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Für alle weiteren Käufe innerhalb von 3 Jahren
            </p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-purple-400" />
            <h3 className="font-semibold mt-3">Eigene Produkte</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Verkaufen Sie Ihre Produkte über das MOJO System
            </p>
          </div>
        </div>

        {/* Contract */}
        <div className="mojo-glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <h2 className="font-semibold">Tenant & Affiliate Vereinbarung</h2>
          </div>
          <div className="p-6 h-80 overflow-y-auto text-sm space-y-4">
            <h3 className="font-bold">1. Affiliate-Programm</h3>
            <p className="text-muted-foreground">
              Als Affiliate-Partner erhalten Sie einen persönlichen Empfehlungscode, mit dem Sie neue 
              Kunden für das MOJO Ökosystem werben können.
            </p>

            <h3 className="font-bold">2. Provisionsstruktur</h3>
            <p className="text-muted-foreground">
              <strong>Erstkauf:</strong> 20% des Netto-Verkaufspreises für den ersten Kauf eines 
              von Ihnen geworbenen Neukunden im gesamten MOJO Ökosystem.<br />
              <strong>Folgekäufe:</strong> 10% des Netto-Verkaufspreises für alle weiteren Käufe 
              desselben Kunden innerhalb von 3 Jahren ab Kontoeröffnung.
            </p>

            <h3 className="font-bold">3. Attribution</h3>
            <p className="text-muted-foreground">
              Die Attribution erfolgt nach dem "First Click Wins"-Prinzip. Der erste verwendete 
              Affiliate-Code wird dem Kunden dauerhaft (für 3 Jahre) zugeordnet.
            </p>

            <h3 className="font-bold">4. Provisionsquelle</h3>
            <p className="text-muted-foreground">
              Provisionen werden immer vom Verkäufer des Produkts gezahlt. Bei Platform-Produkten 
              ist dies die MOJO LLC, bei Tenant-Produkten der jeweilige Tenant.
            </p>

            <h3 className="font-bold">5. Eigene Produkte</h3>
            <p className="text-muted-foreground">
              Als Tenant können Sie eigene Produkte (z.B. Events, Kurse) über das MOJO Ökosystem 
              verkaufen. Hierfür fällt eine Platform-Fee von 2% über Stripe Connect an.
            </p>

            <h3 className="font-bold">6. Zahlungsbedingungen</h3>
            <p className="text-muted-foreground">
              Provisionen werden 30 Tage nach dem Kauf fällig und monatlich ausgezahlt, 
              sofern ein Mindestbetrag von €50 erreicht wurde.
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
              Ich habe die Tenant & Affiliate Vereinbarung gelesen und akzeptiere alle Bedingungen.
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
                Vereinbarung akzeptiert
              </>
            ) : (
              'Vereinbarung akzeptieren'
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
            <h2 className="text-xl font-bold">Willkommen im MOJO Ökosystem!</h2>
            <p className="text-muted-foreground">
              Ihr persönlicher Affiliate-Code wird in Kürze generiert. 
              Sie können nun Ihre eigenen Produkte anlegen.
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




