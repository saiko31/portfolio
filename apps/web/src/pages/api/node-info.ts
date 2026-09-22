import type { APIRoute } from 'astro';
import os from 'node:os';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      nodeId: process.env.NODE_ID || 'local-dev',
      nodeRegion: process.env.NODE_REGION || 'local',
      uptime: Math.floor(process.uptime()),
      hostname: os.hostname(),
      arch: os.arch(),
      platform: os.platform(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
