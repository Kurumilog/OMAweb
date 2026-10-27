import type { Plugin } from 'vite';
import { Supermemory, SupermemoryError } from 'supermemory';

const NS_RE = /^[a-zA-Z0-9_:-]{1,100}$/;
const MAX_BODY = 2_000_000;

function send(res: any, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
      if (raw.length > MAX_BODY) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function isAllowedNamespace(ns: string) {
  return NS_RE.test(ns) && (ns === 'omaweb_project' || ns.startsWith('user_'));
}

function cleanMetadata(value: unknown): Record<string, string | number | boolean | string[]> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, string | number | boolean | string[]> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      out[key] = raw;
    } else if (Array.isArray(raw)) {
      out[key] = raw.filter((item): item is string => typeof item === 'string').slice(0, 40);
    }
  }
  return out;
}

export function supermemoryApi(apiKey?: string): Plugin {
  const client = apiKey ? new Supermemory({ apiKey }) : null;

  const handler = async (req: any, res: any, next: () => void) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/supermemory/')) return next();

    const route = url.pathname.replace('/api/supermemory/', '');

    if (req.method === 'GET' && route === 'status') {
      return send(res, 200, { ok: Boolean(client), hasKey: Boolean(apiKey) });
    }

    if (req.method !== 'POST') {
      return send(res, 405, { error: 'Method not allowed' });
    }

    if (!client) {
      return send(res, 503, {
        error: 'SUPERMEMORY_API_KEY is not configured on the server',
      });
    }

    try {
      const payload = await readBody(req);
      const namespace = String(payload.namespace || '').trim();
      if (!isAllowedNamespace(namespace)) {
        return send(res, 400, {
          error: 'Namespace must be omaweb_project or start with user_ and match ^[a-zA-Z0-9_:-]+$',
        });
      }

      if (route === 'search') {
        const query = String(payload.query || '').trim();
        if (!query) return send(res, 400, { error: 'query is required' });
        const searchMode = payload.searchMode === 'memories' || payload.searchMode === 'hybrid'
          ? payload.searchMode
          : 'chunks';
        const limit = Math.min(Math.max(Number(payload.limit) || 12, 1), 50);
        const result = await client.search(namespace, {
          query,
          searchMode,
          limit,
          threshold: typeof payload.threshold === 'number' ? payload.threshold : 0.3,
        });
        return send(res, 200, result);
      }

      if (route === 'add') {
        const content = String(payload.content || '').trim();
        if (!content) return send(res, 400, { error: 'content is required' });
        const taskType = payload.taskType === 'superrag' ? 'superrag' : 'memory';
        const dreaming = payload.dreaming === 'dynamic' ? 'dynamic' : 'instant';
        const result = await client.add(namespace, {
          content,
          id: payload.id ? String(payload.id) : undefined,
          metadata: cleanMetadata(payload.metadata),
          taskType,
          dreaming,
        });
        return send(res, 200, result);
      }

      if (route === 'profile') {
        const result = await client.profile(namespace);
        return send(res, 200, result);
      }

      if (route === 'list') {
        const type = payload.type === 'memories' || payload.type === 'chunks'
          ? payload.type
          : 'documents';
        const limit = Math.min(Math.max(Number(payload.limit) || 50, 1), 100);
        const filter = payload.filter && typeof payload.filter === 'object' ? payload.filter : undefined;
        const result = await client.list(namespace, type, {
          limit,
          sort: 'createdAt',
          order: 'desc',
          filter,
        });
        return send(res, 200, result);
      }

      return send(res, 404, { error: `Unknown route: ${route}` });
    } catch (error) {
      if (error instanceof SupermemoryError) {
        return send(res, error.statusCode || 502, {
          error: error.message,
          body: error.body,
        });
      }
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return send(res, 500, { error: message });
    }
  };

  return {
    name: 'oma-supermemory-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
