import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { refreshAdminSettingsCache } from '@/lib/cache-utils';

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({ where: { id: 1 } });
    return NextResponse.json({ maintenanceMode: settings?.maintenanceMode ?? false, success: true });
  } catch (error) {
    return NextResponse.json({ maintenanceMode: false, success: true }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const enabled = Boolean(body?.enabled);
    await prisma.adminSettings.update({ where: { id: 1 }, data: { maintenanceMode: enabled } });
    
    // Invalidate cache to ensure immediate update
    await refreshAdminSettingsCache();
    
    // Clear the maintenance cache in middleware
    if ((globalThis as any).__maintenanceCache) {
      (globalThis as any).__maintenanceCache.delete('maintenance-flag');
    }
    
    // Small TTL bust: include timestamp so caches don't coalesce
    return NextResponse.json({ success: true, maintenanceMode: enabled, ts: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
}


