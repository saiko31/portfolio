import type { APIRoute } from 'astro';
import { isFailing, getFailureRemainingSeconds } from '../../lib/chaos';

export const GET: APIRoute = async () => {
  if (isFailing()) {
    return new Response(
      JSON.stringify({
        status: 'degraded',
        simulatedFailure: true,
        remainingSeconds: getFailureRemainingSeconds(),
        nodeId: process.env.NODE_ID || 'local-node',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: Date.now(),
      nodeId: process.env.NODE_ID || 'local-node',
      nodeRegion: process.env.NODE_REGION || 'local',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
