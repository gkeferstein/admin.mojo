import { NextResponse } from 'next/server';

export async function GET() {
  const uptime = Math.floor(process.uptime());
  
  return NextResponse.json(
    {
      status: 'ok',
      service: 'admin.mojo-web',
      version: '1.0.0',
      uptime,
      timestamp: new Date().toISOString(),
      checks: {
        // Web app doesn't have direct database access, so no database check
      },
    },
    { status: 200 }
  );
}

