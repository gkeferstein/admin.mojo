'use client';

import { motion } from 'framer-motion';
import { Users, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerAttributionsPage() {
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
            <Users className="h-8 w-8 text-mojo-green" />
            <div>
              <h1 className="text-2xl font-bold">Kunden-Attributionen</h1>
              <p className="text-muted-foreground">
                First Click Wins - Affiliate-Zuordnung
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Suchen
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mojo-glass-card rounded-xl p-6 border-l-4 border-l-cyan-500">
          <h3 className="font-semibold">Attribution-Regeln</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• <strong>First Click Wins:</strong> Der erste Affiliate-Code wird dauerhaft zugeordnet</li>
            <li>• <strong>Gültigkeit:</strong> 3 Jahre ab Kontoeröffnung des Kunden</li>
            <li>• <strong>Erstkauf:</strong> 20% Provision</li>
            <li>• <strong>Folgekäufe:</strong> 10% Provision (innerhalb der 3 Jahre)</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mojo-glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Zugeordnete Kunden</p>
            <p className="text-3xl font-bold mt-2">1.847</p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Aktive Attributionen</p>
            <p className="text-3xl font-bold mt-2">1.523</p>
            <p className="text-sm text-muted-foreground mt-2">Noch nicht abgelaufen</p>
          </div>
          <div className="mojo-glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Top Affiliate</p>
            <p className="text-xl font-bold mt-2">MOJO GmbH</p>
            <p className="text-sm text-muted-foreground mt-2">342 Kunden</p>
          </div>
        </div>

        {/* Placeholder Table */}
        <div className="mojo-glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">Letzte Attributionen</h3>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Attributionen in diesem Zeitraum</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




