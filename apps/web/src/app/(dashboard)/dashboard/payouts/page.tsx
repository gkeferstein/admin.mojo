'use client';

import { motion } from 'framer-motion';
import { CreditCard, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PayoutsPage() {
  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-mojo-green" />
            <div>
              <h1 className="text-2xl font-bold">Auszahlungen</h1>
              <p className="text-muted-foreground">
                Verwalten Sie Partner-Auszahlungen
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Auszahlung erstellen
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mojo-glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold">€8.340</p>
              </div>
            </div>
          </div>
          <div className="mojo-glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verarbeitet (Monat)</p>
                <p className="text-2xl font-bold">€15.670</p>
              </div>
            </div>
          </div>
          <div className="mojo-glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                <p className="text-2xl font-bold">€0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mojo-glass-card rounded-xl p-6 border-l-4 border-l-mojo-green">
          <h3 className="font-semibold">Auszahlungsregeln</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Mindestbetrag: €50</li>
            <li>• Wartezeit: 30 Tage nach Kauf</li>
            <li>• Auszahlung: Monatlich via Stripe Connect</li>
            <li>• Bei Refunds werden Provisionen zurückgebucht</li>
          </ul>
        </div>

        {/* Placeholder Table */}
        <div className="mojo-glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">Letzte Auszahlungen</h3>
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Auszahlungen in diesem Zeitraum</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




