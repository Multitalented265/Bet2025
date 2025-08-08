import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({ where: { id: 1 } });
    return NextResponse.json({ maintenanceMode: settings?.maintenanceMode ?? false });
  } catch (error) {
    return NextResponse.json({ maintenanceMode: false }, { status: 200 });
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
    return NextResponse.json({ success: true, maintenanceMode: enabled });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
}


