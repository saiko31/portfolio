import type { APIRoute } from 'astro';
import { simulateFailure, resetFailure, isFailing, getFailureRemainingSeconds } from '../../lib/chaos';

export const POST: APIRoute = async ({ url }) => {
  const duration = Number(url.searchParams.get('duration')) || 30;
  simulateFailure(duration);

  return new Response(
    JSON.stringify({
      message: `Simulated failure activated for ${duration} seconds.`,
      nodeId: process.env.NODE_ID || 'local-node',
      remainingSeconds: duration,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const DELETE: APIRoute = async () => {
  resetFailure();
  return new Response(
    JSON.stringify({
      message: 'Simulated failure deactivated. Node is back to healthy.',
      nodeId: process.env.NODE_ID || 'local-node',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      isFailing: isFailing(),
      remainingSeconds: getFailureRemainingSeconds(),
      nodeId: process.env.NODE_ID || 'local-node',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
