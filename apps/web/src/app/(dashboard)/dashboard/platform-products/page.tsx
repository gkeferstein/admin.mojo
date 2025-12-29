'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package,
  Edit,
  Zap,
  Users,
  Briefcase,
  Cpu,
  Target,
  Building2,
  Crown,
  Sparkles,
  BookOpen,
  Star,
  Clock,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient, PlatformProduct } from '@/lib/api';

// Icon mapping
const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Zap,
  Users,
  Briefcase,
  Cpu,
  Target,
  Building2,
  Crown,
  Sparkles,
};

export default function PlatformProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<PlatformProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPlatformProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err?.error?.message || err?.message || 'Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-mojo-green" />
          <div>
            <h1 className="text-2xl font-bold">Platform Produkte</h1>
            <p className="text-muted-foreground">
              Die 6 MOJO User Journey Levels
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Lade Produkte...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mojo-glass-card rounded-xl p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Fehler beim Laden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <Button variant="outline" onClick={loadProducts}>
              Erneut laden
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="mojo-glass-card rounded-xl p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Keine Produkte gefunden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Es konnten keine Platform-Produkte geladen werden.
            </p>
            <Button variant="outline" onClick={loadProducts}>
              Erneut laden
            </Button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const IconComponent = ICONS[product.icon] || Zap;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mojo-glass-card rounded-2xl overflow-hidden group relative"
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                      {product.isPopular && (
                        <Badge className="bg-primary text-primary-foreground">BELIEBT</Badge>
                      )}
                      {product.isExclusive && (
                        <Badge className="bg-amber-500 text-black">
                          <Crown className="h-3 w-3 mr-1" />
                          EXKLUSIV
                        </Badge>
                      )}
                      {!product.isActive && (
                        <Badge variant="secondary">INAKTIV</Badge>
                      )}
                    </div>

                    {/* Header with Icon */}
                    <div
                      className="p-6 pb-4"
                      style={{ backgroundColor: `${product.levelColor}20` }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: product.levelColor }}
                        >
                          <IconComponent
                            className="w-7 h-7"
                            style={{ color: product.textColor || '#000' }}
                          />
                        </div>
                        <div>
                          <span
                            className="text-xs font-bold tracking-wider px-2 py-0.5 rounded mb-2 inline-block"
                            style={{
                              backgroundColor: product.levelColor,
                              color: product.textColor || '#000',
                            }}
                          >
                            STUFE {product.userJourneyLevel}
                          </span>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.subtitle || product.levelName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-2 space-y-4">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description || 'Keine Beschreibung'}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <BookOpen className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <div className="text-sm font-bold">{product.modulesCount || '-'}</div>
                          <div className="text-xs text-muted-foreground">Module</div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <Star className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <div className="text-sm font-bold">{product.lessonsCount ? `${product.lessonsCount}+` : '-'}</div>
                          <div className="text-xs text-muted-foreground">Lektionen</div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <div className="text-xs font-bold">{product.duration || '-'}</div>
                          <div className="text-xs text-muted-foreground">Dauer</div>
                        </div>
                      </div>

                      {/* Features Preview */}
                      {product.features && product.features.length > 0 && (
                        <ul className="space-y-1">
                          {(product.features as string[]).slice(0, 3).map((feature, fIndex) => (
                            <li key={fIndex} className="flex items-center gap-2 text-sm">
                              <Check className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                          {(product.features as string[]).length > 3 && (
                            <li className="text-xs text-muted-foreground pl-5">
                              + {(product.features as string[]).length - 3} weitere
                            </li>
                          )}
                        </ul>
                      )}

                      {/* Price & Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          {Number(product.priceNet) === 0 ? (
                            <span className="text-lg font-bold">Auf Anfrage</span>
                          ) : (
                            <>
                              <span className="text-2xl font-bold">
                                €{Number(product.priceNet).toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                              </span>
                              {product.originalPrice && (
                                <span className="ml-2 text-sm text-muted-foreground line-through">
                                  €{Number(product.originalPrice).toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                                </span>
                              )}
                              {product.billingType === 'SUBSCRIPTION' && (
                                <span className="text-muted-foreground text-sm">
                                  /{product.billingInterval === 'MONTHLY' ? 'Mo' : 'Jahr'}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => router.push(`/dashboard/platform-products/${product.id}`)}
                        >
                          <Edit className="h-3 w-3" />
                          Bearbeiten
                        </Button>
                      </div>

                      {/* Entitlements Badge */}
                      {product.entitlements && product.entitlements.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {product.entitlements.length} Entitlement{product.entitlements.length !== 1 ? 's' : ''} konfiguriert
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="mojo-glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">Hinweis</h3>
              <p className="text-sm text-muted-foreground">
                Die Platform-Produkte sind die Basis des MOJO Geschäftsmodells. Änderungen wirken sich auf alle 
                Provisionsberechnungen aus. Die DACH-Region erhält 30% Provision auf alle Platform-Produkt-Verkäufe 
                in Deutschland, Österreich und der Schweiz.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

