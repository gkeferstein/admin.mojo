'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, Globe, Percent, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegionalAgreementsPage() {
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
            <FileText className="h-8 w-8 text-mojo-green" />
            <div>
              <h1 className="text-2xl font-bold">Regionale Verträge</h1>
              <p className="text-muted-foreground">
                Exklusive Vertriebsrechte für Platform-Produkte
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neuer Vertrag
          </Button>
        </div>

        {/* Agreements List */}
        <div className="grid gap-4">
          {/* DACH Agreement Card */}
          <div className="mojo-glass-card rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">DACH Region</h3>
                  <p className="text-sm text-muted-foreground">
                    Deutschland, Österreich, Schweiz
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400">
                      Aktiv
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                      DE, AT, CH
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">30%</span>
                  <span className="text-muted-foreground">Provision</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Seit 01.01.2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for more agreements */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium">Weitere Regionen hinzufügen</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Erstellen Sie neue regionale Vertriebsvereinbarungen
            </p>
            <Button variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Region hinzufügen
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

