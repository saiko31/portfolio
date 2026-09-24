export interface Env {
  PRIMARY_ORIGIN: string;
  STANDBY_ORIGIN: string;
  TIMEOUT_MS?: string | number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const timeoutMs = Number(env.TIMEOUT_MS) || 2500;
    const startTime = Date.now();

    // 1. Try Primary Origin (HomeLab)
    try {
      const primaryUrl = new URL(url.pathname + url.search, env.PRIMARY_ORIGIN);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Clone headers and set appropriate Host and Edge tracking headers
      const primaryHeaders = new Headers(request.headers);
      primaryHeaders.set('Host', primaryUrl.host);
      primaryHeaders.set('X-Edge-Active-Node', 'HomeLab-Primario');
      primaryHeaders.set('X-Forwarded-Host', url.host);
      primaryHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      const primaryResponse = await fetch(primaryUrl.toString(), {
        method: request.method,
        headers: primaryHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
        redirect: 'manual',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If primary responds cleanly (not server 5xx error)
      if (primaryResponse.status < 500) {
        const latency = Date.now() - startTime;
        const newHeaders = new Headers(primaryResponse.headers);
        newHeaders.set('X-Active-Node', 'HomeLab-Primario');
        newHeaders.set('X-Failover-Triggered', 'false');
        newHeaders.set('X-Edge-Latency-Ms', latency.toString());

        // Expose headers to browser fetch
        newHeaders.set('Access-Control-Expose-Headers', 'X-Active-Node, X-Failover-Triggered, X-Edge-Latency-Ms');

        return new Response(primaryResponse.body, {
          status: primaryResponse.status,
          statusText: primaryResponse.statusText,
          headers: newHeaders,
        });
      }

      console.warn(`Primary origin returned ${primaryResponse.status}. Triggering failover to standby.`);
    } catch (err: any) {
      console.warn(`Primary origin unreachable or timed out (${err?.message}). Triggering failover to standby.`);
    }

    // 2. Failover to Standby Origin (Oracle Cloud)
    try {
      const standbyUrl = new URL(url.pathname + url.search, env.STANDBY_ORIGIN);
      const standbyHeaders = new Headers(request.headers);
      standbyHeaders.set('Host', standbyUrl.host);
      standbyHeaders.set('X-Edge-Active-Node', 'Cloud-Standby');
      standbyHeaders.set('X-Forwarded-Host', url.host);
      standbyHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      const standbyResponse = await fetch(standbyUrl.toString(), {
        method: request.method,
        headers: standbyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
        redirect: 'manual',
      });

      const latency = Date.now() - startTime;
      const newHeaders = new Headers(standbyResponse.headers);
      newHeaders.set('X-Active-Node', 'Cloud-Standby');
      newHeaders.set('X-Failover-Triggered', 'true');
      newHeaders.set('X-Edge-Latency-Ms', latency.toString());

      newHeaders.set('Access-Control-Expose-Headers', 'X-Active-Node, X-Failover-Triggered, X-Edge-Latency-Ms');

      return new Response(standbyResponse.body, {
        status: standbyResponse.status,
        statusText: standbyResponse.statusText,
        headers: newHeaders,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: 'Service Unavailable',
          message: 'Both HomeLab and Cloud standby nodes are currently unreachable.',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'X-Failover-Triggered': 'true',
            'X-Active-Node': 'None',
          },
        }
      );
    }
  },
};
