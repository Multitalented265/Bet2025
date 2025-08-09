import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { 
        headers: { 
          'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
          'content-type': 'application/json'
        } 
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: { 
          'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
          'content-type': 'application/json'
        } 
      }
    );
  }
}
