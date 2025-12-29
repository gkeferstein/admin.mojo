'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Package,
  DollarSign,
  CreditCard,
  Users,
  ScrollText,
  TrendingUp,
  ArrowRight,
  Activity,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const stats = [
  {
    label: 'Aktive Tenants',
    value: '127',
    change: '+12%',
    trend: 'up',
    icon: Users,
  },
  {
    label: 'Provisionen (MTD)',
    value: '€24.580',
    change: '+8%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    label: 'Ausstehende Auszahlungen',
    value: '€8.340',
    change: '5 Tenants',
    trend: 'neutral',
    icon: CreditCard,
  },
  {
    label: 'Regionale Verträge',
    value: '3',
    change: 'DACH, UK, US',
    trend: 'neutral',
    icon: FileText,
  },
];

const quickActions = [
  {
    href: '/dashboard/regional-agreements',
    label: 'Regionale Verträge',
    description: 'Exklusive Distributionsrechte verwalten',
    icon: FileText,
    color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    href: '/dashboard/platform-products',
    label: 'Platform Produkte',
    description: 'Die 6 MOJO User Journey Levels',
    icon: Package,
    color: 'from-green-500/20 to-green-600/20 border-green-500/30',
    iconColor: 'text-green-400',
  },
  {
    href: '/dashboard/commissions',
    label: 'Provisionen',
    description: 'Affiliate & DACH Provisionen einsehen',
    icon: DollarSign,
    color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    iconColor: 'text-yellow-400',
  },
  {
    href: '/dashboard/payouts',
    label: 'Auszahlungen',
    description: 'Monatliche Auszahlungen an Partner',
    icon: CreditCard,
    color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  {
    href: '/dashboard/customer-attributions',
    label: 'Kunden-Attributionen',
    description: 'First Click Wins Tracking',
    icon: Users,
    color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
    iconColor: 'text-cyan-400',
  },
  {
    href: '/dashboard/audit',
    label: 'Audit Logs',
    description: 'Alle Systemaktionen protokolliert',
    icon: ScrollText,
    color: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    iconColor: 'text-gray-400',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-mojo-green" />
            <h1 className="text-3xl font-bold tracking-tight">Platform Admin</h1>
          </div>
          <p className="text-muted-foreground">
            Willkommen im MOJO Platform Administration Dashboard. Verwalten Sie Provisionen, Verträge und Auszahlungen.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="mojo-glass-card p-5 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-mojo-green/10">
                  <stat.icon className="h-5 w-5 text-mojo-green" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
                {stat.trend === 'neutral' && <Activity className="h-4 w-4 text-muted-foreground" />}
                <span className={cn(
                  'text-sm',
                  stat.trend === 'up' ? 'text-green-400' : 'text-muted-foreground'
                )}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  'group relative overflow-hidden rounded-xl border p-5 transition-all hover:scale-[1.02]',
                  'bg-gradient-to-br backdrop-blur-sm',
                  action.color
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2 rounded-lg bg-black/20', action.iconColor)}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-white transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Onboarding Section */}
        <motion.div variants={item} className="mojo-glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Partner Onboarding</h2>
              <p className="text-muted-foreground mt-1">
                Neue regionale Distributoren oder Affiliate-Partner einladen
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/onboarding/tenant">
                  Tenant einladen
                </Link>
              </Button>
              <Button asChild>
                <Link href="/onboarding/regional-distributor">
                  Regional Distributor
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

