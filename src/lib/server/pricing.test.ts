import { describe, it, expect } from 'vitest';
import { parsePriceResponse, fetchPrice } from './pricing';

describe('parsePriceResponse', () => {
  it('parses the numeric price from a good response', () => {
    expect(parsePriceResponse({ price: '334.46' })).toBe(334.46);
  });
  it('throws on the API error body', () => {
    expect(() => parsePriceResponse({ code: 401, status: 'error', message: 'bad key' })).toThrow(
      /bad key/
    );
  });
  it('throws when price is missing', () => {
    expect(() => parsePriceResponse({})).toThrow();
  });
  it('throws when price is non-numeric', () => {
    expect(() => parsePriceResponse({ price: 'n/a' })).toThrow();
  });
});

describe('fetchPrice', () => {
  it('builds the twelvedata url and returns the parsed price', async () => {
    let calledUrl = '';
    const fakeFetch = (async (url: string) => {
      calledUrl = String(url);
      return { json: async () => ({ price: '512.34' }) } as Response;
    }) as unknown as typeof fetch;
    const price = await fetchPrice('VOO', { apiKey: 'test-key', fetchFn: fakeFetch });
    expect(price).toBe(512.34);
    expect(calledUrl).toContain('symbol=VOO');
    expect(calledUrl).toContain('apikey=test-key');
  });
  it('uses an overridden base url when provided', async () => {
    let calledUrl = '';
    const fakeFetch = (async (url: string) => {
      calledUrl = String(url);
      return { json: async () => ({ price: '100' }) } as Response;
    }) as unknown as typeof fetch;
    await fetchPrice('VOO', { apiKey: 'k', fetchFn: fakeFetch, baseUrl: 'http://localhost:9999' });
    expect(calledUrl).toContain('http://localhost:9999/price?symbol=VOO');
  });
  it('throws when no api key is available', async () => {
    await expect(fetchPrice('VOO', { apiKey: '' })).rejects.toThrow(/TWELVE_DATA_API_KEY/);
  });
});
