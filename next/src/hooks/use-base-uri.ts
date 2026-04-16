import { cache } from 'react';

const cachedContext = cache(() => new Map<string, string>());

export const baseUriContext = (uri?: string) => {
  const cache = cachedContext();

  if (!uri) return cache.get('baseUri');

  cache.set('baseUri', uri);

  return {
    get Value() {
      return cache.get('baseUri') ?? '';
    },
    set Value(value: string) {
      cache.set('baseUri', value);
    },
  };
};
