import { env } from '$env/dynamic/private';

export function parsePriceResponse(body: unknown): number {
  const obj = (body ?? {}) as Record<string, unknown>;
  if (obj.status === 'error') {
    throw new Error(`price API error: ${obj.message ?? 'unknown error'}`);
  }
  const raw = obj.price;
  const n = typeof raw === 'string' ? parseFloat(raw) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isFinite(n)) throw new Error('price API returned no usable price');
  return n;
}

export async function fetchPrice(
  symbol: string,
  opts: { apiKey?: string; fetchFn?: typeof fetch; baseUrl?: string } = {}
): Promise<number> {
  const apiKey = opts.apiKey ?? env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error('TWELVE_DATA_API_KEY is not set');
  const fetchFn = opts.fetchFn ?? fetch;
  const base = opts.baseUrl ?? env.PRICE_API_BASE ?? 'https://api.twelvedata.com';
  const url = `${base}/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetchFn(url);
  const body = await res.json();
  return parsePriceResponse(body);
}
