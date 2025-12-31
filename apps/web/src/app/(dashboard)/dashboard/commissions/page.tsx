'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CommissionsPage() {
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
            <DollarSign className="h-8 w-8 text-mojo-green" />
            <div>
              <h1 className="text-2xl font-bold">Provisionen</h1>
              <p className="text-muted-foreground">
                Übersicht aller berechneten Provisionen
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mojo-glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Diesen Monat</p>
            <p className="text-3xl font-bold mt-2">€24.580</p>
            <div className="flex items-center gap-1 mt-2 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+12% vs. Vormonat</span>
            </div>
          </div>
          <div className="mojo-glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Ausstehend</p>
            <p className="text-3xl font-bold mt-2">€8.340</p>
            <p className="text-sm text-muted-foreground mt-2">
              Wartezeit: 30 Tage
            </p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Ausgezahlt (YTD)</p>
            <p className="text-3xl font-bold mt-2">€142.850</p>
            <p className="text-sm text-muted-foreground mt-2">
              An 45 Partner
            </p>
          </div>
        </div>

        {/* Commission Types */}
        <div className="mojo-glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">Provisionstypen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-400">DACH Exklusiv</p>
              <p className="text-2xl font-bold mt-1">30%</p>
              <p className="text-xs text-muted-foreground mt-2">Platform-Produkte in DE/AT/CH</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400">Affiliate Erstverkauf</p>
              <p className="text-2xl font-bold mt-1">20%</p>
              <p className="text-xs text-muted-foreground mt-2">Erster Kauf eines Neukunden</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">Affiliate Folgekäufe</p>
              <p className="text-2xl font-bold mt-1">10%</p>
              <p className="text-xs text-muted-foreground mt-2">3 Jahre ab Erstregistrierung</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-400">Platform Fee</p>
              <p className="text-2xl font-bold mt-1">2%</p>
              <p className="text-xs text-muted-foreground mt-2">Stripe Connect für Tenant-Sales</p>
            </div>
          </div>
        </div>

        {/* Placeholder Table */}
        <div className="mojo-glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">Letzte Provisionen</h3>
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Provisionen in diesem Zeitraum</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




