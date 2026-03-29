import type { Handler } from '@netlify/functions';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL ?? '';
const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY ?? '';
const PROXY_SHARED_SECRET = process.env.PROXY_SHARED_SECRET ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function stripFunctionPrefix(path: string): string {
  const withoutApi = path.replace(/^\/api/, '');
  const withoutFunctionPrefix = withoutApi.replace(/^\/\.netlify\/functions\/proxy/, '');
  return withoutFunctionPrefix || '/';
}

function decodeBody(body: string | null, isBase64Encoded: boolean | undefined) {
  if (!body) return undefined;
  if (isBase64Encoded) return Buffer.from(body, 'base64');
  return body;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, Allow: 'GET, POST, OPTIONS', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (PROXY_SHARED_SECRET) {
    const incomingSecret = event.headers['x-proxy-secret'];
    if (incomingSecret !== PROXY_SHARED_SECRET) {
      return {
        statusCode: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
  }

  if (!API_GATEWAY_URL) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API_GATEWAY_URL not configured' }),
    };
  }

  if (!API_GATEWAY_KEY) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API_GATEWAY_KEY not configured' }),
    };
  }

  const upstreamPath = stripFunctionPrefix(event.path);
  const qs = event.rawQuery ? `?${event.rawQuery}` : '';
  const targetUrl = `${API_GATEWAY_URL}${upstreamPath}${qs}`;

  const requestHeaders = new Headers();
  const incomingContentType = event.headers['content-type'];
  if (incomingContentType) requestHeaders.set('content-type', incomingContentType);
  requestHeaders.set('accept', 'application/json');
  requestHeaders.set('x-api-key', API_GATEWAY_KEY);

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.httpMethod === 'GET' ? undefined : decodeBody(event.body, event.isBase64Encoded),
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') ?? 'application/json';

    return {
      statusCode: response.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Proxy request failed', detail: String(error) }),
    };
  }
};
