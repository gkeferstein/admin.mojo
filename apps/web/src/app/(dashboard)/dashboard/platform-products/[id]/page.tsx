'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Package,
  Palette,
  DollarSign,
  BookOpen,
  Settings,
  Shield,
  Plus,
  X,
  Loader2,
  Check,
  AlertCircle,
  Zap,
  Users,
  Briefcase,
  Cpu,
  Target,
  Building2,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  apiClient,
  PlatformProduct,
  ProductEntitlement,
  EntitlementDefinition,
  CharLimits,
  BillingType,
  BillingInterval,
} from '@/lib/api';

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

const ICON_OPTIONS = Object.keys(ICONS);

const DEFAULT_CHAR_LIMITS: CharLimits = {
  name: 30,
  subtitle: 40,
  description: 500,
  duration: 20,
  feature: 60,
};

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // State
  const [product, setProduct] = useState<PlatformProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [charLimits, setCharLimits] = useState<CharLimits>(DEFAULT_CHAR_LIMITS);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'content' | 'entitlements'>('basic');
  
  // Entitlements state
  const [entitlementRegistry, setEntitlementRegistry] = useState<EntitlementDefinition[]>([]);
  const [showEntitlementDialog, setShowEntitlementDialog] = useState(false);
  const [selectedEntitlement, setSelectedEntitlement] = useState<string | null>(null);
  const [addingEntitlement, setAddingEntitlement] = useState(false);
  const [removingEntitlement, setRemovingEntitlement] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<PlatformProduct>>({});
  const [newFeature, setNewFeature] = useState('');

  // Load product
  const loadProduct = useCallback(async () => {
    // Check if it's a default product ID
    if (productId.startsWith('default-')) {
      // Need to seed first
      try {
        await apiClient.seedPlatformProducts();
        // Reload after seeding
        const products = await apiClient.getPlatformProducts();
        const level = parseInt(productId.replace('default-', ''), 10);
        const seededProduct = products.find(p => p.userJourneyLevel === level);
        if (seededProduct) {
          router.replace(`/dashboard/platform-products/${seededProduct.id}`);
          return;
        }
      } catch (seedError: any) {
        // Products may already exist
        const products = await apiClient.getPlatformProducts();
        const level = parseInt(productId.replace('default-', ''), 10);
        const existingProduct = products.find(p => p.userJourneyLevel === level);
        if (existingProduct) {
          router.replace(`/dashboard/platform-products/${existingProduct.id}`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPlatformProduct(productId);
      setProduct(data);
      setFormData({
        name: data.name,
        subtitle: data.subtitle,
        description: data.description,
        levelColor: data.levelColor,
        textColor: data.textColor,
        icon: data.icon,
        priceNet: data.priceNet,
        originalPrice: data.originalPrice,
        billingType: data.billingType,
        billingInterval: data.billingInterval,
        duration: data.duration,
        modulesCount: data.modulesCount,
        lessonsCount: data.lessonsCount,
        features: data.features || [],
        isPopular: data.isPopular,
        isExclusive: data.isExclusive,
        isActive: data.isActive,
        campusCourseId: data.campusCourseId,
      });
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError(err?.error?.message || 'Produkt konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  // Load entitlement registry
  const loadEntitlements = useCallback(async () => {
    try {
      const registry = await apiClient.getEntitlementRegistry();
      setEntitlementRegistry(registry);
    } catch (err) {
      console.error('Failed to load entitlements:', err);
    }
  }, []);

  // Load character limits
  const loadCharLimits = useCallback(async () => {
    try {
      const limits = await apiClient.getCharLimits();
      setCharLimits(limits);
    } catch (err) {
      // Use defaults
    }
  }, []);

  useEffect(() => {
    loadProduct();
    loadEntitlements();
    loadCharLimits();
  }, [loadProduct, loadEntitlements, loadCharLimits]);

  // Save product
  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await apiClient.updatePlatformProduct(product.id, formData);
      
      setSuccess('Produkt erfolgreich gespeichert');
      await loadProduct();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.error?.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // Add feature
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    const currentFeatures = formData.features || [];
    if (currentFeatures.length >= 10) return;
    setFormData({
      ...formData,
      features: [...currentFeatures, newFeature.trim()],
    });
    setNewFeature('');
  };

  // Remove feature
  const handleRemoveFeature = (index: number) => {
    const currentFeatures = formData.features || [];
    setFormData({
      ...formData,
      features: currentFeatures.filter((_, i) => i !== index),
    });
  };

  // Add entitlement
  const handleAddEntitlement = async () => {
    if (!selectedEntitlement || !product) return;

    const entitlementDef = entitlementRegistry.find(e => e.id === selectedEntitlement);
    if (!entitlementDef) return;

    try {
      setAddingEntitlement(true);
      await apiClient.addProductEntitlement(product.id, {
        resourceType: entitlementDef.resourceType,
        resourceId: entitlementDef.id,
        resourceName: entitlementDef.name,
      });
      await loadProduct();
      setShowEntitlementDialog(false);
      setSelectedEntitlement(null);
    } catch (err: any) {
      setError(err?.error?.message || 'Fehler beim Hinzufügen');
    } finally {
      setAddingEntitlement(false);
    }
  };

  // Remove entitlement
  const handleRemoveEntitlement = async (entitlementId: string) => {
    if (!product) return;

    try {
      setRemovingEntitlement(entitlementId);
      await apiClient.removeProductEntitlement(product.id, entitlementId);
      await loadProduct();
    } catch (err: any) {
      setError(err?.error?.message || 'Fehler beim Entfernen');
    } finally {
      setRemovingEntitlement(null);
    }
  };

  // Character count helper
  const charCount = (value: string | null | undefined, limit: number) => {
    const len = (value || '').length;
    return { len, limit, ok: len <= limit };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Produkt...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Produkt nicht gefunden</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard/platform-products')}>
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const IconComponent = ICONS[formData.icon || 'Zap'] || Zap;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/platform-products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: formData.levelColor || '#66dd99' }}
              >
                <IconComponent
                  className="h-6 w-6"
                  style={{ color: formData.textColor || '#000' }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Level {product.userJourneyLevel} · {product.levelName}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg px-4 py-3 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[
            { id: 'basic' as const, icon: Package, label: 'Grunddaten' },
            { id: 'pricing' as const, icon: DollarSign, label: 'Preise' },
            { id: 'content' as const, icon: BookOpen, label: 'Inhalte' },
            { id: 'entitlements' as const, icon: Shield, label: 'Entitlements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="mojo-glass-card rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Produktinformationen
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name *
                      <span className={`ml-2 text-xs ${charCount(formData.name, charLimits.name).ok ? 'text-muted-foreground' : 'text-destructive'}`}>
                        ({charCount(formData.name, charLimits.name).len}/{charLimits.name})
                      </span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={charLimits.name}
                      placeholder="z.B. LEBENSENERGIE"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">
                      Untertitel
                      <span className={`ml-2 text-xs ${charCount(formData.subtitle, charLimits.subtitle).ok ? 'text-muted-foreground' : 'text-destructive'}`}>
                        ({charCount(formData.subtitle, charLimits.subtitle).len}/{charLimits.subtitle})
                      </span>
                    </Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      maxLength={charLimits.subtitle}
                      placeholder="z.B. Finde dein MOJO (wieder)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Beschreibung
                      <span className={`ml-2 text-xs ${charCount(formData.description, charLimits.description).ok ? 'text-muted-foreground' : 'text-destructive'}`}>
                        ({charCount(formData.description, charLimits.description).len}/{charLimits.description})
                      </span>
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={charLimits.description}
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Ausführliche Produktbeschreibung..."
                    />
                  </div>
                </div>

                {/* Flags */}
                <div className="mojo-glass-card rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive ?? true}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded"
                      />
                      <span>Aktiv (im Katalog sichtbar)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPopular ?? false}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="rounded"
                      />
                      <span>Als "Beliebt" markieren</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isExclusive ?? false}
                        onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                        className="rounded"
                      />
                      <span>Als "Exklusiv" markieren</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Styling */}
              <div className="space-y-6">
                <div className="mojo-glass-card rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Darstellung
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="levelColor">Hintergrundfarbe</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="levelColor"
                          value={formData.levelColor || '#66dd99'}
                          onChange={(e) => setFormData({ ...formData, levelColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={formData.levelColor || ''}
                          onChange={(e) => setFormData({ ...formData, levelColor: e.target.value })}
                          placeholder="#66dd99"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">Textfarbe</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="textColor"
                          value={formData.textColor || '#000000'}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={formData.textColor || ''}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((iconName) => {
                        const Icon = ICONS[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() => setFormData({ ...formData, icon: iconName })}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                              formData.icon === iconName
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="pt-4 border-t">
                    <Label className="mb-3 block">Vorschau</Label>
                    <div
                      className="rounded-xl p-4 flex items-center gap-4"
                      style={{ backgroundColor: formData.levelColor || '#66dd99' }}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <IconComponent
                          className="h-7 w-7"
                          style={{ color: formData.textColor || '#000' }}
                        />
                      </div>
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: formData.textColor || '#000' }}
                        >
                          {formData.name || 'Produktname'}
                        </p>
                        <p
                          className="text-sm opacity-80"
                          style={{ color: formData.textColor || '#000' }}
                        >
                          {formData.subtitle || 'Untertitel'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="mojo-glass-card rounded-xl p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preisgestaltung
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priceNet">Preis (netto) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    <Input
                      id="priceNet"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.priceNet || 0}
                      onChange={(e) => setFormData({ ...formData, priceNet: parseFloat(e.target.value) || 0 })}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">0 = Preis auf Anfrage</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Streichpreis (optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    <Input
                      id="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : null })}
                      className="pl-8"
                      placeholder="z.B. 997"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Abrechnungsart</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, billingType: 'ONE_TIME', billingInterval: null })}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                        formData.billingType === 'ONE_TIME'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      Einmalig
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, billingType: 'SUBSCRIPTION', billingInterval: 'MONTHLY' })}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                        formData.billingType === 'SUBSCRIPTION'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      Abo
                    </button>
                  </div>
                </div>

                {formData.billingType === 'SUBSCRIPTION' && (
                  <div className="space-y-2">
                    <Label>Abrechnungsintervall</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData({ ...formData, billingInterval: 'MONTHLY' })}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                          formData.billingInterval === 'MONTHLY'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        Monatlich
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, billingInterval: 'YEARLY' })}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                          formData.billingInterval === 'YEARLY'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        Jährlich
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Preview */}
              <div className="pt-4 border-t">
                <Label className="mb-3 block">Preisanzeige im Katalog</Label>
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-baseline gap-2">
                    {formData.priceNet === 0 ? (
                      <span className="text-2xl font-bold">Auf Anfrage</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">
                          €{(formData.priceNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                        </span>
                        {formData.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            €{formData.originalPrice.toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                          </span>
                        )}
                        {formData.billingType === 'SUBSCRIPTION' && (
                          <span className="text-muted-foreground">
                            / {formData.billingInterval === 'MONTHLY' ? 'Monat' : 'Jahr'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="mojo-glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Kursinhalte
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Dauer
                    <span className={`ml-2 text-xs ${charCount(formData.duration, charLimits.duration).ok ? 'text-muted-foreground' : 'text-destructive'}`}>
                      ({charCount(formData.duration, charLimits.duration).len}/{charLimits.duration})
                    </span>
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    maxLength={charLimits.duration}
                    placeholder="z.B. 8 Wochen"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modulesCount">Module (Override)</Label>
                    <Input
                      id="modulesCount"
                      type="number"
                      min="0"
                      value={formData.modulesCount || ''}
                      onChange={(e) => setFormData({ ...formData, modulesCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                      placeholder="Aus Campus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonsCount">Lektionen (Override)</Label>
                    <Input
                      id="lessonsCount"
                      type="number"
                      min="0"
                      value={formData.lessonsCount || ''}
                      onChange={(e) => setFormData({ ...formData, lessonsCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                      placeholder="Aus Campus"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campusCourseId">Campus Kurs-ID</Label>
                  <Input
                    id="campusCourseId"
                    value={formData.campusCourseId || ''}
                    onChange={(e) => setFormData({ ...formData, campusCourseId: e.target.value || null })}
                    placeholder="Für dynamische Module/Lektionen"
                  />
                  <p className="text-xs text-muted-foreground">
                    Wenn gesetzt, werden Module und Lektionen dynamisch aus campus.mojo gezogen
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mojo-glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Feature-Liste ({(formData.features || []).length}/10)
                </h3>

                <div className="space-y-2">
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="flex-1 text-sm">{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {(formData.features || []).length < 10 && (
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      maxLength={charLimits.feature}
                      placeholder="Neues Feature hinzufügen..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                    />
                    <Button variant="outline" onClick={handleAddFeature} disabled={!newFeature.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Max. 10 Features, je max. {charLimits.feature} Zeichen
                </p>
              </div>
            </div>
          )}

          {/* Entitlements Tab */}
          {activeTab === 'entitlements' && (
            <div className="mojo-glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Entitlements
                </h3>
                <Button variant="outline" onClick={() => setShowEntitlementDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Definiere welche Berechtigungen Kunden nach dem Kauf erhalten: App-Zugang, Features, Kurse etc.
              </p>

              {/* Current Entitlements */}
              <div className="space-y-2">
                {product.entitlements && product.entitlements.length > 0 ? (
                  product.entitlements.map((ent) => (
                    <div
                      key={ent.id}
                      className="flex items-center justify-between bg-accent/50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{ent.resourceName || ent.resourceId}</p>
                          <p className="text-xs text-muted-foreground">
                            {ent.resourceType}
                            {ent.durationDays && ` · ${ent.durationDays} Tage`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEntitlement(ent.id)}
                        disabled={removingEntitlement === ent.id}
                      >
                        {removingEntitlement === ent.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Keine Entitlements konfiguriert</p>
                    <p className="text-sm">Klicke auf "Hinzufügen" um Berechtigungen zu vergeben</p>
                  </div>
                )}
              </div>

              {/* Add Entitlement Dialog */}
              {showEntitlementDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-background rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Entitlement hinzufügen</h3>
                      <button onClick={() => setShowEntitlementDialog(false)}>
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      {entitlementRegistry.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Keine Entitlements verfügbar
                        </p>
                      ) : (
                        entitlementRegistry.map((ent) => {
                          const isAlreadyAdded = product.entitlements?.some(
                            (e) => e.resourceId === ent.id
                          );
                          return (
                            <button
                              key={ent.id}
                              onClick={() => !isAlreadyAdded && setSelectedEntitlement(ent.id)}
                              disabled={isAlreadyAdded}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                selectedEntitlement === ent.id
                                  ? 'border-primary bg-primary/10'
                                  : isAlreadyAdded
                                  ? 'border-border opacity-50 cursor-not-allowed'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{ent.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {ent.category} · {ent.resourceType}
                                  </p>
                                </div>
                                {isAlreadyAdded && (
                                  <Badge variant="secondary">Bereits hinzugefügt</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{ent.description}</p>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowEntitlementDialog(false)}>
                        Abbrechen
                      </Button>
                      <Button
                        onClick={handleAddEntitlement}
                        disabled={!selectedEntitlement || addingEntitlement}
                      >
                        {addingEntitlement ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Hinzufügen
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
