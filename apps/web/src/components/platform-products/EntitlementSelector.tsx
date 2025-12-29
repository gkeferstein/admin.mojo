'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient, EntitlementDefinition, ProductEntitlement } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EntitlementSelectorProps {
  productId: string;
  currentEntitlements: ProductEntitlement[];
  onEntitlementsChange: () => void;
}

export function EntitlementSelector({
  productId,
  currentEntitlements,
  onEntitlementsChange,
}: EntitlementSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableEntitlements, setAvailableEntitlements] = useState<EntitlementDefinition[]>([]);
  const [selectedEntitlementId, setSelectedEntitlementId] = useState<string>('');
  const [durationDays, setDurationDays] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEntitlements();
    }
  }, [isOpen]);

  const loadEntitlements = async () => {
    try {
      const entitlements = await apiClient.getEntitlementRegistry();
      setAvailableEntitlements(entitlements);
    } catch (error) {
      console.error('Failed to load entitlements:', error);
    }
  };

  const handleAdd = async () => {
    if (!selectedEntitlementId) return;

    const entitlement = availableEntitlements.find((e) => e.id === selectedEntitlementId);
    if (!entitlement) return;

    // Check if already added
    const alreadyAdded = currentEntitlements.some(
      (e) => e.resourceId === entitlement.id
    );
    if (alreadyAdded) {
      alert('Dieses Entitlement ist bereits hinzugefügt');
      return;
    }

    setLoading(true);
    try {
      await apiClient.addProductEntitlement(productId, {
        resourceType: entitlement.resourceType,
        resourceId: entitlement.id,
        resourceName: entitlement.name,
        durationDays: durationDays ? parseInt(durationDays) : null,
        quantity: parseInt(quantity) || 1,
      });
      onEntitlementsChange();
      setIsOpen(false);
      setSelectedEntitlementId('');
      setDurationDays('');
      setQuantity('1');
    } catch (error) {
      console.error('Failed to add entitlement:', error);
      alert('Fehler beim Hinzufügen des Entitlements');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (entitlementId: string) => {
    if (!confirm('Entitlement wirklich entfernen?')) return;

    try {
      await apiClient.removeProductEntitlement(productId, entitlementId);
      onEntitlementsChange();
    } catch (error) {
      console.error('Failed to remove entitlement:', error);
      alert('Fehler beim Entfernen des Entitlements');
    }
  };

  const getEntitlementName = (resourceId: string) => {
    const def = availableEntitlements.find((e) => e.id === resourceId);
    return def?.name || resourceId;
  };

  const getEntitlementDescription = (resourceId: string) => {
    const def = availableEntitlements.find((e) => e.id === resourceId);
    return def?.description || '';
  };

  // Filter out already added entitlements
  const availableForSelection = availableEntitlements.filter(
    (e) => !currentEntitlements.some((ce) => ce.resourceId === e.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Entitlements</h3>
          <p className="text-sm text-muted-foreground">
            Definiere, welche Zugriffe dieses Produkt gewährt
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Entitlement hinzufügen
        </Button>
      </div>

      {currentEntitlements.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Noch keine Entitlements konfiguriert. Füge Entitlements hinzu, um zu definieren,
            was User beim Kauf dieses Produkts erhalten.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentEntitlements.map((entitlement) => (
            <div
              key={entitlement.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {entitlement.resourceType}
                  </Badge>
                  <h4 className="font-medium">
                    {getEntitlementName(entitlement.resourceId)}
                  </h4>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getEntitlementDescription(entitlement.resourceId)}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  {entitlement.durationDays && (
                    <span>Dauer: {entitlement.durationDays} Tage</span>
                  )}
                  {!entitlement.durationDays && (
                    <span>Dauer: Unbegrenzt</span>
                  )}
                  <span>Anzahl: {entitlement.quantity}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(entitlement.id)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Entitlement hinzufügen</DialogTitle>
            <DialogDescription>
              Wähle ein Entitlement aus, das diesem Produkt zugewiesen werden soll.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entitlement">Entitlement</Label>
              <Select
                value={selectedEntitlementId}
                onValueChange={setSelectedEntitlementId}
              >
                <SelectTrigger id="entitlement">
                  <SelectValue placeholder="Entitlement auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableForSelection.map((entitlement) => (
                    <SelectItem key={entitlement.id} value={entitlement.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{entitlement.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {entitlement.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Dauer (Tage)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Leer = unbegrenzt"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Anzahl</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAdd} disabled={!selectedEntitlementId || loading}>
              {loading ? 'Hinzufügen...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

