'use client';

import { motion } from 'framer-motion';
import { ScrollText, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditPage() {
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
            <ScrollText className="h-8 w-8 text-mojo-green" />
            <div>
              <h1 className="text-2xl font-bold">Audit Logs</h1>
              <p className="text-muted-foreground">
                Vollständige Protokollierung aller Systemaktionen
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
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

        {/* Filter Options */}
        <div className="mojo-glass-card rounded-xl p-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm">Alle</Button>
          <Button variant="ghost" size="sm">Verträge</Button>
          <Button variant="ghost" size="sm">Produkte</Button>
          <Button variant="ghost" size="sm">Provisionen</Button>
          <Button variant="ghost" size="sm">Auszahlungen</Button>
          <Button variant="ghost" size="sm">Attributionen</Button>
        </div>

        {/* Placeholder Table */}
        <div className="mojo-glass-card rounded-xl p-6">
          <div className="text-center py-12 text-muted-foreground">
            <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Audit-Einträge verfügbar</p>
            <p className="text-sm mt-2">Aktionen werden automatisch protokolliert</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

