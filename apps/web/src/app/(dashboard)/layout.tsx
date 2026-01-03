'use client';

import { MojoAppLayout } from '@gkeferstein/design';
import { useAuth, useOrganization, useOrganizationList, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Package,
  DollarSign,
  CreditCard,
  Users,
  ScrollText,
} from 'lucide-react';
import { MojoLogo } from '@/components/layout/MojoLogo';
import { useCallback } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId } = useAuth();
  const { user } = useUser();
  const { organization } = useOrganization();
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const router = useRouter();

  const entitlements = (user?.publicMetadata?.entitlements as string[]) || [];

  const sidebarSections = [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
          href: '/dashboard',
          linkComponent: Link,
        },
        {
          id: 'regional-agreements',
          label: 'Regionale Verträge',
          icon: <FileText className="h-4 w-4" />,
          href: '/dashboard/regional-agreements',
          linkComponent: Link,
        },
        {
          id: 'platform-products',
          label: 'Produkte',
          icon: <Package className="h-4 w-4" />,
          href: '/dashboard/platform-products',
          linkComponent: Link,
        },
        {
          id: 'commissions',
          label: 'Provisionen',
          icon: <DollarSign className="h-4 w-4" />,
          href: '/dashboard/commissions',
          linkComponent: Link,
        },
        {
          id: 'payouts',
          label: 'Auszahlungen',
          icon: <CreditCard className="h-4 w-4" />,
          href: '/dashboard/payouts',
          linkComponent: Link,
        },
        {
          id: 'customer-attributions',
          label: 'Attributionen',
          icon: <Users className="h-4 w-4" />,
          href: '/dashboard/customer-attributions',
          linkComponent: Link,
        },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      items: [
        {
          id: 'audit',
          label: 'Audit',
          icon: <ScrollText className="h-4 w-4" />,
          href: '/dashboard/audit',
          linkComponent: Link,
        },
      ],
    },
  ];

  const handleTenantSwitch = useCallback(
    (tenantId: string) => {
      // For now, just reload - in future could switch organization context
      router.refresh();
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    // Logout is handled by MojoAppLayout
  }, []);

  if (!userId || !user) {
    return <div>Loading...</div>;
  }

  const tenants = userMemberships.data?.map((membership) => ({
    id: membership.organization.id,
    name: membership.organization.name,
    type: 'organization' as const,
  })) || [];

  const currentTenant = orgId && organization
    ? {
        id: orgId,
        name: organization.name,
        type: 'organization' as const,
      }
    : {
        id: userId,
        name: user.fullName || 'Persönliches Konto',
        type: 'personal' as const,
      };

  return (
    <MojoAppLayout
      currentApp="admin"
      user={{
        id: userId,
        name: user.fullName || 'User',
        email: user.emailAddresses[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }}
      tenant={currentTenant}
      tenants={tenants}
      entitlements={entitlements}
      sidebarSections={sidebarSections}
      sidebarLogo={<MojoLogo />}
      onTenantSwitch={handleTenantSwitch}
      onLogout={handleLogout}
    >
      {children}
    </MojoAppLayout>
  );
}




